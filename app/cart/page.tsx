"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartProvider';
import { useCurrency } from '@/context/CurrencyProvider';
import Image from 'next/image';
import Link from 'next/link';
import { getProductImageUrl } from '@/app/utils/image';
import { Trash2, Store, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';

export default function CartPage() {
  const {
    items,
    totalItems,
    removeItem,
    updateQuantity,
    clearCart,
    couponCode,
    discountRate,
    applyCoupon,
    removeCoupon,
    isLoading,
  } = useCart();
  const { formatPrice } = useCurrency();

  const [localCoupon, setLocalCoupon] = useState('');

  // Group items by Vendor
  const groupedItemsMap = new Map<string, typeof items>();
  items.forEach((item) => {
    const storeName = (item as any).vendorStoreName || (item as any).product?.vendorStoreName || "VellVista Flagship Store";
    if (!groupedItemsMap.has(storeName)) {
      groupedItemsMap.set(storeName, []);
    }
    groupedItemsMap.get(storeName)!.push(item);
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const TAX_RATE = 0.08;
  const tax = subtotal * TAX_RATE;
  const discount = subtotal * discountRate;
  const total = subtotal + tax - discount;

  const handleApply = () => {
    applyCoupon(localCoupon);
    setLocalCoupon('');
  };

  const handleRemove = () => {
    removeCoupon();
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/products' },
    { label: 'Cart' }
  ];

  if (isLoading) {
    return <CartSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-accent" /> Multi-Vendor Shopping Cart ({totalItems} items)
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <ShoppingBag className="w-12 h-12 text-secondary mx-auto" />
            <p className="text-muted text-base">Your shopping cart is empty.</p>
            <Link href="/products" className="inline-block px-6 py-2.5 bg-primary text-inverse text-xs uppercase font-semibold">
              Browse Marketplace Products
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Vendor Grouped Cart Display */}
            {Array.from(groupedItemsMap.entries()).map(([storeName, vendorGroupItems]) => {
              const vendorSubtotal = vendorGroupItems.reduce((s, item) => s + item.price * item.quantity, 0);
              return (
                <div key={storeName} className="border border-light rounded-xl overflow-hidden bg-surface shadow-sm space-y-2">
                  {/* Vendor Store Header */}
                  <div className="bg-background-muted px-4 py-3 border-b border-light flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold text-primary">Store: {storeName}</span>
                    </div>
                    <span className="text-xs font-semibold text-secondary">Subtotal: {formatPrice(vendorSubtotal)}</span>
                  </div>

                  {/* Vendor Product Items */}
                  <div className="divide-y divide-light px-4">
                    {vendorGroupItems.map((item) => (
                      <div key={item.cartItemId} className="flex items-center gap-4 py-4">
                        <div className="w-16 h-16 relative flex-shrink-0 bg-background-muted rounded overflow-hidden">
                          <Image
                            src={getProductImageUrl(item.image)}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-sm font-medium text-primary truncate">{item.name}</h2>
                          <p className="text-xs text-secondary">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs border border-gray-300 bg-gray-100 hover:bg-gray-200 rounded"
                          >−</button>
                          <span className="w-6 text-center text-xs text-primary font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs border border-gray-300 bg-gray-100 hover:bg-gray-200 rounded"
                          >+</button>
                        </div>
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          className="p-1.5 text-muted hover:text-error flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Pricing Summary */}
            <div className="border-t border-light pt-6 space-y-3 bg-surface p-6 rounded-xl">
              <div className="flex justify-between text-sm text-secondary">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-secondary">
                <span>Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {discountRate > 0 && (
                <div className="flex justify-between text-sm text-success font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-light">
                <span>Grand Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                value={localCoupon}
                onChange={(e) => setLocalCoupon(e.target.value)}
                className="flex-1 border border-border rounded px-4 py-2 text-sm bg-surface text-primary focus:outline-none"
              />
              <button
                onClick={handleApply}
                className="bg-primary text-inverse px-5 py-2 rounded text-xs font-bold uppercase tracking-wider hover:opacity-90"
              >
                Apply
              </button>
              {discountRate > 0 && (
                <button
                  onClick={handleRemove}
                  className="text-primary underline text-xs"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={clearCart}
                className="flex-1 border border-primary py-3 hover:bg-black/5 text-primary text-xs uppercase font-bold tracking-wider rounded-lg"
              >
                Clear Cart
              </button>
              <Link href="/checkout" className="flex-1 bg-primary text-inverse py-3 hover:opacity-90 text-center flex items-center justify-center text-xs uppercase font-bold tracking-wider rounded-lg">
                Proceed to Single Unified Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-4 w-32 bg-background-alt animate-pulse" />
        <div className="h-8 w-64 bg-background-alt animate-pulse mb-6" />

        <div className="space-y-4">
          <div className="h-24 bg-background-alt animate-pulse border border-light" />
          <div className="h-24 bg-background-alt animate-pulse border border-light" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
