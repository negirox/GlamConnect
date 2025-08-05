
'use server';

import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createModelForUser, updateModel as updateModelProfile } from './model-actions';
import { createBrandForUser, updateBrand as updateBrandProfile } from './brand-actions';
import type { Model } from './mock-data';

const usersCsvFilePath = path.join(process.cwd(), 'public', 'users.csv');
const adminCsvFilePath = path.join(process.cwd(), 'public', 'admincredentials.csv');

const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["model", "brand", "admin"]),
  status: z.enum(["active", "inactive"]),
});

type User = z.infer<typeof userSchema>;

const USER_HEADERS = ['id', 'name', 'email', 'password', 'role', 'status'];
const ADMIN_HEADERS = ['id', 'name', 'email', 'password', 'role', 'status'];


async function readAllUsersFromFile(filePath: string, headers: string[]): Promise<User[]> {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, headers.join(',') + '\n', 'utf-8');
        if(filePath.includes('admincredentials')) {
            fs.appendFileSync(filePath, `1,Admin,admin@glamconnect.com,password123,admin,active\n`);
        }
    }
    
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const lines = csvData.trim().split('\n');

    if (lines.length <= 1 && filePath.includes('admincredentials')) {
         fs.appendFileSync(filePath, `1,Admin,admin@glamconnect.com,password123,admin,active\n`);
         lines.push('1,Admin,admin@glamconnect.com,password123,admin,active');
    }
    
    return lines.slice(1).map(line => {
      if(line.trim() === '') return null;
      const values = line.split(',');
      return {
        id: values[0],
        name: values[1],
        email: values[2],
        password: values[3],
        role: values[4] as User['role'],
        status: (values[5] as User['status']) || 'active',
      } as User;
    }).filter(u => u !== null) as User[];
}

function writeUsersToFile(filePath: string, headers: string[], users: User[]) {
    const headerString = headers.join(',');
    const rows = users.map(user => {
        return [user.id, user.name, user.email, user.password, user.role, user.status].join(',');
    });

    const csvString = [headerString, ...rows].join('\n') + '\n';
    fs.writeFileSync(filePath, csvString, 'utf-8');
}


export async function readUsers(): Promise<{ headers: string[], users: User[] }> {
  const users = await readAllUsersFromFile(usersCsvFilePath, USER_HEADERS);
  return { headers: USER_HEADERS, users };
}

export async function readAdmins(): Promise<{ headers: string[], users: User[] }> {
  const users = await readAllUsersFromFile(adminCsvFilePath, ADMIN_HEADERS);
  return { headers: ADMIN_HEADERS, users };
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

    const { users: regularUsers } = await readUsers();
    const { users: adminUsers } = await readAdmins();
    
    const allUsers = [...regularUsers, ...adminUsers];
    const existingUser = allUsers.find(u => u.email === userData.email);
    if (existingUser) {
        throw new Error('User with this email already exists.');
    }
    
    const newId = (allUsers.length > 0 ? Math.max(...allUsers.map(u => parseInt(u.id, 10))) : 0) + 1;

    const newUser: User = {
        ...userData,
        id: newId.toString(),
        status: 'active',
    };
    
    if (newUser.role === 'admin') {
        adminUsers.push(newUser);
        writeUsersToFile(adminCsvFilePath, ADMIN_HEADERS, adminUsers);
    } else {
        regularUsers.push(newUser);
        writeUsersToFile(usersCsvFilePath, USER_HEADERS, regularUsers);
    }

    if (newUser.role === 'model') {
        await createModelForUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    } else if (newUser.role === 'brand') {
        await createBrandForUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    }

    revalidatePath('/admin/users');

    return { success: true, message: 'User created successfully.', user: newUser };
}

export async function updateUser(userId: string, data: Partial<User>) {
    const { users: regularUsers } = await readUsers();
    const { users: adminUsers } = await readAdmins();
    
    let userFound = false;
    let userIndex = regularUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const originalUser = regularUsers[userIndex];
        const updatedUser = { ...originalUser, ...data };
        regularUsers[userIndex] = updatedUser;

        // If role changed, move user between files
        if (data.role && data.role !== originalUser.role) {
            regularUsers.splice(userIndex, 1);
            if (data.role === 'admin') {
                adminUsers.push(updatedUser);
            }
        }
        userFound = true;
    } else {
        userIndex = adminUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const originalUser = adminUsers[userIndex];
            const updatedUser = { ...originalUser, ...data };
            adminUsers[userIndex] = updatedUser;

            if (data.role && data.role !== originalUser.role) {
                adminUsers.splice(userIndex, 1);
                if (data.role === 'model' || data.role === 'brand') {
                    regularUsers.push(updatedUser);
                }
            }
            userFound = true;
        }
    }

    if (!userFound) {
        throw new Error('User not found');
    }

    writeUsersToFile(usersCsvFilePath, USER_HEADERS, regularUsers);
    writeUsersToFile(adminCsvFilePath, ADMIN_HEADERS, adminUsers);
    
    // Also update associated model/brand profile if name changes
    if (data.name) {
        if(data.role === 'model') await updateModelProfile(userId, { name: data.name });
        if(data.role === 'brand') await updateBrandProfile(userId, { name: data.name });
    }

    revalidatePath('/admin/users');
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
