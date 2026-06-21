"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartProvider';
import { useCurrency } from '@/context/CurrencyProvider';
import Image from 'next/image';
import Link from 'next/link';
import { getProductImageUrl } from '@/app/utils/image';
import { Trash2 } from 'lucide-react';

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

  if (isLoading) {
    return <div className="p-6 text-center">Loading cart...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Your Shopping Cart</h1>

      {items.length === 0 ? (
        <p className="text-muted">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex items-center gap-3 p-3 border bg-surface sm:gap-4 sm:p-4">
              <div className="w-16 h-16 relative flex-shrink-0 sm:w-20 sm:h-20">
                <Image
                  src={getProductImageUrl(item.image)}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium text-primary truncate">{item.name}</h2>
                {/* FIX: Display line total (unit price × quantity) instead of just unit price.
                    This is consistent with the sidebar cart (CartItem.tsx) and ensures
                    the displayed price updates correctly when quantity changes. */}
                <p className="text-sm text-secondary">{formatPrice(item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center text-xs border border-gray-300 bg-gray-100 hover:bg-gray-200 sm:w-7 sm:h-7 sm:text-sm"
                >−</button>
                <span className="w-6 text-center text-sm text-primary sm:w-8">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center text-xs border border-gray-300 bg-gray-100 hover:bg-gray-200 sm:w-7 sm:h-7 sm:text-sm"
                >+</button>
              </div>
              <button
                onClick={() => removeItem(item.cartItemId)}
                className="p-1.5 text-muted hover:text-error flex-shrink-0 sm:p-2"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          ))}

          {/* Pricing Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>Tax (8%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            {discountRate > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold text-primary">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Coupon code"
              value={localCoupon}
              onChange={(e) => setLocalCoupon(e.target.value)}
              className="flex-1 border border-default rounded px-3 py-2 text-sm"
            />
            <button
              onClick={handleApply}
              className="bg-accent text-inverse px-4 py-2 rounded hover:bg-accent-light"
            >
              Apply
            </button>
            {discountRate > 0 && (
              <button
                onClick={handleRemove}
                className="text-primary underline"
              >
                Remove
              </button>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={clearCart}
              className="flex-1 border border-dark py-2 hover:bg-surface-alt text-primary"
            >
              Clear Cart
            </button>
            <Link href="/checkout" className="flex-1 bg-primary text-inverse py-2 hover:bg-primary-light text-center flex items-center justify-center text-sm font-light">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
