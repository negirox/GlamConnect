
'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, query, where, deleteDoc } from 'firebase/firestore';

export type SavedList = {
    id: string;
    brandId: string;
    name: string;
    modelIds: string[];
};

const savedListsCollection = collection(db, 'saved-lists');


export async function getListsByBrandId(brandId: string): Promise<SavedList[]> {
    const q = query(savedListsCollection, where("brandId", "==", brandId));
    const querySnapshot = await getDocs(q);
    const lists: SavedList[] = [];
    querySnapshot.forEach(doc => {
        lists.push({ id: doc.id, ...doc.data() } as SavedList);
    });
    return lists;
}

export async function getListById(listId: string): Promise<SavedList | null> {
    const docRef = doc(db, 'saved-lists', listId);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return {id: docSnap.id, ...docSnap.data()} as SavedList;
    }
    return null;
}

export async function createSavedList(brandId: string, name: string): Promise<SavedList> {
    const newListData = {
        brandId,
        name,
        modelIds: [],
    };
    const newDocRef = await addDoc(savedListsCollection, newListData);
    const newList = { id: newDocRef.id, ...newListData };
    await updateDoc(newDocRef, {id: newDocRef.id});
    
    revalidatePath('/brand/dashboard');
    return newList;
}

export async function deleteList(listId: string): Promise<{ success: boolean }> {
    const listRef = doc(db, 'saved-lists', listId);
    await deleteDoc(listRef);
    revalidatePath('/brand/dashboard');
    return { success: true };
}


export async function addModelsToList(listId: string, modelIdsToAdd: string[]): Promise<SavedList> {
    const listRef = doc(db, 'saved-lists', listId);
    const listSnap = await getDoc(listRef);
    if (!listSnap.exists()) {
        throw new Error('List not found');
    }
    const list = listSnap.data() as SavedList;
    
    const updatedModelIds = [...new Set([...list.modelIds, ...modelIdsToAdd])];
    
    await updateDoc(listRef, { modelIds: updatedModelIds });

    revalidatePath('/brand/dashboard');
    return { ...list, id: listId, modelIds: updatedModelIds };
}

export async function removeModelFromList(listId: string, modelIdToRemove: string): Promise<SavedList> {
    const listRef = doc(db, 'saved-lists', listId);
    const listSnap = await getDoc(listRef);
    if (!listSnap.exists()) {
        throw new Error('List not found');
    }
    const list = listSnap.data() as SavedList;

    const updatedModelIds = list.modelIds.filter(id => id !== modelIdToRemove);
    await updateDoc(listRef, { modelIds: updatedModelIds });

    revalidatePath('/brand/dashboard');
    return { ...list, id: listId, modelIds: updatedModelIds };
}
