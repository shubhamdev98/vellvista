"use client";

import { useState } from "react";

import { useWishlist } from "../../context/WishlistProvider";
import { useCart } from "../../context/CartProvider";
import { ShoppingCart, Trash2, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "../utils/image";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlist();
  const { addItem } = useCart();
  const [addingProductIds, setAddingProductIds] = useState<Record<number, boolean>>({});

  const handleAddToCart = async (product: { id: number; name: string; price: string; image: string }) => {
    setAddingProductIds(prev => ({ ...prev, [product.id]: true }));
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setAddingProductIds(prev => ({ ...prev, [product.id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-color-5 py-12 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-9 bg-surface-alt rounded w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-color-5 p-4 border border-color-1 space-y-4">
                <div className="w-full h-64 bg-surface-alt" />
                <div className="h-5 bg-surface-alt rounded w-3/4" />
                <div className="h-4 bg-surface-alt rounded w-1/2" />
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-surface-alt rounded w-1/4" />
                  <div className="h-8 bg-surface-alt rounded-full w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-color-5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-color-1 mb-8">My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-color-1 mx-auto mb-4" />
            <h2 className="text-xl text-color-1 mb-2">Your wishlist is empty</h2>
            <p className="text-color-1 mb-6">Save items you love by clicking the heart icon</p>
            <Link
              href="/#products"
              className="inline-block bg-color-1 text-color-4 px-6 py-3 hover:bg-color-4 hover:text-color-1 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-color-5 p-4 border border-color-1">
                <div className="relative">
                  <div className="relative w-full h-64 mb-4">
                    <Image
                      src={getImageUrl(item.product.image)}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFromWishlist(item.product.id)}
                    className="absolute top-2 right-2 bg-color-2 text-color-1 p-2 rounded-full hover:bg-color-1 hover:text-color-4 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-color-1 mb-1">{item.product.name}</h3>
                <p className="text-sm text-color-1 mb-2">{item.product.brand}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-color-1">${item.product.price}</span>
                  <button
                    onClick={() => handleAddToCart(item.product)}
                    disabled={addingProductIds[item.product.id]}
                    className="bg-color-1 text-color-4 p-2 rounded hover:bg-color-4 hover:text-color-1 transition-colors duration-75 flex items-center justify-center disabled:opacity-50"
                    aria-label="Add to cart"
                  >
                    {addingProductIds[item.product.id] ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
