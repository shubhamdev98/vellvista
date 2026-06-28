"use client";

import React, { useState } from "react";
import { Menu, X, ShoppingBag, ChevronRight, Search } from "lucide-react";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import { useCurrency } from "../context/CurrencyProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getInitials } from "../app/utils/image";
import CurrencySelector from "./CurrencySelector";
import CartItem from "./CartItem";

const navLinks = [
  { name: "Shop All", href: "/products" },
  { name: "New Arrivals", href: "/products?filter=new" },
  { name: "Sale", href: "/products?filter=sale" },
];

const featuredItems = [
  {
    id: 1,
    name: "Chanel No. 5",
    brand: "Chanel",
    price: 150.00,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544157/vellvista/product/a2dhcmalhjnw4xfrj6df.jpg"
  },
  {
    id: 2,
    name: "Flowerbomb",
    brand: "Viktor & Rolf",
    price: 120.00,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544138/vellvista/product/vnqu2pvfpyhqdzl7bevh.jpg"
  }
];

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchValue)}`);
      setIsDrawerOpen(false);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* Top Main AppBar */}
      <header className="sticky top-0 z-50 bg-[#f9f9f9] h-16 flex items-center select-none">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
          
          {/* Left: Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="text-primary hover:opacity-75 transition-opacity p-2 -ml-2 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6 stroke-[1.5]" />
          </button>

          {/* Center: Brand Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-bold uppercase tracking-[0.25em] text-primary font-manrope whitespace-nowrap hover:opacity-85 transition-opacity"
            >
              VEILVISTA
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:block relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-40 lg:w-56 bg-[#f3f3f3] border border-transparent focus:border-border-light px-3 py-1.5 pl-8 text-xs focus:outline-none transition-all text-primary font-inter rounded-md"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary/60 pointer-events-none" />
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-primary hover:opacity-75 transition-opacity cursor-pointer"
              aria-label="Toggle search"
            >
              <Search className="h-6 w-6 stroke-[1.5]" />
            </button>

            {/* Shopping Bag */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-primary hover:opacity-75 transition-opacity cursor-pointer"
              aria-label="Open shopping cart"
            >
              <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
              <span className="absolute top-1.5 right-1.5 bg-primary text-inverse text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-inter">
                {totalItems}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Slide-down Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-[#f9f9f9] border-b border-border-light px-4 py-3 z-40 shadow-md">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  autoFocus
                  className="w-full bg-[#f3f3f3] border border-transparent focus:border-border-light px-4 py-2.5 pl-10 text-sm focus:outline-none transition-colors text-primary rounded-md"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/60 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary px-2 cursor-pointer"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Slide-out Left Navigation Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-full sm:max-w-md bg-[#f9f9f9] z-50 shadow-2xl transition-transform duration-300 transform ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full font-inter">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-border-light">
            <span className="font-manrope text-sm font-semibold tracking-wider text-secondary uppercase">
              Menu
            </span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 hover:opacity-70 transition-opacity text-primary cursor-pointer"
            >
              <X className="h-5 w-5 stroke-[1.5]" />
            </button>
          </div>


          {/* Navigation Links & Featured Section */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between py-3.5 px-3 hover:bg-black/5 transition-all duration-300 text-primary font-medium tracking-wide text-sm"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="h-4 w-4 text-secondary/55" />
                </Link>
              ))}
            </nav>

            {/* Featured Products inside Menu */}
            <div className="pt-6 border-t border-border-light">
              <h3 className="font-manrope text-xs font-semibold tracking-wider text-secondary uppercase mb-4 px-3">
                Featured Items
              </h3>
              <div className="grid grid-cols-2 gap-4 px-3">
                {featuredItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.id}`}
                    onClick={() => setIsDrawerOpen(false)}
                    className="group block space-y-2 text-left"
                  >
                    <div className="relative aspect-[4/5] bg-background-muted overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="px-0.5">
                      <h4 className="font-semibold text-xs text-primary truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-secondary truncate">
                        {item.brand}
                      </p>
                      <p className="text-[11px] font-medium text-primary mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer: User Section & Currency */}
          <div className="p-5 bg-background-muted border-t border-border-light space-y-4">
            <div className="flex items-center justify-between text-xs text-secondary font-semibold tracking-wider uppercase mb-1">
              <span>Settings</span>
            </div>

            {/* Currency Selector inside Drawer */}
            <div className="flex items-center justify-between py-1 px-1">
              <span className="text-xs text-secondary font-medium">Currency</span>
              <CurrencySelector />
            </div>

            {/* User Account widget inside Drawer */}
            <div className="pt-4 border-t border-border-light">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 py-1">
                    <div className="w-10 h-10 bg-secondary text-primary rounded-full flex items-center justify-center font-semibold text-sm border border-border-light select-none shrink-0">
                      {getInitials(user.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-primary truncate text-sm">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-secondary truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      href="/account/overview"
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-3 py-2.5 text-center text-xs font-semibold bg-primary text-inverse hover:opacity-90 transition-opacity uppercase tracking-wider"
                    >
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsDrawerOpen(false);
                        router.push("/");
                      }}
                      className="px-3 py-2.5 text-center text-xs font-semibold border border-primary text-primary hover:bg-black/5 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-2 py-2">
                  <p className="text-xs text-secondary font-light">
                    Sign in to manage orders, wishlist, and profile
                  </p>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-semibold bg-primary text-inverse hover:opacity-95 transition-opacity uppercase tracking-widest"
                  >
                    Sign In / Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

function CartSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    items,
    removeItem,
    clearCart,
    updateQuantity,
    couponCode,
    discountRate,
    applyCoupon,
    removeCoupon
  } = useCart();
  const { formatPrice } = useCurrency();
  const [couponInput, setCouponInput] = useState('');
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const subtotal = total;
  const TAX_RATE = 0.08;
  const taxAmount = subtotal * TAX_RATE;
  const discountAmount = subtotal * discountRate;
  const grandTotal = subtotal + taxAmount - discountAmount;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#f9f9f9] z-50 shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full font-inter">
          <div className="flex justify-between p-5 border-b border-border-light">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">Shopping Bag</h2>
            <button onClick={onClose} className="text-primary hover:opacity-75 transition-opacity cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                  <ShoppingBag className="h-10 w-10 text-secondary/40" />
                  <p className="text-xs text-secondary font-light">Your shopping bag is empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <CartItem key={item.cartItemId} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border-light p-5 bg-[#f9f9f9] sticky bottom-0">
                <div className="flex justify-between text-xs text-secondary mb-2">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-secondary mb-2">
                  <span>Tax (8%):</span>
                  <span className="font-semibold">{formatPrice(taxAmount)}</span>
                </div>
                {discountRate > 0 && (
                  <div className="flex justify-between text-xs text-success mb-2">
                    <span>Discount:</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                {couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-success/30 px-3 py-2 mb-4 text-xs font-light">
                    <span className="text-success font-medium">
                      Coupon &quot;{couponCode}&quot; Applied
                    </span>
                    <button
                      onClick={() => {
                        removeCoupon();
                        setCouponInput('');
                      }}
                      className="text-error hover:underline cursor-pointer font-normal"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 border border-border px-3 py-1.5 text-xs bg-white text-primary focus:outline-none"
                    />
                    <button
                      onClick={() => applyCoupon(couponInput)}
                      className="bg-primary text-inverse px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-primary text-sm mb-4 border-t border-border-light pt-3">
                  <span>Grand Total:</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>

                <div className="flex flex-row gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 border border-primary text-primary py-3 text-xs font-semibold uppercase tracking-wider hover:bg-black/5 transition-colors"
                  >
                    Clear
                  </button>
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="flex-1 bg-primary text-inverse py-3 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity text-center flex items-center justify-center"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}