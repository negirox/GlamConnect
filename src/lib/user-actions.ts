
'use server';

import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createModelForUser } from './model-actions';
import { createBrandForUser } from './brand-actions';
import type { Model } from './mock-data';

const usersCsvFilePath = path.join(process.cwd(), 'public', 'users.csv');
const adminCsvFilePath = path.join(process.cwd(), 'public', 'admincredentials.csv');

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["model", "brand", "admin"], {
    required_error: "You need to select a role.",
  }),
});

type User = z.infer<typeof signupSchema> & { id: string };

// Helper to read and parse the general users CSV
export async function readUsers(): Promise<{ headers: string[], users: User[] }> {
  if (!fs.existsSync(usersCsvFilePath)) {
    fs.writeFileSync(usersCsvFilePath, 'id,name,email,password,role\n', 'utf-8');
  }
  
  const csvData = fs.readFileSync(usersCsvFilePath, 'utf-8');
  const lines = csvData.trim().split('\n');
  const headers = (lines.length > 0 && lines[0].trim() !== '') ? lines[0].split(',').map(h => h.trim()) : ['id', 'name', 'email', 'password', 'role'];
  
  const users = lines.slice(1).map(line => {
    if(line.trim() === '') return null;
    const values = line.split(',');
    return {
      id: values[0],
      name: values[1],
      email: values[2],
      password: values[3],
      role: values[4] as 'model' | 'brand',
    } as User;
  }).filter(u => u !== null) as User[];

  return { headers, users };
}

// Helper to read and parse the admin users CSV
export async function readAdmins(): Promise<{ headers: string[], users: User[] }> {
  if (!fs.existsSync(adminCsvFilePath)) {
    fs.writeFileSync(adminCsvFilePath, 'id,name,email,password,role\n', 'utf-8');
    fs.appendFileSync(adminCsvFilePath, '1,Admin,admin@glamconnect.com,password123,admin\n');
  }
  
  const csvData = fs.readFileSync(adminCsvFilePath, 'utf-8');
  const lines = csvData.trim().split('\n');
  const headers = (lines.length > 0 && lines[0].trim() !== '') ? lines[0].split(',').map(h => h.trim()) : ['id', 'name', 'email', 'password', 'role'];

  if (lines.length <= 1) { // If only header or empty, add default admin
     fs.appendFileSync(adminCsvFilePath, '1,Admin,admin@glamconnect.com,password123,admin\n');
     lines.push('1,Admin,admin@glamconnect.com,password123,admin');
  }
  
  const users = lines.slice(1).map(line => {
    if(line.trim() === '') return null;
    const values = line.split(',');
    return {
      id: values[0],
      name: values[1],
      email: values[2],
      password: values[3],
      role: 'admin',
    } as User;
  }).filter(u => u !== null) as User[];

  return { headers, users };
}

// Helper to write data back to CSV
function writeUsers(headers: string[], users: User[]) {
    const headerString = headers.join(',');
    const rows = users.map(user => {
        return [user.id, user.name, user.email, user.password, user.role].join(',');
    });

    const csvString = [headerString, ...rows].join('\n') + '\n';
    fs.writeFileSync(usersCsvFilePath, csvString, 'utf-8');
}

// Helper to write admin data back to CSV
function writeAdmins(headers: string[], users: User[]) {
    const headerString = headers.join(',');
    const rows = users.map(user => {
        return [user.id, user.name, user.email, user.password, user.role].join(',');
    });

    const csvString = [headerString, ...rows].join('\n') + '\n';
    fs.writeFileSync(adminCsvFilePath, csvString, 'utf-8');
}


export async function createUser(userData: z.infer<typeof signupSchema>) {
    const validation = signupSchema.safeParse(userData);
    if (!validation.success) {
        throw new Error('Invalid user data.');
    }

    const { headers: userHeaders, users: regularUsers } = await readUsers();
    const { headers: adminHeaders, users: adminUsers } = await readAdmins();
    
    const allUsers = [...regularUsers, ...adminUsers];
    const existingUser = allUsers.find(u => u.email === userData.email);
    if (existingUser) {
        throw new Error('User with this email already exists.');
    }
    
    const newId = (allUsers.length > 0 ? Math.max(...allUsers.map(u => parseInt(u.id, 10))) : 0) + 1;

    const newUser: User = {
        ...userData,
        id: newId.toString(),
    };
    
    if (newUser.role === 'admin') {
        adminUsers.push(newUser);
        writeAdmins(adminHeaders, adminUsers);
    } else {
        regularUsers.push(newUser);
        writeUsers(userHeaders, regularUsers);
    }

    if (newUser.role === 'model') {
        const newModelData: Partial<Model> = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
        };
        await createModelForUser(newModelData);
    } else if (newUser.role === 'brand') {
        await createBrandForUser({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
        })
    }

    revalidatePath('/login');
    revalidatePath('/signup');
    revalidatePath('/admin/users');

    return { success: true, message: 'User created successfully.', user: newUser };
}

export async function getUser(email: string) {
    const { users: regularUsers } = await readUsers();
    const { users: adminUsers } = await readAdmins();
    const allUsers = [...regularUsers, ...adminUsers];
    return allUsers.find(u => u.email === email);
}

export async function getAllUsers() {
    const { users: regularUsers } = await readUsers();
    const { users: adminUsers } = await readAdmins();
    return [...regularUsers, ...adminUsers];
}
