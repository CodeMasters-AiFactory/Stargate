/**
 * Payment Gateway Selector Component
 * Phase 1.3: Allows users to select and configure payment gateways
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Wallet,
  Square,
  Apple,
  Chrome,
  CheckCircle2,
  Settings,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  supportedCurrencies: string[];
  requiresFrontend?: boolean;
}

export interface PaymentGatewayConfig {
  gateway: string;
  enabled: boolean;
  credentials: Record<string, string>;
  testMode: boolean;
}

interface PaymentGatewaySelectorProps {
  websiteId: string;
  onConfigChange?: (configs: PaymentGatewayConfig[]) => void;
}

const GATEWAY_ICONS: Record<string, React.ReactNode> = {
  'stripe': <CreditCard className="w-5 h-5" />,
  'paypal': <Wallet className="w-5 h-5" />,
  'square': <Square className="w-5 h-5" />,
  'apple-pay': <Apple className="w-5 h-5" />,
  'google-pay': <Chrome className="w-5 h-5" />,
};

export function PaymentGatewaySelector({ websiteId, onConfigChange }: PaymentGatewaySelectorProps) {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [configs, setConfigs] = useState<Record<string, PaymentGatewayConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadGateways();
    loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteId]);

  const loadGateways = async () => {
    try {
      const response = await fetch('/api/payment-gateways');
      const data = await response.json();
      if (data.success) {
        setGateways(data.gateways);
      }
    } catch (error) {
      console.error('Failed to load payment gateways:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment gateways',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConfigs = async () => {
    try {
      const configMap: Record<string, PaymentGatewayConfig> = {};

      // Load config for each gateway
      const gatewayIds = ['stripe', 'paypal', 'square', 'apple-pay', 'google-pay'];
      for (const gatewayId of gatewayIds) {
        try {
          const response = await fetch(`/api/payment-gateways/${gatewayId}/config?websiteId=${websiteId}`);
          const data = await response.json();
          if (data.success && data.config) {
            configMap[gatewayId] = data.config;
          } else {
            // Default config
            configMap[gatewayId] = {
              gateway: gatewayId,
              enabled: gatewayId === 'stripe', // Enable Stripe by default
              credentials: {},
              testMode: process.env.NODE_ENV !== 'production',
            };
          }
        } catch (error) {
          console.error(`Failed to load config for ${gatewayId}:`, error);
          // Use default config
          configMap[gatewayId] = {
            gateway: gatewayId,
            enabled: gatewayId === 'stripe',
            credentials: {},
            testMode: true,
          };
        }
      }

      setConfigs(configMap);
      if (onConfigChange) {
        onConfigChange(Object.values(configMap));
      }
    } catch (error) {
      console.error('Failed to load gateway configs:', error);
    }
  };

  const updateConfig = (gatewayId: string, updates: Partial<PaymentGatewayConfig>) => {
    const currentConfig = configs[gatewayId] || {
      gateway: gatewayId,
      enabled: false,
      credentials: {},
      testMode: true,
    };

    const newConfig: PaymentGatewayConfig = {
      ...currentConfig,
      ...updates,
    };

    setConfigs(prev => ({
      ...prev,
      [gatewayId]: newConfig,
    }));

    // Notify parent
    if (onConfigChange) {
      const allConfigs = Object.values({ ...configs, [gatewayId]: newConfig });
      onConfigChange(allConfigs);
    }
  };

  const updateCredential = (gatewayId: string, key: string, value: string) => {
    const currentConfig = configs[gatewayId] || {
      gateway: gatewayId,
      enabled: false,
      credentials: {},
      testMode: true,
    };

    updateConfig(gatewayId, {
      credentials: {
        ...currentConfig.credentials,
        [key]: value,
      },
    });
  };

  const saveConfig = async (gatewayId: string) => {
    setSaving(true);
    try {
      const config = configs[gatewayId];
      if (!config) return;

      const response = await fetch(`/api/payment-gateways/${gatewayId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          config,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `${configs[gatewayId]?.gateway || gatewayId} configuration saved`,
        });
      } else {
        throw new Error(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save gateway config:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getGatewayCredentials = (gatewayId: string): Array<{ key: string; label: string; type: string }> => {
    switch (gatewayId) {
      case 'stripe':
        return [
          { key: 'secretKey', label: 'Secret Key', type: 'password' },
          { key: 'publishableKey', label: 'Publishable Key', type: 'text' },
        ];
      case 'paypal':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text' },
          { key: 'clientSecret', label: 'Client Secret', type: 'password' },
        ];
      case 'square':
        return [
          { key: 'accessToken', label: 'Access Token', type: 'password' },
          { key: 'locationId', label: 'Location ID', type: 'text' },
        ];
      case 'apple-pay':
      case 'google-pay':
        return []; // No credentials needed for Payment Request API
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Gateways</h3>
        <p className="text-sm text-muted-foreground">
          Configure payment methods for your e-commerce website. Enable multiple gateways to give customers more payment options.
        </p>
      </div>

      <Tabs defaultValue="stripe" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {gateways.map(gateway => (
            <TabsTrigger key={gateway.id} value={gateway.id} className="flex flex-col gap-1 h-auto py-2">
              <div className="flex items-center gap-2">
                {GATEWAY_ICONS[gateway.id] || <CreditCard className="w-4 h-4" />}
                <span className="text-xs">{gateway.name}</span>
              </div>
              {configs[gateway.id]?.enabled && (
                <Badge variant="outline" className="text-xs">Enabled</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {gateways.map(gateway => {
          const config = configs[gateway.id] || {
            gateway: gateway.id,
            enabled: false,
            credentials: {},
            testMode: true,
          };
          const credentials = getGatewayCredentials(gateway.id);

          return (
            <TabsContent key={gateway.id} value={gateway.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {GATEWAY_ICONS[gateway.id] || <CreditCard className="w-5 h-5" />}
                        {gateway.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {gateway.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(checked) => updateConfig(gateway.id, { enabled: checked })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Test Mode Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor={`test-mode-${gateway.id}`} className="text-sm font-medium">
                        Test Mode
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use test credentials for development and testing
                      </p>
                    </div>
                    <Switch
                      id={`test-mode-${gateway.id}`}
                      checked={config.testMode}
                      onCheckedChange={(checked) => updateConfig(gateway.id, { testMode: checked })}
                    />
                  </div>

                  {/* Credentials */}
                  {credentials.length > 0 && config.enabled && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <h4 className="text-sm font-semibold">Credentials</h4>
                      </div>
                      {credentials.map(cred => (
                        <div key={cred.key} className="space-y-2">
                          <Label htmlFor={`${gateway.id}-${cred.key}`}>{cred.label}</Label>
                          <Input
                            id={`${gateway.id}-${cred.key}`}
                            type={cred.type}
                            value={config.credentials[cred.key] || ''}
                            onChange={(e) => updateCredential(gateway.id, cred.key, e.target.value)}
                            placeholder={`Enter ${cred.label.toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Supported Currencies */}
                  {gateway.supportedCurrencies && gateway.supportedCurrencies.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Supported Currencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {gateway.supportedCurrencies.map(currency => (
                          <Badge key={currency} variant="outline">
                            {currency.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info for Payment Request API gateways */}
                  {(gateway.id === 'apple-pay' || gateway.id === 'google-pay') && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>{gateway.name}</strong> uses the Payment Request API and works directly in supported browsers.
                        No additional credentials are required. Make sure your website is served over HTTPS.
                      </p>
                    </div>
                  )}

                  {/* Save Button */}
                  <Button
                    onClick={() => saveConfig(gateway.id)}
                    disabled={saving || !config.enabled}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

