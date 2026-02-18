import { format } from 'date-fns';
import type { Order, OrderItem } from './types';

// Type for daily revenue data points
export interface DailyDataPoint {
  date: string;
  revenue: number;
}

// Type for sales mix data points
export interface SalesMixItem {
  name: string;
  value: number; // Represents quantity sold
}

// Type for delivery hotspot data
export interface DeliveryHotspot {
  address: string;
  count: number;
}

// Type for daily order count
export interface OrdersPerDay {
  date: string;
  orders: number;
}

/**
 * Processes a list of orders to calculate total revenue per day.
 * @param orders - An array of Order objects.
 * @returns An array of data points with date and total revenue.
 */
export function processDailyRevenue(orders: Order[]): DailyDataPoint[] {
  if (!orders || orders.length === 0) return [];

  const dailyTotals = orders.reduce((acc, order) => {
    const date = format(order.orderDate.toDate(), 'MMM d');
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += order.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(dailyTotals)
    .map(([date, revenue]) => ({
      date,
      revenue: parseFloat(revenue.toFixed(2)),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Processes a list of orders to count total orders per day.
 * @param orders - An array of Order objects.
 * @returns An array of data points with date and total order count.
 */
export function processOrdersPerDay(orders: Order[]): OrdersPerDay[] {
    if (!orders || orders.length === 0) return [];

    const dailyCounts = orders.reduce((acc, order) => {
        const date = format(order.orderDate.toDate(), 'MMM d');
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyCounts)
        .map(([date, count]) => ({
            date,
            orders: count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}


/**
 * Processes a list of orders to calculate the quantity of each item sold.
 * @param orders - An array of Order objects.
 * @returns An array of top-selling items with their quantities.
 */
export function processSalesMix(orders: Order[]): SalesMixItem[] {
  if (!orders || orders.length === 0) return [];

  const itemCounts = orders
    .flatMap(order => order.items)
    .reduce((acc, item: OrderItem) => {
      if (!acc[item.name]) {
        acc[item.name] = 0;
      }
      acc[item.name] += item.quantity;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(itemCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Return top 5 items
}

/**
 * Processes a list of orders to identify top delivery locations.
 * @param orders - An array of Order objects with address information.
 * @returns A sorted array of top delivery hotspots.
 */
export function processDeliveryHotspots(orders: Order[]): DeliveryHotspot[] {
  if (!orders || orders.length === 0) return [];

  const locationCounts = orders
    .filter(order => order.address && order.address.trim() !== '')
    .reduce((acc, order) => {
      const address = order.address!;
      if (!acc[address]) {
        acc[address] = 0;
      }
      acc[address]++;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(locationCounts)
    .map(([address, count]) => ({ address, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Return top 5 locations
}
