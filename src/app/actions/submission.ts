'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function submitAssessment(formData: FormData) {
  try {
    const userIdInput = formData.get('userId');
    const assessmentIdInput = formData.get('assessmentId');
    const file = formData.get('file') as File;
    const moduleIdInput = formData.get('moduleId');

    const userId = Number(userIdInput);
    const assessmentId = Number(assessmentIdInput);
    const moduleId = Number(moduleIdInput);

    if (!userId || !assessmentId || !file || !file.name) {
      return { error: 'Missing required fields or file.' };
    }

    // Check assessment and deadline using raw SQL
    const assessments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Assessment WHERE id = ?`,
      assessmentId
    );

    if (assessments.length === 0) return { error: 'Assessment not found.' };
    const assessment = assessments[0];

    // Deadline check
    const deadlineStr = `${assessment.endDate}T${assessment.time}`;
    const deadline = new Date(deadlineStr);
    const now = new Date();

    if (now > deadline) {
      return { error: 'The deadline for this submission has passed.' };
    }

    // Save File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const relativePath = `uploads/submissions/${assessmentId}_${userId}_${file.name}`;
    const fullPath = path.join(process.cwd(), 'public', relativePath);
    
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);

    const fileUrl = `/${relativePath}`;

    // Database record using raw SQL to avoid type issues with new model
    await prisma.$executeRawUnsafe(
      `INSERT INTO Submission (studentId, assessmentId, fileName, fileUrl, submittedAt, updatedAt)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE fileName = VALUES(fileName), fileUrl = VALUES(fileUrl), submittedAt = NOW(), updatedAt = NOW()`,
      userId, assessmentId, file.name, fileUrl
    );

    revalidatePath('/student/assignments');
    revalidatePath('/student/quizzes');
    
    return { success: true, message: 'Submission successful!' };
  } catch (error: any) {
    console.error('Submission error:', error);
    return { error: 'Server error occurred during submission.' };
  }
}
