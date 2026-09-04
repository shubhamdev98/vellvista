"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthProvider";
import { useToast } from "../../../context/ToastProvider";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Percent,
  Store,
  Save,
  Search,
  ExternalLink,
  Loader2,
  Eye,
  Package,
  X,
  Tag,
  Filter
} from "lucide-react";

export default function AdminVendorsPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [analytics, setAnalytics] = useState<any>(null);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [commissionRate, setCommissionRate] = useState('10.00');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

  // Vendor Catalog Modal State
  const [selectedVendorForCatalog, setSelectedVendorForCatalog] = useState<any | null>(null);
  const [vendorProducts, setVendorProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('all');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://172.29.214.47:3001';

  const fetchAdminMarketplaceData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Marketplace Analytics
      const aRes = await fetch(`${backendUrl}/trpc/adminGetMarketplaceAnalytics`);
      const aData = await aRes.json();
      const analyticsData = aData.result?.data;
      if (analyticsData) {
        setAnalytics(analyticsData);
        setCommissionRate(analyticsData.commissionRate || '10.00');
      }

      // 2. Fetch All Vendors
      const vRes = await fetch(`${backendUrl}/trpc/adminGetVendors`);
      const vData = await vRes.json();
      setVendorsList(vData.result?.data || []);
    } catch (err: any) {
      console.error('Error loading admin vendors:', err);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchAdminMarketplaceData();
  }, [fetchAdminMarketplaceData]);

  const handleViewVendorCatalog = async (vendor: any) => {
    setSelectedVendorForCatalog(vendor);
    setIsLoadingProducts(true);
    setCatalogCategoryFilter('all');
    try {
      const res = await fetch(`${backendUrl}/trpc/vendorGetProducts?input=${encodeURIComponent(JSON.stringify({ vendorId: vendor.id }))}`);
      const data = await res.json();
      setVendorProducts(data.result?.data?.products || []);
    } catch (err: any) {
      console.error('Error fetching vendor products:', err);
      showToast('Failed to load vendor products', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleApproveVendor = async (vendorId: number) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${backendUrl}/trpc/adminApproveVendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser.id, vendorId }),
      });
      const data = await res.json();
      if (data.result?.data?.success) {
        showToast('Vendor store approved successfully!', 'success');
        fetchAdminMarketplaceData();
      }
    } catch (err: any) {
      showToast('Failed to approve vendor store', 'error');
    }
  };

  const handleRejectVendor = async (vendorId: number) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${backendUrl}/trpc/adminRejectVendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser.id, vendorId }),
      });
      const data = await res.json();
      if (data.result?.data?.success) {
        showToast('Vendor application rejected', 'warning');
        fetchAdminMarketplaceData();
      }
    } catch (err: any) {
      showToast('Failed to reject vendor application', 'error');
    }
  };

  const handleSuspendVendor = async (vendorId: number, currentStatus: string) => {
    if (!currentUser) return;
    const isSuspended = currentStatus === 'SUSPENDED';
    try {
      const res = await fetch(`${backendUrl}/trpc/adminSuspendVendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser.id, vendorId, suspend: !isSuspended }),
      });
      const data = await res.json();
      if (data.result?.data?.success) {
        showToast(`Vendor ${!isSuspended ? 'suspended' : 'reactivated'}`, 'warning');
        fetchAdminMarketplaceData();
      }
    } catch (err: any) {
      showToast('Failed to update vendor status', 'error');
    }
  };

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsUpdatingCommission(true);
    try {
      const res = await fetch(`${backendUrl}/trpc/adminUpdateCommissionRate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser.id, rate: commissionRate }),
      });
      const data = await res.json();
      if (data.result?.data?.success) {
        showToast(`Platform commission rate updated to ${commissionRate}%`, 'success');
        fetchAdminMarketplaceData();
      }
    } catch (err: any) {
      showToast('Failed to update commission rate', 'error');
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  const filteredVendors = vendorsList.filter((v) => {
    const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;
    const matchesSearch =
      v.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredCatalogProducts = vendorProducts.filter((p) => {
    return catalogCategoryFilter === 'all' || (p.category || '').toLowerCase() === catalogCategoryFilter.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 bg-surface-alt rounded w-48" />
        <div className="h-4 bg-surface-alt rounded w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface border border-light p-6" />
          ))}
        </div>
        <div className="h-96 bg-surface border border-light rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-inter">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">
          Vendors & Marketplace Configuration
        </h2>
        <p className="text-secondary text-sm">
          Approve seller applications, configure platform commissions, and inspect seller product catalogs across categories.
        </p>
      </div>

      {/* Stats Grid - Matching Brand/Dashboard standard design */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
                Gross Marketplace Value
              </span>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
            </div>
            <span className="text-xl sm:text-2xl font-semibold text-primary block truncate">
              ${analytics.totalGMV}
            </span>
          </div>

          <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
                Platform Revenue
              </span>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
            </div>
            <span className="text-xl sm:text-2xl font-semibold text-primary block truncate">
              ${analytics.platformCommissionRevenue}
            </span>
          </div>

          <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
                Active Vendors
              </span>
              <Store className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
            </div>
            <span className="text-xl sm:text-2xl font-semibold text-primary block truncate">
              {analytics.totalVendors}
            </span>
          </div>

          <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
                Default Commission
              </span>
              <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
            </div>
            <span className="text-xl sm:text-2xl font-semibold text-primary block truncate">
              {analytics.commissionRate}%
            </span>
          </div>
        </div>
      )}

      {/* Main Settings Grid: Commission Settings Form + Marketplace Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Global Commission Configuration Form */}
        <form onSubmit={handleUpdateCommission} className="lg:col-span-7 bg-surface border border-light p-6 space-y-6 shadow-sm">
          <h3 className="font-semibold text-lg border-b border-light pb-2 font-manrope">
            Platform Commission Settings
          </h3>

          <div className="space-y-1.5">
            <label htmlFor="commissionRate" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
              Default Platform Commission Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                id="commissionRate"
                step="0.01"
                required
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full border border-dark p-3 pr-10 text-sm focus:outline-none focus:border-primary bg-background text-primary font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="10.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary pointer-events-none">%</span>
            </div>
            <p className="text-[11px] text-secondary">
              Percentage retained by the platform on every processed vendor transaction before seller payout.
            </p>
          </div>

          <div className="pt-4 border-t border-light flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingCommission}
              className="bg-primary text-inverse py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-primary-light active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingCommission ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Commission Settings
            </button>
          </div>
        </form>

        {/* Live Marketplace Status Panel */}
        <div className="lg:col-span-5 bg-surface border border-light p-6 space-y-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-semibold text-lg border-b border-light pb-2 font-manrope flex items-center gap-2">
            <Eye className="h-5 w-5 text-secondary" />
            Marketplace Overview
          </h3>

          <div className="space-y-4 text-xs text-secondary leading-relaxed">
            <div className="p-4 bg-background border border-dark space-y-2">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">Pending Review</span>
              <p className="text-xl font-bold text-primary">
                {analytics?.pendingVendors || 0} Vendor Applications
              </p>
              <p className="text-[11px] text-secondary">
                Applications awaiting administrative review and store verification.
              </p>
            </div>

            <div className="p-4 bg-surface-alt border border-light space-y-1">
              <p className="font-semibold text-primary">💡 Vendor Catalog Inspection:</p>
              <p>• Click <code className="text-primary font-bold">Products Catalog</code> on any seller row to view their products category-by-category.</p>
              <p>• Multi-vendor orders automatically partition subtotals and calculate vendor net earnings server-side.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Application Management Table */}
      <div className="bg-surface border border-light p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-light pb-4">
          <div>
            <h3 className="font-semibold text-lg font-manrope text-primary">Seller Directory & Approvals</h3>
            <p className="text-xs text-secondary">Manage registered store profiles, review onboarding documents, and inspect seller product catalogs.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 bg-background border border-dark p-1">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    selectedStatus === st
                      ? 'bg-primary text-inverse'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px] w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-dark bg-background text-xs text-primary focus:outline-none focus:border-primary"
              />
              <Search className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-light text-secondary uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Store Identity</th>
                <th className="py-3 px-4">Owner & Contact</th>
                <th className="py-3 px-4">Vendor Products</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light font-inter">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-secondary">
                    No vendors found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.logo || 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png'}
                          alt={v.storeName}
                          className="w-9 h-9 border border-dark object-cover shrink-0 bg-white"
                        />
                        <div>
                          <p className="font-bold text-primary text-sm">{v.storeName}</p>
                          <a
                            href={`/store/${v.slug}`}
                            target="_blank"
                            className="text-[10px] text-secondary hover:text-primary hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            /store/{v.slug} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-primary">{v.ownerName}</p>
                      <p className="text-secondary text-[11px]">{v.email}</p>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleViewVendorCatalog(v)}
                        className="border border-dark text-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider hover:bg-surface-alt transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5 text-secondary" /> Inspect Products
                      </button>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                          v.status === 'APPROVED'
                            ? 'border-success text-success bg-emerald-50/50'
                            : v.status === 'PENDING'
                            ? 'border-warning text-warning bg-amber-50/50'
                            : 'border-error text-error bg-rose-50/50'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-primary">
                      ★ {v.rating || '5.0'}
                    </td>

                    <td className="py-4 px-4 text-secondary">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {v.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveVendor(v.id)}
                              className="bg-primary text-inverse px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-primary-light transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectVendor(v.id)}
                              className="border border-dark text-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-surface-alt transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {v.status === 'APPROVED' && (
                          <button
                            onClick={() => handleSuspendVendor(v.id, v.status)}
                            className="border border-dark text-error px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}

                        {v.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleSuspendVendor(v.id, v.status)}
                            className="bg-primary text-inverse px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-primary-light transition-colors cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VENDOR PRODUCTS CATALOG INSPECTOR MODAL */}
      {selectedVendorForCatalog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-light p-6 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedVendorForCatalog(null)}
              className="absolute top-4 right-4 text-secondary hover:text-primary cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-light pb-4">
              <img
                src={selectedVendorForCatalog.logo || 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png'}
                alt={selectedVendorForCatalog.storeName}
                className="w-10 h-10 border border-dark object-cover shrink-0"
              />
              <div>
                <h3 className="text-lg font-bold text-primary font-manrope">
                  {selectedVendorForCatalog.storeName} — Products Catalog
                </h3>
                <p className="text-xs text-secondary">
                  Owner: {selectedVendorForCatalog.ownerName} ({selectedVendorForCatalog.email}) • Slug: /store/{selectedVendorForCatalog.slug}
                </p>
              </div>
            </div>

            {/* Category Filter Tabs inside Modal */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-light">
              {[
                { id: "all", label: "All Categories" },
                { id: "fragrance", label: "Perfume" },
                { id: "skincare", label: "Skincare" },
                { id: "cosmetics", label: "Cosmetics" },
                { id: "fashion", label: "Fashion" },
                { id: "electronics", label: "Electronics" },
                { id: "accessories", label: "Accessories" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCatalogCategoryFilter(cat.id)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm whitespace-nowrap cursor-pointer ${
                    catalogCategoryFilter === cat.id
                      ? "bg-primary text-inverse"
                      : "bg-surface-alt text-secondary hover:text-primary border border-light"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Products Grid / Table */}
            {isLoadingProducts ? (
              <div className="p-8 text-center text-secondary text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Loading vendor catalog...
              </div>
            ) : filteredCatalogProducts.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-light text-secondary text-xs">
                No products found in this vendor store under category &quot;{catalogCategoryFilter}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredCatalogProducts.map((prod) => (
                  <div key={prod.id} className="border border-light p-4 bg-background space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="relative aspect-square w-full bg-surface overflow-hidden border border-light">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 bg-surface-alt border border-light text-[9px] font-bold text-secondary uppercase tracking-wider">
                          {prod.category || 'fragrance'}
                        </span>
                        <h4 className="font-bold text-primary text-sm mt-1 line-clamp-1">{prod.name}</h4>
                        <p className="text-xs text-secondary">{prod.brand}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-light flex items-center justify-between text-xs">
                      <span className="font-bold text-primary text-sm">${prod.price}</span>
                      <span className="text-secondary">Stock: {prod.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
