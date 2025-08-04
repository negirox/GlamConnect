
'use client';

import { useEffect, useState } from "react";
import { getGigs, Gig } from "@/lib/gig-actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CalendarDays, Briefcase, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function GigsPage() {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGigs() {
            setLoading(true);
            const fetchedGigs = await getGigs();
            setGigs(fetchedGigs);
            setLoading(false);
        }
        fetchGigs();
    }, []);

    return (
        <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
            <div className="space-y-2 mb-8 text-center">
                <h1 className="text-4xl font-headline font-bold">Available Gigs</h1>
                <p className="text-muted-foreground">Explore the latest modeling opportunities from top brands.</p>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-12 w-full" />
                            </CardContent>
                            <CardFooter>
                                 <Skeleton className="h-10 w-24" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {gigs.length > 0 ? gigs.map(gig => (
                        <Card key={gig.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="font-headline text-2xl">{gig.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 pt-2">
                                            <Building className="h-4 w-4"/>Posted by {gig.brandName}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">New</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground line-clamp-3">{gig.description}</p>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mt-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{gig.location}</span>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        <span>{new Date(gig.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>
                                    <Briefcase className="mr-2"/>
                                    Apply Now
                                </Button>
                            </CardFooter>
                        </Card>
                    )) : (
                        <Card className="text-center p-12">
                            <p className="text-xl font-semibold">No Gigs Available</p>
                            <p className="text-muted-foreground mt-2">Check back later for new opportunities!</p>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
