
'use client';

import type { Model } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "./ui/button";
import { CheckCircle, XCircle } from "lucide-react";

type ProfileCompletionCardProps = {
    model: Model;
}

const requiredFields: (keyof Model)[] = [
    'location', 'bio', 'genderIdentity', 'dateOfBirth', 'nationality', 'spokenLanguages',
    'height', 'bust', 'waist', 'hips', 'shoeSize', 'eyeColor', 'hairColor',
    'experience', 'availability'
];

const optionalButImportant: (keyof Model)[] = [
    'weight', 'cupSize', 'skinTone', 'dressSize', 'ethnicity', 'yearsOfExperience', 'modelingWork', 'skills', 'portfolioImages'
];


export function ProfileCompletionCard({ model }: ProfileCompletionCardProps) {
    const filledFields = requiredFields.filter(field => {
        const value = model[field];
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined && value !== '' && value !== 0;
    });
    
    const missingRequired = requiredFields.filter(field => !filledFields.includes(field));

    const completionPercentage = Math.round((filledFields.length / requiredFields.length) * 100);

    const getFieldName = (fieldKey: keyof Model): string => {
        const names: Record<keyof Model, string> = {
            id: 'ID',
            name: 'Full Name',
            email: 'Email',
            location: 'Location',
            locationPrefs: 'Location Preferences',
            bio: 'Bio',
            genderIdentity: 'Gender Identity',
            dateOfBirth: 'Date of Birth',
            nationality: 'Nationality',
            spokenLanguages: 'Spoken Languages',
            height: 'Height',
            weight: 'Weight',
            bust: 'Bust',
            waist: 'Waist',
            hips: 'Hips',
            cupSize: 'Cup Size',
            skinTone: 'Skin Tone',
            dressSize: 'Dress Size',
            shoeSize: 'Shoe Size',
            eyeColor: 'Eye Color',
            hairColor: 'Hair Color',
            ethnicity: 'Ethnicity',
            tattoos: 'Tattoos',
            tattoosDescription: 'Tattoo Description',
            piercings: 'Piercings',
            piercingsDescription: 'Piercing Description',
            scars: 'Scars/Birthmarks',
            braces: 'Braces',
            experience: 'Experience Level',
            yearsOfExperience: 'Years of Experience',
            modelingWork: 'Modeling Work Types',
            previousClients: 'Previous Clients',
            agencyRepresented: 'Agency Representation',
            agencyName: 'Agency Name',
            portfolioLink: 'Portfolio Link',
            availability: 'Availability',
            availableForBookings: 'Available for Bookings',
            willingToTravel: 'Willing to Travel',
            preferredRegions: 'Preferred Regions',
            timeAvailability: 'Time Availability',
            hourlyRate: 'Hourly Rate',
            dayRate: 'Day Rate',
            tfp: 'TFP Openness',
            portfolioImages: 'Portfolio Images',
            profilePicture: 'Profile Picture',
            skills: 'Skills',
            socialLinks: 'Social Links',
            consentBikini: 'Bikini Consent',
            consentSemiNude: 'Semi-Nude Consent',
            consentNude: 'Nude Consent',
            bikiniPortfolioImages: 'Bikini Portfolio',
            semiNudePortfolioImages: 'Semi-Nude Portfolio',
            nudePortfolioImages: 'Nude Portfolio',
            verificationStatus: 'Verification Status',
        };
        return names[fieldKey] || 'Unknown Field';
    };


    if (completionPercentage === 100) {
        return (
            <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                        <CheckCircle />
                        Profile Complete!
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-green-700 dark:text-green-400">Great job! Your profile has all the essential information. You can still add optional details to stand out even more.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                    Fill out the missing fields to increase your chances of getting noticed by brands.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-4">
                    <Progress value={completionPercentage} className="w-full" />
                    <span className="font-bold whitespace-nowrap">{completionPercentage}% Complete</span>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">What's Missing:</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {missingRequired.map(field => (
                            <div key={field} className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                                <span>{getFieldName(field)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                 <Button asChild className="mt-6">
                    <Link href="/account/profile/edit">
                        Finish Your Profile
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
