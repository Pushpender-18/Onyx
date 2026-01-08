'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Store, Product } from '@/types';
import * as shopInteraction from '@/lib/shop_interaction';

interface ShopContextType {
  stores: Store[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  // Store operations
  createStore: (name: string, templateId: string, description: string, configuration: string) => Promise<Store | null>;
  getAllStores: () => Promise<Store[]>;
  getStoreByName: (name: string) => Promise<Store | null>;
  updateStore: (storeId: string, updates: Partial<Store>) => void;
  deleteStore: (storeId: string) => void;
  restoreStore: (storeId: string) => Promise<void>;
  getDeletedStoreIds: () => Set<string>;
  
  // Product operations
  addProduct: (shopAddress: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product | null>;
  getProducts: (shopAddress: string) => Promise<Product[]>;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  
  // Utility
  refreshData: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  // Pure in-memory state - no localStorage for store data
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // localStorage utilities for tracking deleted stores
  const DELETED_STORES_KEY = 'onyx_deleted_stores';
  
  const getDeletedStoreIds = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    try {
      const deleted = localStorage.getItem(DELETED_STORES_KEY);
      return deleted ? new Set(JSON.parse(deleted)) : new Set();
    } catch (err) {
      console.error('Error reading deleted stores from localStorage:', err);
      return new Set();
    }
  };

  const saveDeletedStoreIds = (deletedIds: Set<string>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DELETED_STORES_KEY, JSON.stringify([...deletedIds]));
    } catch (err) {
      console.error('Error saving deleted stores to localStorage:', err);
    }
  };

  // Create a new store (blockchain + local state)
  const createStore = async (
    name: string,
    templateId: string,
    description: string,
    configuration: string
  ): Promise<Store | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔨 Creating shop on blockchain:', name);
      // Call blockchain function
      const response = await shopInteraction.createShop(name, templateId, description, configuration);
      console.log('✅ Shop created, response:', response);
      
      // Get the shop address
      const shopAddress = await shopInteraction.getShopDetails(name);
      console.log('📍 Shop address:', shopAddress);
      
      // Get the full shop details from the contract
      const shopDetails = await shopInteraction.getShopDetailsFromContract(shopAddress);
      console.log('📦 Shop details:', shopDetails);
      
      // Create store object for local state
      const newStore: Store = {
        id: shopAddress,
        userId: shopDetails.owner || '',
        name: shopDetails.shopName || name,
        description: shopDetails.description || description,
        templateId: shopDetails.shopType || templateId,
        customization: {
          primaryColor: '#1a1a1a',
          secondaryColor: '#d4af37',
          layout: [],
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
        },
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to local state
      setStores((prev) => [...prev, newStore]);
      console.log('✅ Store added to local state');
      
      setIsLoading(false);
      return newStore;
    } catch (err: any) {
      console.error('Error creating store:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to create store';
      if (err.message?.includes('Wallet not connected')) {
        errorMessage = 'Please connect your wallet first';
      } else if (err.message?.includes('pending')) {
        errorMessage = 'Wallet connection request pending. Please check your wallet.';
      } else if (err.message?.includes('rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Get all stores from blockchain and sync with local state
  const getAllStores = async (): Promise<Store[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching all shops from blockchain...');
      const shopNames = await shopInteraction.getAllShops();
      console.log('📦 Received shop names:', shopNames);
      
      if (!shopNames || shopNames.length === 0) {
        console.log('⚠️ No shops found on blockchain');
        setStores([]);
        setIsLoading(false);
        return [];
      }
      
      // Get deleted store IDs from localStorage
      const deletedIds = getDeletedStoreIds();
      console.log('🗑️ Deleted store IDs:', [...deletedIds]);
      
      // Convert blockchain data to Store objects
      console.log('🔄 Fetching details for each shop...');
      const storesData: (Store | null)[] = await Promise.all(
        shopNames.map(async (shopName: string) => {
          try {
            console.log(`  📍 Fetching address for: ${shopName}`);
            // getShopDetails actually calls getShopByName which returns the shop address
            const shopAddress = await shopInteraction.getShopDetails(shopName);
            console.log(`  📍 Shop address: ${shopAddress}`);
            
            // Skip if this store was deleted by the user
            if (deletedIds.has(shopAddress)) {
              console.log(`  ⏭️ Skipping deleted store: ${shopName} (${shopAddress})`);
              return null;
            }
            
            // Now get the actual shop details from the Shop contract
            const shopDetailsResult = await shopInteraction.getShopDetailsFromContract(shopAddress);
            console.log(`  ✅ Got details for ${shopName}:`, shopDetailsResult);
            
            return {
              id: shopAddress, // Use contract address as ID
              userId: shopDetailsResult.owner || '',
              name: shopDetailsResult.shopName || shopName,
              description: shopDetailsResult.description || '',
              templateId: shopDetailsResult.shopType || 'minimal',
              customization: {
                primaryColor: '#1a1a1a',
                secondaryColor: '#d4af37',
                layout: shopDetailsResult.configuration ? JSON.parse(shopDetailsResult.configuration) : [],
                fonts: {
                  heading: 'Inter',
                  body: 'Inter',
                },
              },
              isPublished: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          } catch (err) {
            console.error(`  ❌ Error fetching shop details for ${shopName}:`, err);
            return null;
          }
        })
      );

      const validStores = storesData.filter((store): store is Store => store !== null);
      console.log('✅ Successfully loaded stores:', validStores);
      setStores(validStores);
      setIsLoading(false);
      return validStores;
    } catch (err: any) {
      console.error('Error fetching stores:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to fetch stores';
      if (err.message?.includes('Wallet not connected')) {
        errorMessage = 'Please connect your wallet first';
      } else if (err.message?.includes('pending')) {
        errorMessage = 'Wallet connection request pending. Please check your wallet.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return stores; // Return cached stores
    }
  };

  // Get store by name
  const getStoreByName = async (name: string): Promise<Store | null> => {
    try {
      // First get the shop address
      const shopAddress = await shopInteraction.getShopDetails(name);
      // Then get the shop details from the contract
      const shopDetails = await shopInteraction.getShopDetailsFromContract(shopAddress);
      
      const store: Store = {
        id: shopAddress,
        userId: shopDetails.owner || '',
        name: shopDetails.shopName || name,
        description: shopDetails.description || '',
        templateId: shopDetails.shopType || 'minimal',
        customization: {
          primaryColor: '#1a1a1a',
          secondaryColor: '#d4af37',
          layout: shopDetails.configuration ? JSON.parse(shopDetails.configuration) : [],
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
        },
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return store;
    } catch (err: any) {
      console.error('Error fetching store:', err);
      setError(err.message || 'Failed to fetch store');
      return null;
    }
  };

  // Update store locally
  const updateStore = (storeId: string, updates: Partial<Store>) => {
    setStores((prev) =>
      prev.map((store) =>
        store.id === storeId
          ? { ...store, ...updates, updatedAt: new Date() }
          : store
      )
    );
  };

  // Delete store locally
  const deleteStore = (storeId: string) => {
    console.log('🗑️ Deleting store:', storeId);
    
    // Add to deleted stores list in localStorage
    const deletedIds = getDeletedStoreIds();
    deletedIds.add(storeId);
    saveDeletedStoreIds(deletedIds);
    console.log('💾 Store marked as deleted in localStorage');
    
    // Remove from current state
    setStores((prev) => prev.filter((store) => store.id !== storeId));
    // Also remove associated products
    setProducts((prev) => prev.filter((product) => product.storeId !== storeId));
  };

  // Restore a previously deleted store
  const restoreStore = async (storeId: string): Promise<void> => {
    console.log('♻️ Restoring store:', storeId);
    
    // Remove from deleted stores list in localStorage
    const deletedIds = getDeletedStoreIds();
    deletedIds.delete(storeId);
    saveDeletedStoreIds(deletedIds);
    console.log('💾 Store removed from deleted list in localStorage');
    
    // Reload all stores to get the restored store
    await getAllStores();
  };

  // Add product (blockchain + local state)
  const addProduct = async (
    shopAddress: string,
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call blockchain function
      const response = await shopInteraction.addItemToShop(
        shopAddress,
        product.name,
        product.price,
        100, // Default stock
        product.description,
        product.images
      );

      // Create product object for local state
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to local state
      setProducts((prev) => [...prev, newProduct]);
      
      setIsLoading(false);
      return newProduct;
    } catch (err: any) {
      console.error('Error adding product:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to add product';
      if (err.message?.includes('Wallet not connected')) {
        errorMessage = 'Please connect your wallet first';
      } else if (err.message?.includes('pending')) {
        errorMessage = 'Wallet connection request pending. Please check your wallet.';
      } else if (err.message?.includes('rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Get products from blockchain and sync with local state
  const getProducts = useCallback(async (shopAddress: string): Promise<Product[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📦 Fetching products for shop:', shopAddress);
      const blockchainItems = await shopInteraction.getItemsFromShop(shopAddress);
      console.log('📦 Received items:', blockchainItems);
      
      // Convert blockchain data to Product objects
      const productsData: Product[] = blockchainItems.map((item: any, index: number) => ({
        id: item.id || index.toString(),
        storeId: shopAddress,
        name: item.name || '',
        description: item.description || '',
        price: parseFloat(item.price?.toString() || '0'),
        images: item.ipfsHash || [],
        metadata: {
          sku: item.id,
          category: '',
          tags: [],
        },
        isPublished: item.isActive || false,
        createdAt: new Date(item.createdAt * 1000 || Date.now()),
        updatedAt: new Date(item.updatedAt * 1000 || Date.now()),
      }));

      console.log('✅ Converted products:', productsData);

      // Update local state with products for this store
      setProducts((prev) => {
        // Remove old products for this store
        const otherProducts = prev.filter((p) => p.storeId !== shopAddress);
        // Add new products
        return [...otherProducts, ...productsData];
      });

      setIsLoading(false);
      return productsData;
    } catch (err: any) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      setIsLoading(false);
      // Return cached products for this store
      return products.filter((p) => p.storeId === shopAddress);
    }
  }, []); // Empty dependencies - function doesn't depend on external state

  // Update product locally
  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, ...updates, updatedAt: new Date() }
          : product
      )
    );
  };

  // Delete product locally
  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  // Refresh all data from blockchain
  const refreshData = async () => {
    await getAllStores();
  };

  const value: ShopContextType = {
    stores,
    products,
    isLoading,
    error,
    createStore,
    getAllStores,
    getStoreByName,
    updateStore,
    deleteStore,
    restoreStore,
    getDeletedStoreIds,
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    refreshData,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
