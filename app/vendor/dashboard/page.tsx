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
  Trash2,
  Clock,
  ExternalLink,
  BarChart3,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle
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
  const [isUploading, setIsUploading] = useState(false);

  const handleVendorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const response = await fetch(`${backendUrl}/api/upload-product-image`, {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          setProductForm((prev) => ({ ...prev, image: result.url }));
          showToast('Local image uploaded successfully!', 'success');
          return;
        }
      }
      throw new Error('Upload failed');
    } catch (err) {
      console.warn('Server upload failed, converting file locally via FileReader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProductForm((prev) => ({ ...prev, image: event.target!.result as string }));
          showToast('Local image loaded successfully!', 'success');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

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
      <div className="min-h-screen bg-background-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-surface border border-default p-8">
          <AlertCircle className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-xl font-semibold text-primary">Authentication Required</h2>
          <p className="text-secondary text-sm">Please sign in to access your vendor dashboard.</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2.5 bg-primary hover:bg-primary-light text-inverse font-light tracking-wide text-sm transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-muted flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-light text-sm">Loading Vendor Portal...</span>
        </div>
      </div>
    );
  }

  if (!vendorProfile) {
    return (
      <div className="min-h-screen bg-background-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-surface border border-default p-8">
          <Store className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-2xl font-semibold text-primary">No Active Vendor Store</h2>
          <p className="text-secondary text-sm">
            You currently do not have an approved vendor store on VellVista. Apply today to start selling across multiple categories!
          </p>
          <Link
            href="/vendor/apply"
            className="inline-block w-full py-3 bg-primary hover:bg-primary-light text-inverse font-light tracking-wide text-sm transition-all"
          >
            Apply for Vendor Account
          </Link>
        </div>
      </div>
    );
  }

  if (vendorProfile.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-background-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-surface border border-default p-8">
          <Clock className="w-12 h-12 text-warning mx-auto" />
          <h2 className="text-xl font-semibold text-primary">Application Under Review</h2>
          <p className="text-secondary text-sm">
            Your vendor application for <span className="font-semibold text-primary">{vendorProfile.storeName}</span> is pending admin review. You will receive full access once approved.
          </p>
        </div>
      </div>
    );
  }

  if (vendorProfile.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-background-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-surface border border-error/50 p-8">
          <ShieldAlert className="w-12 h-12 text-error mx-auto" />
          <h2 className="text-xl font-semibold text-error">Vendor Account Suspended</h2>
          <p className="text-secondary text-sm">
            Your vendor store <span className="font-semibold text-primary">{vendorProfile.storeName}</span> is currently suspended. Please contact platform administration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-muted py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Vendor Banner Header */}
        <div className="relative overflow-hidden bg-surface border border-default p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src={vendorProfile.logo || 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png'}
                alt={vendorProfile.storeName}
                className="w-16 h-16 object-cover border border-default bg-background-alt"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-primary">{vendorProfile.storeName}</h1>
                  <span className="px-2.5 py-0.5 rounded-none bg-success-light text-success-dark text-[10px] font-medium uppercase tracking-wider border border-success/20">
                    {vendorProfile.status}
                  </span>
                </div>
                <p className="text-secondary text-xs mt-1">
                  Owner: {vendorProfile.ownerName} • Rating: ★ {vendorProfile.rating || '5.0'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/store/${vendorProfile.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-background-alt hover:bg-surface text-secondary hover:text-primary text-xs font-light border border-default transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Public Storefront
              </Link>
              <button
                onClick={() => setShowProductModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-light text-inverse font-light text-xs transition-all"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-default pb-3 overflow-x-auto">
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
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-light whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-inverse border border-primary'
                    : 'bg-surface text-secondary hover:text-primary hover:bg-background-alt border border-default'
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
              <div className="p-6 bg-surface border border-default space-y-2">
                <div className="flex items-center justify-between text-secondary text-xs font-medium">
                  <span>Gross Vendor Sales</span>
                  <DollarSign className="w-4 h-4 text-success-dark" />
                </div>
                <p className="text-2xl font-semibold text-primary">${analytics.grossSales}</p>
                <p className="text-[11px] text-muted">Total processed revenue</p>
              </div>

              <div className="p-6 bg-surface border border-default space-y-2">
                <div className="flex items-center justify-between text-secondary text-xs font-medium">
                  <span>Net Earnings</span>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-semibold text-primary">${analytics.netEarnings}</p>
                <p className="text-[11px] text-muted">After 10% platform commission</p>
              </div>

              <div className="p-6 bg-surface border border-default space-y-2">
                <div className="flex items-center justify-between text-secondary text-xs font-medium">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-info-dark" />
                </div>
                <p className="text-2xl font-semibold text-primary">{analytics.totalOrders}</p>
                <p className="text-[11px] text-muted">{analytics.pendingOrders} pending fulfillment</p>
              </div>

              <div className="p-6 bg-surface border border-default space-y-2">
                <div className="flex items-center justify-between text-secondary text-xs font-medium">
                  <span>Active Products</span>
                  <Package className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-2xl font-semibold text-primary">{analytics.totalProducts}</p>
                <p className="text-[11px] text-muted">Listed across marketplace</p>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-surface border border-default p-6 space-y-4">
              <h3 className="text-base font-semibold text-primary flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Recent Vendor Orders
              </h3>

              {ordersList.length === 0 ? (
                <p className="text-muted text-xs py-4 text-center">No orders received yet.</p>
              ) : (
                <div className="divide-y divide-light">
                  {ordersList.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-primary">Sub-Order #{ord.id}</p>
                        <p className="text-muted">{ord.customerName} ({ord.customerEmail})</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">${ord.subtotal}</p>
                        <span className="px-2 py-0.5 text-[10px] font-medium uppercase bg-background-alt text-secondary border border-default">
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
              <h3 className="text-lg font-semibold text-primary">Vendor Product Catalog</h3>
              <button
                onClick={() => setShowProductModal(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-light text-inverse font-light text-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsList.map((prod) => (
                <div key={prod.id} className="bg-surface border border-default hover:border-dark transition-all p-4 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-44 object-cover bg-background-alt border border-light"
                    />
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-medium uppercase bg-background-alt text-secondary border border-default inline-block">
                        {prod.category}
                      </span>
                      <h4 className="text-base font-semibold text-primary mt-1 line-clamp-1">{prod.name}</h4>
                      <p className="text-xs text-muted">{prod.brand}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-light">
                      <span className="font-semibold text-primary text-base">${prod.price}</span>
                      <span className="text-secondary">Stock: {prod.stock}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-light flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-2 rounded bg-error-light hover:bg-error/20 text-error-dark text-xs font-medium flex items-center gap-1 transition-colors"
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
            <h3 className="text-lg font-semibold text-primary">Manage Customer Orders</h3>
            <div className="space-y-4">
              {ordersList.length === 0 ? (
                <div className="p-8 text-center bg-surface border border-default text-muted text-sm">
                  No orders found.
                </div>
              ) : (
                ordersList.map((ord) => (
                  <div key={ord.id} className="p-6 bg-surface border border-default space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary text-base">Sub-Order #{ord.id}</span>
                          <span className="text-xs text-muted">(Parent Order #{ord.parentOrderId})</span>
                        </div>
                        <p className="text-xs text-secondary mt-1">Customer: {ord.customerName} ({ord.customerEmail})</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary text-lg">${ord.subtotal}</span>
                        <div className="flex items-center gap-1">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-surface border border-default text-xs font-medium text-primary px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary uppercase cursor-pointer"
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

                    <div className="text-xs text-secondary space-y-1">
                      <p><span className="font-medium text-primary">Shipping Address:</span> {ord.shippingAddress}</p>
                      <p><span className="font-medium text-primary">Commission (10%):</span> ${ord.commissionAmount} | <span className="font-semibold text-success-dark">Net Vendor Earnings: ${ord.vendorEarnings}</span></p>
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
            <h3 className="text-lg font-semibold text-primary">Financial Breakdown & Payouts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-surface border border-default space-y-2">
                <span className="text-xs font-medium text-secondary block">Gross Sales</span>
                <p className="text-2xl font-semibold text-primary">${analytics.grossSales}</p>
              </div>

              <div className="p-6 bg-surface border border-default space-y-2">
                <span className="text-xs font-medium text-secondary block">Platform Commission (10%)</span>
                <p className="text-2xl font-semibold text-error">-${analytics.commissionPaid}</p>
              </div>

              <div className="p-6 bg-surface border border-default space-y-2">
                <span className="text-xs font-medium text-secondary block">Net Take-Home Earnings</span>
                <p className="text-2xl font-semibold text-success-dark">${analytics.netEarnings}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-surface border border-default p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-light pb-4">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Add New Marketplace Product
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-muted hover:text-primary text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-light text-secondary mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Velvet Botanical Serum"
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-secondary mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chanel / Luxe Beauty"
                    value={productForm.brand}
                    onChange={(e) => setProductForm((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-secondary mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="89.99"
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-secondary mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="fragrance">Perfumes & Fragrance</option>
                    <option value="skincare">Skincare</option>
                    <option value="cosmetics">Cosmetics & Makeup</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="electronics">Electronics & Audio</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-light text-secondary mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2 border-t border-light pt-3">
                  <label className="block text-xs font-light text-secondary mb-1">Product Image *</label>
                  
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-inverse font-light text-xs transition-colors select-none">
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {isUploading ? "Uploading..." : "Upload Image from Device"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVendorImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-muted">or enter image URL below</span>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="https://... or upload local image above"
                    value={productForm.image}
                    onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />

                  {productForm.image && (
                    <div className="flex items-center gap-3 p-2.5 bg-background-alt border border-light">
                      <img
                        src={productForm.image}
                        alt="Product Preview"
                        className="h-12 w-12 object-cover border border-default shrink-0"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <div className="text-xs text-secondary overflow-hidden flex-1 min-w-0">
                        <p className="font-semibold text-primary truncate flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" /> Image Selected
                        </p>
                        <p className="truncate text-[11px] text-muted mt-0.5">{productForm.image.startsWith('data:') ? 'Local file uploaded' : productForm.image}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductForm((p) => ({ ...p, image: '' }))}
                        className="text-xs text-error hover:underline shrink-0 font-medium px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-light text-secondary mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed product specification and features..."
                  value={productForm.description}
                  onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 bg-surface border border-dark text-secondary hover:bg-background-alt text-xs font-light transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-light text-inverse text-xs font-light tracking-wide transition-all"
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
