'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, limit, orderBy } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import type { User, Order, Subscription } from '@/lib/types';
import AdminSidebar from '@/components/admin-sidebar';
import { useMemo, createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { PizzaPilotIcon } from '@/components/icons/pizza-pal-icon';


interface AdminContextType {
  owner: User;
  subscription: Subscription;
  allOrders: Order[] | null;
  isAllOrdersLoading: boolean;
  deliveredOrders: Order[] | null;
  isDeliveredOrdersLoading: boolean;
}
const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminLayout that has an active subscription.');
  }
  return context;
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isLoginPage = pathname === '/admin/login';
  const isSubscribePage = pathname === '/admin/subscribe';

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);
  
  const subscriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile || userProfile.role !== 'owner') return null;
    return query(
      collection(firestore, 'users', userProfile.id, 'subscriptions'),
      orderBy('current_period_end', 'desc'),
      limit(1)
    );
  }, [firestore, userProfile]);
  
  const { data: subscriptions, isLoading: isSubscriptionLoading } = useCollection<Subscription>(subscriptionsQuery);
  const latestSubscription = subscriptions?.[0];

  const activeSubscription = useMemo(() => {
    if (!latestSubscription) return null;
    const isExpired = latestSubscription.current_period_end.toDate() < new Date();
    if (isExpired || latestSubscription.status !== 'active') {
        return null;
    }
    return latestSubscription;
  }, [latestSubscription]);


  const allOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile || userProfile.role !== 'owner') return null;
    return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'));
  }, [firestore, userProfile]);

  const { data: allOrders, isLoading: isAllOrdersLoading } = useCollection<Order>(allOrdersQuery);
  
  const deliveredOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile || userProfile.role !== 'owner') return null;
    return query(collection(firestore, 'orders'), where('status', '==', 'delivered'));
  }, [firestore, userProfile]);
  
  const { data: deliveredOrders, isLoading: isDeliveredOrdersLoading } = useCollection<Order>(deliveredOrdersQuery);


  const totalRevenue = useMemo(() => {
    if (!deliveredOrders) return 0;
    return deliveredOrders.reduce((acc, order) => acc + order.totalAmount, 0);
  }, [deliveredOrders]);
  
  const isLoading = isUserLoading || (!!firebaseUser && (isProfileLoading || isSubscriptionLoading || isAllOrdersLoading || isDeliveredOrdersLoading));
  const isOwner = userProfile?.role === 'owner' && firebaseUser?.email === 'pizzapilot+admin@gmail.com';

  useEffect(() => {
    if (isLoading) return;

    if (!firebaseUser && !isLoginPage) {
      router.replace('/admin/login');
      return;
    }
    
    if (firebaseUser) {
      if (isLoginPage) {
        router.replace('/admin/orders');
        return;
      }
      
      if (!isOwner) {
        router.replace('/');
        return;
      }

      if (isOwner) {
        if (!activeSubscription && !isSubscribePage) {
          router.replace('/admin/subscribe');
        }
        if (activeSubscription && isSubscribePage) {
           router.replace('/admin/orders');
        }
        if (activeSubscription?.planId === 'basic' && pathname === '/admin/analytics') {
          toast({ title: 'Upgrade Required', description: 'Access to Analytics requires a Professional plan.' });
          router.replace('/admin/orders');
        }
      }
    }
  }, [isLoading, isOwner, isLoginPage, isSubscribePage, router, firebaseUser, activeSubscription, pathname, toast]);

  if (isLoginPage || (isOwner && !activeSubscription && isSubscribePage)) {
    return <>{children}</>;
  }

  if (isLoading || !isOwner) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 border-4 border-dashed rounded-full animate-spin border-primary"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  if (isOwner && !activeSubscription) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                <p className="text-muted-foreground">Redirecting to subscription...</p>
            </div>
        </div>
      )
  }
  
  if (!activeSubscription) {
      return null;
  }
  
  const adminContextValue: AdminContextType = { 
    owner: userProfile, 
    subscription: activeSubscription,
    allOrders,
    isAllOrdersLoading,
    deliveredOrders,
    isDeliveredOrdersLoading,
  };

  return (
      <AdminContext.Provider value={adminContextValue}>
          <div className={cn(
              "grid min-h-screen w-full transition-all duration-300",
              isCollapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[280px_1fr]"
            )}>
              <div className="hidden md:block">
                <AdminSidebar 
                  user={userProfile} 
                  totalRevenue={totalRevenue} 
                  isRevenueLoading={isDeliveredOrdersLoading} 
                  subscription={activeSubscription}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                />
              </div>

              <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
                      <AdminSidebar 
                        user={userProfile} 
                        totalRevenue={totalRevenue} 
                        isRevenueLoading={isDeliveredOrdersLoading} 
                        subscription={activeSubscription}
                        isCollapsed={false}
                        onToggleCollapse={() => {}}
                        isMobile={true}
                      />
                    </SheetContent>
                  </Sheet>
                  <div className="flex w-full justify-center items-center gap-2">
                      <PizzaPilotIcon className="w-8 h-8 shrink-0" />
                      <span className="font-headline text-2xl">PizzaPilot</span>
                  </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-y-auto">
                    {children}
                </main>
              </div>
          </div>
      </AdminContext.Provider>
  );
}
