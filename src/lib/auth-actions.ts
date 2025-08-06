
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { readUsers, readAdmins } from './user-actions';

type User = {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: 'model' | 'brand' | 'admin';
}


export async function getSession() {
  const session = cookies().get('session')?.value;
  if (!session) return { isLoggedIn: false };

  try {
     const userData = JSON.parse(session);
     return { isLoggedIn: true, ...userData };
  } catch (error) {
     return { isLoggedIn: false };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const { users: regularUsers } = await readUsers();
        const { users: adminUsers } = await readAdmins();

        const allUsers = [...regularUsers, ...adminUsers];
        const user = allUsers.find(u => u.email === email);

        if (!user || user.password !== password) {
            return 'Invalid email or password';
        }

        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        
        cookies().set('session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // One week
            path: '/',
        });

    } catch (error) {
        if ((error as Error).message.includes('credentialssignin')) {
            return 'CredentialSignin';
        }
        console.error(error);
        return 'An error occurred.';
    }

    const emailForRedirect = formData.get('email') as string;
    const { users: regularUsersRedirect } = await readUsers();
    const { users: adminUsersRedirect } = await readAdmins();
    const allUsersForRedirect = [...regularUsersRedirect, ...adminUsersRedirect];
    const userForRedirect = allUsersForRedirect.find(u => u.email === emailForRedirect);

    if (userForRedirect?.role === 'brand') {
        redirect('/brand/dashboard');
    } else if (userForRedirect?.role === 'admin') {
        redirect('/admin/dashboard');
    } else {
        redirect('/account/profile');
    }
}


export async function logout() {
  cookies().delete('session');
  redirect('/login');
}
