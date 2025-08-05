
'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

export type SavedList = {
    id: string;
    name: string;
    brandId: string;
    modelIds: string[];
};

const savedListsCsvFilePath = path.join(process.cwd(), 'public', 'saved_lists.csv');

const SAVED_LIST_HEADERS = ['id', 'name', 'brandId', 'modelIds'];

function readSavedLists(): SavedList[] {
    if (!fs.existsSync(savedListsCsvFilePath)) {
        fs.writeFileSync(savedListsCsvFilePath, SAVED_LIST_HEADERS.join(',') + '\n', 'utf-8');
        return [];
    }

    const csvData = fs.readFileSync(savedListsCsvFilePath, 'utf-8');
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const entry: any = {};
        headers.forEach((header, index) => {
            const rawValue = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
            if (header === 'modelIds') {
                entry[header] = rawValue ? rawValue.split(';').map(s => s.trim()) : [];
            } else {
                entry[header] = rawValue;
            }
        });
        return entry as SavedList;
    });
}

function writeSavedLists(lists: SavedList[]) {
    const headerString = SAVED_LIST_HEADERS.join(',');
    const rows = lists.map(list => {
        const modelIdsString = list.modelIds.join(';');
        return [list.id, `"${list.name.replace(/"/g, '""')}"`, list.brandId, `"${modelIdsString}"`].join(',');
    });
    const csvString = [headerString, ...rows].join('\n') + '\n';
    fs.writeFileSync(savedListsCsvFilePath, csvString, 'utf-8');
}

export async function getListsByBrandId(brandId: string): Promise<SavedList[]> {
    const allLists = readSavedLists();
    return allLists.filter(list => list.brandId === brandId);
}

export async function getListById(id: string): Promise<SavedList | null> {
    const allLists = readSavedLists();
    return allLists.find(list => list.id === id) || null;
}

export async function createList(brandId: string, listName: string, modelId?: string) {
    const lists = readSavedLists();
    
    const brandLists = lists.filter(l => l.brandId === brandId);
    if (brandLists.some(l => l.name.toLowerCase() === listName.toLowerCase())) {
        throw new Error(`A list with the name "${listName}" already exists.`);
    }

    const newId = (lists.length > 0 ? Math.max(...lists.map(l => parseInt(l.id, 10))) : 0) + 1;

    const newList: SavedList = {
        id: newId.toString(),
        name: listName,
        brandId: brandId,
        modelIds: modelId ? [modelId] : [],
    };

    lists.push(newList);
    writeSavedLists(lists);

    revalidatePath('/brand/dashboard');
    if(modelId) revalidatePath(`/profile/${modelId}`);

    return newList;
}

export async function addModelToList(listId: string, modelId: string) {
    const lists = readSavedLists();
    const listIndex = lists.findIndex(l => l.id === listId);

    if (listIndex === -1) {
        throw new Error('List not found');
    }

    if (!lists[listIndex].modelIds.includes(modelId)) {
        lists[listIndex].modelIds.push(modelId);
        writeSavedLists(lists);
        revalidatePath('/brand/dashboard');
        revalidatePath(`/profile/${modelId}`);
        revalidatePath(`/brand/saved-lists/${listId}`);
    } else {
        throw new Error('Model is already in this list.');
    }
}

export async function removeModelFromList(listId: string, modelId: string) {
    const lists = readSavedLists();
    const listIndex = lists.findIndex(l => l.id === listId);

    if (listIndex === -1) {
        throw new Error('List not found');
    }

    const modelIndexInList = lists[listIndex].modelIds.indexOf(modelId);
    if (modelIndexInList > -1) {
        lists[listIndex].modelIds.splice(modelIndexInList, 1);
        writeSavedLists(lists);
        revalidatePath(`/brand/saved-lists/${listId}`);
        revalidatePath('/brand/dashboard');
    } else {
        throw new Error('Model not found in this list.');
    }
}

export async function deleteList(listId: string) {
    let lists = readSavedLists();
    const initialLength = lists.length;
    lists = lists.filter(l => l.id !== listId);

    if (lists.length === initialLength) {
        throw new Error('List not found to delete.');
    }

    writeSavedLists(lists);
    revalidatePath('/brand/dashboard');
    revalidatePath(`/brand/saved-lists/${listId}`);
}
