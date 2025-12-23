/**
 * STARGATE PORTAL - Stripe Payment Integration
 * 
 * Handles:
 * - Package subscriptions
 * - Credit pack purchases
 * - Webhook handling
 */

import Stripe from 'stripe';
import type { Express, Request, Response } from 'express';
import { PACKAGES, CREDIT_PACKS } from '../services/creditsSystem';

// Initialize Stripe (use test keys for testing)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_PLACEHOLDER';

let stripe: Stripe | null = null;

try {
  if (stripeSecretKey && !stripeSecretKey.includes('PLACEHOLDER')) {
    stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia' });
    console.log('[Stripe] ✅ Payment system initialized');
  } else {
    console.log('[Stripe] ⚠️ No API key - payments disabled (add STRIPE_SECRET_KEY to .env)');
  }
} catch (error) {
  console.error('[Stripe] Failed to initialize:', error);
}

// Stripe product/price IDs (will be created on first run)
const STRIPE_PRODUCTS: Record<string, { productId?: string; priceId?: string }> = {};

/**
 * Create Stripe products and prices for our packages
 */
async function ensureStripeProducts() {
  if (!stripe) return;

  for (const [key, pkg] of Object.entries(PACKAGES)) {
    if (pkg.price === 0) continue; // Skip free tier
    
    const existingProduct = STRIPE_PRODUCTS[key];
    if (existingProduct?.priceId) continue;

    try {
      // Create or retrieve product
      const product = await stripe.products.create({
        name: `Stargate Portal - ${pkg.name}`,
        description: pkg.description,
        metadata: { packageKey: key },
      });

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.price * 100, // Stripe uses cents
        currency: 'usd',
        recurring: { interval: 'month' },
      });

      STRIPE_PRODUCTS[key] = {
        productId: product.id,
        priceId: price.id,
      };

      console.log(`[Stripe] Created product: ${pkg.name} ($${pkg.price}/mo)`);
    } catch (error) {
      console.error(`[Stripe] Failed to create product ${key}:`, error);
    }
  }
}

/**
 * Register payment routes
 */
export function registerPaymentRoutes(app: Express) {
  // Initialize products on startup
  if (stripe) {
    ensureStripeProducts();
  }

  // Get pricing info
  app.get('/api/payments/pricing', (_req: Request, res: Response) => {
    res.json({
      success: true,
      packages: PACKAGES,
      creditPacks: CREDIT_PACKS,
      stripeEnabled: !!stripe,
    });
  });

  // Create checkout session for subscription
  app.post('/api/payments/create-subscription', async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(503).json({ 
        success: false, 
        error: 'Payments not configured. Add STRIPE_SECRET_KEY to enable.' 
      });
    }

    try {
      const { packageKey, userId, email } = req.body;

      const pkg = PACKAGES[packageKey as keyof typeof PACKAGES];
      if (!pkg || pkg.price === 0) {
        return res.status(400).json({ success: false, error: 'Invalid package' });
      }

      const stripeProduct = STRIPE_PRODUCTS[packageKey];
      if (!stripeProduct?.priceId) {
        await ensureStripeProducts();
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [{
          price: STRIPE_PRODUCTS[packageKey]?.priceId,
          quantity: 1,
        }],
        success_url: `${process.env.APP_URL || 'http://localhost:5000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:5000'}/pricing`,
        metadata: {
          packageKey,
          userId: userId?.toString(),
        },
      });

      res.json({ success: true, sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('[Stripe] Checkout error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create checkout for credit pack (one-time)
  app.post('/api/payments/buy-credits', async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(503).json({ 
        success: false, 
        error: 'Payments not configured. Add STRIPE_SECRET_KEY to enable.' 
      });
    }

    try {
      const { creditPackIndex, userId, email } = req.body;
      
      const pack = CREDIT_PACKS[creditPackIndex];
      if (!pack) {
        return res.status(400).json({ success: false, error: 'Invalid credit pack' });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: pack.price * 100,
            product_data: {
              name: `${pack.credits} Stargate Credits`,
              description: pack.discount ? `${pack.discount} - $${pack.perCredit}/credit` : `$${pack.perCredit}/credit`,
            },
          },
          quantity: 1,
        }],
        success_url: `${process.env.APP_URL || 'http://localhost:5000'}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=credits`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:5000'}/pricing`,
        metadata: {
          type: 'credit_pack',
          credits: pack.credits.toString(),
          userId: userId?.toString(),
        },
      });

      res.json({ success: true, sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('[Stripe] Credit purchase error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Stripe webhook handler
  app.post('/api/payments/webhook', 
    // Use raw body for signature verification
    (req: Request, res: Response) => {
      if (!stripe) {
        return res.status(503).send('Payments not configured');
      }

      const sig = req.headers['stripe-signature'] as string;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          stripeWebhookSecret
        );
      } catch (err: any) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('[Stripe] Checkout completed:', session.id);
          
          // TODO: Update user's package/credits in database
          const { packageKey, userId, type, credits } = session.metadata || {};
          
          if (type === 'credit_pack' && credits) {
            console.log(`[Stripe] Adding ${credits} credits to user ${userId}`);
            // Add credits to user
          } else if (packageKey) {
            console.log(`[Stripe] Activating ${packageKey} for user ${userId}`);
            // Activate subscription
          }
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`[Stripe] Subscription ${event.type}:`, subscription.id);
          // Update user's subscription status
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log('[Stripe] Payment failed:', invoice.id);
          // Handle failed payment (notify user, downgrade, etc.)
          break;
        }

        default:
          console.log(`[Stripe] Unhandled event: ${event.type}`);
      }

      res.json({ received: true });
    }
  );

  // Payment success page data
  app.get('/api/payments/session/:sessionId', async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Payments not configured' });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
      res.json({
        success: true,
        status: session.payment_status,
        customerEmail: session.customer_email,
        metadata: session.metadata,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get customer portal link (for managing subscription)
  app.post('/api/payments/customer-portal', async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Payments not configured' });
    }

    try {
      const { customerId } = req.body;
      
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.APP_URL || 'http://localhost:5000'}/account`,
      });

      res.json({ success: true, url: portalSession.url });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

console.log('[Payments] 💳 Routes ready (Stripe integration)');
