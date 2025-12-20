/**
 * Discount Code Service
 * Handles discount codes, coupons, and promotional pricing
 */

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // Percentage (0-100) or fixed amount
  minPurchase?: number; // Minimum purchase amount required
  maxDiscount?: number; // Maximum discount amount (for percentage)
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number; // Total usage limit
  usageCount: number; // Current usage count
  firstTimeOnly?: boolean; // Only for first-time customers
  categories?: string[]; // Applicable product categories
  products?: string[]; // Applicable product IDs
  active: boolean;
}

export interface DiscountApplication {
  code: string;
  discountAmount: number;
  type: 'percentage' | 'fixed' | 'free_shipping';
  originalTotal: number;
  discountedTotal: number;
  shippingDiscount: number;
  message: string;
}

// In-memory discount codes (in production, use database)
const DISCOUNT_CODES: Map<string, DiscountCode> = new Map();

/**
 * Create a discount code
 */
export function createDiscountCode(discount: Omit<DiscountCode, 'id' | 'usageCount'>): DiscountCode {
  const id = `discount_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const discountCode: DiscountCode = {
    ...discount,
    id,
    usageCount: 0,
  };

  DISCOUNT_CODES.set(discount.code.toLowerCase(), discountCode);
  return discountCode;
}

/**
 * Validate and apply discount code
 */
export function applyDiscountCode(
  code: string,
  subtotal: number,
  shippingCost: number,
  items: Array<{ productId: string; category?: string; price: number }>,
  isFirstTimeCustomer: boolean = false
): DiscountApplication | null {
  const discount = DISCOUNT_CODES.get(code.toLowerCase());

  if (!discount) {
    return null; // Invalid code
  }

  // Check if code is active
  if (!discount.active) {
    return null;
  }

  // Check validity dates
  const now = new Date();
  if (now < discount.validFrom || now > discount.validUntil) {
    return null;
  }

  // Check usage limit
  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    return null;
  }

  // Check first-time customer requirement
  if (discount.firstTimeOnly && !isFirstTimeCustomer) {
    return null;
  }

  // Check minimum purchase
  if (discount.minPurchase && subtotal < discount.minPurchase) {
    return null;
  }

  // Check product/category restrictions
  if (discount.products && discount.products.length > 0) {
    const hasApplicableProduct = items.some(item => discount.products!.includes(item.productId));
    if (!hasApplicableProduct) {
      return null;
    }
  }

  if (discount.categories && discount.categories.length > 0) {
    const hasApplicableCategory = items.some(item => 
      item.category && discount.categories!.includes(item.category)
    );
    if (!hasApplicableCategory) {
      return null;
    }
  }

  // Calculate discount amount
  let discountAmount = 0;
  let shippingDiscount = 0;

  switch (discount.type) {
    case 'percentage':
      discountAmount = subtotal * (discount.value / 100);
      if (discount.maxDiscount) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
      break;
    case 'fixed':
      discountAmount = Math.min(discount.value, subtotal);
      break;
    case 'free_shipping':
      shippingDiscount = shippingCost;
      break;
  }

  const discountedTotal = subtotal - discountAmount + shippingCost - shippingDiscount;

  // Increment usage count
  discount.usageCount++;

  return {
    code: discount.code,
    discountAmount: Math.round(discountAmount * 100) / 100,
    type: discount.type,
    originalTotal: subtotal + shippingCost,
    discountedTotal: Math.round(discountedTotal * 100) / 100,
    shippingDiscount: Math.round(shippingDiscount * 100) / 100,
    message: getDiscountMessage(discount, discountAmount, shippingDiscount),
  };
}

/**
 * Get discount message
 */
function getDiscountMessage(
  discount: DiscountCode,
  discountAmount: number,
  shippingDiscount: number
): string {
  switch (discount.type) {
    case 'percentage':
      return `${discount.value}% off applied ($${discountAmount.toFixed(2)})`;
    case 'fixed':
      return `$${discount.value.toFixed(2)} off applied`;
    case 'free_shipping':
      return `Free shipping applied ($${shippingDiscount.toFixed(2)})`;
    default:
      return 'Discount applied';
  }
}

/**
 * Get discount code by code string
 */
export function getDiscountCode(code: string): DiscountCode | null {
  return DISCOUNT_CODES.get(code.toLowerCase()) || null;
}

/**
 * List all discount codes
 */
export function listDiscountCodes(): DiscountCode[] {
  return Array.from(DISCOUNT_CODES.values());
}

/**
 * Update discount code
 */
export function updateDiscountCode(code: string, updates: Partial<DiscountCode>): DiscountCode | null {
  const discount = DISCOUNT_CODES.get(code.toLowerCase());
  if (!discount) {
    return null;
  }

  const updated = { ...discount, ...updates };
  DISCOUNT_CODES.set(code.toLowerCase(), updated);
  return updated;
}

/**
 * Delete discount code
 */
export function deleteDiscountCode(code: string): boolean {
  return DISCOUNT_CODES.delete(code.toLowerCase());
}

