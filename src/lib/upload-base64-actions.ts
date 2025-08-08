
'use server';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadBase64Image(base64Data: string, originalFileName: string, maxSizeInMB: number) {
  if (!base64Data) {
    return { success: false, message: 'No file data provided.' };
  }
  
  const match = base64Data.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!match) {
      return { success: false, message: 'Invalid image format.' };
  }

  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (buffer.length > maxSizeInBytes) {
     return { success: false, message: `File is too large. Max size is ${maxSizeInMB}MB.` };
  }

  const filename = `${Date.now()}-${originalFileName.replace(/\s+/g, '-')}`;
  const storageRef = ref(storage, `uploads/${filename}`);

  try {
    const snapshot = await uploadBytes(storageRef, buffer, { contentType });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, filePath: downloadURL };
  } catch (error) {
    console.error('Error uploading base64 file to Firebase Storage:', error);
    return { success: false, message: 'Failed to save file.' };
  }
}
