'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Repeat, ChefHat, CheckCircle, CookingPot, Bike, UtensilsCrossed } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface OrderStatusScreenProps {
  orderId: string;
  onNewOrder: () => void;
}

const statusInfo = {
    pending: {
        icon: CookingPot,
        title: "Order Received!",
        description: "We've received your order and will start preparing it shortly.",
        color: "text-amber-500",
    },
    preparing: {
        icon: ChefHat,
        title: "Your order is in the oven! 🔥",
        description: "Our chefs are crafting your delicious pizza.",
        color: "text-orange-500",
    },
    'out for delivery': {
        icon: Bike,
        title: "On its way!",
        description: "Your pizza is out for delivery. It'll be with you soon!",
        color: "text-sky-500",
    },
    delivered: {
        icon: CheckCircle,
        title: "Enjoy your meal!",
        description: "Your order has been delivered.",
        color: "text-green-500",
    },
    cancelled: {
        icon: UtensilsCrossed,
        title: "Order Cancelled",
        description: "This order has been cancelled.",
        color: "text-red-500",
    }
}

export default function OrderStatusScreen({ orderId, onNewOrder }: OrderStatusScreenProps) {
  const firestore = useFirestore();

  const orderDocRef = useMemoFirebase(() => {
    if (!firestore || !orderId) return null;
    return doc(firestore, 'orders', orderId);
  }, [firestore, orderId]);

  const { data: order, isLoading } = useDoc<Order>(orderDocRef);

  const currentStatus = order?.status || 'pending';
  const StatusIcon = statusInfo[currentStatus]?.icon || CookingPot;

  if (isLoading || !order) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Skeleton className="h-20 w-20 rounded-full mb-4" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return (
    <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
            key={currentStatus}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
        >
            <StatusIcon className={`h-20 w-20 mb-4 ${statusInfo[currentStatus].color}`} />
            <h2 className="font-headline text-3xl mb-2">{statusInfo[currentStatus].title}</h2>
            <p className="text-muted-foreground mb-6">{statusInfo[currentStatus].description}</p>
        </motion.div>
      </AnimatePresence>

      <Card className="w-full max-w-sm my-6 bg-secondary">
        <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
            <CardDescription>#{order.id.substring(0, 6)}</CardDescription>
        </CardHeader>
        <CardContent className="text-left text-sm space-y-2">
            {order.items.map(item => (
                 <div key={item.id} className="flex justify-between items-center">
                    <p>{item.quantity} x {item.name}</p>
                    <p className="font-mono">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
            ))}
             <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                <p>Total</p>
                <p className="font-mono text-primary">₹{order.totalAmount.toFixed(2)}</p>
            </div>
        </CardContent>
      </Card>
      
      <Button onClick={onNewOrder} className="text-lg py-6 mt-4">
        <Repeat className="mr-2" /> Start a New Order
      </Button>
    </div>
  );
}
