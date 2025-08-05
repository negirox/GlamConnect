
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModelCard } from '@/components/model-card';
import { Model } from '@/lib/mock-data';
import { getModels } from '@/lib/data-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { getListById, SavedList, addModelToList } from '@/lib/saved-list-actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AddModelsPageProps = {
    params: { id: string };
};

export default function AddModelsPage({ params }: AddModelsPageProps) {
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [list, setList] = useState<SavedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingModelId, setSavingModelId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    async function loadData() {
        if (!params.id) return;
        setLoading(true);
        try {
            const [models, fetchedList] = await Promise.all([
                getModels(),
                getListById(params.id)
            ]);
            setAllModels(models);
            setList(fetchedList);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast({ title: "Error", description: "Could not load page data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, [params.id, toast]);
  
  const handleAddModel = async (modelId: string) => {
    if (!list) return;
    setSavingModelId(modelId);
    try {
        await addModelToList(list.id, modelId);
        toast({
            title: "Model Added!",
            description: "The model has been added to your list.",
        });
        // Re-fetch list to update the modelIds
        const updatedList = await getListById(list.id);
        setList(updatedList);
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Could not add model to list.",
            variant: "destructive",
        });
    } finally {
        setSavingModelId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
            <div>
                 <Button variant="ghost" size="sm" asChild className="mb-2">
                    <Link href={`/brand/saved-lists/${params.id}`}>
                        <ArrowLeft className="mr-2"/>
                        Back to List
                    </Link>
                </Button>
                <h1 className="text-2xl font-headline font-bold">
                    Add Models to "{list?.name || '...'}"
                </h1>
            </div>
        </div>
      
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-[500px] w-full" />)}
            </div>
        ) : allModels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {allModels.map((model) => {
                  const isAlreadyInList = list?.modelIds.includes(model.id);
                  const isSaving = savingModelId === model.id;
                  return (
                    <div key={model.id} className="relative">
                        <ModelCard model={model} />
                        <div className="absolute top-2 right-2 z-10">
                            <Button 
                                size="sm" 
                                onClick={() => handleAddModel(model.id)}
                                disabled={isAlreadyInList || isSaving}
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : isAlreadyInList ? <CheckCircle /> : <PlusCircle />}
                                <span className="ml-2">{isAlreadyInList ? 'Saved' : 'Save'}</span>
                            </Button>
                        </div>
                    </div>
                  )
              })}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg">
                <p className="text-xl font-semibold">No models found.</p>
                <p className="text-muted-foreground mt-2">There are no models available on the platform to add.</p>
            </div>
        )}
    </div>
  );
}
