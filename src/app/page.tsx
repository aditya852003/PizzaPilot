"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { User, OrderItem } from "@/lib/types";
import AuthScreen from "@/components/auth-screen";
import ChatScreen from "@/components/chat-screen";
import BillScreen from "@/components/bill-screen";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import ProfileButton from "@/components/profile-button";
import { useToast } from "@/hooks/use-toast";
import LocationDialog from "@/components/location-dialog";
import OrderStatusScreen from "@/components/order-status";
import { cn } from "@/lib/utils";

type AppState = "AUTH" | "ORDERING" | "BILL" | "ORDER_TRACKING";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("AUTH");
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [billOrder, setBillOrder] = useState<OrderItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [address, setAddress] = useState<string>("");
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [hasShownLocationPopup, setHasShownLocationPopup] = useState(false);
  
  const { user: firebaseUser, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const bgImage = PlaceHolderImages.find(p => p.id === 'pizza-restaurant-bg');

  const userDocRef = useMemoFirebase(() => {
    if (!firebaseUser) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  useEffect(() => {
    if (isUserLoading || (firebaseUser && isProfileLoading)) {
      return;
    }
    
    if (!userProfile || !firebaseUser) {
      if (appState !== 'AUTH') {
          setActiveUser(null);
          setBillOrder([]);
          setCart([]);
          setTrackingOrderId(null);
          setAppState("AUTH");
          setHasShownLocationPopup(false);
      }
    } else if (userProfile) {
      setActiveUser(userProfile);
      if (appState === 'AUTH') {
        setAppState("ORDERING");
      }
    }
  }, [firebaseUser, userProfile, isUserLoading, isProfileLoading, appState]);

  useEffect(() => {
    if (activeUser && !address && !hasShownLocationPopup) {
      setIsLocationDialogOpen(true);
      setHasShownLocationPopup(true);
    }
  }, [activeUser, address, hasShownLocationPopup]);


  const handlePlaceOrder = (finalCart: OrderItem[]) => {
    if (!address) {
        toast({
            variant: "destructive",
            title: "No Delivery Address",
            description: "Please set a delivery address before placing your order.",
        });
        setIsLocationDialogOpen(true);
        return;
    }
    setBillOrder(finalCart);
    setAppState("BILL");
    setCart([]);
  };
  
  const handleOrderPaid = (orderId: string) => {
    setTrackingOrderId(orderId);
    setAppState("ORDER_TRACKING");
    setBillOrder([]);
  }

  const handleNewOrder = () => {
    setBillOrder([]);
    setCart([]);
    setTrackingOrderId(null);
    setAppState("ORDERING");
  };

  const renderState = () => {
    if (isUserLoading || (firebaseUser && isProfileLoading)) {
      return (
        <div className="flex items-center justify-center p-8 min-h-[400px]">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
      );
    }
    
    switch (appState) {
      case "AUTH":
        return <AuthScreen />;
      case "ORDERING":
        if (!activeUser) return <AuthScreen />;
        return <ChatScreen user={activeUser} cart={cart} setCart={setCart} onPlaceOrder={handlePlaceOrder} />;
      case "BILL":
        if (!activeUser) return <AuthScreen />;
        return <BillScreen order={billOrder} user={activeUser} onOrderPlaced={handleOrderPaid} address={address} />;
      case "ORDER_TRACKING":
        if (!activeUser || !trackingOrderId) return <AuthScreen />;
        return <OrderStatusScreen orderId={trackingOrderId} onNewOrder={handleNewOrder} />;
      default:
        return <AuthScreen />;
    }
  };

  return (
    <main className="relative flex flex-col min-h-screen items-center p-4 sm:p-8 print:p-0 overflow-x-hidden">
       {bgImage && (
        <>
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            fill
            className="object-cover z-[-2] print:hidden blur-sm scale-105"
            data-ai-hint={bgImage.imageHint}
            priority
          />
          <div className="absolute inset-0 bg-black/70 z-[-1] print:hidden" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,black)] z-[-1] print:hidden" />
        </>
      )}
      <header className="z-10 w-full flex justify-between items-center print:hidden mb-4 md:mb-8 shrink-0">
        <div className="flex items-center justify-start">
          <h1 className="text-4xl sm:text-5xl font-headline text-white" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
            PizzaPilot
          </h1>
        </div>
        <div className="flex items-center gap-2">
            {activeUser && <ProfileButton user={activeUser} onSetLocationClick={() => setIsLocationDialogOpen(true)} />}
        </div>
      </header>
      
      <div className={cn(
        "relative w-full z-10 transition-all duration-300 flex-1 flex flex-col",
        appState === 'AUTH' ? "justify-center items-center" : "justify-start"
      )}>
        <div className={cn(
          "relative mx-auto rounded-xl border-2 border-primary/20 bg-card shadow-2xl shadow-accent/20 overflow-hidden print:border-none print:shadow-none print:bg-card flex flex-col w-full",
          appState === 'ORDERING' ? "max-w-5xl h-[calc(100vh-180px)]" : "max-w-md",
          appState === 'AUTH' && "my-auto"
        )}>
          {renderState()}
        </div>
      </div>

      <LocationDialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
        address={address}
        setAddress={setAddress}
       />
      <footer className="text-center text-sm text-white/70 print:hidden mt-8 shrink-0">
          <p>
            MIT License
            <br />
            Copyright (c) 2026 Aditya
          </p>
        </footer>
    </main>
  );
}
