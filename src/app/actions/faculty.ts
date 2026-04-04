'use server';

import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function addFaculty(prevState: any, formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!firstName || !lastName || !email || !password) {
      return { error: 'Please fill in all fields.' };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: 'A user with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: 'TEACHER',
        mustChangePassword: true, // force password change on first login
      },
    });

    revalidatePath('/admin/faculty');
    return { success: true };
  } catch (error) {
    console.error('Add faculty error:', error);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function updateFaculty(id: number, firstName: string, lastName: string, email: string) {
  try {
    if (!firstName || !lastName || !email) {
      return { error: 'Please fill in all fields.' };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });

    if (existingUser) {
      return { error: 'A user with this email already exists.' };
    }

    await prisma.user.update({
      where: { id },
      data: {
        name: `${firstName} ${lastName}`,
        email,
      },
    });

    revalidatePath('/admin/faculty');
    return { success: true };
  } catch (error) {
    console.error('Update faculty error:', error);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function deleteFaculty(id: number) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/faculty');
    return { success: true };
  } catch (error) {
    console.error('Delete faculty error:', error);
    return { error: 'Failed to delete faculty member.' };
  }
}

export async function getFacultyList() {
  return prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
