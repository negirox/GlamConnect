
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Building, Loader2, User, Mail, Phone, Clock, Star, Trash2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth-actions";
import { getBrandByEmail, Brand } from "@/lib/brand-actions";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { getGigsByBrandId, Gig, getApplicantsByGigId, deleteGig } from "@/lib/gig-actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createSavedList, getListsByBrandId, SavedList, deleteList, removeModelFromList, addModelsToList } from "@/lib/saved-list-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getModelById, getModels, Model } from "@/lib/data-actions";
import { ModelCard } from "@/components/model-card";
import Image from "next/image";
import { GigDetails } from "@/components/gig-details";


type GigWithApplicantCount = Gig & { applicantCount: number };

export default function BrandDashboardPage() {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [gigs, setGigs] = useState<GigWithApplicantCount[]>([]);
    const [savedLists, setSavedLists] = useState<SavedList[]>([]);
    const [allModels, setAllModels] = useState<Model[]>([]);
    const [selectedList, setSelectedList] = useState<SavedList | null>(null);
    const [selectedListModels, setSelectedListModels] = useState<Model[]>([]);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [isAddModelsView, setIsAddModelsView] = useState(false);
    const [selectedModelsForAdding, setSelectedModelsForAdding] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [newListName, setNewListName] = useState("");
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [isDeletingGig, setIsDeletingGig] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    
    const fetchBrandData = async (showLoading = true) => {
        const session = await getSession();
        if(!session.isLoggedIn || !session.email || session.role !== 'brand') {
            router.push('/login');
            return;
        }

        if(showLoading) setLoading(true);
        try {
            const fetchedBrand = await getBrandByEmail(session.email);
            setBrand(fetchedBrand);
            if (fetchedBrand) {
                const [fetchedGigs, fetchedLists, allFetchedModels] = await Promise.all([
                    getGigsByBrandId(fetchedBrand.id),
                    getListsByBrandId(fetchedBrand.id),
                    getModels(),
                ]);

                const gigsWithCounts = await Promise.all(
                    fetchedGigs.map(async (gig) => {
                        const applicants = await getApplicantsByGigId(gig.id);
                        return { ...gig, applicantCount: applicants.length };
                    })
                );
                setGigs(gigsWithCounts);
                setSavedLists(fetchedLists);
                setAllModels(allFetchedModels);
            }
        } catch (error) {
            console.error("Failed to fetch brand data:", error);
            setBrand(null);
        } finally {
            if(showLoading) setLoading(false);
        }
    }

    useEffect(() => {
        fetchBrandData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    const handleCreateList = async () => {
        if (!brand || !newListName.trim()) {
            toast({ title: "Error", description: "List name cannot be empty.", variant: "destructive" });
            return;
        }
        setIsCreatingList(true);
        try {
            await createSavedList(brand.id, newListName);
            toast({ title: "Success", description: "New list created." });
            setNewListName("");
            await fetchBrandData(false); // Re-fetch data to update list
        } catch(error) {
            toast({ title: "Error", description: "Failed to create list.", variant: "destructive" });
        } finally {
            setIsCreatingList(false);
        }
    }
    
    const handleDeleteList = async () => {
        if (!selectedList) return;
        try {
            await deleteList(selectedList.id);
            toast({ title: 'List Deleted', description: `The list "${selectedList.name}" has been deleted.` });
            setIsListModalOpen(false);
            setSelectedList(null);
            fetchBrandData(false);
        } catch (error) {
             toast({ title: "Error", description: "Failed to delete list.", variant: "destructive" });
        }
    }

    const handleDeleteGig = async (gigId: string) => {
      setIsDeletingGig(gigId);
      try {
        await deleteGig(gigId);
        toast({ title: 'Gig Deleted', description: 'The gig has been successfully removed.' });
        fetchBrandData(false);
      } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'Failed to delete the gig.', variant: 'destructive' });
      } finally {
        setIsDeletingGig(null);
      }
    }

    const handleOpenListModal = async (list: SavedList) => {
        setSelectedList(list);
        const modelPromises = list.modelIds.map(id => getModelById(id));
        const resolvedModels = (await Promise.all(modelPromises)).filter(Boolean) as Model[];
        setSelectedListModels(resolvedModels);
        setIsListModalOpen(true);
        setIsAddModelsView(false);
    }
    
    const handleRemoveModelFromList = async (modelId: string) => {
        if (!selectedList) return;
        try {
            const updatedList = await removeModelFromList(selectedList.id, modelId);
            setSelectedListModels(prev => prev.filter(m => m.id !== modelId));
            setSavedLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
            setSelectedList(updatedList);
            toast({ title: "Model Removed" });
        } catch (error) {
            toast({ title: "Error removing model", variant: "destructive" });
        }
    }

    const handleToggleModelSelection = (modelId: string) => {
        setSelectedModelsForAdding(prev =>
            prev.includes(modelId)
            ? prev.filter(id => id !== modelId)
            : [...prev, modelId]
        );
    };

    const handleAddModelsToList = async () => {
        if (!selectedList || selectedModelsForAdding.length === 0) return;
        try {
            const updatedList = await addModelsToList(selectedList.id, selectedModelsForAdding);
            
            // Update local state to immediately reflect changes
            setSavedLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
            
            // Re-fetch model details for the updated list
            const modelPromises = updatedList.modelIds.map(id => getModelById(id));
            const resolvedModels = (await Promise.all(modelPromises)).filter(Boolean) as Model[];
            
            // Update state for the modal view
            setSelectedList(updatedList);
            setSelectedListModels(resolvedModels);

            toast({ title: "List Updated" });
            setIsAddModelsView(false); // Return to the list view
            setSelectedModelsForAdding([]);
        } catch (error) {
             toast({ title: "Error updating list", variant: "destructive" });
        }
    }
      
    const statusColor: Record<Gig['status'], string> = {
        Pending: 'bg-yellow-500',
        Verified: 'bg-green-500',
        Rejected: 'bg-red-500',
    }

    if (loading) {
      return <div className="container flex items-center justify-center h-96"><Loader2 className="animate-spin"/></div>
    }

    if (!brand) {
      return (
        <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12 text-center">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Profile Not Found</AlertTitle>
                <AlertDescription>
                   Your brand profile could not be found. Please complete it to continue.
                </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
                <Link href="/brand/profile/edit">Complete Your Profile</Link>
            </Button>
        </div>
      )
    }

    const ListManagementModal = () => (
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                {isAddModelsView ? (
                     <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setIsAddModelsView(false)}><ArrowLeft/></Button>
                        <div>
                            <DialogTitle>Add to "{selectedList?.name}"</DialogTitle>
                            <DialogDescription>Select models to add to your list.</DialogDescription>
                        </div>
                    </div>
                ) : (
                    <DialogTitle>Manage "{selectedList?.name}"</DialogTitle>
                )}
            </DialogHeader>
            <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-6">
                {isAddModelsView ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allModels.map(model => {
                            const isSelected = selectedModelsForAdding.includes(model.id);
                            const alreadyInList = selectedList?.modelIds.includes(model.id);
                            return (
                                <Card 
                                    key={model.id} 
                                    onClick={() => !alreadyInList && handleToggleModelSelection(model.id)}
                                    className={`cursor-pointer transition-all ${alreadyInList ? 'opacity-50 cursor-not-allowed' : ''} ${isSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'}`}
                                >
                                    <CardHeader className="p-0 relative">
                                        <Image src={model.profilePicture} alt={model.name} width={300} height={400} className="rounded-t-lg object-cover aspect-[3/4]" />
                                        {(isSelected || alreadyInList) && (
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                                <CheckCircle className="h-5 w-5"/>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-3">
                                        <p className="font-semibold truncate">{model.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{model.location}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    selectedListModels.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                             {selectedListModels.map(model => (
                                <div key={model.id} className="relative group">
                                    <ModelCard model={model} />
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => handleRemoveModelFromList(model.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground pt-12">
                            <p>This list is empty. Add some models to get started!</p>
                        </div>
                    )
                )}
                </ScrollArea>
            </div>
            <DialogFooter className="mt-auto pt-4 border-t">
                {isAddModelsView ? (
                    <>
                        <Button variant="ghost" onClick={() => setIsAddModelsView(false)}>Cancel</Button>
                        <Button onClick={handleAddModelsToList}>Add Selected Models</Button>
                    </>
                ) : (
                    <>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="mr-auto">Delete List</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your list "{selectedList?.name}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteList}>Yes, delete list</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="outline" onClick={() => { setSelectedModelsForAdding([]); setIsAddModelsView(true); }}>Add Models</Button>
                    <DialogClose asChild><Button>Done</Button></DialogClose>
                    </>
                )}
            </DialogFooter>
        </DialogContent>
    );

    return (
        <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
            <Dialog open={isListModalOpen} onOpenChange={setIsListModalOpen}>
                <ListManagementModal />
            </Dialog>

            <div className="space-y-2 mb-8">
                <h1 className="text-4xl font-headline font-bold">Welcome, {brand.name}</h1>
                <p className="text-muted-foreground">Manage your job postings, review applicants, and find the perfect talent.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center justify-between">
                           <span>Company Profile</span>
                           <Button asChild variant="outline" size="sm">
                               <Link href="/brand/profile">View & Edit</Link>
                           </Button>
                        </CardTitle>
                        <CardDescription>Manage your public-facing brand information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                           <div className="flex items-start gap-2">
                                <Building className="h-5 w-5 text-muted-foreground mt-1" />
                                <div>
                                    <p className="font-semibold">{brand.name}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{brand.description || "No description provided."}</p>
                                </div>
                           </div>
                           <Separator />
                           {brand.contactPersonName && (
                            <div className="space-y-3 text-sm">
                                <p className="font-medium">Primary Contact</p>
                                <div className="space-y-2 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4"/>
                                        <span>{brand.contactPersonName} ({brand.contactPersonRole || 'N/A'})</span>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4"/>
                                        <span>{brand.contactPersonEmail || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4"/>
                                        <span>{brand.contactPersonPhone || 'No phone provided'}</span>
                                    </div>
                                </div>
                            </div>
                           )}
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center justify-between">
                            <span>Manage Gigs</span>
                            <Button asChild>
                                <Link href="/gigs/post"><PlusCircle className="mr-2"/>Post New Gig</Link>
                            </Button>
                        </CardTitle>
                        <CardDescription>View and manage your current and past job postings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-60">
                            <div className="space-y-4 pr-4">
                                {gigs.length > 0 ? gigs.map((gig, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-primary/20 rounded-lg gap-3 group">
                                        <div className="flex items-start gap-3">
                                            <span title={`Status: ${gig.status}`} className={`block h-3 w-3 rounded-full mt-1.5 shrink-0 ${statusColor[gig.status]}`}></span>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold truncate">{gig.title}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3"/>
                                                    Ends: {new Date(gig.applicationDeadline).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                            <Badge variant="secondary">{gig.applicantCount} Applicants</Badge>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                     <Button variant="outline" size="sm">View</Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                                                    <GigDetails gigId={gig.id} />
                                                </DialogContent>
                                            </Dialog>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" className="h-8 w-8">
                                                        {isDeletingGig === gig.id ? <Loader2 className="animate-spin" /> : <Trash2 className="h-4 w-4"/>}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the gig "{gig.title}".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteGig(gig.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center text-muted-foreground pt-12">
                                        <p>You haven't posted any gigs yet.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center justify-between">
                            <span className="flex items-center"><Star className="mr-2"/> Saved Model Lists</span>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline"><PlusCircle className="mr-2"/>New List</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New List</DialogTitle>
                                        <DialogDescription>Give your new model shortlist a name.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">Name</Label>
                                            <Input id="name" value={newListName} onChange={(e) => setNewListName(e.target.value)} className="col-span-3" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="ghost">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit" onClick={handleCreateList} disabled={isCreatingList}>
                                            {isCreatingList && <Loader2 className="animate-spin mr-2" />}
                                            Create List
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardTitle>
                        <CardDescription>Organize your favorite models into shortlists for future projects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ScrollArea className="h-60">
                             <div className="space-y-4 pr-4">
                                {savedLists.length > 0 ? savedLists.map((list, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-primary/20 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{list.name}</p>
                                            <p className="text-sm text-muted-foreground">{list.modelIds.length} Models</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => handleOpenListModal(list)}>
                                          Manage
                                        </Button>
                                    </div>
                                )) : (
                                     <div className="text-center text-muted-foreground pt-12">
                                        <p>You haven't created any lists yet.</p>
                                    </div>
                                )}
                            </div>
                         </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-12" />

            <Card className="text-center p-8 bg-secondary">
                <Briefcase className="mx-auto h-12 w-12 text-secondary-foreground mb-4" />
                <h3 className="text-2xl font-headline font-bold text-secondary-foreground">Ready to find your next star?</h3>
                <p className="text-secondary-foreground/80 mt-2 mb-6">Search our extensive database of professional models to find the perfect fit for your campaign.</p>
                <Button size="lg" asChild>
                    <Link href="/search">Search Models</Link>
                </Button>
            </Card>

        </div>
    )
}
