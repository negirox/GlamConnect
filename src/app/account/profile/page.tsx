
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getModelByEmail } from '@/lib/data-actions';
import type { Model } from '@/lib/mock-data';
import { User, Ruler, Star, ShieldCheck, MapPin, Edit, BadgeCheck, Weight, PersonStanding, Palette, Eye, Briefcase, CalendarDays, Tag, Loader2, Link as LinkIcon, AlertCircle, Clock, Upload, CircleCheck, CircleX, Trash2, Languages, Cake, Flag, Venus, Sigma, Hand, Info, PiggyBank, HelpCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getSession } from '@/lib/auth-actions';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { updateModel } from '@/lib/model-actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { uploadImage, deleteImage } from "@/lib/upload-actions";
import { Progress } from "@/components/ui/progress";
import { ProfileCompletionCard } from '@/components/profile-completion-card';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type UploadableFile = {
    id: string;
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'failed';
    error?: string;
    progress: number;
}

type UploadDialogState = {
    isOpen: boolean;
    files: UploadableFile[];
    field: keyof Model | null;
    isMultiple: boolean;
}

const profileSchema = z.object({
    name: z.string().min(1, 'Full Name is required'),
    location: z.string().min(1, 'Location is required'),
    bio: z.string().optional(),
    genderIdentity: z.string().optional(),
    dateOfBirth: z.string().optional(),
    nationality: z.string().optional(),
    spokenLanguages: z.string().optional(),
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
    cupSize: z.string().optional(),
    skinTone: z.string().optional(),
    dressSize: z.string().optional(),
});
const professionalSchema = z.object({
    experience: z.string(),
    yearsOfExperience: z.coerce.number().optional(),
    modelingWork: z.array(z.string()).optional(),
    previousClients: z.string().optional(),
    agencyRepresented: z.boolean().optional(),
    agencyName: z.string().optional(),
    portfolioLink: z.string().url().optional().or(z.literal('')),
    availability: z.string(),
    willingToTravel: z.boolean().optional(),
    preferredRegions: z.string().optional(),
    timeAvailability: z.array(z.string()).optional(),
    socialLinks: z.string().optional(),
    skills: z.string().optional(),
});
const ratesSchema = z.object({
    hourlyRate: z.coerce.number().optional(),
    dayRate: z.coerce.number().optional(),
    tfp: z.boolean().optional(),
});

export default function ProfileDashboardPage() {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [uploadDialog, setUploadDialog] = useState<UploadDialogState>({ isOpen: false, files: [], field: null, isMultiple: false });

  const router = useRouter();
  const { toast } = useToast();

  const fetchModel = async () => {
    const session = await getSession();
    if (!session.isLoggedIn || !session.email) {
      router.push('/login');
      return;
    }
    try {
      if(!editingSection) setLoading(true); // Only show main loader if not editing
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

  const handleFormSubmit = async (section: string, data: any) => {
    if (!model) return;

    setIsSubmitting(prev => ({...prev, [section]: true}));
    
    const fieldsToSplit = ['skills', 'socialLinks', 'spokenLanguages', 'previousClients'];
    fieldsToSplit.forEach(field => {
      if (data[field] && typeof data[field] === 'string') {
        data[field] = data[field].split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    });

    try {
      await updateModel(model.id, data);
      await fetchModel(); 
      toast({
        title: "Profile Updated",
        description: `Your ${section} information has been saved.`,
      });
      setEditingSection(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${section} information.`,
        variant: "destructive",
      });
      console.error(error);
    } finally {
        setIsSubmitting(prev => ({...prev, [section]: false}));
    }
  };

  const basicInfoForm = useForm({
    resolver: zodResolver(profileSchema),
    values: model ? { 
        name: model.name,
        location: model.location,
        bio: model.bio || '',
        genderIdentity: model.genderIdentity || '',
        dateOfBirth: model.dateOfBirth || '',
        nationality: model.nationality || '',
        spokenLanguages: Array.isArray(model.spokenLanguages) ? model.spokenLanguages.join(', ') : model.spokenLanguages || '',
    } : undefined,
  });

  const attributesForm = useForm({
      resolver: zodResolver(attributesSchema),
      values: model ? {
        height: model.height,
        weight: model.weight,
        bust: model.bust,
        waist: model.waist,
        hips: model.hips,
        shoeSize: model.shoeSize,
        eyeColor: model.eyeColor,
        hairColor: model.hairColor,
        ethnicity: model.ethnicity || '',
        cupSize: model.cupSize || '',
        skinTone: model.skinTone || '',
        dressSize: model.dressSize || '',
      } : undefined
  })

  const professionalForm = useForm({
      resolver: zodResolver(professionalSchema),
      values: model ? {
          experience: model.experience,
          yearsOfExperience: model.yearsOfExperience || 0,
          modelingWork: Array.isArray(model.modelingWork) ? model.modelingWork : [],
          previousClients: Array.isArray(model.previousClients) ? model.previousClients.join(', ') : model.previousClients || '',
          agencyRepresented: model.agencyRepresented || false,
          agencyName: model.agencyName || '',
          portfolioLink: model.portfolioLink || '',
          availability: model.availability,
          willingToTravel: model.willingToTravel || false,
          preferredRegions: model.preferredRegions || '',
          timeAvailability: Array.isArray(model.timeAvailability) ? model.timeAvailability : [],
          socialLinks: Array.isArray(model.socialLinks) ? model.socialLinks.join(', ') : model.socialLinks || '',
          skills: Array.isArray(model.skills) ? model.skills.join(', ') : model.skills || '',
      } : undefined,
  })
  
  const ratesForm = useForm({
    resolver: zodResolver(ratesSchema),
    values: model ? {
        hourlyRate: model.hourlyRate,
        dayRate: model.dayRate,
        tfp: model.tfp,
    } : undefined,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Model, isMultiple: boolean) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    setUploadDialog({
        isOpen: true,
        files: files.map((f, i) => ({
            id: `${f.name}-${i}`,
            file: f,
            status: f.size > MAX_FILE_SIZE_BYTES ? 'failed' : 'pending',
            error: f.size > MAX_FILE_SIZE_BYTES ? `File exceeds ${MAX_FILE_SIZE_MB}MB` : undefined,
            progress: 0,
        })),
        field,
        isMultiple,
    });

    e.target.value = "";
  };
  
  const removeFileFromQueue = (fileId: string) => {
      setUploadDialog(prev => ({
          ...prev,
          files: prev.files.filter(f => f.id !== fileId)
      }));
  }

  const startUpload = async () => {
    if (!model || !uploadDialog.field) return;
  
    const { field, files, isMultiple } = uploadDialog;
  
    const filesToUpload = files.filter(f => f.status === 'pending');
    if (filesToUpload.length === 0) {
      if (files.every(f => f.status === 'failed')) {
        toast({ title: "Upload Error", description: `All selected files are invalid. Max size is ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
      }
      return;
    }
  
    setUploadDialog(prev => ({
      ...prev,
      files: prev.files.map(f => (f.status === 'pending' ? { ...f, status: 'uploading' } : f)),
    }));
  
    try {
      if (isMultiple) {
        const oldImages = (model[field] as string[]) || [];
        if (oldImages.length > 0) {
          await Promise.all(oldImages.map(img => deleteImage(img)));
        }
      } else if (filesToUpload.length > 0) {
        const oldImage = model[field] as string | undefined;
        if (oldImage) {
          await deleteImage(oldImage);
        }
      }
  
      const uploadPromises = filesToUpload.map(async (uploadableFile) => {
        setUploadDialog(prev => ({
          ...prev,
          files: prev.files.map(f => (f.id === uploadableFile.id ? { ...f, progress: 50 } : f)),
        }));
        const formData = new FormData();
        formData.append('file', uploadableFile.file);
        const result = await uploadImage(formData, MAX_FILE_SIZE_MB);
        return { ...result, originalFileId: uploadableFile.id };
      });
  
      const results = await Promise.allSettled(uploadPromises);
  
      let newPaths: string[] = [];
      const finalFilesState = [...uploadDialog.files];
  
      results.forEach(result => {
        if (result.status === 'rejected') {
          console.error("An upload promise was rejected:", result.reason);
          return;
        }
  
        const { originalFileId, success, filePath, message } = result.value;
        const fileIndex = finalFilesState.findIndex(f => f.id === originalFileId);
  
        if (fileIndex === -1) return;
  
        if (success && filePath) {
          newPaths.push(filePath);
          finalFilesState[fileIndex] = { ...finalFilesState[fileIndex], status: 'success', progress: 100 };
        } else {
          finalFilesState[fileIndex] = { ...finalFilesState[fileIndex], status: 'failed', error: message || 'An unknown error occurred.', progress: 0 };
        }
      });
  
      setUploadDialog(prev => ({ ...prev, files: finalFilesState }));
  
      if (newPaths.length > 0) {
        const updatePayload = isMultiple ? { [field]: newPaths } : { [field]: newPaths[0] };
        await updateModel(model.id, updatePayload);
        setModel(prevModel => (prevModel ? { ...prevModel, ...updatePayload } : null));
        toast({
          title: "Upload Complete",
          description: `${newPaths.length} image(s) uploaded successfully.`,
        });
      }
  
      const failedCount = results.filter(r => r.status === 'fulfilled' && !r.value.success).length;
      if (failedCount > 0) {
        toast({
          title: "Upload Incomplete",
          description: `${failedCount} image(s) failed to upload.`,
          variant: 'destructive',
        });
      }
  
      const uploadsStillInProgress = finalFilesState.some(f => ['uploading', 'pending'].includes(f.status));
      if (!uploadsStillInProgress) {
        setTimeout(() => {
          setUploadDialog({ isOpen: false, files: [], field: null, isMultiple: false });
        }, 1000);
      }
  
    } catch (error: any) {
      console.error("Upload process failed", error);
      toast({
        title: "Upload Process Failed",
        description: error.message || "An unexpected error occurred during the upload process.",
        variant: "destructive",
      });
      setUploadDialog(prev => ({
        ...prev,
        files: prev.files.map(f => (f.status === 'uploading' ? { ...f, status: 'failed', error: 'Process failed' } : f)),
      }));
    }
  }


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
  
  const getWorkTypes = () => {
    if (!model.modelingWork) return [];
    if (Array.isArray(model.modelingWork)) return model.modelingWork;
    if (typeof model.modelingWork === 'string') return model.modelingWork.split(';').map(s => s.trim());
    return [];
  };

  const workTypes = getWorkTypes();

  const getVerificationBadge = () => {
    const statusMap = {
      'Verified': { icon: BadgeCheck, color: 'text-blue-500', text: 'Verified' },
      'Pending': { icon: Clock, color: 'text-orange-500', text: 'Pending Verification' },
      'Not Verified': { icon: AlertCircle, color: 'text-muted-foreground', text: 'Not Verified' },
    };
    
    const currentStatus = model.verificationStatus || 'Not Verified';
    const { icon: Icon, color, text } = statusMap[currentStatus];

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                     <Icon className={`h-7 w-7 ${color}`} />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
  }

  const uploadInProgress = uploadDialog.files.some(f => f.status === 'uploading');
  const allUploadsFinished = !uploadInProgress && uploadDialog.files.some(f => f.status === 'success' || f.status === 'failed');
  const hasPendingFiles = uploadDialog.files.some(f => f.status === 'pending');

  return (
    <TooltipProvider>
    <Dialog open={uploadDialog.isOpen} onOpenChange={(isOpen) => !uploadInProgress && !isOpen && setUploadDialog(prev => ({...prev, isOpen: false}))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
          <DialogDescription>
            Review your files before uploading. New images will replace existing ones. Files over {MAX_FILE_SIZE_MB}MB will be ignored.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {uploadDialog.files.map((f) => (
                <div key={f.id} className="flex items-center gap-4 p-2 rounded-md">
                   <div className="flex-shrink-0">
                        {f.status === 'pending' && <CircleCheck className="h-5 w-5 text-green-500" />}
                        {f.status === 'uploading' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                        {f.status === 'success' && <CircleCheck className="h-5 w-5 text-green-500" />}
                        {f.status === 'failed' && <CircleX className="h-5 w-5 text-destructive" />}
                   </div>
                   <div className="flex-1 truncate">
                        <p className="font-medium truncate">{f.file.name}</p>
                        <p className="text-sm text-muted-foreground">{(f.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        {f.status === 'uploading' && <Progress value={f.progress} className="h-2 mt-1" />}
                        {f.status === 'failed' && <p className="text-sm text-destructive">{f.error}</p>}
                   </div>
                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFileFromQueue(f.id)} disabled={f.status === 'uploading' || f.status === 'success'}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                   </Button>
                </div>
            ))}
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialog(prev => ({...prev, isOpen: false}))} disabled={uploadInProgress}>
                {allUploadsFinished ? 'Close' : 'Cancel'}
            </Button>
            <Button onClick={startUpload} disabled={!hasPendingFiles || uploadInProgress}>
                {uploadInProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploadInProgress ? 'Uploading...' : `Start Upload`}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div className="container mx-auto max-w-5xl px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 rounded-full group">
                <Image
                src={model.profilePicture}
                alt={model.name}
                data-ai-hint="fashion model"
                fill
                className="rounded-full object-cover"
                />
                 <Button asChild variant="outline" size="icon" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Label>
                        <Edit className="h-4 w-4"/>
                        <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'profilePicture', false)} />
                    </Label>
                </Button>
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
      
      <ProfileCompletionCard model={model} />

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center font-headline"><User className="mr-3" /> Basic Information</CardTitle>
             <Dialog open={editingSection === 'basic'} onOpenChange={(isOpen) => !isOpen && setEditingSection(null)}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setEditingSection('basic')}><Edit className="h-4 w-4"/></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Basic Information</DialogTitle>
                    </DialogHeader>
                    <Form {...basicInfoForm}>
                    <form onSubmit={basicInfoForm.handleSubmit((data) => handleFormSubmit('basic', data))} className="space-y-4">
                       <FormField control={basicInfoForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                       <FormField control={basicInfoForm.control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={basicInfoForm.control} name="dateOfBirth" render={({ field }) => (
                            <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={basicInfoForm.control} name="genderIdentity" render={({ field }) => (
                            <FormItem><FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField control={basicInfoForm.control} name="nationality" render={({ field }) => (
                            <FormItem><FormLabel>Nationality</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={basicInfoForm.control} name="spokenLanguages" render={({ field }) => (
                            <FormItem><FormLabel>Spoken Languages (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={basicInfoForm.control} name="bio" render={({ field }) => (
                            <FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting.basic}>
                                {isSubmitting.basic && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                    </Form>
                </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><p className="font-semibold flex items-center gap-2"><Venus className="text-muted-foreground"/>Gender</p><p className="text-muted-foreground pl-6">{model.genderIdentity || 'N/A'}</p></div>
                <div><p className="font-semibold flex items-center gap-2"><Cake className="text-muted-foreground"/>Date of Birth</p><p className="text-muted-foreground pl-6">{model.dateOfBirth || 'N/A'}</p></div>
                <div><p className="font-semibold flex items-center gap-2"><Flag className="text-muted-foreground"/>Nationality</p><p className="text-muted-foreground pl-6">{model.nationality || 'N/A'}</p></div>
                <div><p className="font-semibold flex items-center gap-2"><Languages className="text-muted-foreground"/>Languages</p><p className="text-muted-foreground pl-6">{Array.isArray(model.spokenLanguages) ? model.spokenLanguages.join(', ') : model.spokenLanguages || 'N/A'}</p></div>
            </div>
            <Separator />
            <div><p className="font-semibold">Bio</p><p className="text-muted-foreground">{model.bio || 'Not provided'}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center font-headline"><Ruler className="mr-3" /> Physical Attributes</CardTitle>
            <Dialog open={editingSection === 'attributes'} onOpenChange={(isOpen) => !isOpen && setEditingSection(null)}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setEditingSection('attributes')}><Edit className="h-4 w-4"/></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Physical Attributes</DialogTitle></DialogHeader>
                    <Form {...attributesForm}>
                    <form onSubmit={attributesForm.handleSubmit(data => handleFormSubmit('attributes', data))} className="grid grid-cols-2 gap-4">
                        <FormField control={attributesForm.control} name="height" render={({ field }) => (
                            <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={attributesForm.control} name="weight" render={({ field }) => (
                            <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={attributesForm.control} name="bust" render={({ field }) => (
                            <FormItem><FormLabel>Bust (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={attributesForm.control} name="waist" render={({ field }) => (
                            <FormItem><FormLabel>Waist (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={attributesForm.control} name="hips" render={({ field }) => (
                            <FormItem><FormLabel>Hips (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={attributesForm.control} name="shoeSize" render={({ field }) => (
                            <FormItem><FormLabel>Shoe Size (EU)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={attributesForm.control} name="cupSize" render={({ field }) => (
                            <FormItem><FormLabel>Cup Size</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={attributesForm.control} name="dressSize" render={({ field }) => (
                            <FormItem><FormLabel>Dress Size</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={attributesForm.control} name="hairColor" render={({ field }) => (
                            <FormItem><FormLabel>Hair Color</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={attributesForm.control} name="eyeColor" render={({ field }) => (
                            <FormItem><FormLabel>Eye Color</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <DialogFooter className="col-span-2">
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting.attributes}>
                               {isSubmitting.attributes && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                    </Form>
                </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-start"><PersonStanding className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Height</p><p className="text-muted-foreground">{model.height} cm</p></div></div>
            <div className="flex items-start"><Weight className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Weight</p><p className="text-muted-foreground">{model.weight ? `${model.weight} kg` : 'N/A'}</p></div></div>
            <div className="flex items-start"><Ruler className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Measurements</p><p className="text-muted-foreground">{`${model.bust}-${model.waist}-${model.hips} cm`}</p></div></div>
            <div className="flex items-start"><Sigma className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Cup Size</p><p className="text-muted-foreground">{model.cupSize || 'N/A'}</p></div></div>
            <div className="flex items-start"><Eye className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Eye Color</p><p className="text-muted-foreground">{model.eyeColor}</p></div></div>
            <div className="flex items-start"><Palette className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Hair Color</p><p className="text-muted-foreground">{model.hairColor}</p></div></div>
            <div className="flex items-start"><Info className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Dress Size</p><p className="text-muted-foreground">{model.dressSize || 'N/A'}</p></div></div>
            <div className="flex items-start"><Tag className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Ethnicity</p><p className="text-muted-foreground">{model.ethnicity || 'N/A'}</p></div></div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center font-headline"><Star className="mr-3" /> Professional Details</CardTitle>
             <Dialog open={editingSection === 'professional'} onOpenChange={(isOpen) => !isOpen && setEditingSection(null)}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setEditingSection('professional')}><Edit className="h-4 w-4"/></Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Edit Professional Details</DialogTitle></DialogHeader>
                    <Form {...professionalForm}>
                    <form onSubmit={professionalForm.handleSubmit(data => handleFormSubmit('professional', data))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={professionalForm.control} name="experience" render={({ field }) => (
                                <FormItem><FormLabel>Experience Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="New Face">New Face</SelectItem>
                                            <SelectItem value="Experienced">Experienced</SelectItem>
                                            <SelectItem value="Expert">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )}/>
                            <FormField control={professionalForm.control} name="yearsOfExperience" render={({ field }) => (
                                <FormItem><FormLabel>Years of Experience</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField
                            control={professionalForm.control}
                            name="modelingWork"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Modeling Work Done</FormLabel>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Editorial', 'Commercial', 'Runway', 'Fitness', 'Swimwear', 'Semi-nude', 'Nude', 'Intimacy Photoshoot'].map((item) => (
                                            <FormField
                                                key={item}
                                                control={professionalForm.control}
                                                name="modelingWork"
                                                render={({ field }) => (
                                                    <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), item])
                                                                        : field.onChange(field.value?.filter((value) => value !== item));
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{item}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField control={professionalForm.control} name="skills" render={({ field }) => (
                            <FormItem><FormLabel>Skills (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting.professional}>
                               {isSubmitting.professional && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                    </Form>
                </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start"><Briefcase className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Experience</p><p className="text-muted-foreground">{model.experience} ({model.yearsOfExperience || 0} years)</p></div></div>
             <div className="flex items-start"><CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" /><div><p className="font-semibold">Availability</p><p className="text-muted-foreground">{model.availability} ({Array.isArray(model.timeAvailability) ? model.timeAvailability.join(', ') : ''})</p></div></div>
            <div><p className="font-semibold flex items-center gap-2"><Hand className="text-muted-foreground"/>Modeling Work</p><div className="flex flex-wrap gap-2 mt-1 pl-6">{workTypes.length > 0 ? workTypes.map((work, i) => (<Badge key={i} variant="secondary">{work}</Badge>)) : <p className="text-sm text-muted-foreground">No specific work types listed.</p>}</div></div>
            <div><p className="font-semibold">Skills</p><div className="flex flex-wrap gap-2 mt-1">{Array.isArray(model.skills) && model.skills.length > 0 ? model.skills.map((skill, i) => (<Badge key={i} variant="secondary">{skill.trim()}</Badge>)) : <p className="text-sm text-muted-foreground">No skills listed.</p>}</div></div>
            <div><p className="font-semibold">Social & Portfolio Links</p><div className="flex flex-wrap gap-2 mt-1">{Array.isArray(model.socialLinks) && model.socialLinks.map((link, i) => (<Button key={i} asChild variant="outline" size="sm"><a href={link} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2" /> Social</a></Button>))} {model.portfolioLink && <Button asChild variant="outline" size="sm"><a href={model.portfolioLink} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2" /> Portfolio</a></Button>}</div></div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center font-headline"><PiggyBank className="mr-3" /> Rates & Consent</CardTitle>
            <Dialog open={editingSection === 'rates'} onOpenChange={(isOpen) => !isOpen && setEditingSection(null)}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setEditingSection('rates')}><Edit className="h-4 w-4"/></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Rates & Consent</DialogTitle></DialogHeader>
                    <Form {...ratesForm}>
                    <form onSubmit={ratesForm.handleSubmit(data => handleFormSubmit('rates', data))} className="space-y-4">
                         <FormField control={ratesForm.control} name="hourlyRate" render={({ field }) => (
                            <FormItem><FormLabel>Hourly Rate ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={ratesForm.control} name="dayRate" render={({ field }) => (
                            <FormItem><FormLabel>Day Rate ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField
                            control={ratesForm.control} name="tfp"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none"><FormLabel>Open to TFP (Time for Print)</FormLabel></div>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting.rates}>
                               {isSubmitting.rates && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                    </Form>
                </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
             <div><p className="font-semibold">Rates</p><p className="text-muted-foreground">Hourly: ${model.hourlyRate || 'N/A'} | Day: ${model.dayRate || 'N/A'}</p><p className="text-muted-foreground">TFP: {model.tfp ? 'Yes' : 'No'}</p></div>
             <Separator/>
            <div>
                <p className="font-semibold">Consent Settings</p>
                <div className="space-y-1 mt-1 text-muted-foreground">
                    <p>Bikini Shoots: <Badge variant={model.consentBikini ? "default" : "outline"}>{model.consentBikini ? 'Consented' : 'Not Consented'}</Badge></p>
                    <p>Semi-Nude Shoots: <Badge variant={model.consentSemiNude ? "default" : "outline"}>{model.consentSemiNude ? 'Consented' : 'Not Consented'}</Badge></p>
                    <p>Nude Shoots: <Badge variant={model.consentNude ? "default" : "outline"}>{model.consentNude ? 'Consented' : 'Not Consented'}</Badge></p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

       <Separator className="my-8" />
       
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-headline font-bold">Portfolio</h2>
                <Button asChild variant="outline">
                    <Label>
                        <Upload className="mr-2 h-4 w-4" /> Edit Portfolio
                         <Input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept="image/*"
                            onChange={e => handleFileSelect(e, 'portfolioImages', true)}
                        />
                    </Label>
                </Button>
            </div>
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
    </TooltipProvider>
  );
}
