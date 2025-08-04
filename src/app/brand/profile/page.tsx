
'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building, Globe, Link as LinkIcon, Edit, User } from 'lucide-react';
import NextLink from "next/link";


export default function BrandProfilePage() {

    // In a real app, this data would be fetched for the logged-in brand
    const brandData = {
        name: "Luxe Apparel Co.",
        industry: "Fashion & Apparel",
        website: "https://www.luxeapparel.com",
        description: "Luxe Apparel Co. is a high-end fashion house specializing in modern couture. We are known for our innovative designs and commitment to quality craftsmanship. We frequently collaborate with top-tier models for our runway shows and editorial campaigns.",
        socialLinks: [
            { name: "Instagram", url: "https://instagram.com/luxeapparel" },
            { name: "Facebook", url: "https://facebook.com/luxeapparel" },
        ]
    }


  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                    <CardTitle className="font-headline text-3xl">{brandData.name}</CardTitle>
                    <CardDescription>{brandData.industry}</CardDescription>
                </div>
                <Button asChild>
                    <NextLink href="/brand/profile/edit">
                        <Edit className="mr-2" /> Edit Profile
                    </NextLink>
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center"><Building className="mr-2"/> About Us</h3>
                    <p className="text-muted-foreground">{brandData.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center"><Globe className="mr-2"/> Website</h4>
                        <a href={brandData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {brandData.website}
                        </a>
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold flex items-center"><LinkIcon className="mr-2"/> Social Links</h4>
                        <div className="flex flex-col space-y-1">
                        {brandData.socialLinks.map(link => (
                             <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {link.name}
                            </a>
                        ))}
                        </div>
                    </div>
                </div>

                 <Separator />

                 <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center"><User className="mr-2"/> Key Contacts</h3>
                    <p className="text-muted-foreground">Contact information would appear here for logged-in models.</p>
                 </div>
            </CardContent>
        </Card>
    </div>
  )
}
