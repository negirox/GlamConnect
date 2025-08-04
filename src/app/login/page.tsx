
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
import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/lib/auth-actions";
import { Label } from "@/components/ui/label";

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" aria-disabled={pending}>
            Login
        </Button>
    )
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center px-4 md:px-6">
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
                        <Link href="#" className="ml-auto inline-block text-sm underline">
                            Forgot your password?
                        </Link>
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
    </div>
  );
}
