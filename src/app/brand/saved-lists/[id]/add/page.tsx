
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getListById, addModelsToList, SavedList } from '@/lib/saved-list-actions';
import { getModels } from '@/lib/data-actions';
import { Model } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, ArrowLeft, PlusCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type AddModelsPageProps = {
    params: { id: string };
};

export default function AddModelsPage({ params }: AddModelsPageProps) {
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [list, setList] = useState<SavedList | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    async function loadData() {
        setLoading(true);
        try {
            const [models, fetchedList] = await Promise.all([
                getModels(),
                getListById(params.id)
            ]);
            setAllModels(models);
            setList(fetchedList);
            if (fetchedList) {
                setSelectedModels(fetchedList.modelIds);
            }
        } catch (error) {
            console.error("Failed to load data", error);
            toast({ title: "Error", description: "Could not load models or list.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }
    
    if (params.id) {
        loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);
  
  const handleToggleModel = (modelId: string) => {
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
        const originalIds = list.modelIds;
        const modelsToAdd = selectedModels.filter(id => !originalIds.includes(id));
        
        await addModelsToList(list.id, selectedModels);
        toast({ title: 'List Updated', description: `${modelsToAdd.length} model(s) have been added to your list.` });
        router.push(`/brand/saved-lists/${list.id}`);
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
        <div className="flex justify-between items-center mb-8">
            <div>
                 <Button variant="ghost" size="sm" asChild className="mb-2">
                    <Link href={`/brand/saved-lists/${params.id}`}>
                        <ArrowLeft className="mr-2"/>
                        Back to List
                    </Link>
                </Button>
                <h1 className="text-3xl font-headline font-bold">Add Models to "{list.name}"</h1>
                <p className="text-muted-foreground mt-1">Select models to add to your shortlist.</p>
            </div>
            <Button onClick={handleAddModels} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2"/>}
                Save Changes
            </Button>
        </div>
      
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allModels.map(model => {
                const isSelected = selectedModels.includes(model.id);
                  return (
                <Card 
                    key={model.id} 
                    onClick={() => handleToggleModel(model.id)}
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
            )})}
        </div>
    </div>
  );
}
