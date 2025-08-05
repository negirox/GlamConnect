
'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

export type SavedList = {
    id: string;
    brandId: string;
    name: string;
    modelIds: string[];
};

const csvFilePath = path.join(process.cwd(), 'public', 'saved-lists.csv');
const SAVED_LIST_HEADERS = ['id', 'brandId', 'name', 'modelIds'];

function readSavedLists(): SavedList[] {
    if (!fs.existsSync(csvFilePath)) {
        fs.writeFileSync(csvFilePath, SAVED_LIST_HEADERS.join(',') + '\n', 'utf-8');
        return [];
    }
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const entry = headers.reduce((obj, header, index) => {
            let value = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
            if (header === 'modelIds') {
                (obj as any)[header] = value ? value.split(';').map(s => s.trim()) : [];
            } else {
                (obj as any)[header] = value;
            }
            return obj;
        }, {} as SavedList);
        return entry;
    });
}

function writeSavedLists(lists: SavedList[]) {
    const headerString = SAVED_LIST_HEADERS.join(',');
    const rows = lists.map(list => {
        const modelIdsString = list.modelIds.join(';');
        return [list.id, list.brandId, list.name, `"${modelIdsString}"`].join(',');
    });
    const csvString = [headerString, ...rows].join('\n') + '\n';
    fs.writeFileSync(csvFilePath, csvString, 'utf-8');
}

export async function getListsByBrandId(brandId: string): Promise<SavedList[]> {
    const allLists = readSavedLists();
    return allLists.filter(list => list.brandId === brandId);
}

export async function getListById(listId: string): Promise<SavedList | null> {
    const allLists = readSavedLists();
    return allLists.find(list => list.id === listId) || null;
}

export async function createSavedList(brandId: string, name: string): Promise<SavedList> {
    const lists = readSavedLists();
    const newId = (lists.length > 0 ? Math.max(...lists.map(l => parseInt(l.id, 10))) : 0) + 1;
    const newList: SavedList = {
        id: newId.toString(),
        brandId,
        name,
        modelIds: [],
    };
    lists.push(newList);
    writeSavedLists(lists);
    revalidatePath('/brand/dashboard');
    return newList;
}

export async function addModelsToList(listId: string, modelIds: string[]): Promise<SavedList> {
    const lists = readSavedLists();
    const listIndex = lists.findIndex(l => l.id === listId);
    if (listIndex === -1) {
        throw new Error('List not found');
    }
    const list = lists[listIndex];
    const updatedModelIds = [...new Set([...list.modelIds, ...modelIds])];
    list.modelIds = updatedModelIds;
    writeSavedLists(lists);
    revalidatePath(`/brand/saved-lists/${listId}`);
    return list;
}

export async function removeModelFromList(listId: string, modelId: string): Promise<SavedList> {
    const lists = readSavedLists();
    const listIndex = lists.findIndex(l => l.id === listId);
    if (listIndex === -1) {
        throw new Error('List not found');
    }
    const list = lists[listIndex];
    list.modelIds = list.modelIds.filter(id => id !== modelId);
    writeSavedLists(lists);
    revalidatePath(`/brand/saved-lists/${listId}`);
    return list;
}
