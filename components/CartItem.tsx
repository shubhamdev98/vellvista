import React from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { getProductImageUrl } from "../app/utils/image";
import { useCurrency } from "../context/CurrencyProvider";

interface CartItemProps {
  item: {
    cartItemId: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
  };
  updateQuantity: (cartItemId: number, quantity: number) => void;
  removeItem: (cartItemId: number) => void;
}

const CartItem: React.FC<CartItemProps> = React.memo(({ item, updateQuantity, removeItem }) => {
  const { formatPrice } = useCurrency();
  return (
        <div className="flex gap-3 mb-4 min-h-[80px] items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0">
            <Image src={getProductImageUrl(item.image)} alt={item.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-light text-primary truncate">{item.name}</h3>
            <p className="text-sm text-secondary">{formatPrice(item.price * item.quantity)}</p>
            <div className="flex items-center gap-3 text-sm text-muted">
              <button
                onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                className="w-8 h-8 flex items-center justify-center border rounded hover:bg-surface-alt"
                aria-label="Decrease quantity"
              >-
              </button>
              <span className="inline-block w-12 text-center">Qty: {item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center border rounded hover:bg-surface-alt"
                aria-label="Increase quantity"
              >+
              </button>
            </div>
          </div>
          <button onClick={() => removeItem(item.cartItemId)} className="p-1 text-muted hover:text-error self-start">
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
  );
});

export default CartItem;
