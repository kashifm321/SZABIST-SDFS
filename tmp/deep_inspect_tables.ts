import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Case Sensitivity & Table Name Check ---');
  try {
    const rawTables: any[] = await prisma.$queryRawUnsafe(`SHOW TABLES;`);
    console.log('--- ALL TABLES ---');
    console.log(JSON.stringify(rawTables, null, 2));

    const checkEnroll = await prisma.$queryRawUnsafe(`SHOW TABLES LIKE '%Enroll%';`);
    console.log('--- TABLES LIKE ENROLL ---');
    console.log(JSON.stringify(checkEnroll, null, 2));

    // Try a test query
    console.log('--- Testing query on _StudentEnrollments ---');
    await prisma.$queryRawUnsafe(`SELECT * FROM \`_StudentEnrollments\` LIMIT 1;`);
    console.log('SUCCESS: Table exists and is queryable.');
  } catch (error) {
    console.error('FAILURE: Table does not exist or is not queryable.', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
