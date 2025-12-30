/**
 * Unified Payment Gateway Service
 * Supports multiple payment gateways: Stripe, PayPal, Square, Apple Pay, Google Pay
 * Phase 1.3: Payment Gateway Integration
 */

export type PaymentGateway = 'stripe' | 'paypal' | 'square' | 'apple-pay' | 'google-pay';

export interface PaymentGatewayConfig {
  gateway: PaymentGateway;
  enabled: boolean;
  credentials: Record<string, string>;
  testMode: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  metadata?: Record<string, string>;
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  gateway: PaymentGateway;
  transactionId?: string;
  paymentUrl?: string;
  clientSecret?: string;
  error?: string;
}

/**
 * Create payment using specified gateway
 */
export async function createPayment(
  gateway: PaymentGateway,
  request: PaymentRequest,
  config: PaymentGatewayConfig
): Promise<PaymentResponse> {
  switch (gateway) {
    case 'stripe':
      return createStripePayment(request, config);
    case 'paypal':
      return createPayPalPayment(request, config);
    case 'square':
      return createSquarePayment(request, config);
    case 'apple-pay':
      return createApplePayPayment(request, config);
    case 'google-pay':
      return createGooglePayPayment(request, config);
    default:
      return {
        success: false,
        gateway,
        error: `Unsupported payment gateway: ${gateway}`,
      };
  }
}

/**
 * Stripe Payment Gateway
 */
async function createStripePayment(
  request: PaymentRequest,
  config: PaymentGatewayConfig
): Promise<PaymentResponse> {
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(config.credentials.secretKey || '', {
      apiVersion: '2024-12-18.acacia',
    });

    if (request.paymentUrl) {
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: request.items.map(item => ({
          price_data: {
            currency: request.currency,
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: request.successUrl || '',
        cancel_url: request.cancelUrl || '',
        metadata: request.metadata || {},
      });

      return {
        success: true,
        gateway: 'stripe',
        transactionId: session.id,
        paymentUrl: session.url || '',
      };
    } else {
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100),
        currency: request.currency,
        metadata: request.metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        gateway: 'stripe',
        transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || '',
      };
    }
  } catch (error) {
    return {
      success: false,
      gateway: 'stripe',
      error: error instanceof Error ? error.message : 'Stripe payment failed',
    };
  }
}

/**
 * PayPal Payment Gateway
 */
async function createPayPalPayment(
  request: PaymentRequest,
  config: PaymentGatewayConfig
): Promise<PaymentResponse> {
  try {
    const clientId = config.credentials.clientId;
    const clientSecret = config.credentials.clientSecret;
    const baseUrl = config.testMode
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    // Get access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json() as { access_token?: string };
    const accessToken = authData.access_token;

    if (!accessToken) {
      return {
        success: false,
        gateway: 'paypal',
        error: 'Failed to authenticate with PayPal',
      };
    }

    // Create PayPal order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: request.currency.toUpperCase(),
              value: request.amount.toFixed(2),
            },
            items: request.items.map(item => ({
              name: item.name,
              quantity: item.quantity.toString(),
              unit_amount: {
                currency_code: request.currency.toUpperCase(),
                value: item.price.toFixed(2),
              },
            })),
          },
        ],
        application_context: {
          return_url: request.successUrl || '',
          cancel_url: request.cancelUrl || '',
        },
      }),
    });

    const orderData = await orderResponse.json() as {
      id?: string;
      message?: string;
      links?: Array<{ rel: string; href: string }>;
    };

    if (orderData.id) {
      // Get approval URL
      const approvalLink = orderData.links?.find((link) => link.rel === 'approve');
      
      return {
        success: true,
        gateway: 'paypal',
        transactionId: orderData.id,
        paymentUrl: approvalLink?.href || '',
      };
    } else {
      return {
        success: false,
        gateway: 'paypal',
        error: orderData.message || 'Failed to create PayPal order',
      };
    }
  } catch (error) {
    return {
      success: false,
      gateway: 'paypal',
      error: error instanceof Error ? error.message : 'PayPal payment failed',
    };
  }
}

/**
 * Square Payment Gateway
 */
async function createSquarePayment(
  request: PaymentRequest,
  config: PaymentGatewayConfig
): Promise<PaymentResponse> {
  try {
    const accessToken = config.credentials.accessToken;
    const locationId = config.credentials.locationId;
    const baseUrl = config.testMode
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';

    // Create payment link
    const paymentLinkResponse = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        idempotency_key: `${Date.now()}-${Math.random()}`,
        order: {
          location_id: locationId,
          line_items: request.items.map(item => ({
            name: item.name,
            quantity: item.quantity.toString(),
            base_price_money: {
              amount: Math.round(item.price * 100),
              currency: request.currency.toUpperCase(),
            },
          })),
        },
        checkout_options: {
          redirect_url: request.successUrl || '',
        },
      }),
    });

    const paymentLinkData = await paymentLinkResponse.json() as {
      payment_link?: {
        id?: string;
        url?: string;
      };
      errors?: Array<{ detail?: string }>;
    };

    if (paymentLinkData.payment_link?.id) {
      return {
        success: true,
        gateway: 'square',
        transactionId: paymentLinkData.payment_link.id,
        paymentUrl: paymentLinkData.payment_link.url || '',
      };
    } else {
      return {
        success: false,
        gateway: 'square',
        error: paymentLinkData.errors?.[0]?.detail || 'Failed to create Square payment',
      };
    }
  } catch (error) {
    return {
      success: false,
      gateway: 'square',
      error: error instanceof Error ? error.message : 'Square payment failed',
    };
  }
}

/**
 * Apple Pay Payment Gateway
 * Note: Apple Pay requires frontend implementation with Payment Request API
 */
async function createApplePayPayment(
  _request: PaymentRequest,
  _config: PaymentGatewayConfig
): Promise<PaymentResponse> {
  // Apple Pay uses the Payment Request API on the frontend
  // This function returns configuration for frontend implementation
  return {
    success: true,
    gateway: 'apple-pay',
    transactionId: `apple-pay-${Date.now()}`,
    // Frontend will handle the actual payment using Payment Request API
    paymentUrl: undefined,
  };
}

/**
 * Google Pay Payment Gateway
 * Note: Google Pay requires frontend implementation with Payment Request API
 */
async function createGooglePayPayment(
  _request: PaymentRequest,
  _config: PaymentGatewayConfig
): Promise<PaymentResponse> {
  // Google Pay uses the Payment Request API on the frontend
  // This function returns configuration for frontend implementation
  return {
    success: true,
    gateway: 'google-pay',
    transactionId: `google-pay-${Date.now()}`,
    // Frontend will handle the actual payment using Payment Request API
    paymentUrl: undefined,
  };
}

/**
 * Verify payment status
 */
export async function verifyPayment(
  gateway: PaymentGateway,
  transactionId: string,
  config: PaymentGatewayConfig
): Promise<{ success: boolean; status: string; error?: string }> {
  try {
    switch (gateway) {
      case 'stripe': {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(config.credentials.secretKey || '', {
          apiVersion: '2024-12-18.acacia',
        });
        
        // Try to retrieve as payment intent first
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
          return {
            success: paymentIntent.status === 'succeeded',
            status: paymentIntent.status,
          };
        } catch {
          // Try checkout session
          const session = await stripe.checkout.sessions.retrieve(transactionId);
          return {
            success: session.payment_status === 'paid',
            status: session.payment_status,
          };
        }
      }
      case 'paypal': {
        const baseUrl = config.testMode
          ? 'https://api.sandbox.paypal.com'
          : 'https://api.paypal.com';
        const clientId = config.credentials.clientId;
        const clientSecret = config.credentials.clientSecret;

        // Get access token
        const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
          body: 'grant_type=client_credentials',
        });

        const authData = await authResponse.json() as { access_token?: string };
        const accessToken = authData.access_token;

        const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const orderData = await orderResponse.json() as { status?: string };
        return {
          success: orderData.status === 'COMPLETED',
          status: orderData.status || 'unknown',
        };
      }
      case 'square': {
        const accessToken = config.credentials.accessToken;
        const baseUrl = config.testMode
          ? 'https://connect.squareupsandbox.com'
          : 'https://connect.squareup.com';

        const response = await fetch(`${baseUrl}/v2/payments/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Square-Version': '2024-01-18',
          },
        });

        const data = await response.json() as {
          payment?: {
            status?: string;
          };
        };
        return {
          success: data.payment?.status === 'COMPLETED',
          status: data.payment?.status || 'unknown',
        };
      }
      default:
        return {
          success: false,
          status: 'unknown',
          error: 'Payment verification not implemented for this gateway',
        };
    }
  } catch (error) {
    return {
      success: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Payment verification failed',
    };
  }
}

/**
 * Get list of available payment gateways
 */
export function getAvailableGateways(): PaymentGateway[] {
  return ['stripe', 'paypal', 'square', 'apple-pay', 'google-pay'];
}

/**
 * Get gateway display information
 */
export function getGatewayInfo(gateway: PaymentGateway): {
  name: string;
  description: string;
  supportedCurrencies: string[];
  requiresFrontend?: boolean;
} {
  const info: Record<PaymentGateway, {
    name: string;
    description: string;
    supportedCurrencies: string[];
    requiresFrontend?: boolean;
  }> = {
    'stripe': {
      name: 'Stripe',
      description: 'Accept credit cards and other payment methods worldwide',
      supportedCurrencies: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'cny'],
    },
    'paypal': {
      name: 'PayPal',
      description: 'Accept PayPal payments from customers worldwide',
      supportedCurrencies: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'],
    },
    'square': {
      name: 'Square',
      description: 'Accept payments with Square payment processing',
      supportedCurrencies: ['usd', 'cad', 'gbp', 'aud', 'jpy'],
    },
    'apple-pay': {
      name: 'Apple Pay',
      description: 'Accept payments via Apple Pay (requires Payment Request API)',
      supportedCurrencies: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'],
      requiresFrontend: true,
    },
    'google-pay': {
      name: 'Google Pay',
      description: 'Accept payments via Google Pay (requires Payment Request API)',
      supportedCurrencies: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy'],
      requiresFrontend: true,
    },
  };

  return info[gateway];
}

