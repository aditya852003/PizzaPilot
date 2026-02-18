"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    address: string;
    setAddress: (address: string) => void;
}

export default function LocationDialog({ open, onOpenChange, address, setAddress }: LocationDialogProps) {
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();
  const [localAddress, setLocalAddress] = useState(address);

  const handleLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          
          if (data && data.display_name) {
            const addressParts = data.display_name.split(',');
            const shortAddress = addressParts.slice(0, 3).join(', ');
            setLocalAddress(shortAddress);
            toast({
              title: "Location Found!",
              description: `Set location to ${shortAddress}.`,
            });
          } else {
            throw new Error("Could not parse address from geocoding API.");
          }
        } catch (error) {
            console.error("Geocoding error:", error);
            toast({
              variant: "destructive",
              title: "Location Error",
              description: "Could not fetch address. Please enter it manually.",
            });
        } finally {
            setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast({
          variant: "destructive",
          title: "Location Error",
          description: "Unable to retrieve your location. Please enter it manually.",
        });
      }
    );
  };

  const handleSave = () => {
      setAddress(localAddress);
      onOpenChange(false);
      if (localAddress) {
        toast({
            title: "Location Updated",
            description: `Delivery location set to ${localAddress}`,
        });
      }
  }

  useEffect(() => {
    setLocalAddress(address);
  }, [address, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Set Delivery Location</DialogTitle>
                <DialogDescription>
                    Enter your address so we know where to send your delicious pizza.
                </DialogDescription>
            </DialogHeader>
            <div className="relative mt-4">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    id="address"
                    type="text"
                    placeholder="Your Delivery Address"
                    value={localAddress}
                    onChange={(e) => setLocalAddress(e.target.value)}
                    className="pl-10"
                />
                 <Button 
                    type="button" 
                    variant="ghost" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={handleLocation}
                    disabled={isLocating}
                 >
                    {isLocating ? (
                        <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-primary"></div>
                    ) : (
                        <MapPin className="text-primary hover:text-accent h-4 w-4" />
                    )}
                    <span className="sr-only">Use current location</span>
                 </Button>
            </div>
             <DialogFooter>
                <Button onClick={handleSave}>Save Address</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
