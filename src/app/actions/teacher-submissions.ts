'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSubmissionDetails(assessmentId: number) {
  try {
    // 1. Get assessment info to know the module using raw SQL
    const assessments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Assessment WHERE id = ?`,
      assessmentId
    );

    if (!assessments || assessments.length === 0) return { error: 'Assessment not found.' };
    const assessment = assessments[0];

    // 2. Get all students enrolled in this module
    // We join User with StudentEnrollment to get student details
    const enrollments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT u.id, u.name, u.registrationNumber, u.email 
       FROM User u
       INNER JOIN StudentEnrollment se ON u.id = se.studentId
       WHERE se.moduleId = ?`,
      assessment.moduleId
    );

    // 3. Get all submissions for this assessment
    const submissions = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Submission WHERE assessmentId = ?`,
      assessmentId
    );

    // 4. Map them together
    const data = enrollments.map(student => {
      const sub = submissions.find(s => s.studentId === student.id);
      return {
        studentId: student.id,
        regNo: student.registrationNumber || 'N/A',
        name: student.name,
        submissionId: sub?.id || null,
        fileName: sub?.fileName || null,
        fileUrl: sub?.fileUrl || null,
        marksObtained: sub?.marksObtained ?? null,
        submittedAt: sub?.submittedAt || null,
        status: sub ? 'Submitted' : 'Pending'
      };
    });

    return { 
      success: true, 
      submissions: data,
      assessment: {
        id: assessment.id,
        title: assessment.title || `${assessment.type} ${assessment.sequenceNo || ''}`,
        totalMarks: assessment.marks,
        type: assessment.type
      }
    };
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return { error: 'Failed to load submission data.' };
  }
}

export async function gradeSubmission(submissionData: { 
  studentId: number, 
  assessmentId: number, 
  marks: number, 
  feedback?: string 
}) {
  try {
    const { studentId, assessmentId, marks, feedback } = submissionData;

    // Use raw SQL for upsert logic
    await prisma.$executeRawUnsafe(
      `INSERT INTO Submission (studentId, assessmentId, marksObtained, feedback, submittedAt, updatedAt)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE marksObtained = VALUES(marksObtained), feedback = VALUES(feedback), updatedAt = NOW()`,
      studentId, 
      assessmentId, 
      marks, 
      feedback || ''
    );

    revalidatePath('/teacher/assignments/submissions');
    revalidatePath('/teacher/quizzes/submissions');
    
    return { success: true, message: 'Grade updated successfully.' };
  } catch (error: any) {
    console.error('Grading error:', error);
    return { error: 'Failed to update grade.' };
  }
}
