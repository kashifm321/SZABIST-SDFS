import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Add columns to Assessment
    await prisma.$executeRawUnsafe(`ALTER TABLE Assessment ADD COLUMN title VARCHAR(255) NULL`);
    await prisma.$executeRawUnsafe(`ALTER TABLE Assessment ADD COLUMN isAssigned TINYINT(1) DEFAULT 0`);
    
    // 2. Create Announcement table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Announcement (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        moduleId INT NOT NULL,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (moduleId) REFERENCES Module(id) ON DELETE CASCADE
      )
    `);

    console.log('Schema sync completed successfully');
  } catch (err) {
    console.error('Error syncing schema:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
