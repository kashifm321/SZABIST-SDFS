import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Testing StudentEnrollment Model ---');
  try {
    const enrollments = await prisma.studentEnrollment.findMany();
    console.log('Enrollments found:', enrollments.length);
    console.log('SUCCESS: Prisma successfully recognizes the new model.');
  } catch (error) {
    console.error('FAILURE: Prisma still does not recognize the new model.', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
