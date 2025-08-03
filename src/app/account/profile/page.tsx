
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
import { Upload, User, Ruler, Camera, Link as LinkIcon, Star, CheckCircle, MapPin, BadgeCheck, Tag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ProfileManagementPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
      <div className="flex items-center mb-8">
        <h1 className="text-4xl font-headline font-bold">Manage Your Profile</h1>
        <BadgeCheck className="ml-4 h-8 w-8 text-blue-500" />
      </div>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-primary/80">
          <TabsTrigger value="basic"><User className="mr-2 h-4 w-4"/>Basic Info</TabsTrigger>
          <TabsTrigger value="attributes"><Ruler className="mr-2 h-4 w-4"/>Attributes</TabsTrigger>
          <TabsTrigger value="portfolio"><Camera className="mr-2 h-4 w-4"/>Portfolio</TabsTrigger>
          <TabsTrigger value="professional"><Star className="mr-2 h-4 w-4"/>Professional</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Basic Information</CardTitle>
              <CardDescription>
                This information will be displayed on your public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Anastasia Petrova" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="Paris, France" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="location-prefs">Location Preferences</Label>
                <Input id="location-prefs" placeholder="e.g. Willing to travel within Europe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea id="bio" placeholder="Tell us a little about yourself" defaultValue="Experienced fashion model based in Paris. Passionate about haute couture and editorial work. Open to travel for projects."/>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="attributes">
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
                <Input id="height" type="number" defaultValue="178" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="e.g. 55" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bust">Bust (cm)</Label>
                <Input id="bust" type="number" defaultValue="82" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waist">Waist (cm)</Label>
                <Input id="waist" type="number" defaultValue="60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hips">Hips (cm)</Label>
                <Input id="hips" type="number" defaultValue="89" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shoe">Shoe Size (EU)</Label>
                <Input id="shoe" type="number" defaultValue="39" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="eyes">Eye Color</Label>
                 <Select name="eyes">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="hair">Hair Color</Label>
                 <Select name="hair">
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
              </div>
               <div className="space-y-2">
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <Input id="ethnicity" placeholder="e.g. Caucasian" />
              </div>
              <div className="space-y-4 pt-2">
                <Label>Tattoos/Piercings</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox id="tattoos" />
                    <Label htmlFor="tattoos">Tattoos</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="piercings" />
                    <Label htmlFor="piercings">Piercings</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Attributes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Portfolio Showcase</CardTitle>
              <CardDescription>
                Upload your best work. High-resolution images are recommended.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-6">
                    <Label htmlFor="category">Image Category</Label>
                    <Select name="category" defaultValue="editorial">
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="editorial">Editorial</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="traditional">Traditional</SelectItem>
                            <SelectItem value="runway">Runway</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-center w-full">
                    <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-muted-foreground"/>
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or GIF (High-resolution recommended)</p>
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" multiple />
                    </Label>
                </div> 
                <p className="font-semibold mt-6 mb-4">Current Portfolio:</p>
                <div className="grid grid-cols-3 gap-4">
                    <div className="relative aspect-square"><img src="https://placehold.co/400x400" alt="portfolio image" data-ai-hint="editorial fashion" className="rounded-md object-cover w-full h-full"/><div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">Editorial</div></div>
                    <div className="relative aspect-square"><img src="https://placehold.co/400x400" alt="portfolio image" data-ai-hint="casual fashion" className="rounded-md object-cover w-full h-full"/><div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">Casual</div></div>
                    <div className="relative aspect-square"><img src="https://placehold.co/400x400" alt="portfolio image" data-ai-hint="commercial fashion" className="rounded-md object-cover w-full h-full"/><div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">Commercial</div></div>
                </div>
            </CardContent>
            <CardFooter>
              <Button>Update Portfolio</Button>
            </CardFooter>
          </Card>
        </TabsContent>
         <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Professional Details</CardTitle>
              <CardDescription>
                Add your social media, experience, and availability to attract brands.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Social Links</Label>
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                        <Input id="instagram" placeholder="Instagram URL" />
                    </div>
                     <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground"/>
                        <Input id="behance" placeholder="Behance URL" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Experience Level</Label>
                     <Select name="experience">
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New Face">New Face</SelectItem>
                        <SelectItem value="Experienced">Experienced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Skills/Tags</Label>
                    <Input id="skills" placeholder="e.g. Runway, Commercial, Editorial, Print" />
                    <p className="text-xs text-muted-foreground">Separate skills with commas.</p>
                </div>
                <div className="space-y-3">
                    <Label>Work Availability</Label>
                     <RadioGroup name="availability" defaultValue="Full-time">
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
                </div>
                 <div className="flex items-start space-x-3 rounded-md border p-4">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="space-y-1">
                        <p className="font-semibold">Verification Badge</p>
                        <p className="text-sm text-muted-foreground">Request a manual verification to get a badge on your profile. This increases trust with brands.</p>
                        <Button variant="outline" size="sm" className="mt-2">Request Verification</Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
              <Button>Save Professional Details</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
