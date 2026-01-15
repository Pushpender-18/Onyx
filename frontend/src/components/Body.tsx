'use client';
import web3AuthContextConfig from "@/context/Web3AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Web3AuthProvider } from "@web3auth/modal/react";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { ShopProvider } from "@/context/ShopContext";
import LayoutWrapper from "./LayoutWrapper";

export default function Body(children: { children: React.ReactNode }) {
  const quertClient = new QueryClient();
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <QueryClientProvider client={quertClient}>
        <WagmiProvider>
          <ShopProvider>
            <LayoutWrapper children={children.children} />
          </ShopProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}