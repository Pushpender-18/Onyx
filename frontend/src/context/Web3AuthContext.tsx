'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Web3AuthContextType, User } from '@/types';
import { ethers } from 'ethers';

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

// Constants for localStorage
const AUTH_STORAGE_KEY = 'onyx_auth_state';
const USER_STORAGE_KEY = 'onyx_user_data';
const WALLET_STORAGE_KEY = 'onyx_wallet_address';

export const Web3AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = (): boolean => {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).ethereum?.isMetaMask);
  };

  // Initialize auth state from localStorage and check MetaMask connection
  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        // First, check localStorage
        const storedAuthState = localStorage.getItem(AUTH_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const storedWallet = localStorage.getItem(WALLET_STORAGE_KEY);

        if (storedAuthState === 'true' && storedUser && storedWallet) {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify wallet is still connected in MetaMask
          if (isMetaMaskInstalled()) {
            try {
              const ethereum = (window as any).ethereum;
              const accounts = await ethereum.request({ method: 'eth_accounts' });
              
              if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === storedWallet.toLowerCase()) {
                // Wallet still connected
                setIsAuthenticated(true);
                setUser(parsedUser);
                setWalletAddress(storedWallet);
                console.log('✅ Auth state restored from localStorage');
              } else {
                // Wallet disconnected, clear state
                console.log('⚠️ Wallet disconnected, clearing auth state');
                clearAuthState();
              }
            } catch (error) {
              console.error('Error checking MetaMask connection:', error);
              clearAuthState();
            }
          } else {
            console.log('⚠️ MetaMask not found, clearing auth state');
            clearAuthState();
          }
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuthState();

    // Listen for account changes
    if (isMetaMaskInstalled()) {
      const ethereum = (window as any).ethereum;
      
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          console.log('🔌 Wallet disconnected');
          logout();
        } else if (walletAddress && accounts[0].toLowerCase() !== walletAddress.toLowerCase()) {
          // User switched accounts
          console.log('🔄 Account switched');
          logout();
        }
      });

      ethereum.on('chainChanged', () => {
        // Reload page on chain change
        console.log('🔄 Chain changed, reloading...');
        window.location.reload();
      });
    }
  }, []);

  const clearAuthState = () => {
    setIsAuthenticated(false);
    setUser(null);
    setWalletAddress(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(WALLET_STORAGE_KEY);
  };

  const login = async () => {
    try {
      setIsLoading(true);
      
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const ethereum = (window as any).ethereum;
      
      // Request account access
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const address = accounts[0];
      
      // Get additional info
      const provider = new ethers.BrowserProvider(ethereum);
      const network = await provider.getNetwork();
      
      // Create user object
      const newUser: User = {
        id: address,
        walletAddress: address,
        name: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        createdAt: new Date(),
      };

      setIsAuthenticated(true);
      setUser(newUser);
      setWalletAddress(address);

      // Persist auth state to localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(WALLET_STORAGE_KEY, address);
      
      console.log('✅ MetaMask wallet connected:', address);
      console.log('📡 Network:', network.name, 'Chain ID:', network.chainId.toString());
    } catch (error: any) {
      console.error('Login error:', error);
      clearAuthState();
      
      // Provide user-friendly error messages
      if (error.code === 4001) {
        throw new Error('Connection rejected. Please approve the connection request in MetaMask.');
      } else if (error.code === -32002) {
        throw new Error('Connection request already pending. Please check MetaMask.');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      clearAuthState();
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!isAuthenticated || !walletAddress) {
      return null;
    }
    
    // For MetaMask, we can use the wallet address as the token
    // Or implement signature-based authentication
    return walletAddress;
  };

  const value: Web3AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    walletAddress,
    login,
    logout,
    getIdToken,
  };

  return <Web3AuthContext.Provider value={value}>{children}</Web3AuthContext.Provider>;
};

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (context === undefined) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
};
