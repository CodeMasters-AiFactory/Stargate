# ===========================================
# STARGATE PORTAL - STRIPE TEST SETUP GUIDE
# ===========================================

## STEP 1: Create Stripe Account (FREE)

1. Go to https://dashboard.stripe.com/register
2. Sign up with your email
3. Verify your email
4. You'll be in TEST MODE by default (orange "Test mode" badge)

## STEP 2: Get Your Test API Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. You'll see:
   - Publishable key: pk_test_xxxxx (safe to expose)
   - Secret key: sk_test_xxxxx (keep private!)
3. Click "Reveal test key" to see your secret key
4. Copy both keys

## STEP 3: Add Keys to Your .env File

Add these lines to your .env file:

```
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

## STEP 4: Set Up Webhook (for receiving payment events)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. Enter your webhook URL: https://your-domain.com/api/payments/webhook
   (For local testing, use Stripe CLI - see below)
4. Select events to listen to:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed
5. Click "Add endpoint"
6. Copy the "Signing secret" (whsec_xxx) to your .env

## STEP 5: Local Testing with Stripe CLI

For local development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Windows: scoop install stripe
   - Mac: brew install stripe/stripe-cli/stripe

2. Login: stripe login

3. Forward webhooks to localhost:
   stripe listen --forward-to localhost:5000/api/payments/webhook

4. Copy the webhook signing secret it gives you

## TEST CARD NUMBERS

Use these fake cards for testing:

SUCCESS:
- Card: 4242 4242 4242 4242
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)

DECLINE:
- Card: 4000 0000 0000 0002

3D SECURE:
- Card: 4000 0025 0000 3155

## YOUR PACKAGES

| Package | Price | Stripe Price ID |
|---------|-------|-----------------|
| Starter | $9/mo | (auto-created) |
| Pro | $29/mo | (auto-created) |
| Agency | $79/mo | (auto-created) |
| Enterprise | $199/mo | (auto-created) |

## TESTING CHECKLIST

[ ] Create Stripe account
[ ] Get test API keys
[ ] Add keys to .env
[ ] Set up webhook endpoint
[ ] Test with 4242 card
[ ] Verify webhook receives events

## GO LIVE CHECKLIST

When ready for real payments:

[ ] Complete Stripe account verification
[ ] Switch from test to live mode in Dashboard
[ ] Replace test keys (pk_test_, sk_test_) with live keys (pk_live_, sk_live_)
[ ] Update webhook endpoint to live
[ ] Test with real card (small amount)
[ ] Enable automatic tax collection (if needed)

## SUPPORT

Stripe Documentation: https://stripe.com/docs
Stripe Support: https://support.stripe.com
