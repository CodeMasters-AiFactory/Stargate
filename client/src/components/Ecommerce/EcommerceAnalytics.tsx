/**
 * E-Commerce Analytics Dashboard
 * Sales dashboard, product metrics, and conversion tracking
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export interface EcommerceAnalytics {
  websiteId: string;
  period: {
    start: Date;
    end: Date;
  };
  sales: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueChange: number; // Percentage change
    ordersChange: number; // Percentage change
  };
  products: {
    totalProducts: number;
    topSelling: Array<{
      productId: string;
      name: string;
      sales: number;
      revenue: number;
      orders: number;
    }>;
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerLifetimeValue: number;
  };
  conversion: {
    conversionRate: number;
    cartAbandonmentRate: number;
    checkoutCompletionRate: number;
  };
  traffic: {
    totalVisits: number;
    uniqueVisitors: number;
    pageViews: number;
  };
}

interface EcommerceAnalyticsProps {
  analytics: EcommerceAnalytics;
  className?: string;
}

export function EcommerceAnalytics({ analytics, className = '' }: EcommerceAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">E-Commerce Analytics</h2>
        <p className="text-sm text-muted-foreground">
          {analytics.period.start.toLocaleDateString()} - {analytics.period.end.toLocaleDateString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.sales.totalRevenue)}</div>
            <div className={`flex items-center text-xs mt-1 ${
              analytics.sales.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.sales.revenueChange >= 0 ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {formatPercentage(analytics.sales.revenueChange)} from last period
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sales.totalOrders}</div>
            <div className={`flex items-center text-xs mt-1 ${
              analytics.sales.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.sales.ordersChange >= 0 ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {formatPercentage(analytics.sales.ordersChange)} from last period
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.sales.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversion.conversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visitors to customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.products.topSelling.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sales data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.products.topSelling.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      #{index + 1}
                    </Badge>
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.orders} {product.orders === 1 ? 'order' : 'orders'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(product.revenue)}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.sales} {product.sales === 1 ? 'unit' : 'units'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.customers.totalCustomers}</div>
            <div className="text-xs text-muted-foreground mt-2">
              {analytics.customers.newCustomers} new, {analytics.customers.returningCustomers} returning
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(analytics.customers.customerLifetimeValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average per customer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cart Abandonment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.conversion.cartAbandonmentRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Abandoned carts</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Visits</div>
              <div className="text-2xl font-bold">{analytics.traffic.totalVisits.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Unique Visitors</div>
              <div className="text-2xl font-bold">{analytics.traffic.uniqueVisitors.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Page Views</div>
              <div className="text-2xl font-bold">{analytics.traffic.pageViews.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

