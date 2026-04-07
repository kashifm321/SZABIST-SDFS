'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAnnouncements(moduleId: number) {
  try {
    const announcements = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM Announcement WHERE moduleId = ? ORDER BY createdAt DESC`,
      moduleId
    );
    return { success: true, announcements };
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return { error: 'Failed to fetch announcements.' };
  }
}

export async function createAnnouncement(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const moduleId = parseInt(formData.get('moduleId') as string);

    if (!title || !content || !moduleId) {
      return { error: 'Title and content are required.' };
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO Announcement (title, content, moduleId, createdAt, updatedAt) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      title, content, moduleId
    );

    revalidatePath('/teacher/announcement');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return { error: 'Failed to create announcement.' };
  }
}

export async function updateAnnouncement(formData: FormData) {
  try {
    const id = parseInt(formData.get('id') as string);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!id || !title || !content) {
      return { error: 'ID, title and content are required.' };
    }

    await prisma.$executeRawUnsafe(
      `UPDATE Announcement SET title = ?, content = ?, updatedAt = NOW() WHERE id = ?`,
      title, content, id
    );

    revalidatePath('/teacher/announcement');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return { error: 'Failed to update announcement.' };
  }
}

export async function deleteAnnouncement(id: number) {
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM Announcement WHERE id = ?`, id);
    revalidatePath('/teacher/announcement');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return { error: 'Failed to delete announcement.' };
  }
}
