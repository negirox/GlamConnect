
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const usersCsvFilePath = path.join(process.cwd(), 'public', 'users.csv');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type User = {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: 'model' | 'brand';
}


function readUsers(): User[] {
  if (!fs.existsSync(usersCsvFilePath)) {
    return [];
  }
  const csvData = fs.readFileSync(usersCsvFilePath, 'utf-8');
  const lines = csvData.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const emailIndex = headers.indexOf('email');
  const passwordIndex = headers.indexOf('password');
  const idIndex = headers.indexOf('id');
  const nameIndex = headers.indexOf('name');
  const roleIndex = headers.indexOf('role');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      id: values[idIndex],
      name: values[nameIndex],
      email: values[emailIndex],
      password: values[passwordIndex],
      role: values[roleIndex] as 'model' | 'brand',
    };
  });
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

export async function login(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password } = validatedFields.data;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user || user.password !== password) {
    return { error: 'Invalid email or password' };
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

  return { success: 'Logged in!' };
}

export async function logout() {
  cookies().delete('session');
  redirect('/login');
}
