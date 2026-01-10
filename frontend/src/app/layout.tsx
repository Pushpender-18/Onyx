import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Web3AuthProvider } from "@/context/Web3AuthContext";
import { ShopProvider } from "@/context/ShopContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onyx - Decentralized Store Platform",
  description: "Create and manage your decentralized store on Mantle Network",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${geist.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#353935',
              color: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f5f5f5',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f5f5f5',
              },
            },
          }}
        />
        <Web3AuthProvider>
          <ShopProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ShopProvider>
        </Web3AuthProvider>
      </body>
    </html>
  );
}
