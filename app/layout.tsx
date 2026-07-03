import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartProvider";
import { AuthProvider } from "../context/AuthProvider";
import { WishlistProvider } from "../context/WishlistProvider";
import { ToastProvider } from "../context/ToastProvider";
import { SocketProvider } from "../context/SocketProvider";
import { CurrencyProvider } from "../context/CurrencyProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vellvista | The Realm of Luxury Fragrances",
  description: "Discover the most iconic and sought-after fragrances in the world, meticulously curated for the modern connoisseur. Experience luxury in every spritz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <CurrencyProvider>
            <AuthProvider>
              <SocketProvider>
                <CartProvider>
                  <WishlistProvider>
                    {children}
                  </WishlistProvider>
                </CartProvider>
              </SocketProvider>
            </AuthProvider>
          </CurrencyProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
