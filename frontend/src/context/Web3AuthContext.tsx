'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Web3AuthContextType, User } from '@/types';

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

// Dummy user data
const DUMMY_USER: User = {
  id: '0x1234567890123456789012345678901234567890',
  walletAddress: '0x1234567890123456789012345678901234567890',
  name: 'Demo User',
  email: 'demo@onyx.com',
  createdAt: new Date(),
};

// Constants for localStorage
const AUTH_STORAGE_KEY = 'onyx_auth_state';
const USER_STORAGE_KEY = 'onyx_user_data';
const WALLET_STORAGE_KEY = 'onyx_wallet_address';

export const Web3AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuthState = () => {
      try {
        const storedAuthState = localStorage.getItem(AUTH_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const storedWallet = localStorage.getItem(WALLET_STORAGE_KEY);

        if (storedAuthState === 'true' && storedUser && storedWallet) {
          const parsedUser = JSON.parse(storedUser);
          setIsAuthenticated(true);
          setUser(parsedUser);
          setWalletAddress(storedWallet);
          console.log('✅ Auth state restored from localStorage');
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        // Clear invalid data
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(WALLET_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuthState();
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      
      // Simulate async login
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsAuthenticated(true);
      setUser(DUMMY_USER);
      setWalletAddress(DUMMY_USER.walletAddress);

      // Persist auth state to localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DUMMY_USER));
      localStorage.setItem(WALLET_STORAGE_KEY, DUMMY_USER.walletAddress);
      
      console.log('✅ Dummy user logged in:', DUMMY_USER);
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setUser(null);
      setWalletAddress(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Simulate async logout
      await new Promise(resolve => setTimeout(resolve, 300));

      setIsAuthenticated(false);
      setUser(null);
      setWalletAddress(null);

      // Clear auth state from localStorage
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(WALLET_STORAGE_KEY);
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    // Return dummy token
    return isAuthenticated ? 'dummy-id-token' : null;
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
