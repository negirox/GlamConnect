
'use client'

import { useState, useEffect, useMemo } from 'react';
import { Model } from '@/lib/mock-data';
import { Application, Gig, getGigById, getApplicantsByGigId, updateApplicationStatus, APPLICATION_STATUSES } from '@/lib/gig-actions';
import { getModelById } from '@/lib/data-actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from './ui/button';
import { Loader2, ArrowRight, ChevronDown } from 'lucide-react';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { ProfileDetails } from './profile-details';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ApplicantManagementModalProps {
    gigId: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

type ApplicantWithModel = Application & {
    model?: Model;
}

export function ApplicantManagementModal({ gigId, isOpen, onClose, onUpdate }: ApplicantManagementModalProps) {
    const [gig, setGig] = useState<Gig | null>(null);
    const [applicants, setApplicants] = useState<ApplicantWithModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
    const { toast } = useToast();

    useEffect(() => {
        if (gigId && isOpen) {
            const fetchData = async () => {
                setLoading(true);
                const [fetchedGig, fetchedApplicants] = await Promise.all([
                    getGigById(gigId),
                    getApplicantsByGigId(gigId),
                ]);

                const applicantsWithDetails = await Promise.all(
                    fetchedApplicants.map(async (app) => {
                        const model = await getModelById(app.modelId);
                        return { ...app, model };
                    })
                );

                setGig(fetchedGig);
                setApplicants(applicantsWithDetails.filter(a => a.model));
                setLoading(false);
            };
            fetchData();
        }
    }, [gigId, isOpen]);

    const handleUpdateStatus = async (applicationId: string, status: string) => {
        try {
            await updateApplicationStatus(applicationId, status as any);
            setApplicants(prev => prev.map(app => app.id === applicationId ? { ...app, status: status as any } : app));
            onUpdate(); // To update the count on the dashboard
            toast({ title: "Status Updated", description: `Model status changed to ${status}` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    }
    
    const statusCounts = useMemo(() => {
        const counts = { All: applicants.length };
        APPLICATION_STATUSES.forEach(status => {
            counts[status] = applicants.filter(a => a.status === status).length;
        });
        return counts;
    }, [applicants]);

    const filteredApplicants = useMemo(() => {
        if (activeStatusFilter === 'All') {
            return applicants;
        }
        return applicants.filter(a => a.status === activeStatusFilter);
    }, [applicants, activeStatusFilter]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6">
                    {gig ? (
                        <>
                            <DialogTitle className="text-2xl font-headline">Manage Applicants for "{gig.title}"</DialogTitle>
                            <DialogDescription>Review, approve, and select models for your shoot.</DialogDescription>
                        </>
                    ) : (
                        <DialogTitle>Loading Gig...</DialogTitle>
                    )}
                </DialogHeader>

                <Separator />
                
                {loading ? (
                    <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Tabs value={activeStatusFilter} onValueChange={setActiveStatusFilter} className="p-6 pb-2">
                            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
                                <TabsTrigger value="All">All ({statusCounts.All})</TabsTrigger>
                                {APPLICATION_STATUSES.map(status => (
                                    statusCounts[status] > 0 &&
                                    <TabsTrigger key={status} value={status}>{status} ({statusCounts[status]})</TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        <ScrollArea className="flex-1 px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6">
                                {filteredApplicants.map(app => (
                                    app.model &&
                                    <div key={app.id} className="border rounded-lg overflow-hidden group">
                                        <div className="relative aspect-[3/4] cursor-pointer" onClick={() => setSelectedModelId(app.modelId)}>
                                            <Image src={app.model.profilePicture} alt={app.model.name} fill className="object-cover group-hover:scale-105 transition-transform"/>
                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                                                <h3 className="font-bold text-white text-lg truncate">{app.model.name}</h3>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-card">
                                            <div className="flex justify-between items-center">
                                                <Badge variant={app.status === 'Selected' ? 'default' : 'secondary'}>{app.status}</Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">Actions <ChevronDown className="ml-2 h-4 w-4"/></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        {APPLICATION_STATUSES.map(status => (
                                                            <DropdownMenuItem key={status} onClick={() => handleUpdateStatus(app.id, status)}>
                                                                {status === 'Applied' ? 'Reset to Applied' : `Set to ${status}`}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredApplicants.length === 0 && (
                                    <div className="col-span-full text-center py-20 text-muted-foreground">
                                        <p>No applicants in this category.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </DialogContent>
            
            {/* Nested dialog for viewing profile */}
            <Dialog open={!!selectedModelId} onOpenChange={(open) => !open && setSelectedModelId(null)}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
                    <Button variant="ghost" size="icon" className="absolute top-3 left-3 z-10" onClick={() => setSelectedModelId(null)}><ArrowRight className="h-4 w-4 transform rotate-180"/></Button>
                    <ScrollArea className="h-full">
                       {selectedModelId && <ProfileDetails modelId={selectedModelId} />}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </Dialog>
    )
}
