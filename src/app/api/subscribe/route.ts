import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { addMonths } from 'date-fns';

export const dynamic = 'force-dynamic';

const AVAILABLE_PLANS = [
  { id: 'basic', name: 'Basic', price: 2500 },
  { id: 'pro', name: 'Professional', price: 5000 },
];

/**
 * PRODUCTION-SAFE SUBSCRIPTION HANDLER
 * Uses Admin SDK exclusively for secure, server-side data mutations.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    const db = getAdminDb();

    // 1. Verify Identity
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Validate Payload
    const { planId } = await req.json();
    const plan = AVAILABLE_PLANS.find(p => p.id === planId);

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // 3. Perform Mutation
    const subRef = db.collection('users').doc(uid).collection('subscriptions').doc();
    const startDate = new Date();
    const endDate = addMonths(startDate, 1);

    const subscriptionData = {
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      status: 'active',
      current_period_end: FieldValue.serverTimestamp(), // Firestore will set this
      // Actually, we want a real date for 'current_period_end'
      current_period_end_date: endDate, 
      startDate: FieldValue.serverTimestamp(),
    };

    // Override the timestamp logic for precise end date
    const finalData = {
      ...subscriptionData,
      current_period_end: admin.firestore.Timestamp.fromDate(endDate),
    };

    await subRef.set(finalData);

    return NextResponse.json({ 
      success: true, 
      subscriptionId: subRef.id 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Subscription API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process subscription',
      message: error.message 
    }, { status: 500 });
  }
}
