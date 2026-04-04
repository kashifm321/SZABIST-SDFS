import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@szabist.edu.pk';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  console.log('--- Seeding Admin User ---');
  try {
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN',
        registrationNumber: 'ADMIN-001',
        mustChangePassword: false
      }
    });
    console.log('Admin user verified:', admin.email);

    const teacherEmail = 'teacher@szabist.edu.pk';
    const teacherPassword = await bcrypt.hash('teacher123', 10);

    const teacher = await prisma.user.upsert({
      where: { email: teacherEmail },
      update: {},
      create: {
        email: teacherEmail,
        password: teacherPassword,
        name: 'Test Teacher',
        role: 'TEACHER',
        registrationNumber: 'TEA-001',
        mustChangePassword: false
      }
    });

    console.log('Teacher user verified:', teacher.email);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
