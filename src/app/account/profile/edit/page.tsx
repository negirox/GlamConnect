
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, User, Ruler, Camera, Link as LinkIcon, Star, CheckCircle, ShieldCheck, AlertTriangle, Loader2, CircleCheck, CircleX, Trash2, HelpCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm, Controller } from 'react-hook-form';
import { Model } from "@/lib/mock-data";
import { getModelByEmail } from "@/lib/data-actions";
import { updateModel } from "@/lib/model-actions";
import { uploadImage, deleteImage } from "@/lib/upload-actions";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type UploadableFile = {
    id: string; // Unique ID for each file object
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
    locationPrefs: z.string().optional(),
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
    tattoos: z.boolean().optional(),
    tattoosDescription: z.string().optional(),
    piercings: z.boolean().optional(),
    piercingsDescription: z.string().optional(),
    scars: z.string().optional(),
    braces: z.boolean().optional(),
});
const professionalSchema = z.object({
    socialLinks: z.string().optional(),
    experience: z.string(),
    skills: z.string().optional(),
    availability: z.string(),
    yearsOfExperience: z.coerce.number().optional(),
    modelingWork: z.array(z.string()).optional(),
    previousClients: z.string().optional(),
    agencyRepresented: z.boolean().optional(),
    agencyName: z.string().optional(),
    portfolioLink: z.string().url().optional().or(z.literal('')),
    availableForBookings: z.boolean().optional(),
    willingToTravel: z.boolean().optional(),
    preferredRegions: z.string().optional(),
    timeAvailability: z.array(z.string()).optional(),
    hourlyRate: z.coerce.number().optional(),
    dayRate: z.coerce.number().optional(),
    tfp: z.boolean().optional(),
});

export default function ProfileManagementPage() {
  const { toast } = useToast();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [uploadDialog, setUploadDialog] = useState<UploadDialogState>({ isOpen: false, files: [], field: null, isMultiple: false });
  
  const router = useRouter();

  const [consentBikini, setConsentBikini] = useState(false);
  const [consentSemiNude, setConsentSemiNude] = useState(false);
  const [consentNude, setConsentNude] = useState(false);
  const [isOver18, setIsOver18] = useState(false);

  const canEnableConsent = isOver18;
  
  const fetchModel = async () => {
      setLoading(true);
      const session = await getSession();

      if (!session.isLoggedIn || !session.email) {
        router.push('/login');
        return;
      }
      const fetchedModel = await getModelByEmail(session.email);
      if (fetchedModel) {
        setModel(fetchedModel);
        setConsentBikini(fetchedModel.consentBikini || false);
        setConsentSemiNude(fetchedModel.consentSemiNude || false);
        setConsentNude(fetchedModel.consentNude || false);
      }
      setLoading(false);
  }

  useEffect(() => {
    fetchModel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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
        if(files.every(f => f.status === 'failed')) {
           toast({ title: "Upload Error", description: "All selected files are invalid.", variant: "destructive" });
        }
        return;
    }

    setUploadDialog(prev => ({
        ...prev,
        files: prev.files.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f)
    }));
    
    try {
      const oldImagePathsToDelete: string[] = [];
      if (isMultiple) {
          const oldImages = model[field] as string[] | undefined;
          if (Array.isArray(oldImages)) {
              oldImagePathsToDelete.push(...oldImages);
          }
      } else {
          const oldImage = model[field] as string | undefined;
          if (typeof oldImage === 'string' && oldImage) {
              oldImagePathsToDelete.push(oldImage);
          }
      }

      if (oldImagePathsToDelete.length > 0) {
          await Promise.all(oldImagePathsToDelete.map(img => deleteImage(img)));
      }

      const uploadPromises = filesToUpload.map(async (uploadableFile) => {
          setUploadDialog(prev => ({
              ...prev,
              files: prev.files.map(f => f.id === uploadableFile.id ? { ...f, progress: 50 } : f)
          }));
          const formData = new FormData();
          formData.append('file', uploadableFile.file);
          const result = await uploadImage(formData, MAX_FILE_SIZE_MB);
          return { ...result, originalFileId: uploadableFile.id };
      });

      const results = await Promise.allSettled(uploadPromises);

      const newPaths: string[] = [];
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
      
      setUploadDialog(prev => ({...prev, files: finalFilesState}));


      if (newPaths.length > 0) {
          const updatePayload = isMultiple 
              ? { [field]: newPaths }
              : { [field]: newPaths[0] };
          
          await updateModel(model.id, updatePayload);

          toast({
              title: "Upload Complete",
              description: `${newPaths.length} image(s) uploaded successfully.`,
          });
          await fetchModel(); 
      }
      
      const failedCount = results.filter(r => r.status === 'fulfilled' && !r.value.success).length;
      if (failedCount > 0) {
           toast({
              title: "Upload Incomplete",
              description: `${failedCount} image(s) failed to upload.`,
              variant: 'destructive'
           });
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
            files: prev.files.map(f => f.status === 'uploading' ? { ...f, status: 'failed', error: 'Process failed' } : f)
        }));
    }
  }

  const handleFormSubmit = async (tab: string, data: any) => {
    if (!model) return;

    setIsSubmitting(prev => ({...prev, [tab]: true}));
    
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
        description: `Your ${tab} information has been saved.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${tab} information.`,
        variant: "destructive",
      });
      console.error(error);
    } finally {
        setIsSubmitting(prev => ({...prev, [tab]: false}));
    }
  };

  const handleConsentSubmit = async () => {
    if (!model) return;
    setIsSubmitting(prev => ({...prev, consent: true}));
    const data = { consentBikini, consentSemiNude, consentNude };
    try {
      await updateModel(model.id, data);
      await fetchModel();
      toast({
        title: "Consent Updated",
        description: `Your consent settings have been saved.`,
      });
    } catch (error) {
       toast({
        title: "Error",
        description: `Failed to update consent settings.`,
        variant: "destructive",
      });
      console.error(error);
    } finally {
        setIsSubmitting(prev => ({...prev, consent: false}));
    }
  }

    const handleVerificationRequest = async () => {
        if (!model) return;
        setIsSubmitting(prev => ({...prev, verification: true}));
        try {
            await updateModel(model.id, { verificationStatus: 'Pending' });
            await fetchModel();
            toast({
                title: "Request Sent",
                description: "Your verification request has been submitted to the admin.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send verification request.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(prev => ({...prev, verification: false}));
        }
    }

  const basicInfoForm = useForm({
    resolver: zodResolver(profileSchema),
    values: model ? { 
        name: model.name,
        location: model.location,
        bio: model.bio || '',
        locationPrefs: model.locationPrefs || '',
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
        tattoos: model.tattoos || false,
        tattoosDescription: model.tattoosDescription || '',
        piercings: model.piercings || false,
        piercingsDescription: model.piercingsDescription || '',
        scars: model.scars || '',
        braces: model.braces || false,
      } : undefined
  })

  const professionalForm = useForm({
      resolver: zodResolver(professionalSchema),
      values: model ? {
          socialLinks: Array.isArray(model.socialLinks) ? model.socialLinks.join(', ') : model.socialLinks || '',
          experience: model.experience,
          skills: Array.isArray(model.skills) ? model.skills.join(', ') : model.skills || '',
          availability: model.availability,
          yearsOfExperience: model.yearsOfExperience || 0,
          modelingWork: model.modelingWork || [],
          previousClients: Array.isArray(model.previousClients) ? model.previousClients.join(', ') : model.previousClients || '',
          agencyRepresented: model.agencyRepresented || false,
          agencyName: model.agencyName || '',
          portfolioLink: model.portfolioLink || '',
          availableForBookings: model.availableForBookings || false,
          willingToTravel: model.willingToTravel || false,
          preferredRegions: model.preferredRegions || '',
          timeAvailability: model.timeAvailability || [],
          hourlyRate: model.hourlyRate,
          dayRate: model.dayRate,
          tfp: model.tfp || false,

      } : undefined,
  })

  if (loading) {
    return <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin"/></div>
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
              <Link href="/signup">Create an Account</Link>
            </Button>
        </div>
    )
  }
  
  const uploadInProgress = uploadDialog.files.some(f => f.status === 'uploading');
  const allUploadsFinished = !uploadInProgress && uploadDialog.files.some(f => f.status === 'success' || f.status === 'failed');
  const hasPendingFiles = uploadDialog.files.some(f => f.status === 'pending');

  return (
    <TooltipProvider>
    <Dialog open={uploadDialog.isOpen} onOpenChange={(isOpen) => !uploadInProgress && !isOpen && setUploadDialog(prev => ({...prev, isOpen: false}))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Upload</DialogTitle>
          <DialogDescription>
            Review your files before uploading. Files over {MAX_FILE_SIZE_MB}MB will be ignored.
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
    
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-headline font-bold">Manage Your Profile</h1>
        <p className="text-muted-foreground">This is your main profile editing area. Make sure to keep your details up to date!</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-primary/80">
          <TabsTrigger value="basic"><User className="mr-2 h-4 w-4"/>Basic Info</TabsTrigger>
          <TabsTrigger value="attributes"><Ruler className="mr-2 h-4 w-4"/>Attributes</TabsTrigger>
          <TabsTrigger value="portfolio"><Camera className="mr-2 h-4 w-4"/>Portfolio</TabsTrigger>
          <TabsTrigger value="professional"><Star className="mr-2 h-4 w-4"/>Professional</TabsTrigger>
          <TabsTrigger value="consent"><ShieldCheck className="mr-2 h-4 w-4"/>Consent & Safety</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <form onSubmit={basicInfoForm.handleSubmit((data) => handleFormSubmit('basic', data))}>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Basic Information</CardTitle>
                <CardDescription>
                  This information will be displayed on your public profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label>Profile Picture (Max {MAX_FILE_SIZE_MB}MB)</Label>
                    <div className="flex items-center gap-4">
                        <div className="relative h-24 w-24 rounded-full">
                            <Image src={model.profilePicture} alt="Profile Picture" fill className="rounded-full object-cover" />
                        </div>
                        <Button asChild type="button" variant="outline">
                            <Label>
                                <Upload className="mr-2 h-4 w-4" />Upload New
                                <Input type="file" className="hidden" accept="image/*" onChange={e => handleFileSelect(e, 'profilePicture', false)}/>
                             </Label>
                        </Button>
                    </div>
                 </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" {...basicInfoForm.register('name')} />
                       {basicInfoForm.formState.errors.name && <p className="text-sm text-destructive">{basicInfoForm.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location (City, Country)</Label>
                      <Input id="location" {...basicInfoForm.register('location')} />
                       {basicInfoForm.formState.errors.location && <p className="text-sm text-destructive">{basicInfoForm.formState.errors.location.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" type="date" {...basicInfoForm.register('dateOfBirth')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Gender Identity</Label>
                        <Controller
                            name="genderIdentity"
                            control={basicInfoForm.control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input id="nationality" {...basicInfoForm.register('nationality')} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="languages" className="flex items-center gap-2">Spoken Languages 
                        <Tooltip>
                            <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                            <TooltipContent><p>Enter languages separated by commas</p></TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input id="languages" {...basicInfoForm.register('spokenLanguages')} />
                    </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="location-prefs">Location Preferences</Label>
                  <Input id="location-prefs" placeholder="e.g. Willing to travel within Europe" {...basicInfoForm.register('locationPrefs')}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Short Bio</Label>
                  <Textarea id="bio" placeholder="Tell us a little about yourself" {...basicInfoForm.register('bio')}/>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button type="submit" disabled={isSubmitting.basic}>
                    {isSubmitting.basic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
                <Button variant="outline" asChild><Link href="/account/profile">Cancel</Link></Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="attributes">
            <form onSubmit={attributesForm.handleSubmit(data => handleFormSubmit('attributes', data))}>
                <Card>
                    <CardHeader>
                    <CardTitle className="font-headline">Physical Attributes</CardTitle>
                    <CardDescription>
                        Accurate measurements are crucial for brands. All measurements in cm.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input id="height" type="number" {...attributesForm.register('height')} />
                            {attributesForm.formState.errors.height && <p className="text-sm text-destructive">{attributesForm.formState.errors.height.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input id="weight" type="number" placeholder="e.g. 55" {...attributesForm.register('weight')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bust">Bust (cm)</Label>
                            <Input id="bust" type="number" {...attributesForm.register('bust')} />
                             {attributesForm.formState.errors.bust && <p className="text-sm text-destructive">{attributesForm.formState.errors.bust.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="waist">Waist (cm)</Label>
                            <Input id="waist" type="number" {...attributesForm.register('waist')} />
                             {attributesForm.formState.errors.waist && <p className="text-sm text-destructive">{attributesForm.formState.errors.waist.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hips">Hips (cm)</Label>
                            <Input id="hips" type="number" {...attributesForm.register('hips')} />
                             {attributesForm.formState.errors.hips && <p className="text-sm text-destructive">{attributesForm.formState.errors.hips.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="cupSize">Cup Size</Label>
                            <Input id="cupSize" {...attributesForm.register('cupSize')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="skinTone">Skin Tone</Label>
                            <Input id="skinTone" {...attributesForm.register('skinTone')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dressSize">Dress Size</Label>
                            <Input id="dressSize" {...attributesForm.register('dressSize')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shoe">Shoe Size (EU)</Label>
                            <Input id="shoe" type="number" {...attributesForm.register('shoeSize')} />
                             {attributesForm.formState.errors.shoeSize && <p className="text-sm text-destructive">{attributesForm.formState.errors.shoeSize.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eyes">Eye Color</Label>
                            <Controller
                                name="eyeColor"
                                control={attributesForm.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select eye color" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Blue">Blue</SelectItem>
                                        <SelectItem value="Green">Green</SelectItem>
                                        <SelectItem value="Brown">Brown</SelectItem>
                                        <SelectItem value="Hazel">Hazel</SelectItem>
                                        <SelectItem value="Grey">Grey</SelectItem>
                                        <SelectItem value="Amber">Amber</SelectItem>
                                    </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hair">Hair Color</Label>
                            <Controller
                                name="hairColor"
                                control={attributesForm.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select hair color" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Blonde">Blonde</SelectItem>
                                        <SelectItem value="Brown">Brown</SelectItem>
                                        <SelectItem value="Black">Black</SelectItem>
                                        <SelectItem value="Red">Red</SelectItem>
                                        <SelectItem value="Grey">Grey</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ethnicity">Ethnicity</Label>
                            <Input id="ethnicity" placeholder="e.g. Caucasian" {...attributesForm.register('ethnicity')} />
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-6">
                           <div className="space-y-4 pt-2">
                                <Label>Distinctive Features</Label>
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name="tattoos"
                                        control={attributesForm.control}
                                        render={({ field }) => <Checkbox id="tattoos" checked={field.value} onCheckedChange={field.onChange} />}
                                    />
                                    <Label htmlFor="tattoos">Tattoos</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name="piercings"
                                        control={attributesForm.control}
                                        render={({ field }) => <Checkbox id="piercings" checked={field.value} onCheckedChange={field.onChange} />}
                                    />
                                    <Label htmlFor="piercings">Piercings</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        name="braces"
                                        control={attributesForm.control}
                                        render={({ field }) => <Checkbox id="braces" checked={field.value} onCheckedChange={field.onChange} />}
                                    />
                                    <Label htmlFor="braces">Braces / Retainers</Label>
                                </div>
                           </div>
                           <div className="space-y-2">
                                {attributesForm.watch('tattoos') && (
                                     <div className="space-y-2">
                                        <Label htmlFor="tattoosDescription">Tattoo Description</Label>
                                        <Input id="tattoosDescription" {...attributesForm.register('tattoosDescription')} placeholder="e.g., Sleeve on left arm" />
                                     </div>
                                )}
                                {attributesForm.watch('piercings') && (
                                     <div className="space-y-2">
                                        <Label htmlFor="piercingsDescription">Piercing Description</Label>
                                        <Input id="piercingsDescription" {...attributesForm.register('piercingsDescription')} placeholder="e.g., Nose ring" />
                                     </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="scars">Scars / Birthmarks (optional)</Label>
                                    <Input id="scars" {...attributesForm.register('scars')} />
                                </div>
                           </div>
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button type="submit" disabled={isSubmitting.attributes}>
                            {isSubmitting.attributes && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Attributes
                        </Button>
                        <Button variant="outline" asChild><Link href="/account/profile">Cancel</Link></Button>
                    </CardFooter>
                </Card>
           </form>
        </TabsContent>
        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Portfolio Showcase</CardTitle>
              <CardDescription>
                Upload your best work (Max {MAX_FILE_SIZE_MB}MB per image). High-resolution images are recommended. These images are publicly visible. <span className="font-bold text-destructive">Uploading new images will replace all existing ones.</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center w-full mb-6">
                    <Label htmlFor="portfolio-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <Upload className="w-10 h-10 mb-3 text-muted-foreground"/>
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG or GIF (Max {MAX_FILE_SIZE_MB}MB each)</p>
                        <Input id="portfolio-upload" type="file" className="hidden" multiple onChange={e => handleFileSelect(e, 'portfolioImages', true)}/>
                    </Label>
                </div>
                <p className="font-semibold mt-6 mb-4">Current Portfolio ({model.portfolioImages.length} images):</p>
                <div className="grid grid-cols-3 gap-4">
                    {model.portfolioImages.map((img, i) => (
                         <div key={i} className="relative aspect-square">
                            <Image src={img} alt="portfolio image" data-ai-hint="fashion model" className="rounded-md object-cover w-full h-full" width={200} height={260}/>
                         </div>
                    ))}
                </div>
            </CardContent>
             <CardFooter>
                <Button asChild><Link href="/account/profile">Done</Link></Button>
            </CardFooter>
          </Card>
        </TabsContent>
         <TabsContent value="professional">
          <form onSubmit={professionalForm.handleSubmit(data => handleFormSubmit('professional', data))}>
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Professional Details</CardTitle>
                <CardDescription>
                    Add your experience, availability, and rates to attract brands.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Experience Level</Label>
                             <Controller
                                name="experience"
                                control={professionalForm.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your experience level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New Face">New Face</SelectItem>
                                        <SelectItem value="Experienced">Experienced</SelectItem>
                                        <SelectItem value="Expert">Expert</SelectItem>
                                    </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Years of Modeling Experience</Label>
                            <Input type="number" {...professionalForm.register('yearsOfExperience')} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label>Types of Modeling Work Done</Label>
                        <div className="grid grid-cols-3 gap-2">
                           {['Editorial', 'Commercial', 'Runway', 'Fitness', 'Swimwear', 'Semi-nude', 'Nude', 'Intimacy Photoshoot'].map(work => (
                                <div key={work} className="flex items-center space-x-2">
                                     <Controller
                                        name="modelingWork"
                                        control={professionalForm.control}
                                        render={({ field }) => {
                                            return <Checkbox
                                                checked={field.value?.includes(work)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), work])
                                                        : field.onChange(field.value?.filter((value) => value !== work))
                                                }}
                                            />
                                        }}
                                    />
                                    <Label htmlFor={work} className="font-normal">{work}</Label>
                                </div>
                           ))}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label className="flex items-center gap-2">Previous Clients/Brands
                           <Tooltip>
                            <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                            <TooltipContent><p>Enter client names separated by commas</p></TooltipContent>
                           </Tooltip>
                        </Label>
                        <Textarea {...professionalForm.register('previousClients')} />
                    </div>
                    <div className="grid grid-cols-2 gap-6 items-center">
                       <div className="flex items-center space-x-2">
                            <Controller name="agencyRepresented" control={professionalForm.control} render={({field}) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} />
                            <Label>Represented by an Agency?</Label>
                        </div>
                        {professionalForm.watch('agencyRepresented') && (
                            <div className="space-y-2">
                                <Label>Agency Name</Label>
                                <Input {...professionalForm.register('agencyName')} />
                            </div>
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label>External Portfolio Link (e.g., personal website)</Label>
                         <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                            <Input id="portfolioLink" {...professionalForm.register('portfolioLink')} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">Social Links
                           <Tooltip>
                                <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                <TooltipContent><p>Enter full URLs separated by commas</p></TooltipContent>
                           </Tooltip>
                        </Label>
                         <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                            <Input id="socialLinks" placeholder="https://instagram.com/..., https://behance.net/..." {...professionalForm.register('socialLinks')} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label>Work Availability</Label>
                        <Controller
                            name="availability"
                            control={professionalForm.control}
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Full-time" id="r-full-time" />
                                        <Label htmlFor="r-full-time">Full-time</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Part-time" id="r-part-time" />
                                        <Label htmlFor="r-part-time">Part-time</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="By Project" id="r-by-project" />
                                        <Label htmlFor="r-by-project">By Project</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6 items-center">
                        <div className="flex items-center space-x-2">
                           <Controller name="availableForBookings" control={professionalForm.control} render={({field}) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} />
                           <Label>Available for Bookings</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                           <Controller name="willingToTravel" control={professionalForm.control} render={({field}) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} />
                           <Label>Willing to Travel</Label>
                        </div>
                        {professionalForm.watch('willingToTravel') && (
                             <div className="space-y-2">
                                <Label>Preferred Work Regions/Countries</Label>
                                <Input {...professionalForm.register('preferredRegions')} />
                            </div>
                        )}
                         <div className="space-y-2 col-span-2">
                            <Label>Time Availability</Label>
                            <div className="flex gap-4">
                               <div className="flex items-center space-x-2">
                                     <Controller
                                        name="timeAvailability"
                                        control={professionalForm.control}
                                        render={({ field }) => <Checkbox
                                            checked={field.value?.includes('Weekdays')}
                                            onCheckedChange={(checked) => {
                                                const current = field.value || [];
                                                return checked ? field.onChange([...current, 'Weekdays']) : field.onChange(current.filter(v => v !== 'Weekdays'));
                                            }}
                                        />}
                                    />
                                    <Label>Weekdays</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                     <Controller
                                        name="timeAvailability"
                                        control={professionalForm.control}
                                        render={({ field }) => <Checkbox
                                            checked={field.value?.includes('Weekends')}
                                            onCheckedChange={(checked) => {
                                                const current = field.value || [];
                                                return checked ? field.onChange([...current, 'Weekends']) : field.onChange(current.filter(v => v !== 'Weekends'));
                                            }}
                                        />}
                                    />
                                    <Label>Weekends</Label>
                                </div>
                            </div>
                         </div>
                    </div>
                    <div className="space-y-4 border p-4 rounded-md">
                        <h4 className="font-semibold">Rates (Optional/Private)</h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Hourly Rate ($)</Label>
                                <Input type="number" {...professionalForm.register('hourlyRate')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Half-day/Full-day Rate ($)</Label>
                                <Input type="number" {...professionalForm.register('dayRate')} />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Controller name="tfp" control={professionalForm.control} render={({field}) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} />
                           <Label>Open to TFP (Time for Print) Shoots</Label>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label className="flex items-center gap-2">Skills/Tags
                           <Tooltip>
                                <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                <TooltipContent><p>Enter skills separated by commas</p></TooltipContent>
                           </Tooltip>
                        </Label>
                        <Input id="skills" placeholder="e.g. Runway, Commercial, Editorial, Print" {...professionalForm.register('skills')} />
                    </div>
                    <div className="flex items-start space-x-3 rounded-md border p-4">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div className="space-y-1">
                            <p className="font-semibold">Verification Badge</p>
                            <p className="text-sm text-muted-foreground">
                                Your profile is currently <span className="font-bold">{model.verificationStatus}</span>. 
                                Submit your profile for manual review to get a verified badge. This increases trust with brands.
                            </p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={handleVerificationRequest} disabled={model.verificationStatus === 'Pending' || model.verificationStatus === 'Verified' || isSubmitting.verification}>
                               {isSubmitting.verification && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                {model.verificationStatus === 'Pending' ? 'Request Pending' : model.verificationStatus === 'Verified' ? 'Verified' : 'Request Verification'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button type="submit" disabled={isSubmitting.professional}>
                    {isSubmitting.professional && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Professional Details
                  </Button>
                  <Button variant="outline" asChild><Link href="/account/profile">Cancel</Link></Button>
                </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="consent">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><ShieldCheck className="mr-2" /> Consent & Safety</CardTitle>
              <CardDescription>
                Manage your consent for different types of shoots. Your safety is our priority. This content is private and only shown to verified brands after they accept your terms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert variant="destructive" className="flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-3 mt-1"/>
                    <div>
                        <AlertTitle>Age Verification Required</AlertTitle>
                        <AlertDescription>
                            You must be 18 years or older to provide consent for sensitive content shoots. Please confirm your age to proceed.
                        </AlertDescription>
                        <div className="flex items-center space-x-2 mt-4">
                            <Checkbox id="age-verification" checked={isOver18} onCheckedChange={(checked) => setIsOver18(checked as boolean)} />
                            <Label htmlFor="age-verification">I confirm I am 18 years of age or older.</Label>
                        </div>
                    </div>
                </Alert>

                <div className="space-y-4 p-4 border rounded-lg" data-disabled={!canEnableConsent}>
                    <div className="flex items-start space-x-3">
                        <Checkbox id="consent-bikini" disabled={!canEnableConsent} checked={consentBikini} onCheckedChange={(checked) => setConsentBikini(checked as boolean)} />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="consent-bikini" className="font-semibold">Bikini Shoots</Label>
                            <p className="text-sm text-muted-foreground">I consent to be considered for shoots that require wearing swimwear or bikini.</p>
                        </div>
                    </div>
                    {consentBikini && canEnableConsent && (
                         <div className="pl-6 space-y-4">
                            <p className="font-semibold">Upload Bikini Portfolio (Max {MAX_FILE_SIZE_MB}MB/image, <span className="font-bold text-destructive">replaces existing</span>)</p>
                             <div className="flex items-center justify-center w-full">
                                <Label htmlFor="dropzone-bikini" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-sm">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground"/>
                                        <p>Click to upload or drag & drop</p>
                                    </div>
                                    <Input id="dropzone-bikini" type="file" className="hidden" multiple onChange={e => handleFileSelect(e, 'bikiniPortfolioImages', true)}/>
                                </Label>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {model.bikiniPortfolioImages?.map((img, i) => (
                                    <div key={i} className="relative aspect-square">
                                        <Image src={img} alt="bikini portfolio image" className="rounded-md object-cover w-full h-full" width={100} height={100}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4 p-4 border rounded-lg" data-disabled={!canEnableConsent}>
                    <div className="flex items-start space-x-3">
                        <Checkbox id="consent-semi-nude" disabled={!canEnableConsent} checked={consentSemiNude} onCheckedChange={(checked) => setConsentSemiNude(checked as boolean)}/>
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="consent-semi-nude" className="font-semibold">Semi-Nude Shoots</Label>
                            <p className="text-sm text-muted-foreground">I consent to be considered for tasteful, artistic semi-nude shoots as per platform guidelines.</p>
                        </div>
                    </div>
                      {consentSemiNude && canEnableConsent && (
                         <div className="pl-6 space-y-4">
                            <p className="font-semibold">Upload Semi-Nude Portfolio (Max {MAX_FILE_SIZE_MB}MB/image, <span className="font-bold text-destructive">replaces existing</span>)</p>
                             <div className="flex items-center justify-center w-full">
                                <Label htmlFor="dropzone-semi-nude" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-sm">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground"/>
                                        <p>Click to upload or drag & drop</p>
                                    </div>
                                    <Input id="dropzone-semi-nude" type="file" className="hidden" multiple onChange={e => handleFileSelect(e, 'semiNudePortfolioImages', true)}/>
                                </Label>
                            </div>
                             <div className="grid grid-cols-4 gap-2">
                                {model.semiNudePortfolioImages?.map((img, i) => (
                                    <div key={i} className="relative aspect-square">
                                        <Image src={img} alt="semi-nude portfolio image" className="rounded-md object-cover w-full h-full" width={100} height={100}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4 p-4 border rounded-lg" data-disabled={!canEnableConsent}>
                    <div className="flex items-start space-x-3">
                        <Checkbox id="consent-nude" disabled={!canEnableConsent} checked={consentNude} onCheckedChange={(checked) => setConsentNude(checked as boolean)}/>
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="consent-nude" className="font-semibold">Nude Shoots</Label>
                            <p className="text-sm text-muted-foreground">I consent to be considered for artistic nude shoots, understanding they must comply with platform terms.</p>
                        </div>
                    </div>
                     {consentNude && canEnableConsent && (
                         <div className="pl-6 space-y-4">
                            <p className="font-semibold">Upload Nude Portfolio (Max {MAX_FILE_SIZE_MB}MB/image, <span className="font-bold text-destructive">replaces existing</span>)</p>
                             <div className="flex items-center justify-center w-full">
                                <Label htmlFor="dropzone-nude" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-sm">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground"/>
                                        <p>Click to upload or drag & drop</p>
                                    </div>
                                    <Input id="dropzone-nude" type="file" className="hidden" multiple onChange={e => handleFileSelect(e, 'nudePortfolioImages', true)}/>
                                 </Label>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {model.nudePortfolioImages?.map((img, i) => (
                                    <div key={i} className="relative aspect-square">
                                        <Image src={img} alt="nude portfolio image" className="rounded-md object-cover w-full h-full" width={100} height={100}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </CardContent>
            <CardFooter className="gap-2">
                <Button onClick={handleConsentSubmit} disabled={!canEnableConsent || isSubmitting.consent}>
                    {isSubmitting.consent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Consent Settings
                </Button>
                <Button variant="outline" asChild><Link href="/account/profile">Cancel</Link></Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
}
