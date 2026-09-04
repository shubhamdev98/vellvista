'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  ExternalLink,
  Code,
  CheckCircle2,
  Copy,
  Server,
  Zap,
  Shield,
  Layers,
  Terminal,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: string;
  summary: string;
  description: string;
  authRequired?: boolean;
  sampleInput?: object | string;
  sampleOutput?: object;
}

const endpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/health',
    category: 'System & Health',
    summary: 'Express API Health Check',
    description: 'Returns real-time backend status and ISO timestamp heartbeat.',
    sampleOutput: { status: 'ok', timestamp: '2026-08-30T18:54:48.000Z' }
  },
  {
    method: 'GET',
    path: '/trpc/healthCheck',
    category: 'System & Health',
    summary: 'tRPC Procedure: Health Check',
    description: 'tRPC heartbeat endpoint validating end-to-end type-safe connectivity.',
    sampleOutput: { result: { data: { status: 'ok', timestamp: '2026-08-30T18:54:48.000Z' } } }
  },
  {
    method: 'POST',
    path: '/api/auth/sign-in/email',
    category: 'Authentication',
    summary: 'Better Auth Email/Password Sign In',
    description: 'Authenticates registered users using email and encrypted password credentials.',
    sampleInput: { email: 'customer@example.com', password: 'Password123!' },
    sampleOutput: {
      user: { id: 'usr_102', name: 'Eleanor Vance', email: 'customer@example.com', role: 'USER' },
      session: { id: 'sess_9901', expiresAt: '2026-09-30T18:00:00.000Z' }
    }
  },
  {
    method: 'GET',
    path: '/api/auth/get-session',
    category: 'Authentication',
    summary: 'Get Current Authenticated Session',
    description: 'Fetches active session token and payload from httpOnly cookies.',
    sampleOutput: {
      user: { id: 'usr_102', name: 'Eleanor Vance', email: 'customer@example.com', role: 'USER' },
      session: { id: 'sess_9901', expiresAt: '2026-09-30T18:00:00.000Z' }
    }
  },
  {
    method: 'GET',
    path: '/trpc/getProducts',
    category: 'Products & Catalog',
    summary: 'tRPC Procedure: Get Fragrance Products',
    description: 'Fetches luxury fragrance product listings with limit/offset pagination.',
    sampleInput: { limit: 12, offset: 0 },
    sampleOutput: {
      result: {
        data: [
          {
            id: 1,
            name: 'Velvet Oud Eau de Parfum',
            price: 149.99,
            category: 'Woody',
            rating: 4.9,
            image: 'https://res.cloudinary.com/demo/image/upload/v1/vellvista/product/velvet-oud.png'
          }
        ]
      }
    }
  },
  {
    method: 'GET',
    path: '/trpc/getProductById',
    category: 'Products & Catalog',
    summary: 'tRPC Procedure: Get Product details by ID',
    description: 'Retrieves full product details, variants, and stock counts by numeric ID.',
    sampleInput: { id: 1 },
    sampleOutput: {
      result: {
        data: {
          id: 1,
          name: 'Velvet Oud Eau de Parfum',
          description: 'A rich fusion of rare cambodian oud and wild rose.',
          price: 149.99,
          stock: 45
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/trpc/createProduct',
    category: 'Products & Catalog',
    summary: 'tRPC Procedure: Create Product (Admin)',
    description: 'Admin operation to add new fragrance product item to catalog database.',
    authRequired: true,
    sampleInput: {
      name: 'Celestial Amber Extrait',
      price: 195.0,
      category: 'Oriental',
      description: 'Amber, labdanum, and madagascar vanilla.',
      stock: 30
    },
    sampleOutput: { success: true, productId: 88 }
  },
  {
    method: 'GET',
    path: '/api/reviews/:productId',
    category: 'Reviews & Ratings',
    summary: 'Get Product Reviews',
    description: 'Fetches verified customer reviews with rating stars and uploaded photos.',
    sampleOutput: [
      {
        id: 101,
        productId: 1,
        userName: 'Sophia Laurent',
        rating: 5,
        title: 'Breathtaking Scent',
        comment: 'Longevity is unmatched. Highly recommended!',
        image: 'https://res.cloudinary.com/demo/image/upload/v1/vellvista/reviews/photo1.jpg'
      }
    ]
  },
  {
    method: 'POST',
    path: '/api/reviews',
    category: 'Reviews & Ratings',
    summary: 'Submit Product Review with Photo',
    description: 'Multipart form upload endpoint submitting customer review and optional image asset.',
    sampleInput: 'FormData (productId, rating, title, comment, image file)',
    sampleOutput: { success: true, review: { id: 102, rating: 5 } }
  },
  {
    method: 'POST',
    path: '/api/upload-product-image',
    category: 'File Uploads',
    summary: 'Upload Product Image',
    description: 'Uploads product image file directly to Cloudinary storage bucket.',
    sampleInput: 'FormData (image: binary file up to 5MB)',
    sampleOutput: { success: true, url: 'https://res.cloudinary.com/demo/image/upload/v1/vellvista/product/amber.png' }
  },
  {
    method: 'POST',
    path: '/api/upload-video',
    category: 'File Uploads',
    summary: 'Upload Hero Section Video',
    description: 'Uploads video banner asset (MP4/WebM) up to 50MB.',
    sampleInput: 'FormData (video: binary video file)',
    sampleOutput: { success: true, url: 'https://res.cloudinary.com/demo/video/upload/v1/vellvista/hero/banner.mp4' }
  },
  {
    method: 'GET',
    path: '/trpc/getCart',
    category: 'Shopping Cart',
    summary: 'tRPC Procedure: Get Cart',
    description: 'Retrieves current active shopping cart items for user session.',
    sampleOutput: {
      result: {
        data: [
          { id: 12, productId: 1, quantity: 2, product: { name: 'Velvet Oud', price: 149.99 } }
        ]
      }
    }
  },
  {
    method: 'POST',
    path: '/trpc/addToCart',
    category: 'Shopping Cart',
    summary: 'tRPC Procedure: Add to Cart',
    description: 'Adds item or updates quantity of product variant in cart.',
    sampleInput: { productId: 1, variantId: 2, quantity: 1 },
    sampleOutput: { success: true }
  },
  {
    method: 'POST',
    path: '/trpc/createPayment',
    category: 'Payments & Billing',
    summary: 'tRPC Procedure: Initialize Payment',
    description: 'Creates Razorpay payment order token for checkout transaction processing.',
    sampleInput: { amount: 299.5, currency: 'INR', orderId: 1042 },
    sampleOutput: {
      result: {
        data: { id: 'order_NzK89aJ11x8s2', amount: 29950, currency: 'INR' }
      }
    }
  },
  {
    method: 'GET',
    path: '/trpc/getAllOrders',
    category: 'Orders & Checkout',
    summary: 'tRPC Procedure: Get All Orders (Admin)',
    description: 'Retrieves store order history, customer information, and status tags.',
    authRequired: true,
    sampleOutput: {
      result: {
        data: [
          { id: 1042, totalAmount: 299.5, status: 'processing', paymentStatus: 'paid' }
        ]
      }
    }
  }
];

const categories = [
  'All',
  'System & Health',
  'Authentication',
  'Products & Catalog',
  'Reviews & Ratings',
  'File Uploads',
  'Shopping Cart',
  'Payments & Billing',
  'Orders & Checkout'
];

export default function ApiDocsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<{ path: string; data: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      const matchesCategory = selectedCategory === 'All' || ep.category === selectedCategory;
      const matchesSearch =
        ep.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const copyToClipboard = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleLiveTest = async (endpoint: ApiEndpoint) => {
    if (endpoint.method !== 'GET') return;
    setIsTesting(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const testUrl = endpoint.path.startsWith('/trpc/')
      ? `${backendUrl}${endpoint.path}`
      : `${backendUrl}${endpoint.path.replace(':productId', '1')}`;

    try {
      const res = await fetch(testUrl);
      const data = await res.json();
      setTestResponse({ path: endpoint.path, data: JSON.stringify(data, null, 2) });
    } catch (err: any) {
      setTestResponse({ path: endpoint.path, data: `Error testing endpoint: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-8 sm:p-10 border border-slate-800/80 shadow-2xl shadow-indigo-950/20">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Interactive API Documentation Portal
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                VellVista OpenAPI 3.0 & Swagger UI
              </h1>
              <p className="text-slate-400 text-base max-w-2xl">
                Explore, test, and integrate VellVista REST routes, Better Auth flows, tRPC procedures, and file upload endpoints.
              </p>
            </div>

            {/* Quick Link Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="http://localhost:3001/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-400/30 hover:-translate-y-0.5"
              >
                <ExternalLink className="w-4 h-4" /> Open Swagger UI
              </a>
              <a
                href="http://localhost:3001/api-docs/json"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all duration-200"
              >
                <Code className="w-4 h-4 text-indigo-400" /> Raw swagger.json
              </a>
            </div>
          </div>
        </div>

        {/* Server & Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-3 text-emerald-400 font-semibold text-sm">
              <Server className="w-4 h-4" /> Express API Server
            </div>
            <p className="text-2xl font-bold text-white">http://localhost:3001</p>
            <p className="text-slate-400 text-xs">REST, Uploads, WebSockets, tRPC Router</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-3 text-indigo-400 font-semibold text-sm">
              <Zap className="w-4 h-4" /> tRPC Protocol
            </div>
            <p className="text-2xl font-bold text-white">http://localhost:3001/trpc</p>
            <p className="text-slate-400 text-xs">Type-Safe Endpoints & Direct Mutations</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-3 text-amber-400 font-semibold text-sm">
              <Shield className="w-4 h-4" /> Auth Protocol
            </div>
            <p className="text-2xl font-bold text-white">Better Auth + Cookies</p>
            <p className="text-slate-400 text-xs">httpOnly Session Tokens & Role Guards</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search endpoints (e.g. /health, cart)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all duration-200"
            />
          </div>
        </div>

        {/* Endpoints Listing */}
        <div className="space-y-4">
          {filteredEndpoints.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No endpoints matching &quot;{searchTerm}&quot;</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="mt-3 text-amber-400 text-sm hover:underline font-semibold"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredEndpoints.map((ep, idx) => (
              <div
                key={idx}
                className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 p-6 space-y-4 shadow-lg shadow-black/20"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black tracking-wide ${
                        ep.method === 'GET'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ep.method === 'POST'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                      {ep.path}
                    </span>
                    {ep.authRequired && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20">
                        <Shield className="w-3 h-3" /> Admin Auth
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(`http://localhost:3001${ep.path}`, ep.path)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
                    >
                      {copiedPath === ep.path ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy URL
                        </>
                      )}
                    </button>

                    {ep.method === 'GET' && (
                      <button
                        onClick={() => handleLiveTest(ep)}
                        disabled={isTesting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-all duration-200"
                      >
                        <Terminal className="w-3.5 h-3.5" /> Try Endpoint
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{ep.summary}</h3>
                  <p className="text-slate-400 text-sm mt-1">{ep.description}</p>
                </div>

                {/* Sample JSON Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {ep.sampleInput && (
                    <div className="rounded-xl bg-slate-950 p-4 border border-slate-800/80">
                      <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                        <span>Sample Request Input</span>
                        <Code className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <pre className="text-xs font-mono text-amber-200/90 overflow-x-auto">
                        {typeof ep.sampleInput === 'string'
                          ? ep.sampleInput
                          : JSON.stringify(ep.sampleInput, null, 2)}
                      </pre>
                    </div>
                  )}

                  {ep.sampleOutput && (
                    <div className="rounded-xl bg-slate-950 p-4 border border-slate-800/80">
                      <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                        <span>Sample Response Payload</span>
                        <Database className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <pre className="text-xs font-mono text-emerald-200/90 overflow-x-auto">
                        {JSON.stringify(ep.sampleOutput, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Live Test Results Modal / Box */}
                {testResponse && testResponse.path === ep.path && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Live Fetch Response (200 OK)
                      </span>
                      <button
                        onClick={() => setTestResponse(null)}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        Close
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-emerald-300 overflow-x-auto max-h-60">
                      {testResponse.data}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
