
'use server';

import fs from 'fs/promises';
import path from 'path';

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
            // File doesn't exist, which is fine.
             return { success: true, message: 'File did not exist, no action needed.' };
        }
        console.error(`Failed to delete file: ${serverFilePath}`, error);
        // We don't throw an error here to prevent the entire upload process from failing
        // if an old file can't be deleted for some reason.
        return { success: false, message: 'Failed to delete file.' };
    }
}
