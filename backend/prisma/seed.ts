import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const CUSTOMER_CREDENTIALS = {
  email: 'customer1@bookstore.test',
  password: 'Customer@123',
};

const SELLER_CREDENTIALS = {
  email: 'seller1@bookstore.test',
  password: 'Seller@123',
};

async function getOrCreateDefaultBookshop() {
  return prisma.bookshop.upsert({
    where: { slug: 'obadee-books' },
    create: { 
      name: 'ObaDee Books', 
      slug: 'obadee-books',
      description: 'Your premium flexible bookstore.',
      email: 'contact@obadee.com',
      phone: '+234 123 456 7890',
      address: '123 Bookstore Ave',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      openingHours: 'Mon-Sat 9AM - 6PM'
    },
    update: {},
  });
}

const CATEGORIES = [
  {
    name: 'Academic & Professional Books',
    subcategories: [
      'Science & Technology',
      'Engineering',
      'Pure Sciences',
      'Health & Medical Sciences',
      'Agriculture & Environmental Sciences',
      'Business & Social Sciences',
      'Accounting & Finance',
      'Economics',
      'Social Sciences',
      'Communication & Media',
      'Public & Administrative Studies',
      'Arts, Humanities & Education',
      'Law'
    ]
  },
  {
    name: 'School & Learning Books',
    subcategories: [
      'Primary & Basic Education',
      'Secondary Education',
      'Examination & Study Guides'
    ]
  },
  {
    name: 'General & Special Interest Books',
    subcategories: [
      'Fiction & Literature',
      'Religion & Personal Development',
      'Professional & Lifestyle'
    ]
  }
];

async function seedCategories(bookshopId: string) {
  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { bookshopId_name: { bookshopId, name: cat.name } },
      create: { name: cat.name, bookshopId },
      update: {},
    });

    for (const sub of cat.subcategories) {
      await prisma.subcategory.upsert({
        where: { categoryId_name: { categoryId: category.id, name: sub } },
        create: { name: sub, categoryId: category.id },
        update: {},
      });
    }
  }

  console.log(`Seeded ${CATEGORIES.length} top-level categories.`);
}

async function seedTestAccounts(bookshopId: string) {
  const customerPasswordHash = await argon2.hash(CUSTOMER_CREDENTIALS.password);
  await prisma.user.upsert({
    where: { email: CUSTOMER_CREDENTIALS.email },
    create: {
      email: CUSTOMER_CREDENTIALS.email,
      passwordHash: customerPasswordHash,
      role: 'customer',
      accountState: 'APPROVED',
      isEmailVerified: true,
      profile: { create: { fullName: 'Test Customer' } },
    },
    update: { passwordHash: customerPasswordHash },
  });

  const sellerPasswordHash = await argon2.hash(SELLER_CREDENTIALS.password);
  await prisma.user.upsert({
    where: { email: SELLER_CREDENTIALS.email },
    create: {
      email: SELLER_CREDENTIALS.email,
      passwordHash: sellerPasswordHash,
      role: 'seller',
      accountState: 'APPROVED',
      isEmailVerified: true,
      bookshopId,
      profile: { create: { fullName: 'Test Seller' } },
    },
    update: { passwordHash: sellerPasswordHash, bookshopId },
  });

  console.log('Seeded customer and seller test accounts:');
  console.log(`  Customer — email: ${CUSTOMER_CREDENTIALS.email}`);
  console.log(`  Seller   — email: ${SELLER_CREDENTIALS.email}`);
}

const SUPERADMIN_CREDENTIALS = {
  email: 'superadmin@bookstore.test',
  password: 'Super@123',
};

const SYSTEM_PERMISSIONS = [
  { action: 'roles:manage', description: 'Create dynamic roles and permissions mapping' },
  { action: 'staff:manage', description: 'Create and manage global staff members' },
  { action: 'listings:audit', description: 'Audit used textbook exchange listings' },
];

async function seedSuperAdminAndPermissions() {
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      create: { action: perm.action, description: perm.description },
      update: { description: perm.description },
    });
  }
  console.log(`Seeded ${SYSTEM_PERMISSIONS.length} system permissions.`);

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

  console.log('Seeded superadmin account.');
}

async function seedPromoCodes(bookshopId: string) {
  await prisma.promoCode.upsert({
    where: { code: 'OBA10' },
    create: { code: 'OBA10', type: 'PERCENT', value: 10, active: true, bookshopId },
    update: { bookshopId },
  });
  console.log('Seeded promo code: OBA10 (10% off).');
}

async function main() {
  const defaultBookshop = await getOrCreateDefaultBookshop();
  const bookshopId = defaultBookshop.id;

  await seedCategories(bookshopId);
  await seedTestAccounts(bookshopId);
  await seedSuperAdminAndPermissions();
  await seedPromoCodes(bookshopId);
  console.log('✅ Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
