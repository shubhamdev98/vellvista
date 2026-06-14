"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CreditCard, Truck, Shield, RefreshCw } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter signup:', email);
      setEmail('');
      // Add newsletter signup logic here
    }
  };

  return (
    <footer className="bg-primary-light text-inverse pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-1">
            <div className="relative h-10 w-[7.5rem] mb-4">
              <Image
                src="/logo/vv.png"
                alt="LuxeScents"
                fill
                className="object-contain brightness-0 invert"
                priority
                sizes="120px"
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
                <span className="text-sm">info@luxescents.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
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
          <div className="col-span-1">
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
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold text-inverse mb-6">Stay Connected</h3>
            <p className="text-muted mb-6 text-sm">Subscribe to receive exclusive offers, new product alerts, and fragrance tips.</p>
            
            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-primary border border-dark text-inverse placeholder:text-muted focus:outline-none focus:border-inverse text-sm"
                />
                <button
                  type="submit"
                  className="bg-surface text-primary px-4 py-3 hover:bg-surface-alt transition-colors"
                  aria-label="Subscribe to newsletter"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Social Media */}
            <div>
              <h3 className="text-sm font-semibold text-inverse mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:opacity-85 transition-opacity" aria-label="Facebook">
                  <Image
                    src="/social/facebook.png"
                    alt="Facebook"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </a>
                <a href="#" className="hover:opacity-85 transition-opacity" aria-label="Instagram">
                  <Image
                    src="/social/instagram.png"
                    alt="Instagram"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </a>
                <a href="#" className="hover:opacity-85 transition-opacity" aria-label="Twitter">
                  <Image
                    src="/social/twitter.png"
                    alt="Twitter"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </a>
                <a href="#" className="hover:opacity-85 transition-opacity" aria-label="YouTube">
                  <Image
                    src="/social/youtube.png"
                    alt="YouTube"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-muted shrink-0" />
                <h3 className="font-semibold text-inverse text-xs sm:text-sm leading-tight">Free Shipping</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-muted leading-tight mt-1 text-left pl-7 sm:pl-9">On orders over $50</p>
            </div>
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-muted shrink-0" />
                <h3 className="font-semibold text-inverse text-xs sm:text-sm leading-tight">Secure Payment</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-muted leading-tight mt-1 text-left pl-7 sm:pl-9">100% secure transactions</p>
            </div>
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-muted shrink-0" />
                <h3 className="font-semibold text-inverse text-xs sm:text-sm leading-tight">Easy Returns</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-muted leading-tight mt-1 text-left pl-7 sm:pl-9">30-day return policy</p>
            </div>
            <div className="flex flex-col items-start w-full">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-muted shrink-0" />
                <h3 className="font-semibold text-inverse text-xs sm:text-sm leading-tight">Multiple Payment</h3>
              </div>
              <p className="text-[10px] sm:text-xs text-muted leading-tight mt-1 text-left pl-7 sm:pl-9">Secure payment methods</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted text-sm">
              <p>&copy; 2024 LuxeScents. All rights reserved. | Crafted with passion for fragrance lovers</p>
            </div>
            
            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-muted text-sm">We accept:</span>
              <div className="flex items-center space-x-4">
                <Image
                  src="/payment/visa.png"
                  alt="Visa"
                  width={38}
                  height={24}
                  className="object-contain"
                />
                <Image
                  src="/payment/american-express.png"
                  alt="American Express"
                  width={38}
                  height={24}
                  className="object-contain"
                />
                <Image
                  src="/payment/google-pay.png"
                  alt="Google Pay"
                  width={42}
                  height={24}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;