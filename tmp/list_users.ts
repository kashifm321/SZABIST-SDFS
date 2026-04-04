import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Current Users in Database ---');
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        name: true
      }
    });
    console.table(users);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
