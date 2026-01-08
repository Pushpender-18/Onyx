import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3AuthProvider } from "@/context/Web3AuthContext";
import { ShopProvider } from "@/context/ShopContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <Web3AuthProvider>
          <ShopProvider>
            <Navigation />
            <main className="min-h-screen bg-var(--onyx-white)">
              {children}
            </main>
            <Footer />
          </ShopProvider>
        </Web3AuthProvider>
      </body>
    </html>
  );
}
