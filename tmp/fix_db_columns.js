const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Running robust Course Outline database fix...');
  try {
    // 1. Try to add columns via raw SQL
    console.log('Adding outlineName column...');
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE Module ADD COLUMN outlineName VARCHAR(255) DEFAULT NULL;');
      console.log('Added outlineName column.');
    } catch (e) {
      console.log('outlineName column might already exist or error:', e.message);
    }

    console.log('Adding outlineUrl column...');
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE Module ADD COLUMN outlineUrl VARCHAR(255) DEFAULT NULL;');
      console.log('Added outlineUrl column.');
    } catch (e) {
      console.log('outlineUrl column might already exist or error:', e.message);
    }

    console.log('Database sync complete.');
    process.exit(0);
  } catch (err) {
    console.error('FATAL ERROR:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
