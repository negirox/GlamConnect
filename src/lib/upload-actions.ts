
'use server';

import fs from 'fs/promises';
import path from 'path';

const PROFILE_PIC_MAX_SIZE_MB = 0.5; // 500KB
const PORTFOLIO_PIC_MAX_SIZE_MB = 2; // 2MB

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  const fieldName = formData.get('fieldName') as string;

  if (!file) {
    throw new Error('No file uploaded.');
  }

  const maxSizeInMB = fieldName === 'profilePicture' ? PROFILE_PIC_MAX_SIZE_MB : PORTFOLIO_PIC_MAX_SIZE_MB;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
     throw new Error(`File is too large. Max size for this field is ${maxSizeInMB}MB.`);
  }

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
    return { success: true, filePath: publicPath };
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file.');
  }
}

export async function deleteImage(filePath: string) {
    if (!filePath || !filePath.startsWith('/uploads/')) {
        console.warn('Skipping deletion for invalid or non-upload path:', filePath);
        return { success: true, message: 'No file to delete or path is invalid.' };
    }
    
    const serverFilePath = path.join(process.cwd(), 'public', filePath);
    
    try {
        await fs.unlink(serverFilePath);
        return { success: true, message: 'File deleted successfully.' };
    } catch (error: any) {
        if (error.code === 'ENOENT') {
             return { success: true, message: 'File did not exist, no action needed.' };
        }
        console.error(`Failed to delete file: ${serverFilePath}`, error);
        return { success: false, message: 'Failed to delete file.' };
    }
}
