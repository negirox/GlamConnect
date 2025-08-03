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
import { Upload, User, Ruler, Camera } from "lucide-react";

export default function ProfileManagementPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
      <h1 className="text-4xl font-headline font-bold mb-8">Manage Your Profile</h1>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-primary/80">
          <TabsTrigger value="basic"><User className="mr-2 h-4 w-4"/>Basic Info</TabsTrigger>
          <TabsTrigger value="attributes"><Ruler className="mr-2 h-4 w-4"/>Attributes</TabsTrigger>
          <TabsTrigger value="portfolio"><Camera className="mr-2 h-4 w-4"/>Portfolio</TabsTrigger>
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
                  </SelectContent>
                </Select>
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
                Upload your best work. High-quality images are recommended.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center w-full">
                    <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-muted-foreground"/>
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" multiple />
                    </Label>
                </div> 
                <p className="font-semibold mt-6 mb-4">Current Portfolio:</p>
                {/* In a real app, this would be a dynamic list of uploaded images with delete buttons */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="relative aspect-square"><img src="https://placehold.co/400x400" alt="portfolio image" className="rounded-md object-cover w-full h-full"/></div>
                    <div className="relative aspect-square"><img src="https://placehold.co/400x400" alt="portfolio image" className="rounded-md object-cover w-full h-full"/></div>
                    <div className="relative aspect-square"><img src="https://placehold.co/400x400" alt="portfolio image" className="rounded-md object-cover w-full h-full"/></div>
                </div>
            </CardContent>
            <CardFooter>
              <Button>Update Portfolio</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
