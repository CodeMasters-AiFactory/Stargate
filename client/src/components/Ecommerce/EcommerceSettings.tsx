/**
 * E-Commerce Settings Component
 * Phase 1.3: Complete e-commerce configuration including payment gateways
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentGatewaySelector } from './PaymentGatewaySelector';
import { ProductCatalog } from './ProductCatalog';
import { OrderManagement } from './OrderManagement';
import { EcommerceAnalytics, type EcommerceAnalytics as EcommerceAnalyticsType } from './EcommerceAnalytics';
import { Settings, ShoppingCart as ShoppingCartIcon, CreditCard, Package, BarChart3 } from 'lucide-react';

interface EcommerceSettingsProps {
  websiteId: string;
  onSettingsChange?: (settings: any) => void;
}

// Wrapper component for EcommerceAnalytics that fetches data
function EcommerceAnalyticsWrapper({ websiteId }: { websiteId: string }) {
  // Mock analytics data - in production, fetch from API
  const mockAnalytics: EcommerceAnalyticsType = {
    websiteId,
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    },
    sales: {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      revenueChange: 0,
      ordersChange: 0,
    },
    products: {
      totalProducts: 0,
      topSelling: [],
    },
    customers: {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      customerLifetimeValue: 0,
    },
    conversion: {
      conversionRate: 0,
      cartAbandonmentRate: 0,
      checkoutCompletionRate: 0,
    },
    traffic: {
      totalVisits: 0,
      uniqueVisitors: 0,
      pageViews: 0,
    },
  };

  return <EcommerceAnalytics analytics={mockAnalytics} />;
}

export function EcommerceSettings({ websiteId, onSettingsChange }: EcommerceSettingsProps) {
  const [activeTab, setActiveTab] = useState('payment');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">E-Commerce Settings</h2>
        <p className="text-muted-foreground">
          Configure payment gateways, products, orders, and analytics for your online store
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCartIcon className="w-4 h-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="mt-6">
          <PaymentGatewaySelector
            websiteId={websiteId}
            onConfigChange={(configs) => {
              if (onSettingsChange) {
                onSettingsChange({ paymentGateways: configs });
              }
            }}
          />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                Manage your products, inventory, and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductCatalog products={[]} onProductsChange={() => {}} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrderManagement websiteId={websiteId} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <EcommerceAnalyticsWrapper websiteId={websiteId} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>E-Commerce Settings</CardTitle>
              <CardDescription>
                General e-commerce configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>USD - US Dollar</option>
                  <option>EUR - Euro</option>
                  <option>GBP - British Pound</option>
                  <option>CAD - Canadian Dollar</option>
                  <option>AUD - Australian Dollar</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax Settings</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Calculate taxes automatically</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Show prices including tax</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

