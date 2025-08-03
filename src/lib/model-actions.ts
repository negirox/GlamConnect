
'use server';

import fs from 'fs';
import path from 'path';
import { Model } from './mock-data';
import { revalidatePath } from 'next/cache';

const csvFilePath = path.join(process.cwd(), 'public', 'models.csv');

const ALL_MODEL_HEADERS = [
    'id', 'name', 'email', 'location', 'locationPrefs', 'bio', 'genderIdentity', 
    'dateOfBirth', 'nationality', 'spokenLanguages', 'height', 'weight', 'bust', 
    'waist', 'hips', 'cupSize', 'skinTone', 'dressSize', 'shoeSize', 'eyeColor', 
    'hairColor', 'ethnicity', 'tattoos', 'tattoosDescription', 'piercings', 
    'piercingsDescription', 'scars', 'braces', 'experience', 'yearsOfExperience', 
    'modelingWork', 'previousClients', 'agencyRepresented', 'agencyName', 
    'portfolioLink', 'availability', 'availableForBookings', 'willingToTravel', 
    'preferredRegions', 'timeAvailability', 'hourlyRate', 'dayRate', 'tfp', 
    'portfolioImages', 'profilePicture', 'skills', 'socialLinks', 'consentBikini', 
    'consentSemiNude', 'consentNude', 'bikiniPortfolioImages', 
    'semiNudePortfolioImages', 'nudePortfolioImages', 'verificationStatus'
];

// Helper to read and parse the CSV
function readModels(): { headers: string[], models: Model[] } {
  if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, ALL_MODEL_HEADERS.join(',') + '\n', 'utf-8');
  }

  const csvData = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvData.trim().split('\n');
  
  if (lines.length === 0 || lines[0].trim() === '') {
     fs.writeFileSync(csvFilePath, ALL_MODEL_HEADERS.join(',') + '\n', 'utf-8');
     return { headers: ALL_MODEL_HEADERS, models: [] };
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const models = lines.slice(1).map(line => {
    if(line.trim() === '') return null;
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const entry = headers.reduce((obj, header, index) => {
        let value = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
         if ([
            'height', 'bust', 'waist', 'hips', 'shoeSize', 'weight', 
            'yearsOfExperience', 'hourlyRate', 'dayRate'
        ].includes(header)) {
            (obj as any)[header] = value ? parseInt(value, 10) : undefined;
        } else if ([
            'tattoos', 'piercings', 'consentBikini', 'consentSemiNude', 'consentNude', 
            'braces', 'agencyRepresented', 'availableForBookings', 'willingToTravel', 'tfp'
        ].includes(header)) {
            (obj as any)[header] = value.toLowerCase() === 'true';
        } else if ([
            'portfolioImages', 'skills', 'socialLinks', 'bikiniPortfolioImages', 
            'semiNudePortfolioImages', 'nudePortfolioImages', 'spokenLanguages', 
            'modelingWork', 'timeAvailability'
        ].includes(header)) {
            (obj as any)[header] = value ? value.split(';').map(s => s.trim()) : [];
        } else {
            (obj as any)[header] = value;
        }
        return obj;
    }, {} as Model);
    return entry;
  }).filter(m => m !== null) as Model[];

  return { headers: ALL_MODEL_HEADERS, models };
}

// Helper to write data back to CSV
function writeModels(models: Model[]) {
    const headerString = ALL_MODEL_HEADERS.join(',');
    const rows = models.map(model => {
        return ALL_MODEL_HEADERS.map(header => {
            const key = header as keyof Model;
            let value = model[key];

            if (Array.isArray(value)) {
                return `"${value.join(';')}"`;
            }
             if (value === null || value === undefined) {
                return '';
            }
            let stringValue = String(value);
            if (stringValue.includes(',')) {
                return `"${stringValue}"`;
            }
            return stringValue;
        }).join(',');
    });

    const csvString = [headerString, ...rows].join('\n') + '\n';
    fs.writeFileSync(csvFilePath, csvString, 'utf-8');
}

export async function createModelForUser(modelData: Partial<Model>) {
    if (!modelData.id || !modelData.email || !modelData.name) {
        throw new Error("Cannot create a model profile with missing id, email or name.");
    }
    
    const { models } = readModels();

    const existingModel = models.find(m => m.email === modelData.email);
    if (existingModel) {
        return { success: true, message: 'Model profile already exists.' };
    }

    const defaultModel: Model = {
        id: modelData.id,
        name: modelData.name,
        email: modelData.email,
        location: '',
        locationPrefs: '',
        bio: '',
        genderIdentity: '',
        dateOfBirth: '',
        nationality: '',
        spokenLanguages: [],
        height: 0,
        weight: undefined,
        bust: 0,
        waist: 0,
        hips: 0,
        shoeSize: 0,
        cupSize: '',
        skinTone: '',
        dressSize: '',
        eyeColor: '',
        hairColor: '',
        ethnicity: '',
        tattoos: false,
        tattoosDescription: '',
        piercings: false,
        piercingsDescription: '',
        scars: '',
        braces: false,
        experience: 'New Face',
        yearsOfExperience: 0,
        modelingWork: [],
        previousClients: '',
        agencyRepresented: false,
        agencyName: '',
        portfolioLink: '',
        availability: 'By Project',
        availableForBookings: false,
        willingToTravel: false,
        preferredRegions: '',
        timeAvailability: [],
        hourlyRate: undefined,
        dayRate: undefined,
        tfp: false,
        portfolioImages: ['https://placehold.co/600x800.png'],
        profilePicture: 'https://placehold.co/600x800.png',
        skills: [],
        socialLinks: [],
        consentBikini: false,
        consentSemiNude: false,
        consentNude: false,
        bikiniPortfolioImages: [],
        semiNudePortfolioImages: [],
        nudePortfolioImages: [],
        verificationStatus: 'Not Verified',
    };
    
    models.push(defaultModel);
    writeModels(models);
    
    revalidatePath('/account/profile');
    return { success: true, message: 'Model profile created successfully.' };
}


export async function updateModel(id: string, updatedData: Partial<Model>) {
    try {
        const { models } = readModels();
        
        const modelIndex = models.findIndex(m => m.id === id);
        if (modelIndex === -1) {
            throw new Error('Model not found');
        }

        const updatedModel = { ...models[modelIndex], ...updatedData };
        models[modelIndex] = updatedModel;
        
        writeModels(models);

        revalidatePath('/account/profile/edit');
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
