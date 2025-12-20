/**
 * Order Management Service
 * Handles order creation, tracking, and management
 */

import type { Order, CartItem, Product } from './ecommerce';

// In-memory order storage (TODO: Move to database)
const orders = new Map<string, Order>();

/**
 * Create a new order
 */
export async function createOrder(
  userId: string,
  websiteId: string,
  items: CartItem[],
  total: number,
  currency: string = 'usd',
  paymentIntentId?: string,
  shippingAddress?: Order['shippingAddress']
): Promise<Order> {
  const order: Order = {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    websiteId,
    items,
    total,
    currency,
    status: paymentIntentId ? 'paid' : 'pending',
    paymentIntentId,
    shippingAddress,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  orders.set(order.id, order);
  return order;
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  return orders.get(orderId) || null;
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  return Array.from(orders.values()).filter(order => order.userId === userId);
}

/**
 * Get all orders for a website
 */
export async function getWebsiteOrders(websiteId: string): Promise<Order[]> {
  return Array.from(orders.values()).filter(order => order.websiteId === websiteId);
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<Order | null> {
  const order = orders.get(orderId);
  if (!order) {
    return null;
  }

  const updatedOrder: Order = {
    ...order,
    status,
    updatedAt: new Date(),
  };

  orders.set(orderId, updatedOrder);
  return updatedOrder;
}

/**
 * Update order with payment information
 */
export async function updateOrderWithPayment(
  orderId: string,
  paymentIntentId: string
): Promise<Order | null> {
  const order = orders.get(orderId);
  if (!order) {
    return null;
  }

  const updatedOrder: Order = {
    ...order,
    paymentIntentId,
    status: 'paid',
    updatedAt: new Date(),
  };

  orders.set(orderId, updatedOrder);
  return updatedOrder;
}

/**
 * Update order with shipping information
 */
export async function updateOrderShipping(
  orderId: string,
  shippingAddress: Order['shippingAddress']
): Promise<Order | null> {
  const order = orders.get(orderId);
  if (!order) {
    return null;
  }

  const updatedOrder: Order = {
    ...order,
    shippingAddress,
    updatedAt: new Date(),
  };

  orders.set(orderId, updatedOrder);
  return updatedOrder;
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string): Promise<Order | null> {
  return updateOrderStatus(orderId, 'cancelled');
}

/**
 * Get order statistics
 */
export async function getOrderStatistics(websiteId: string): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  paidOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}> {
  const websiteOrders = await getWebsiteOrders(websiteId);

  return {
    totalOrders: websiteOrders.length,
    totalRevenue: websiteOrders
      .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0),
    pendingOrders: websiteOrders.filter(o => o.status === 'pending').length,
    paidOrders: websiteOrders.filter(o => o.status === 'paid').length,
    shippedOrders: websiteOrders.filter(o => o.status === 'shipped').length,
    deliveredOrders: websiteOrders.filter(o => o.status === 'delivered').length,
    cancelledOrders: websiteOrders.filter(o => o.status === 'cancelled').length,
  };
}

