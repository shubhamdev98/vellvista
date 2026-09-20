import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartProvider";
import { AuthProvider } from "../context/AuthProvider";
import { WishlistProvider } from "../context/WishlistProvider";
import { ToastProvider } from "../context/ToastProvider";
import { SocketProvider } from "../context/SocketProvider";
import { CurrencyProvider } from "../context/CurrencyProvider";
import { BrandProvider } from "../context/BrandProvider";

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
  icons: {
    icon: [
      { url: "/apple-icon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" }
    ],
    shortcut: "/apple-icon.png",
    apple: "/apple-icon.png"
  }
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function (e) {
                  if (e.message && (e.message.includes("startTime") || e.message.includes("reportAllChanges"))) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <CurrencyProvider>
            <AuthProvider>
              <SocketProvider>
                <CartProvider>
                  <WishlistProvider>
                    <BrandProvider>
                      {children}
                    </BrandProvider>
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
