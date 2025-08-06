'use server';

import fs from 'fs/promises';
import path from 'path';

// This function is designed to handle base64 encoded image uploads.
// It helps to bypass the payload size limitations of Next.js Server Actions.
export async function uploadBase64Image(base64Data: string, originalFileName: string, maxSizeInMB: number) {
  if (!base64Data) {
    return { success: false, message: 'No file data provided.' };
  }
  
  // Basic validation for data URI format
  const match = base64Data.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!match) {
      return { success: false, message: 'Invalid image format.' };
  }

  const buffer = Buffer.from(match[2], 'base64');
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (buffer.length > maxSizeInBytes) {
     return { success: false, message: `File is too large. Max size is ${maxSizeInMB}MB.` };
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      console.error('Error creating upload directory:', error);
      return { success: false, message: 'Could not create upload directory.' };
    }
  }

  const filename = `${Date.now()}-${originalFileName.replace(/\s+/g, '-')}`;
  const filePath = path.join(uploadDir, filename);

  try {
    await fs.writeFile(filePath, buffer);
    const publicPath = `/uploads/${filename}`;
    return { success: true, filePath: publicPath };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, message: 'Failed to save file.' };
  }
}
