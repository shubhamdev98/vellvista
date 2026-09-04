'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Globe2
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';

export default function VendorApplyPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    storeName: '',
    slug: '',
    ownerName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    description: '',
    address: '',
    logo: '',
    banner: '',
    taxId: '',
    bankDetails: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleStoreNameChange = (name: string) => {
    const generatedSlug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setFormData((prev) => ({
      ...prev,
      storeName: name,
      slug: generatedSlug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to submit a vendor application', 'error');
      router.push('/auth');
      return;
    }

    if (!formData.storeName || !formData.email || !formData.ownerName) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const res = await fetch(`${backendUrl}/trpc/applyForVendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (data.result?.data?.success) {
        setIsSubmitted(true);
        showToast('Vendor application submitted successfully!', 'success');
      } else {
        const errMsg = data.error?.message || data.result?.data?.message || 'Failed to submit application';
        showToast(errMsg, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting vendor application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Application Received!</h2>
          <p className="text-slate-400 text-sm">
            Thank you for applying to sell on **VellVista**. Our review team is evaluating your application. You will be notified as soon as your store is approved.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/vendor/dashboard"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-amber-500/20"
            >
              Go to Vendor Dashboard
            </Link>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-8 sm:p-12 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Partner with VellVista
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Expand Your Brand on VellVista Marketplace
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Join curated global vendors selling luxury fragrances, skincare, cosmetics, fashion, and electronics to millions of discerning customers worldwide.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Global Reach</h4>
                <p className="text-xs text-slate-400">Public branded storefront</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">10% Platform Rate</h4>
                <p className="text-xs text-slate-400">Transparent net payouts</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Instant Portal</h4>
                <p className="text-xs text-slate-400">Real-time sales & order control</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 backdrop-blur-md">
          <div className="border-b border-slate-800 pb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-400" /> Store & Business Information
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Provide your official business credentials to launch your public marketplace storefront.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" /> Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maison de Paris"
                value={formData.storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Storefront URL Slug *
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 font-mono">
                <span className="text-slate-500">vellvista.com/store/</span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-transparent text-white focus:outline-none ml-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                Owner Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Full Legal Name"
                value={formData.ownerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> Business Email *
              </label>
              <input
                type="email"
                required
                placeholder="vendor@company.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Business Address
              </label>
              <input
                type="text"
                placeholder="Street, City, State, Country"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" /> Business & Store Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe your brand, manufacturing standards, and catalog offerings..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Branding Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Store Logo URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.logo}
                onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Storefront Banner Image URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.banner}
                onChange={(e) => setFormData((prev) => ({ ...prev, banner: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Financial & Tax Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Tax ID / Business Registration Number
              </label>
              <input
                type="text"
                placeholder="GSTIN / EIN / VAT Number"
                value={formData.taxId}
                onChange={(e) => setFormData((prev) => ({ ...prev, taxId: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Payout Bank Account Details
              </label>
              <input
                type="text"
                placeholder="Bank Name, IBAN / Account Number, IFSC / SWIFT"
                value={formData.bankDetails}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankDetails: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition-all duration-200 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Submitting Application...'
              ) : (
                <>
                  Submit Vendor Application <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
