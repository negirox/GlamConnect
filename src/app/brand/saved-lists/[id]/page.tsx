
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getListById, removeModelFromList, deleteList, addModelsToList, SavedList } from '@/lib/saved-list-actions';
import { getModelById, getModels } from '@/lib/data-actions';
import { Model } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, PlusCircle, Trash2, CheckCircle } from 'lucide-react';
import { ModelCard } from '@/components/model-card';
import { useToast } from '@/hooks/use-toast';
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
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';


type SavedListPageProps = {
    params: { id: string };
};

export default function SavedListPage({ params }: SavedListPageProps) {
    const [list, setList] = useState<SavedList | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [allModels, setAllModels] = useState<Model[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeletingList, setIsDeletingList] = useState(false);
    const [removingModelId, setRemovingModelId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

  const listId = params.id;

    async function fetchListData(id: string) {
        setLoading(true);
        try {
        const [fetchedList, allFetchedModels] = await Promise.all([
            getListById(id),
            getModels()
        ]);
        
        setAllModels(allFetchedModels);

            if (fetchedList) {
                setList(fetchedList);
                setSelectedModels(fetchedList.modelIds);
                const modelPromises = fetchedList.modelIds.map(id => getModelById(id));
            const resolvedModels = (await Promise.all(modelPromises)).filter(Boolean) as Model[];
            setModels(resolvedModels);
            }
        } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to fetch list data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (listId) {
            fetchListData(listId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listId]);

    const handleRemoveModel = async (modelId: string) => {
        if (!list) return;
        setRemovingModelId(modelId);
        try {
            await removeModelFromList(list.id, modelId);
        setModels(prev => prev.filter(m => m.id !== modelId));
        toast({ title: "Model Removed", description: "The model has been removed from your list." });
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to remove model.", variant: "destructive" });
        } finally {
            setRemovingModelId(null);
        }
    }
    
    const handleDeleteList = async () => {
        if (!list) return;
        setIsDeletingList(true);
        try {
            await deleteList(list.id);
            toast({ title: 'List Deleted', description: `The list "${list.name}" has been deleted.` });
            router.push('/brand/dashboard');
        } catch (error) {
             toast({ title: "Error", description: "Failed to delete list.", variant: "destructive" });
             setIsDeletingList(false);
        }
    }

    const handleToggleModelSelection = (modelId: string) => {
        setSelectedModels(prev =>
        prev.includes(modelId)
            ? prev.filter(id => id !== modelId)
            : [...prev, modelId]
        );
    };

    const handleAddModels = async () => {
        if (!list) return;
        setIsSubmitting(true);
        try {
            await addModelsToList(list.id, selectedModels);
            toast({ title: 'List Updated', description: `Your list has been updated.` });
            await fetchListData(list.id); // Re-fetch to update the view
            setIsAddModalOpen(false);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update list.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return <div className="container flex items-center justify-center h-96"><Loader2 className="animate-spin" /></div>;
    }

    if (!list) {
    return <div className="container text-center py-12">List not found.</div>;
    }

    return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
             <div>
                 <Button variant="ghost" size="sm" asChild className="mb-2 self-start">
                    <Link href="/brand/dashboard">
                        <ArrowLeft className="mr-2"/>
                        Back to Dashboard
                    </Link>
                </Button>
                <div className='text-center md:text-left'>
                    <h1 className="text-3xl font-headline font-bold">{list.name}</h1>
                    <p className="text-muted-foreground mt-1">{models.length} model(s) in this list</p>
                </div>
            </div>
                <div className="flex gap-2">
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2"/> Add Models</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Add Models to "{list.name}"</DialogTitle>
                                <DialogDescription>Select models from the list to add them to your shortlist.</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh]">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-6">
                                    {allModels.map(model => {
                                        const isSelected = selectedModels.includes(model.id);
                                        return (
                                            <Card 
                                                key={model.id} 
                                                onClick={() => handleToggleModelSelection(model.id)}
                                                className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'}`}
                                            >
                                                <CardHeader className="p-0 relative">
                                                    <Image src={model.profilePicture} alt={model.name} width={300} height={400} className="rounded-t-lg object-cover aspect-[3/4]" />
                                                    {isSelected && (
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
                            </ScrollArea>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                <Button onClick={handleAddModels} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive"><Trash2 className="mr-2"/> Delete List</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your list "{list.name}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteList} disabled={isDeletingList}>
                                    {isDeletingList && <Loader2 className="mr-2 animate-spin"/>}
                                    Yes, delete list
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {models.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {models.map(model => (
                        <div key={model.id} className="relative group">
                            <ModelCard model={model} />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" disabled={removingModelId === model.id}>
                                    {removingModelId === model.id ? <Loader2 className="animate-spin" /> : <Trash2 className="h-4 w-4"/>}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently remove {model.name} from this list. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveModel(model.id)}>Remove</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </div>
                    ))}
                </div>
            ) : (
            <Card className="text-center py-20">
                <CardHeader>
                    <CardTitle>This List is Empty</CardTitle>
                    <CardDescription>Start by adding models to build your shortlist.</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                   <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2"/> Add Models</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Add Models to "{list.name}"</DialogTitle>
                                <DialogDescription>Select models from the list to add them to your shortlist.</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh]">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-6">
                                    {allModels.map(model => {
                                        const isSelected = selectedModels.includes(model.id);
                                        return (
                                            <Card 
                                                key={model.id} 
                                                onClick={() => handleToggleModelSelection(model.id)}
                                                className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'}`}
                                            >
                                                <CardHeader className="p-0 relative">
                                                    <Image src={model.profilePicture} alt={model.name} width={300} height={400} className="rounded-t-lg object-cover aspect-[3/4]" />
                                                    {isSelected && (
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
                            </ScrollArea>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                <Button onClick={handleAddModels} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
            )}
        </div>
    );
}
