'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { RestaurantMetadata } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  restaurantName: z.string().min(1, 'Restaurant name is required'),
  contactInfo: z.string().min(1, 'Contact info is required'),
});

export default function ProfilePage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const metadataRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'metadata', 'restaurant');
    }, [firestore]);

    const { data: metadata, isLoading } = useDoc<RestaurantMetadata>(metadataRef);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            restaurantName: '',
            contactInfo: ''
        }
    });
    
    useEffect(() => {
        if (metadata) {
            form.reset({
                restaurantName: metadata.restaurantName || '',
                contactInfo: metadata.contactInfo || ''
            });
        }
    }, [metadata, form]);

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        if (!metadataRef) return;
        try {
            await setDoc(metadataRef, values);
            toast({
                title: 'Profile Updated',
                description: 'Your restaurant details have been saved.',
            });
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not save your changes.',
            });
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-headline mb-1">Restaurant Settings</h1>
            <p className="text-muted-foreground mb-6">Manage your restaurant's public information.</p>
            <Card>
                <CardHeader>
                    <CardTitle>Restaurant Details</CardTitle>
                    <CardDescription>This information will be displayed on receipts and other customer-facing documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-8">
                            <div className="space-y-2">
                               <Skeleton className="h-4 w-32" />
                               <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="space-y-2">
                               <Skeleton className="h-4 w-32" />
                               <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="restaurantName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Restaurant Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., PizzaPilot Palace" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contactInfo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Info / Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 123 Pizza St, pizzapilot@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                     {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
