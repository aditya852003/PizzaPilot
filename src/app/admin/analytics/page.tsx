
'use client';
import { useMemo, useState } from 'react';
import type { Order } from '@/lib/types';
import {
  processDailyRevenue,
  processSalesMix,
  processDeliveryHotspots,
  processOrdersPerDay,
} from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays, isWithinInterval } from 'date-fns';
import { Bot, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdmin } from '../layout';

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#d0ed57',
];

export default function AnalyticsPage() {
  const { deliveredOrders: allOrders, isDeliveredOrdersLoading: isLoading } = useAdmin();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    if (!dateRange || !dateRange.from || !dateRange.to) return allOrders;
    
    return allOrders.filter(order => {
        const orderDate = order.orderDate.toDate();
        return isWithinInterval(orderDate, { start: dateRange.from!, end: dateRange.to! });
    });
  }, [allOrders, dateRange]);


  const dailyRevenue = useMemo(() => processDailyRevenue(filteredOrders), [filteredOrders]);
  const salesMix = useMemo(() => processSalesMix(filteredOrders), [filteredOrders]);
  const deliveryHotspots = useMemo(() => processDeliveryHotspots(filteredOrders), [filteredOrders]);
  const ordersPerDay = useMemo(() => processOrdersPerDay(filteredOrders), [filteredOrders]);

  const totalRevenue = dailyRevenue.reduce((acc, curr) => acc + curr.revenue, 0);

  const lineChartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const barChartConfig = {
    orders: {
      label: "Orders",
      color: "hsl(var(--accent))",
    },
  } satisfies ChartConfig;

  const pieChartConfig = useMemo(() => {
    if (!salesMix) return {};
    return salesMix.reduce((acc, cur, index) => {
        acc[cur.name] = {
            label: cur.name,
            color: PIE_COLORS[index % PIE_COLORS.length]
        }
        return acc
    }, {} as ChartConfig)
  }, [salesMix]);


  const renderCharts = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
          ))}
        </div>
      );
    }

    if (!allOrders || allOrders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center text-muted-foreground italic">
            <Bot size={48} className="mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Awaiting Data...</h3>
            <p>Once you have some delivered orders, your analytics will appear here.</p>
        </div>
      )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Sales Trend</CardTitle>
                    <CardDescription>
                        Total revenue of ₹{totalRevenue.toFixed(2)} generated in this period.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <ChartContainer config={lineChartConfig} className="w-full h-full">
                        <LineChart accessibilityLayer data={dailyRevenue} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}/>
                            <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-revenue)' }} activeDot={{ r: 8, style: { stroke: 'var(--color-revenue)' } }} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sales Mix</CardTitle>
                    <CardDescription>Breakdown of top-selling items.</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                   <ChartContainer config={pieChartConfig} className="w-full h-full">
                        <PieChart accessibilityLayer>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie
                                data={salesMix}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {salesMix.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={pieChartConfig[entry.name]?.color} className="stroke-background" />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Delivery Hotspots</CardTitle>
                    <CardDescription>Top 5 delivery locations by order volume.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {deliveryHotspots.length > 0 ? deliveryHotspots.map((spot, index) => (
                             <div key={index} className="flex items-center">
                                <MapPin className="h-5 w-5 text-primary mr-4" />
                                <div className="flex-1">
                                    <p className="font-medium truncate">{spot.address}</p>
                                    <p className="text-sm text-muted-foreground">{spot.count} orders</p>
                                </div>
                            </div>
                        )) : <p className="text-muted-foreground text-sm">No address data available for this period.</p>}
                    </div>
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Orders Per Day</CardTitle>
                    <CardDescription>
                        Volume of orders processed each day.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <ChartContainer config={barChartConfig} className="w-full h-full">
                        <BarChart accessibilityLayer data={ordersPerDay}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}/>
                            <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
              <h1 className="text-3xl font-headline mb-1">Business Intelligence</h1>
              <p className="text-muted-foreground">Analytics and insights on your sales performance.</p>
          </div>
          <DateRangePicker dateRange={dateRange} onDateChange={setDateRange} />
      </div>
      {renderCharts()}
    </div>
  );
}
