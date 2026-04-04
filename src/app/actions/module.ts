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

export async function updateModuleOutline(
  moduleId: number,
  name: string | null,
  url: string | null
) {
  try {
    // Using raw SQL to bypass Prisma Client generation issues (EPERM/file locks)
    await prisma.$executeRawUnsafe(
      `UPDATE Module SET outlineName = ?, outlineUrl = ? WHERE id = ?`,
      name, url, moduleId
    );

    revalidatePath('/teacher/outline');
    return { success: true };
  } catch (error: any) {
    console.error('Raw SQL Update Error:', error);
    return { error: 'Failed to update course outline in database.' };
  }
}

export async function updateModuleRegisteredStudents(
  moduleId: number,
  name: string | null,
  url: string | null
) {
  try {
    // Using raw SQL to bypass Prisma Client generation issues (EPERM/file locks)
    await prisma.$executeRawUnsafe(
      `UPDATE Module SET registeredStudentsName = ?, registeredStudentsUrl = ? WHERE id = ?`,
      name, url, moduleId
    );

    revalidatePath('/teacher/students');
    return { success: true };
  } catch (error: any) {
    console.error('Raw SQL Update Error:', error);
    return { error: 'Failed to update registered students file in database.' };
  }
}

export async function updateModuleLectureProgress(
  moduleId: number,
  name: string | null,
  url: string | null
) {
  try {
    // Using raw SQL to bypass Prisma Client generation issues (EPERM/file locks)
    await prisma.$executeRawUnsafe(
      `UPDATE Module SET lectureProgressName = ?, lectureProgressUrl = ? WHERE id = ?`,
      name, url, moduleId
    );

    revalidatePath('/teacher/progress');
    return { success: true };
  } catch (error: any) {
    console.error('Raw SQL Update Error:', error);
    return { error: 'Failed to update lecture progress file in database.' };
  }
}

export async function updateModuleRecapSheet(
  moduleId: number,
  name: string | null,
  url: string | null
) {
  try {
    // Using raw SQL to bypass Prisma Client generation issues (EPERM/file locks)
    await prisma.$executeRawUnsafe(
      `UPDATE Module SET recapSheetName = ?, recapSheetUrl = ? WHERE id = ?`,
      name, url, moduleId
    );

    revalidatePath('/teacher/recap');
    return { success: true };
  } catch (error: any) {
    console.error('Raw SQL Update Error:', error);
    return { error: 'Failed to update recap sheet file in database.' };
  }
}

export async function updateModuleFcar(
  moduleId: number,
  name: string | null,
  url: string | null
) {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE Module SET fcarName = ?, fcarUrl = ? WHERE id = ?`,
      name, url, moduleId
    );

    revalidatePath('/teacher/fcar');
    return { success: true };
  } catch (error: any) {
    console.error('Raw SQL Update Error:', error);
    return { error: 'Failed to update FCAR file in database.' };
  }
}

export async function getModuleOutline(moduleId: number) {
  try {
    // Using raw SQL for fetching to ensure we get the new columns even if client is old
    const results = await prisma.$queryRawUnsafe<any[]>(
      `SELECT m.*, c.name as courseName, c.code as courseCode 
       FROM Module m 
       LEFT JOIN Course c ON m.courseId = c.id 
       WHERE m.id = ?`,
      moduleId
    );

    if (!results || results.length === 0) {
      return { success: false, error: 'Module not found.' };
    }

    const module = results[0];
    // Map raw results to expected format
    const formattedModule = {
      ...module,
      course: module.courseId ? { name: module.courseName, code: module.courseCode } : null
    };

    return { success: true, module: formattedModule };
  } catch (error) {
    console.error('Raw SQL Fetch Error:', error);
    return { error: 'Failed to fetch course outline from database.' };
  }
}
