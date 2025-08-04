
'use client';

import { useForm, Controller } from 'react-hook-form';
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
import { Loader2, Upload, Building, Phone, Globe, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth-actions';
import { getBrandByEmail, updateBrand, Brand } from '@/lib/brand-actions';
import Image from 'next/image';
import { uploadImage } from '@/lib/upload-actions';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const brandProfileSchema = z.object({
  name: z.string().min(2, 'Brand name is required'),
  businessType: z.string().min(1, "Please select a business type"),
  industry: z.string().min(2, 'Industry is required'),
  website: z.string().url('Please enter a valid URL').or(z.literal('')),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressCountry: z.string().optional(),
  addressZip: z.string().optional(),
  socialLinks: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactPersonRole: z.string().optional(),
  contactPersonEmail: z.string().email().optional().or(z.literal('')),
  contactPersonPhone: z.string().optional(),
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
      businessType: '',
      industry: '',
      website: '',
      description: '',
      email: '',
      phoneNumber: '',
      addressStreet: '',
      addressCity: '',
      addressState: '',
      addressCountry: '',
      addressZip: '',
      socialLinks: '',
      contactPersonName: '',
      contactPersonRole: '',
      contactPersonEmail: '',
      contactPersonPhone: '',
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
  }, []);


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
    <div className="container mx-auto max-w-3xl px-4 md:px-6 py-12">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Manage Your Brand Profile</CardTitle>
            <CardDescription>
              This information will be visible to models on the platform. A complete profile attracts better talent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Details */}
            <div className="space-y-6">
                <h3 className="text-xl font-headline font-semibold flex items-center"><Building className="mr-3 text-primary" /> Basic Details</h3>
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
                  <Label htmlFor="name">Business/Brand Name</Label>
                  <Input id="name" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Business Type</Label>
                        <Controller
                            name="businessType"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Individual Freelancer">Individual Freelancer</SelectItem>
                                        <SelectItem value="Company">Company</SelectItem>
                                        <SelectItem value="Agency">Agency</SelectItem>
                                        <SelectItem value="Photographer">Photographer</SelectItem>
                                        <SelectItem value="Casting Director">Casting Director</SelectItem>
                                        <SelectItem value="Production House">Production House</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                         {form.formState.errors.businessType && <p className="text-sm text-destructive">{form.formState.errors.businessType.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry Category</Label>
                      <Input id="industry" {...form.register('industry')} placeholder="e.g., Fashion, Advertising"/>
                       {form.formState.errors.industry && <p className="text-sm text-destructive">{form.formState.errors.industry.message}</p>}
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
            </div>

            <Separator />

            {/* Representative Details */}
            <div className="space-y-6">
                <h3 className="text-xl font-headline font-semibold flex items-center"><User className="mr-3 text-primary" /> Representative Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="contactPersonName">Full Name of Contact Person</Label>
                        <Input id="contactPersonName" {...form.register('contactPersonName')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPersonRole">Designation / Role</Label>
                        <Input id="contactPersonRole" {...form.register('contactPersonRole')} placeholder="e.g., Creative Director" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPersonEmail">Email</Label>
                        <Input id="contactPersonEmail" type="email" {...form.register('contactPersonEmail')} />
                        {form.formState.errors.contactPersonEmail && <p className="text-sm text-destructive">{form.formState.errors.contactPersonEmail.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPersonPhone">Mobile Number</Label>
                        <Input id="contactPersonPhone" {...form.register('contactPersonPhone')} />
                    </div>
                </div>
            </div>

            <Separator />

            {/* Contact & Location */}
            <div className="space-y-6">
                 <h3 className="text-xl font-headline font-semibold flex items-center"><Phone className="mr-3 text-primary" /> Contact & Location</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Official Business Email</Label>
                      <Input id="email" {...form.register('email')} placeholder="contact@yourbrand.com"/>
                       {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Business Phone Number</Label>
                      <Input id="phoneNumber" {...form.register('phoneNumber')} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="addressStreet">Business Address</Label>
                    <Input id="addressStreet" {...form.register('addressStreet')} placeholder="Street"/>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input {...form.register('addressCity')} placeholder="City"/>
                    <Input {...form.register('addressState')} placeholder="State / Province"/>
                    <Input {...form.register('addressZip')} placeholder="Zip / Postal Code"/>
                 </div>
                 <Input {...form.register('addressCountry')} placeholder="Country"/>
            </div>
            
            <Separator />
            
            {/* Online Presence */}
            <div className="space-y-6">
                 <h3 className="text-xl font-headline font-semibold flex items-center"><Globe className="mr-3 text-primary" /> Online Presence</h3>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website / Portfolio URL</Label>
                    <Input id="website" {...form.register('website')} placeholder="https://yourbrand.com"/>
                     {form.formState.errors.website && <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="socialLinks">Social Media Links</Label>
                    <Textarea id="socialLinks" {...form.register('socialLinks')} placeholder="Enter one URL per line (e.g., https://instagram.com/yourbrand)"/>
                  </div>
            </div>

          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button variant="outline" asChild size="lg">
                <Link href="/brand/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
