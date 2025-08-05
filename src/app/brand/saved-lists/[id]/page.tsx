
'use client';

import { useEffect, useState } from 'react';
import { getListById, SavedList } from '@/lib/saved-list-actions';
import { getModelById, Model } from '@/lib/data-actions';
import { ModelCard } from '@/components/model-card';
import { Loader2, ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type ListPageProps = {
    params: { id: string };
};

export default function SavedListPage({ params }: ListPageProps) {
    const [list, setList] = useState<SavedList | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchListData() {
            setLoading(true);
            const fetchedList = await getListById(params.id);
            if (fetchedList) {
                setList(fetchedList);
                const modelPromises = fetchedList.modelIds.map(id => getModelById(id));
                const fetchedModels = (await Promise.all(modelPromises)).filter(m => m !== undefined) as Model[];
                setModels(fetchedModels);
            }
            setLoading(false);
        }
        fetchListData();
    }, [params.id]);

    if (loading) {
        return <div className="container flex items-center justify-center h-96"><Loader2 className="animate-spin" /></div>;
    }

    if (!list) {
        return <div className="container text-center py-12">List not found.</div>;
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
                <Button asChild>
                    <Link href={`/brand/saved-lists/${list.id}/add`}>
                        <PlusCircle className="mr-2"/>
                        Add Models to List
                    </Link>
                </Button>
            </div>

            {models.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {models.map(model => (
                        <ModelCard key={model.id} model={model} />
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
