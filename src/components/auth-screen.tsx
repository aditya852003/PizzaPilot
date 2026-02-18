"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/sign-in-form";
import { SignUpForm } from "@/components/sign-up-form";

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <Card className="border-primary/20 shadow-2xl bg-card overflow-hidden">
      <CardHeader className="text-center p-6 sm:p-8 pb-4">
        <CardTitle className="font-headline text-2xl sm:text-3xl">
          {authMode === 'signin' ? 'Welcome Aboard 🍕' : 'Create Your Account'}
        </CardTitle>
        <CardDescription>
          {authMode === 'signin' ? "Sign in to start your pizza order." : "Just a few details to get you started."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 sm:px-8 pt-0 pb-8">
        {authMode === 'signin' ? (
          <SignInForm onSwitchToSignUp={() => setAuthMode('signup')} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setAuthMode('signin')} />
        )}
      </CardContent>
    </Card>
  );
}
