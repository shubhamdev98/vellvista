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
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Globe2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';

export default function VendorApplyPage() {
  const { user, isLoading } = useAuth();
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
      router.push('/auth/login');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-muted flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-light text-sm">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-surface border border-light p-8 shadow-sm">
          <AlertCircle className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-xl font-semibold text-primary">Authentication Required</h2>
          <p className="text-secondary text-sm">Please sign in to apply for a vendor account.</p>
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-surface border border-light p-8 shadow-sm">
          <div className="w-16 h-16 bg-success-light border border-success/30 rounded-full flex items-center justify-center mx-auto text-success-dark">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-primary">Application Received!</h2>
          <p className="text-secondary text-sm">
            Thank you for applying to sell on <span className="font-semibold text-primary">VellVista</span>. Our review team is evaluating your application. You will be notified as soon as your store is approved.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/vendor/dashboard"
              className="w-full py-3 bg-primary hover:bg-primary-light text-inverse font-light tracking-wide text-sm transition-all shadow-sm"
            >
              Go to Vendor Dashboard
            </Link>
            <Link href="/" className="text-xs text-muted hover:text-primary transition-colors">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-muted py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden bg-surface p-8 sm:p-12 border border-light shadow-sm">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-background-alt border border-default text-primary text-xs font-medium uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Partner with VellVista
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-primary">
              Expand Your Brand on VellVista Marketplace
            </h1>
            <p className="text-secondary text-base leading-relaxed">
              Join curated global vendors selling luxury fragrances, skincare, cosmetics, fashion, and electronics to millions of discerning customers worldwide.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background-alt border border-default flex items-center justify-center text-primary">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary">Global Reach</h4>
                <p className="text-xs text-secondary">Public branded storefront</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background-alt border border-default flex items-center justify-center text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary">10% Platform Rate</h4>
                <p className="text-xs text-secondary">Transparent net payouts</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background-alt border border-default flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary">Instant Portal</h4>
                <p className="text-xs text-secondary">Real-time sales & order control</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="bg-surface border border-light p-8 sm:p-10 shadow-sm space-y-8">
          <div className="border-b border-light pb-6">
            <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" /> Store & Business Information
            </h2>
            <p className="text-xs text-secondary mt-1">
              Provide your official business credentials to launch your public marketplace storefront.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-light text-secondary mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maison de Paris"
                value={formData.storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-light text-secondary mb-1">
                Storefront URL Slug *
              </label>
              <div className="flex items-center bg-background-alt border border-default px-4 py-3 text-sm text-secondary font-mono">
                <span className="text-muted">vellvista.com/store/</span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-transparent text-primary focus:outline-none ml-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-light text-secondary mb-1 flex items-center gap-1.5">
                Owner Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Full Legal Name"
                value={formData.ownerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-light text-secondary mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> Business Email *
              </label>
              <input
                type="email"
                required
                placeholder="vendor@company.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-light text-secondary mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" /> Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-light text-secondary mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Business Address
              </label>
              <input
                type="text"
                placeholder="Street, City, State, Country"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-light text-secondary mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" /> Business & Store Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe your brand, manufacturing standards, and catalog offerings..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Branding Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-light">
            <div className="space-y-2">
              <label className="block text-xs font-light text-secondary mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" /> Store Logo URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.logo}
                onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-light text-secondary mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" /> Storefront Banner Image URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.banner}
                onChange={(e) => setFormData((prev) => ({ ...prev, banner: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Financial & Tax Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-light">
            <div className="space-y-2">
              <label className="block text-xs font-light text-secondary mb-1">
                Tax ID / Business Registration Number
              </label>
              <input
                type="text"
                placeholder="GSTIN / EIN / VAT Number"
                value={formData.taxId}
                onChange={(e) => setFormData((prev) => ({ ...prev, taxId: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-light text-secondary mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-primary" /> Payout Bank Account Details
              </label>
              <input
                type="text"
                placeholder="Bank Name, IBAN / Account Number, IFSC / SWIFT"
                value={formData.bankDetails}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankDetails: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-default bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-primary hover:bg-primary-light text-inverse font-light tracking-wide text-base transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
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
