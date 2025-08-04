
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth-actions';
import { getBrandByEmail, updateBrand, Brand } from '@/lib/brand-actions';
import Image from 'next/image';
import { uploadImage } from '@/lib/upload-actions';

const brandProfileSchema = z.object({
  name: z.string().min(2, 'Brand name is required'),
  industry: z.string().min(2, 'Industry is required'),
  website: z.string().url('Please enter a valid URL').or(z.literal('')),
  location: z.string().min(2, 'Location is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  email: z.string().email(),
});

export default function EditBrandProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof brandProfileSchema>>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
        name: '',
        industry: '',
        website: '',
        location: '',
        description: '',
        email: '',
    },
  });
  
  useEffect(() => {
    const fetchBrand = async () => {
        const session = await getSession();
        if(!session.isLoggedIn || !session.email || session.role !== 'brand') {
            router.push('/login');
            return;
        }
        const fetchedBrand = await getBrandByEmail(session.email);
        if (fetchedBrand) {
            setBrand(fetchedBrand);
            form.reset(fetchedBrand);
        }
        setLoading(false);
    }
    fetchBrand();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const onSubmit = async (data: z.infer<typeof brandProfileSchema>) => {
    if(!brand) return;
    setIsSubmitting(true);
    
    try {
        await updateBrand(brand.id, data);
        toast({
          title: 'Profile Updated',
          description: 'Your brand profile has been successfully saved.',
        });
        router.push('/brand/dashboard');
    } catch (error) {
        toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if(!e.target.files || !brand) return;
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      setIsSubmitting(true);
      const result = await uploadImage(formData, 2);
      if(result.success && result.filePath) {
          await updateBrand(brand.id, { logo: result.filePath });
          const fetchedBrand = await getBrandByEmail(brand.email);
          if(fetchedBrand) setBrand(fetchedBrand);
          toast({ title: 'Logo uploaded!' });
      } else {
          toast({ title: 'Upload failed', description: result.message, variant: 'destructive' });
      }
      setIsSubmitting(false);
  }

  if (loading || !brand) {
      return <div className="container flex items-center justify-center h-96"><Loader2 className="animate-spin"/></div>
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 md:px-6 py-12">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Complete Your Brand Profile</CardTitle>
            <CardDescription>
              This information will be visible to models on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-4">
                   <Image src={brand.logo} alt="Brand Logo" width={80} height={80} className="rounded-full bg-muted object-cover"/>
                    <Button asChild type="button" variant="outline">
                        <Label>
                            <Upload className="mr-2 h-4 w-4" />Upload New
                            <Input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isSubmitting}/>
                        </Label>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" {...form.register('industry')} placeholder="e.g., Fashion, Cosmetics, etc."/>
                   {form.formState.errors.industry && <p className="text-sm text-destructive">{form.formState.errors.industry.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...form.register('location')} placeholder="City, Country"/>
                   {form.formState.errors.location && <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>}
                </div>
            </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" {...form.register('website')} placeholder="https://yourbrand.com"/>
                   {form.formState.errors.website && <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Public Contact Email</Label>
                  <Input id="email" {...form.register('email')} placeholder="contact@yourbrand.com"/>
                   {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Brand Description</Label>
              <Textarea
                id="description"
                placeholder="Tell models what your brand is all about."
                className="min-h-32"
                {...form.register('description')}
              />
               {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button variant="outline" asChild>
                <Link href="/brand/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
