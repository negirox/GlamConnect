
'use server';

import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createModelForUser } from './model-actions';
import type { Model } from './mock-data';

const usersCsvFilePath = path.join(process.cwd(), 'public', 'users.csv');

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["model", "brand"], {
    required_error: "You need to select a role.",
  }),
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
  if (headers.length === 0 || headers[0] === '') {
      return { headers: ['id', 'name', 'email', 'password', 'role'], users: [] };
  }
  
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
    
    const newId = (users.length > 0 ? Math.max(...users.map(u => parseInt(u.id, 10))) : 0) + 1;

    const newUser: User = {
        ...userData,
        id: newId.toString(),
    };
    
    users.push(newUser);
    writeUsers(headers, users);

    // If the new user is a model, create a corresponding model profile
    if (newUser.role === 'model') {
        const newModelData: Partial<Model> = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
        };
        await createModelForUser(newModelData);
    }

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
