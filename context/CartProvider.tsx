"use client";

import { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef, type ReactNode } from "react";
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


  const applyCoupon = useCallback((code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === 'SAVE10') {
      setCouponCode(trimmed);
      setDiscountRate(0.1);
    } else {
      setCouponCode('');
      setDiscountRate(0);
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponCode('');
    setDiscountRate(0);
  }, []);
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
      if (typeof window !== 'undefined') {
        const newSid = Date.now().toString();
        localStorage.setItem("cartSessionId", newSid);
        setSessionId(newSid);
      }
    }
  }, [user]);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const userId = user.id;
    try {
      setIsLoading(true);
      const cartData = await trpc.getCart({ userId, sessionId: sessionId || undefined });
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
  }, [user, sessionId]);

  useEffect(() => {
    fetchCart();
  }, [user, sessionId, fetchCart]);

  const addItem = useCallback(async (item: Omit<CartItem, "quantity" | "cartItemId">) => {
    if (!user) {
      throw new Error("You cannot add product without login. You need to login first.");
    }
    
    const tempCartItemId = -Date.now();
    let previousItems: CartItem[] = [];
    
    setItems(prev => {
      previousItems = prev;
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex > -1) {
        return prev.map((i, idx) => 
          idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [
          ...prev,
          {
            id: item.id,
            cartItemId: tempCartItemId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
          },
        ];
      }
    });
    
    try {
      const userId = user.id;
      const res = await trpc.addToCart({
        userId,
        sessionId,
        productId: item.id,
        quantity: 1,
      });
      
      if (res && res.cartItemId) {
        setItems(prev =>
          prev.map(i => (i.cartItemId === tempCartItemId ? { ...i, cartItemId: res.cartItemId } : i))
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setItems(previousItems);
      throw error;
    }
  }, [user, sessionId]);

  const removeItem = useCallback(async (cartItemId: number) => {
    let previousItems: CartItem[] = [];
    setItems(prev => {
      previousItems = prev;
      return prev.filter(item => item.cartItemId !== cartItemId);
    });
    try {
      await trpc.removeFromCart({ id: cartItemId });
    } catch (error) {
      console.error("Error removing from cart:", error);
      setItems(previousItems);
    }
  }, []);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    let previousItems: CartItem[] = [];
    const newQty = Math.max(1, quantity);
    setItems(prev => {
      previousItems = prev;
      return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item);
    });
    try {
      await trpc.updateCartItem({ id: cartItemId, quantity: newQty });
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      setItems(previousItems);
    }
  }, []);

  const clearCart = useCallback(async () => {
    let previousItems: CartItem[] = [];
    setItems(prev => {
      previousItems = prev;
      return [];
    });
    try {
      const userId = user?.id || undefined;
      await trpc.clearCart({ userId, sessionId });
    } catch (error) {
      console.error("Error clearing cart:", error);
      setItems(previousItems);
    }
  }, [user?.id, sessionId]);

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
      couponCode,
      discountRate,
      applyCoupon,
      removeCoupon,
    }),
    [items, totalItems, isLoading, user, couponCode, discountRate, addItem, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon]
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
