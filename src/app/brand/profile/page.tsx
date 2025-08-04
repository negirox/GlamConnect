
'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building, Globe, Link as LinkIcon, Edit, Mail, MapPin, Loader2 } from 'lucide-react';
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


  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
        <Card>
            <CardHeader className="flex flex-col items-center md:flex-row md:justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <Image src={brand.logo} alt={`${brand.name} logo`} width={100} height={100} className="rounded-full bg-muted border object-cover" />
                    <div className="text-center md:text-left">
                        <CardTitle className="font-headline text-3xl">{brand.name}</CardTitle>
                        <CardDescription className="flex items-center justify-center md:justify-start gap-2 mt-1">
                            <Building className="h-4 w-4"/>{brand.industry}
                        </CardDescription>
                    </div>
                </div>
                <Button asChild className="shrink-0">
                    <NextLink href="/brand/profile/edit">
                        <Edit className="mr-2" /> Edit Profile
                    </NextLink>
                </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center"><Building className="mr-2"/> About Us</h3>
                    <p className="text-muted-foreground">{brand.description || 'No description provided.'}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <h4 className="font-semibold flex items-center"><MapPin className="mr-2"/> Location</h4>
                        <p className="text-muted-foreground">{brand.location || 'Not specified'}</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center"><Globe className="mr-2"/> Website</h4>
                        {brand.website ? 
                            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block truncate">
                                {brand.website}
                            </a>
                            : <p className="text-muted-foreground">Not specified</p>
                        }
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold flex items-center"><Mail className="mr-2"/> Contact</h4>
                         <a href={`mailto:${brand.email}`} className="text-primary hover:underline">
                            {brand.email}
                        </a>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
