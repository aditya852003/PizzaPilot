
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { suggestAddOn } from "@/ai/flows/smart-upselling";
import { answerMenuQuestion, type MenuQuestionOutput } from "@/ai/flows/menu-qa";
import { CATEGORIZED_MENU, ALL_MENU_ITEMS } from "@/lib/menu";
import type { User, OrderItem, Message, MenuItem, InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Plus, Minus, Send, ShoppingCart, Sparkles, ThumbsUp, ThumbsDown, ArrowRight, Menu as MenuIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";


interface ChatScreenProps {
  user: User;
  onPlaceOrder: (order: OrderItem[]) => void;
  cart: OrderItem[];
  setCart: (cart: OrderItem[] | ((prev: OrderItem[]) => OrderItem[])) => void;
}

const getImage = (id: string) => PlaceHolderImages.find(p => p.id === id);

// Response variations
const initialMessages = (name: string) => {
    const messages = [
        `Hey ${name}, PizzaPilot here! 🚀 Ready to order? Just tell me what you're craving.`,
        `Welcome, ${name}! Your pizza co-pilot is ready for takeoff. What can I get for you?`,
        `Alright, ${name}! Let's find the perfect slice for you. What are we thinking today?`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};

const addItemResponses = (itemName: string) => {
    const responses = [
        `One ${itemName}, coming right up! Excellent choice.`,
        `You got it! Adding a delicious ${itemName} to your order.`,
        `A fantastic ${itemName} for a fantastic customer! Added.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
};

const menuNotFoundResponses = [
    "Whoops! I don't think that's on our menu. I can only whip up the delicious items you see listed. Just ask to see the 'menu'!",
    "My apologies, I'm not familiar with that dish. You can ask to see the 'menu' to see what I can make for you!",
    "Hmm, that doesn't sound like one of my specialties. Check out the 'menu' for all the tasty treats I can prepare!"
];

const outOfStockResponses = (itemName: string) => [
    `Oh no! It looks like we're all out of ${itemName} at the moment. Can I get you something else?`,
    `So sorry, but the ${itemName} is so popular it just ran out! Would you like to try another item?`,
];

const getMenuNotFoundResponse = () => menuNotFoundResponses[Math.floor(Math.random() * menuNotFoundResponses.length)];
const getOutOfStockResponse = (itemName: string) => outOfStockResponses(itemName)[Math.floor(Math.random() * outOfStockResponses.length)];


export default function ChatScreen({ user, onPlaceOrder, cart, setCart }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const initialMessageSent = useRef(false);

  const firestore = useFirestore();
  const inventoryQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'inventory');
  }, [firestore]);
  const { data: inventory } = useCollection<InventoryItem>(inventoryQuery);
  const outOfStockItems = new Set(inventory?.filter(item => !item.inStock).map(item => item.id));

  const thinkingMessages = [
    "Finding the best slice for you…",
    "Consulting my secret recipe book...",
    "Prepping the oven...",
    "Just a moment, crafting your perfect pizza experience...",
  ];

  const addMessage = (message: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { ...message, id: crypto.randomUUID() }]);
  };

  const startThinking = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * thinkingMessages.length);
    setThinkingMessage(thinkingMessages[randomIndex]);
    setIsThinking(true);
  }, [thinkingMessages]);

  const stopThinking = useCallback(() => {
    setIsThinking(false);
    setThinkingMessage("");
  }, []);

  const handleConfirmOrder = useCallback(() => {
    setMessages(prev => prev.filter(m => m.type !== 'order_confirmation'));
    setIsConfirming(true);
    addMessage({
        type: 'order_confirmation',
        text: "Your order looks delicious! Is there anything else you'd like to add, or are you ready to checkout?"
    });
  }, []);

  const triggerUpsell = useCallback(async (item: MenuItem) => {
    startThinking();
    try {
      const orderContext = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
      const result = await suggestAddOn({ item: item.name, orderContext });
      const suggestedItem = ALL_MENU_ITEMS.find(i => i.name.toLowerCase() === result.suggestion.toLowerCase());

      if (suggestedItem && !outOfStockItems.has(suggestedItem.id)) {
        addMessage({
            type: 'suggestion',
            text: '', // This is blank because the card has all the info
            suggestion: {
                suggestion: result.suggestion,
                reasoning: result.reasoning,
                item: suggestedItem,
            }
        });
      } else {
        handleConfirmOrder();
      }
    } catch (error) {
      console.error("Error fetching upsell suggestion:", error);
      handleConfirmOrder();
    } finally {
      stopThinking();
    }
  }, [cart, startThinking, stopThinking, handleConfirmOrder, outOfStockItems]);

  const addItemToOrder = useCallback((item: MenuItem, fromSuggestion: boolean = false) => {
    if (outOfStockItems.has(item.id)) {
        addMessage({ type: 'bot', text: getOutOfStockResponse(item.name) });
        return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(orderItem => orderItem.id === item.id);
      if (existingItem) {
        return prevCart.map(orderItem =>
          orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });

    addMessage({ type: 'bot', text: addItemResponses(item.name) });
    
    const shouldUpsell = item.category.includes('Pizza') && !fromSuggestion;
    if(shouldUpsell) {
        triggerUpsell(item);
    } else {
        handleConfirmOrder();
    }
  }, [triggerUpsell, handleConfirmOrder, setCart, outOfStockItems]);

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prevCart =>
      prevCart
        .map(item => (item.id === itemId ? { ...item, quantity: item.quantity + delta } : item))
        .filter(item => item.quantity > 0)
    );
  };
  
  const handleSuggestionResponse = (accepted: boolean, suggestionText: string) => {
    setMessages(prev => prev.filter(m => m.type !== 'suggestion'));

    const suggestedItem = ALL_MENU_ITEMS.find(i => i.name.toLowerCase() === suggestionText.toLowerCase());

    if (accepted && suggestedItem) {
        addItemToOrder(suggestedItem, true);
    } else if (accepted) {
        addMessage({ type: 'bot', text: `My apologies, I can't seem to find "${suggestionText}" on my list of secret ingredients (or the menu).` });
        handleConfirmOrder();
    } else {
        addMessage({ type: 'bot', text: "No worries! Your order is perfect as is." });
        handleConfirmOrder();
    }
  };

  const handleConfirmationResponse = (addMore: boolean) => {
    setMessages(prev => prev.filter(m => m.type !== 'order_confirmation'));
    setIsConfirming(false);

    if (addMore) {
        addMessage({ type: 'bot', text: "Sure! What else can I get for you?" });
    } else {
        addMessage({ type: 'bot', text: "Great! Proceeding to your bill." });
        onPlaceOrder(cart);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const currentMessage = userInput;
    addMessage({ type: 'user', text: currentMessage });
    setUserInput("");
    
    if (currentMessage.toLowerCase().includes('menu')) {
      setIsMenuOpen(true);
      addMessage({ type: 'bot', text: `Right this way! Here's our full menu.` });
      return;
    }
    
    startThinking();

    try {
      const result: MenuQuestionOutput = await answerMenuQuestion(currentMessage);
      stopThinking();

      if (!result) {
        addMessage({ type: 'bot', text: getMenuNotFoundResponse() });
        return;
      }

      switch (result.action) {
        case 'order':
          if (result.item?.id) {
            const itemToAdd = ALL_MENU_ITEMS.find(i => i.id === result.item.id);
            if (itemToAdd) {
              // The addItemToOrder function handles all logic including confirmation messages and upsells.
              addItemToOrder(itemToAdd);
            } else {
              addMessage({ type: 'bot', text: `My apologies, I couldn't find "${result.item.name}" on the menu.` });
            }
          } else {
            // If action is 'order' but no item is returned, treat as a question.
            addMessage({ type: 'bot', text: result.answer });
          }
          break;
        
        case 'answer':
        case 'not_found':
          addMessage({ type: 'bot', text: result.answer });
          break;
        
        default:
          addMessage({ type: 'bot', text: getMenuNotFoundResponse() });
          break;
      }
    } catch (error) {
        console.error("Error processing message:", error);
        stopThinking();
        addMessage({ type: 'bot', text: "I'm having a little trouble right now. Please try asking in a different way or select an item from the menu." });
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (cart.length > 0 && !isThinking && messages[messages.length-1]?.type !== 'order_confirmation' && messages[messages.length-1]?.type !== 'suggestion' && !isConfirming) {
        handleConfirmOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[cart, isThinking, messages.length]);


  useEffect(() => {
    if (initialMessageSent.current === false) {
      addMessage({ type: 'bot', text: initialMessages(user.name) });
      initialMessageSent.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-6 p-4 md:p-6 h-full">
      <div className="md:col-span-2 flex flex-col h-3/5 md:h-auto md:flex-1 min-h-0">
        <h2 className="font-headline text-2xl mb-4 px-2">Order Assistant</h2>
        <Card className="flex-1 flex flex-col bg-card/100 overflow-hidden">
          <CardContent className="flex-1 p-0 relative">
            <ScrollArea className="absolute inset-0 p-4" ref={scrollAreaRef}>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "flex items-start gap-3 mb-4",
                        message.type === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.type !== "user" && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground"><ChefHat size={20} /></div>}
                    <div className={cn("max-w-md rounded-lg shadow-md", 
                        message.type === 'user' ? 'bg-primary text-primary-foreground px-4 py-2' : 'bg-secondary text-secondary-foreground',
                        message.type === 'suggestion' ? 'special-offer animate-spicy-pulse p-0 overflow-hidden w-full' : 'px-4 py-2',
                        message.type === 'order_confirmation' ? 'w-full' : ''
                    )}>
                        { message.type !== 'suggestion' && <p className="text-base whitespace-pre-line">{message.text}</p>}
                        
                        {message.type === 'suggestion' && message.suggestion?.item && (() => {
                            const img = getImage(message.suggestion.item.image);
                            return (
                                <>
                                    {img && (
                                        <Image
                                            src={img.imageUrl}
                                            alt={message.suggestion.suggestion}
                                            width={400}
                                            height={200}
                                            className="w-full h-32 object-cover"
                                            data-ai-hint={img.imageHint}
                                        />
                                    )}
                                    <div className="p-4">
                                        <p className="font-bold text-lg flex items-center gap-2"><Sparkles size={18} /> How about some {message.suggestion.suggestion}?</p>
                                        <p className="text-sm italic mt-1 opacity-90">{message.suggestion.reasoning}</p>
                                        <div className="flex flex-col sm:flex-row gap-2 mt-3">
                                            <Button size="sm" variant="outline" className="w-full sm:flex-1 bg-white/10 border-white/20 hover:bg-white/20 text-white" onClick={() => handleSuggestionResponse(true, message.suggestion.suggestion)}>
                                                <ThumbsUp size={16}/> Yes, please!
                                            </Button>
                                            <Button size="sm" variant="ghost" className="w-full sm:flex-1 hover:bg-white/10 text-white" onClick={() => handleSuggestionResponse(false, message.suggestion.suggestion)}>
                                                <ThumbsDown size={16}/> No, thanks
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )
                        })()}

                        {message.type === 'order_confirmation' && (
                           <div className="mt-2 border-t border-secondary-foreground/20 pt-2">
                                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                                    <Button size="sm" variant="outline" className="w-full sm:w-auto border-border hover:bg-accent/20" onClick={() => handleConfirmationResponse(true)}>
                                        <Plus size={16}/> Yes, add more
                                    </Button>
                                    <Button size="sm" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white" onClick={() => handleConfirmationResponse(false)}>
                                        <ArrowRight size={16}/> Proceed to Bill
                                    </Button>
                                </div>
                           </div>
                        )}
                    </div>
                  </motion.div>
                ))}
                {isThinking && (
                     <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 mb-4 justify-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground"><ChefHat size={20} /></div>
                        <div className="bg-secondary rounded-lg px-4 py-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                            <p className="text-muted-foreground pl-2">{thinkingMessage}</p>
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleSendMessage();
              }}
              className="flex w-full items-center gap-2"
            >
              <Input
                type="text"
                placeholder="Tell me what you're craving…"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isThinking}
                className="flex-1 text-base"
              />
              <Button type="submit" size="icon" disabled={isThinking || !userInput.trim()}>
                <Send size={20} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      <div className="md:col-span-1 flex flex-col h-2/5 md:h-auto md:flex-1 min-h-0">
        <div className="flex justify-end items-center mb-4 px-2">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline">
                        <MenuIcon className="mr-2 h-4 w-4" />
                        View Menu
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                    <SheetHeader className="px-6 pt-6">
                        <SheetTitle className="font-headline text-3xl">Our Menu</SheetTitle>
                        <SheetDescription>
                            Click on any item to add it to your order. Items in gray are out of stock.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-1 px-6">
                       <Accordion type="multiple" defaultValue={CATEGORIZED_MENU.map(c => c.title)} className="w-full">
                            {CATEGORIZED_MENU.map((category) => (
                                <AccordionItem value={category.title} key={category.title}>
                                    <AccordionTrigger className="text-xl font-headline">{category.title}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 gap-4 py-4">
                                            {category.items.map((item) => {
                                                const img = getImage(item.image);
                                                const isOutOfStock = outOfStockItems.has(item.id);
                                                return (
                                                    <Card key={item.id} className={cn("overflow-hidden transition-all group", isOutOfStock ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary")} onClick={() => { if(!isOutOfStock) { addItemToOrder(item); setIsMenuOpen(false); }}}>
                                                        <div className="relative">
                                                            {img && <Image src={img.imageUrl} alt={item.name} width={400} height={300} className={cn("w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300", isOutOfStock && "grayscale")} data-ai-hint={img.imageHint} />}
                                                            {isOutOfStock && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold bg-destructive px-2 py-1 rounded">OUT OF STOCK</span></div>}
                                                        </div>
                                                        <CardHeader className="p-3">
                                                            <CardTitle className="text-base font-headline">{item.name}</CardTitle>
                                                            <p className="text-primary font-bold text-sm">₹{item.price.toFixed(2)}</p>
                                                        </CardHeader>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
        
        <Card className="bg-card/100 flex-1 flex flex-col min-h-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline"><ShoppingCart />Your order</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full px-6">
                {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Your cart is empty. Browse the menu to get started!</p>
                ) : (
                    <div className="space-y-4 py-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}><Minus size={14}/></Button>
                                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}><Plus size={14}/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
          </CardContent>
          {cart.length > 0 && (
            <CardFooter className="flex-col items-stretch p-4 border-t space-y-4">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
                {isConfirming ? (
                    <Button className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleConfirmationResponse(false)}>
                        Proceed to Bill <ArrowRight />
                    </Button>
                ) : (
                    <Button className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleConfirmOrder} disabled={cart.length === 0}>
                        Place Order <ArrowRight />
                    </Button>
                )}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
