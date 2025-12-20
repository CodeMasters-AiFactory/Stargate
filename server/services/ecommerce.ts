/**
 * E-Commerce Service
 * Handles product catalog, shopping cart, orders, and payment processing
 */

import Stripe from 'stripe';

// Initialize Stripe (use test key by default, replace with real key in production)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
});

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  sku?: string;
  inventory?: {
    quantity: number;
    trackQuantity: boolean;
  };
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    sku?: string;
  }>;
  metadata?: Record<string, string>;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  websiteId: string;
  items: CartItem[];
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentIntentId?: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a Stripe Checkout Session for e-commerce
 */
export async function createCheckoutSession(
  items: CartItem[],
  products: Product[],
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<{ sessionId: string; url: string }> {
  const lineItems = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    return {
      price_data: {
        currency: product.currency || 'usd',
        product_data: {
          name: product.name,
          description: product.description,
          images: product.images,
          metadata: {
            productId: product.id,
            ...product.metadata,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: metadata || {},
  });

  return {
    sessionId: session.id,
    url: session.url || '',
  };
}

/**
 * Create a Payment Intent for custom payment flows
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata: metadata || {},
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret || '',
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Verify payment and create order
 */
export async function verifyPayment(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    return false;
  }
}

/**
 * Calculate shipping costs (integrate with shipping APIs)
 */
export async function calculateShipping(
  items: CartItem[],
  destination: {
    country: string;
    state?: string;
    postalCode?: string;
  }
): Promise<number> {
  // Placeholder: Integrate with shipping APIs (USPS, FedEx, UPS, etc.)
  // For now, return flat rate based on destination
  const baseShipping = 10; // $10 base shipping
  const internationalSurcharge = destination.country !== 'US' ? 15 : 0;
  
  // Calculate weight-based shipping (simplified)
  const totalWeight = items.reduce((sum, item) => sum + item.quantity * 1, 0); // Assume 1lb per item
  const weightSurcharge = totalWeight > 5 ? (totalWeight - 5) * 2 : 0;
  
  return baseShipping + internationalSurcharge + weightSurcharge;
}

/**
 * Generate product catalog HTML/CSS/JS for website
 */
export function generateEcommerceCode(products: Product[], config: {
  currency: string;
  showPrices: boolean;
  enableCart: boolean;
  layout: 'grid' | 'list';
}): { html: string; css: string; js: string } {
  const productsHtml = products.map(product => `
    <div class="product-card" data-product-id="${product.id}">
      ${product.images.length > 0 ? `<img src="${product.images[0]}" alt="${product.name}" class="product-image">` : ''}
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        ${config.showPrices ? `<div class="product-price">${config.currency}${product.price.toFixed(2)}</div>` : ''}
        ${config.enableCart ? `<button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>` : ''}
      </div>
    </div>
  `).join('');

  const html = `
    <section class="products-section">
      <div class="container">
        <h2>Our Products</h2>
        <div class="products-${config.layout}">
          ${productsHtml}
        </div>
        ${config.enableCart ? '<div id="cart-sidebar" class="cart-sidebar"></div>' : ''}
      </div>
    </section>
  `;

  const css = `
    .products-section {
      padding: 4rem 2rem;
      background: #f9fafb;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    .products-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .product-info {
      padding: 1.5rem;
    }
    .product-name {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }
    .product-description {
      color: #6b7280;
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
    }
    .product-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #059669;
      margin-bottom: 1rem;
    }
    .add-to-cart-btn {
      width: 100%;
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .add-to-cart-btn:hover {
      background: #2563eb;
    }
    .cart-sidebar {
      position: fixed;
      right: -400px;
      top: 0;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 8px rgba(0,0,0,0.1);
      transition: right 0.3s;
      z-index: 1000;
      padding: 2rem;
      overflow-y: auto;
    }
    .cart-sidebar.open {
      right: 0;
    }
  `;

  const js = config.enableCart ? `
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    function updateCartUI() {
      const cartSidebar = document.getElementById('cart-sidebar');
      if (!cartSidebar) return;
      
      if (cart.length === 0) {
        cartSidebar.innerHTML = '<p>Your cart is empty</p>';
        return;
      }
      
      const cartHtml = cart.map(item => \`
        <div class="cart-item">
          <span>\${item.name}</span>
          <span>\${item.quantity}x</span>
          <span>\${item.price}</span>
        </div>
      \`).join('');
      
      cartSidebar.innerHTML = \`
        <h3>Shopping Cart</h3>
        \${cartHtml}
        <button id="checkout-btn">Checkout</button>
      \`;
    }
    
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart-btn')) {
        const productId = e.target.dataset.productId;
        const productCard = e.target.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        const productPrice = productCard.querySelector('.product-price')?.textContent || '0';
        
        const existingItem = cart.find(item => item.productId === productId);
        if (existingItem) {
          existingItem.quantity++;
        } else {
          cart.push({
            productId,
            name: productName,
            price: productPrice,
            quantity: 1
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
      }
    });
    
    updateCartUI();
  ` : '';

  return { html, css, js };
}

