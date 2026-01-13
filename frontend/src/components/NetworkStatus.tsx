'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WarningCircle, CheckCircle, Info } from 'phosphor-react';
import { getCurrentNetwork } from '@/lib/shop_interaction';
import { CURRENT_NETWORK } from '@/lib/network-config';

export function NetworkStatus() {
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkNetwork();

    // Listen for network changes
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      
      ethereum.on('chainChanged', () => {
        checkNetwork();
      });
    }
  }, []);

  const checkNetwork = async () => {
    setIsChecking(true);
    const info = await getCurrentNetwork();
    setNetworkInfo(info);
    setIsChecking(false);
  };

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      const ethereum = (window as any).ethereum;
      
      // Try to switch to the correct network
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}` }],
        });
        console.log(` Switched to ${CURRENT_NETWORK.chainName}`);
      } catch (switchError: any) {
        // Network not added to MetaMask, try to add it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}`,
              chainName: CURRENT_NETWORK.chainName,
              rpcUrls: [CURRENT_NETWORK.rpcUrl],
              nativeCurrency: {
                name: CURRENT_NETWORK.chainId === 31337 ? 'ETH' : 'MNT',
                symbol: CURRENT_NETWORK.chainId === 31337 ? 'ETH' : 'MNT',
                decimals: 18,
              },
              blockExplorerUrls: CURRENT_NETWORK.blockExplorer ? [CURRENT_NETWORK.blockExplorer] : undefined,
            }],
          });
          console.log(` Added ${CURRENT_NETWORK.chainName} network to MetaMask`);
        } else {
          throw switchError;
        }
      }
      
      // Refresh network info
      setTimeout(() => {
        checkNetwork();
      }, 1000);
    } catch (error: any) {
      console.error('Error switching network:', error);
      alert(`Failed to switch network: ${error.message}`);
    } finally {
      setIsSwitching(false);
    }
  };

  if (isChecking || !networkInfo) {
    return null;
  }

  // If on correct network, show success (can be collapsed)
  if (networkInfo.isCorrectNetwork) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <CheckCircle size={20} weight="fill" className="text-green-600 shrink-0" />
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-green-900">
              Connected to {networkInfo.expectedNetwork}
            </p>
            <p className="text-xs text-green-700">
              Chain ID: {networkInfo.chainId}
            </p>
          </div>
          <Info size={16} className="text-green-600" />
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800"
            >
              <p><strong>Network:</strong> {CURRENT_NETWORK.chainName}</p>
              <p><strong>RPC:</strong> {CURRENT_NETWORK.rpcUrl}</p>
              <p><strong>Contract:</strong> {CURRENT_NETWORK.masterContractAddress}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // If on wrong network, show warning
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
    >
      <div className="flex items-start gap-3">
        <WarningCircle size={24} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1">
            Wrong Network Detected
          </h3>
          <p className="text-sm text-amber-800 mb-3">
            You're connected to Chain ID {networkInfo.chainId}, but you need to be on{' '}
            <strong>{networkInfo.expectedNetwork}</strong> (Chain ID: {networkInfo.expectedChainId}).
          </p>
          
          <div className="bg-amber-100 border border-amber-300 rounded p-3 mb-3 text-xs text-amber-900">
            <p className="font-semibold mb-2">📝 How to fix:</p>
            <ol className="list-decimal list-inside space-y-1">
              {CURRENT_NETWORK.chainId === 31337 ? (
                <>
                  <li>Make sure Hardhat node is running: <code className="bg-amber-200 px-1 rounded">npx hardhat node</code></li>
                  <li>Deploy contracts: <code className="bg-amber-200 px-1 rounded">npx hardhat run scripts/deploy.js --network localhost</code></li>
                  <li>Click the button below to switch network automatically</li>
                  <li>Or manually: Open MetaMask → Network dropdown → "Localhost 8545"</li>
                </>
              ) : (
                <>
                  <li>Click the button below to switch automatically</li>
                  <li>Or manually: Click network dropdown in MetaMask → Select "{networkInfo.expectedNetwork}"</li>
                </>
              )}
            </ol>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSwitchNetwork}
              disabled={isSwitching}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {isSwitching ? 'Switching...' : `Switch to ${CURRENT_NETWORK.chainName}`}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
