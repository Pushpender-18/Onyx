'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, WarningCircle } from 'phosphor-react';
import { isWalletConnected, connectWallet } from '@/lib/shop_interaction';

export function WalletStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
        } else {
          setIsConnected(false);
          setAddress('');
        }
      });

      ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const checkConnection = async () => {
    const connected = await isWalletConnected();
    setIsConnected(connected);
    
    if (connected && typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error getting accounts:', error);
      }
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    const success = await connectWallet();
    setIsConnecting(false);
    
    if (success) {
      await checkConnection();
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (isConnected === null) {
    return null; // Loading
  }

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <WarningCircle size={24} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-1">
              Wallet Not Connected
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              Connect your wallet to interact with blockchain features like creating stores and adding products.
            </p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
    >
      <div className="flex items-center gap-3">
        <Wallet size={20} weight="fill" className="text-green-600" />
        <div>
          <p className="text-sm font-medium text-green-900">
            Wallet Connected
          </p>
          <p className="text-xs text-green-700 font-mono">
            {formatAddress(address)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
