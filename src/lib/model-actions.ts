
'use server';

import { revalidatePath } from 'next/cache';
import { Model } from './mock-data';
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, getDoc, getDocs } from 'firebase/firestore';

const modelsCollection = collection(db, 'models');

export async function createModelForUser(modelData: Partial<Model>) {
    if (!modelData.id || !modelData.email || !modelData.name) {
        throw new Error("Cannot create a model profile with missing id, email or name.");
    }
    
    const modelRef = doc(db, 'models', modelData.id);
    const modelSnap = await getDoc(modelRef);

    if (modelSnap.exists()) {
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
        previousClients: [],
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
    
    await setDoc(modelRef, defaultModel);
    
    revalidatePath('/account/profile');
    return { success: true, message: 'Model profile created successfully.' };
}


export async function updateModel(id: string, updatedData: Partial<Model>) {
    try {
        const modelRef = doc(db, 'models', id);
        await updateDoc(modelRef, updatedData);

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
