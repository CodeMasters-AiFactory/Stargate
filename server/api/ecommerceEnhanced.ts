/**
 * Enhanced E-Commerce API Routes
 * Adds tax calculation, discount codes, and analytics endpoints
 */

import type { Express, Request, Response } from 'express';
import {
  calculateTax,
  isTaxRequired,
  type TaxCalculation,
} from '../services/taxCalculator';
import {
  applyDiscountCode,
  createDiscountCode,
  getDiscountCode,
  listDiscountCodes,
  updateDiscountCode,
  deleteDiscountCode,
  type DiscountCode,
  type DiscountApplication,
} from '../services/discountCodeService';

export function registerEnhancedEcommerceRoutes(app: Express) {
  // Tax Calculation Endpoint
  app.post('/api/ecommerce/tax/calculate', async (req: Request, res: Response): Promise<void> => {
    try {
      const { subtotal, shippingAddress, shippingCost = 0 } = req.body;

      if (!subtotal || !shippingAddress || !shippingAddress.country) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: subtotal, shippingAddress.country',
        });
        return;
      }

      const taxCalculation = calculateTax(subtotal, shippingAddress, shippingCost);

      res.json({
        success: true,
        calculation: taxCalculation,
        taxRequired: isTaxRequired(shippingAddress.country),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate tax',
      });
    }
  });

  // Discount Code Endpoints
  app.post('/api/ecommerce/discount/apply', async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, subtotal, shippingCost, items, isFirstTimeCustomer = false } = req.body;

      if (!code || !subtotal || !items) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: code, subtotal, items',
        });
        return;
      }

      const discount = applyDiscountCode(
        code,
        subtotal,
        shippingCost || 0,
        items,
        isFirstTimeCustomer
      );

      if (!discount) {
        res.status(404).json({
          success: false,
          error: 'Invalid or expired discount code',
        });
        return;
      }

      res.json({
        success: true,
        discount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply discount code',
      });
    }
  });

  // Create Discount Code (Admin)
  app.post('/api/ecommerce/discount/create', async (req: Request, res: Response): Promise<void> => {
    try {
      const discountData = req.body;

      // Validate required fields
      if (!discountData.code || !discountData.type || !discountData.value) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: code, type, value',
        });
        return;
      }

      const discount = createDiscountCode({
        code: discountData.code,
        type: discountData.type,
        value: discountData.value,
        minPurchase: discountData.minPurchase,
        maxDiscount: discountData.maxDiscount,
        validFrom: new Date(discountData.validFrom || Date.now()),
        validUntil: new Date(discountData.validUntil || Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        usageLimit: discountData.usageLimit,
        firstTimeOnly: discountData.firstTimeOnly || false,
        categories: discountData.categories,
        products: discountData.products,
        active: discountData.active !== false,
      });

      res.json({
        success: true,
        discount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create discount code',
      });
    }
  });

  // Get Discount Code
  app.get('/api/ecommerce/discount/:code', async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const discount = getDiscountCode(code);

      if (!discount) {
        res.status(404).json({
          success: false,
          error: 'Discount code not found',
        });
        return;
      }

      res.json({
        success: true,
        discount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get discount code',
      });
    }
  });

  // List Discount Codes
  app.get('/api/ecommerce/discounts', async (_req: Request, res: Response): Promise<void> => {
    try {
      const discounts = listDiscountCodes();
      
      res.json({
        success: true,
        discounts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list discount codes',
      });
    }
  });

  // Update Discount Code
  app.patch('/api/ecommerce/discount/:code', async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const updates = req.body;

      const discount = updateDiscountCode(code, updates);

      if (!discount) {
        res.status(404).json({
          success: false,
          error: 'Discount code not found',
        });
        return;
      }

      res.json({
        success: true,
        discount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update discount code',
      });
    }
  });

  // Delete Discount Code
  app.delete('/api/ecommerce/discount/:code', async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.params;
      const deleted = deleteDiscountCode(code);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Discount code not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Discount code deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete discount code',
      });
    }
  });
}

