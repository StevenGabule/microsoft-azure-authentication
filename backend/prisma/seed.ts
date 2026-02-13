import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a default super admin (will be linked to Microsoft account on first login)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@yourdomain.com' },
    update: {},
    create: {
      microsoftId: 'placeholder-will-be-updated-on-first-login',
      email: 'admin@yourdomain.com',
      displayName: 'System Administrator',
      role: Role.SUPER_ADMIN,
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
