
export type Model = {
  id: string;
  name: string;
  email: string;
  location: string;
  locationPrefs?: string;
  bio?: string;
  genderIdentity?: string;
  dateOfBirth?: string; 
  nationality?: string;
  spokenLanguages?: string[];
  height: number; // in cm
  weight?: number; // in kg
  bust: number; // in cm
  waist: number; // in cm
  hips: number; // in cm
  cupSize?: string;
  skinTone?: string;
  dressSize?: string;
  shoeSize: number; // EU
  eyeColor: string;
  hairColor: string;
  ethnicity?: string;
  tattoos?: boolean;
  tattoosDescription?: string;
  piercings?: boolean;
  piercingsDescription?: string;
  scars?: string;
  braces?: boolean;
  experience: 'New Face' | 'Experienced' | 'Expert';
  yearsOfExperience?: number;
  modelingWork?: ('Editorial' | 'Commercial' | 'Runway' | 'Fitness' | 'Swimwear' | 'Semi-nude' | 'Nude')[];
  previousClients?: string;
  agencyRepresented?: boolean;
  agencyName?: string;
  portfolioLink?: string;
  availability: 'Full-time' | 'Part-time' | 'By Project';
  availableForBookings?: boolean;
  willingToTravel?: boolean;
  preferredRegions?: string;
  timeAvailability?: ('Weekdays' | 'Weekends')[];
  hourlyRate?: number;
  dayRate?: number;
  tfp?: boolean;
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
