import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as argon2 from 'argon2';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/postgres/prisma.service';

jest.setTimeout(20000); // real Supabase/Redis round-trips per request, not mocked

/**
 * RBAC regression suite — backend-architecture.md §15 mandates that every
 * guarded endpoint has a test asserting 403 for the wrong role and 401 for
 * unauthenticated. This isn't exhaustive of all 44 routes, but covers one
 * representative endpoint per enforcement layer (role-guarded mutation,
 * auth-only endpoint, account-state gate, and the AllowPendingAccount
 * exemption) so the pattern is pinned down and any guard regression breaks
 * a test, not just goes unnoticed.
 */
describe('RBAC regression (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const adminEmail = `rbac-admin-${Date.now()}@test.local`;
  const approvedStudentEmail = `rbac-student-approved-${Date.now()}@test.local`;
  const pendingStudentEmail = `rbac-student-pending-${Date.now()}@test.local`;
  const restrictedStudentEmail = `rbac-student-restricted-${Date.now()}@test.local`;
  const restrictableStudentEmail = `rbac-student-restrictable-${Date.now()}@test.local`;
  const password = 'TestPassword123!';

  let adminToken: string;
  let approvedStudentToken: string;
  let pendingStudentToken: string;
  let restrictedStudentToken: string;
  let restrictableStudentId: string;
  let testBookId: string;
  let testCategoryId: string;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    const passwordHash = await argon2.hash(password);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'admin',
        accountState: 'APPROVED',
      },
    });
    const approvedStudent = await prisma.user.create({
      data: {
        email: approvedStudentEmail,
        passwordHash,
        role: 'student',
        accountState: 'APPROVED',
        profile: { create: { fullName: 'RBAC Test Student' } },
      },
    });
    const pendingStudent = await prisma.user.create({
      data: {
        email: pendingStudentEmail,
        passwordHash,
        role: 'student',
        accountState: 'PENDING',
        profile: { create: { fullName: 'RBAC Test Pending Student' } },
      },
    });
    const restrictedStudent = await prisma.user.create({
      data: {
        email: restrictedStudentEmail,
        passwordHash,
        role: 'student',
        accountState: 'RESTRICTED',
        restrictionReason: 'RBAC test fixture',
        profile: { create: { fullName: 'RBAC Test Restricted Student' } },
      },
    });
    const restrictableStudent = await prisma.user.create({
      data: {
        email: restrictableStudentEmail,
        passwordHash,
        role: 'student',
        accountState: 'APPROVED',
        profile: { create: { fullName: 'RBAC Test Restrictable Student' } },
      },
    });
    restrictableStudentId = restrictableStudent.id;
    createdUserIds.push(
      admin.id,
      approvedStudent.id,
      pendingStudent.id,
      restrictedStudent.id,
      restrictableStudent.id,
    );

    // Throwaway category + book for the inventory-adjust RBAC test — deleted
    // in afterAll, never touches the real seeded catalogue.
    const testCategory = await prisma.category.create({
      data: { name: `RBAC Test Category ${Date.now()}` },
    });
    testCategoryId = testCategory.id;
    const testBook = await prisma.book.create({
      data: {
        title: 'RBAC Test Book',
        author: 'Test Author',
        price: 1,
        categoryId: testCategoryId,
        stockQuantity: 10,
      },
    });
    testBookId = testBook.id;

    const login = (identifier: string) =>
      request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ identifier, password });

    adminToken = (await login(adminEmail)).body.accessToken;
    approvedStudentToken = (await login(approvedStudentEmail)).body.accessToken;
    pendingStudentToken = (await login(pendingStudentEmail)).body.accessToken;
    restrictedStudentToken = (await login(restrictedStudentEmail)).body
      .accessToken;
  }, 30000); // compiling AppModule + real Supabase/Redis round-trips exceeds Jest's 5s default

  afterAll(async () => {
    await prisma.inventoryMovement.deleteMany({
      where: { bookId: testBookId },
    });
    await prisma.book.delete({ where: { id: testBookId } });
    await prisma.category.delete({ where: { id: testCategoryId } });
    // NotificationRecipient/Profile cascade on user delete (onDelete: Cascade).
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await app.close();
  }, 15000);

  describe('role-guarded admin mutation (POST /admin/schools)', () => {
    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/schools')
        .send({ name: 'Should Not Be Created' })
        .expect(401);
    });

    it('rejects an approved student with 403', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/schools')
        .set('Authorization', `Bearer ${approvedStudentToken}`)
        .send({ name: 'Should Not Be Created' })
        .expect(403);
    });

    it('allows an admin through the guard layer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/schools')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: `RBAC Test School ${Date.now()}` });

      expect(res.status).toBe(201);
      await prisma.school.delete({ where: { id: res.body.id } });
    });
  });

  describe('auth-required, role-neutral endpoint (GET /favourites)', () => {
    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer()).get('/api/v1/favourites').expect(401);
    });

    it('allows any approved, authenticated role through', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/favourites')
        .set('Authorization', `Bearer ${approvedStudentToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .get('/api/v1/favourites')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('account-state gate (PENDING account vs AllowPendingAccount exemption)', () => {
    it('blocks a PENDING account from a normal endpoint with 403', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/favourites')
        .set('Authorization', `Bearer ${pendingStudentToken}`)
        .expect(403);
    });

    it('still allows a PENDING account to poll GET /auth/me (AllowPendingAccount)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${pendingStudentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.accountState).toBe('PENDING');
    });
  });

  describe('account-state gate (RESTRICTED account)', () => {
    // A restricted account must be locked out exactly like PENDING/REJECTED —
    // AccountStateGuard's `!== 'APPROVED'` check covers it for free, but this
    // pins the behavior down so a future guard change can't silently exempt it.
    it('blocks a RESTRICTED account from a normal endpoint with 403', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/favourites')
        .set('Authorization', `Bearer ${restrictedStudentToken}`)
        .expect(403);
    });
  });

  describe('role-guarded admin mutation (PATCH /admin/inventory/:id/adjust)', () => {
    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/inventory/${testBookId}/adjust`)
        .send({ type: 'RESTOCK', quantityDelta: 1, reason: 'RBAC test' })
        .expect(401);
    });

    it('rejects an approved student with 403', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/inventory/${testBookId}/adjust`)
        .set('Authorization', `Bearer ${approvedStudentToken}`)
        .send({ type: 'RESTOCK', quantityDelta: 1, reason: 'RBAC test' })
        .expect(403);
    });

    it('allows an admin through the guard layer and records the movement', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/inventory/${testBookId}/adjust`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ type: 'RESTOCK', quantityDelta: 1, reason: 'RBAC test' });

      expect(res.status).toBe(200);
      expect(res.body.book.stockQuantity).toBe(11);
    });
  });

  describe('role-guarded admin mutation (POST /admin/approvals/:id/restrict, /restore)', () => {
    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/admin/approvals/${restrictableStudentId}/restrict`)
        .send({ reason: 'RBAC test' })
        .expect(401);
    });

    it('rejects an approved student with 403', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/admin/approvals/${restrictableStudentId}/restrict`)
        .set('Authorization', `Bearer ${approvedStudentToken}`)
        .send({ reason: 'RBAC test' })
        .expect(403);
    });

    it('allows an admin to restrict then restore the account', async () => {
      const restrictRes = await request(app.getHttpServer())
        .post(`/api/v1/admin/approvals/${restrictableStudentId}/restrict`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'RBAC test' });
      expect(restrictRes.status).toBe(201);
      expect(restrictRes.body.accountState).toBe('RESTRICTED');

      const restoreRes = await request(app.getHttpServer())
        .post(`/api/v1/admin/approvals/${restrictableStudentId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(restoreRes.status).toBe(201);
      expect(restoreRes.body.accountState).toBe('APPROVED');
    });
  });

  describe('role-guarded admin mutation (PATCH /admin/orders/:id/status)', () => {
    // Guards run before the route handler/service, so a nonexistent order id
    // is sufficient to prove 401/403 are enforced at the guard layer — no
    // real order needs to exist for this test to be meaningful.
    it('rejects an unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .patch(
          '/api/v1/admin/orders/00000000-0000-0000-0000-000000000000/status',
        )
        .send({ status: 'CANCELLED', reason: 'RBAC test' })
        .expect(401);
    });

    it('rejects an approved student with 403', async () => {
      await request(app.getHttpServer())
        .patch(
          '/api/v1/admin/orders/00000000-0000-0000-0000-000000000000/status',
        )
        .set('Authorization', `Bearer ${approvedStudentToken}`)
        .send({ status: 'CANCELLED', reason: 'RBAC test' })
        .expect(403);
    });
  });

  describe('public endpoint sanity (GET /books)', () => {
    it('is reachable with no token at all', async () => {
      await request(app.getHttpServer()).get('/api/v1/books').expect(200);
    });
  });
});
