'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Shield, AlertTriangle } from 'lucide-react';
import { PizzaPilotIcon } from '@/components/icons/pizza-pal-icon';
import { addDoc, collection, Timestamp, query, orderBy, limit } from 'firebase/firestore';
import { addMonths } from 'date-fns';
import type { Subscription } from '@/lib/types';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 2500,
    description: 'For restaurants getting started with AI-powered ordering.',
    features: ['Dashboard Access', 'Live Order Management', 'Menu & Inventory Control'],
    icon: Shield,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 5000,
    description: 'For businesses that need advanced analytics and insights.',
    features: ['Everything in Basic', 'Advanced Sales Analytics', 'AI-Powered Insights'],
    icon: Star,
  },
];

export default function SubscribePage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    
    // Fetch the latest subscription to check if it has expired.
    const subscriptionsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'users', user.uid, 'subscriptions'),
            orderBy('current_period_end', 'desc'),
            limit(1)
        );
    }, [firestore, user]);

    const { data: subscriptions } = useCollection<Subscription>(subscriptionsQuery);
    const latestSubscription = subscriptions?.[0];

    const hasExpired = useMemo(() => {
        if (!latestSubscription) return false;
        // If status isn't active, or if the end date is in the past, it's considered expired for UI purposes.
        return latestSubscription.status !== 'active' || latestSubscription.current_period_end.toDate() < new Date();
    }, [latestSubscription]);


    const handleSubscribe = async (plan: typeof plans[0]) => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to subscribe.' });
            return;
        }

        setIsLoading(plan.id);

        try {
            const subCollectionRef = collection(firestore, 'users', user.uid, 'subscriptions');
            
            const startDate = new Date();
            const endDate = addMonths(startDate, 1);
            
            const newSubscription = {
                planId: plan.id,
                planName: plan.name,
                price: plan.price,
                status: 'active',
                current_period_end: Timestamp.fromDate(endDate),
                startDate: Timestamp.fromDate(startDate),
            };

            await addDoc(subCollectionRef, newSubscription);
            
            toast({
                title: "Subscription Activated!",
                description: `You are now subscribed to the ${plan.name} plan.`,
            });
            
            router.push('/admin/orders');
            router.refresh(); 

        } catch (error: any) {
            console.error("Subscription failed:", error);
            toast({
                variant: 'destructive',
                title: 'Subscription Failed',
                description: error.message || 'Could not process your subscription. Please try again.',
            });
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <main className="flex flex-col min-h-screen items-center justify-center p-8 bg-background">
            <div className="flex items-center justify-center mb-10">
                <PizzaPilotIcon className="w-16 h-16 mr-4" />
                <h1 className="text-5xl font-headline text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                    PizzaPilot
                </h1>
            </div>

            {hasExpired && (
                <Card className="max-w-4xl w-full mb-10 bg-destructive/10 border-destructive text-destructive-foreground">
                    <CardHeader className="flex-row items-center gap-4">
                        <AlertTriangle className="w-8 h-8" />
                        <div>
                            <CardTitle className="font-headline text-2xl">Your Subscription Has Expired</CardTitle>
                            <CardDescription className="text-destructive-foreground/80">Please renew your plan to regain access to the dashboard.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            )}

            <div className="text-center mb-10">
                <h1 className="text-4xl font-headline">Choose Your Plan</h1>
                <p className="text-muted-foreground mt-2">Unlock the full potential of PizzaPilot for your restaurant.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {plans.map((plan) => (
                    <Card key={plan.id} className={plan.id === 'pro' ? 'border-primary shadow-primary/20 shadow-lg' : ''}>
                        <CardHeader className="p-8">
                            <div className="flex items-center gap-4 mb-2">
                                <plan.icon className="w-8 h-8 text-primary" />
                                <CardTitle className="font-headline text-3xl">{plan.name}</CardTitle>
                            </div>
                            <p className="text-4xl font-bold font-mono">₹{plan.price}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <ul className="space-y-3">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                             <Button 
                                className="w-full text-lg py-6"
                                variant={plan.id === 'pro' ? 'default' : 'outline'}
                                onClick={() => handleSubscribe(plan)}
                                disabled={!!isLoading}
                            >
                                {isLoading === plan.id ? 'Processing...' : hasExpired ? `Renew with ${plan.name}` : `Choose ${plan.name}`}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </main>
    );
}
