"use client";

import { createContext, useContext, useMemo, useState, useEffect, useRef, type ReactNode } from "react";
import { trpc } from "../app/utils/trpc";
import { useAuth } from "./AuthProvider";

export type CartItem = {
  id: number;
  cartItemId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  addItem: (item: Omit<CartItem, "quantity" | "cartItemId">) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  requiresLogin: boolean;
  // Coupon related
  couponCode: string;
  discountRate: number; // e.g., 0.1 for 10% discount
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Ref to store pending timeout per cart item for debounced server sync
const updateTimers = { current: {} as Record<number, ReturnType<typeof setTimeout>> };
// Ref to cache the latest quantity before server sync (per cart item)
const pendingQuantities = { current: {} as Record<number, number> };


const isNetworkError = (error: unknown) =>
  error instanceof Error && error.message.toLowerCase().includes("failed to fetch");

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0); // 0 means no discount


  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === 'SAVE10') {
      setCouponCode(trimmed);
      setDiscountRate(0.1);
    } else {
      setCouponCode('');
      setDiscountRate(0);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountRate(0);
  };
  const hasWarnedBackendUnavailable = useRef(false);
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(() => {
    // Initialize with a default value for SSR
    if (typeof window !== 'undefined') {
      let sid = localStorage.getItem("cartSessionId");
      if (!sid) {
        sid = Date.now().toString();
        localStorage.setItem("cartSessionId", sid);
      }
      return sid;
    }
    return "";
  });

  // Initialize sessionId on client mount if not set
  useEffect(() => {
    if (!sessionId) {
      let sid = localStorage.getItem("cartSessionId");
      if (!sid) {
        sid = Date.now().toString();
        localStorage.setItem("cartSessionId", sid);
      }
      setSessionId(sid);
    }
  }, [sessionId]);

  // Clear cart when user logs out
  useEffect(() => {
    if (user === null) {
      setItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    const userId = user?.id || undefined;
    if (!userId && !sessionId) return;
    try {
      setIsLoading(true);
      const cartData = await trpc.getCart({ userId, sessionId });
        const mappedItems = cartData.map((item: { productId: number; id: number; product?: { name?: string; price?: string; image?: string }; quantity: number }) => ({
          id: item.productId,
          cartItemId: item.id,
          name: item.product?.name || "",
          price: parseFloat(item.product?.price || "0"),
          image: item.product?.image || "",
          quantity: item.quantity,
        }));
      setItems(mappedItems);
    } catch (error: unknown) {
      if (isNetworkError(error)) {
        if (!hasWarnedBackendUnavailable.current) {
          console.warn("Cart is unavailable because the backend API is not reachable.");
          hasWarnedBackendUnavailable.current = true;
        }
      } else {
        console.error("Error fetching cart:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user, sessionId]);

  const addItem = async (item: Omit<CartItem, "quantity" | "cartItemId">) => {
    if (!user) {
      throw new Error("You cannot add product without login. You need to login first.");
    }
    try {
      const userId = user.id;
      await trpc.addToCart({
        userId,
        sessionId,
        productId: item.id,
        quantity: 1,
      });
      await fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await trpc.removeFromCart({ id: cartItemId });
      await fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    // Save previous state so we can revert if the backend call fails
    const previousItems = items;
    try {
      // Ensure quantity is at least 1
      const newQty = Math.max(1, quantity);
      // FIX: Optimistically update UI without re-fetching from the backend.
      // Previously, fetchCart() was called after the update which overwrote
      // the optimistic state with data in a potentially different order
      // (PostgreSQL returns rows in arbitrary order without ORDER BY).
      // Now we trust the optimistic update and only sync the new quantity
      // to the backend. The order in the items array is preserved.
      setItems(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item));
      // Sync with backend (no fetchCart() afterward to avoid overwriting order)
      await trpc.updateCartItem({ id: cartItemId, quantity: newQty });
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      // Revert optimistic update on failure so the UI stays accurate
      setItems(previousItems);
    }
  };


  const clearCart = async () => {
    try {
      const userId = user?.id || undefined;
      await trpc.clearCart({ userId, sessionId });
      await fetchCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const totalItems = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isLoading,
      requiresLogin: !user,
      // Coupon related
      couponCode,
      discountRate,
      applyCoupon,
      removeCoupon,
    }),
    [items, totalItems, isLoading, user, sessionId, couponCode, discountRate]
  );

  // Cleanup any pending timers and pending quantities when the provider unmounts
  useEffect(() => {
    return () => {
      Object.values(updateTimers.current).forEach(timer => clearTimeout(timer));
      // Clear any pending quantity refs
      pendingQuantities.current = {};
    };
  }, []);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
