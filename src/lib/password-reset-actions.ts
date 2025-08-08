
'use server';

import { readUsers, readAdmins } from './user-actions';
import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, orderBy } from 'firebase/firestore';

export type PasswordResetRequest = {
    id: string;
    email: string;
    phone?: string;
    contactMethod: 'email' | 'phone';
    requestedAt: string;
    status: 'pending' | 'completed' | 'rejected';
};

const passwordResetsCollection = collection(db, 'password_resets');

export async function readPasswordResetRequests(): Promise<PasswordResetRequest[]> {
    const q = query(passwordResetsCollection, orderBy("requestedAt", "desc"));
    const querySnapshot = await getDocs(q);
    const requests: PasswordResetRequest[] = [];
    querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as PasswordResetRequest);
    });
    return requests;
}


export async function requestPasswordReset(data: { email: string; phone?: string; contactMethod: 'email' | 'phone' }) {
    const { users: regularUsers } = await readUsers();
    const { users: adminUsers } = await readAdmins();
    const allUsers = [...regularUsers, ...adminUsers];

    const userExists = allUsers.some(u => u.email === data.email);

    if (!userExists) {
        console.log(`Password reset requested for non-existent email: ${data.email}`);
        return { success: true };
    }
    
    const newRequestData = {
        ...data,
        requestedAt: new Date().toISOString(),
        status: 'pending' as const,
    };

    await addDoc(passwordResetsCollection, newRequestData);
    
    return { success: true };
}

export async function updatePasswordResetStatus(
    requestId: string,
    newStatus: 'completed' | 'rejected'
) {
    const requestRef = doc(db, 'password_resets', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
        throw new Error("Password reset request not found.");
    }

    await updateDoc(requestRef, { status: newStatus });

    revalidatePath('/admin/password-resets');
    
    return { success: true, message: `Request status updated to ${newStatus}.` };
}

// In password-resets/page.tsx, the handleStatusUpdate function needs to be updated.
// It was using email+requestedAt as a key, but now it should use the document ID.

// Old call:
// handleStatusUpdate(req, 'completed')
// const id = `${request.email}-${request.requestedAt}`;

// New call in page.tsx should be:
// handleStatusUpdate(req.id, 'completed')
