import prisma from '../config/database.js';
import { hashPassword } from '../utils/password.js';

const images = {
  tomatoes: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&q=80',
  lettuce: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=900&q=80',
  mangoes: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=900&q=80',
  bananas: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=900&q=80',
  carrots: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=900&q=80',
  rice: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=900&q=80',
  eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=900&q=80',
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=900&q=80',
};

const categories = [
  ['Vegetables', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=900&q=80'],
  ['Fruits', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&q=80'],
  ['Grains', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80'],
  ['Dairy', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=900&q=80'],
  ['Poultry', 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=900&q=80'],
  ['Herbs', 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=900&q=80'],
] as const;

const farmers = [
  ['Green Valley Farms', 'Juan Dela Cruz', 'Benguet', 'Highland vegetables harvested daily from cool mountain terraces.'],
  ['Sunrise Organic Farm', 'Maria Reyes', 'Laguna', 'Certified organic produce grown with composting and crop rotation.'],
  ['Fresh Harvest Farm', 'Pedro Santos', 'Nueva Ecija', 'Family rice farm with fresh grains, eggs, and seasonal vegetables.'],
  ['Mountain Fresh Produce', 'Ana Garcia', 'Bukidnon', 'Premium fruits and vegetables from rich volcanic soil.'],
  ['Golden Fields Farm', 'Jose Bautista', 'Iloilo', 'Golden rice fields, dairy partners, and pantry staples.'],
] as const;

const productNames = [
  ['Tomatoes', 'Vegetables', images.tomatoes], ['Romaine Lettuce', 'Vegetables', images.lettuce],
  ['Sweet Mangoes', 'Fruits', images.mangoes], ['Lakatan Bananas', 'Fruits', images.bananas],
  ['Carrots', 'Vegetables', images.carrots], ['Potatoes', 'Vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900&q=80'],
  ['Premium Rice', 'Grains', images.rice], ['Free-range Eggs', 'Poultry', images.eggs],
  ['Fresh Cow Milk', 'Dairy', images.milk], ['Organic Kale', 'Vegetables', 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=900&q=80'],
  ['Basil', 'Herbs', 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=900&q=80'], ['Cilantro', 'Herbs', 'https://images.unsplash.com/photo-1600628421055-4d30de868b8f?w=900&q=80'],
  ['Broccoli', 'Vegetables', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=900&q=80'], ['Cabbage', 'Vegetables', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=900&q=80'],
  ['Pineapples', 'Fruits', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=900&q=80'], ['Papaya', 'Fruits', 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=900&q=80'],
  ['Brown Rice', 'Grains', images.rice], ['Duck Eggs', 'Poultry', images.eggs],
  ['Goat Milk', 'Dairy', images.milk], ['Spinach', 'Vegetables', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=900&q=80'],
  ['Eggplant', 'Vegetables', 'https://images.unsplash.com/photo-1604245437608-50c6bb8d4ee5?w=900&q=80'], ['Okra', 'Vegetables', 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=900&q=80'],
  ['Calamansi', 'Fruits', 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=900&q=80'], ['Coconut', 'Fruits', 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=900&q=80'],
  ['Corn', 'Grains', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80'], ['Peanuts', 'Grains', 'https://images.unsplash.com/photo-1567892737950-30c4db37cd89?w=900&q=80'],
  ['Native Chicken', 'Poultry', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=900&q=80'], ['Kesong Puti', 'Dairy', 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=900&q=80'],
  ['Parsley', 'Herbs', 'https://images.unsplash.com/photo-1521056787327-165dc2a32836?w=900&q=80'], ['Mint', 'Herbs', 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=900&q=80'],
  ['Green Beans', 'Vegetables', 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=900&q=80'], ['Bell Peppers', 'Vegetables', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=900&q=80'],
  ['Strawberries', 'Fruits', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=900&q=80'], ['Watermelon', 'Fruits', 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=900&q=80'],
  ['Black Rice', 'Grains', images.rice], ['Quail Eggs', 'Poultry', images.eggs],
  ['Yogurt', 'Dairy', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=900&q=80'], ['Rosemary', 'Herbs', 'https://images.unsplash.com/photo-1516659884524-1b306b8a8b33?w=900&q=80'],
  ['Cucumber', 'Vegetables', 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=900&q=80'], ['Onions', 'Vegetables', 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=900&q=80'],
  ['Garlic', 'Vegetables', 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=900&q=80'], ['Avocado', 'Fruits', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=900&q=80'],
] as const;

async function main() {
  const passwordHash = await hashPassword('password');
  await prisma.favorite.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categoryRecords = Object.fromEntries(
    await Promise.all(categories.map(([name, image]) => prisma.category.create({ data: { name, image } }).then((c) => [name, c]))),
  );

  await prisma.user.create({
    data: { email: 'admin@farmdirect.com', fullName: 'Admin User', passwordHash, role: 'ADMIN' },
  });

  const farmerUsers = await Promise.all(
    farmers.map(([farmName, fullName, location, description], index) =>
      prisma.user.create({
        data: {
          email: `farmer${index + 1}@farmdirect.com`,
          fullName,
          passwordHash,
          role: 'FARMER',
          phone: `+63 917 000 10${index}`,
          farmerProfile: {
            create: {
              farmName,
              farmDescription: description,
              farmLocation: location,
              verified: true,
              coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
            },
          },
        },
      }),
    ),
  );

  const buyers = await Promise.all(
    Array.from({ length: 10 }, (_, index) =>
      prisma.user.create({
        data: {
          email: `buyer${index + 1}@example.com`,
          fullName: ['Maria Santos', 'Carlo Lim', 'Liza Ramos', 'Nico Tan', 'Grace Yu', 'Ben Cruz', 'Aya Flores', 'Leo Reyes', 'Mika Ong', 'Ramon Diaz'][index],
          passwordHash,
          role: 'BUYER',
          phone: `+63 918 555 20${index}`,
          address: `${100 + index} Market Street, Metro Manila`,
        },
      }),
    ),
  );

  const products = await Promise.all(
    productNames.map(([name, category, image], index) =>
      prisma.product.create({
        data: {
          farmerId: farmerUsers[index % farmerUsers.length].id,
          name,
          description: `${name} sourced fresh from local farms, packed carefully, and ready for home kitchens, restaurants, and community buyers.`,
          categoryId: categoryRecords[category].id,
          price: 35 + (index % 12) * 18,
          stock: 25 + (index % 9) * 12,
          organic: index % 3 === 0,
          featured: index < 10,
          images: [image],
        },
      }),
    ),
  );

  await Promise.all(
    products.flatMap((product, index) =>
      [0, 1].map((offset) =>
        prisma.review.create({
          data: {
            productId: product.id,
            userId: buyers[(index + offset) % buyers.length].id,
            rating: 4 + ((index + offset) % 2),
            comment: ['Very fresh and delivered in great condition.', 'Good value and exactly as described.'][offset],
          },
        }),
      ),
    ),
  );

  for (let i = 0; i < 12; i += 1) {
    const orderProducts = [products[i], products[(i + 7) % products.length], products[(i + 13) % products.length]];
    const total = orderProducts.reduce((sum, product, idx) => sum + product.price * (idx + 1), 0);
    await prisma.order.create({
      data: {
        buyerId: buyers[i % buyers.length].id,
        total,
        status: i % 3 === 0 ? 'PENDING' : 'DELIVERED',
        paymentStatus: i % 3 === 0 ? 'PENDING' : 'COMPLETED',
        deliveryAddress: buyers[i % buyers.length].address || 'Metro Manila',
        orderItems: {
          create: orderProducts.map((product, idx) => ({ productId: product.id, quantity: idx + 1, price: product.price })),
        },
      },
    });
  }

  await prisma.message.create({
    data: {
      senderId: buyers[0].id,
      receiverId: farmerUsers[0].id,
      content: 'Hi! Are the tomatoes available for delivery tomorrow morning?',
    },
  });

  console.log('Seed complete: admin@farmdirect.com, farmer1@farmdirect.com, buyer1@example.com all use password: password');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
