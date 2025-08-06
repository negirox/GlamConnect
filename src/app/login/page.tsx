
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
import { useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import { authenticate } from "@/lib/auth-actions";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { requestPasswordReset } from "@/lib/password-reset-actions";
import { useToast } from "@/hooks/use-toast";


function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" aria-disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
        </Button>
    )
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().optional(),
  contactMethod: z.enum(['email', 'phone'], { required_error: 'Please select a contact method.' })
});


export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '', phone: '', contactMethod: 'email' as 'email' | 'phone' },
  });

  const { formState: { isSubmitting }, handleSubmit, reset } = form;

  const onForgotPasswordSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    const result = await requestPasswordReset(values);
    if (result.success) {
        toast({
            title: "Request Sent",
            description: "Your password reset request has been sent to the administrator. They will contact you shortly.",
        });
        reset();
        setOpen(false);
    } else {
        toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
        });
    }
  }


  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center px-4 md:px-6">
      <Dialog open={open} onOpenChange={setOpen}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form action={dispatch} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <DialogTrigger asChild>
                            <Button variant="link" className="ml-auto inline-block text-sm underline p-0 h-auto">
                                Forgot your password?
                            </Button>
                        </DialogTrigger>
                    </div>
                    <Input id="password" type="password" name="password" required />
                </div>
                
                {errorMessage && (
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    </div>
                )}
                <LoginButton />
            </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
                Enter your email and how you'd like to be contacted. An admin will review your request.
            </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Account Email</FormLabel>
                            <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Phone Number (Optional)</FormLabel>
                            <FormControl><Input placeholder="+1 (555) 123-4567" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                  control={form.control}
                  name="contactMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>How should we contact you?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="email" /></FormControl>
                            <FormLabel className="font-normal">Via Email</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="phone" /></FormControl>
                            <FormLabel className="font-normal">Via Phone</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                        Send Request
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
      </Dialog>
    </div>
  );
}
