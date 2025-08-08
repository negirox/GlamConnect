
'use server';

import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Model } from './mock-data';

const modelsCollection = collection(db, 'models');

export async function getModels(): Promise<Model[]> {
  try {
    const querySnapshot = await getDocs(modelsCollection);
    const models: Model[] = [];
    querySnapshot.forEach((doc) => {
        models.push({ id: doc.id, ...doc.data() } as Model);
    });
    return models;
  } catch (error) {
    console.error('Error getting models:', error);
    return [];
  }
}

export async function getModelById(id: string): Promise<Model | null> {
  try {
    const docRef = doc(db, 'models', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Model;
    } else {
      return null;
    }
  } catch(error) {
      console.error('Error getting model by ID:', error);
      return null;
  }
}

export async function getModelByEmail(email: string): Promise<Model | null> {
    try {
        const q = query(modelsCollection, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const modelDoc = querySnapshot.docs[0];
        return { id: modelDoc.id, ...modelDoc.data() } as Model;
    } catch(error) {
        console.error('Error getting model by email:', error);
        return null;
    }
}
