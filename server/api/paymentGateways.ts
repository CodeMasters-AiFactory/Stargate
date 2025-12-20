/**
 * Payment Gateway API Routes
 * Phase 1.3: Payment Gateway Integration
 */

import { Router } from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';

const router = Router();

export interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  supportedCurrencies: string[];
  requiresFrontend?: boolean;
}

const AVAILABLE_GATEWAYS: PaymentGateway[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Complete payment infrastructure for online businesses. Supports credit cards, debit cards, and digital wallets.',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 'BRL', 'MXN'],
    requiresFrontend: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Worldwide payment platform supporting PayPal accounts and credit cards.',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 'BRL', 'MXN'],
    requiresFrontend: true,
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Payment processing for businesses of all sizes with in-person and online capabilities.',
    supportedCurrencies: ['USD', 'CAD', 'GBP', 'AUD', 'JPY'],
    requiresFrontend: true,
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    description: 'Secure payment method using Apple devices and Touch ID/Face ID.',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 'BRL', 'MXN'],
    requiresFrontend: false, // Uses Payment Request API
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    description: 'Fast and secure payment using Google accounts and saved payment methods.',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 'BRL', 'MXN'],
    requiresFrontend: false, // Uses Payment Request API
  },
];

/**
 * GET /api/payment-gateways
 * Get list of available payment gateways
 */
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      gateways: AVAILABLE_GATEWAYS,
    });
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment gateways',
    });
  }
});

/**
 * GET /api/payment-gateways/:gatewayId/config
 * Get payment gateway configuration for a website
 */
router.get('/:gatewayId/config', async (req, res) => {
  try {
    const { gatewayId } = req.params;
    const { websiteId } = req.query;

    if (!websiteId || typeof websiteId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'websiteId query parameter is required',
      });
    }

    const gateway = AVAILABLE_GATEWAYS.find(g => g.id === gatewayId);
    if (!gateway) {
      return res.status(404).json({
        success: false,
        error: 'Payment gateway not found',
      });
    }

    // Load config from file system
    const configPath = path.join(
      process.cwd(),
      'website_projects',
      websiteId,
      'payment-gateways',
      `${gatewayId}.json`
    );

    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);

      res.json({
        success: true,
        config,
      });
    } catch (fileError) {
      // Config doesn't exist, return default
      res.json({
        success: true,
        config: null,
      });
    }
  } catch (error) {
    console.error('Error fetching payment gateway config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment gateway configuration',
    });
  }
});

/**
 * POST /api/payment-gateways/:gatewayId/config
 * Save payment gateway configuration for a website
 */
router.post('/:gatewayId/config', async (req, res) => {
  try {
    const { gatewayId } = req.params;
    const { websiteId, config } = req.body;

    if (!websiteId || typeof websiteId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'websiteId is required',
      });
    }

    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'config is required',
      });
    }

    const gateway = AVAILABLE_GATEWAYS.find(g => g.id === gatewayId);
    if (!gateway) {
      return res.status(404).json({
        success: false,
        error: 'Payment gateway not found',
      });
    }

    // Validate config structure
    if (typeof config.gateway !== 'string' || config.gateway !== gatewayId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid gateway ID in config',
      });
    }

    if (typeof config.enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'enabled must be a boolean',
      });
    }

    if (!config.credentials || typeof config.credentials !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'credentials must be an object',
      });
    }

    // Save config to file system
    const configDir = path.join(
      process.cwd(),
      'website_projects',
      websiteId,
      'payment-gateways'
    );

    await fs.mkdir(configDir, { recursive: true });

    const configPath = path.join(configDir, `${gatewayId}.json`);

    await fs.writeFile(
      configPath,
      JSON.stringify(config, null, 2),
      'utf-8'
    );

    res.json({
      success: true,
      message: 'Payment gateway configuration saved',
    });
  } catch (error) {
    console.error('Error saving payment gateway config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save payment gateway configuration',
    });
  }
});

export function registerPaymentGatewayRoutes(app: any) {
  app.use('/api/payment-gateways', router);
}
