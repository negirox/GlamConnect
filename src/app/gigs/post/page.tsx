
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
import { Loader2, PlusCircle } from "lucide-react";
import { getSession } from "@/lib/auth-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

const gigSchema = z.object({
    // Basic Details
    title: z.string().min(5, "Title must be at least 5 characters long."),
    description: z.string().min(20, "Description must be at least 20 characters long."),
    projectType: z.string().min(1, "Please select a project type"),
    genderPreference: z.enum(['Male', 'Female', 'Trans', 'Any'], { required_error: "Please select a gender preference" }),
    modelsNeeded: z.coerce.number().min(1, "At least one model is required"),
    isGroupShoot: z.string().optional(),
    
    // Location & Schedule
    location: z.string().min(2, "Location is required."),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "A valid shoot date is required" }),
    timing: z.string().min(1, "Please provide shoot timing"),
    travelProvided: z.string().optional(),
    accommodationProvided: z.string().optional(),

    // Budget & Payment
    paymentType: z.enum(['Paid', 'TFP', 'Exposure'], { required_error: "Please select a payment type" }),
    budgetMin: z.coerce.number().optional(),
    budgetMax: z.coerce.number().optional(),
    paymentMode: z.string().optional(),
    paymentTimeline: z.string().optional(),

    // Requirements & Preferences
    ageRangeMin: z.coerce.number().optional(),
    ageRangeMax: z.coerce.number().optional(),
    heightRangeMin: z.coerce.number().optional(),
    heightRangeMax: z.coerce.number().optional(),
    experienceLevel: z.string().optional(),
    consentRequired: z.array(z.string()).optional(),
    portfolioLinkRequired: z.string().optional(),

    // Privacy & Access
    applicationDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "A valid application deadline is required" }),
    
    // Agreement
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms and guidelines.",
    }),

}).refine(data => {
    if (data.paymentType === 'Paid') {
        return data.budgetMin !== undefined && data.budgetMax !== undefined && data.budgetMin >= 0 && data.budgetMax >= 0;
    }
    return true;
}, {
    message: "Budget range (min and max) is required for paid projects.",
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
            modelsNeeded: 1,
            isGroupShoot: 'false',
            timing: "",
            travelProvided: 'false',
            accommodationProvided: 'false',
            paymentTimeline: "",
            agreeToTerms: false,
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
                portfolioLinkRequired: values.portfolioLinkRequired === 'true',
            };
            await createGig(dataToSave as any);
            toast({
                title: "Gig Submitted!",
                description: "Your new gig is pending review and will be live once approved.",
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
        <div className="container mx-auto max-w-3xl px-4 md:px-6 py-12">
             <div className="space-y-2 mb-8 text-center">
                <h1 className="text-4xl font-headline font-bold">Post a New Gig</h1>
                <p className="text-muted-foreground">Reach thousands of professional models by posting your job opportunity below.</p>
            </div>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Core Gig Details</CardTitle>
                            <CardDescription>Start with the essentials. This information is always required.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Gig Title</FormLabel><FormControl><Input placeholder="e.g., Summer Fashion Campaign" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Job Description</FormLabel><FormControl><Textarea placeholder="Describe the project, requirements, desired model look, etc." className="min-h-32" {...field} /></FormControl><FormDescription>Be specific about the work, duration, and any special requirements.</FormDescription><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem><FormLabel>Shoot Location</FormLabel><FormControl><Input placeholder="City, Country" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <div className="grid grid-cols-2 gap-6">
                                <FormField control={form.control} name="date" render={({ field }) => (
                                    <FormItem><FormLabel>Shoot Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="applicationDeadline" render={({ field }) => (
                                    <FormItem><FormLabel>Application Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                             </div>
                        </CardContent>
                    </Card>

                    <Accordion type="multiple" className="w-full space-y-6">
                       <AccordionItem value="item-1">
                         <Card>
                           <AccordionTrigger className="p-6">
                               <CardTitle>Project Specifics</CardTitle>
                           </AccordionTrigger>
                           <AccordionContent>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <FormField control={form.control} name="projectType" render={({ field }) => (
                                        <FormItem><FormLabel>Project Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Commercial">Commercial</SelectItem><SelectItem value="Editorial">Editorial</SelectItem><SelectItem value="Music Video">Music Video</SelectItem><SelectItem value="Catalogue">Catalogue</SelectItem>
                                                    <SelectItem value="Runway">Runway</SelectItem><SelectItem value="Fitness">Fitness</SelectItem><SelectItem value="Swimwear">Swimwear</SelectItem>
                                                    <SelectItem value="Nude">Nude</SelectItem><SelectItem value="Semi-Nude">Semi-Nude</SelectItem>
                                                </SelectContent>
                                            </Select><FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="genderPreference" render={({ field }) => (
                                        <FormItem><FormLabel>Gender Preference</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select preference..." /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Female">Female</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Trans">Trans</SelectItem><SelectItem value="Any">Any</SelectItem>
                                                </SelectContent>
                                            </Select><FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="grid grid-cols-2 gap-6 items-end">
                                    <FormField control={form.control} name="modelsNeeded" render={({ field }) => (
                                        <FormItem><FormLabel>Number of Models</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="isGroupShoot" render={({ field }) => (
                                        <FormItem><FormLabel>Group or Solo?</FormLabel><FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Group</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">Solo</FormLabel></FormItem>
                                            </RadioGroup></FormControl>
                                        </FormItem>
                                    )}/>
                                </div>
                                 <FormField control={form.control} name="timing" render={({ field }) => (
                                    <FormItem><FormLabel>Timing</FormLabel><FormControl><Input placeholder="e.g., 10AM - 6PM" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-2 gap-6">
                                    <FormField control={form.control} name="travelProvided" render={({ field }) => (
                                        <FormItem><FormLabel>Travel Provided?</FormLabel><FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                            </RadioGroup></FormControl>
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="accommodationProvided" render={({ field }) => (
                                        <FormItem><FormLabel>Accommodation Provided?</FormLabel><FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                            </RadioGroup></FormControl>
                                        </FormItem>
                                    )}/>
                                </div>
                            </CardContent>
                           </AccordionContent>
                         </Card>
                       </AccordionItem>
                       
                       <AccordionItem value="item-2">
                         <Card>
                            <AccordionTrigger className="p-6"><CardTitle>Budget & Payment</CardTitle></AccordionTrigger>
                            <AccordionContent>
                                <CardContent className="space-y-6">
                                    <FormField control={form.control} name="paymentType" render={({ field }) => (
                                        <FormItem><FormLabel>Payment Type</FormLabel><FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Paid" /></FormControl><FormLabel className="font-normal">Paid</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="TFP" /></FormControl><FormLabel className="font-normal">TFP (Trade)</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Exposure" /></FormControl><FormLabel className="font-normal">Exposure Only</FormLabel></FormItem>
                                            </RadioGroup></FormControl><FormMessage />
                                        </FormItem>
                                    )}/>
                                    {paymentType === 'Paid' && (
                                        <div className="grid grid-cols-2 gap-6">
                                            <FormField control={form.control} name="budgetMin" render={({ field }) => (
                                                <FormItem><FormLabel>Budget Min ($)</FormLabel><FormControl><Input type="number" placeholder="e.g. 500" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name="budgetMax" render={({ field }) => (
                                                <FormItem><FormLabel>Budget Max ($)</FormLabel><FormControl><Input type="number" placeholder="e.g. 1500" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                        </div>
                                    )}
                                    <FormField control={form.control} name="paymentMode" render={({ field }) => (
                                        <FormItem><FormLabel>Payment Mode (Optional)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select mode..." /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Bank">Bank Transfer</SelectItem><SelectItem value="Cash">Cash</SelectItem><SelectItem value="UPI">UPI</SelectItem><SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select><FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="paymentTimeline" render={({ field }) => (
                                        <FormItem><FormLabel>Payment Timeline (Optional)</FormLabel><FormControl><Input placeholder="e.g., Same day, Within 7 business days" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </CardContent>
                            </AccordionContent>
                         </Card>
                       </AccordionItem>
                       
                       <AccordionItem value="item-3">
                         <Card>
                             <AccordionTrigger className="p-6"><CardTitle>Model Requirements</CardTitle></AccordionTrigger>
                             <AccordionContent>
                                <CardContent className="space-y-6">
                                     <div className="grid grid-cols-2 gap-6">
                                        <FormField control={form.control} name="ageRangeMin" render={({ field }) => (
                                            <FormItem><FormLabel>Min Age</FormLabel><FormControl><Input type="number" placeholder="e.g. 18" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                         <FormField control={form.control} name="ageRangeMax" render={({ field }) => (
                                            <FormItem><FormLabel>Max Age</FormLabel><FormControl><Input type="number" placeholder="e.g. 30" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <FormField control={form.control} name="heightRangeMin" render={({ field }) => (
                                            <FormItem><FormLabel>Min Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g. 170" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                         <FormField control={form.control} name="heightRangeMax" render={({ field }) => (
                                            <FormItem><FormLabel>Max Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g. 190" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                    <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                                        <FormItem><FormLabel>Experience Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select preferred experience" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Any">Any</SelectItem>
                                                    <SelectItem value="Newcomer">Newcomer</SelectItem>
                                                    <SelectItem value="1-3 years">1-3 years</SelectItem>
                                                    <SelectItem value="3+ years">3+ years</SelectItem>
                                                </SelectContent>
                                            </Select><FormMessage />
                                        </FormItem>
                                    )}/>
                                     <FormField
                                        control={form.control} name="consentRequired"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Shoot Style Consent Required</FormLabel>
                                                <FormDescription>Select if your shoot requires models who have consented to these styles.</FormDescription>
                                                {['Bikini', 'Semi-Nude', 'Nude'].map((item) => (
                                                    <FormField key={item} control={form.control} name="consentRequired"
                                                        render={({ field }) => (
                                                            <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(item)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...(field.value || []), item])
                                                                                : field.onChange(field.value?.filter((value) => value !== item));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">{item}</FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                             </AccordionContent>
                         </Card>
                       </AccordionItem>
                    </Accordion>
                     <Card>
                        <CardHeader>
                            <CardTitle>Confirmation & Agreement</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control} name="agreeToTerms"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                I agree to the Gig Posting Terms and Community Guidelines.
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading || !form.watch('agreeToTerms')} className="w-full" size="lg">
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
