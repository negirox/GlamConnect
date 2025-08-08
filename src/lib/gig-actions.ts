
'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, query, where, deleteDoc, orderBy } from 'firebase/firestore';

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

const APPLICATION_STATUSES = ['Applied', 'L1 Approved', 'L2 Approved', 'Director Approved', 'Selected', 'Rejected'] as const;
export type ApplicationStatus = typeof APPLICATION_STATUSES[number];

export type Application = {
    id: string;
    gigId: string;
    modelId: string;
    appliedDate: string;
    status: ApplicationStatus;
    updatedDate: string;
}

const gigsCollection = collection(db, 'gigs');
const applicationsCollection = collection(db, 'applications');


export async function createGig(gigData: Omit<Gig, 'id' | 'status'>) {
    const newGigRef = await addDoc(gigsCollection, {
        ...gigData,
        status: 'Pending',
    });
    
    await updateDoc(newGigRef, { id: newGigRef.id });

    revalidatePath('/gigs');
    revalidatePath('/brand/dashboard');
}

export async function getGigs(): Promise<Gig[]> {
    try {
        const q = query(gigsCollection, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const gigs: Gig[] = [];
        querySnapshot.forEach((doc) => {
            gigs.push({ id: doc.id, ...doc.data() } as Gig);
        });
        return gigs;
    } catch (error) {
        console.error('Error getting gigs:', error);
        return [];
    }
}

export async function getGigsByBrandId(brandId: string): Promise<Gig[]> {
    const allGigs = await getGigs();
    return allGigs.filter(gig => gig.brandId === brandId);
}

export async function getGigById(id: string): Promise<Gig | null> {
    try {
        const docRef = doc(db, 'gigs', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Gig;
        }
        return null;
    } catch(e) {
        console.error(e);
        return null;
    }
}

export async function updateGig(gigId: string, data: Partial<Gig>) {
    const gigRef = doc(db, 'gigs', gigId);
    await updateDoc(gigRef, data);

    revalidatePath('/admin/gig-approvals');
    revalidatePath(`/gigs`);
}

export async function applyForGig(gigId: string, modelId: string) {
    const q = query(applicationsCollection, where("gigId", "==", gigId), where("modelId", "==", modelId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        throw new Error('You have already applied for this gig.');
    }

    const now = new Date().toISOString();
    const newAppRef = await addDoc(applicationsCollection, {
        gigId,
        modelId,
        appliedDate: now,
        status: 'Applied',
        updatedDate: now,
    });

    await updateDoc(newAppRef, { id: newAppRef.id });

    revalidatePath(`/gigs`);
    revalidatePath('/brand/dashboard');
}

export async function getApplicantsByGigId(gigId: string): Promise<Application[]> {
    const q = query(applicationsCollection, where("gigId", "==", gigId));
    const querySnapshot = await getDocs(q);
    const applications: Application[] = [];
    querySnapshot.forEach(doc => {
        applications.push({ id: doc.id, ...doc.data() } as Application);
    });
    return applications;
}

export async function getApplicationsByModelId(modelId: string): Promise<Application[]> {
    const q = query(applicationsCollection, where("modelId", "==", modelId));
    const querySnapshot = await getDocs(q);
    const applications: Application[] = [];
    querySnapshot.forEach(doc => {
        applications.push({ id: doc.id, ...doc.data() } as Application);
    });
    return applications;
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
    const appRef = doc(db, 'applications', applicationId);
    await updateDoc(appRef, {
        status: status,
        updatedDate: new Date().toISOString(),
    });
    
    const appSnap = await getDoc(appRef);
    const appData = appSnap.data();

    revalidatePath('/brand/dashboard');
    if(appData) {
        revalidatePath(`/gigs/${appData.gigId}`);
    }
}

export async function deleteGig(gigId: string): Promise<{ success: boolean }> {
    const gigRef = doc(db, 'gigs', gigId);
    await deleteDoc(gigRef);

    const q = query(applicationsCollection, where("gigId", "==", gigId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
    });
    
    revalidatePath('/brand/dashboard');
    revalidatePath('/gigs');
    
    return { success: true };
}
