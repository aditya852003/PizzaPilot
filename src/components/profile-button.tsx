

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { User as UserIcon, LogOut, Shield, MapPin } from 'lucide-react';
import type { User } from '@/lib/types';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Separator } from '@/components/ui/separator';

interface ProfileButtonProps {
  user: User;
  onSetLocationClick: () => void;
}

export default function ProfileButton({ user, onSetLocationClick }: ProfileButtonProps) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = () => {
    signOut(auth);
  };

  const isAdmin = user.role === 'owner' && user.email === 'pizzapilot+admin@gmail.com';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full bg-card/100 hover:bg-card/50 border-primary/20 text-white hover:text-white">
          <UserIcon />
          <span className="sr-only">Open user profile</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-card border-primary/20 text-card-foreground p-0">
        <div className="p-4">
            <h4 className="font-semibold truncate">{user.name}</h4>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
        <Separator />
        <div className="p-2 flex flex-col gap-1">
            <Button variant="ghost" onClick={() => { onSetLocationClick(); setOpen(false); }} className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Set Delivery Location
            </Button>
            {isAdmin && (
                <Button asChild variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
                    <Link href="/admin/orders">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                    </Link>
                </Button>
            )}
            <Separator />
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-muted-foreground hover:bg-destructive hover:text-destructive-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
            </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

    
