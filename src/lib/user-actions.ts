'use server';

import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const usersCsvFilePath = path.join(process.cwd(), 'public', 'users.csv');

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6), // In a real app, hash this!
  role: z.enum(['model', 'brand']),
});

type User = z.infer<typeof signupSchema> & { id: string };

// Helper to read and parse the users CSV
function readUsers(): { headers: string[], users: User[] } {
  if (!fs.existsSync(usersCsvFilePath)) {
    fs.writeFileSync(usersCsvFilePath, 'id,name,email,password,role\n', 'utf-8');
  }
  
  const csvData = fs.readFileSync(usersCsvFilePath, 'utf-8');
  const lines = csvData.trim().split('\n');
  if (lines.length < 1) return { headers: ['id', 'name', 'email', 'password', 'role'], users: [] };

  const headers = lines[0].split(',').map(h => h.trim());
  
  const users = lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      id: values[0],
      name: values[1],
      email: values[2],
      password: values[3],
      role: values[4],
    } as User;
  });

  return { headers, users };
}

// Helper to write data back to CSV
function writeUsers(headers: string[], users: User[]) {
    const headerString = headers.join(',');
    const rows = users.map(user => {
        return [user.id, user.name, user.email, user.password, user.role].join(',');
    });

    const csvString = [headerString, ...rows].join('\n');
    fs.writeFileSync(usersCsvFilePath, csvString, 'utf-8');
}


export async function createUser(userData: z.infer<typeof signupSchema>) {
    const validation = signupSchema.safeParse(userData);
    if (!validation.success) {
        throw new Error('Invalid user data.');
    }

    const { headers, users } = readUsers();
    
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        throw new Error('User with this email already exists.');
    }

    const newUser: User = {
        ...userData,
        id: (users.length + 1).toString(),
    };
    
    users.push(newUser);
    writeUsers(headers, users);

    revalidatePath('/login');
    revalidatePath('/signup');

    return { success: true, message: 'User created successfully.' };
}

export async function getUser(email: string) {
    // This is a placeholder. In a real app, you'd fetch user data.
    console.log(`Pretending to fetch user for email: ${email}`);
    return {
        name: 'Test User',
        email,
    }
}
