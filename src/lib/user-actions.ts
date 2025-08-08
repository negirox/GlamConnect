
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createModelForUser, updateModel as updateModelProfile } from './model-actions';
import { createBrandForUser, updateBrand as updateBrandProfile } from './brand-actions';
import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';

const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["model", "brand", "admin"]),
  status: z.enum(["active", "inactive"]),
});

export type User = z.infer<typeof userSchema>;

const usersCollection = collection(db, 'users');

async function getAllUsersFromFirestore(): Promise<User[]> {
    const querySnapshot = await getDocs(usersCollection);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as User);
    });
    return users;
}

export async function readUsers(): Promise<{ users: User[] }> {
    const users = (await getAllUsersFromFirestore()).filter(u => u.role !== 'admin');
    return { users };
}

export async function readAdmins(): Promise<{ users: User[] }> {
    const users = (await getAllUsersFromFirestore()).filter(u => u.role === 'admin');
    return { users };
}

export async function createUser(userData: Omit<User, 'id' | 'status'> & { agreeToTerms?: boolean }) {
    const signupSchema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["model", "brand", "admin"]),
    });

    const validation = signupSchema.safeParse(userData);
    if (!validation.success) {
        throw new Error('Invalid user data.');
    }

    const q = query(usersCollection, where("email", "==", userData.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        throw new Error('User with this email already exists.');
    }

    // Firestore can autogenerate IDs, so we'll do that.
    const newUserRef = doc(usersCollection);
    const newUser: User = {
        ...userData,
        id: newUserRef.id,
        status: 'active',
    };

    await setDoc(newUserRef, newUser);

    if (newUser.role === 'model') {
        await createModelForUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    } else if (newUser.role === 'brand') {
        await createBrandForUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    }

    revalidatePath('/admin/users');

    return { success: true, message: 'User created successfully.', user: newUser };
}

export async function updateUser(userId: string, data: Partial<User>) {
    const userRef = doc(db, "users", userId);

    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
         throw new Error('User not found');
    }

    await updateDoc(userRef, data);
    
    // Also update associated model/brand profile if name changes
    if (data.name) {
        const user = userSnap.data();
        if(user.role === 'model') await updateModelProfile(userId, { name: data.name });
        if(user.role === 'brand') await updateBrandProfile(userId, { name: data.name });
    }

    revalidatePath('/admin/users');
}


export async function getUser(email: string): Promise<User | null> {
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function getAllUsers(): Promise<User[]> {
    return await getAllUsersFromFirestore();
}
