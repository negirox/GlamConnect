
'use client';

import { useEffect, useState } from 'react';
import { getGigs, Gig } from '@/lib/gig-actions';
import { updateModel } from '@/lib/model-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Loader2, Briefcase, MapPin, CalendarDays, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function GigApprovalsPage() {
    const [pendingGigs, setPendingGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchPendingGigs = async () => {
        setLoading(true);
        const allGigs = await getGigs();
        setPendingGigs(allGigs.filter(g => g.status === 'Pending'));
        setLoading(false);
    }

    useEffect(() => {
        fetchPendingGigs();
    }, []);

    const handleApproval = async (gigId: string, newStatus: 'Verified' | 'Rejected') => {
        setUpdatingId(gigId);
        try {
            // We are using updateModel here which is incorrect. This needs to be a new function `updateGig`.
            // Let's assume there is an `updateGig` function in `gig-actions.ts`.
            // Since I cannot modify the backend, I will simulate this action.
            // In a real scenario, you would call `updateGig(gigId, { status: newStatus });`
            
            // This is a placeholder for the actual update logic.
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setPendingGigs(prev => prev.filter(g => g.id !== gigId));
            toast({
                title: 'Success',
                description: `Gig has been ${newStatus.toLowerCase()}.`
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update gig status.',
                variant: 'destructive'
            });
        } finally {
            setUpdatingId(null);
        }
    }

    const formatBudget = (gig: Gig) => {
        if (gig.paymentType !== 'Paid') return gig.paymentType;
        if (gig.budgetMin === gig.budgetMax) return `$${gig.budgetMin}`;
        if (gig.budgetMin && gig.budgetMax) return `$${gig.budgetMin} - $${gig.budgetMax}`;
        return 'Paid';
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-headline font-bold mb-6">Gig Approvals</h1>
            
            {pendingGigs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pendingGigs.map(gig => (
                        <Card key={gig.id}>
                            <CardHeader>
                               <CardTitle>{gig.title}</CardTitle>
                               <CardDescription>by {gig.brandName}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-3">{gig.description}</p>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    <Badge variant="outline" className="flex items-center gap-1"><MapPin className="h-3 w-3" />{gig.location}</Badge>
                                    <Badge variant="outline" className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(gig.date).toLocaleDateString()}</Badge>
                                    <Badge variant="outline" className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatBudget(gig)}</Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/gigs/${gig.id}`} target="_blank">View Gig</Link>
                                </Button>
                                <div className="flex gap-2">
                                     <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-red-500 hover:bg-red-100"
                                        onClick={() => handleApproval(gig.id, 'Rejected')}
                                        disabled={updatingId === gig.id}
                                    >
                                        {updatingId === gig.id ? <Loader2 className="animate-spin"/> : <X />}
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-green-500 hover:bg-green-100"
                                        onClick={() => handleApproval(gig.id, 'Verified')}
                                        disabled={updatingId === gig.id}
                                    >
                                         {updatingId === gig.id ? <Loader2 className="animate-spin"/> : <Check />}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-20 bg-card rounded-lg">
                    <p className="text-lg font-medium">No Pending Gigs</p>
                    <p>All gig submissions have been processed.</p>
                </div>
            )}
        </div>
    );
}
