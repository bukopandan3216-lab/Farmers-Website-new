import prisma from '../config/database.js';
import { hashPassword } from '../utils/password.js';

async function main() {
  const passwordHash = await hashPassword('password');

  const count = 5; // create 5 additional farmer accounts
  for (let i = 0; i < count; i += 1) {
    const index = i + 1;
    const email = `farmer-extra-${index}@farmdirect.com`;

    // Skip if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // ensure farmerProfile exists
      if (existing.role === 'FARMER') {
        const profile = await prisma.farmerProfile.findFirst({ where: { userId: existing.id } });
        if (!profile) {
          await prisma.farmerProfile.create({ data: { userId: existing.id, farmName: `Extra Farm ${index}`, farmDescription: 'Additional demo farmer', farmLocation: 'Unknown', verified: false } });
        }
      }
      console.log(`Skipped existing user ${email}`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email,
        fullName: `Demo Farmer ${index}`,
        passwordHash,
        role: 'FARMER',
        phone: `+63 900 000 10${index}`,
        farmerProfile: {
          create: {
            farmName: `Extra Farm ${index}`,
            farmDescription: 'Additional demo farmer created for UI testing',
            farmLocation: 'Demo Province',
            verified: false,
          },
        },
      },
    });

    console.log(`Created farmer: ${user.email} (password: password)`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
