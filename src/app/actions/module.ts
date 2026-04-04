'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createModule(formData: FormData) {
  const name = formData.get('name') as string;
  const courseId = parseInt(formData.get('courseId') as string);
  const semesterLevel = parseInt(formData.get('semesterLevel') as string);
  const department = formData.get('department') as string;
  const section = formData.get('section') as string;
  const academicYear = parseInt(formData.get('academicYear') as string);
  const academicSemester = formData.get('academicSemester') as string;

  try {
    await prisma.module.create({
      data: {
        name,
        courseId,
        semesterLevel,
        department,
        section,
        academicYear,
        academicSemester,
      }
    });

    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating class:', error);
    return { error: `Failed to create class: ${error?.message || 'Unknown error'}` };
  }
}

export async function deleteModule(id: number) {
  try {
    await prisma.module.delete({
      where: { id }
    });

    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting class:', error);
    return { error: 'Failed to delete class.' };
  }
}

export async function assignTeacher(moduleId: number, teacherId: number | null) {
  try {
    await prisma.module.update({
      where: { id: moduleId },
      data: { teacherId }
    });

    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning teacher:', error);
    return { error: 'Failed to assign teacher.' };
  }
}

export async function updateModule(
  moduleId: number,
  data: {
    name: string;
    semesterLevel: number;
    department: string;
    section: string;
    academicYear: number;
    academicSemester: string;
  }
) {
  try {
    await prisma.module.update({
      where: { id: moduleId },
      data: {
        name: data.name,
        semesterLevel: data.semesterLevel,
        department: data.department,
        section: data.section,
        academicYear: data.academicYear,
        academicSemester: data.academicSemester,
      }
    });

    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating class:', error);
    return { error: 'Failed to update class.' };
  }
}
