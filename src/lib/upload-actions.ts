
'use server';

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadImage(formData: FormData, maxSizeInMB: number) {
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, message: 'No file uploaded.' };
  }

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
     return { success: false, message: `File is too large. Max size is ${maxSizeInMB}MB.` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const storageRef = ref(storage, `uploads/${filename}`);

  try {
    const snapshot = await uploadBytes(storageRef, buffer, {
        contentType: file.type,
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, filePath: downloadURL };
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    return { success: false, message: 'Failed to upload file.' };
  }
}

export async function deleteImage(filePath: string) {
    if (!filePath || !filePath.includes('firebasestorage.googleapis.com')) {
        console.warn('Skipping deletion for invalid or non-firebase storage path:', filePath);
        return { success: true, message: 'No file to delete or path is invalid.' };
    }
    
    try {
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);
        return { success: true, message: 'File deleted successfully.' };
    } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
             return { success: true, message: 'File did not exist, no action needed.' };
        }
        console.error(`Failed to delete file from Firebase Storage: ${filePath}`, error);
        return { success: false, message: 'Failed to delete file.' };
    }
}
