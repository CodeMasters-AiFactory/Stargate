/**
 * Inventory Management API Routes
 * 
 * Endpoints for managing e-commerce inventory:
 * - Product CRUD
 * - Stock adjustments
 * - Low stock alerts
 * - Inventory valuation
 * - Reorder suggestions
 */

import type { Express } from 'express';
import {
  upsertProduct,
  getProduct,
  getAllProducts,
  adjustInventory,
  reserveInventory,
  fulfillOrder,
  getLowStockAlerts,
  getInventoryValuation,
  getReorderSuggestions,
  getMovementHistory,
  getInventoryStats,
  type Product,
} from '../services/inventoryManagement';

export function registerInventoryRoutes(app: Express) {
  // Get inventory statistics
  app.get('/api/inventory/stats', async (req, res) => {
    try {
      const stats = getInventoryStats();
      res.json({ success: true, stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get inventory stats',
      });
    }
  });

  // Get all products
  app.get('/api/inventory/products', async (req, res) => {
    try {
      const { status, category, warehouse, lowStock } = req.query;
      
      const products = getAllProducts({
        status: status as Product['status'],
        category: category as string,
        warehouse: warehouse as string,
        lowStock: lowStock === 'true',
      });
      
      res.json({
        success: true,
        count: products.length,
        products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get products',
      });
    }
  });

  // Get single product
  app.get('/api/inventory/products/:id', async (req, res) => {
    try {
      const product = getProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }
      
      res.json({ success: true, product });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get product',
      });
    }
  });

  // Create or update product
  app.post('/api/inventory/products', async (req, res) => {
    try {
      const productData = req.body;
      
      if (!productData.id || !productData.sku || !productData.name) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: id, sku, name',
        });
      }
      
      const product = upsertProduct(productData);
      res.json({ success: true, product });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save product',
      });
    }
  });

  // Adjust inventory
  app.post('/api/inventory/adjust', async (req, res) => {
    try {
      const { productId, quantity, reason, type, reference, variantId } = req.body;
      
      if (!productId || quantity === undefined || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: productId, quantity, reason',
        });
      }
      
      const movement = adjustInventory(productId, quantity, reason, type, reference, variantId);
      
      if (!movement) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }
      
      res.json({ success: true, movement });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to adjust inventory',
      });
    }
  });

  // Reserve inventory for order
  app.post('/api/inventory/reserve', async (req, res) => {
    try {
      const { productId, quantity, orderId, variantId } = req.body;
      
      if (!productId || !quantity || !orderId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: productId, quantity, orderId',
        });
      }
      
      const success = reserveInventory(productId, quantity, orderId, variantId);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient inventory to reserve',
        });
      }
      
      res.json({ success: true, message: 'Inventory reserved successfully' });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reserve inventory',
      });
    }
  });

  // Fulfill order
  app.post('/api/inventory/fulfill', async (req, res) => {
    try {
      const { productId, quantity, orderId, variantId } = req.body;
      
      if (!productId || !quantity || !orderId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: productId, quantity, orderId',
        });
      }
      
      const success = fulfillOrder(productId, quantity, orderId, variantId);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Failed to fulfill order',
        });
      }
      
      res.json({ success: true, message: 'Order fulfilled successfully' });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fulfill order',
      });
    }
  });

  // Get low stock alerts
  app.get('/api/inventory/alerts', async (req, res) => {
    try {
      const alerts = getLowStockAlerts();
      res.json({
        success: true,
        count: alerts.length,
        alerts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get alerts',
      });
    }
  });

  // Get inventory valuation
  app.get('/api/inventory/valuation', async (req, res) => {
    try {
      const valuation = getInventoryValuation();
      res.json({ success: true, valuation });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get valuation',
      });
    }
  });

  // Get reorder suggestions
  app.get('/api/inventory/reorder-suggestions', async (req, res) => {
    try {
      const suggestions = getReorderSuggestions();
      res.json({
        success: true,
        count: suggestions.length,
        suggestions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get suggestions',
      });
    }
  });

  // Get movement history
  app.get('/api/inventory/movements', async (req, res) => {
    try {
      const { productId, type, startDate, endDate, limit } = req.query;
      
      const movements = getMovementHistory({
        productId: productId as string,
        type: type as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      
      res.json({
        success: true,
        count: movements.length,
        movements,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get movements',
      });
    }
  });
}

