import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { addMonths, Timestamp } from 'firebase-admin/firestore';

const plans = [
    { id: 'basic', name: 'Basic', price: 2500 },
    { id: 'pro', name: 'Professional', price: 5000 },
];

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized: Missing token' }, { status: 401 });
        }
        
        const idToken = authHeader.split('Bearer ')[1];
        
        // Verify the user's token with Firebase Admin SDK
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        const { planId } = await req.json();

        const plan = plans.find(p => p.id === planId);

        if (!plan) {
            return NextResponse.json({ message: 'Invalid plan ID' }, { status: 400 });
        }

        // Generate a new subscription document
        const subscriptionId = `sub_${Date.now()}`;
        const subRef = adminDb.collection('users').doc(uid).collection('subscriptions').doc(subscriptionId);

        const startDate = Timestamp.now();
        const endDate = Timestamp.fromMillis(addMonths(startDate.toDate(), 1).getTime());

        const newSubscription = {
            planId: plan.id,
            planName: plan.name,
            price: plan.price,
            status: 'active',
            current_period_end: endDate,
            startDate: startDate,
        };

        // Use the Admin SDK to write the subscription, bypassing client security rules.
        await subRef.set(newSubscription);

        return NextResponse.json({ message: 'Subscription successful', subscriptionId: subRef.id }, { status: 200 });

    } catch (error: any) {
        console.error('API subscription error:', error);
        
        if (error.code === 'auth/id-token-expired') {
            return NextResponse.json({ message: 'Token expired. Please sign in again.' }, { status: 401 });
        }
        if (error.code === 'auth/argument-error') {
             return NextResponse.json({ message: 'Invalid token.' }, { status: 401 });
        }

        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
