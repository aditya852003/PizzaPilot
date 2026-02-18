
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  showSignUpLink?: boolean;
}

export function SignInForm({ onSwitchToSignUp, showSignUpLink = true }: SignInFormProps) {
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      let description = "Invalid email or password. Please check your credentials and try again.";
      if (error.code === 'auth/invalid-email') {
        description = "Please enter a valid email address.";
      }
      toast({ variant: "destructive", title: "Sign-in Failed", description });
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full !mt-6 text-base py-3 bg-accent hover:bg-accent/90 text-accent-foreground">
            <LogIn /> Sign In
          </Button>
        </form>
      </Form>
      {showSignUpLink && (
        <div className="mt-4 text-center text-xs sm:text-sm">
            <p className="text-sm text-muted-foreground">
              New to PizzaPilot?{' '}
              <Button variant="link" className="p-0 h-auto text-primary" onClick={onSwitchToSignUp}>
                Sign Up
              </Button>
            </p>
            <p className="mt-2">
                <Link href="/admin/login" className="text-sm text-primary hover:underline transition-colors">
                    Login as Admin
                </Link>
            </p>
        </div>
      )}
    </div>
  );
}
