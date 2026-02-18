
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/sign-in-form";
import { SignUpForm } from "@/components/sign-up-form";

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="text-center p-4 sm:p-6 pb-2 sm:pb-2">
        <CardTitle className="font-headline text-2xl sm:text-3xl">
          {authMode === 'signin' ? 'Welcome Aboard 🍕' : 'Create Your Account'}
        </CardTitle>
        <CardDescription>
          {authMode === 'signin' ? "Sign in to start your pizza order." : "Just a few details to get you started."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6 pt-0 pb-4 sm:pb-6">
        {authMode === 'signin' ? (
          <SignInForm onSwitchToSignUp={() => setAuthMode('signup')} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setAuthMode('signin')} />
        )}
      </CardContent>
    </Card>
  );
}
