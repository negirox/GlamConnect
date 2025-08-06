
'use server';

import fs from 'fs';
import path from 'path';
import { readUsers, readAdmins } from './user-actions';
import { revalidatePath } from 'next/cache';

export type PasswordResetRequest = {
    email: string;
    phone?: string;
    contactMethod: 'email' | 'phone';
    requestedAt: string;
    status: 'pending' | 'completed' | 'rejected';
};

const passwordResetsCsvFilePath = path.join(process.cwd(), 'public', 'password_resets.csv');
const RESET_HEADERS = ['email', 'phone', 'contactMethod', 'requestedAt', 'status'];

export function readPasswordResetRequests(): PasswordResetRequest[] {
    if (!fs.existsSync(passwordResetsCsvFilePath)) {
        fs.writeFileSync(passwordResetsCsvFilePath, RESET_HEADERS.join(',') + '\n', 'utf-8');
        return [];
    }
    const csvData = fs.readFileSync(passwordResetsCsvFilePath, 'utf-8');
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) return [];
    
    return lines.slice(1).map(line => {
        const [email, phone, contactMethod, requestedAt, status] = line.split(',');
        return {
            email,
            phone,
            contactMethod: contactMethod as 'email' | 'phone',
            requestedAt,
            status: (status as 'pending' | 'completed' | 'rejected') || 'pending'
        };
    });
}

function writePasswordResetRequests(requests: PasswordResetRequest[]) {
    const headerString = RESET_HEADERS.join(',');
    const rows = requests.map(req => 
        [req.email, req.phone || '', req.contactMethod, req.requestedAt, req.status].join(',')
    );
    const csvString = [headerString, ...rows].join('\n') + '\n';
    fs.writeFileSync(passwordResetsCsvFilePath, csvString, 'utf-8');
}


export async function requestPasswordReset(data: { email: string; phone?: string; contactMethod: 'email' | 'phone' }) {
    const { users: regularUsers } = await readUsers();
    const { users: adminUsers } = await readAdmins();
    const allUsers = [...regularUsers, ...adminUsers];

    const userExists = allUsers.some(u => u.email === data.email);

    if (!userExists) {
        // To prevent user enumeration, we don't reveal that the email doesn't exist.
        // We act as if the request was successful.
        console.log(`Password reset requested for non-existent email: ${data.email}`);
        return { success: true };
    }
    
    // Log the request for the admin
    const requests = readPasswordResetRequests();
    const newRequest: PasswordResetRequest = {
        ...data,
        requestedAt: new Date().toISOString(),
        status: 'pending',
    };

    requests.push(newRequest);
    writePasswordResetRequests(requests);
    
    // In a real application, you would trigger an email or notification to the admin here.
    // For this simulation, saving to CSV is sufficient.
    
    return { success: true };
}

export async function updatePasswordResetStatus(
    email: string, 
    requestedAt: string, 
    newStatus: 'completed' | 'rejected'
) {
    const requests = readPasswordResetRequests();
    const requestIndex = requests.findIndex(req => req.email === email && req.requestedAt === requestedAt);

    if (requestIndex === -1) {
        throw new Error("Password reset request not found.");
    }

    requests[requestIndex].status = newStatus;
    writePasswordResetRequests(requests);

    revalidatePath('/admin/password-resets');
    
    return { success: true, message: `Request status updated to ${newStatus}.` };
}
