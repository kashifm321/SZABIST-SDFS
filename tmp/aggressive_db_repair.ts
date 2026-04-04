import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Aggressive Database Repair ---');
  try {
    // 1. Check if the base tables exist
    const currentTables: any[] = await prisma.$queryRawUnsafe(`SHOW TABLES;`);
    console.log('Initial Tables:', JSON.stringify(currentTables, null, 2));

    // 2. Drop the join table if it exists (to clear out bad state)
    console.log('Dropping any existing _StudentEnrollments...');
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`_StudentEnrollments\`;`);

    // 3. Create the Join Table with correct alphabetical mapping (Module=A, User=B)
    console.log('Creating _StudentEnrollments join table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE \`_StudentEnrollments\` (
        \`A\` INT NOT NULL,
        \`B\` INT NOT NULL,
        UNIQUE INDEX \`_StudentEnrollments_AB_unique\`(\`A\`, \`B\`),
        INDEX \`_StudentEnrollments_B_index\`(\`B\`),
        CONSTRAINT \`_StudentEnrollments_A_fkey\` FOREIGN KEY (\`A\`) REFERENCES \`Module\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`_StudentEnrollments_B_fkey\` FOREIGN KEY (\`B\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    // 4. Verify Final State
    const finalTables: any[] = await prisma.$queryRawUnsafe(`SHOW TABLES;`);
    console.log('Final Tables:', JSON.stringify(finalTables, null, 2));

    console.log('--- REPAIR COMPLETED ---');
  } catch (error) {
    console.error('Critical Error during repair:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
