
'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const gigsCsvFilePath = path.join(process.cwd(), 'public', 'gigs.csv');
const applicationsCsvFilePath = path.join(process.cwd(), 'public', 'applications.csv');

const GIG_HEADERS = [
    'id', 'title', 'description', 'location', 'date', 'brandId', 'brandName',
    'projectType', 'genderPreference', 'modelsNeeded', 'isGroupShoot', 'timing',
    'travelProvided', 'accommodationProvided', 'paymentType', 'budgetMin', 
    'budgetMax', 'paymentMode', 'paymentTimeline', 'ageRangeMin', 'ageRangeMax',
    'heightRangeMin', 'heightRangeMax', 'experienceLevel', 'bodyTypePreferences',
    'consentRequired', 'languageRequirement', 'portfolioLinkRequired',
    'moodBoardUrl', 'referenceImages', 'videoBriefLink', 'visibility',
    'applicationDeadline', 'allowDirectMessaging', 'showBrandName', 'status'
];

export type Gig = {
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    brandId: string;
    brandName: string;
    projectType: string;
    genderPreference: 'Male' | 'Female' | 'Trans' | 'Any';
    modelsNeeded: number;
    isGroupShoot?: boolean;
    timing: string;
    travelProvided?: boolean;
    accommodationProvided?: boolean;
    paymentType: 'Paid' | 'TFP' | 'Exposure';
    budgetMin?: number;
    budgetMax?: number;
    paymentMode?: 'Bank' | 'Cash' | 'UPI' | 'Other';
    paymentTimeline?: string;
    ageRangeMin?: number;
    ageRangeMax?: number;
    heightRangeMin?: number;
    heightRangeMax?: number;
    experienceLevel?: 'Newcomer' | '1-3 years' | '3+ years';
    bodyTypePreferences?: string[];
    consentRequired?: ('Bikini' | 'Semi-Nude' | 'Nude')[];
    languageRequirement?: string[];
    portfolioLinkRequired?: boolean;
    moodBoardUrl?: string;
    referenceImages?: string[];
    videoBriefLink?: string;
    visibility?: 'Public' | 'Private' | 'Premium only';
    applicationDeadline: string;
    allowDirectMessaging?: boolean;
    showBrandName?: boolean;
    status: 'Pending' | 'Verified' | 'Rejected';
}

export const APPLICATION_STATUSES = ['Applied', 'L1 Approved', 'L2 Approved', 'Director Approved', 'Selected', 'Rejected'] as const;
export type ApplicationStatus = typeof APPLICATION_STATUSES[number];

export type Application = {
    id: string;
    gigId: string;
    modelId: string;
    appliedDate: string;
    status: ApplicationStatus;
    updatedDate: string;
}

const APPLICATION_HEADERS = ['id', 'gigId', 'modelId', 'appliedDate', 'status', 'updatedDate'];


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
            const rawValue = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
            if (['modelsNeeded', 'budgetMin', 'budgetMax', 'ageRangeMin', 'ageRangeMax', 'heightRangeMin', 'heightRangeMax'].includes(header)) {
                (obj as any)[header] = rawValue ? parseInt(rawValue, 10) : undefined;
            } else if (['isGroupShoot', 'travelProvided', 'accommodationProvided', 'portfolioLinkRequired', 'allowDirectMessaging', 'showBrandName'].includes(header)) {
                (obj as any)[header] = rawValue.toLowerCase() === 'true';
            } else if (['bodyTypePreferences', 'consentRequired', 'languageRequirement', 'referenceImages'].includes(header)) {
                (obj as any)[header] = rawValue ? rawValue.split(';').map(s => s.trim()) : [];
            } else {
                 (obj as any)[header] = rawValue;
            }
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
            
            if (Array.isArray(value)) {
                return `"${value.join(';')}"`;
            }
            if (value === null || value === undefined) {
                return '';
            }

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


export async function createGig(gigData: Omit<Gig, 'id' | 'status'>) {
    const gigs = readGigs();
    const newId = (gigs.length > 0 ? Math.max(...gigs.map(g => parseInt(g.id, 10))) : 0) + 1;
    
    const newGig: Gig = {
        ...gigData,
        id: newId.toString(),
        status: 'Pending',
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

export async function getGigsByBrandId(brandId: string): Promise<Gig[]> {
    const allGigs = await getGigs();
    return allGigs.filter(gig => gig.brandId === brandId);
}

export async function getGigById(id: string): Promise<Gig | null> {
    const allGigs = await getGigs();
    return allGigs.find(gig => gig.id === id) || null;
}

export async function updateGig(gigId: string, data: Partial<Gig>) {
    const gigs = readGigs();
    const gigIndex = gigs.findIndex(g => g.id === gigId);

    if (gigIndex === -1) {
        throw new Error('Gig not found');
    }

    gigs[gigIndex] = { ...gigs[gigIndex], ...data };
    writeGigs(gigs);

    revalidatePath('/admin/gig-approvals');
    revalidatePath(`/gigs`);
}

// Application Functions

function readApplications(): Application[] {
    if(!fs.existsSync(applicationsCsvFilePath)) {
        fs.writeFileSync(applicationsCsvFilePath, APPLICATION_HEADERS.join(',') + '\n', 'utf-8');
        return [];
    }
    const csvData = fs.readFileSync(applicationsCsvFilePath, 'utf-8');
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) return [];

    return lines.slice(1).map(line => {
        const [id, gigId, modelId, appliedDate, status, updatedDate] = line.split(',');
        return { id, gigId, modelId, appliedDate, status: status as ApplicationStatus, updatedDate };
    });
}

function writeApplications(applications: Application[]) {
    const headerString = APPLICATION_HEADERS.join(',');
    const rows = applications.map(app => [app.id, app.gigId, app.modelId, app.appliedDate, app.status, app.updatedDate].join(','));
    const csvString = [headerString, ...rows].join('\n') + '\n';
    fs.writeFileSync(applicationsCsvFilePath, csvString, 'utf-8');
}

export async function applyForGig(gigId: string, modelId: string) {
    const applications = readApplications();
    const existingApplication = applications.find(app => app.gigId === gigId && app.modelId === modelId);

    if (existingApplication) {
        throw new Error('You have already applied for this gig.');
    }
    const newId = (applications.length > 0 ? Math.max(...applications.map(app => parseInt(app.id))) : 0) + 1;
    const now = new Date().toISOString();

    const newApplication: Application = {
        id: newId.toString(),
        gigId,
        modelId,
        appliedDate: now,
        status: 'Applied',
        updatedDate: now,
    };

    applications.push(newApplication);
    writeApplications(applications);

    revalidatePath(`/gigs`);
    revalidatePath('/brand/dashboard');
}

export async function getApplicantsByGigId(gigId: string): Promise<Application[]> {
    const applications = readApplications();
    return applications.filter(app => app.gigId === gigId);
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
    const applications = readApplications();
    const appIndex = applications.findIndex(app => app.id === applicationId);
    if(appIndex === -1) {
        throw new Error("Application not found");
    }
    applications[appIndex].status = status;
    applications[appIndex].updatedDate = new Date().toISOString();
    writeApplications(applications);

    revalidatePath('/brand/dashboard');
    revalidatePath(`/gigs/${applications[appIndex].gigId}`);
}

export async function deleteGig(gigId: string): Promise<{ success: boolean }> {
    let gigs = readGigs();
    let applications = readApplications();
    
    const initialGigsLength = gigs.length;
    gigs = gigs.filter(g => g.id !== gigId);

    if (gigs.length === initialGigsLength) {
        throw new Error('Gig not found');
    }

    applications = applications.filter(app => app.gigId !== gigId);
    
    writeGigs(gigs);
    writeApplications(applications);
    
    revalidatePath('/brand/dashboard');
    revalidatePath('/gigs');
    
    return { success: true };
}
