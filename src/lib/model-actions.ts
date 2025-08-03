
'use server';

import fs from 'fs';
import path from 'path';
import { Model } from './mock-data';
import { revalidatePath } from 'next/cache';

const csvFilePath = path.join(process.cwd(), 'public', 'models.csv');

// Helper to read and parse the CSV
function readModels(): { headers: string[], models: Model[] } {
  const csvData = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return { headers: [], models: [] };

  const headers = lines[0].split(',').map(h => h.trim());
  
  const models = lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const entry = headers.reduce((obj, header, index) => {
        let value = values[index] ? values[index].trim().replace(/"/g, '') : '';
         if (['height', 'bust', 'waist', 'hips', 'shoeSize', 'weight'].includes(header)) {
            (obj as any)[header] = value ? parseInt(value, 10) : null;
        } else if (['tattoos', 'piercings', 'consentBikini', 'consentSemiNude', 'consentNude'].includes(header)) {
            (obj as any)[header] = value.toLowerCase() === 'true';
        } else if (['portfolioImages', 'skills', 'socialLinks', 'bikiniPortfolioImages', 'semiNudePortfolioImages', 'nudePortfolioImages'].includes(header)) {
            (obj as any)[header] = value ? value.split(';').map(s => s.trim()) : [];
        } else {
            (obj as any)[header] = value;
        }
        return obj;
    }, {} as Model);
    return entry;
  });

  return { headers, models };
}

// Helper to write data back to CSV
function writeModels(headers: string[], models: Model[]) {
    const headerString = headers.join(',');
    const rows = models.map(model => {
        return headers.map(header => {
            const key = header as keyof Model;
            let value = model[key];

            if (Array.isArray(value)) {
                return `"${value ? value.join(';') : ''}"`;
            }
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            if (value === null || value === undefined) {
                return '';
            }
            return value;
        }).join(',');
    });

    const csvString = [headerString, ...rows].join('\n');
    fs.writeFileSync(csvFilePath, csvString, 'utf-8');
}

export async function createModelForUser(modelData: Partial<Model>) {
    if (!modelData.id || !modelData.email || !modelData.name) {
        throw new Error("Cannot create a model profile with missing id, email or name.");
    }
    
    const { headers, models } = readModels();

    const existingModel = models.find(m => m.email === modelData.email);
    if (existingModel) {
        // Model profile already exists, which is fine.
        return { success: true, message: 'Model profile already exists.' };
    }

    const defaultModel: Model = {
        id: modelData.id,
        name: modelData.name,
        email: modelData.email,
        location: '',
        locationPrefs: '',
        bio: '',
        height: 0,
        weight: undefined,
        bust: 0,
        waist: 0,
        hips: 0,
        shoeSize: 0,
        eyeColor: '',
        hairColor: '',
        ethnicity: '',
        tattoos: false,
        piercings: false,
        experience: 'New Face',
        availability: 'By Project',
        portfolioImages: [],
        profilePicture: 'https://placehold.co/600x800.png',
        skills: [],
        socialLinks: [],
        consentBikini: false,
        consentSemiNude: false,
        consentNude: false,
        bikiniPortfolioImages: [],
        semiNudePortfolioImages: [],
        nudePortfolioImages: [],
    };
    
    models.push(defaultModel);
    writeModels(headers, models);
    
    revalidatePath('/account/profile');
    return { success: true, message: 'Model profile created successfully.' };
}


export async function updateModel(id: string, updatedData: Partial<Model>) {
    try {
        const { headers, models } = readModels();
        
        const modelIndex = models.findIndex(m => m.id === id);
        if (modelIndex === -1) {
            throw new Error('Model not found');
        }

        // Merge the updated data
        const updatedModel = { ...models[modelIndex], ...updatedData };
        models[modelIndex] = updatedModel;
        
        writeModels(headers, models);

        // Revalidate paths to reflect changes
        revalidatePath('/account/profile');
        revalidatePath(`/profile/${id}`);

        return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
        console.error("Failed to update model:", error);
        let message = 'An unknown error occurred';
        if (error instanceof Error) {
            message = error.message;
        }
        return { success: false, message };
    }
}
