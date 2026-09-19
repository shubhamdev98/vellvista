"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CreditCard, Truck, Shield, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useSocialLinks, usePaymentMethods } from '../app/hooks/useApi';
import { useBrand } from '../context/BrandProvider';

const Footer = () => {
  const { brandName, brandLogo } = useBrand();
  const [email, setEmail] = useState('');
  const { data: socialLinks } = useSocialLinks();
  const { data: paymentMethods } = usePaymentMethods();

  const defaultSocials = [
    { name: 'Facebook', url: '#', image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626184/vellvista/social/kiqgvb4hhcu5tfiovv0s.png' },
    { name: 'Instagram', url: '#', image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626185/vellvista/social/wylukhgkcug0nujiqxjh.png' },
    { name: 'Twitter', url: '#', image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626187/vellvista/social/pbji7av8mmfwri9od5ad.png' },
    { name: 'YouTube', url: '#', image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626188/vellvista/social/m5uihnucyhkmogwcxesx.png' }
  ];

  const displayedSocials = (socialLinks && socialLinks.length > 0)
    ? socialLinks
    : defaultSocials;

  const defaultPayments = [
    { name: 'Visa', image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626153/vellvista/payment/zagvhixwwwtgfnqrmsax.png', width: 38 },
    { name: 'American Express', image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626150/vellvista/payment/nmbvo0aahkdfskrzfjwh.png', width: 38 },
    { name: 'Google Pay', image: 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626151/vellvista/payment/gejoim9tohpazotl8zqg.png', width: 42 }
  ];

  const displayedPayments = (paymentMethods && paymentMethods.filter(p => p.isActive && p.image).length > 0)
    ? paymentMethods.filter(p => p.isActive && p.image).map(p => ({
        name: p.name,
        image: p.image!,
        width: p.name.toLowerCase().includes('google') ? 42 : 38
      }))
    : defaultPayments;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter signup:', email);
      setEmail('');
      // Add newsletter signup logic here
    }
  };

  return (
    <footer className="bg-primary-light text-inverse pt-16 pb-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 mb-12">
          
          {/* Company Info */}
          <div className="col-span-1 lg:pr-8 lg:border-r lg:border-white/10">
            <div className="relative h-14 w-[11rem] mb-4">
              <Image
                src={brandLogo}
                alt={brandName}
                fill
                className="object-contain object-left brightness-0 invert"
                priority
                sizes="176px"
              />
            </div>
            <p className="text-muted mb-6 leading-relaxed text-sm">
              Discover luxury fragrances that define your signature scent. Premium perfumes from the worlds most prestigious brands.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-muted">
                <MapPin className="h-4 w-4 mr-3 text-muted" />
                <span className="text-sm">123 Luxury Avenue, NY 10001</span>
              </div>
              <div className="flex items-center text-muted">
                <Phone className="h-4 w-4 mr-3 text-muted" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-muted">
                <Mail className="h-4 w-4 mr-3 text-muted" />
                <span className="text-sm">info@vellvista.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 lg:px-8 lg:border-r lg:border-white/10">
            <h3 className="text-lg font-semibold text-inverse mb-4">Quick Links</h3>
            <ul className="space-y-1.5">
              <li><a href="#home" className="text-muted hover:text-inverse transition-colors text-sm">Home</a></li>
              <li><a href="#products" className="text-muted hover:text-inverse transition-colors text-sm">Shop All</a></li>
              <li><a href="#brands" className="text-muted hover:text-inverse transition-colors text-sm">Brands</a></li>
              <li><a href="#new-arrivals" className="text-muted hover:text-inverse transition-colors text-sm">New Arrivals</a></li>
              <li><a href="#sale" className="text-muted hover:text-inverse transition-colors text-sm">Sale</a></li>
              <li><a href="#about" className="text-muted hover:text-inverse transition-colors text-sm">About Us</a></li>
              <li><a href="#contact" className="text-muted hover:text-inverse transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-span-1 lg:px-8 lg:border-r lg:border-white/10">
            <h3 className="text-lg font-semibold text-inverse mb-4">Customer Service</h3>
            <ul className="space-y-1.5">
              <li><a href="#shipping" className="text-muted hover:text-inverse transition-colors text-sm">Shipping & Delivery</a></li>
              <li><a href="#returns" className="text-muted hover:text-inverse transition-colors text-sm">Returns & Exchanges</a></li>
              <li><a href="#size-guide" className="text-muted hover:text-inverse transition-colors text-sm">Size Guide</a></li>
              <li><a href="#faq" className="text-muted hover:text-inverse transition-colors text-sm">FAQ</a></li>
              <li><a href="#privacy" className="text-muted hover:text-inverse transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#terms" className="text-muted hover:text-inverse transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#wishlist" className="text-muted hover:text-inverse transition-colors text-sm">Wishlist</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1 lg:pl-8">
            <h3 className="text-lg font-semibold text-inverse mb-6">Stay Connected</h3>
            <p className="text-muted mb-6 text-sm">Subscribe to receive exclusive offers, new product alerts, and fragrance tips.</p>
            
            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-primary border border-white/20 text-inverse placeholder:text-muted focus:outline-none focus:border-white/50 text-sm"
                />
                <button
                  type="submit"
                  className="bg-surface text-primary border border-transparent hover:bg-transparent hover:text-white hover:border-white transition-all px-4 py-3 flex items-center justify-center cursor-pointer"
                  aria-label="Subscribe to newsletter"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Giant 100% Width Brand Name Banner (100% full text visible) */}
      <div className="w-full mt-10 border-t border-white/10 overflow-hidden select-none pointer-events-none leading-none">
        <svg viewBox="0 0 1000 200" className="w-full h-auto block" preserveAspectRatio="none">
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            className="fill-white font-black uppercase"
            style={{ fontSize: '180px', fontWeight: 900, fontFamily: 'Arial Black, Impact, sans-serif' }}
          >
            {brandName ? brandName.toUpperCase() : 'VELLVISTA'}
          </text>
        </svg>
      </div>

      {/* Copyright Notice below VELLVISTA name */}
      <div className="w-full bg-primary-light text-center py-4 border-t border-white/10 text-muted text-xs sm:text-sm">
        <p>&copy; 2026 vellvista. All rights reserved. | Crafted with passion for fragrance lovers</p>
      </div>
    </footer>
  );
};

export default Footer;