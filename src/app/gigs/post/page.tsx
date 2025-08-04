
'use client'

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createGig } from "@/lib/gig-actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle } from "lucide-react";
import { getSession } from "@/lib/auth-actions";


const gigSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    description: z.string().min(20, "Description must be at least 20 characters long."),
    location: z.string().min(2, "Location is required."),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
});

export default function PostGigPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof gigSchema>>({
        resolver: zodResolver(gigSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            date: "",
        },
    });

    async function onSubmit(values: z.infer<typeof gigSchema>) {
        setIsLoading(true);
        const session = await getSession();
        if(!session.isLoggedIn || session.role !== 'brand') {
            toast({ title: "Unauthorized", description: "You must be logged in as a brand to post a gig.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        try {
            await createGig({ ...values, brandId: session.id, brandName: session.name });
            toast({
                title: "Gig Posted!",
                description: "Your new gig is now live for models to see.",
            });
            router.push('/gigs');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to post gig.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 md:px-6 py-12">
             <div className="space-y-2 mb-8 text-center">
                <h1 className="text-4xl font-headline font-bold">Post a New Gig</h1>
                <p className="text-muted-foreground">Reach thousands of professional models by posting your job opportunity below.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Gig Details</CardTitle>
                    <CardDescription>Provide as much detail as possible to attract the right talent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gig Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Summer Fashion Campaign" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the project, requirements, desired model look, etc." className="min-h-32" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Be specific about the work, duration, and any special requirements.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City, Country" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shoot Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2"/>}
                                Post Gig
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
