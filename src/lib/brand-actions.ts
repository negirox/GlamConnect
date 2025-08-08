
'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

export type Brand = {
    id: string;
    name: string;
    email: string;
    industry: string;
    website: string;
    description: string;
    logo: string;
    verificationStatus: 'Verified' | 'Not Verified' | 'Pending';
    businessType: string;
    phoneNumber: string;
    addressStreet: string;
    addressCity: string;
    addressState: string;
    addressCountry: string;
    addressZip: string;
    socialLinks: string;
    contactPersonName: string;
    contactPersonRole: string;
    contactPersonEmail: string;
    contactPersonPhone: string;
}

const brandsCollection = collection(db, 'brands');

export async function createBrandForUser(brandData: Partial<Brand>) {
    if (!brandData.id || !brandData.email || !brandData.name) {
        throw new Error("Cannot create a brand profile with missing id, email or name.");
    }
    
    const brandRef = doc(db, 'brands', brandData.id);
    const brandSnap = await getDoc(brandRef);

    if (brandSnap.exists()) {
        return { success: true, message: 'Brand profile already exists.' };
    }

    const defaultBrand: Brand = {
        id: brandData.id,
        name: brandData.name,
        email: brandData.email,
        industry: '',
        website: '',
        description: '',
        logo: 'https://placehold.co/400x400.png',
        verificationStatus: 'Not Verified',
        businessType: '',
        phoneNumber: '',
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressCountry: '',
        addressZip: '',
        socialLinks: '',
        contactPersonName: '',
        contactPersonRole: '',
        contactPersonEmail: '',
        contactPersonPhone: '',
    };
    
    await setDoc(brandRef, defaultBrand);
    
    revalidatePath('/brand/profile');
    return { success: true, message: 'Brand profile created successfully.' };
}

export async function getBrandByEmail(email: string): Promise<Brand | null> {
    const q = query(brandsCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.empty) {
        return null;
    }
    const brandDoc = querySnapshot.docs[0];
    return { id: brandDoc.id, ...brandDoc.data() } as Brand;
}

export async function updateBrand(id: string, updatedData: Partial<Brand>) {
    try {
        const brandRef = doc(db, 'brands', id);
        await updateDoc(brandRef, updatedData);

        revalidatePath('/brand/profile/edit');
        revalidatePath('/brand/profile');
        revalidatePath(`/brand/dashboard`);

        return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
        console.error("Failed to update brand:", error);
        let message = 'An unknown error occurred';
        if (error instanceof Error) {
            message = error.message;
        }
        return { success: false, message };
    }
}
