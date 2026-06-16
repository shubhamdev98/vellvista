"use client";

import React, { useState, useRef } from "react";
import { Search, ShoppingCart, User, Menu, X, Trash2 } from "lucide-react";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import { useCurrency } from "../context/CurrencyProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductImageUrl, getInitials } from "../app/utils/image";
import CurrencySelector from "./CurrencySelector";
import CartItem from "./CartItem";
const navLinks = [
  { name: "Shop", href: "/products" },
  { name: "New Arrivals", href: "#new-arrivals" },
  { name: "Sale", href: "#sale" },
];

function NavItems({
  mobile = false,
  onLinkClick,
}: {
  mobile?: boolean;
  onLinkClick?: () => void;
}) {
  return (
    <div className={`${mobile ? "space-y-2" : "flex items-center"}`}>
      {navLinks.map((link, index) => (
        <React.Fragment key={link.name}>
          <a
            href={link.href}
            onClick={onLinkClick}
            className={`${
              mobile
                ? "block px-3 py-3 text-base text-primary border-b border-default last:border-0 hover:bg-surface-alt rounded"
                : "px-3 py-2 text-sm text-primary"
            } font-light hover:text-secondary transition`}
          >
            {link.name}
          </a>

          {!mobile && index < navLinks.length - 1 && (
            <span className="mx-2 text-muted">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function SearchBar({
  full = false,
  mobile = false,
  value,
  onChange,
}: {
  full?: boolean;
  mobile?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (mobile || full) return;
    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleBlur = () => {
    if (mobile || full) return;
    if (!value) {
      setIsExpanded(false);
    }
  };

  const showExpanded = mobile || full || isExpanded || !!value;

  return (
    <div className={`relative transition-all duration-300 ${
      mobile || full ? "w-full" : showExpanded ? "w-64" : "w-10"
    }`}>
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={handleBlur}
        type="text"
        placeholder="Search perfumes..."
        className={`w-full text-primary placeholder:text-muted py-2 border-b outline-none bg-transparent transition-all duration-300 ${
          mobile ? "border-dark" : "border-default"
        } focus:border-primary ${
          showExpanded 
            ? "pl-10 pr-4 opacity-100 cursor-text" 
            : "pl-0 pr-0 opacity-0 pointer-events-none cursor-pointer"
        }`}
      />
      <button
        onClick={handleIconClick}
        type="button"
        disabled={showExpanded}
        className={`absolute top-2 h-6 w-6 flex items-center justify-center transition-all duration-300 ${
          mobile ? "text-primary" : "text-secondary hover:text-primary"
        } ${
          showExpanded 
            ? "left-3 pointer-events-none cursor-default" 
            : "left-2 cursor-pointer"
        }`}
        aria-label="Search perfumes"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}

function Actions({
  onCartClick,
  mobile = false,
}: {
  onCartClick: () => void;
  mobile?: boolean;
}) {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className={`flex items-center gap-6 ${mobile ? "" : ""}`}>
      <button
        onClick={onCartClick}
        className="relative w-10 h-10 flex items-center justify-center text-primary hover:opacity-80 cursor-pointer"
      >
        <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />

        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-inverse text-xs font-semibold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {user ? (
        <button
          onClick={() => router.push("/account")}
          className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden hover:opacity-80 border border-light bg-secondary text-primary select-none cursor-pointer"
        >
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-semibold text-sm tracking-wider">
              {getInitials(user.fullName)}
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => router.push("/auth/login")}
          className="w-10 h-10 flex items-center justify-center text-primary hover:opacity-80 cursor-pointer"
        >
          <User className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

function CartSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, removeItem, clearCart, updateQuantity } = useCart();
  const { formatPrice } = useCurrency();
  // Local state for coupon handling
  const [couponCode, setCouponCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0); // e.g., 0.1 for 10% discount
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  // Calculations for subtotal, tax, discount, and grand total
  const subtotal = total;
  const TAX_RATE = 0.08; // 8% sales tax
  const taxAmount = subtotal * TAX_RATE;
  const discountAmount = subtotal * discountRate;
  const grandTotal = subtotal + taxAmount - discountAmount;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      )}

      <div
          className={`fixed top-0 right-0 h-full w-full sm:max-w-sm bg-surface z-50 shadow-2xl transition-transform sm:rounded-l-2xl ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-primary">Shopping Cart</h2>
            <button onClick={onClose} className="text-primary">
              <X />
            </button>
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <ShoppingCart className="h-12 w-12 text-muted" />
                </div>
              ) : (
                items.map((item) => (
                  <CartItem key={item.cartItemId} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
                ))
              )}
            </div>
            
            {items.length > 0 && (
              <div className="border-t p-4 bg-surface sticky bottom-0">
                <div className="flex justify-between text-sm text-muted mb-2">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted mb-2">
                  <span>Tax (8%):</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                {discountRate > 0 && (
                  <div className="flex justify-between text-sm text-success mb-2">
                    <span>Discount:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border border-default rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      if (couponCode.trim().toUpperCase() === "SAVE10") {
                        setDiscountRate(0.1);
                      } else {
                        setDiscountRate(0);
                      }
                    }}
                    className="bg-accent text-inverse px-3 py-1 rounded text-sm hover:bg-accent-light"
                  >
                    Apply
                  </button>
                </div>

                <div className="flex justify-between font-semibold text-primary mb-4">
                  <span>Grand Total:</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>

<div className="flex flex-col md:flex-row gap-2">
  <button
    onClick={clearCart}
    className="flex-1 border border-primary text-primary py-3 rounded hover:bg-surface-alt"
  >
    Clear
  </button>
  <button
    className="flex-1 bg-primary text-inverse py-3 rounded hover:bg-primary-light"
  >
    Checkout
  </button>
</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <>
      <header className="bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/"
              className="flex items-center relative h-10 w-[7.5rem]"
            >
              <Image
                src="https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png"
                alt="LuxeScents"
                fill
                className="object-contain"
                priority
                sizes="120px"
              />
            </Link>

            <nav className="hidden md:flex">
              <NavItems />
            </nav>

            <div className="hidden md:flex items-center gap-6">
              <SearchBar value={searchValue} onChange={setSearchValue} />
              <CurrencySelector />
              <Actions onCartClick={() => setIsCartOpen(true)} />
            </div>

            <div className="flex md:hidden items-center gap-2 text-primary">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center text-primary"
              >
                <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />

                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-inverse text-xs font-semibold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-primary w-10 h-10 flex items-center justify-center"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-surface p-4 border-t border-default space-y-4 animate-fade-in">
              {/* Profile / Auth Section */}
              <div className="px-3 py-4 border border-default">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      {user.avatar ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden relative border border-dark shrink-0">
                          <Image
                            src={user.avatar}
                            alt="Profile"
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center font-semibold text-sm border border-dark shrink-0 select-none">
                          {getInitials(user.fullName)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-primary truncate text-sm">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-secondary truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-default">
                      <Link
                        href="/account/overview"
                        onClick={() => setIsMenuOpen(false)}
                        className="px-3 py-2 text-center text-xs font-light bg-primary text-inverse hover:bg-primary-light transition-colors rounded"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                          router.push("/");
                        }}
                        className="px-3 py-2 text-center text-xs font-light border border-dark text-error hover:bg-error-light hover:border-error transition-colors rounded cursor-pointer"
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
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-light bg-primary text-inverse hover:bg-primary-light transition-colors rounded"
                    >
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>

              <SearchBar
                full
                mobile
                value={searchValue}
                onChange={setSearchValue}
              />
              <div className="flex items-center justify-between px-3 py-2 border-b border-default">
                <span className="text-sm text-secondary font-light">Currency</span>
                <CurrencySelector />
              </div>
              <NavItems mobile onLinkClick={() => setIsMenuOpen(false)} />
            </div>
          )}
        </div>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}