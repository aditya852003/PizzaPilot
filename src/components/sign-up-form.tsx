"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: values.name });

      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        name: values.name,
        email: user.email,
        phone: user.phoneNumber,
        role: values.email === 'pizzapilot+admin@gmail.com' ? 'owner' : 'customer',
      });

      toast({
        title: "Account Created!",
        description: "Welcome to PizzaPilot! You're now signed in.",
      });
    } catch (error: any) {
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email is already registered. Please sign in or use a different email.";
      } else if (error.code === 'auth/weak-password') {
        description = "The password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
          description = "Please enter a valid email address.";
      }
      toast({ variant: "destructive", title: "Sign-up Failed", description });
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs sm:text-sm">Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} className="h-9 sm:h-10" />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your Email" {...field} className="h-9 sm:h-10" />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs sm:text-sm">Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="h-9 sm:h-10" />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full !mt-6 h-10 sm:h-12 text-sm sm:text-base bg-accent hover:bg-accent/90 text-accent-foreground">
            <UserPlus className="mr-2 h-4 w-4" /> Create Account
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
        Already have an account?{' '}
        <Button variant="link" className="p-0 h-auto text-primary" onClick={onSwitchToSignIn}>
          Sign In
        </Button>
      </p>
    </div>
  );
}
