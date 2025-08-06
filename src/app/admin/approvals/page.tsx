
'use client';

import { useEffect, useState } from 'react';
import { Model, models } from '@/lib/mock-data';
import { getModels } from '@/lib/data-actions';
import { updateModel } from '@/lib/model-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ApprovalsPage() {
    const [pendingModels, setPendingModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchPendingModels = async () => {
        setLoading(true);
        const allModels = await getModels();
        setPendingModels(allModels.filter(m => m.verificationStatus === 'Pending'));
        setLoading(false);
    }

    useEffect(() => {
        fetchPendingModels();
    }, []);

    const handleApproval = async (modelId: string, newStatus: 'Verified' | 'Not Verified') => {
        setUpdatingId(modelId);
        try {
            await updateModel(modelId, { verificationStatus: newStatus });
            setPendingModels(prev => prev.filter(m => m.id !== modelId));
            toast({
                title: 'Success',
                description: `Model has been ${newStatus === 'Verified' ? 'approved' : 'rejected'}.`
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update model status.',
                variant: 'destructive'
            });
        } finally {
            setUpdatingId(null);
        }
    }

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-headline font-bold mb-6">Portfolio Approvals</h1>
            
            {pendingModels.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pendingModels.map(model => (
                        <Card key={model.id}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={model.profilePicture} alt={model.name} />
                                        <AvatarFallback>{model.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle>{model.name}</CardTitle>
                                        <CardDescription>{model.location}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">{model.bio || "No bio provided."}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge variant="outline">{model.experience}</Badge>
                                    <Badge variant="outline">{model.height} cm</Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/profile/${model.id}`} target="_blank">View Profile</Link>
                                </Button>
                                <div className="flex gap-2">
                                     <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                                        onClick={() => handleApproval(model.id, 'Not Verified')}
                                        disabled={updatingId === model.id}
                                    >
                                        {updatingId === model.id ? <Loader2 className="animate-spin"/> : <X className="h-4 w-4" />}
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50"
                                        onClick={() => handleApproval(model.id, 'Verified')}
                                        disabled={updatingId === model.id}
                                    >
                                         {updatingId === model.id ? <Loader2 className="animate-spin"/> : <Check className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-20 bg-card rounded-lg border">
                    <p className="text-lg font-medium">No Pending Approvals</p>
                    <p>All model verification requests have been processed.</p>
                </div>
            )}
        </div>
    );
}
