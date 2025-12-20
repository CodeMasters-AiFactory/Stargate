/**
 * Tax Calculator Service
 * Calculates tax based on location and product type
 */

export interface TaxRate {
  country: string;
  state?: string;
  city?: string;
  rate: number; // As decimal (0.08 = 8%)
  type: 'vat' | 'sales' | 'gst';
}

export interface TaxCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  breakdown: Array<{
    name: string;
    rate: number;
    amount: number;
  }>;
}

// Tax rates database (in production, this would be a database or API)
const TAX_RATES: TaxRate[] = [
  // United States
  { country: 'US', state: 'CA', rate: 0.0725, type: 'sales' },
  { country: 'US', state: 'NY', rate: 0.08, type: 'sales' },
  { country: 'US', state: 'TX', rate: 0.0625, type: 'sales' },
  { country: 'US', state: 'FL', rate: 0.06, type: 'sales' },
  { country: 'US', rate: 0.05, type: 'sales' }, // Default US rate

  // United Kingdom
  { country: 'GB', rate: 0.20, type: 'vat' },

  // Canada
  { country: 'CA', rate: 0.13, type: 'gst' }, // HST for most provinces
  { country: 'CA', state: 'AB', rate: 0.05, type: 'gst' }, // GST only
  { country: 'CA', state: 'BC', rate: 0.12, type: 'gst' },
  { country: 'CA', state: 'ON', rate: 0.13, type: 'gst' },

  // European Union (standard VAT rates)
  { country: 'DE', rate: 0.19, type: 'vat' },
  { country: 'FR', rate: 0.20, type: 'vat' },
  { country: 'IT', rate: 0.22, type: 'vat' },
  { country: 'ES', rate: 0.21, type: 'vat' },
  { country: 'NL', rate: 0.21, type: 'vat' },

  // Australia
  { country: 'AU', rate: 0.10, type: 'gst' },

  // Default rates for other countries
  { country: 'DEFAULT', rate: 0.15, type: 'vat' },
];

/**
 * Calculate tax for an order
 */
export function calculateTax(
  subtotal: number,
  shippingAddress: {
    country: string;
    state?: string;
    city?: string;
  },
  shippingCost: number = 0
): TaxCalculation {
  // Find matching tax rate
  let taxRate: TaxRate | undefined = TAX_RATES.find(
    rate => rate.country === shippingAddress.country &&
      (!rate.state || rate.state === shippingAddress.state) &&
      (!rate.city || rate.city === shippingAddress.city)
  );

  // Fallback to country-only rate
  if (!taxRate) {
    taxRate = TAX_RATES.find(rate => rate.country === shippingAddress.country && !rate.state);
  }

  // Fallback to default
  if (!taxRate) {
    taxRate = TAX_RATES.find(rate => rate.country === 'DEFAULT');
  }

  const effectiveRate = taxRate?.rate || 0.15;
  const taxableAmount = subtotal; // Tax is usually on items, not shipping
  const taxAmount = taxableAmount * effectiveRate;
  const total = subtotal + shippingCost + taxAmount;

  return {
    subtotal,
    taxRate: effectiveRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    breakdown: [
      {
        name: getTaxName(taxRate?.type || 'sales', shippingAddress.country),
        rate: effectiveRate,
        amount: Math.round(taxAmount * 100) / 100,
      },
    ],
  };
}

/**
 * Get tax name based on type and country
 */
function getTaxName(type: 'vat' | 'sales' | 'gst', country: string): string {
  switch (type) {
    case 'vat':
      return 'VAT';
    case 'gst':
      return 'GST';
    case 'sales':
      return country === 'US' ? 'Sales Tax' : 'Tax';
    default:
      return 'Tax';
  }
}

/**
 * Check if tax is required for a location
 */
export function isTaxRequired(country: string): boolean {
  // Some countries or regions may have tax exemptions
  const taxExemptCountries = ['AE', 'SA', 'KW', 'BH']; // Middle East countries
  
  return !taxExemptCountries.includes(country);
}

