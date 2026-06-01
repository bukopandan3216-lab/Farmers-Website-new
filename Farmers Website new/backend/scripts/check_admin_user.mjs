import prisma from '../src/config/database.ts';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@farmdirect.com' },
  });
  console.log('user', user ? { id: user.id, email: user.email, role: user.role } : null);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
