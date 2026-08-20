import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import futaSchools from './data/futa-schools.json';

const prisma = new PrismaClient();

const STUDENT_CREDENTIALS = {
  email: 'student1@curricula.test',
  matricNumber: 'EEE/21/1234',
  password: 'Student@123',
};

const ADMIN_CREDENTIALS = {
  email: 'admin1@curricula.test',
  password: 'Admin@123',
};

async function getOrCreateDefaultBookshop() {
  return prisma.bookshop.upsert({
    where: { slug: 'futa' },
    create: { name: 'FUTA Campus Bookstore', slug: 'futa' },
    update: {},
  });
}

async function seedSchools(bookshopId: string) {
  for (const school of futaSchools.schools) {
    const { id: schoolId } = await prisma.school.upsert({
      where: { bookshopId_name: { bookshopId, name: school.name } },
      create: { name: school.name, bookshopId },
      update: {},
    });

    for (const departmentName of school.departments) {
      await prisma.department.upsert({
        where: { schoolId_name: { schoolId, name: departmentName } },
        create: { name: departmentName, schoolId },
        update: {},
      });
    }
  }

  console.log(`Seeded ${futaSchools.schools.length} schools.`);
}

const LEVELS = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level'];

async function seedLevels(bookshopId: string) {
  for (const name of LEVELS) {
    await prisma.level.upsert({
      where: { bookshopId_name: { bookshopId, name } },
      create: { name, bookshopId },
      update: {},
    });
  }
  console.log(`Seeded ${LEVELS.length} levels.`);
}

// Dev/test login credentials — both accounts are pre-APPROVED so they're
// immediately usable without going through the admin-approval flow.
async function seedTestAccounts(bookshopId: string) {
  const department = await prisma.department.findFirst();
  if (!department) {
    throw new Error('No department found — run seedSchools() before seedTestAccounts()');
  }

  const studentPasswordHash = await argon2.hash(STUDENT_CREDENTIALS.password);
  await prisma.user.upsert({
    where: { email: STUDENT_CREDENTIALS.email },
    create: {
      email: STUDENT_CREDENTIALS.email,
      matricNumber: STUDENT_CREDENTIALS.matricNumber,
      passwordHash: studentPasswordHash,
      role: 'student',
      accountState: 'APPROVED',
      departmentId: department.id,
      bookshopId,
      profile: { create: { fullName: 'Test Student' } },
    },
    update: { passwordHash: studentPasswordHash, bookshopId },
  });

  const adminPasswordHash = await argon2.hash(ADMIN_CREDENTIALS.password);
  await prisma.user.upsert({
    where: { email: ADMIN_CREDENTIALS.email },
    create: {
      email: ADMIN_CREDENTIALS.email,
      passwordHash: adminPasswordHash,
      role: 'admin',
      accountState: 'APPROVED',
      bookshopId,
      profile: { create: { fullName: 'Test Admin' } },
    },
    update: { passwordHash: adminPasswordHash, bookshopId },
  });

  console.log('Seeded student and admin test accounts:');
  console.log(
    `  Student — email: ${STUDENT_CREDENTIALS.email}  matric: ${STUDENT_CREDENTIALS.matricNumber}  password: ${STUDENT_CREDENTIALS.password}`,
  );
  console.log(`  Admin   — email: ${ADMIN_CREDENTIALS.email}  password: ${ADMIN_CREDENTIALS.password}`);
}

const TITLE_TEMPLATES = [
  'Introduction to {dept}',
  'Principles of {dept}',
  'Fundamentals of {dept}',
  '{dept}: Theory and Practice',
  'Advanced {dept}',
  'Modern {dept}',
  '{dept}: A Comprehensive Guide',
  'Essentials of {dept}',
  '{dept} Made Simple',
  'Understanding {dept}',
  '{dept}: Concepts and Applications',
  'The Complete Guide to {dept}',
  '{dept} for Beginners',
  'Contemporary {dept}',
  '{dept}: Methods and Techniques',
  'Exploring {dept}',
  '{dept} in Practice',
  'Core Concepts of {dept}',
  '{dept}: A Practical Approach',
  'Mastering {dept}',
];

const AUTHORS = [
  'Prof. A. Adeyemi',
  'Dr. B. Okafor',
  'Prof. C. Ibrahim',
  'Dr. D. Balogun',
  'Prof. E. Nwosu',
  'Dr. F. Yusuf',
  'Prof. G. Eze',
  'Dr. H. Adamu',
  'Prof. I. Okonkwo',
  'Dr. J. Bello',
];

// Curated hex swatches (no '#' — placehold.co takes raw hex) rather than a
// generated HSL ramp, so every cover is legible white-on-color regardless
// of which one a department hashes to.
const COVER_COLORS = [
  '0A1220',
  '5A55D4',
  '1E40AF',
  '0F766E',
  '7C2D12',
  '86198F',
  '1D4ED8',
  'B45309',
  '334155',
  '4C1D95',
  '065F46',
  '9D174D',
];

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash + input.charCodeAt(i)) % 100000;
  return hash;
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Real cover art doesn't exist for 1,140 placeholder books — placehold.co
// (no API key, renders text-on-color on the fly) gives every book a
// distinct, non-blank cover instead of a broken image or a shared stub.
function coverUrlFor(departmentName: string) {
  const color = COVER_COLORS[hashString(departmentName) % COVER_COLORS.length];
  const text = encodeURIComponent(departmentName);
  return `https://placehold.co/400x600/${color}/FFFFFF?text=${text}`;
}

// Groups TITLE_TEMPLATES' 4-books-per-level pattern (20 templates / 5 levels,
// see the `i % LEVELS.length` cycle below) into two 2-book "courses" per
// level, so the Home "Required Syllabus" tracker has real >1-book courses to
// show rather than a synthetic 1:1 book-to-course mapping.
function courseFor(departmentName: string, levelName: string, indexWithinLevel: number) {
  const letters = departmentName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');
  const levelDigit = levelName[0];
  const courseSeq = Math.floor(indexWithinLevel / 2); // 2 books share a course
  const courseNumber = `${levelDigit}${String(courseSeq * 10 + 1).padStart(2, '0')}`;
  const titleWord = COURSE_TITLE_WORDS[(hashString(departmentName) + courseSeq) % COURSE_TITLE_WORDS.length];
  return { courseCode: `${letters} ${courseNumber}`, courseTitle: `${titleWord} of ${departmentName}` };
}

const COURSE_TITLE_WORDS = ['Foundations', 'Principles', 'Practice', 'Theory', 'Applications', 'Seminar', 'Workshop', 'Studio'];

// Deterministic per-book extras (compareAtPrice/course tag/pre-order) so the
// same seed run always produces the same "on sale" / syllabus / pre-order
// books instead of re-randomizing across seed runs.
function bookExtras(price: number, departmentName: string, levelName: string, indexWithinLevel: number, globalIndex: number) {
  const onSale = globalIndex % 3 === 0; // ~1/3 of the catalogue
  const compareAtPrice = onSale ? price + randomBetween(6, 24) * 50 : null; // always > price
  const isPreOrder = globalIndex % 40 === 0; // ~1 book per department
  const releaseDate = isPreOrder ? new Date(Date.now() + randomBetween(14, 60) * 24 * 60 * 60 * 1000) : null;
  const { courseCode, courseTitle } = courseFor(departmentName, levelName, indexWithinLevel);
  return { compareAtPrice, isPreOrder, releaseDate, courseCode, courseTitle };
}

// Guarded by a plain count check (not upserts) — Book has no natural unique
// business key, and re-running this against 1,140 generated rows on every
// `npx prisma db seed` (already routine in this project) would duplicate
// the whole catalogue each time.
async function seedBooks(bookshopId: string) {
  const existing = await prisma.book.count();
  if (existing > 0) {
    console.log(`Books already seeded (${existing} rows) — skipping. Run backfillBookExtras() to add new fields to existing rows.`);
    return;
  }

  const departments = await prisma.department.findMany();
  let totalBooks = 0;

  for (const department of departments) {
    const category = await prisma.category.upsert({
      where: { bookshopId_name: { bookshopId, name: department.name } },
      create: { name: department.name, bookshopId },
      update: {},
    });

    const levelCounters = new Map<string, number>();
    const books = TITLE_TEMPLATES.map((template, i) => {
      const levelName = LEVELS[i % LEVELS.length];
      const indexWithinLevel = levelCounters.get(levelName) ?? 0;
      levelCounters.set(levelName, indexWithinLevel + 1);
      const price = randomBetween(30, 160) * 50; // ₦1,500–₦8,000, rounded to the nearest 50
      const costPrice = Math.round(price * 0.6); // 60% of price
      const extras = bookExtras(price, department.name, levelName, indexWithinLevel, i);

      return {
        title: template.replace('{dept}', department.name),
        author: AUTHORS[i % AUTHORS.length],
        description: `A ${levelName.toLowerCase()} textbook for ${department.name}.`,
        price,
        costPrice,
        coverUrl: coverUrlFor(department.name),
        categoryId: category.id,
        stockQuantity: randomBetween(5, 60),
        attributes: { level: levelName, departmentId: department.id },
        bookshopId,
        ...extras,
      };
    });

    await prisma.book.createMany({ data: books });
    totalBooks += books.length;
  }

  console.log(`Seeded ${totalBooks} books across ${departments.length} departments.`);
}

// One-time backfill for a catalogue that was seeded before compareAtPrice/
// courseCode/isPreOrder existed — skips any book that's already tagged, so
// it's safe to run repeatedly (e.g. via `npm run seed` after this migration).
async function backfillBookExtras(bookshopId: string) {
  const books = await prisma.book.findMany({
    where: { courseCode: null },
    select: { id: true, price: true, attributes: true },
  });
  if (books.length === 0) {
    console.log('No books need backfilling — courseCode/compareAtPrice already set.');
    return;
  }

  const byDeptLevel = new Map<string, typeof books>();
  for (const book of books) {
    const attrs = book.attributes as { level?: string; departmentId?: string } | null;
    const key = `${attrs?.departmentId ?? 'unknown'}::${attrs?.level ?? 'unknown'}`;
    byDeptLevel.set(key, [...(byDeptLevel.get(key) ?? []), book]);
  }

  const departmentNames = new Map((await prisma.department.findMany()).map((d) => [d.id, d.name]));
  let updated = 0;
  let globalIndex = 0;

  for (const group of byDeptLevel.values()) {
    for (let indexWithinLevel = 0; indexWithinLevel < group.length; indexWithinLevel++) {
      const book = group[indexWithinLevel];
      const attrs = book.attributes as { level?: string; departmentId?: string } | null;
      const departmentName = departmentNames.get(attrs?.departmentId ?? '') ?? 'General';
      const levelName = attrs?.level ?? LEVELS[0];
      const extras = bookExtras(Number(book.price), departmentName, levelName, indexWithinLevel, globalIndex);
      const costPrice = Math.round(Number(book.price) * 0.6);
      await prisma.book.update({ where: { id: book.id }, data: { ...extras, costPrice, bookshopId } });
      updated += 1;
      globalIndex += 1;
    }
  }

  console.log(`Backfilled compareAtPrice/courseCode/isPreOrder on ${updated} existing books.`);
}

const SUPERADMIN_CREDENTIALS = {
  email: 'superadmin@curricula.test',
  password: 'Super@123',
};

const SYSTEM_PERMISSIONS = [
  { action: 'schools:manage', description: 'Configure schools, departments, and levels' },
  { action: 'roles:manage', description: 'Create dynamic roles and permissions mapping' },
  { action: 'staff:manage', description: 'Create and manage global staff members' },
  { action: 'listings:audit', description: 'Audit used textbook exchange listings' },
];

async function seedSuperAdminAndPermissions() {
  // 1. Seed Permissions
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      create: { action: perm.action, description: perm.description },
      update: { description: perm.description },
    });
  }
  console.log(`Seeded ${SYSTEM_PERMISSIONS.length} system permissions.`);

  // 2. Seed Super Admin
  const superPasswordHash = await argon2.hash(SUPERADMIN_CREDENTIALS.password);
  await prisma.user.upsert({
    where: { email: SUPERADMIN_CREDENTIALS.email },
    create: {
      email: SUPERADMIN_CREDENTIALS.email,
      passwordHash: superPasswordHash,
      role: 'superadmin',
      accountState: 'APPROVED',
      profile: { create: { fullName: 'Test Super Admin' } },
    },
    update: { passwordHash: superPasswordHash },
  });

  console.log('Seeded superadmin account:');
  console.log(`  SuperAdmin — email: ${SUPERADMIN_CREDENTIALS.email}  password: ${SUPERADMIN_CREDENTIALS.password}`);
}

async function seedPromoCodes(bookshopId: string) {
  // Matches the exact placeholder copy already in CartScreen.tsx ("e.g. FUTA10").
  await prisma.promoCode.upsert({
    where: { code: 'FUTA10' },
    create: { code: 'FUTA10', type: 'PERCENT', value: 10, active: true, bookshopId },
    update: { bookshopId },
  });
  console.log('Seeded promo code: FUTA10 (10% off).');
}

async function main() {
  const defaultBookshop = await getOrCreateDefaultBookshop();
  const bookshopId = defaultBookshop.id;

  await seedSchools(bookshopId);
  await seedLevels(bookshopId);
  await seedTestAccounts(bookshopId);
  await seedSuperAdminAndPermissions();
  await seedBooks(bookshopId);
  await backfillBookExtras(bookshopId);
  await seedPromoCodes(bookshopId);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
