/**
 * STARGATE PORTAL - Stripe Payment Integration
 *
 * Handles:
 * - Package subscriptions
 * - Credit pack purchases
 * - Premium template purchases
 * - Webhook handling
 */

import Stripe from 'stripe';
import type { Express, Request, Response } from 'express';
import { PACKAGES, CREDIT_PACKS } from '../services/creditsSystem';
import { db } from '../db';
import { brandTemplates, userTemplatePurchases } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

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
  app.post('/api/payments/create-subscription', async (req: Request, res: Response): Promise<void> => {
    if (!stripe) {
      res.status(503).json({
        success: false,
        error: 'Payments not configured. Add STRIPE_SECRET_KEY to enable.'
      });
      return;
    }

    try {
      const { packageKey, userId, email } = req.body;

      const pkg = PACKAGES[packageKey as keyof typeof PACKAGES];
      if (!pkg || pkg.price === 0) {
        res.status(400).json({ success: false, error: 'Invalid package' });
        return;
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
  app.post('/api/payments/buy-credits', async (req: Request, res: Response): Promise<void> => {
    if (!stripe) {
      res.status(503).json({
        success: false,
        error: 'Payments not configured. Add STRIPE_SECRET_KEY to enable.'
      });
      return;
    }

    try {
      const { creditPackIndex, userId, email } = req.body;
      
      const pack = CREDIT_PACKS[creditPackIndex];
      if (!pack) {
        res.status(400).json({ success: false, error: 'Invalid credit pack' });
        return;
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
    (req: Request, res: Response): void => {
      if (!stripe) {
        res.status(503).send('Payments not configured');
        return;
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
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('[Stripe] Checkout completed:', session.id);

          const { packageKey, userId, type, credits, templateId, templateName } = session.metadata || {};

          // Handle template purchase
          if (type === 'template_purchase' && templateId && userId) {
            console.log(`[Stripe] Recording template purchase: ${templateName} for user ${userId}`);
            try {
              await db.insert(userTemplatePurchases).values({
                userId,
                templateId,
                price: ((session.amount_total || 0) / 100).toString(),
                currency: session.currency || 'usd',
                stripeSessionId: session.id,
                stripePaymentIntentId: typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : session.payment_intent?.id || null,
                status: 'completed',
              });
              console.log(`[Stripe] ✅ Template purchase recorded: ${templateId}`);
            } catch (dbError) {
              console.error('[Stripe] Failed to record template purchase:', dbError);
            }
          } else if (type === 'credit_pack' && credits) {
            console.log(`[Stripe] Adding ${credits} credits to user ${userId}`);
            // TODO: Add credits to user
          } else if (packageKey) {
            console.log(`[Stripe] Activating ${packageKey} for user ${userId}`);
            // TODO: Activate subscription
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
  app.get('/api/payments/session/:sessionId', async (req: Request, res: Response): Promise<void> => {
    if (!stripe) {
      res.status(503).json({ success: false, error: 'Payments not configured' });
      return;
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
  app.post('/api/payments/customer-portal', async (req: Request, res: Response): Promise<void> => {
    if (!stripe) {
      res.status(503).json({ success: false, error: 'Payments not configured' });
      return;
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

  // ============================================
  // PREMIUM TEMPLATE PURCHASE ENDPOINTS
  // ============================================

  // Purchase a premium template
  app.post('/api/payments/purchase-template', async (req: Request, res: Response): Promise<void> => {
    if (!stripe) {
      res.status(503).json({
        success: false,
        error: 'Payments not configured. Add STRIPE_SECRET_KEY to enable.'
      });
      return;
    }

    try {
      const { templateId } = req.body;
      const userId = (req.session as any)?.userId;

      // Check if user is logged in
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Login required to purchase templates',
          requiresLogin: true
        });
        return;
      }

      // Get template details
      const [template] = await db
        .select()
        .from(brandTemplates)
        .where(eq(brandTemplates.id, templateId))
        .limit(1);

      if (!template) {
        res.status(404).json({ success: false, error: 'Template not found' });
        return;
      }

      if (!template.isPremium) {
        res.status(400).json({ success: false, error: 'This template is free' });
        return;
      }

      if (!template.price) {
        res.status(400).json({ success: false, error: 'Template price not set' });
        return;
      }

      // Check if user already owns this template
      const [existingPurchase] = await db
        .select()
        .from(userTemplatePurchases)
        .where(
          and(
            eq(userTemplatePurchases.userId, userId),
            eq(userTemplatePurchases.templateId, templateId),
            eq(userTemplatePurchases.status, 'completed')
          )
        )
        .limit(1);

      if (existingPurchase) {
        res.status(400).json({
          success: false,
          error: 'You already own this template',
          alreadyOwned: true
        });
        return;
      }

      // Create Stripe checkout session
      const priceInCents = Math.round(parseFloat(template.price) * 100);

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Premium Template: ${template.name}`,
              description: `${template.brand} - ${template.category} template`,
              images: template.thumbnail ? [template.thumbnail] : undefined,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        }],
        metadata: {
          type: 'template_purchase',
          templateId,
          userId,
          templateName: template.name,
        },
        success_url: `${process.env.APP_URL || 'http://localhost:5000'}/merlin8/templates?purchased=${templateId}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:5000'}/merlin8/templates?type=premium`,
      });

      res.json({
        success: true,
        sessionId: session.id,
        url: session.url
      });
    } catch (error: any) {
      console.error('[Stripe] Template purchase error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Check if user owns a template
  app.get('/api/payments/template-access/:templateId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId } = req.params;
      const userId = (req.session as any)?.userId;

      // If not logged in, they don't own it
      if (!userId) {
        res.json({
          success: true,
          owned: false,
          requiresLogin: true
        });
        return;
      }

      // Check for completed purchase
      const [purchase] = await db
        .select()
        .from(userTemplatePurchases)
        .where(
          and(
            eq(userTemplatePurchases.userId, userId),
            eq(userTemplatePurchases.templateId, templateId),
            eq(userTemplatePurchases.status, 'completed')
          )
        )
        .limit(1);

      res.json({
        success: true,
        owned: !!purchase,
        purchaseDate: purchase?.purchasedAt
      });
    } catch (error: any) {
      console.error('[Payments] Template access check error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get user's purchased templates
  app.get('/api/payments/my-templates', async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.session as any)?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Login required'
        });
        return;
      }

      const purchases = await db
        .select()
        .from(userTemplatePurchases)
        .where(
          and(
            eq(userTemplatePurchases.userId, userId),
            eq(userTemplatePurchases.status, 'completed')
          )
        );

      res.json({
        success: true,
        purchases,
        count: purchases.length
      });
    } catch (error: any) {
      console.error('[Payments] Get user templates error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

console.log('[Payments] 💳 Routes ready (Stripe integration)');
