import prisma from '../config/database.js';
import { hashPassword } from '../utils/password.js';

const categories = [
  { name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=900&q=80' },
  { name: 'Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&q=80' },
  { name: 'Grains', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80' },
];

const products = [
  {
    name: 'Sweet Kale',
    category: 'Vegetables',
    description: 'Tender leafy kale harvested fresh from the farm, perfect for salads and smoothies.',
    price: 95.0,
    stock: 40,
    organic: true,
    featured: true,
    images: ['https://images.unsplash.com/photo-1497509766823-1f0d9d6f1ba3?w=900&q=80'],
  },
  {
    name: 'Red Bell Peppers',
    category: 'Vegetables',
    description: 'Bright and crunchy bell peppers that add flavor and color to every meal.',
    price: 120.0,
    stock: 30,
    organic: false,
    featured: true,
    images: ['https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=900&q=80'],
  },
  {
    name: 'Eggplant',
    category: 'Vegetables',
    description: 'Fresh local eggplants perfect for grilling, stews, and Filipino dishes.',
    price: 80.0,
    stock: 50,
    organic: true,
    featured: false,
    images: ['https://images.unsplash.com/photo-1582515073490-399813aed681?w=900&q=80'],
  },
  {
    name: 'Mango Slices',
    category: 'Fruits',
    description: 'Juicy mango slices from premium harvests, sweet and ready to eat.',
    price: 160.0,
    stock: 35,
    organic: false,
    featured: true,
    images: ['https://images.unsplash.com/photo-1528825871115-3581a5387919?w=900&q=80'],
  },
  {
    name: 'Banana Bunch',
    category: 'Fruits',
    description: 'Ripe bananas harvested at peak sweetness for snacks and baking.',
    price: 85.0,
    stock: 60,
    organic: true,
    featured: false,
    images: ['https://images.unsplash.com/photo-1574226516831-e1dff420e36d?w=900&q=80'],
  },
  {
    name: 'Calamansi',
    category: 'Fruits',
    description: 'Fresh calamansi perfect for drinks, marinades, and healthy recipes.',
    price: 70.0,
    stock: 45,
    organic: false,
    featured: false,
    images: ['https://images.unsplash.com/photo-1582424203273-9a299a2be3c5?w=900&q=80'],
  },
  {
    name: 'Premium Rice',
    category: 'Grains',
    description: 'High-quality rice with a fragrant aroma and excellent texture for daily meals.',
    price: 210.0,
    stock: 80,
    organic: false,
    featured: true,
    images: ['https://images.unsplash.com/photo-1511381939415-c40ed262c4f1?w=900&q=80'],
  },
  {
    name: 'Organic Corn',
    category: 'Grains',
    description: 'Sweet organic corn perfect for boiling, grilling, and fresh recipes.',
    price: 140.0,
    stock: 55,
    organic: true,
    featured: false,
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80'],
  },
  {
    name: 'Black Rice',
    category: 'Grains',
    description: 'Nutty black rice rich in texture and flavor, ideal for healthy meals.',
    price: 260.0,
    stock: 40,
    organic: true,
    featured: false,
    images: ['https://images.unsplash.com/photo-1543332164-2593cdfda5b1?w=900&q=80'],
  },
  {
    name: 'Fresh Goat Milk',
    category: 'Grains',
    description: 'Creamy goat milk for dairy lovers and cooking with a naturally smooth flavor.',
    price: 150.0,
    stock: 25,
    organic: false,
    featured: false,
    images: ['https://images.unsplash.com/photo-1514512317236-8f2c0f4b6b61?w=900&q=80'],
  },
];

async function main() {
  const email = 'demo-farmer-store@farmdirect.com';
  const passwordHash = await hashPassword('password');

  const farmerUser = await prisma.user.findUnique({ where: { email } });
  const user = farmerUser || await prisma.user.create({
    data: {
      email,
      fullName: 'Demo Farmer Store',
      passwordHash,
      role: 'FARMER',
      phone: '+63 917 888 9900',
      farmerProfile: {
        create: {
          farmName: 'Demo Seeding Farm',
          farmDescription: 'Demo farmer store seeded with 10 products for testing.',
          farmLocation: 'Cavite',
          verified: false,
          coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
        },
      },
    },
  });

  const farmerId = user.id;
  const farmerProfile = await prisma.farmerProfile.findUnique({ where: { userId: farmerId } });
  if (!farmerProfile) {
    await prisma.farmerProfile.create({
      data: {
        userId: farmerId,
        farmName: 'Demo Seeding Farm',
        farmDescription: 'Demo farmer store seeded with 10 products for testing.',
        farmLocation: 'Cavite',
        verified: false,
      },
    });
  }

  const categoryRecords = {} as Record<string, { id: string }>;
  for (const category of categories) {
    const existing = await prisma.category.findUnique({ where: { name: category.name } });
    categoryRecords[category.name] = existing || await prisma.category.create({ data: category });
  }

  for (const productData of products) {
    const existing = await prisma.product.findFirst({
      where: {
        farmerId,
        name: productData.name,
      },
    });

    if (existing) {
      console.log(`Skipped existing product: ${productData.name}`);
      continue;
    }

    await prisma.product.create({
      data: {
        farmerId,
        name: productData.name,
        description: productData.description,
        categoryId: categoryRecords[productData.category].id,
        price: productData.price,
        stock: productData.stock,
        organic: productData.organic,
        featured: productData.featured,
        images: productData.images,
      },
    });
    console.log(`Created product: ${productData.name}`);
  }

  console.log(`Seed complete: Farmer ${email} and ${products.length} products created.`);
  console.log('Use password: password');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
