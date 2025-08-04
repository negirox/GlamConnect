
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
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const brandProfileSchema = z.object({
  name: z.string().min(2, 'Brand name is required'),
  industry: z.string().min(2, 'Industry is required'),
  website: z.string().url('Please enter a valid URL'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

export default function EditBrandProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // In a real app, this would be fetched from the server
  const currentBrandData = {
    name: 'Luxe Apparel Co.',
    industry: 'Fashion & Apparel',
    website: 'https://www.luxeapparel.com',
    description: 'Luxe Apparel Co. is a high-end fashion house specializing in modern couture. We are known for our innovative designs and commitment to quality craftsmanship. We frequently collaborate with top-tier models for our runway shows and editorial campaigns.',
  };

  const form = useForm({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: currentBrandData,
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log('Submitting brand data:', data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Profile Updated',
      description: 'Your brand profile has been successfully saved.',
    });
    
    setIsSubmitting(false);
    router.push('/brand/profile');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 md:px-6 py-12">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Edit Brand Profile</CardTitle>
            <CardDescription>
              This information will be visible to models on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...form.register('industry')} placeholder="e.g., Fashion, Cosmetics, etc."/>
               {form.formState.errors.industry && <p className="text-sm text-destructive">{form.formState.errors.industry.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...form.register('website')} placeholder="https://yourbrand.com"/>
               {form.formState.errors.website && <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>}
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
                <Link href="/brand/profile">Cancel</Link>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
