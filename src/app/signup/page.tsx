
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/user-actions"; 
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["model", "brand"], {
    required_error: "You need to select a role.",
  }),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
});


export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            agreeToTerms: false,
        },
    });

    async function onSubmit(values: z.infer<typeof signupSchema>) {
        setIsLoading(true);
        setError(null);
        try {
            await createUser(values);
            toast({
              title: "Account Created!",
              description: "You can now log in with your new account.",
            });
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center px-4 md:px-6">
      <Dialog>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
          <CardDescription>
            Create an account to join the GlamConnect community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="model" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Model
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="brand" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Brand
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                       <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I have read and agree to the{' '}
                          <DialogTrigger asChild>
                             <span className="text-secondary-foreground underline cursor-pointer hover:text-primary">Model Agreement and Platform Terms</span>
                          </DialogTrigger>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading || !form.watch('agreeToTerms')}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create an account
                </Button>
            </form>
           </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Model Agreement and Platform Terms</DialogTitle>
          <DialogDescription>
            Please read the terms and conditions carefully before proceeding.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 pr-6">
            <div className="prose prose-sm dark:prose-invert">
                <p><strong>Last Updated: [Date]</strong></p>

                <p>Welcome to GlamConnect. This Model Agreement and Platform Terms ("Agreement") is a legally binding contract between you ("Model," "you," "your") and GlamConnect ("we," "us," "our"). This Agreement governs your access to and use of the GlamConnect platform, including any content, functionality, and services offered on or through our website.</p>

                <h4>1. Acceptance of Terms</h4>
                <p>By creating an account and using the GlamConnect platform, you represent that you are at least 18 years of age and legally capable of entering into a binding contract. You acknowledge that you have read, understood, and agree to be bound by all terms, conditions, and policies, including our Privacy Policy.</p>

                <h4>2. Platform Services</h4>
                <p>GlamConnect provides an online platform to connect models with brands, photographers, and other clients ("Brands") for modeling opportunities. We are not an employment agency or a modeling agency. We do not employ models or Brands, and we are not responsible for the conduct of any user of the platform.</p>

                <h4>3. Model Profile and Content</h4>
                <ul>
                    <li>You are solely responsible for the information, photographs, videos, and other content ("Model Content") you upload to your profile.</li>
                    <li>You warrant that you own or have the necessary rights and permissions to all Model Content you post.</li>
                    <li>You grant GlamConnect a non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, display, and perform your Model Content in connection with the platform's services.</li>
                    <li>You agree not to post any content that is defamatory, obscene, pornographic, vulgar, offensive, or that promotes discrimination, bigotry, racism, hatred, harassment, or harm against any individual or group.</li>
                </ul>
                
                <h4>4. Consent for Sensitive Content</h4>
                <p>The platform allows for the display of sensitive content, including swimwear, semi-nude, and artistic nude photography, for professional purposes. By uploading content to these specific categories, you explicitly consent to:</p>
                <ul>
                  <li>Having this content reviewed by verified Brands for professional casting and booking purposes.</li>
                  <li>Representing that you are over 18 years of age.</li>
                  <li>Understanding that while we take measures to restrict access, GlamConnect is not liable for any misuse or unauthorized distribution of this content by other users.</li>
                </ul>

                <h4>5. Code of Conduct</h4>
                <p>You agree to interact with Brands and other users professionally and respectfully. Any form of harassment, abuse, or fraudulent activity will result in immediate termination of your account.</p>

                <h4>6. Bookings and Payments</h4>
                <p>All booking agreements and financial transactions are strictly between you and the Brand. GlamConnect is not a party to these agreements and is not responsible for any disputes, non-payment, or other issues arising from such arrangements. We recommend using a formal written contract for all professional engagements.</p>

                <h4>7. Disclaimers and Limitation of Liability</h4>
                <p>The GlamConnect platform is provided "as is" without any warranties. We do not guarantee that you will secure modeling work. To the fullest extent permitted by law, GlamConnect shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>

                <h4>8. Termination</h4>
                <p>We reserve the right to suspend or terminate your account at any time, without notice, for any reason, including but not limited to a breach of this Agreement.</p>

                <h4>9. Changes to Terms</h4>
                <p>We may modify this Agreement from time to time. We will notify you of any changes by posting the new Agreement on this page. Your continued use of the platform after any such change constitutes your acceptance of the new Agreement.</p>
            </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Accept & Continue</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </div>
  );
}
