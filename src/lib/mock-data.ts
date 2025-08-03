
export type Model = {
  id: string;
  name: string;
  email: string;
  location: string;
  locationPrefs?: string;
  bio?: string;
  height: number; // in cm
  weight?: number; // in kg
  bust: number; // in cm
  waist: number; // in cm
  hips: number; // in cm
  shoeSize: number; // EU
  eyeColor: string;
  hairColor: string;
  ethnicity?: string;
  tattoos?: boolean;
  piercings?: boolean;
  experience: 'New Face' | 'Experienced' | 'Expert';
  availability: 'Full-time' | 'Part-time' | 'By Project';
  portfolioImages: string[];
  profilePicture: string;
  skills?: string[];
  socialLinks?: string[];
  consentBikini?: boolean;
  consentSemiNude?: boolean;
  consentNude?: boolean;
  bikiniPortfolioImages?: string[];
  semiNudePortfolioImages?: string[];
  nudePortfolioImages?: string[];
  verificationStatus: 'Not Verified' | 'Pending' | 'Verified';
};

// This data is now read from public/models.csv
export const models: Model[] = [];

    