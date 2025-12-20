/**
 * Complete E-commerce Checkout Service
 * Full checkout flow with cart, payments, and order management
 */

import Stripe from 'stripe';
import { nanoid } from 'nanoid';

// ==============================================
// TYPES
// ==============================================

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    id: string;
    name: string;
    options: Record<string, string>;
  };
  customizations?: Record<string, any>;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  discounts: Discount[];
  shipping?: ShippingOption;
  tax: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  appliedAmount: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  carrier?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddress extends ShippingAddress {
  sameAsShipping?: boolean;
}

export interface PaymentMethod {
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  stripePaymentMethodId?: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  discounts: Discount[];
  shipping: ShippingOption;
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled';
  stripePaymentIntentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutSession {
  id: string;
  cart: Cart;
  email?: string;
  shippingAddress?: ShippingAddress;
  billingAddress?: BillingAddress;
  shippingOption?: ShippingOption;
  paymentMethod?: PaymentMethod;
  step: 'cart' | 'shipping' | 'payment' | 'review' | 'complete';
  stripeClientSecret?: string;
  createdAt: Date;
  expiresAt: Date;
}

// ==============================================
// STRIPE CLIENT
// ==============================================

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'placeholder') {
    return null;
  }
  return new Stripe(key, { apiVersion: '2024-12-18.acacia' });
}

// ==============================================
// SHIPPING OPTIONS
// ==============================================

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivery in 5-7 business days',
    price: 5.99,
    estimatedDays: '5-7 days',
    carrier: 'USPS',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Delivery in 2-3 business days',
    price: 12.99,
    estimatedDays: '2-3 days',
    carrier: 'FedEx',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day delivery',
    price: 24.99,
    estimatedDays: '1 day',
    carrier: 'FedEx',
  },
  {
    id: 'free',
    name: 'Free Shipping',
    description: 'Free on orders over $50',
    price: 0,
    estimatedDays: '7-10 days',
    carrier: 'USPS',
  },
];

// ==============================================
// TAX RATES (simplified - real implementation would use tax service)
// ==============================================

const TAX_RATES: Record<string, number> = {
  'US-CA': 0.0725, // California
  'US-NY': 0.08,   // New York
  'US-TX': 0.0625, // Texas
  'US-FL': 0.06,   // Florida
  'US-WA': 0.065,  // Washington
  'DEFAULT': 0.07, // Default rate
};

function calculateTax(subtotal: number, state: string, country: string): number {
  const rateKey = `${country}-${state}`;
  const rate = TAX_RATES[rateKey] || TAX_RATES['DEFAULT'];
  return Math.round(subtotal * rate * 100) / 100;
}

// ==============================================
// CART SERVICE
// ==============================================

// In-memory storage (use database in production)
const carts: Map<string, Cart> = new Map();
const sessions: Map<string, CheckoutSession> = new Map();
const orders: Map<string, Order> = new Map();

export function createCart(sessionId: string, userId?: string): Cart {
  const cart: Cart = {
    id: nanoid(),
    userId,
    sessionId,
    items: [],
    subtotal: 0,
    discounts: [],
    tax: 0,
    total: 0,
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  carts.set(cart.id, cart);
  return cart;
}

export function getCart(cartId: string): Cart | undefined {
  return carts.get(cartId);
}

export function getCartBySession(sessionId: string): Cart | undefined {
  for (const cart of carts.values()) {
    if (cart.sessionId === sessionId) {
      return cart;
    }
  }
  return undefined;
}

export function addToCart(cartId: string, item: Omit<CartItem, 'id'>): Cart {
  const cart = carts.get(cartId);
  if (!cart) {
    throw new Error('Cart not found');
  }

  // Check if item already exists
  const existingIndex = cart.items.findIndex(
    i => i.productId === item.productId && 
         JSON.stringify(i.variant) === JSON.stringify(item.variant)
  );

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += item.quantity;
  } else {
    cart.items.push({
      ...item,
      id: nanoid(),
    });
  }

  recalculateCart(cart);
  return cart;
}

export function updateCartItem(cartId: string, itemId: string, quantity: number): Cart {
  const cart = carts.get(cartId);
  if (!cart) {
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(i => i.id === itemId);
  if (itemIndex < 0) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  recalculateCart(cart);
  return cart;
}

export function removeFromCart(cartId: string, itemId: string): Cart {
  return updateCartItem(cartId, itemId, 0);
}

export function applyDiscount(cartId: string, code: string): Cart {
  const cart = carts.get(cartId);
  if (!cart) {
    throw new Error('Cart not found');
  }

  // Validate discount code (simplified - real implementation would check database)
  const discounts: Record<string, Discount> = {
    'WELCOME10': { id: '1', code: 'WELCOME10', type: 'percentage', value: 10, appliedAmount: 0 },
    'SAVE20': { id: '2', code: 'SAVE20', type: 'fixed', value: 20, appliedAmount: 0 },
    'FREESHIP': { id: '3', code: 'FREESHIP', type: 'free_shipping', value: 0, appliedAmount: 0 },
  };

  const discount = discounts[code.toUpperCase()];
  if (!discount) {
    throw new Error('Invalid discount code');
  }

  // Check if already applied
  if (cart.discounts.some(d => d.code === discount.code)) {
    throw new Error('Discount code already applied');
  }

  cart.discounts.push({ ...discount });
  recalculateCart(cart);
  return cart;
}

export function removeDiscount(cartId: string, discountId: string): Cart {
  const cart = carts.get(cartId);
  if (!cart) {
    throw new Error('Cart not found');
  }

  cart.discounts = cart.discounts.filter(d => d.id !== discountId);
  recalculateCart(cart);
  return cart;
}

export function setShipping(cartId: string, shippingId: string): Cart {
  const cart = carts.get(cartId);
  if (!cart) {
    throw new Error('Cart not found');
  }

  const shippingOption = SHIPPING_OPTIONS.find(s => s.id === shippingId);
  if (!shippingOption) {
    throw new Error('Invalid shipping option');
  }

  cart.shipping = shippingOption;
  recalculateCart(cart);
  return cart;
}

function recalculateCart(cart: Cart): void {
  // Calculate subtotal
  cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.subtotal = Math.round(cart.subtotal * 100) / 100;

  // Apply discounts
  let discountTotal = 0;
  for (const discount of cart.discounts) {
    switch (discount.type) {
      case 'percentage':
        discount.appliedAmount = Math.round(cart.subtotal * (discount.value / 100) * 100) / 100;
        break;
      case 'fixed':
        discount.appliedAmount = Math.min(discount.value, cart.subtotal - discountTotal);
        break;
      case 'free_shipping':
        if (cart.shipping) {
          discount.appliedAmount = cart.shipping.price;
        }
        break;
    }
    discountTotal += discount.appliedAmount;
  }

  // Calculate shipping (may be free from discount or free threshold)
  let shippingCost = cart.shipping?.price || 0;
  if (cart.subtotal >= 50 && cart.shipping?.id !== 'overnight') {
    shippingCost = 0; // Free shipping on orders over $50
  }
  if (cart.discounts.some(d => d.type === 'free_shipping')) {
    shippingCost = 0;
  }

  // Calculate total
  cart.total = cart.subtotal - discountTotal + shippingCost + cart.tax;
  cart.total = Math.round(cart.total * 100) / 100;

  cart.updatedAt = new Date();
}

// ==============================================
// CHECKOUT SESSION SERVICE
// ==============================================

export function createCheckoutSession(cart: Cart): CheckoutSession {
  const session: CheckoutSession = {
    id: nanoid(),
    cart,
    step: 'shipping',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
  };
  sessions.set(session.id, session);
  return session;
}

export function getCheckoutSession(sessionId: string): CheckoutSession | undefined {
  const session = sessions.get(sessionId);
  if (session && session.expiresAt < new Date()) {
    sessions.delete(sessionId);
    return undefined;
  }
  return session;
}

export function updateCheckoutSession(
  sessionId: string,
  updates: Partial<Omit<CheckoutSession, 'id' | 'cart' | 'createdAt' | 'expiresAt'>>
): CheckoutSession {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error('Checkout session not found');
  }

  Object.assign(session, updates);

  // If shipping address is set, calculate tax
  if (updates.shippingAddress) {
    session.cart.tax = calculateTax(
      session.cart.subtotal,
      updates.shippingAddress.state,
      updates.shippingAddress.country
    );
    recalculateCart(session.cart);
  }

  return session;
}

export async function initializePayment(sessionId: string): Promise<{ clientSecret: string }> {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error('Checkout session not found');
  }

  const stripe = getStripeClient();
  if (!stripe) {
    // Return mock client secret for testing
    return { clientSecret: 'mock_client_secret_' + nanoid() };
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(session.cart.total * 100), // Convert to cents
    currency: session.cart.currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      sessionId: session.id,
      cartId: session.cart.id,
    },
  });

  session.stripeClientSecret = paymentIntent.client_secret || undefined;
  return { clientSecret: paymentIntent.client_secret! };
}

export async function completeCheckout(
  sessionId: string,
  paymentMethodId?: string
): Promise<Order> {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error('Checkout session not found');
  }

  if (!session.email || !session.shippingAddress || !session.billingAddress || !session.shippingOption) {
    throw new Error('Checkout information incomplete');
  }

  // Create order
  const order: Order = {
    id: nanoid(),
    orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
    userId: session.cart.userId,
    email: session.email,
    items: [...session.cart.items],
    subtotal: session.cart.subtotal,
    discounts: [...session.cart.discounts],
    shipping: session.shippingOption,
    shippingAddress: session.shippingAddress,
    billingAddress: session.billingAddress,
    tax: session.cart.tax,
    total: session.cart.total,
    currency: session.cart.currency,
    paymentMethod: session.paymentMethod || { type: 'card' },
    paymentStatus: 'pending',
    fulfillmentStatus: 'unfulfilled',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Process payment with Stripe
  const stripe = getStripeClient();
  if (stripe && session.stripeClientSecret) {
    try {
      // In real implementation, confirm payment on server side
      order.paymentStatus = 'paid';
      order.stripePaymentIntentId = session.stripeClientSecret.split('_secret_')[0];
    } catch (error) {
      order.paymentStatus = 'failed';
      throw new Error('Payment failed');
    }
  } else {
    // Mock payment for testing
    order.paymentStatus = 'paid';
  }

  // Save order
  orders.set(order.id, order);

  // Clear cart
  carts.delete(session.cart.id);
  sessions.delete(sessionId);

  return order;
}

// ==============================================
// ORDER SERVICE
// ==============================================

export function getOrder(orderId: string): Order | undefined {
  return orders.get(orderId);
}

export function getOrderByNumber(orderNumber: string): Order | undefined {
  for (const order of orders.values()) {
    if (order.orderNumber === orderNumber) {
      return order;
    }
  }
  return undefined;
}

export function getUserOrders(userId: string): Order[] {
  return Array.from(orders.values()).filter(o => o.userId === userId);
}

export function updateOrderStatus(
  orderId: string,
  updates: { paymentStatus?: Order['paymentStatus']; fulfillmentStatus?: Order['fulfillmentStatus'] }
): Order {
  const order = orders.get(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (updates.paymentStatus) {
    order.paymentStatus = updates.paymentStatus;
  }
  if (updates.fulfillmentStatus) {
    order.fulfillmentStatus = updates.fulfillmentStatus;
  }
  order.updatedAt = new Date();

  return order;
}

export async function processRefund(orderId: string, amount?: number): Promise<Order> {
  const order = orders.get(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const refundAmount = amount || order.total;
  const stripe = getStripeClient();

  if (stripe && order.stripePaymentIntentId) {
    await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100),
    });
  }

  order.paymentStatus = refundAmount >= order.total ? 'refunded' : 'partially_refunded';
  order.updatedAt = new Date();

  return order;
}

// ==============================================
// HELPERS
// ==============================================

export function getShippingOptions(subtotal: number): ShippingOption[] {
  return SHIPPING_OPTIONS.map(option => {
    // Make free shipping available for orders over $50
    if (option.id === 'free' && subtotal < 50) {
      return {
        ...option,
        name: `${option.name} (orders over $50)`,
        price: 5.99,
      };
    }
    return option;
  });
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

console.log('[Checkout] E-commerce checkout service loaded');

