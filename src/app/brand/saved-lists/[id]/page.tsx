
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getListById, removeModelFromList, SavedList } from '@/lib/saved-list-actions';
import { getModelById } from '@/lib/data-actions';
import { Model } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
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

type SavedListPageProps = {
  params: { id: string };
};

export default function SavedListPage({ params }: SavedListPageProps) {
  const [list, setList] = useState<SavedList | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const listId = params.id;

  useEffect(() => {
    async function fetchListData(id: string) {
        setLoading(true);
        try {
            const fetchedList = await getListById(id);
            if (fetchedList) {
                setList(fetchedList);
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
    if (listId) {
        fetchListData(listId);
    }
  }, [listId, toast]);

  const handleRemoveModel = async (modelId: string) => {
    if (!list) return;
    try {
        await removeModelFromList(list.id, modelId);
        setModels(prev => prev.filter(m => m.id !== modelId));
        toast({ title: "Model Removed", description: "The model has been removed from your list." });
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to remove model.", variant: "destructive" });
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
             <Button variant="ghost" size="sm" asChild className="mb-2 self-start">
                <Link href="/brand/dashboard">
                    <ArrowLeft className="mr-2"/>
                    Back to Dashboard
                </Link>
            </Button>
            <div className='text-center md:text-left'>
                <h1 className="text-3xl font-headline font-bold">{list.name}</h1>
                <p className="text-muted-foreground mt-1">{list.modelIds.length} model(s) in this list</p>
            </div>
            <Button asChild>
                <Link href={`/brand/saved-lists/${list.id}/add`}>
                    <PlusCircle className="mr-2"/> Add Models
                </Link>
            </Button>
        </div>

        {models.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {models.map(model => (
                    <div key={model.id} className="relative group">
                        <ModelCard model={model} />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <Trash2 className="h-4 w-4"/>
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
                    <Button asChild>
                        <Link href="/search">Search for Models</Link>
                    </Button>
                </CardFooter>
            </Card>
        )}
    </div>
  );
}
