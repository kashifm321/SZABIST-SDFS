const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@szabist.edu.pk' },
    update: {},
    create: {
      email: 'admin@szabist.edu.pk',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Teacher User
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@szabist.edu.pk' },
    update: {},
    create: {
      email: 'teacher@szabist.edu.pk',
      name: 'Dr. Teacher',
      password: hashedPassword,
      role: 'TEACHER',
    },
  });

  // Student User
  const student = await prisma.user.upsert({
    where: { email: 'student@szabist.edu.pk' },
    update: {},
    create: {
      email: 'student@szabist.edu.pk',
      name: 'Jane Doe',
      password: hashedPassword,
      role: 'STUDENT',
    },
  });

  console.log({ admin, teacher, student });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
