'use client';

import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Check, X, CookingPot, Bike, CheckCircle2, Bot } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdmin } from '../layout';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';


export default function OrdersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { allOrders: orders, isAllOrdersLoading: isLoading } = useAdmin();

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        if (!firestore) return;
        const orderRef = doc(firestore, 'orders', orderId);
        try {
            await updateDoc(orderRef, { status });
            toast({
                title: "Order Status Updated",
                description: `Order #${orderId.substring(0, 6)} is now '${status}'.`,
            });
        } catch (error) {
            console.error("Error updating order status: ", error);
            toast({ variant: "destructive", title: "Update Error", description: "Could not update order status." });
        }
    };
    
    const getStatusInfo = (status: Order['status']) => {
      switch (status) {
        case 'pending': return { className: 'bg-status-pending/10 text-status-pending border-status-pending/20' };
        case 'accepted': return { className: 'bg-status-accepted/10 text-status-accepted border-status-accepted/20' };
        case 'preparing': return { className: 'bg-status-preparing/10 text-status-preparing border-status-preparing/20' };
        case 'out for delivery': return { className: 'bg-status-delivery/10 text-status-delivery border-status-delivery/20' };
        case 'delivered': return { className: 'bg-status-completed/10 text-status-completed border-status-completed/20' };
        case 'cancelled': return { className: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20' };
        default: return { className: 'bg-muted text-muted-foreground' };
      }
    };

    const OrderCard = ({ order }: { order: Order }) => (
        <Card className="bg-card hover:border-primary/50 transition-colors duration-300">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold tracking-wide">#{order.id.substring(0, 6).toUpperCase()}</CardTitle>
                  <Badge variant="outline" className={cn("capitalize", getStatusInfo(order.status).className)}>{order.status}</Badge>
                </div>
                <CardDescription>
                    {order.orderDate ? format(order.orderDate.toDate(), 'MMM d, yyyy, h:mm a') : 'N/A'}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
                <p className="font-medium mb-2">{order.customerName || 'Guest'}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    {order.items.map(item => (
                        <li key={item.id} className="flex justify-between">
                          <span>{item.quantity} x {item.name}</span>
                          <span className="font-mono">₹{item.price.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                {order.address && (
                    <div className="text-xs text-muted-foreground mt-3 border-t border-border pt-2">
                        <p>Address: {order.address}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-2">
                <div className="flex justify-between items-center border-t border-border pt-4">
                    <span className="text-sm font-medium">Total</span>
                    <span className="font-semibold text-lg text-primary">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                 {order.status === 'pending' && (
                    <div className="flex w-full gap-2 pt-2">
                        <Button className="w-full" variant="outline" onClick={() => updateOrderStatus(order.id, 'accepted')}>
                            <Check className="mr-2 h-4 w-4"/> Accept
                        </Button>
                        <Button variant="destructive" className="w-full" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                            <X className="mr-2 h-4 w-4"/> Reject
                        </Button>
                    </div>
                )}
                 {order.status !== 'pending' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="flex w-full items-center gap-2 pt-2">
                        <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value as Order['status'])}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Update status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="accepted"><Check className="mr-2 h-4 w-4 inline-block"/>Accepted</SelectItem>
                                <SelectItem value="preparing"><CookingPot className="mr-2 h-4 w-4 inline-block"/>Preparing</SelectItem>
                                <SelectItem value="out for delivery"><Bike className="mr-2 h-4 w-4 inline-block"/>Out for Delivery</SelectItem>
                                <SelectItem value="delivered"><CheckCircle2 className="mr-2 h-4 w-4 inline-block"/>Delivered</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardFooter>
        </Card>
    );

    const getOrdersByStatus = (status: Order['status']) => orders?.filter(o => o.status === status) || [];
    const getActiveOrders = () => orders?.filter(o => o.status === 'accepted' || o.status === 'preparing' || o.status === 'out for delivery') || [];
    const getPastOrders = () => orders?.filter(o => o.status === 'delivered' || o.status === 'cancelled') || [];
    
    return (
        <div className="h-full flex flex-col">
            <h1 className="text-3xl font-headline mb-1">Live Orders</h1>
            <p className="text-muted-foreground mb-6">View and manage all incoming and active orders.</p>
            <Tabs defaultValue="new" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="new" className="relative">
                      New ({getOrdersByStatus('pending').length})
                      {getOrdersByStatus('pending').length > 0 && <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />}
                    </TabsTrigger>
                    <TabsTrigger value="active">Active ({getActiveOrders().length})</TabsTrigger>
                    <TabsTrigger value="history">History ({getPastOrders().length})</TabsTrigger>
                </TabsList>

                <div className="flex-1 mt-6 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pr-4">
                        {isLoading && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
                        
                        <TabsContent value="new" className="col-span-full mt-0 contents">
                          {!isLoading && getOrdersByStatus('pending').map(order => <OrderCard key={order.id} order={order} />)}
                        </TabsContent>
                        <TabsContent value="active" className="col-span-full mt-0 contents">
                          {!isLoading && getActiveOrders().map(order => <OrderCard key={order.id} order={order} />)}
                        </TabsContent>
                        <TabsContent value="history" className="col-span-full mt-0 contents">
                          {!isLoading && getPastOrders().map(order => <OrderCard key={order.id} order={order} />)}
                        </TabsContent>

                    </div>
                     {!isLoading && orders?.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground italic py-10">
                            <Bot size={48} className="mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">AI is standing by...</h3>
                            <p>No orders yet. As soon as one comes in, you'll see it here.</p>
                        </div>
                      )}
                  </ScrollArea>
                </div>
            </Tabs>
        </div>
    );
}
