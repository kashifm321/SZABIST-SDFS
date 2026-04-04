import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Listing all tables in the database ---');
  try {
    const tables: any[] = await prisma.$queryRawUnsafe(`SHOW TABLES;`);
    console.log('Tables found:', JSON.stringify(tables, null, 2));
  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
