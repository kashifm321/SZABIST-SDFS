'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getStudentDashboardData(userId: number) {
  try {
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { studentId: userId },
      include: {
        module: {
          include: {
            course: true,
            teacher: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return { 
      success: true, 
      courses: enrollments.map(e => ({
        id: e.module.id,
        courseId: e.module.course?.code || `MOD-${e.module.id}`,
        name: e.module.course?.name || e.module.name,
        lab: "No",
        semesterLevel: e.module.semesterLevel,
        section: e.module.section,
        semester: e.module.academicSemester.toUpperCase(),
        teacherName: e.module.teacher?.name || 'N/A'
      }))
    };
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    return { error: 'Failed to fetch course list.' };
  }
}

export async function getStudentAssessments(userId: number, moduleId: number, type: 'ASSIGNMENT' | 'QUIZ') {
  try {
    // Using raw SQL to be consistent with project patterns and avoid lints
    const assessments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT a.*, s.marksObtained, s.fileUrl as submissionUrl, s.fileName as submissionName, s.submittedAt 
       FROM Assessment a 
       LEFT JOIN Submission s ON a.id = s.assessmentId AND s.studentId = ?
       WHERE a.moduleId = ? AND a.type = ? AND a.isAssigned = 1
       ORDER BY a.createdAt DESC`,
      userId, moduleId, type
    );

    return {
      success: true,
      assessments: assessments.map(a => ({
        id: a.id,
        title: a.title || `${type} ${a.sequenceNo || ''}`,
        endDate: a.endDate,
        endTime: a.time,
        fileUrl: a.fileUrl,
        fileName: a.fileName,
        marks: a.marks,
        marksObtained: a.marksObtained,
        submissionStatus: a.submittedAt ? 'Submitted' : 'Pending',
        submissionUrl: a.submissionUrl,
        submissionName: a.submissionName,
        submittedAt: a.submittedAt
      }))
    };
  } catch (error) {
    console.error(`Error fetching student ${type}s:`, error);
    return { error: `Failed to fetch ${type.toLowerCase()}s.` };
  }
}

export async function getStudentMaterials(moduleId: number) {
  try {
    const materials = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Material WHERE moduleId = ? ORDER BY createdAt ASC`,
      moduleId
    );

    return {
      success: true,
      materials: materials.map((m, index) => ({
        id: m.id,
        lectureNo: index + 1,
        title: m.title,
        uploadedDate: new Date(m.createdAt).toLocaleDateString(),
        uploadedTime: new Date(m.createdAt).toLocaleTimeString(),
        fileUrl: m.fileUrl
      }))
    };
  } catch (error) {
    console.error('Error fetching student materials:', error);
    return { error: 'Failed to fetch materials.' };
  }
}

export async function getStudentSolutions(moduleId: number) {
  try {
    const assessments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Assessment WHERE moduleId = ? AND solutionShowToStudent = 1 AND solutionFileName IS NOT NULL ORDER BY type ASC`,
      moduleId
    );

    return {
      success: true,
      solutions: assessments.map((a, index) => ({
        id: a.id,
        type: a.type,
        sequenceNo: a.sequenceNo,
        title: a.title || `${a.type} ${a.sequenceNo || ''}`,
        solutionUrl: `/uploads/${a.type.toLowerCase()}s/${a.solutionFileName}`,
        solutionFileName: a.solutionFileName
      }))
    };
  } catch (error) {
    console.error('Error fetching solutions:', error);
    return { error: 'Failed to fetch solutions.' };
  }
}

export async function getStudentAnnouncements(moduleId: number) {
  try {
    const announcements = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Announcement WHERE moduleId = ? ORDER BY createdAt DESC`,
      moduleId
    );

    return {
      success: true,
      announcements: announcements.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        date: new Date(a.createdAt).toLocaleDateString(),
        time: new Date(a.createdAt).toLocaleTimeString()
      }))
    };
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return { error: 'Failed to fetch announcements.' };
  }
}
