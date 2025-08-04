
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase, Building } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// This is a placeholder for now. In a real app you'd fetch this.
const postedGigs = [
    { title: "Summer Swimwear Campaign", applicants: 12, status: "Active" },
    { title: "Editorial Shoot for 'Elegance'", applicants: 25, status: "Active" },
    { title: "Music Video Lead", applicants: 4, status: "Closed" },
];

const savedLists = [
    { name: "Swimwear Campaign Favorites", count: 5 },
    { name: "Potential Runway Models", count: 18 },
]


export default function BrandDashboardPage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
            <div className="space-y-2 mb-8">
                <h1 className="text-4xl font-headline font-bold">Brand Dashboard</h1>
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
                        <div className="space-y-2">
                           <div className="flex items-center gap-2">
                                <Building className="h-5 w-5 text-muted-foreground" />
                                <p className="font-semibold">Luxe Apparel Co.</p>
                           </div>
                           <p className="text-sm text-muted-foreground">High-end fashion house specializing in modern couture.</p>
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
                        <div className="space-y-4">
                            {postedGigs.map((gig, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-primary/20 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{gig.title}</p>
                                        <p className="text-sm text-muted-foreground">{gig.applicants} Applicants</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-sm font-medium ${gig.status === 'Active' ? 'text-green-600' : 'text-muted-foreground'}`}>{gig.status}</span>
                                        <Button variant="outline" size="sm">View</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
