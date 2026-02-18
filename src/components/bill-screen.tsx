"use client";

import { useState } from 'react';
import type { User, OrderItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign, FileText, Printer } from "lucide-react";
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface BillScreenProps {
  order: OrderItem[];
  user: User;
  onOrderPlaced: (orderId: string) => void;
  address: string;
}

export default function BillScreen({ order, user, onOrderPlaced, address }: BillScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayOrderId] = useState(Math.random().toString(36).substr(2, 9).toUpperCase());
  const firestore = useFirestore();
  const { toast } = useToast();

  const subtotal = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handlePayment = async (paymentMethod: 'Cash on Delivery' | 'Online') => {
    if (!user || !firestore || isProcessing) return;
    
    setIsProcessing(true);

    const orderData = {
      userId: user.id,
      customerName: user.name,
      orderDate: serverTimestamp(),
      totalAmount: total,
      paymentMethod: paymentMethod,
      address: address,
      status: 'preparing' as const,
      items: order,
    };
    
    try {
      const orderDocRef = await addDoc(collection(firestore, `orders`), orderData);
      onOrderPlaced(orderDocRef.id);
    } catch (error) {
      console.error("Error saving order: ", error);
      toast({
        variant: "destructive",
        title: "Order Error",
        description: "Could not save your order. Please try again.",
      });
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="border-0 shadow-none bg-transparent print:bg-white print:text-black">
      <CardHeader className="text-center p-8 relative print:p-4">
        <div className="absolute top-6 right-6 print:hidden">
            <Button variant="outline" size="icon" onClick={handlePrint} title="Print Bill">
                <Printer size={20} />
                <span className="sr-only">Print Bill</span>
            </Button>
        </div>
        <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <FileText size={32} />
        </div>
        <CardTitle className="font-headline text-3xl">Order Summary</CardTitle>
        <CardDescription>Order ID: #{displayOrderId}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 md:px-8 print:px-4">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary">
            <h3 className="font-semibold">Delivery Details</h3>
            <p className="text-muted-foreground">{user.name}</p>
            {address && <p className="text-muted-foreground">{address}</p>}
            {user.phone && <p className="text-muted-foreground">{user.phone}</p>}
            {user.email && <p className="text-muted-foreground">{user.email}</p>}
          </div>
          <Separator />
          <ul className="space-y-2">
            {order.map(item => (
              <li key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-muted-foreground"> x {item.quantity}</span>
                </div>
                <span className="font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes (10%)</span>
              <span className="font-mono">₹{tax.toFixed(2)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-2xl">
            <span>Total</span>
            <span className="font-mono text-primary">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col md:flex-row gap-4 px-6 md:px-8 pb-8 print:hidden">
        <Button onClick={() => handlePayment('Cash on Delivery')} variant="outline" className="w-full text-lg py-6" disabled={isProcessing}>
          {isProcessing ? "Processing..." : <><DollarSign /> Cash on Delivery</>}
        </Button>
        <Button onClick={() => handlePayment('Online')} className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isProcessing}>
           {isProcessing ? "Processing..." : <><CreditCard /> Pay Online</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
