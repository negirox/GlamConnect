
'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const gigsCsvFilePath = path.join(process.cwd(), 'public', 'gigs.csv');
const GIG_HEADERS = ['id', 'title', 'description', 'location', 'date', 'brandId', 'brandName'];

export type Gig = {
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    brandId: string;
    brandName: string;
}

function readGigs(): Gig[] {
    if(!fs.existsSync(gigsCsvFilePath)) {
        fs.writeFileSync(gigsCsvFilePath, GIG_HEADERS.join(',') + '\n', 'utf-8');
        return [];
    }

    const csvData = fs.readFileSync(gigsCsvFilePath, 'utf-8');
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const entry = headers.reduce((obj, header, index) => {
            (obj as any)[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
            return obj;
        }, {} as Gig);
        return entry;
    });
}

function writeGigs(gigs: Gig[]) {
    const headerString = GIG_HEADERS.join(',');
    const rows = gigs.map(gig => {
        return GIG_HEADERS.map(header => {
            const key = header as keyof Gig;
            let value = gig[key];
            
            let stringValue = String(value);
             if (stringValue.includes(',')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    });
    const csvString = [headerString, ...rows].join('\n') + '\n';
    fs.writeFileSync(gigsCsvFilePath, csvString, 'utf-8');
}


export async function createGig(gigData: Omit<Gig, 'id'>) {
    const gigs = readGigs();
    const newId = (gigs.length > 0 ? Math.max(...gigs.map(g => parseInt(g.id, 10))) : 0) + 1;
    
    const newGig: Gig = {
        ...gigData,
        id: newId.toString(),
    };

    gigs.push(newGig);
    writeGigs(gigs);

    revalidatePath('/gigs');
    revalidatePath('/brand/dashboard');
}


export async function getGigs(): Promise<Gig[]> {
    try {
        return readGigs().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error('Error reading or parsing gigs.csv:', error);
        return [];
    }
}
