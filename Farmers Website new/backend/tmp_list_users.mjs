import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ where: { accountSetupCompleted: false }, select: { id: true, email: true, fullName: true, role: true, accountSetupCompleted: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 50 });
  console.log('users_no_setup:', JSON.stringify(users, null, 2));
  const apps = await prisma.application.findMany({ where: { status: 'APPROVED' }, select: { id: true, email: true, fullName: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 50 });
  console.log('approved_apps:', JSON.stringify(apps, null, 2));
  await prisma.$disconnect();
}
main().catch(err => { console.error(err); prisma.$disconnect(); process.exit(1); });
