
'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building, Globe, Link as LinkIcon, Edit, Mail, MapPin, Loader2, Phone, Briefcase, User } from 'lucide-react';
import NextLink from "next/link";
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth-actions';
import { getBrandByEmail, Brand } from '@/lib/brand-actions';
import { useRouter } from 'next/navigation';

export default function BrandProfilePage() {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    useEffect(() => {
        const fetchBrand = async () => {
            const session = await getSession();
            if(!session.isLoggedIn || !session.email || session.role !== 'brand') {
                router.push('/login');
                return;
            }
            const fetchedBrand = await getBrandByEmail(session.email);
            setBrand(fetchedBrand);
            setLoading(false);
        }
        fetchBrand();
      }, [router])

    if (loading || !brand) {
      return <div className="container flex items-center justify-center h-96"><Loader2 className="animate-spin"/></div>
    }
    
    const socialLinks = brand.socialLinks ? brand.socialLinks.split('\n').filter(link => link.trim() !== '') : [];

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between gap-4 items-center">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <Image src={brand.logo} alt={`${brand.name} logo`} width={100} height={100} className="rounded-full bg-muted border object-cover" />
                        <div>
                            <CardTitle className="font-headline text-3xl">{brand.name}</CardTitle>
                            <CardDescription className="flex items-center justify-center md:justify-start gap-4 mt-2">
                                <span className="flex items-center gap-2"><Briefcase className="h-4 w-4"/>{brand.businessType || 'N/A'}</span>
                                <span className="flex items-center gap-2"><Building className="h-4 w-4"/>{brand.industry}</span>
                            </CardDescription>
                        </div>
                    </div>
                    <Button asChild className="shrink-0">
                        <NextLink href="/brand/profile/edit">
                            <Edit className="mr-2" /> Edit Profile
                        </NextLink>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2">About Us</h3>
                    <p className="text-muted-foreground">{brand.description || 'No description provided.'}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                     <div>
                        <h4 className="font-semibold flex items-center mb-2"><MapPin className="mr-2"/> Location</h4>
                        <p className="text-muted-foreground">{brand.addressStreet}</p>
                        <p className="text-muted-foreground">{brand.addressCity}, {brand.addressState} {brand.addressZip}</p>
                        <p className="text-muted-foreground">{brand.addressCountry}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold flex items-center mb-2"><Mail className="mr-2"/> Business Contact</h4>
                         <a href={`mailto:${brand.email}`} className="text-primary hover:underline block">{brand.email}</a>
                         {brand.phoneNumber && <p className="text-muted-foreground">{brand.phoneNumber}</p>}
                    </div>
                    {brand.contactPersonName && (
                        <div>
                            <h4 className="font-semibold flex items-center mb-2"><User className="mr-2"/> Representative</h4>
                            <p className="text-muted-foreground font-medium">{brand.contactPersonName} ({brand.contactPersonRole})</p>
                            {brand.contactPersonEmail && <a href={`mailto:${brand.contactPersonEmail}`} className="text-primary hover:underline block">{brand.contactPersonEmail}</a>}
                            {brand.contactPersonPhone && <p className="text-muted-foreground">{brand.contactPersonPhone}</p>}
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold flex items-center mb-2"><Globe className="mr-2"/> Website</h4>
                        {brand.website ? 
                            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block truncate">
                                {brand.website}
                            </a>
                            : <p className="text-muted-foreground">Not specified</p>
                        }
                    </div>
                     <div className="col-span-full">
                        <h4 className="font-semibold flex items-center mb-2"><LinkIcon className="mr-2"/> Social Media</h4>
                        <div className="flex flex-col space-y-1">
                        {socialLinks.length > 0 ? socialLinks.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block truncate">
                                {link}
                            </a>
                        )) : <p className="text-muted-foreground">Not specified</p>}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
