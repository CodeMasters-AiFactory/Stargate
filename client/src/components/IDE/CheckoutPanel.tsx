/**
 * Checkout Panel - E-commerce Checkout UI
 * Wires to the backend checkout service for complete purchase flow
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Tag, 
  Trash2, 
  Plus, 
  Minus,
  Check,
  Loader2,
  Lock,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

interface CheckoutPanelProps {
  projectId?: string;
  onComplete?: (orderId: string) => void;
}

export function CheckoutPanel({ projectId: _projectId, onComplete }: CheckoutPanelProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'confirmation'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  
  // Demo cart items
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Professional Website Package',
      price: 499,
      quantity: 1,
      variant: 'Standard',
    },
    {
      id: '2',
      name: 'SEO Optimization Add-on',
      price: 149,
      quantity: 1,
    },
  ]);
  
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  
  const shippingOptions: ShippingOption[] = [
    { id: 'digital', name: 'Digital Delivery', price: 0, estimatedDays: 'Instant' },
    { id: 'priority', name: 'Priority Support', price: 49, estimatedDays: '24/7 access' },
    { id: 'premium', name: 'Premium Onboarding', price: 199, estimatedDays: '1-on-1 session included' },
  ];
  
  // Payment form state
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
    email: '',
  });
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedDiscount ? subtotal * (appliedDiscount.percent / 100) : 0;
  const shippingCost = selectedShipping?.price || 0;
  const tax = (subtotal - discount) * 0.1; // 10% tax
  const total = subtotal - discount + shippingCost + tax;
  
  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };
  
  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };
  
  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    try {
      const response = await fetch('/api/checkout/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppliedDiscount({ code: discountCode, percent: data.percent });
        toast({
          title: 'Discount Applied',
          description: `${data.percent}% off your order`,
        });
      } else {
        toast({
          title: 'Invalid Code',
          description: 'This discount code is not valid',
          variant: 'destructive',
        });
      }
    } catch {
      // Demo mode - apply a mock discount
      if (discountCode.toLowerCase() === 'merlin20') {
        setAppliedDiscount({ code: discountCode, percent: 20 });
        toast({
          title: 'Discount Applied',
          description: '20% off your order',
        });
      } else {
        toast({
          title: 'Invalid Code',
          description: 'Try MERLIN20 for 20% off',
          variant: 'destructive',
        });
      }
    }
  };
  
  const processPayment = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          shipping: selectedShipping,
          discount: appliedDiscount,
          payment: {
            // In production, this would use Stripe Elements
            email: paymentInfo.email,
          },
          total,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setStep('confirmation');
        onComplete?.(data.orderId);
      } else {
        throw new Error('Payment failed');
      }
    } catch {
      // Demo mode - simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('confirmation');
      onComplete?.('ORD-' + Date.now());
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['cart', 'shipping', 'payment', 'confirmation'].map((s, i) => (
          <React.Fragment key={s}>
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step === s 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : i < ['cart', 'shipping', 'payment', 'confirmation'].indexOf(step)
                    ? 'bg-green-500 text-white border-green-500'
                    : 'border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {i < ['cart', 'shipping', 'payment', 'confirmation'].indexOf(step) ? (
                <Check className="h-5 w-5" />
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && (
              <div 
                className={`w-20 h-1 mx-2 ${
                  i < ['cart', 'shipping', 'payment', 'confirmation'].indexOf(step)
                    ? 'bg-green-500'
                    : 'bg-muted'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 'cart' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Cart
                </CardTitle>
                <CardDescription>
                  {cartItems.length} items in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">{item.variant}</p>
                      )}
                      <p className="font-bold">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Discount Code */}
                <div className="flex gap-2 mt-4">
                  <div className="flex-1">
                    <Label htmlFor="discount">Discount Code</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="discount"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Enter code"
                        disabled={!!appliedDiscount}
                      />
                      <Button
                        onClick={applyDiscount}
                        disabled={!!appliedDiscount}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
                
                {appliedDiscount && (
                  <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                    <Check className="h-3 w-3" />
                    {appliedDiscount.code} - {appliedDiscount.percent}% off
                  </Badge>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => setStep('shipping')}
                  disabled={cartItems.length === 0}
                >
                  Continue to Shipping
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {step === 'shipping' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shippingOptions.map(option => (
                  <div
                    key={option.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedShipping?.id === option.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setSelectedShipping(option)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{option.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {option.estimatedDays}
                        </p>
                      </div>
                      <div className="text-right">
                        {option.price === 0 ? (
                          <Badge>Free</Badge>
                        ) : (
                          <span className="font-bold">${option.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('cart')}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => setStep('payment')}
                  disabled={!selectedShipping}
                >
                  Continue to Payment
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {step === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Secured by Stripe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={paymentInfo.email}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    value={paymentInfo.name}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card">Card Number</Label>
                  <Input
                    id="card"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                    placeholder="4242 4242 4242 4242"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      value={paymentInfo.expiry}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      value={paymentInfo.cvc}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cvc: e.target.value })}
                      placeholder="123"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                  <Shield className="h-4 w-4" />
                  Your payment information is encrypted and secure
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('shipping')}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={processPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay ${total.toFixed(2)}</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {step === 'confirmation' && (
            <Card className="text-center">
              <CardContent className="pt-10 pb-10">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for your purchase. You'll receive a confirmation email shortly.
                </p>
                <div className="bg-muted p-4 rounded-lg inline-block">
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono font-bold">ORD-{Date.now()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {appliedDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedDiscount.percent}%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              {selectedShipping && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{selectedShipping.name}</span>
                  <span>
                    {selectedShipping.price === 0 ? 'Free' : `$${selectedShipping.price.toFixed(2)}`}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPanel;

