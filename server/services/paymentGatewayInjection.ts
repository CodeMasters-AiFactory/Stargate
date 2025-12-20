/**
 * Payment Gateway Script Injection Service
 * Phase 1.3: Injects payment gateway scripts into generated websites
 */

export interface PaymentGatewayConfig {
  gateway: string;
  enabled: boolean;
  credentials: Record<string, string>;
  testMode: boolean;
}

/**
 * Generate payment gateway scripts for HTML injection
 */
export function generatePaymentGatewayScripts(
  configs: PaymentGatewayConfig[]
): { head: string; body: string } {
  const enabledConfigs = configs.filter(c => c.enabled);
  const scripts = { head: '', body: '' };

  for (const config of enabledConfigs) {
    try {
      const gatewayScripts = generateScriptForGateway(config);
      if (gatewayScripts.head) {
        scripts.head += gatewayScripts.head + '\n';
      }
      if (gatewayScripts.body) {
        scripts.body += gatewayScripts.body + '\n';
      }
    } catch (error) {
      console.error(`[Payment Gateways] Failed to generate script for ${config.gateway}:`, error);
    }
  }

  return scripts;
}

/**
 * Generate script for specific payment gateway
 */
function generateScriptForGateway(config: PaymentGatewayConfig): { head: string; body: string } {
  switch (config.gateway) {
    case 'stripe':
      return generateStripeScript(config);
    case 'paypal':
      return generatePayPalScript(config);
    case 'square':
      return generateSquareScript(config);
    case 'apple-pay':
      return generateApplePayScript(config);
    case 'google-pay':
      return generateGooglePayScript(config);
    default:
      return { head: '', body: '' };
  }
}

/**
 * Generate Stripe script
 */
function generateStripeScript(config: PaymentGatewayConfig): { head: string; body: string } {
  const publishableKey = config.credentials.publishableKey || config.credentials.publicKey;
  if (!publishableKey) return { head: '', body: '' };

  const mode = config.testMode ? 'test' : 'live';
  
  return {
    head: `<!-- Stripe Payment Gateway -->
<script src="https://js.stripe.com/v3/"></script>
<script>
  window.STRIPE_CONFIG = {
    publishableKey: '${publishableKey}',
    mode: '${mode}'
  };
  window.stripe = Stripe('${publishableKey}');
</script>`,
    body: '',
  };
}

/**
 * Generate PayPal script
 */
function generatePayPalScript(config: PaymentGatewayConfig): { head: string; body: string } {
  const clientId = config.credentials.clientId;
  if (!clientId) return { head: '', body: '' };

  const currency = config.credentials.currency || 'USD';
  const intent = config.credentials.intent || 'capture';
  
  return {
    head: `<!-- PayPal Payment Gateway -->
<script src="https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=${intent}"></script>
<script>
  window.PAYPAL_CONFIG = {
    clientId: '${clientId}',
    currency: '${currency}',
    intent: '${intent}'
  };
</script>`,
    body: '',
  };
}

/**
 * Generate Square script
 */
function generateSquareScript(config: PaymentGatewayConfig): { head: string; body: string } {
  const applicationId = config.credentials.applicationId || config.credentials.appId;
  const locationId = config.credentials.locationId;
  
  if (!applicationId || !locationId) return { head: '', body: '' };

  return {
    head: `<!-- Square Payment Gateway -->
<script src="https://js.squareup.com/v2/paymentform"></script>
<script>
  window.SQUARE_CONFIG = {
    applicationId: '${applicationId}',
    locationId: '${locationId}'
  };
</script>`,
    body: '',
  };
}

/**
 * Generate Apple Pay script (uses Payment Request API)
 */
function generateApplePayScript(config: PaymentGatewayConfig): { head: string; body: string } {
  // Apple Pay uses Payment Request API - no additional script needed
  // But we can add a helper script for checking availability
  return {
    body: `<!-- Apple Pay Support Check -->
<script>
  window.APPLE_PAY_CONFIG = {
    enabled: ${config.enabled},
    supported: 'ApplePaySession' in window && ApplePaySession.canMakePayments()
  };
  
  // Helper function to check Apple Pay availability
  window.checkApplePaySupport = function() {
    return window.APPLE_PAY_CONFIG.supported;
  };
</script>`,
  };
}

/**
 * Generate Google Pay script (uses Payment Request API)
 */
function generateGooglePayScript(config: PaymentGatewayConfig): { head: string; body: string } {
  // Google Pay uses Payment Request API - add helper script
  return {
    body: `<!-- Google Pay Support Check -->
<script>
  window.GOOGLE_PAY_CONFIG = {
    enabled: ${config.enabled},
    environment: '${config.testMode ? 'TEST' : 'PRODUCTION'}'
  };
  
  // Helper function to check Google Pay availability
  window.checkGooglePaySupport = function() {
    return 'PaymentRequest' in window && 
           PaymentRequest.prototype.canMakePayment && 
           PaymentRequest.prototype.canMakePayment.call(new PaymentRequest([{supportedMethods: 'https://google.com/pay'}], {total: {label: 'Total', amount: {currency: 'USD', value: '0.01'}}}));
  };
</script>`,
  };
}

/**
 * Inject payment gateway scripts into HTML
 */
export function injectPaymentGatewayScripts(
  html: string,
  configs: PaymentGatewayConfig[]
): string {
  const scripts = generatePaymentGatewayScripts(configs);

  // Inject head scripts
  if (scripts.head) {
    html = html.replace('</head>', `${scripts.head}\n</head>`);
  }

  // Inject body scripts
  if (scripts.body) {
    html = html.replace('</body>', `${scripts.body}\n</body>`);
  }

  return html;
}

/**
 * Load payment gateway configs for a website
 */
export async function loadPaymentGatewayConfigs(websiteId: string): Promise<PaymentGatewayConfig[]> {
  const fs = require('fs/promises');
  const path = require('path');

  const configDir = path.join(
    process.cwd(),
    'website_projects',
    websiteId,
    'payment-gateways'
  );

  const configs: PaymentGatewayConfig[] = [];
  const gatewayIds = ['stripe', 'paypal', 'square', 'apple-pay', 'google-pay'];

  for (const gatewayId of gatewayIds) {
    try {
      const configPath = path.join(configDir, `${gatewayId}.json`);
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      configs.push(config);
    } catch (error) {
      // Config doesn't exist, skip
      console.warn(`[Payment Gateways] No config found for ${gatewayId}`);
    }
  }

  return configs.filter(c => c.enabled);
}

