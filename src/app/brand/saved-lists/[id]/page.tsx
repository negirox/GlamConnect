
'use client';

import { useEffect, useState } from 'react';
import { getListById, SavedList, removeModelFromList, deleteList } from '@/lib/saved-list-actions';
import { getModelById, Model } from '@/lib/data-actions';
import { ModelCard } from '@/components/model-card';
import { Loader2, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

type ListPageProps = {
    params: { id: string };
};

export default function SavedListPage({ params }: ListPageProps) {
    const [list, setList] = useState<SavedList | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [removingModelId, setRemovingModelId] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    async function fetchListData() {
        setLoading(true);
        try {
            const fetchedList = await getListById(params.id);
            if (fetchedList) {
                setList(fetchedList);
                const modelPromises = fetchedList.modelIds.map(id => getModelById(id));
                const fetchedModels = (await Promise.all(modelPromises)).filter(m => m !== undefined) as Model[];
                setModels(fetchedModels);
            } else {
                setList(null);
                setModels([]);
            }
        } catch (error) {
            console.error("Failed to fetch list data:", error);
            toast({ title: "Error", description: "Could not fetch list data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchListData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleRemoveModel = async (modelId: string) => {
        if (!list) return;
        setRemovingModelId(modelId);
        try {
            await removeModelFromList(list.id, modelId);
            toast({ title: "Model Removed", description: "The model has been removed from this list." });
            await fetchListData(); // Re-fetch to update the UI
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to remove model.", variant: "destructive" });
        } finally {
            setRemovingModelId(null);
        }
    };
    
    const handleDeleteList = async () => {
        if(!list) return;
        setIsDeleting(true);
        try {
            await deleteList(list.id);
            toast({ title: "List Deleted", description: `The list "${list.name}" has been deleted.`});
            router.push('/brand/dashboard');
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to delete list.", variant: "destructive" });
            setIsDeleting(false);
        }
    }

    if (loading) {
        return <div className="container flex items-center justify-center h-96"><Loader2 className="animate-spin" /></div>;
    }

    if (!list) {
        return <div className="container text-center py-12">List not found. It may have been deleted.</div>;
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 md:px-6 py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-2">
                        <Link href="/brand/dashboard">
                            <ArrowLeft className="mr-2"/>
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-headline font-bold">{list.name}</h1>
                    <p className="text-muted-foreground mt-2">{models.length} model(s) in this list.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href={`/brand/saved-lists/${list.id}/add`}>
                            <PlusCircle className="mr-2"/>
                            Add Models
                        </Link>
                    </Button>
                     <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="destructive"><Trash2 className="mr-2"/> Delete List</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete your list "{list.name}".
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                <Button variant="destructive" onClick={handleDeleteList} disabled={isDeleting}>
                                    {isDeleting && <Loader2 className="mr-2 animate-spin"/>}
                                    Yes, delete list
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {models.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {models.map(model => (
                        <div key={model.id} className="relative group">
                            <ModelCard model={model} />
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRemoveModel(model.id)}
                                    disabled={removingModelId === model.id}
                                >
                                    {removingModelId === model.id ? <Loader2 className="animate-spin"/> : <Trash2/>}
                                    <span className="ml-2">Remove</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-card rounded-lg">
                    <p className="font-semibold text-lg">This list is empty.</p>
                    <p className="text-muted-foreground mt-2">Start by adding models to build your collection.</p>
                </div>
            )}
        </div>
    );
}
