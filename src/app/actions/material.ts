'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getMaterials(moduleId: number) {
  try {
    const materials = await prisma.material.findMany({
      where: { moduleId },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, materials };
  } catch (error: any) {
    console.error('Error fetching materials:', error);
    return { error: 'Failed to fetch materials.' };
  }
}

export async function createMaterial(moduleId: number, title: string, fileUrl: string) {
  try {
    await prisma.material.create({
      data: {
        title,
        fileUrl,
        moduleId,
      },
    });
    revalidatePath('/teacher/materials');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating material:', error);
    return { error: 'Failed to add material.' };
  }
}

export async function deleteMaterial(materialId: number) {
  try {
    await prisma.material.delete({
      where: { id: materialId },
    });
    revalidatePath('/teacher/materials');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting material:', error);
    return { error: 'Failed to delete material.' };
  }
}

export async function updateMaterial(materialId: number, title: string, fileUrl?: string) {
  try {
    const data: any = { title };
    if (fileUrl) data.fileUrl = fileUrl;

    await prisma.material.update({
      where: { id: materialId },
      data,
    });
    revalidatePath('/teacher/materials');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating material:', error);
    return { error: 'Failed to update material.' };
  }
}
