/**
 * E-Commerce API Routes
 * Handles product management, cart, checkout, and payment processing
 */

import type { Express } from 'express';
import {
  createCheckoutSession,
  createPaymentIntent,
  verifyPayment,
  calculateShipping,
  generateEcommerceCode,
  type Product,
  type CartItem,
} from '../services/ecommerce';
import {
  createOrder,
  getOrder,
  getUserOrders,
  getWebsiteOrders,
  updateOrderStatus,
  updateOrderWithPayment,
  getOrderStatistics,
} from '../services/orderManagementService';

export function registerEcommerceRoutes(app: Express) {
  // Get products for a website
  app.get('/api/ecommerce/products/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const fs = require('fs/promises');
      const path = require('path');
      
      // Load products from file system
      const productsPath = path.join(
        process.cwd(),
        'website_projects',
        websiteId,
        'products.json'
      );
      
      try {
        const productsData = await fs.readFile(productsPath, 'utf-8');
        const products: Product[] = JSON.parse(productsData);
        
        res.json({
          success: true,
          products,
        });
      } catch (fileError) {
        // File doesn't exist, return empty array
        res.json({
          success: true,
          products: [],
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      });
    }
  });

  // Create or update products
  app.post('/api/ecommerce/products/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const products: Product[] = req.body.products;
      
      if (!Array.isArray(products)) {
        return res.status(400).json({
          success: false,
          error: 'Products must be an array',
        });
      }
      
      const fs = require('fs/promises');
      const path = require('path');
      
      // Ensure directory exists
      const projectDir = path.join(process.cwd(), 'website_projects', websiteId);
      await fs.mkdir(projectDir, { recursive: true });
      
      // Save products to file system
      const productsPath = path.join(projectDir, 'products.json');
      await fs.writeFile(
        productsPath,
        JSON.stringify(products, null, 2),
        'utf-8'
      );
      
      res.json({
        success: true,
        message: 'Products saved successfully',
        count: products.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save products',
      });
    }
  });

  // Create checkout session
  app.post('/api/ecommerce/checkout/create-session', async (req, res) => {
    try {
      const { items, products, successUrl, cancelUrl, metadata } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Cart items are required',
        });
      }

      const session = await createCheckoutSession(
        items,
        products,
        successUrl || `${req.headers.origin}/checkout/success`,
        cancelUrl || `${req.headers.origin}/checkout/cancel`,
        metadata
      );

      res.json({
        success: true,
        sessionId: session.sessionId,
        url: session.url,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      });
    }
  });

  // Create payment intent (for custom payment flows)
  app.post('/api/ecommerce/payment/create-intent', async (req, res) => {
    try {
      const { amount, currency, metadata } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid amount is required',
        });
      }

      const paymentIntent = await createPaymentIntent(
        amount,
        currency || 'usd',
        metadata
      );

      res.json({
        success: true,
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      });
    }
  });

  // Verify payment
  app.post('/api/ecommerce/payment/verify', async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          error: 'Payment intent ID is required',
        });
      }

      const verified = await verifyPayment(paymentIntentId);

      res.json({
        success: verified,
        verified,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment',
      });
    }
  });

  // Calculate shipping
  app.post('/api/ecommerce/shipping/calculate', async (req, res) => {
    try {
      const { items, destination } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Cart items are required',
        });
      }

      if (!destination || !destination.country) {
        return res.status(400).json({
          success: false,
          error: 'Destination is required',
        });
      }

      const shippingCost = await calculateShipping(items, destination);

      res.json({
        success: true,
        shippingCost,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate shipping',
      });
    }
  });

  // Generate e-commerce code for website
  app.post('/api/ecommerce/generate-code', async (req, res) => {
    try {
      const { products, config } = req.body;
      
      if (!products || !Array.isArray(products)) {
        return res.status(400).json({
          success: false,
          error: 'Products array is required',
        });
      }

      const code = generateEcommerceCode(products, {
        currency: config?.currency || 'USD',
        showPrices: config?.showPrices !== false,
        enableCart: config?.enableCart !== false,
        layout: config?.layout || 'grid',
      });

      res.json({
        success: true,
        code,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate e-commerce code',
      });
    }
  });

  // Order Management Routes
  
  // Get order by ID
  app.get('/api/ecommerce/orders/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }
      
      res.json({
        success: true,
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch order',
      });
    }
  });

  // Get orders for a website
  app.get('/api/ecommerce/orders/website/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const orders = await getWebsiteOrders(websiteId);
      
      res.json({
        success: true,
        orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      });
    }
  });

  // Get orders for current user
  app.get('/api/ecommerce/orders/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const orders = await getUserOrders(userId);
      
      res.json({
        success: true,
        orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      });
    }
  });

  // Create order
  app.post('/api/ecommerce/orders', async (req, res) => {
    try {
      const { userId, websiteId, items, total, currency, paymentIntentId, shippingAddress } = req.body;
      
      if (!userId || !websiteId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, websiteId, items',
        });
      }

      const order = await createOrder(
        userId,
        websiteId,
        items,
        total || 0,
        currency || 'usd',
        paymentIntentId,
        shippingAddress
      );

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      });
    }
  });

  // Update order status
  app.patch('/api/ecommerce/orders/:orderId/status', async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required',
        });
      }

      const order = await updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order',
      });
    }
  });

  // Update order with payment
  app.patch('/api/ecommerce/orders/:orderId/payment', async (req, res) => {
    try {
      const { orderId } = req.params;
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          error: 'Payment intent ID is required',
        });
      }

      const order = await updateOrderWithPayment(orderId, paymentIntentId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order payment',
      });
    }
  });

  // Get order statistics
  app.get('/api/ecommerce/orders/website/:websiteId/statistics', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const stats = await getOrderStatistics(websiteId);
      
      res.json({
        success: true,
        statistics: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      });
    }
  });
}

