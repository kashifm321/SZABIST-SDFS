'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function saveFileLocally(file: File | null, subDir: string) {
  if (!file) return;
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dir = join(process.cwd(), 'public', 'uploads', subDir);
    await mkdir(dir, { recursive: true });
    const path = join(dir, file.name);
    await writeFile(path, buffer);
  } catch (e) {
    console.error('File write failed:', e);
  }
}

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

export async function updateModuleOutline(formData: FormData) {
  const moduleId = parseInt(formData.get('moduleId') as string);
  const fileName = formData.get('fileName') as string | null;
  const fileData = formData.get('fileData') as File | null;
  
  try {
    let dummyUrl = null;
    if (fileName && fileData) {
      await saveFileLocally(fileData, 'outlines');
      dummyUrl = `/uploads/outlines/${fileName}`;
    }

    // Using raw SQL to bypass Prisma Client generation issues (EPERM/file locks)
    await prisma.$executeRawUnsafe(
      `UPDATE Module SET outlineName = ?, outlineUrl = ? WHERE id = ?`,
      fileName, dummyUrl, moduleId
    );

    revalidatePath('/teacher/outline');
    return { success: true };
  } catch (error: any) {
    console.error('Raw SQL Update Error:', error);
    return { error: 'Failed to update course outline in database.' };
  }
}

export async function updateModuleRegisteredStudents(formData: FormData) {
  const moduleId = parseInt(formData.get('moduleId') as string);
  const fileName = formData.get('fileName') as string | null;
  const fileData = formData.get('fileData') as File | null;

  try {
    let dummyUrl = null;
    if (fileName && fileData) {
      await saveFileLocally(fileData, 'students_list');
      dummyUrl = `/uploads/students_list/${fileName}`;
    }

    // Using raw SQL to bypass Prisma Client generation issues (EPERM/file locks)
    await prisma.$executeRawUnsafe(
      `UPDATE Module SET registeredStudentsName = ?, registeredStudentsUrl = ? WHERE id = ?`,
      fileName, dummyUrl, moduleId
    );

    revalidatePath('/teacher/students');
    return { success: true };
  } catch (error: any) {
    console.error('Raw SQL Update Error:', error);
    return { error: 'Failed to update registered students file in database.' };
  }
}

export async function updateModuleLectureProgress(formData: FormData) {
  const moduleId = parseInt(formData.get('moduleId') as string);
  const fileName = formData.get('fileName') as string | null;
  const fileData = formData.get('fileData') as File | null;

  try {
    let dummyUrl = null;
    if (fileName && fileData) {
      await saveFileLocally(fileData, 'progress_reports');
      dummyUrl = `/uploads/progress_reports/${fileName}`;
    }

    // Using raw SQL to bypass Prisma Client generation issues (EPERM/file locks)
    await prisma.$executeRawUnsafe(
      `UPDATE Module SET lectureProgressName = ?, lectureProgressUrl = ? WHERE id = ?`,
      fileName, dummyUrl, moduleId
    );

    revalidatePath('/teacher/progress');
    return { success: true };
  } catch (error: any) {
    console.error('Raw SQL Update Error:', error);
    return { error: 'Failed to update lecture progress file in database.' };
  }
}

export async function updateModuleRecapSheet(formData: FormData) {
  const moduleId = parseInt(formData.get('moduleId') as string);
  const fileName = formData.get('fileName') as string | null;
  const fileData = formData.get('fileData') as File | null;

  try {
    let dummyUrl = null;
    if (fileName && fileData) {
      await saveFileLocally(fileData, 'recap_sheets');
      dummyUrl = `/uploads/recap_sheets/${fileName}`;
    }

    // Using raw SQL to bypass Prisma Client generation issues (EPERM/file locks)
    await prisma.$executeRawUnsafe(
      `UPDATE Module SET recapSheetName = ?, recapSheetUrl = ? WHERE id = ?`,
      fileName, dummyUrl, moduleId
    );

    revalidatePath('/teacher/recap');
    return { success: true };
  } catch (error: any) {
    console.error('Raw SQL Update Error:', error);
    return { error: 'Failed to update recap sheet file in database.' };
  }
}

export async function updateModuleFcar(formData: FormData) {
  const moduleId = parseInt(formData.get('moduleId') as string);
  const fileName = formData.get('fileName') as string | null;
  const fileData = formData.get('fileData') as File | null;

  try {
    let dummyUrl = null;
    if (fileName && fileData) {
      await saveFileLocally(fileData, 'fcars');
      dummyUrl = `/uploads/fcars/${fileName}`;
    }

    await prisma.$executeRawUnsafe(
      `UPDATE Module SET fcarName = ?, fcarUrl = ? WHERE id = ?`,
      fileName, dummyUrl, moduleId
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

export async function getModuleSummary(moduleId: number) {
  try {
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

    const assessments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Assessment WHERE moduleId = ? ORDER BY type ASC, sequenceNo ASC`,
      moduleId
    );

    return { 
      success: true, 
      module: results[0],
      assessments 
    };
  } catch (error) {
    console.error('Summary Fetch Error:', error);
    return { error: 'Failed to fetch module summary.' };
  }
}

export async function getDownloadableFiles(moduleId: number) {
  try {
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

    const assessments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Assessment WHERE moduleId = ?`,
      moduleId
    );

    const materials = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Material WHERE moduleId = ?`,
      moduleId
    );

    return { 
      success: true, 
      files: {
        courseName: module.courseName,
        courseCode: module.courseCode,
        outline: module.outlineUrl ? { name: module.outlineName || 'Course Outline.pdf', url: module.outlineUrl } : null,
        students: module.registeredStudentsUrl ? { name: module.registeredStudentsName || 'Registered Students.pdf', url: module.registeredStudentsUrl } : null,
        progress: module.lectureProgressUrl ? { name: module.lectureProgressName || 'Lecture Progress.pdf', url: module.lectureProgressUrl } : null,
        recap: module.recapSheetUrl ? { name: module.recapSheetName || 'Recap Sheet.pdf', url: module.recapSheetUrl } : null,
        fcar: module.fcarUrl ? { name: module.fcarName || 'FCAR.pdf', url: module.fcarUrl } : null,
        materials: materials.map(m => ({ name: m.title || m.fileUrl.split('/').pop(), url: m.fileUrl })),
        assessments: assessments.map(a => ({ 
          type: a.type, 
          name: a.fileName, 
          url: a.fileUrl,
          title: a.title,
          sequenceNo: a.sequenceNo,
          isAssigned: a.isAssigned,
          sol: a.solutionFileName ? { name: a.solutionFileName, url: `/uploads/${a.type.toLowerCase()}s/${a.solutionFileName}` } : null,
          best: a.bestFileName ? { name: a.bestFileName, url: `/uploads/${a.type.toLowerCase()}s/${a.bestFileName}` } : null,
          avg: a.avgFileName ? { name: a.avgFileName, url: `/uploads/${a.type.toLowerCase()}s/${a.avgFileName}` } : null,
          worst: a.worstFileName ? { name: a.worstFileName, url: `/uploads/${a.type.toLowerCase()}s/${a.worstFileName}` } : null
        }))
      }
    };
  } catch (error) {
    console.error('Download Files Fetch Error:', error);
    return { error: 'Failed to fetch downloadable files.' };
  }
}
