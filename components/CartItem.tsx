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
        <div className="flex items-center gap-3 mb-4 py-2 border-b border-gray-200 last:border-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 relative shrink-0">
            <Image src={getProductImageUrl(item.image)} alt={item.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-light text-primary truncate">{item.name}</h3>
            <p className="text-sm text-secondary">{formatPrice(item.price * item.quantity)}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
              className="w-6 h-6 flex items-center justify-center text-xs border border-gray-300 bg-gray-100 hover:bg-gray-200"
              aria-label="Decrease quantity"
            >−</button>
            <span className="w-5 text-center text-xs text-primary">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-xs border border-gray-300 bg-gray-100 hover:bg-gray-200"
              aria-label="Increase quantity"
            >+</button>
          </div>
          <button onClick={() => removeItem(item.cartItemId)} className="p-1 text-muted hover:text-error shrink-0">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
  );
});

export default CartItem;
