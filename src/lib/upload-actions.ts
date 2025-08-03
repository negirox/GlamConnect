
'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;

  if (!file) {
    throw new Error('No file uploaded.');
  }

  // Ensure the uploads directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      console.error('Error creating upload directory:', error);
      throw new Error('Could not create upload directory.');
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const filePath = path.join(uploadDir, filename);

  try {
    await fs.writeFile(filePath, buffer);
    const publicPath = `/uploads/${filename}`;
    revalidatePath('/account/profile/edit');
    return { success: true, filePath: publicPath };
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file.');
  }
}
