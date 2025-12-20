/**
 * Product Catalog Builder Component
 * Allows users to add, edit, and manage products for their website
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Image as ImageIcon, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
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
}

interface ProductCatalogProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

export function ProductCatalog({ products, onProductsChange }: ProductCatalogProps) {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Get websiteId from URL or props (if available)
  const getWebsiteId = (): string => {
    // Try to get from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const websiteId = urlParams.get('websiteId') || 
                      localStorage.getItem('current-website-id') || 
                      'default';
    return websiteId;
  };
  
  const saveProductsToBackend = async (productsToSave: Product[]) => {
    try {
      setSaving(true);
      const websiteId = getWebsiteId();
      const response = await fetch(`/api/ecommerce/products/${websiteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsToSave }),
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save products');
      }
      
      toast({
        title: 'Products Saved',
        description: `Successfully saved ${productsToSave.length} product(s)`,
      });
    } catch (error) {
      console.error('Failed to save products:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save products to server',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct({
      id: `product-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      category: '',
      images: [],
    });
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsDialogOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (!editingProduct) return;

    const updatedProduct: Product = {
      ...editingProduct,
      ...productData,
    };

    let updatedProducts: Product[];
    if (editingProduct.id.startsWith('product-')) {
      // New product
      updatedProducts = [...products, updatedProduct];
      onProductsChange(updatedProducts);
      toast({
        title: 'Product Added',
        description: `${updatedProduct.name} has been added to your catalog`,
      });
    } else {
      // Update existing
      updatedProducts = products.map(p => (p.id === editingProduct.id ? updatedProduct : p));
      onProductsChange(updatedProducts);
      toast({
        title: 'Product Updated',
        description: `${updatedProduct.name} has been updated`,
      });
    }

    // Save to backend
    await saveProductsToBackend(updatedProducts);

    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    const updatedProducts = products.filter(p => p.id !== productId);
    onProductsChange(updatedProducts);
    
    // Save to backend
    await saveProductsToBackend(updatedProducts);
    
    toast({
      title: 'Product Deleted',
      description: product ? `${product.name} has been removed` : 'Product removed',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Catalog
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage products for your e-commerce website
          </p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Button onClick={handleAddProduct} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {product.category || 'Uncategorized'}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {product.description}
                </p>
                <p className="text-lg font-semibold">
                  {product.currency} {product.price.toFixed(2)}
                </p>
                {product.inventory?.trackQuantity && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Stock: {product.inventory.quantity}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.id.startsWith('product-') ? 'Add Product' : 'Edit Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct?.id.startsWith('product-')
                ? 'Add a new product to your catalog'
                : 'Update product information'}
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProductFormProps {
  product: Product;
  onSave: (productData: Partial<Product>) => void;
  onCancel: () => void;
}

function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    category: product.category,
    sku: product.sku,
    images: product.images || [],
    inventory: product.inventory || {
      quantity: 0,
      trackQuantity: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Premium T-Shirt"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          required
          placeholder="Describe your product..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price || 0}
            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency || 'USD'}
            onValueChange={value => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="CAD">CAD (C$)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category || ''}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g., Clothing, Electronics"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sku">SKU (Optional)</Label>
        <Input
          id="sku"
          value={formData.sku || ''}
          onChange={e => setFormData({ ...formData, sku: e.target.value })}
          placeholder="Product SKU"
        />
      </div>

      <div className="space-y-2">
        <Label>Product Images</Label>
        <div className="flex gap-2">
          {formData.images?.map((url, idx) => (
            <div key={idx} className="relative">
              <img
                src={url}
                alt={`Product ${idx + 1}`}
                className="w-20 h-20 object-cover rounded"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2"
                onClick={() => {
                  setFormData({
                    ...formData,
                    images: formData.images?.filter((_, i) => i !== idx),
                  });
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url) {
                setFormData({
                  ...formData,
                  images: [...(formData.images || []), url],
                });
              }
            }}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Product</Button>
      </DialogFooter>
    </form>
  );
}
