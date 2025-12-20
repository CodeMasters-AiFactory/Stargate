/**
 * Inventory Management Service
 * 
 * Comprehensive inventory management for e-commerce:
 * - Real-time stock tracking
 * - Low stock alerts
 * - Inventory valuation
 * - SKU management
 * - Batch/lot tracking
 * - Warehouse management
 * - Auto-reorder suggestions
 */

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  reservedQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplier?: string;
  warehouse?: string;
  location?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  variants?: ProductVariant[];
  images?: string[];
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>; // e.g., { color: 'red', size: 'L' }
  price: number;
  quantity: number;
  reservedQuantity: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  variantId?: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string; // Order ID, PO number, etc.
  warehouse?: string;
  createdAt: Date;
  createdBy?: string;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  sku: string;
  currentQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplier?: string;
  severity: 'warning' | 'critical' | 'out-of-stock';
}

export interface InventoryValuation {
  totalProducts: number;
  totalUnits: number;
  totalValue: number;
  totalCost: number;
  profit: number;
  margin: number;
  byCategory: Record<string, {
    products: number;
    units: number;
    value: number;
    cost: number;
  }>;
}

export interface ReorderSuggestion {
  productId: string;
  productName: string;
  sku: string;
  currentQuantity: number;
  suggestedQuantity: number;
  estimatedCost: number;
  supplier?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
}

// In-memory store (would be database in production)
const products: Map<string, Product> = new Map();
const movements: InventoryMovement[] = [];

/**
 * Add or update a product
 */
export function upsertProduct(product: Partial<Product> & { id: string; sku: string; name: string }): Product {
  const existing = products.get(product.id);
  
  const updated: Product = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description || '',
    category: product.category || 'uncategorized',
    price: product.price || 0,
    cost: product.cost || 0,
    quantity: product.quantity ?? existing?.quantity ?? 0,
    reservedQuantity: product.reservedQuantity ?? existing?.reservedQuantity ?? 0,
    reorderPoint: product.reorderPoint ?? 10,
    reorderQuantity: product.reorderQuantity ?? 50,
    supplier: product.supplier,
    warehouse: product.warehouse || 'default',
    location: product.location,
    weight: product.weight,
    dimensions: product.dimensions,
    variants: product.variants || existing?.variants,
    images: product.images || existing?.images,
    status: product.status || 'active',
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };
  
  products.set(product.id, updated);
  return updated;
}

/**
 * Get a product by ID
 */
export function getProduct(id: string): Product | undefined {
  return products.get(id);
}

/**
 * Get all products
 */
export function getAllProducts(options?: {
  status?: Product['status'];
  category?: string;
  warehouse?: string;
  lowStock?: boolean;
}): Product[] {
  let result = Array.from(products.values());
  
  if (options?.status) {
    result = result.filter(p => p.status === options.status);
  }
  if (options?.category) {
    result = result.filter(p => p.category === options.category);
  }
  if (options?.warehouse) {
    result = result.filter(p => p.warehouse === options.warehouse);
  }
  if (options?.lowStock) {
    result = result.filter(p => p.quantity <= p.reorderPoint);
  }
  
  return result;
}

/**
 * Adjust inventory quantity
 */
export function adjustInventory(
  productId: string,
  quantity: number,
  reason: string,
  type: InventoryMovement['type'] = 'adjustment',
  reference?: string,
  variantId?: string
): InventoryMovement | null {
  const product = products.get(productId);
  if (!product) return null;
  
  const previousQuantity = variantId
    ? product.variants?.find(v => v.id === variantId)?.quantity ?? 0
    : product.quantity;
  
  const newQuantity = previousQuantity + quantity;
  
  // Update product quantity
  if (variantId && product.variants) {
    const variant = product.variants.find(v => v.id === variantId);
    if (variant) {
      variant.quantity = Math.max(0, newQuantity);
    }
  } else {
    product.quantity = Math.max(0, newQuantity);
  }
  product.updatedAt = new Date();
  
  // Record movement
  const movement: InventoryMovement = {
    id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    productId,
    variantId,
    type,
    quantity,
    previousQuantity,
    newQuantity: Math.max(0, newQuantity),
    reason,
    reference,
    warehouse: product.warehouse,
    createdAt: new Date(),
  };
  
  movements.push(movement);
  return movement;
}

/**
 * Reserve inventory for an order
 */
export function reserveInventory(
  productId: string,
  quantity: number,
  orderId: string,
  variantId?: string
): boolean {
  const product = products.get(productId);
  if (!product) return false;
  
  const available = variantId
    ? (product.variants?.find(v => v.id === variantId)?.quantity ?? 0) -
      (product.variants?.find(v => v.id === variantId)?.reservedQuantity ?? 0)
    : product.quantity - product.reservedQuantity;
  
  if (available < quantity) return false;
  
  if (variantId && product.variants) {
    const variant = product.variants.find(v => v.id === variantId);
    if (variant) {
      variant.reservedQuantity += quantity;
    }
  } else {
    product.reservedQuantity += quantity;
  }
  
  adjustInventory(productId, 0, `Reserved for order ${orderId}`, 'adjustment', orderId, variantId);
  return true;
}

/**
 * Complete order and deduct inventory
 */
export function fulfillOrder(
  productId: string,
  quantity: number,
  orderId: string,
  variantId?: string
): boolean {
  const product = products.get(productId);
  if (!product) return false;
  
  // Release reservation
  if (variantId && product.variants) {
    const variant = product.variants.find(v => v.id === variantId);
    if (variant) {
      variant.reservedQuantity = Math.max(0, variant.reservedQuantity - quantity);
    }
  } else {
    product.reservedQuantity = Math.max(0, product.reservedQuantity - quantity);
  }
  
  // Deduct from stock
  adjustInventory(productId, -quantity, `Fulfilled order ${orderId}`, 'out', orderId, variantId);
  return true;
}

/**
 * Get low stock alerts
 */
export function getLowStockAlerts(): LowStockAlert[] {
  const alerts: LowStockAlert[] = [];
  
  products.forEach(product => {
    if (product.status !== 'active') return;
    
    const availableQty = product.quantity - product.reservedQuantity;
    
    if (availableQty <= 0) {
      alerts.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentQuantity: availableQty,
        reorderPoint: product.reorderPoint,
        reorderQuantity: product.reorderQuantity,
        supplier: product.supplier,
        severity: 'out-of-stock',
      });
    } else if (availableQty <= product.reorderPoint * 0.5) {
      alerts.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentQuantity: availableQty,
        reorderPoint: product.reorderPoint,
        reorderQuantity: product.reorderQuantity,
        supplier: product.supplier,
        severity: 'critical',
      });
    } else if (availableQty <= product.reorderPoint) {
      alerts.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentQuantity: availableQty,
        reorderPoint: product.reorderPoint,
        reorderQuantity: product.reorderQuantity,
        supplier: product.supplier,
        severity: 'warning',
      });
    }
  });
  
  // Sort by severity
  const severityOrder = { 'out-of-stock': 0, 'critical': 1, 'warning': 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  return alerts;
}

/**
 * Get inventory valuation
 */
export function getInventoryValuation(): InventoryValuation {
  let totalProducts = 0;
  let totalUnits = 0;
  let totalValue = 0;
  let totalCost = 0;
  const byCategory: InventoryValuation['byCategory'] = {};
  
  products.forEach(product => {
    if (product.status !== 'active') return;
    
    totalProducts++;
    totalUnits += product.quantity;
    totalValue += product.quantity * product.price;
    totalCost += product.quantity * product.cost;
    
    if (!byCategory[product.category]) {
      byCategory[product.category] = { products: 0, units: 0, value: 0, cost: 0 };
    }
    byCategory[product.category].products++;
    byCategory[product.category].units += product.quantity;
    byCategory[product.category].value += product.quantity * product.price;
    byCategory[product.category].cost += product.quantity * product.cost;
  });
  
  const profit = totalValue - totalCost;
  const margin = totalValue > 0 ? (profit / totalValue) * 100 : 0;
  
  return {
    totalProducts,
    totalUnits,
    totalValue,
    totalCost,
    profit,
    margin,
    byCategory,
  };
}

/**
 * Get reorder suggestions
 */
export function getReorderSuggestions(): ReorderSuggestion[] {
  const suggestions: ReorderSuggestion[] = [];
  
  products.forEach(product => {
    if (product.status !== 'active') return;
    
    const availableQty = product.quantity - product.reservedQuantity;
    
    if (availableQty <= product.reorderPoint) {
      let priority: ReorderSuggestion['priority'] = 'low';
      let reason = 'Stock below reorder point';
      
      if (availableQty <= 0) {
        priority = 'urgent';
        reason = 'Out of stock';
      } else if (availableQty <= product.reorderPoint * 0.25) {
        priority = 'high';
        reason = 'Stock critically low';
      } else if (availableQty <= product.reorderPoint * 0.5) {
        priority = 'medium';
        reason = 'Stock running low';
      }
      
      suggestions.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentQuantity: availableQty,
        suggestedQuantity: product.reorderQuantity,
        estimatedCost: product.reorderQuantity * product.cost,
        supplier: product.supplier,
        priority,
        reason,
      });
    }
  });
  
  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return suggestions;
}

/**
 * Get inventory movements history
 */
export function getMovementHistory(options?: {
  productId?: string;
  type?: InventoryMovement['type'];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): InventoryMovement[] {
  let result = [...movements];
  
  if (options?.productId) {
    result = result.filter(m => m.productId === options.productId);
  }
  if (options?.type) {
    result = result.filter(m => m.type === options.type);
  }
  if (options?.startDate) {
    result = result.filter(m => m.createdAt >= options.startDate!);
  }
  if (options?.endDate) {
    result = result.filter(m => m.createdAt <= options.endDate!);
  }
  
  // Sort by date descending
  result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  if (options?.limit) {
    result = result.slice(0, options.limit);
  }
  
  return result;
}

/**
 * Get inventory statistics
 */
export function getInventoryStats(): {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  recentMovements: number;
} {
  const activeProducts = getAllProducts({ status: 'active' });
  const lowStockAlerts = getLowStockAlerts();
  const valuation = getInventoryValuation();
  
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 7);
  const recentMovements = movements.filter(m => m.createdAt >= recentDate).length;
  
  return {
    totalProducts: products.size,
    activeProducts: activeProducts.length,
    lowStockCount: lowStockAlerts.filter(a => a.severity === 'warning' || a.severity === 'critical').length,
    outOfStockCount: lowStockAlerts.filter(a => a.severity === 'out-of-stock').length,
    totalValue: valuation.totalValue,
    recentMovements,
  };
}

// Initialize with some sample products
function initializeSampleData() {
  const sampleProducts: Array<Partial<Product> & { id: string; sku: string; name: string }> = [
    {
      id: 'prod_001',
      sku: 'WIDGET-001',
      name: 'Premium Widget',
      category: 'electronics',
      price: 49.99,
      cost: 25.00,
      quantity: 100,
      reorderPoint: 20,
      reorderQuantity: 50,
    },
    {
      id: 'prod_002',
      sku: 'GADGET-002',
      name: 'Smart Gadget',
      category: 'electronics',
      price: 129.99,
      cost: 65.00,
      quantity: 15,
      reorderPoint: 25,
      reorderQuantity: 75,
    },
    {
      id: 'prod_003',
      sku: 'TSHIRT-003',
      name: 'Classic T-Shirt',
      category: 'apparel',
      price: 24.99,
      cost: 8.00,
      quantity: 250,
      reorderPoint: 50,
      reorderQuantity: 100,
    },
  ];
  
  sampleProducts.forEach(p => upsertProduct(p));
}

initializeSampleData();
console.log('[Inventory Management] 📦 Service loaded with', products.size, 'products');

