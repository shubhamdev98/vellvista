'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Store,
  Star,
  MapPin,
  Mail,
  Phone,
  Package,
  Search,
  ShoppingCart,
  Heart,
  CheckCircle2,
  Globe,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartProvider';
import { useWishlist } from '@/context/WishlistProvider';
import { useToast } from '@/context/ToastProvider';

export default function VendorStorefrontPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { addItem } = useCart();
  const { addToWishlist } = useWishlist();
  const { showToast } = useToast();

  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!slug) return;
    async function loadStorefront() {
      setLoading(true);
      try {
        // Fetch Vendor Profile
        const vRes = await fetch(`${backendUrl}/trpc/getVendorBySlug?input=${encodeURIComponent(JSON.stringify({ slug }))}`);
        const vData = await vRes.json();
        const vendorObj = vData.result?.data;

        if (!vendorObj) {
          setVendor(null);
          setLoading(false);
          return;
        }
        setVendor(vendorObj);

        // Fetch Vendor Products
        const pRes = await fetch(`${backendUrl}/trpc/getVendorProductsBySlug?input=${encodeURIComponent(JSON.stringify({ slug, limit: 50 }))}`);
        const pData = await pRes.json();
        setProducts(pData.result?.data?.products || []);
      } catch (err: any) {
        console.error('Error fetching storefront:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStorefront();
  }, [slug, backendUrl]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-400 font-semibold text-sm">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading Vendor Storefront...</span>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Store className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Storefront Not Found</h2>
          <p className="text-slate-400 text-sm">The vendor store &quot;{slug}&quot; does not exist or has been removed.</p>
          <Link href="/products" className="inline-block px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">
            Browse All Marketplace Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Vendor Banner & Branding Header */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          {/* Banner Image */}
          <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-slate-950">
            <img
              src={vendor.banner || 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626156/vellvista/product/hzbpvaobukfgznudrw7x.jpg'}
              alt={vendor.storeName}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          </div>

          {/* Store Info Card */}
          <div className="p-6 sm:p-8 -mt-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-5">
              <img
                src={vendor.logo || 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png'}
                alt={vendor.storeName}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-900 bg-slate-950 shadow-xl"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-black text-white">{vendor.storeName}</h1>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-slate-300 text-sm max-w-xl line-clamp-2">{vendor.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {vendor.rating || '5.0'} Rating
                  </span>
                  <span>•</span>
                  <span>{vendor.productsCount || products.length} Products</span>
                  {vendor.address && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {vendor.address}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => showToast(`Subscribed to ${vendor.storeName} updates!`, 'warning')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Follow Store
              </button>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search store products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
              No products found in this store matching &quot;{searchTerm}&quot;.
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xl"
              >
                <div className="relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 bg-slate-950"
                  />
                  <button
                    onClick={() => addToWishlist(p.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 hover:bg-slate-950 text-slate-200 hover:text-rose-400 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{p.category}</span>
                    <h3 className="text-base font-bold text-white line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-slate-400">{p.brand}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-white">${p.price}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-slate-500 line-through ml-2">${p.originalPrice}</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        addItem({
                          id: p.id,
                          name: p.name,
                          price: Number(p.price),
                          image: p.image,
                        });
                        showToast(`Added ${p.name} to cart!`, 'success');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
