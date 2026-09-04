'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  BarChart3,
  Layers,
  Settings,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'financials'>('overview');
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    price: '',
    originalPrice: '',
    category: 'fragrance',
    stock: 10,
    image: '',
    description: '',
    shortDescription: '',
    sku: '',
    specifications: '',
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const fetchVendorData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Fetch Vendor Profile
      const vRes = await fetch(`${backendUrl}/trpc/getVendorProfile?input=${encodeURIComponent(JSON.stringify({ userId: user.id }))}`);
      const vData = await vRes.json();
      const vProfile = vData.result?.data;

      if (!vProfile) {
        setVendorProfile(null);
        setIsLoading(false);
        return;
      }
      setVendorProfile(vProfile);

      // 2. Fetch Analytics
      const aRes = await fetch(`${backendUrl}/trpc/vendorGetAnalytics?input=${encodeURIComponent(JSON.stringify({ vendorId: vProfile.id }))}`);
      const aData = await aRes.json();
      setAnalytics(aData.result?.data);

      // 3. Fetch Products
      const pRes = await fetch(`${backendUrl}/trpc/vendorGetProducts?input=${encodeURIComponent(JSON.stringify({ vendorId: vProfile.id }))}`);
      const pData = await pRes.json();
      setProductsList(pData.result?.data?.products || []);

      // 4. Fetch Orders
      const oRes = await fetch(`${backendUrl}/trpc/vendorGetOrders?input=${encodeURIComponent(JSON.stringify({ vendorId: vProfile.id }))}`);
      const oData = await oRes.json();
      setOrdersList(oData.result?.data || []);

      // 5. Fetch Categories
      const cRes = await fetch(`${backendUrl}/trpc/getCategories`);
      const cData = await cRes.json();
      setCategoriesList(cData.result?.data || []);
    } catch (err: any) {
      console.error('Failed to fetch vendor data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, backendUrl]);

  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorProfile) return;

    try {
      const res = await fetch(`${backendUrl}/trpc/vendorCreateProduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendorProfile.id,
          ...productForm,
        }),
      });

      const data = await res.json();
      if (data.result?.data?.success) {
        showToast('Product created successfully!', 'success');
        setShowProductModal(false);
        setProductForm({
          name: '',
          brand: '',
          price: '',
          originalPrice: '',
          category: 'fragrance',
          stock: 10,
          image: '',
          description: '',
          shortDescription: '',
          sku: '',
          specifications: '',
        });
        fetchVendorData();
      } else {
        showToast(data.error?.message || 'Failed to create product', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (vendorOrderId: number, status: string) => {
    if (!vendorProfile) return;
    try {
      const res = await fetch(`${backendUrl}/trpc/vendorUpdateOrderStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendorProfile.id,
          vendorOrderId,
          status,
        }),
      });

      const data = await res.json();
      if (data.result?.data?.success) {
        showToast(`Order updated to ${status}`, 'success');
        fetchVendorData();
      } else {
        showToast(data.error?.message || 'Failed to update order', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating order', 'error');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!vendorProfile || !confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${backendUrl}/trpc/vendorDeleteProduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendorProfile.id,
          id: productId,
        }),
      });

      const data = await res.json();
      if (data.result?.data?.success) {
        showToast('Product deleted', 'warning');
        fetchVendorData();
      }
    } catch (err: any) {
      showToast('Error deleting product', 'error');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold">Authentication Required</h2>
          <p className="text-slate-400 text-sm">Please sign in to access your vendor dashboard.</p>
          <Link href="/auth" className="inline-block px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-400">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-sm">Loading Vendor Portal...</span>
        </div>
      </div>
    );
  }

  if (!vendorProfile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <Store className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-black text-white">No Active Vendor Store</h2>
          <p className="text-slate-400 text-sm">
            You currently do not have an approved vendor store on VellVista. Apply today to start selling across multiple categories!
          </p>
          <Link
            href="/vendor/apply"
            className="inline-block w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
          >
            Apply for Vendor Account
          </Link>
        </div>
      </div>
    );
  }

  if (vendorProfile.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <Clock className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Application Under Review</h2>
          <p className="text-slate-400 text-sm">
            Your vendor application for **{vendorProfile.storeName}** is pending admin review. You will receive full access once approved.
          </p>
        </div>
      </div>
    );
  }

  if (vendorProfile.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-900 border border-rose-500/40 p-8 rounded-3xl">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-rose-400">Vendor Account Suspended</h2>
          <p className="text-slate-400 text-sm">
            Your vendor store **{vendorProfile.storeName}** is currently suspended. Please contact platform administration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Vendor Banner Header */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src={vendorProfile.logo || 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png'}
                alt={vendorProfile.storeName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-700 bg-slate-950"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{vendorProfile.storeName}</h1>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    {vendorProfile.status}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Owner: {vendorProfile.ownerName} • Rating: ★ {vendorProfile.rating || '5.0'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/store/${vendorProfile.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Public Storefront
              </Link>
              <button
                onClick={() => setShowProductModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Sales', icon: BarChart3 },
            { id: 'products', label: `Products (${productsList.length})`, icon: Package },
            { id: 'orders', label: `Vendor Orders (${ordersList.length})`, icon: ShoppingBag },
            { id: 'financials', label: 'Earnings & Payouts', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Gross Vendor Sales</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-white">${analytics.grossSales}</p>
                <p className="text-[10px] text-slate-400">Total processed revenue</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Net Earnings</span>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-amber-400">${analytics.netEarnings}</p>
                <p className="text-[10px] text-slate-400">After 10% platform commission</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-black text-white">{analytics.totalOrders}</p>
                <p className="text-[10px] text-slate-400">{analytics.pendingOrders} pending fulfillment</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Active Products</span>
                  <Package className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-white">{analytics.totalProducts}</p>
                <p className="text-[10px] text-slate-400">Listed across marketplace</p>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Recent Vendor Orders
              </h3>

              {ordersList.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No orders received yet.</p>
              ) : (
                <div className="divide-y divide-slate-800">
                  {ordersList.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold text-white">Sub-Order #{ord.id}</p>
                        <p className="text-slate-400">{ord.customerName} ({ord.customerEmail})</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-amber-400">${ord.subtotal}</p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Vendor Product Catalog</h3>
              <button
                onClick={() => setShowProductModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsList.map((prod) => (
                <div key={prod.id} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden space-y-4 p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-44 object-cover rounded-xl bg-slate-950 border border-slate-800"
                    />
                    <div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-[10px] font-bold uppercase">
                        {prod.category}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1 line-clamp-1">{prod.name}</h4>
                      <p className="text-xs text-slate-400">{prod.brand}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <span className="font-extrabold text-amber-400 text-base">${prod.price}</span>
                      <span className="text-slate-400">Stock: {prod.stock}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VENDOR ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Manage Customer Orders</h3>
            <div className="space-y-4">
              {ordersList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
                  No orders found.
                </div>
              ) : (
                ordersList.map((ord) => (
                  <div key={ord.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-base">Sub-Order #{ord.id}</span>
                          <span className="text-xs text-slate-400">(Parent Order #{ord.parentOrderId})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Customer: {ord.customerName} ({ord.customerEmail})</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-amber-400 text-lg">${ord.subtotal}</span>
                        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none uppercase"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p><span className="font-semibold text-slate-300">Shipping Address:</span> {ord.shippingAddress}</p>
                      <p><span className="font-semibold text-slate-300">Commission (10%):</span> ${ord.commissionAmount} | <span className="font-semibold text-emerald-400">Net Vendor Earnings: ${ord.vendorEarnings}</span></p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: FINANCIALS & EARNINGS */}
        {activeTab === 'financials' && analytics && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Financial Breakdown & Payouts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">Gross Sales</span>
                <p className="text-2xl font-black text-white">${analytics.grossSales}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">Platform Commission (10%)</span>
                <p className="text-2xl font-black text-rose-400">-${analytics.commissionPaid}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">Net Take-Home Earnings</span>
                <p className="text-2xl font-black text-emerald-400">${analytics.netEarnings}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Add New Marketplace Product
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Velvet Botanical Serum"
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chanel / Luxe Beauty"
                    value={productForm.brand}
                    onChange={(e) => setProductForm((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="89.99"
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="fragrance">Perfumes & Fragrance</option>
                    <option value="skincare">Skincare</option>
                    <option value="cosmetics">Cosmetics & Makeup</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="electronics">Electronics & Audio</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Product Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={productForm.image}
                    onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed product specification and features..."
                  value={productForm.description}
                  onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
