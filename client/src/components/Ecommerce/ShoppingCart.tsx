/**
 * Shopping Cart Component
 * Handles cart functionality, checkout, and payment processing
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ShoppingCart as ShoppingCartIcon, CreditCard, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Stripe is loaded but not used in current implementation
// const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export interface CartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function ShoppingCart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: ShoppingCartProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  
  // Persist cart to localStorage
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('shopping-cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('shopping-cart');
    }
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.07 * 100) / 100; // 7% tax (simplified)
  const total = subtotal + shippingCost + tax;

  useEffect(() => {
    // Calculate shipping when items change
    if (items.length > 0) {
      calculateShipping();
    } else {
      setShippingCost(0);
    }
  }, [items]);

  const calculateShipping = async () => {
    try {
      const response = await fetch('/api/ecommerce/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          destination: {
            country: 'US', // TODO: Get from user settings
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShippingCost(data.shippingCost);
      }
    } catch (error) {
      // Silently fail, use default shipping
      setShippingCost(10);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: 'Cart is Empty',
        description: 'Add items to your cart before checkout',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create checkout session
      const response = await fetch('/api/ecommerce/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          products: items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            currency: 'usd',
            images: item.image ? [item.image] : [],
          })),
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      toast({
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'Failed to process checkout',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Cart Sidebar */}
      <Card className="w-full sm:w-96 h-full sm:h-auto sm:max-h-[90vh] flex flex-col z-50 bg-background shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="w-5 h-5" />
            Shopping Cart
            {items.length > 0 && <Badge variant="secondary">{items.length}</Badge>}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close cart">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCartIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button variant="outline" onClick={onClose} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-3 border rounded-lg bg-card">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-muted/30">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  Shipping
                </span>
                <span>
                  {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Calculated at checkout'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isProcessing}>
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Checkout'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
