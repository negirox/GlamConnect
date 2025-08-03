
'use server';

import fs from 'fs';
import path from 'path';
import type {Model} from './mock-data';

// Helper function to parse CSV data
function parseCSV(csv: string): Model[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(',')
    .map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // handle commas inside quotes
    const entry = headers.reduce(
      (obj, header, index) => {
        let value = values[index] ? values[index].trim().replace(/"/g, '') : '';

        if (
          [
            'height',
            'bust',
            'waist',
            'hips',
            'shoeSize',
            'weight',
          ].includes(header)
        ) {
          (obj as any)[header] = value ? parseInt(value, 10) : null;
        } else if (['tattoos', 'piercings', 'consentBikini', 'consentSemiNude', 'consentNude'].includes(header)) {
          (obj as any)[header] = value.toLowerCase() === 'true';
        } else if (
          header === 'portfolioImages' ||
          header === 'skills' ||
          header === 'socialLinks' ||
          header === 'bikiniPortfolioImages' ||
          header === 'semiNudePortfolioImages' ||
          header === 'nudePortfolioImages'
        ) {
          (obj as any)[header] = value ? value.split(';').map(s => s.trim()) : [];
        } else {
          (obj as any)[header] = value;
        }
        return obj;
      },
      {} as Model
    );
    return entry;
  });
}

const csvFilePath = path.join(process.cwd(), 'public', 'models.csv');

export async function getModels(): Promise<Model[]> {
  try {
    const csvData = fs.readFileSync(csvFilePath, 'utf-8');
    return parseCSV(csvData);
  } catch (error) {
    console.error('Error reading or parsing models.csv:', error);
    return [];
  }
}

export async function getModelById(id: string): Promise<Model | undefined> {
  const models = await getModels();
  return models.find(model => model.id === id);
}

export async function getModelByEmail(email: string): Promise<Model | undefined> {
    const models = await getModels();
    return models.find(model => model.email === email);
}

    
