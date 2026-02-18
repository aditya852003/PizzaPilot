'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { CATEGORIZED_MENU, ALL_MENU_ITEMS } from '@/lib/menu';
import type { InventoryItem, MenuItem } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function MenuManagementPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const inventoryQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'inventory');
    }, [firestore]);

    const { data: inventory, isLoading } = useCollection<InventoryItem>(inventoryQuery);

    const inventoryMap = new Map(inventory?.map(item => [item.id, item.inStock]));

    const handleStockToggle = async (itemId: string, inStock: boolean) => {
        if (!firestore) return;
        const itemRef = doc(firestore, 'inventory', itemId);
        try {
            await setDoc(itemRef, {
                id: itemId,
                inStock: inStock,
                updatedAt: serverTimestamp()
            }, { merge: true });
            toast({
                title: 'Inventory Updated',
                description: `${ALL_MENU_ITEMS.find(i => i.id === itemId)?.name} is now ${inStock ? 'in stock' : 'out of stock'}.`
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update inventory.' });
            console.error("Error updating inventory:", error);
        }
    };

    const MenuItemCard = ({ item }: { item: MenuItem }) => {
        const isInStock = inventoryMap.get(item.id) ?? true; // Default to in stock if not in DB
        
        return (
            <Card className={cn("flex items-center p-4 justify-between transition-opacity", !isInStock && "opacity-50")}>
                <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <p className="text-sm text-primary font-mono">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Label htmlFor={`stock-${item.id}`} className={cn("text-sm transition-colors", isInStock ? "text-muted-foreground" : "text-destructive")}>
                        {isInStock ? 'In Stock' : 'Out of Stock'}
                    </Label>
                    <Switch
                        id={`stock-${item.id}`}
                        checked={isInStock}
                        onCheckedChange={(checked) => handleStockToggle(item.id, checked)}
                        aria-label={`${item.name} stock status`}
                    />
                </div>
            </Card>
        );
    };
    
    return (
        <div className="h-full flex flex-col">
            <h1 className="text-3xl font-headline mb-1">Menu Management</h1>
            <p className="text-muted-foreground mb-6">Toggle the availability of menu items in real-time.</p>
            <ScrollArea className="flex-1 -m-4 p-4">
                 {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {CATEGORIZED_MENU.map(category => (
                            <div key={category.title}>
                                <h2 className="text-2xl font-headline mb-4 border-b border-border pb-2">{category.title}</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {category.items.map(item => (
                                        <MenuItemCard key={item.id} item={item} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
            </ScrollArea>
        </div>
    );
}
