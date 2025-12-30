'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Web3AuthContextType, User } from '@/types';

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const Web3AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('onyx_user');
    const storedAddress = localStorage.getItem('onyx_wallet');

    if (storedUser && storedAddress) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setWalletAddress(storedAddress);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('onyx_user');
        localStorage.removeItem('onyx_wallet');
      }
    }
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      // Placeholder for Web3Auth integration
      // In production, this would initialize Web3Auth modal
      const mockAddress = '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);

      const newUser: User = {
        id: mockAddress,
        walletAddress: mockAddress,
        createdAt: new Date(),
      };

      setWalletAddress(mockAddress);
      setIsAuthenticated(true);
      setUser(newUser);

      localStorage.setItem('onyx_user', JSON.stringify(newUser));
      localStorage.setItem('onyx_wallet', mockAddress);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setIsAuthenticated(false);
      setUser(null);
      setWalletAddress(null);

      localStorage.removeItem('onyx_user');
      localStorage.removeItem('onyx_wallet');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    // Placeholder for Web3Auth token
    return localStorage.getItem('onyx_idtoken');
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
