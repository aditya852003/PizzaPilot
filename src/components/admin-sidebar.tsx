'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User, Subscription } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { CookingPot, LogOut, Settings, ShoppingCart, Home, TrendingUp, Gem, PanelLeft } from 'lucide-react';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { PizzaPilotIcon } from './icons/pizza-pal-icon';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from './ui/scroll-area';


interface AdminSidebarProps {
  user: User;
  totalRevenue: number;
  isRevenueLoading: boolean;
  subscription: Subscription;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
}

const navItems = [
    { href: '/admin/orders', label: 'Live Orders', icon: ShoppingCart, plan: 'basic' },
    { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp, plan: 'pro' },
    { href: '/admin/menu', label: 'Menu', icon: CookingPot, plan: 'basic' },
    { href: '/admin/profile', label: 'Settings', icon: Settings, plan: 'basic' },
]

export default function AdminSidebar({ user, totalRevenue, isRevenueLoading, subscription, isCollapsed, onToggleCollapse, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const auth = useAuth();

  const handleSignOut = () => {
    signOut(auth);
  };
  
  const contentIsHidden = isCollapsed && !isMobile;
  const showCollapseButton = !isMobile;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full max-h-screen flex-col border-r bg-card">
          <div className={cn("flex h-16 items-center border-b", contentIsHidden ? "justify-center px-2" : "justify-between px-6")}>
              <Link href="/admin/orders" className="flex items-center gap-2 text-foreground">
                  <PizzaPilotIcon className="w-8 h-8 shrink-0" />
                  <span className={cn("font-headline text-4xl transition-all", contentIsHidden ? "w-0 opacity-0" : "w-auto opacity-100")}>PizzaPilot</span>
              </Link>
          </div>

          <ScrollArea className="flex-1">
            <nav className="grid items-start gap-1 px-2 text-sm font-medium">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant="ghost" className={cn("w-full justify-start text-muted-foreground", contentIsHidden && "justify-center px-0")}>
                            <Link href="/">
                                <Home className={cn("h-4 w-4 shrink-0", !contentIsHidden && "mr-2")} />
                                <span className={cn("transition-all", contentIsHidden && "w-0 opacity-0")}>Back to App</span>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    {contentIsHidden && <TooltipContent side="right">Back to App</TooltipContent>}
                </Tooltip>
                <Separator />
                {navItems
                    .filter(item => subscription.planId === 'pro' || item.plan === 'basic')
                    .map(item => (
                        <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                                <Button
                                    asChild
                                    variant={pathname.startsWith(item.href) ? 'default' : 'ghost'}
                                    className={cn("w-full justify-start", contentIsHidden && "justify-center px-0")}
                                >
                                    <Link href={item.href}>
                                        <item.icon className={cn("h-4 w-4 shrink-0", !contentIsHidden && "mr-2")} />
                                        <span className={cn("transition-all", contentIsHidden && "w-0 opacity-0")}>{item.label}</span>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            {contentIsHidden && <TooltipContent side="right">{item.label}</TooltipContent>}
                        </Tooltip>
                ))}
            </nav>
          </ScrollArea>

          <div className="mt-auto flex flex-col gap-4 border-t p-4">
            <div className={cn("transition-all space-y-4", contentIsHidden && "h-0 opacity-0 overflow-hidden")}>
               <div>
                  <h3 className="mb-1 text-xs uppercase text-muted-foreground tracking-wider">Revenue</h3>
                  {isRevenueLoading ? (
                      <Skeleton className="h-8 w-full" />
                  ) : (
                       <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 text-lg font-bold font-mono">
                          <TrendingUp className="h-5 w-5 text-status-completed" />
                          <span>
                              ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                      </div>
                  )}
              </div>
               <div className="p-2 rounded-md bg-secondary/50 space-y-2">
                  <div className="flex justify-between items-center">
                      <span className="font-bold text-sm flex items-center gap-2">
                          <Gem className="w-4 h-4 text-primary" /> {subscription.planName}
                      </span>
                      <Badge variant="default" className="capitalize bg-status-completed/20 text-status-completed border-none">
                          {subscription.status}
                      </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Renews</span>
                      <span className="font-mono">{format(subscription.current_period_end.toDate(), 'dd MMM yyyy')}</span>
                  </div>
                   <Button asChild size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
                      <Link href="/admin/subscribe">
                          {subscription.planId === 'basic' ? 'Upgrade to Pro' : 'Manage Subscription'}
                      </Link>
                  </Button>
              </div>
            </div>

            <Separator />
            <div className={cn("flex items-center gap-3", contentIsHidden && "justify-center")}>
                 <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                     {user.name.charAt(0)}
                 </div>
                 <div className={cn("truncate transition-all", contentIsHidden && "w-0 opacity-0")}>
                    <p className="font-semibold truncate text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                 </div>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={handleSignOut} className={cn("w-full justify-start text-muted-foreground hover:bg-destructive hover:text-destructive-foreground", contentIsHidden && "justify-center px-0")}>
                        <LogOut className={cn("h-4 w-4 shrink-0", !contentIsHidden && "mr-2")} />
                        <span className={cn("transition-all", contentIsHidden && "w-0 opacity-0")}>Sign Out</span>
                    </Button>
                </TooltipTrigger>
                {contentIsHidden && <TooltipContent side="right">Sign Out</TooltipContent>}
            </Tooltip>
          </div>

          {showCollapseButton && (
            <div className="border-t p-2">
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button variant="ghost" onClick={onToggleCollapse} className={cn("w-full justify-start text-muted-foreground", contentIsHidden && "justify-center px-0")}>
                          <PanelLeft className={cn("h-4 w-4 shrink-0 transition-transform", !contentIsHidden && "mr-2", contentIsHidden && "rotate-180")} />
                          <span className={cn("transition-all", contentIsHidden && "w-0 opacity-0")}>Collapse</span>
                      </Button>
                  </TooltipTrigger>
                  {contentIsHidden && (
                      <TooltipContent side="right">
                          Expand
                      </TooltipContent>
                  )}
              </Tooltip>
            </div>
          )}

      </div>
    </TooltipProvider>
  );
}
