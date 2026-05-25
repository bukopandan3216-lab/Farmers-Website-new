import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categoryNames = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Herbs', 'Meat', 'Seafood'];
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Seeded categories!');

  // Seed demo accounts
  const password = await bcrypt.hash('password', 10);

  await prisma.user.upsert({
    where: { email: 'admin@farmdirect.com' },
    update: {},
    create: { email: 'admin@farmdirect.com', fullName: 'Admin User', passwordHash: password, role: 'ADMIN' },
  });

  const farmer = await prisma.user.upsert({
    where: { email: 'farmer1@farmdirect.com' },
    update: {},
    create: { email: 'farmer1@farmdirect.com', fullName: 'Juan Dela Cruz', passwordHash: password, role: 'FARMER' },
  });

  await prisma.farmerProfile.upsert({
    where: { userId: farmer.id },
    update: {},
    create: { userId: farmer.id, farmName: 'Green Valley Farm', farmLocation: 'Benguet', verified: true },
  });

  await prisma.user.upsert({
    where: { email: 'buyer1@example.com' },
    update: {},
    create: { email: 'buyer1@example.com', fullName: 'Maria Santos', passwordHash: password, role: 'BUYER' },
  });

  console.log('Seeded demo accounts!');
}

main().catch(console.error).finally(() => prisma.$disconnect());