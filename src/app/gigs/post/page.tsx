
'use client'

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
  CardFooter,
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
import { Loader2, PlusCircle, Calendar, MapPin, Clock, DollarSign } from "lucide-react";
import { getSession } from "@/lib/auth-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";


const gigSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    description: z.string().min(20, "Description must be at least 20 characters long."),
    projectType: z.string().min(1, "Please select a project type"),
    category: z.string().min(1, "Please select a category"),
    modelsNeeded: z.coerce.number().min(1, "At least one model is required"),
    isGroupShoot: z.string().optional(),
    location: z.string().min(2, "Location is required."),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    timing: z.string().min(1, "Please provide shoot timing"),
    travelProvided: z.string().optional(),
    accommodationProvided: z.string().optional(),
    paymentType: z.enum(['Paid', 'TFP', 'Exposure'], { required_error: "Please select a payment type" }),
    budgetMin: z.coerce.number().optional(),
    budgetMax: z.coerce.number().optional(),
    paymentMode: z.string().optional(),
    paymentTimeline: z.string().optional(),
}).refine(data => {
    if (data.paymentType === 'Paid') {
        return data.budgetMin !== undefined && data.budgetMax !== undefined;
    }
    return true;
}, {
    message: "Budget range is required for paid projects.",
    path: ["budgetMin"],
}).refine(data => {
    if (data.paymentType === 'Paid' && data.budgetMin && data.budgetMax) {
        return data.budgetMax >= data.budgetMin;
    }
    return true;
}, {
    message: "Maximum budget must be greater than or equal to minimum budget.",
    path: ["budgetMax"],
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
            projectType: "",
            category: "",
            modelsNeeded: 1,
            isGroupShoot: 'false',
            timing: "",
            travelProvided: 'false',
            accommodationProvided: 'false',
            paymentTimeline: "",
        },
    });

    const paymentType = form.watch('paymentType');

    async function onSubmit(values: z.infer<typeof gigSchema>) {
        setIsLoading(true);
        const session = await getSession();
        if(!session.isLoggedIn || session.role !== 'brand') {
            toast({ title: "Unauthorized", description: "You must be logged in as a brand to post a gig.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        try {
            const dataToSave = {
                ...values,
                brandId: session.id, 
                brandName: session.name,
                isGroupShoot: values.isGroupShoot === 'true',
                travelProvided: values.travelProvided === 'true',
                accommodationProvided: values.accommodationProvided === 'true',
            };
            await createGig(dataToSave as any);
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
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Details</CardTitle>
                            <CardDescription>Provide as much detail as possible to attract the right talent.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                    name="projectType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Commercial">Commercial</SelectItem>
                                                    <SelectItem value="Editorial">Editorial</SelectItem>
                                                    <SelectItem value="Music Video">Music Video</SelectItem>
                                                    <SelectItem value="Catalogue">Catalogue</SelectItem>
                                                    <SelectItem value="Runway">Runway</SelectItem>
                                                    <SelectItem value="Fitness">Fitness</SelectItem>
                                                    <SelectItem value="Swimwear">Swimwear</SelectItem>
                                                    <SelectItem value="Nude">Nude</SelectItem>
                                                    <SelectItem value="Semi-Nude">Semi-Nude</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category/Role</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select role..." /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Trans">Trans</SelectItem>
                                                    <SelectItem value="Any">Any</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6 items-end">
                                <FormField
                                    control={form.control}
                                    name="modelsNeeded"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Models Needed</FormLabel>
                                            <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isGroupShoot"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Is this a group shoot?</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Location & Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4"/>Shoot Location</FormLabel>
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
                                            <FormLabel className="flex items-center"><Calendar className="mr-2 h-4 w-4"/>Shoot Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </div>
                             <FormField
                                control={form.control}
                                name="timing"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center"><Clock className="mr-2 h-4 w-4"/>Timing</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 10AM - 6PM" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="travelProvided"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Travel Provided?</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="accommodationProvided"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Accommodation Provided?</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Budget & Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <FormField
                                control={form.control}
                                name="paymentType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Payment Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Paid" /></FormControl><FormLabel className="font-normal">Paid</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="TFP" /></FormControl><FormLabel className="font-normal">TFP (Trade)</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Exposure" /></FormControl><FormLabel className="font-normal">Exposure Only</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {paymentType === 'Paid' && (
                                <div className="grid grid-cols-2 gap-6">
                                     <FormField
                                        control={form.control}
                                        name="budgetMin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Budget Min ($)</FormLabel>
                                                <FormControl><Input type="number" placeholder="e.g. 500" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="budgetMax"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Budget Max ($)</FormLabel>
                                                <FormControl><Input type="number" placeholder="e.g. 1500" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                             <FormField
                                control={form.control}
                                name="paymentMode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Mode (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select mode..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Bank">Bank Transfer</SelectItem>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="UPI">UPI</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentTimeline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Timeline (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., Same day, Within 7 business days" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2"/>}
                                Post Gig
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    )
}
