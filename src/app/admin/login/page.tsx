'use client';

import { useEffect } from 'react';
import Image from 'next/image';

import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/sign-in-form";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PizzaPilotIcon } from '@/components/icons/pizza-pal-icon';

export default function AdminLoginPage() {
    const { isUserLoading } = useUser();
    const bgImage = PlaceHolderImages.find(p => p.id === 'pizza-restaurant-bg');

    if (isUserLoading) {
         return (
            <div className="w-full h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="relative flex flex-col min-h-screen items-center justify-center p-4 bg-background">
            {bgImage && (
                <>
                    <Image
                        src={bgImage.imageUrl}
                        alt={bgImage.description}
                        fill
                        className="object-cover z-[-2] blur-sm scale-105"
                        data-ai-hint={bgImage.imageHint}
                        priority
                    />
                    <div className="absolute inset-0 bg-black/70 z-[-1]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,black)] z-[-1]" />
                </>
            )}

            <div className="flex items-center justify-center mb-6">
                <PizzaPilotIcon className="w-12 h-12 mr-4" />
                <h1 className="text-4xl font-headline text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                    PizzaPilot
                </h1>
            </div>

            <Card className="w-full max-w-lg bg-card border-primary/20">
                <CardHeader className="text-center p-6">
                    <CardTitle className="font-headline text-2xl">
                        Owner Dashboard
                    </CardTitle>
                    <CardDescription>
                        Sign in to manage your restaurant.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pt-0 pb-6">
                    <SignInForm onSwitchToSignUp={() => {}} showSignUpLink={false} />
                </CardContent>
            </Card>
        </main>
    );
}
