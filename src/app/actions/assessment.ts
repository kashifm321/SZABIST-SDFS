'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function saveFileLocally(file: File | null, type: string) {
  if (!file) return;
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dir = join(process.cwd(), 'public', 'uploads', `${type.toLowerCase()}s`);
    await mkdir(dir, { recursive: true });
    const path = join(dir, file.name);
    await writeFile(path, buffer);
  } catch (e) {
    console.error('File write failed, skipping for serverless environments', e);
  }
}

export async function getAssessments(moduleId: number, type: string) {
  try {
    const assessments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Assessment WHERE moduleId = ? AND type = ? AND isAssigned = 0 ORDER BY sequenceNo ASC`,
      moduleId,
      type
    );
    return { success: true, assessments };
  } catch (error: any) {
    console.error('Error fetching assessments:', error);
    return { error: 'Failed to fetch assessments.' };
  }
}

export async function getAssignedAssessments(moduleId: number, type: string) {
  try {
    const assessments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Assessment WHERE moduleId = ? AND type = ? AND isAssigned = 1 ORDER BY createdAt DESC`,
      moduleId,
      type
    );
    return { success: true, assessments };
  } catch (error: any) {
    console.error('Error fetching assigned assessments:', error);
    return { error: 'Failed to fetch assigned assessments.' };
  }
}

export async function createAssessment(formData: FormData) {
  try {
    const rawModuleId = formData.get('moduleId');
    const rawMarks = formData.get('marks');
    const rawSeqNo = formData.get('sequenceNo');
    
    const moduleId = rawModuleId ? parseInt(rawModuleId as string) : 0;
    const type = formData.get('type') as string;
    const marks = rawMarks ? parseFloat(rawMarks as string) : 0;
    const sequenceNo = rawSeqNo ? parseInt(rawSeqNo as string) : null;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const time = formData.get('time') as string;
    const fileName = formData.get('fileName') as string;
    const fileData = formData.get('fileData') as File;
    const title = formData.get('title') as string | null;
    const isAssigned = formData.get('isAssigned') === 'true';

    if (!moduleId || !type) {
      return { error: 'Required fields (Module ID / Type) are missing.' };
    }

    // 1. Validation for unique structural assignments (Folder management)
    if (!isAssigned && sequenceNo !== null) {
      const existing = await prisma.$queryRawUnsafe<any[]>(
        `SELECT id FROM Assessment WHERE moduleId = ? AND type = ? AND sequenceNo = ? AND isAssigned = 0`,
        moduleId, type, sequenceNo
      );

      if (existing && existing.length > 0) {
        return { error: `${type.charAt(0) + type.slice(1).toLowerCase()} ${sequenceNo} already exists. Please use a unique number.` };
      }
    }

    // 2. Save file
    if (fileName && fileData && fileData.size > 0) {
      await saveFileLocally(fileData, type);
    }

    const fileUrl = `/uploads/${type.toLowerCase()}s/${fileName}`;

    // 3. Insert
    await prisma.$executeRawUnsafe(
      `INSERT INTO Assessment (type, sequenceNo, marks, startDate, endDate, time, fileUrl, fileName, title, isAssigned, moduleId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      type, sequenceNo, marks, startDate, endDate, time, fileUrl, fileName, title, isAssigned ? 1 : 0, moduleId
    );

    const path = type === 'ASSIGNMENT' ? '/teacher/assignments' : 
                 type === 'QUIZ' ? '/teacher/quizzes' : 
                 type === 'MID_TERM' ? '/teacher/midterm' : '/teacher/finalterm';
    revalidatePath(path);
    revalidatePath(path + '/create');

    return { success: true };
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    return { error: error.message || 'Server error occurred during creation.' };
  }
}

export async function editAssessment(formData: FormData) {
  try {
    const rawAssessmentId = formData.get('assessmentId');
    const rawMarks = formData.get('marks');
    const rawShowToStudent = formData.get('solutionShowToStudent');
    const title = formData.get('title') as string | null;
    
    const assessmentId = rawAssessmentId ? parseInt(rawAssessmentId as string) : 0;
    const type = formData.get('type') as string;
    const marks = rawMarks ? parseFloat(rawMarks as string) : undefined;
    const startDate = formData.get('startDate') as string | null;
    const endDate = formData.get('endDate') as string | null;
    const time = formData.get('time') as string | null;
    const fileName = formData.get('fileName') as string | null;
    const showToStudent = rawShowToStudent === 'true';

    if (!assessmentId) {
      return { error: 'Assessment ID is missing.' };
    }

    // Build incremental update
    let sqlParts = ["updatedAt = NOW()"];
    let params: any[] = [];

    if (marks !== undefined && !isNaN(marks)) {
      sqlParts.push("marks = ?");
      params.push(marks);
    }
    if (title !== null && title !== undefined) {
      sqlParts.push("title = ?");
      params.push(title);
    }
    if (startDate && startDate !== 'null' && startDate !== '') {
      sqlParts.push("startDate = ?");
      params.push(startDate);
    }
    if (endDate && endDate !== 'null' && endDate !== '') {
      sqlParts.push("endDate = ?");
      params.push(endDate);
    }
    if (time && time !== 'null' && time !== '') {
      sqlParts.push("time = ?");
      params.push(time);
    }
    if (rawShowToStudent !== null) {
      sqlParts.push("solutionShowToStudent = ?");
      params.push(showToStudent ? 1 : 0);
    }
    
    if (fileName && fileName !== 'null' && fileName !== '') {
      const fileData = formData.get('fileData') as File | null;
      if (fileData && fileData.size > 0) {
        await saveFileLocally(fileData, type);
        const fileUrl = `/uploads/${type.toLowerCase()}s/${fileName}`;
        sqlParts.push("fileName = ?");
        params.push(fileName);
        sqlParts.push("fileUrl = ?");
        params.push(fileUrl);
      }
    }

    const sql = `UPDATE Assessment SET ${sqlParts.join(', ')} WHERE id = ?`;
    params.push(assessmentId);

    await prisma.$executeRawUnsafe(sql, ...params);

    const path = type === 'ASSIGNMENT' ? '/teacher/assignments' : 
                 type === 'QUIZ' ? '/teacher/quizzes' : 
                 type === 'MID_TERM' ? '/teacher/midterm' : '/teacher/finalterm';
    revalidatePath(path);
    revalidatePath(path + '/create');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating assessment:', error);
    return { error: error.message || 'Internal Server Error' };
  }
}

export async function deleteAssessment(id: number, type: string) {
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM Assessment WHERE id = ?`, id);

    const path = type === 'ASSIGNMENT' ? '/teacher/assignments' : 
                 type === 'QUIZ' ? '/teacher/quizzes' : 
                 type === 'MID_TERM' ? '/teacher/midterm' : '/teacher/finalterm';
    revalidatePath(path);
    revalidatePath(path + '/create');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting assessment:', error);
    return { error: 'Failed to delete assessment.' };
  }
}

export async function updateAssessmentSolution(formData: FormData) {
  const assessmentId = parseInt(formData.get('assessmentId') as string);
  const solutionType = formData.get('solutionType') as string;
  const fileName = formData.get('fileName') as string;
  const fileData = formData.get('fileData') as File | null;
  const showToStudent = formData.get('showToStudent') === 'true';

  try {
    const check = await prisma.$queryRawUnsafe<any[]>(`SELECT type FROM Assessment WHERE id = ?`, assessmentId);
    let typeContext = 'assignment';
    if (check.length > 0) {
      typeContext = check[0].type;
    }
    
    if (fileData && fileData.size > 0) {
      await saveFileLocally(fileData, typeContext);
    }
    
    let sql = '';
    let params: any[] = [];

    if (solutionType === 'solution') {
      sql = `UPDATE Assessment SET solutionFileName = ?, solutionShowToStudent = ?, updatedAt = NOW() WHERE id = ?`;
      params = [fileName, showToStudent ? 1 : 0, assessmentId];
    } else if (solutionType === 'best') {
      sql = `UPDATE Assessment SET bestFileName = ?, updatedAt = NOW() WHERE id = ?`;
      params = [fileName, assessmentId];
    } else if (solutionType === 'avg') {
      sql = `UPDATE Assessment SET avgFileName = ?, updatedAt = NOW() WHERE id = ?`;
      params = [fileName, assessmentId];
    } else if (solutionType === 'worst') {
      sql = `UPDATE Assessment SET worstFileName = ?, updatedAt = NOW() WHERE id = ?`;
      params = [fileName, assessmentId];
    }

    await prisma.$executeRawUnsafe(sql, ...params);

    const path = typeContext === 'ASSIGNMENT' ? '/teacher/assignments' : 
                 typeContext === 'QUIZ' ? '/teacher/quizzes' : 
                 typeContext === 'MID_TERM' ? '/teacher/midterm' : '/teacher/finalterm';
    revalidatePath(path);

    return { success: true };
  } catch (error: any) {
    console.error('Error updating solution:', error);
    return { error: 'Failed to update solution file.' };
  }
}
