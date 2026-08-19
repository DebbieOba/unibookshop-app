import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/postgres/prisma.service';
import {
  PAYSTACK_PROVIDER,
  type PaymentEvent,
  type PaymentProvider,
} from '../src/integrations/payments/payment-provider.interface';

jest.setTimeout(30000); // real Supabase/Redis round-trips per request, not mocked

/**
 * End-to-end happy path: register -> login -> browse -> favourite -> cart ->
 * checkout -> webhook -> order confirmed. Registration auto-approves (see
 * AuthService.register) — there's no PENDING/admin-approval step in the
 * happy path anymore; that machinery is exercised separately by
 * approvals.service.spec.ts (decide) and rbac.e2e-spec.ts (restrict/restore).
 * Paystack is replaced with a fake provider so this doesn't call a real
 * payment API — signature verification itself is covered separately
 * (paystack.provider isn't re-tested here; this test is about the order
 * lifecycle wiring).
 */
describe('Happy path (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const suffix = Date.now();
  const studentEmail = `happy-student-${suffix}@test.local`;
  const password = 'TestPassword123!';

  const fakePaystack: PaymentProvider = {
    initialize: async (order) => ({
      redirectUrl: `https://fake-paystack.test/pay/${order.id}`,
      reference: order.id,
    }),
    verify: async () => 'SUCCESSFUL',
    handleWebhook: async (rawBody): Promise<PaymentEvent> => {
      const payload = JSON.parse(rawBody.toString('utf8'));
      return { reference: payload.data.reference, status: payload.data.status };
    },
  };

  let schoolId: string;
  let departmentId: string;
  let categoryId: string;
  let bookId: string;
  let studentUserId: string;
  let studentToken: string;
  let orderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PAYSTACK_PROVIDER)
      .useValue(fakePaystack)
      .compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get(PrismaService);

    const school = await prisma.school.create({ data: { name: `Happy Path School ${suffix}` } });
    schoolId = school.id;
    const department = await prisma.department.create({
      data: { name: `Happy Path Dept ${suffix}`, schoolId },
    });
    departmentId = department.id;
    const category = await prisma.category.create({ data: { name: `Happy Path Category ${suffix}` } });
    categoryId = category.id;
    const book = await prisma.book.create({
      data: {
        title: 'Happy Path Test Book',
        author: 'Test Author',
        price: 25,
        stockQuantity: 3,
        categoryId,
      },
    });
    bookId = book.id;
  });

  afterAll(async () => {
    if (orderId) await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: { in: [studentUserId].filter(Boolean) } } });
    if (bookId) await prisma.book.delete({ where: { id: bookId } }).catch(() => {});
    if (categoryId) await prisma.category.delete({ where: { id: categoryId } }).catch(() => {});
    if (departmentId) await prisma.department.delete({ where: { id: departmentId } }).catch(() => {});
    if (schoolId) await prisma.school.delete({ where: { id: schoolId } }).catch(() => {});
    await app.close();
  }, 15000);

  it('registers a new student (auto-approved)', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: studentEmail,
      password,
      fullName: 'Happy Path Student',
      departmentId,
    });

    expect(res.status).toBe(201);
    expect(res.body.accountState).toBe('APPROVED');
    studentUserId = res.body.id;
  });

  it('logs the newly-registered student in and can use a normal endpoint immediately', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ identifier: studentEmail, password });
    expect(res.status).toBe(201);
    studentToken = res.body.accessToken;

    const allowed = await request(app.getHttpServer())
      .get('/api/v1/favourites')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(allowed.status).toBe(200);
  });

  it('browses the catalogue and finds the test book', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/books')
      .query({ search: 'Happy Path Test Book' })
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((b: { id: string }) => b.id === bookId)).toBe(true);
  });

  it('favourites the book', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/favourites')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ bookId });
    expect(res.status).toBe(201);
  });

  it('adds the book to the cart', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ bookId, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(50);
  });

  it('checks out, reserving stock and starting a fake Paystack session', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ deliveryMethod: 'PICKUP', paymentProvider: 'PAYSTACK' });

    expect(res.status).toBe(201);
    expect(res.body.redirectUrl).toContain('fake-paystack.test');
    orderId = res.body.orderId;

    const book = await prisma.book.findUniqueOrThrow({ where: { id: bookId } });
    expect(book.stockQuantity).toBe(1); // 3 - 2 reserved
  });

  it('confirms the order via the payment webhook', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/paystack/webhook')
      .send({ event: 'charge.success', data: { reference: orderId, status: 'SUCCESSFUL' } });

    expect(res.status).toBe(201);
  });

  it('shows the order as COMPLETED to the student', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
  });
});
