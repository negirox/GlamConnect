
'use client'

import { getModelById } from '@/lib/data-actions';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Ruler,
  Briefcase,
  CalendarDays,
  MapPin,
  Eye,
  MessageSquare,
  Palette,
  Tag,
  Weight,
  PersonStanding,
  Link as LinkIcon,
  BadgeCheck,
  Loader2,
  Hand,
  Languages,
  Venus,
  Cake,
  Flag,
  Info,
  Sigma,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Model } from '@/lib/mock-data';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { getSession } from '@/lib/auth-actions';
import { getListsByBrandId, addModelToList, createList, SavedList } from '@/lib/saved-list-actions';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


type ProfilePageProps = {
  params: { id: string };
};

export default function ProfilePage({ params }: ProfilePageProps) {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newListName, setNewListName] = useState('');
  const { toast } = useToast();


  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      const sessionData = await getSession();
      setSession(sessionData);

      const [fetchedModel, fetchedLists] = await Promise.all([
         getModelById(params.id),
         sessionData.isLoggedIn && sessionData.role === 'brand' ? getListsByBrandId(sessionData.id) : Promise.resolve([])
      ]);
      
      setModel(fetchedModel || null);
      setSavedLists(fetchedLists);
      setLoading(false);
    };
    fetchPageData();
  }, [params.id]);

  const handleSaveToList = async () => {
      if (!selectedList || !model) return;
      setIsSubmitting(true);
      try {
          if (selectedList === 'new') {
              if (!newListName) {
                  toast({ title: "Error", description: "Please enter a name for the new list.", variant: "destructive" });
                  return;
              }
              await createList(session.id, newListName, model.id);
              toast({ title: "Success", description: `${model.name} saved to new list "${newListName}".` });
          } else {
              await addModelToList(selectedList, model.id);
              const list = savedLists.find(l => l.id === selectedList);
              toast({ title: "Success", description: `${model.name} saved to "${list?.name}".` });
          }
          // Optionally, re-fetch lists to show the new one if created
          const updatedLists = await getListsByBrandId(session.id);
          setSavedLists(updatedLists);
          setSelectedList(null);
          setNewListName('');

      } catch (error: any) {
          toast({ title: "Error", description: error.message || "Failed to save model.", variant: "destructive" });
      } finally {
          setIsSubmitting(false);
      }
  }


  if (loading) {
    return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!model) {
    return <div className="container mx-auto max-w-6xl px-4 md:px-6 py-12 text-center">Model not found.</div>;
  }

  const attributes = [
    { icon: PersonStanding, label: 'Height', value: `${model.height} cm` },
    { icon: Weight, label: 'Weight', value: model.weight ? `${model.weight} kg` : 'N/A' },
    { icon: Ruler, label: 'Measurements', value: `${model.bust}-${model.waist}-${model.hips} cm` },
    { icon: Sigma, label: 'Cup Size', value: model.cupSize || 'N/A' },
    { icon: Eye, label: 'Eyes', value: model.eyeColor },
    { icon: Palette, label: 'Hair', value: model.hairColor },
    { icon: Info, label: 'Dress Size', value: model.dressSize || 'N/A' },
    { icon: Tag, label: 'Ethnicity', value: model.ethnicity || 'N/A' },
    { icon: Venus, label: 'Gender', value: model.genderIdentity || 'N/A' },
    { icon: Cake, label: 'Born', value: model.dateOfBirth || 'N/A' },
    { icon: Flag, label: 'Nationality', value: model.nationality || 'N/A' },
    { icon: Languages, label: 'Languages', value: Array.isArray(model.spokenLanguages) ? model.spokenLanguages.join(', ') : model.spokenLanguages || 'N/A'},
  ];
  
  const socialLinks = model.socialLinks || [];

  return (
    <div className="container mx-auto max-w-6xl px-4 md:px-6 py-12">
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-1 flex flex-col items-center">
          <Card className="w-full sticky top-24">
            <CardHeader className="p-0">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={model.profilePicture}
                  alt={`Profile of ${model.name}`}
                  data-ai-hint="fashion model"
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center">
                <h1 className="text-3xl font-headline font-bold">{model.name}</h1>
                {model.verificationStatus === 'Verified' && <BadgeCheck className="ml-2 h-6 w-6 text-blue-500" />}
              </div>
              <div className="flex items-center justify-center text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-1.5" />
                <span>{model.location}</span>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                  {socialLinks.map((link, index) => (
                    <Button key={index} asChild variant="outline" size="icon">
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    </Button>
                  ))}
                   {model.portfolioLink && (
                     <Button asChild variant="outline" size="icon">
                      <a href={model.portfolioLink} target="_blank" rel="noopener noreferrer">
                        <Briefcase className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <Button size="lg" className="w-full bg-secondary hover:bg-accent">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact {model.name.split(' ')[0]}
                </Button>
                {session?.role === 'brand' && (
                  <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg" variant="outline" className="w-full"><Save className="mr-2" /> Save to List</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Save {model.name} to a list</DialogTitle>
                            <DialogDescription>Select an existing list or create a new one.</DialogDescription>
                        </DialogHeader>
                        <RadioGroup value={selectedList || ''} onValueChange={setSelectedList} className="my-4 max-h-48 overflow-y-auto">
                            {savedLists.map(list => (
                                <div key={list.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={list.id} id={`list-${list.id}`} />
                                    <Label htmlFor={`list-${list.id}`}>{list.name} ({list.modelIds.length} models)</Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="new" id="list-new" />
                                <Label htmlFor="list-new">Create a new list</Label>
                            </div>
                        </RadioGroup>
                        {selectedList === 'new' && (
                            <Input 
                                placeholder="Enter new list name..." 
                                value={newListName} 
                                onChange={(e) => setNewListName(e.target.value)}
                                className="mt-2"
                            />
                        )}
                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            <Button onClick={handleSaveToList} disabled={isSubmitting || !selectedList || (selectedList === 'new' && !newListName)}>
                                {isSubmitting && <Loader2 className="animate-spin mr-2"/>}
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                )}

              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-headline">About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {attributes.map((attr) => (
                  <div key={attr.label} className="flex items-start">
                    <attr.icon className="h-5 w-5 text-muted-foreground mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{attr.label}</p>
                      <p className="text-muted-foreground">{attr.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
                <div>
                    <h3 className="font-semibold mb-3 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-muted-foreground"/>Experience</h3>
                    <div className="space-y-2 pl-7">
                        <p><span className="font-semibold">Level:</span> {model.experience} ({model.yearsOfExperience || 0} years)</p>
                        {model.agencyRepresented && <p><span className="font-semibold">Agency:</span> {model.agencyName}</p>}
                        {Array.isArray(model.previousClients) && model.previousClients.length > 0 && <p><span className="font-semibold">Previous Clients:</span> {model.previousClients.join(', ')}</p>}
                    </div>
                </div>
               <Separator className="my-6" />
               <div>
                  <h3 className="font-semibold mb-3 flex items-center"><Hand className="mr-2 h-5 w-5 text-muted-foreground"/>Modeling Work & Skills</h3>
                   <div className="pl-7">
                        <p className="font-semibold mb-2">Work Types:</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(model.modelingWork) && model.modelingWork.length > 0 ? model.modelingWork.map((work, i) => (
                            <Badge key={i} variant="secondary">{work.trim()}</Badge>
                          )) : <p className="text-sm text-muted-foreground">Not specified.</p>}
                        </div>
                        <p className="font-semibold mt-4 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(model.skills) && model.skills.length > 0 ? model.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary">{skill.trim()}</Badge>
                          )): <p className="text-sm text-muted-foreground">Not specified.</p>}
                        </div>
                   </div>
              </div>
                <Separator className="my-6" />
                <div>
                     <h3 className="font-semibold mb-3 flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-muted-foreground"/>Availability</h3>
                     <div className="space-y-2 pl-7">
                        <p><span className="font-semibold">Booking Status:</span> {model.availableForBookings ? "Available" : "Not Available"}</p>
                        <p><span className="font-semibold">Travel:</span> {model.willingToTravel ? `Yes (${model.preferredRegions || 'Any'})` : 'No'}</p>
                        <p><span className="font-semibold">Availability:</span> {model.availability} ({Array.isArray(model.timeAvailability) ? model.timeAvailability.join(', ') : ''})</p>
                     </div>
                </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          <div>
            <h2 className="text-3xl font-headline font-bold mb-6">Portfolio</h2>
            <div className="grid grid-cols-2 gap-4">
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
      </div>
    </div>
  );
}
