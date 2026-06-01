import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const approved = await prisma.application.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, email: true, fullName: true, role: true, status: true },
  });

  const pending = await prisma.application.findMany({
    where: { status: 'PENDING' },
    select: { id: true, email: true, fullName: true, role: true, status: true },
  });

  console.log('\n=== APPROVED APPLICATIONS ===');
  if (approved.length === 0) {
    console.log('No approved applications');
  } else {
    approved.forEach((app) => {
      console.log(`ID: ${app.id} | Email: ${app.email} | Name: ${app.fullName} | Role: ${app.role}`);
    });
  }

  console.log('\n=== PENDING APPLICATIONS ===');
  if (pending.length === 0) {
    console.log('No pending applications');
  } else {
    pending.forEach((app) => {
      console.log(`ID: ${app.id} | Email: ${app.email} | Name: ${app.fullName} | Role: ${app.role}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
