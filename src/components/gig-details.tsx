
'use client';

import { useEffect, useState } from 'react';
import { getGigById, Gig, applyForGig, getApplicantsByGigId, Application } from '@/lib/gig-actions';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Briefcase, MapPin, CalendarDays, Clock, Users, DollarSign, CheckCircle, XCircle, Palette, Ruler, Cake, UserCheck, Info, ShieldCheck } from 'lucide-react';
import { getSession } from '@/lib/auth-actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Model } from '@/lib/mock-data';
import { getModelById } from '@/lib/data-actions';
import Image from 'next/image';
import { ProfileDetails } from './profile-details';

type GigDetailsProps = {
  gigId: string;
};

type ApplicantWithModel = Application & {
    model?: Model;
}

export function GigDetails({ gigId }: GigDetailsProps) {
    const [gig, setGig] = useState<Gig | null>(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [hasConsented, setHasConsented] = useState(false);
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [applicants, setApplicants] = useState<ApplicantWithModel[]>([]);

    const { toast } = useToast();

    useEffect(() => {
        async function fetchData(id: string) {
            setLoading(true);
            const [fetchedGig, sessionData] = await Promise.all([
                getGigById(id),
                getSession()
            ]);
            setGig(fetchedGig);
            setSession(sessionData);

            if (fetchedGig) {
                 const fetchedApplicants = await getApplicantsByGigId(fetchedGig.id);
                if (sessionData.isLoggedIn && sessionData.role === 'model') {
                    if(fetchedApplicants.some(app => app.modelId === sessionData.id)) {
                        setHasApplied(true);
                    }
                }
                 if(sessionData.isLoggedIn && sessionData.role === 'brand') {
                    const applicantsWithDetails = await Promise.all(
                        fetchedApplicants.map(async (app) => {
                            const model = await getModelById(app.modelId);
                            return { ...app, model };
                        })
                    );
                    setApplicants(applicantsWithDetails.filter(a => a.model));
                 }
            }

            setLoading(false);
        }
        if (gigId) {
            fetchData(gigId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gigId]);
    
    const handleApply = async () => {
        if (!gig || !session.isLoggedIn || !session.id) {
             toast({ title: 'Error', description: 'You must be logged in to apply.', variant: 'destructive'});
             return;
        }
        setIsApplying(true);
        try {
            await applyForGig(gig.id, session.id);
            setHasApplied(true);
            toast({
                title: 'Application Sent!',
                description: 'The brand has received your application.',
            });
            setIsApplyDialogOpen(false); // Close the dialog on success
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to submit application.',
                variant: 'destructive'
            });
        } finally {
            setIsApplying(false);
        }
    }

    const formatBudget = (gig: Gig) => {
        if (gig.paymentType !== 'Paid') {
            return gig.paymentType;
        }
        if (gig.budgetMin && gig.budgetMax) {
            if (gig.budgetMin === gig.budgetMax) {
                return `$${gig.budgetMin}`;
            }
            return `$${gig.budgetMin} - $${gig.budgetMax}`;
        }
        return 'Paid';
    }

    const GigStatusAlert = ({ status }: { status: Gig['status']}) => {
        if (session?.role !== 'brand') return null;

        switch (status) {
            case 'Pending':
                return (
                    <Alert variant="default" className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300 [&>svg]:text-yellow-600">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Pending Review</AlertTitle>
                        <AlertDescription>
                            This gig is currently pending review by our team and is not yet visible to models.
                        </AlertDescription>
                    </Alert>
                )
            case 'Rejected':
                 return (
                    <Alert variant="destructive" className="mb-6">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Gig Rejected</AlertTitle>
                        <AlertDescription>
                            This gig did not meet our community guidelines and is not visible on the platform.
                        </AlertDescription>
                    </Alert>
                )
            default:
                return null;
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>;
    }

    if (!gig) {
        return <div className="flex items-center justify-center h-full"><p>Gig not found.</p></div>;
    }

    const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: React.ReactNode }) => (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
                <p className="font-semibold">{label}</p>
                <div className="text-muted-foreground">{value || 'N/A'}</div>
            </div>
        </div>
    );

    const BooleanItem = ({ label, value }: {label: string, value: boolean | undefined}) => (
        <div className="flex items-center gap-2">
            {value ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-destructive" />}
            <span>{label}</span>
        </div>
    )
    
    const defaultTab = session?.role === 'brand' ? 'applicants' : 'details';

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b shrink-0">
                 <GigStatusAlert status={gig.status} />
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                         <div className="flex items-center gap-4 mb-2">
                            <Badge variant="secondary">{gig.projectType}</Badge>
                            {gig.status === 'Verified' && <Badge variant='default' className='bg-green-600 hover:bg-green-700 flex items-center gap-1'><ShieldCheck className='h-3 w-3'/> Verified Gig</Badge>}
                        </div>
                        <h1 className="font-headline text-3xl md:text-4xl font-bold">{gig.title}</h1>
                        <p className="pt-2 text-muted-foreground">Posted by {gig.brandName}</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                       {session?.role === 'model' && (
                        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" disabled={gig.status !== 'Verified' || hasApplied}>
                                    <Briefcase className="mr-2"/> {hasApplied ? 'Already Applied' : 'Apply Now'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirm Application</DialogTitle>
                                    <DialogDescription>
                                        By applying, you agree to share your public profile and portfolio with {gig.brandName} for consideration for this gig.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center space-x-2 my-4">
                                    <Checkbox id="terms" checked={hasConsented} onCheckedChange={(checked) => setHasConsented(Boolean(checked))} />
                                    <Label htmlFor="terms">I understand and consent to sharing my profile.</Label>
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsApplyDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleApply} disabled={isApplying || !hasConsented}>
                                        {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        Submit Application
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                       )}
                       <p className="text-sm text-destructive font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4"/>
                            Apply by: {new Date(gig.applicationDeadline).toLocaleDateString()}
                       </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="flex-grow flex flex-col">
                 {session?.role === 'brand' && (
                    <TabsList className="shrink-0 mx-6 mt-4">
                        <TabsTrigger value="details">Gig Details</TabsTrigger>
                        <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
                    </TabsList>
                 )}
                <ScrollArea className="flex-1">
                    <TabsContent value="details" className="p-6">
                        <p className="text-muted-foreground mb-8">{gig.description}</p>
                        
                        <Separator className="my-6" />

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="font-headline text-xl font-semibold">Project Details</h3>
                                <InfoItem icon={MapPin} label="Location" value={gig.location} />
                                <InfoItem icon={CalendarDays} label="Shoot Date & Time" value={`${new Date(gig.date).toLocaleDateString()} at ${gig.timing}`} />
                                <InfoItem icon={Users} label="Models Needed" value={`${gig.modelsNeeded} (${gig.isGroupShoot ? 'Group shoot' : 'Solo shoot'})`} />
                                <InfoItem icon={DollarSign} label="Compensation" value={formatBudget(gig)} />
                            </div>
                             <div className="space-y-6">
                                <h3 className="font-headline text-xl font-semibold">Model Requirements</h3>
                                 <InfoItem icon={UserCheck} label="Gender Preference" value={gig.genderPreference} />
                                 {(gig.ageRangeMin && gig.ageRangeMax) && <InfoItem icon={Cake} label="Age Range" value={`${gig.ageRangeMin} - ${gig.ageRangeMax} years`} />}
                                 {(gig.heightRangeMin && gig.heightRangeMax) && <InfoItem icon={Ruler} label="Height Range" value={`${gig.heightRangeMin} - ${gig.heightRangeMax} cm`} />}
                                 {gig.experienceLevel && <InfoItem icon={Briefcase} label="Experience Level" value={gig.experienceLevel} />}
                            </div>
                        </div>
                        
                        <Separator className="my-6" />

                         <div className="space-y-6">
                            <h3 className="font-headline text-xl font-semibold">Logistics & Extras</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                                <BooleanItem label="Travel provided" value={gig.travelProvided} />
                                <BooleanItem label="Accommodation provided" value={gig.accommodationProvided} />
                                <BooleanItem label="Portfolio link required" value={gig.portfolioLinkRequired} />
                            </div>
                         </div>

                        {gig.consentRequired && gig.consentRequired.length > 0 && (
                            <>
                            <Separator className="my-6" />
                            <div>
                                 <h3 className="font-headline text-xl font-semibold mb-3">Required Consents</h3>
                                 <div className="flex flex-wrap gap-2">
                                    {gig.consentRequired.map(consent => <Badge key={consent} variant="destructive">{consent}</Badge>)}
                                </div>
                            </div>
                            </>
                        )}
                    </TabsContent>
                    <TabsContent value="applicants" className="p-6">
                         {applicants.length > 0 ? (
                             <div className="space-y-4">
                                {applicants.map(app => (
                                    app.model &&
                                    <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <Image src={app.model.profilePicture} alt={app.model.name} width={40} height={40} className="rounded-full object-cover"/>
                                            <div>
                                                <p className="font-semibold">{app.model.name}</p>
                                                <p className="text-sm text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                         <div className="flex items-center gap-4">
                                            <Badge variant={app.status === 'Selected' ? 'default' : 'secondary'}>{app.status}</Badge>
                                             <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline">View Profile</Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
                                                    <ProfileDetails modelId={app.modelId} />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No applications received yet.</p>
                            </div>
                         )}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
    );
}

    