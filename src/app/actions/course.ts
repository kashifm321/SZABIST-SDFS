'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Add a new course to the catalog
 */
export async function addCourse(prevState: any, formData: FormData) {
  try {
    const code = formData.get('code') as string;
    const name = formData.get('name') as string;
    const prerequisite = formData.get('prerequisite') as string;
    const creditHoursStr = formData.get('creditHours') as string;

    if (!code || !name || !creditHoursStr) {
      return { error: 'Please fill in all required fields (Code, Name, and Credit Hours).' };
    }

    const creditHours = parseInt(creditHoursStr);
    if (isNaN(creditHours)) {
      return { error: 'Credit hours must be a valid number.' };
    }

    const existingCourse = await prisma.course.findUnique({
      where: { code },
    });

    if (existingCourse) {
      return { error: 'A course with this code already exists.' };
    }

    await prisma.course.create({
      data: {
        code,
        name,
        prerequisite: prerequisite || 'Null',
        creditHours,
      },
    });

    revalidatePath('/admin/courses/add');
    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error) {
    console.error('Add course error:', error);
    return { error: 'An unexpected error occurred while adding the course.' };
  }
}

/**
 * Update an existing course
 */
export async function updateCourse(id: number, formData: FormData) {
  try {
    const code = formData.get('code') as string;
    const name = formData.get('name') as string;
    const prerequisite = formData.get('prerequisite') as string;
    const creditHoursStr = formData.get('creditHours') as string;

    if (!code || !name || !creditHoursStr) {
      return { error: 'Please fill in all required fields (Code, Name, and Credit Hours).' };
    }

    const creditHours = parseInt(creditHoursStr);
    if (isNaN(creditHours)) {
      return { error: 'Credit hours must be a valid number.' };
    }

    // Check if another course (not this one) has the same code
    const existingCourse = await prisma.course.findFirst({
      where: {
        code,
        NOT: { id },
      },
    });

    if (existingCourse) {
      return { error: 'Another course with this code already exists.' };
    }

    await prisma.course.update({
      where: { id },
      data: {
        code,
        name,
        prerequisite: prerequisite || 'Null',
        creditHours,
      },
    });

    revalidatePath('/admin/courses/add');
    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error) {
    console.error('Update course error:', error);
    return { error: 'An unexpected error occurred while updating the course.' };
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(id: number) {
  try {
    await prisma.course.delete({
      where: { id },
    });

    revalidatePath('/admin/courses/add');
    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error) {
    console.error('Delete course error:', error);
    return { error: 'Failed to delete the course. It may be linked to active modules.' };
  }
}
