
'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

export type Brand = {
    id: string;
    name: string;
    email: string;
    industry: string;
    website: string;
    description: string;
    location: string;
    logo: string;
    verificationStatus: 'Verified' | 'Not Verified' | 'Pending';
    businessType?: string;
    phoneNumber?: string;
    addressStreet?: string;
    addressCity?: string;
    addressState?: string;
    addressCountry?: string;
    addressZip?: string;
    socialLinks?: string;
}

const csvFilePath = path.join(process.cwd(), 'public', 'brands.csv');
const ALL_BRAND_HEADERS = [
    'id', 'name', 'email', 'industry', 'website', 'description', 'location', 
    'logo', 'verificationStatus', 'businessType', 'phoneNumber', 'addressStreet', 
    'addressCity', 'addressState', 'addressCountry', 'addressZip', 'socialLinks'
];

function parseCSV(csv: string): Brand[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // handle commas inside quotes
    const entry = headers.reduce(
      (obj, header, index) => {
        let value = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
        (obj as any)[header] = value;
        return obj;
      },
      {} as Brand
    );
    return entry;
  });
}

function readBrands(): { headers: string[], brands: Brand[] } {
  if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, ALL_BRAND_HEADERS.join(',') + '\n', 'utf-8');
  }

  const csvData = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvData.trim().split('\n');
  
  if (lines.length === 0 || lines[0].trim() === '') {
     fs.writeFileSync(csvFilePath, ALL_BRAND_HEADERS.join(',') + '\n', 'utf-8');
     return { headers: ALL_BRAND_HEADERS, brands: [] };
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const brands = parseCSV(csvData);

  return { headers: ALL_BRAND_HEADERS, brands };
}

function writeBrands(brands: Brand[]) {
    const headerString = ALL_BRAND_HEADERS.join(',');
    const rows = brands.map(brand => {
        return ALL_BRAND_HEADERS.map(header => {
            const key = header as keyof Brand;
            let value = brand[key];
            
            let stringValue = String(value ?? '');
             if (stringValue.includes(',')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    });
    const csvString = [headerString, ...rows].join('\n') + '\n';
    fs.writeFileSync(csvFilePath, csvString, 'utf-8');
}


export async function createBrandForUser(brandData: Partial<Brand>) {
    if (!brandData.id || !brandData.email || !brandData.name) {
        throw new Error("Cannot create a brand profile with missing id, email or name.");
    }
    
    const { brands } = readBrands();

    const existingBrand = brands.find(b => b.email === brandData.email);
    if (existingBrand) {
        return { success: true, message: 'Brand profile already exists.' };
    }

    const defaultBrand: Brand = {
        id: brandData.id,
        name: brandData.name,
        email: brandData.email,
        industry: '',
        website: '',
        description: '',
        location: '',
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
    };
    
    brands.push(defaultBrand);
    writeBrands(brands);
    
    revalidatePath('/brand/profile');
    return { success: true, message: 'Brand profile created successfully.' };
}

export async function getBrandByEmail(email: string): Promise<Brand | null> {
    const { brands } = readBrands();
    return brands.find(b => b.email === email) || null;
}

export async function updateBrand(id: string, updatedData: Partial<Brand>) {
    try {
        const { brands } = readBrands();
        
        const brandIndex = brands.findIndex(b => b.id === id);
        if (brandIndex === -1) {
            throw new Error('Brand not found');
        }

        const updatedBrand = { ...brands[brandIndex], ...updatedData };
        brands[brandIndex] = updatedBrand;
        
        writeBrands(brands);

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
