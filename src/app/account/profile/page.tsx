
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getModelByEmail } from '@/lib/data-actions';
import type { Model } from '@/lib/mock-data';
import { User, Ruler, Star, ShieldCheck, MapPin, Edit, BadgeCheck, Weight, PersonStanding, Palette, Eye, Briefcase, CalendarDays, Tag, Loader2, Link as LinkIcon, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { getSession } from '@/lib/auth-actions';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { updateModel } from '@/lib/model-actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent,  SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const profileSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  bio: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  locationPrefs: z.string().optional(),
  email: z.string().email(),
});

const attributesSchema = z.object({
    height: z.coerce.number().positive(),
    weight: z.coerce.number().positive().optional(),
    bust: z.coerce.number().positive(),
    waist: z.coerce.number().positive(),
    hips: z.coerce.number().positive(),
    shoeSize: z.coerce.number().positive(),
    eyeColor: z.string(),
    hairColor: z.string(),
    ethnicity: z.string().optional(),
});

const professionalSchema = z.object({
    experience: z.string(),
    availability: z.string(),
    skills: z.string().optional(),
    socialLinks: z.string().optional(),
});

const consentSchema = z.object({
    consentBikini: z.boolean().optional(),
    consentSemiNude: z.boolean().optional(),
    consentNude: z.boolean().optional(),
});


export default function ProfileDashboardPage() {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const fetchModel = async () => {
    const session = await getSession();
    if (!session.isLoggedIn || !session.email) {
      router.push('/login');
      return;
    }
    try {
      const fetchedModel = await getModelByEmail(session.email);
      setModel(fetchedModel || null);
    } catch (error) {
      console.error(error);
      setModel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormSubmit = async (data: any, schema: any) => {
    if (!model) return;
    setIsSubmitting(true);
    
    if (data.skills && typeof data.skills === 'string') {
      data.skills = data.skills.split(',').map((s: string) => s.trim());
    }
    if (data.socialLinks && typeof data.socialLinks === 'string') {
      data.socialLinks = data.socialLinks.split(',').map((s: string) => s.trim());
    }

    try {
      await updateModel(model.id, data);
      await fetchModel(); 
      toast({
        title: "Profile Updated",
        description: `Your information has been saved successfully.`,
      });
      setOpenDialog(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update information.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12 text-center">
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Profile Not Found</AlertTitle>
              <AlertDescription>
                 Model data not found for this user. Please complete your profile, or if you just signed up, log out and log back in.
              </AlertDescription>
          </Alert>
          <Button asChild className="mt-4">
              <Link href="/account/profile/edit">Complete Profile</Link>
          </Button>
      </div>
    );
  }

  const forms: { [key: string]: { schema: any; fields: JSX.Element; title: string } } = {
    basic: {
      schema: profileSchema,
      title: 'Edit Basic Information',
      fields: (
        <>
          <FormField name="name" label="Full Name" type="text" />
          <FormField name="email" label="Email" type="email" />
          <FormField name="location" label="Location" type="text" />
          <FormField name="locationPrefs" label="Location Preferences" type="text" placeholder="e.g. Willing to travel" />
          <FormField name="bio" label="Bio" type="textarea" />
        </>
      ),
    },
    attributes: {
      schema: attributesSchema,
      title: 'Edit Physical Attributes',
      fields: (
        <div className="grid grid-cols-2 gap-4">
          <FormField name="height" label="Height (cm)" type="number" />
          <FormField name="weight" label="Weight (kg)" type="number" />
          <FormField name="bust" label="Bust (cm)" type="number" />
          <FormField name="waist" label="Waist (cm)" type="number" />
          <FormField name="hips" label="Hips (cm)" type="number" />
          <FormField name="shoeSize" label="Shoe Size (EU)" type="number" />
          <FormSelect name="eyeColor" label="Eye Color" options={['Blue', 'Green', 'Brown', 'Hazel', 'Grey', 'Amber']} />
          <FormSelect name="hairColor" label="Hair Color" options={['Blonde', 'Brown', 'Black', 'Red', 'Grey', 'Other']} />
          <FormField name="ethnicity" label="Ethnicity" type="text" />
        </div>
      ),
    },
    professional: {
        schema: professionalSchema,
        title: 'Edit Professional Details',
        fields: (
            <>
                <FormSelect name="experience" label="Experience Level" options={['New Face', 'Experienced', 'Expert']} />
                <FormRadioGroup name="availability" label="Availability" options={['Full-time', 'Part-time', 'By Project']} />
                <FormField name="skills" label="Skills (comma-separated)" type="text" placeholder="e.g. Runway, Commercial" />
                <FormField name="socialLinks" label="Social Links (comma-separated)" type="text" placeholder="e.g. https://instagram.com/..." />
            </>
        )
    },
    consent: {
        schema: consentSchema,
        title: 'Edit Consent Settings',
        fields: (
            <>
                <FormCheckbox name="consentBikini" label="Bikini Shoots" description="I consent to be considered for shoots that require wearing swimwear or bikini." />
                <FormCheckbox name="consentSemiNude" label="Semi-Nude Shoots" description="I consent to be considered for tasteful, artistic semi-nude shoots." />
                <FormCheckbox name="consentNude" label="Nude Shoots" description="I consent to be considered for artistic nude shoots." />
            </>
        )
    }
  };

  const getVerificationBadge = () => {
    switch(model.verificationStatus) {
        case 'Verified':
            return <BadgeCheck className="h-7 w-7 text-blue-500" title="Verified"/>;
        case 'Pending':
            return <Clock className="h-6 w-6 text-orange-500" title="Pending Verification"/>;
        case 'Not Verified':
            return <AlertCircle className="h-6 w-6 text-muted-foreground" title="Not Verified"/>
        default:
            return null;
    }
  }


  function FormDialog({ dialogKey }: { dialogKey: string }) {
    const { schema, fields, title } = forms[dialogKey];
    
    const defaultValues = Object.keys(schema.shape).reduce((acc, key) => {
        const modelKey = key as keyof Model;
        if (modelKey === 'skills' || modelKey === 'socialLinks') {
            acc[key] = (model?.[modelKey] as string[] | undefined)?.join(', ') || '';
        } else {
            acc[key] = model?.[modelKey] ?? '';
        }
        return acc;
    }, {} as any);

    const form = useForm({
      resolver: zodResolver(schema),
      defaultValues,
    });
    
    return (
      <Dialog open={openDialog === dialogKey} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpenDialog(dialogKey)}><Edit className="h-4 w-4" /></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(data => handleFormSubmit(data, schema))} className="space-y-4">
            <ControllerContext.Provider value={form.control}>
              {fields}
            </ControllerContext.Provider>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }


  return (
    <div className="container mx-auto max-w-5xl px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div className="flex items-center">
          <div className="relative h-24 w-24 rounded-full mr-6">
            <Image
              src={model.profilePicture}
              alt={model.name}
              data-ai-hint="fashion model"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h1 className="text-4xl font-headline font-bold">{model.name}</h1>
                {getVerificationBadge()}
            </div>
            <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-1.5" />
                <span>{model.location}</span>
            </div>
          </div>
        </div>
        <Button asChild size="lg">
          <Link href="/account/profile/edit">
            <Edit className="mr-2 h-4 w-4" />
            Manage Full Profile
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center font-headline"><User className="mr-3" /> Basic Information</CardTitle>
            <FormDialog dialogKey="basic" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div><p className="font-semibold">Email</p><p className="text-muted-foreground">{model.email}</p></div>
            <div><p className="font-semibold">Bio</p><p className="text-muted-foreground">{model.bio || 'Not provided'}</p></div>
            <div><p className="font-semibold">Location Preferences</p><p className="text-muted-foreground">{model.locationPrefs || 'Not provided'}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center font-headline"><Ruler className="mr-3" /> Physical Attributes</CardTitle>
            <FormDialog dialogKey="attributes" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-start"><PersonStanding className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Height</p><p className="text-muted-foreground">{model.height} cm</p></div></div>
            <div className="flex items-start"><Weight className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Weight</p><p className="text-muted-foreground">{model.weight ? `${model.weight} kg` : 'N/A'}</p></div></div>
            <div className="flex items-start"><Ruler className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Measurements</p><p className="text-muted-foreground">{`${model.bust}-${model.waist}-${model.hips} cm`}</p></div></div>
            <div className="flex items-start"><Eye className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Eye Color</p><p className="text-muted-foreground">{model.eyeColor}</p></div></div>
            <div className="flex items-start"><Palette className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Hair Color</p><p className="text-muted-foreground">{model.hairColor}</p></div></div>
            <div className="flex items-start"><Tag className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Ethnicity</p><p className="text-muted-foreground">{model.ethnicity || 'N/A'}</p></div></div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center font-headline"><Star className="mr-3" /> Professional Details</CardTitle>
            <FormDialog dialogKey="professional" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div><p className="font-semibold">Experience Level</p><p className="text-muted-foreground">{model.experience}</p></div>
            <div><p className="font-semibold">Availability</p><p className="text-muted-foreground">{model.availability}</p></div>
            <div><p className="font-semibold">Skills</p><div className="flex flex-wrap gap-2 mt-1">{model.skills && model.skills.length > 0 ? model.skills.map((skill, i) => (<Badge key={i} variant="secondary">{skill.trim()}</Badge>)) : <p className="text-sm text-muted-foreground">No skills listed.</p>}</div></div>
            <div><p className="font-semibold">Social Links</p><div className="flex flex-wrap gap-2 mt-1">{model.socialLinks && model.socialLinks.length > 0 ? model.socialLinks.map((link, i) => (<Button key={i} asChild variant="outline" size="sm"><a href={link} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2" /> Link</a></Button>)) : <p className="text-sm text-muted-foreground">No links provided.</p>}</div></div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center font-headline"><ShieldCheck className="mr-3" /> Consent Settings</CardTitle>
            <FormDialog dialogKey="consent" />
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Bikini Shoots: <Badge variant={model.consentBikini ? "default" : "outline"}>{model.consentBikini ? 'Consented' : 'Not Consented'}</Badge></p>
            <p>Semi-Nude Shoots: <Badge variant={model.consentSemiNude ? "default" : "outline"}>{model.consentSemiNude ? 'Consented' : 'Not Consented'}</Badge></p>
            <p>Nude Shoots: <Badge variant={model.consentNude ? "default" : "outline"}>{model.consentNude ? 'Consented' : 'Not Consented'}</Badge></p>
          </CardContent>
        </Card>
      </div>

       <Separator className="my-8" />
       
        <div>
            <h2 className="text-3xl font-headline font-bold mb-6">Portfolio</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {model.portfolioImages.map((src, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div className="relative aspect-[3/4] w-full group overflow-hidden rounded-lg cursor-pointer">
                      <Image
                        src={src}
                        alt={`Portfolio image ${index + 1} for ${model.name}`}
                        data-ai-hint="portfolio shot"
                        fill
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                     <Image
                        src={src}
                        alt={`Portfolio image ${index + 1} for ${model.name}`}
                        width={800}
                        height={1067}
                        className="object-contain rounded-lg"
                      />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
    </div>
  );
}


// --- Reusable Form Field Components ---

const ControllerContext = React.createContext<any>(null);

function FormField({ name, label, type, placeholder }: { name: string; label: string; type: string; placeholder?: string }) {
  const control = React.useContext(ControllerContext);
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
            <>
                {type === 'textarea' ? (
                    <Textarea id={name} {...field} placeholder={placeholder} />
                ) : (
                    <Input id={name} type={type} {...field} placeholder={placeholder} />
                )}
                {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
            </>
        )}
      />
    </div>
  );
}

function FormSelect({ name, label, options }: { name: string; label: string; options: string[]}) {
  const control = React.useContext(ControllerContext);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
            <SelectContent>
              {options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}

function FormRadioGroup({ name, label, options }: { name: string; label: string; options: string[]}) {
    const control = React.useContext(ControllerContext);
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        {options.map(option => (
                             <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${name}-${option}`} />
                                <Label htmlFor={`${name}-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}
            />
        </div>
    )
}

function FormCheckbox({ name, label, description }: { name: string; label: string; description: string; }) {
    const control = React.useContext(ControllerContext);
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <div className="flex items-start space-x-3">
                    <Checkbox id={name} checked={field.value as boolean} onCheckedChange={field.onChange} className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={name} className="font-semibold">{label}</Label>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
            )}
        />
    )
}
