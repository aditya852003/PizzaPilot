import { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: 'customer' | 'owner';
  stripeId?: string;
  stripeLink?: string;
}

export interface Subscription {
  id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_end: Timestamp;
  planId: 'basic' | 'pro';
  planName: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imageHint: string;
  category: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id:string;
  userId: string;
  orderDate: Timestamp;
  totalAmount: number;
  paymentMethod: string;
  address?: string;
  status: 'pending' | 'accepted' | 'preparing' | 'out for delivery' | 'delivered' | 'cancelled';
  items: OrderItem[];
  customerName?: string;
}

export interface Message {
  id:string;
  type: 'user' | 'bot' | 'suggestion' | 'order_confirmation';
  text: string;
  suggestion?: {
    suggestion: string;
    reasoning: string;
    item?: MenuItem;
  };
}

export interface InventoryItem {
    id: string;
    inStock: boolean;
}

export interface RestaurantMetadata {
    restaurantName: string;
    contactInfo: string;
}
