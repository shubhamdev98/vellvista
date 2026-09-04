"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { trpc } from '../app/utils/trpc';
import { useToast } from './ToastProvider';
import { useAuth } from './AuthProvider';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    brand: string;
    price: string;
    image: string;
    description?: string;
    rating?: string;
    reviews?: number;
  };
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    try {
      if (!user) {
        setWishlistItems([]);
        return;
      }

      setIsLoading(true);
      const items = await trpc.getWishlist({ userId: user.id });
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addToWishlist = useCallback(async (productId: number) => {
    if (!user) {
      showToast('Please login to add items to wishlist', 'warning');
      return;
    }

    // Optimistically add item to local state instantly
    const tempId = -Date.now();
    const tempItem: WishlistItem = {
      id: tempId,
      product: {
        id: productId,
        name: '',
        brand: '',
        price: '0',
        image: '',
      }
    };
    setWishlistItems(prev => {
      if (prev.some(item => item.product.id === productId)) return prev;
      return [...prev, tempItem];
    });

    try {
      const result = await trpc.addToWishlist({
        userId: user.id,
        productId
      });

      if (result.success) {
        await fetchWishlist();
      } else {
        showToast(result.message, 'error');
        // Rollback
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast('Failed to add to wishlist', 'error');
      // Rollback
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
    }
  }, [user, fetchWishlist, showToast]);

  const removeFromWishlist = useCallback(async (productId: number) => {
    if (!user) return;

    // Optimistically remove item from local state instantly
    let previousItems: WishlistItem[] = [];
    setWishlistItems(prev => {
      previousItems = prev;
      return prev.filter(item => item.product.id !== productId);
    });

    try {
      await trpc.removeFromWishlist({
        userId: user.id,
        productId
      });
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('Failed to remove from wishlist', 'error');
      // Rollback
      if (previousItems.length > 0) {
        setWishlistItems(previousItems);
      } else {
        await fetchWishlist();
      }
    }
  }, [user, fetchWishlist, showToast]);

  const isInWishlist = useCallback((productId: number) => {
    return wishlistItems.some(item => item.product.id === productId);
  }, [wishlistItems]);

  useEffect(() => {
    fetchWishlist();
  }, [user, fetchWishlist]);

  const value: WishlistContextType = useMemo(() => ({
    wishlistItems,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    isLoading
  }), [wishlistItems, isInWishlist, addToWishlist, removeFromWishlist, isLoading]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
