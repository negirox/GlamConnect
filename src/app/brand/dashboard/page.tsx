
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Building, Loader2, User, Mail, Phone, Clock } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth-actions";
import { getBrandByEmail, Brand } from "@/lib/brand-actions";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { getGigsByBrandId, Gig, getApplicantsByGigId } from "@/lib/gig-actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const savedLists = [
    { name: "Swimwear Campaign Favorites", count: 5 },
    { name: "Potential Runway Models", count: 18 },
]

type GigWithApplicantCount = Gig & { applicantCount: number };


export default function BrandDashboardPage() {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [gigs, setGigs] = useState<GigWithApplicantCount[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    useEffect(() => {
        const fetchBrandData = async () => {
            setLoading(true);
            const session = await getSession();
            if(!session.isLoggedIn || !session.email || session.role !== 'brand') {
                router.push('/login');
                return;
            }

            try {
                const fetchedBrand = await getBrandByEmail(session.email);
                setBrand(fetchedBrand);
                if (fetchedBrand) {
                    const fetchedGigs = await getGigsByBrandId(fetchedBrand.id);
                    const gigsWithCounts = await Promise.all(
                        fetchedGigs.map(async (gig) => {
                            const applicants = await getApplicantsByGigId(gig.id);
                            return { ...gig, applicantCount: applicants.length };
                        })
                    );
                    setGigs(gigsWithCounts);
                }
            } catch (error) {
                console.error("Failed to fetch brand data:", error);
                setBrand(null);
            } finally {
                setLoading(false);
            }
        }
        fetchBrandData();
      }, [router])
      
    const statusColor: Record<Gig['status'], string> = {
        Pending: 'bg-yellow-500',
        Verified: 'bg-green-500',
        Rejected: 'bg-red-500',
    }


    if (loading) {
      return <div className="container flex items-center justify-center h-96"><Loader2 className="animate-spin"/></div>
    }

    if (!brand) {
      return (
        <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12 text-center">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Profile Not Found</AlertTitle>
                <AlertDescription>
                   Your brand profile could not be found. Please complete it to continue.
                </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
                <Link href="/brand/profile/edit">Complete Your Profile</Link>
            </Button>
        </div>
      )
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
            <div className="space-y-2 mb-8">
                <h1 className="text-4xl font-headline font-bold">Welcome, {brand.name}</h1>
                <p className="text-muted-foreground">Manage your job postings, review applicants, and find the perfect talent.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center justify-between">
                           <span>Company Profile</span>
                           <Button asChild variant="outline" size="sm">
                               <Link href="/brand/profile">View & Edit</Link>
                           </Button>
                        </CardTitle>
                        <CardDescription>Manage your public-facing brand information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                           <div className="flex items-start gap-2">
                                <Building className="h-5 w-5 text-muted-foreground mt-1" />
                                <div>
                                    <p className="font-semibold">{brand.name}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{brand.description || "No description provided."}</p>
                                </div>
                           </div>
                           <Separator />
                           {brand.contactPersonName && (
                            <div className="space-y-3 text-sm">
                                <p className="font-medium">Primary Contact</p>
                                <div className="space-y-2 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4"/>
                                        <span>{brand.contactPersonName} ({brand.contactPersonRole || 'N/A'})</span>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4"/>
                                        <span>{brand.contactPersonEmail || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4"/>
                                        <span>{brand.contactPersonPhone || 'No phone provided'}</span>
                                    </div>
                                </div>
                            </div>
                           )}
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center justify-between">
                            <span>Manage Gigs</span>
                            <Button asChild>
                                <Link href="/gigs/post"><PlusCircle className="mr-2"/>Post New Gig</Link>
                            </Button>
                        </CardTitle>
                        <CardDescription>View and manage your current and past job postings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-60">
                            <div className="space-y-4 pr-4">
                                {gigs.length > 0 ? gigs.map((gig, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-primary/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span title={`Status: ${gig.status}`} className={`block h-3 w-3 rounded-full ${statusColor[gig.status]}`}></span>
                                            <div>
                                                <p className="font-semibold truncate">{gig.title}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3"/>
                                                    Ends: {new Date(gig.applicationDeadline).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{gig.applicantCount} Applicants</Badge>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/gigs/${gig.id}`}>View</Link>
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center text-muted-foreground pt-12">
                                        <p>You haven't posted any gigs yet.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center justify-between">
                            <span>Saved Model Lists</span>
                            <Button variant="outline"><PlusCircle className="mr-2"/>New List</Button>
                        </CardTitle>
                        <CardDescription>Organize your favorite models into shortlists for future projects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            {savedLists.map((list, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-primary/20 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{list.name}</p>
                                        <p className="text-sm text-muted-foreground">{list.count} Models</p>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-12" />

            <Card className="text-center p-8 bg-secondary">
                <Briefcase className="mx-auto h-12 w-12 text-secondary-foreground mb-4" />
                <h3 className="text-2xl font-headline font-bold text-secondary-foreground">Ready to find your next star?</h3>
                <p className="text-secondary-foreground/80 mt-2 mb-6">Search our extensive database of professional models to find the perfect fit for your campaign.</p>
                <Button size="lg" asChild>
                    <Link href="/search">Search Models</Link>
                </Button>
            </Card>

        </div>
    )
}
