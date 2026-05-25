import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Herbs', 'Meat', 'Seafood'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Seeded categories!');
}

main().catch(console.error).finally(() => prisma.$disconnect());