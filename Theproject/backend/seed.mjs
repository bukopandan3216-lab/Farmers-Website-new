import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categoryNames = ['Vegetables', 'Fruits', 'Grains', 'Dairy & Eggs', 'Dairy', 'Herbs & Spices', 'Herbs', 'Root Crops', 'Meat', 'Seafood'];
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

  // Seed sample products for the demo farmer
  const sampleProducts = [
    { name: 'Fresh Broccoli', description: 'Locally grown broccoli, crisp and green', category: 'Vegetables', price: '60.00', stock: 25, organic: true, featured: false, images: ['https://via.placeholder.com/800x600?text=Broccoli'] },
    { name: 'Red Apples', description: 'Sweet and juicy red apples', category: 'Fruits', price: '120.00', stock: 40, organic: false, featured: true, images: ['https://via.placeholder.com/800x600?text=Apples'] },
    { name: 'Organic Brown Rice', description: 'Whole grain brown rice from local fields', category: 'Grains', price: '85.00', stock: 60, organic: true, featured: false, images: ['https://via.placeholder.com/800x600?text=Brown+Rice'] },
    { name: 'Thyme (Herbs & Spices)', description: 'Fresh thyme, great for seasoning', category: 'Herbs & Spices', price: '35.00', stock: 80, organic: true, featured: false, images: ['https://via.placeholder.com/800x600?text=Thyme'] },
    { name: 'Sweet Potatoes', description: 'Nutritious root crops, perfect for roasting', category: 'Root Crops', price: '45.00', stock: 50, organic: false, featured: false, images: ['https://via.placeholder.com/800x600?text=Sweet+Potatoes'] },
    { name: 'Farm Fresh Eggs (Dozen)', description: 'Free-range eggs, dozen pack', category: 'Dairy & Eggs', price: '150.00', stock: 100, organic: false, featured: true, images: ['https://via.placeholder.com/800x600?text=Eggs'] },
    { name: 'Free-range Chicken (1kg)', description: 'Locally raised free-range chicken', category: 'Meat', price: '220.00', stock: 20, organic: false, featured: false, images: ['https://via.placeholder.com/800x600?text=Chicken'] },
  ];

  for (const p of sampleProducts) {
    const cat = await prisma.category.findUnique({ where: { name: p.category } });
    if (!cat) {
      console.warn('Category not found for product', p.name, p.category);
      continue;
    }

    const exists = await prisma.product.findFirst({ where: { farmerId: farmer.id, name: p.name } });
    if (exists) continue;

    await prisma.product.create({
      data: {
        farmerId: farmer.id,
        name: p.name,
        description: p.description,
        categoryId: cat.id,
        price: p.price,
        stock: p.stock,
        organic: p.organic,
        featured: p.featured,
        images: p.images,
      },
    });
  }

  console.log('Seeded demo accounts and products!');
}

main().catch(console.error).finally(() => prisma.$disconnect());