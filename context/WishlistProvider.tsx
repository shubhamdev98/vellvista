"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const addToWishlist = async (productId: number) => {
    try {
      if (!user) {
        showToast('Please login to add items to wishlist', 'warning');
        return;
      }

      const result = await trpc.addToWishlist({
        userId: user.id,
        productId
      });

      if (result.success) {
        await fetchWishlist();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast('Failed to add to wishlist', 'error');
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      if (!user) return;

      await trpc.removeFromWishlist({
        userId: user.id,
        productId
      });

      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const fetchWishlist = async () => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.product.id === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const value: WishlistContextType = {
    wishlistItems,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    isLoading
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
