import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Attempting to create missing _StudentEnrollments table manually ---');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`_StudentEnrollments\` (
        \`A\` INT NOT NULL,
        \`B\` INT NOT NULL,
        UNIQUE INDEX \`_StudentEnrollments_AB_unique\`(\`A\`, \`B\`),
        INDEX \`_StudentEnrollments_B_index\`(\`B\`),
        CONSTRAINT \`_StudentEnrollments_A_fkey\` FOREIGN KEY (\`A\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`_StudentEnrollments_B_fkey\` FOREIGN KEY (\`B\`) REFERENCES \`Module\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log('Successfully created _StudentEnrollments table.');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
