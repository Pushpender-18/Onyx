'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import { Store, Product } from '@/types';
import * as shopInteraction from '@/lib/shop_interaction';

interface TotalSalesData {
  totalSalesInWei: string;
  totalSalesInEth: number;
  totalOrderCount: number;
  shopCount: number;
  shopsData: Array<{
    shopAddress: string;
    totalSalesInWei: string;
    totalSalesInEth: number;
    orderCount: number;
    orders: any[];
    error?: string;
  }>;
}

interface ShopContextType {
  stores: Store[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
  totalSalesByOwner: TotalSalesData | null;
  
  // Store operations
  createStore: (name: string, templateId: string, description: string, configuration: string, signer: any) => Promise<Store | null>;
  getAllStores: (signer: any) => Promise<Store[]>;
  getStoreByName: (name: string, signer: any) => Promise<Store | null>;
  updateStore: (storeId: string, updates: Partial<Store>) => void;
  updateConfiguration: (shopName: string, shopAddress: string, configuration: string, newShopName: string) => Promise<boolean>;
  updateShopName: (shopAddress: string, oldName: string, newName: string) => Promise<boolean>;
  deleteStore: (storeId: string) => void;
  restoreStore: (storeId: string, signer: any) => Promise<void>;
  getDeletedStoreIds: () => Set<string>;
  
  // Product operations
  addProduct: (shopAddress: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, signer: any) => Promise<Product | null>;
  getProducts: (shopAddress: string, signer: any) => Promise<Product[]>;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  updateProductOnBlockchain: (shopAddress: string, product: Product) => Promise<Product | null>;
  deleteProduct: (productId: string) => void;
  
  // Sales operations
  getTotalSalesByOwner: () => Promise<TotalSalesData | null>;
  
  // Utility
  refreshData: (signer: any) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  // Pure in-memory state - no localStorage for store data
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalSalesByOwner, setTotalSalesByOwner] = useState<TotalSalesData | null>(null);

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
    configuration: string,
    signer: any,
  ): Promise<Store | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔨 Creating shop on blockchain:', name);
      // Call blockchain function
      const response = await shopInteraction.createShop(name, templateId, description, configuration, signer);
      console.log('✅ Shop created, response:', response);
      
      // Get the shop address
      const shopAddress = await shopInteraction.getShopDetails(name, signer);
      console.log('📍 Shop address:', shopAddress);
      
      // Get the full shop details from the contract
      const shopDetails = await shopInteraction.getShopDetailsFromContract(shopAddress, signer);
      console.log('📦 Shop details:', shopDetails);
      
      // Create store object for local state
      const newStore: Store = {
        id: shopAddress,
        userId: shopDetails.owner || '',
        name: shopDetails.shopName || name,
        description: shopDetails.description || description,
        templateId: shopDetails.shopType || templateId,
        customization: undefined as any,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to local state
      setStores((prev) => [...prev, newStore]);
      console.log(' Store added to local state');
      
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
  const getAllStores = async (signer: any): Promise<Store[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching all shops from blockchain...');
      const shopNames = await shopInteraction.getAllShops(signer);
      console.log('📦 Received shop names:', shopNames);
      
      if (!shopNames || shopNames.length === 0) {
        console.log(' No shops found on blockchain');
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
            const shopAddress = await shopInteraction.getShopDetails(shopName, signer);
            console.log(`  📍 Shop address: ${shopAddress}`);
            
            // Skip if this store was deleted by the user
            if (deletedIds.has(shopAddress)) {
              console.log(`  ⏭️ Skipping deleted store: ${shopName} (${shopAddress})`);
              return null;
            }
            
            // Now get the actual shop details from the Shop contract
            const shopDetailsResult = await shopInteraction.getShopDetailsFromContract(shopAddress, signer);
            console.log(`   Got details for ${shopName}:`, shopDetailsResult);
            console.log(`   isPublished value:`, shopDetailsResult.isPublished);
            
            const storeData = {
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
              isPublished: shopDetailsResult.isPublished || false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            console.log(`  📝 Store data to be added:`, storeData);
            return storeData;
          } catch (err) {
            console.error(`   Error fetching shop details for ${shopName}:`, err);
            return null;
          }
        })
      );

      const validStores = storesData.filter((store): store is Store => store !== null);
      console.log(' Successfully loaded stores:', validStores);
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
  const getStoreByName = async (name: string, signer: any): Promise<Store | null> => {
    try {
      // First get the shop address
      const shopAddress = await shopInteraction.getShopDetails(name, signer);
      // Then get the shop details from the contract
      const shopDetails = await shopInteraction.getShopDetailsFromContract(shopAddress, signer);
      
      const store: Store = {
        id: shopAddress,
        userId: shopDetails.owner || '',
        name: shopDetails.shopName || name,
        description: shopDetails.description || '',
        templateId: shopDetails.shopType || 'minimal',
        customization: JSON.parse(shopDetails.configuration) || "",
        isPublished: shopDetails.isPublished || false,
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

  // Update configuration on blockchain and local state
  const updateConfiguration = async (shopName: string, shopAddress: string, configuration: string, newShopNaame: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔧 Updating configuration for shop:', shopName, shopAddress);
      
      console.log(shopName, newShopNaame);
      // Call blockchain function with shopName
      if (shopName !== newShopNaame) {
        console.log(' Shop name has changed. Updating to new name:', newShopNaame);
        await updateShopName(shopAddress, shopName, newShopNaame);
      }

      await shopInteraction.updateShopConfiguration(shopAddress, configuration, newShopNaame);
      console.log(' Configuration updated on blockchain');
      
      // Update local state
      setStores((prev) =>
        prev.map((store) =>
          store.id === shopAddress
            ? {
                ...store,
                customization: {
                  ...store.customization,
                  layout: JSON.parse(configuration),
                },
                updatedAt: new Date(),
              }
            : store
        )
      );
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('Error updating configuration:', err);
      
      let errorMessage = 'Failed to update configuration';
      if (err.message?.includes('Wallet not connected')) {
        errorMessage = 'Please connect your wallet first';
      } else if (err.message?.includes('rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
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
  const restoreStore = async (storeId: string, signer: any): Promise<void> => {
    console.log('♻️ Restoring store:', storeId);
    
    // Remove from deleted stores list in localStorage
    const deletedIds = getDeletedStoreIds();
    deletedIds.delete(storeId);
    saveDeletedStoreIds(deletedIds);
    console.log('💾 Store removed from deleted list in localStorage');
    
    // Reload all stores to get the restored store
    await getAllStores(signer);
  };

  // Add product (blockchain + local state)
  const addProduct = async (
    shopAddress: string,
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
    signer: any
  ): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call blockchain function
      const response = await shopInteraction.addItemToShop(
        shopAddress,
        product.name,
        product.price,
        product.stock,
        product.description,
        product.images,
        signer
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
  const getProducts = useCallback(async (shopAddress: string, signer: any): Promise<Product[]> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📦 Fetching products for shop:', shopAddress);
      const blockchainItems = await shopInteraction.getItemsFromShop(shopAddress, signer);
      console.log('📦 Received items:', blockchainItems);
      
      // Convert blockchain data to Product objects
      const productsData: Product[] = blockchainItems.map((item: any, index: number) => {
        // Parse timestamps - they are stored as strings representing Unix timestamps in seconds
        const createdTimestamp = item.createdAt ? parseInt(item.createdAt.toString()) * 1000 : Date.now();
        const updatedTimestamp = item.updatedAt ? parseInt(item.updatedAt.toString()) * 1000 : Date.now();
        
        return {
          id: item.id || index.toString(),
          storeId: shopAddress,
          name: item.name || '',
          description: item.description || '',
          price: parseFloat(ethers.formatUnits(item.price || 0, 18)),
          stock: item.stock || 0,
          images: item.ipfsHash || [],
          metadata: {
            sku: item.id,
            category: '',
            tags: [],
          },
          isPublished: item.isActive || false,
          createdAt: new Date(createdTimestamp),
          updatedAt: new Date(updatedTimestamp),
        };
      });

      console.log(' Converted products:', productsData);

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
      console.error(' Error fetching products:', err);
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

  // Update product on blockchain and local state
  const updateProductOnBlockchain = async (
    shopAddress: string,
    product: Product
  ): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call blockchain function
      const response = await shopInteraction.updateItemInShop(
        shopAddress,
        product.id,
        product.name,
        product.price,
        product.stock,
        product.description,
        product.images
      );

      // Update product in local state
      const updatedProduct: Product = {
        ...product,
        updatedAt: new Date(),
      };

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? updatedProduct : p
        )
      );
      
      setIsLoading(false);
      return updatedProduct;
    } catch (err: any) {
      console.error('Error updating product:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to update product';
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

  // Delete product locally
  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  // Get total sales from stores in state (blockchain read operation)
  const getTotalSalesByOwner = async (): Promise<TotalSalesData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('💰 Fetching total sales for stores in state');
      console.log('📊 Number of stores:', stores.length);
      
      if (stores.length === 0) {
        console.log('📭 No stores found in state');
        const emptyData: TotalSalesData = {
          totalSalesInWei: '0',
          totalSalesInEth: 0,
          totalOrderCount: 0,
          shopCount: 0,
          shopsData: []
        };
        setTotalSalesByOwner(emptyData);
        setIsLoading(false);
        return emptyData;
      }
      
      // Extract shop addresses from stores state
      const shopAddresses = stores.map(store => store.id);
      console.log('🏪 Shop addresses:', shopAddresses);
      
      // Fetch sales data for each shop
      let overallTotalSalesInWei = BigInt(0);
      let overallTotalOrderCount = 0;
      const shopsData = [];
      
      for (const shopAddress of shopAddresses) {
        try {
          console.log(`📊 Fetching sales for shop: ${shopAddress}`);
          const shopSales = await shopInteraction.getTotalSalesFromShop(shopAddress);
          
          // Add to overall totals
          overallTotalSalesInWei += BigInt(shopSales.totalSalesInWei);
          overallTotalOrderCount += shopSales.orderCount;
          
          shopsData.push({
            shopAddress,
            totalSalesInWei: shopSales.totalSalesInWei,
            totalSalesInEth: shopSales.totalSalesInEth,
            orderCount: shopSales.orderCount,
            orders: shopSales.orders
          });
        } catch (error) {
          console.error(` Error fetching sales for shop ${shopAddress}:`, error);
          // Continue with other shops even if one fails
          shopsData.push({
            shopAddress,
            totalSalesInWei: '0',
            totalSalesInEth: 0,
            orderCount: 0,
            orders: [],
            error: 'Failed to fetch sales data'
          });
        }
      }
      
      // Convert total from wei to ETH
      const overallTotalSalesInEth = Number(ethers.formatUnits(overallTotalSalesInWei.toString(), 18));
      
      const salesData: TotalSalesData = {
        totalSalesInWei: overallTotalSalesInWei.toString(),
        totalSalesInEth: overallTotalSalesInEth,
        totalOrderCount: overallTotalOrderCount,
        shopCount: shopAddresses.length,
        shopsData
      };
      
      console.log('✅ Overall totals:', salesData);
      
      // Update local state
      setTotalSalesByOwner(salesData);
      
      setIsLoading(false);
      return salesData;
    } catch (err: any) {
      console.error(' Error fetching total sales:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to fetch total sales';
      if (err.message?.includes('Wallet not connected')) {
        errorMessage = 'Please connect your wallet first';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  // Update shop name on blockchain (write operation - requires correct network)
  const updateShopName = async (shopAddress: string, oldName: string, newName: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('✏️ Updating shop name:', oldName, '->', newName);
      console.log('📍 Shop address:', shopAddress);
      
      // Call blockchain function to update shop name in Master contract
      await shopInteraction.updateShopName(shopAddress, oldName, newName);
      console.log('✅ Shop name updated on blockchain');
      
      // Update local state
      setStores((prev) =>
        prev.map((store) =>
          store.id === shopAddress
            ? {
                ...store,
                name: newName,
                updatedAt: new Date(),
              }
            : store
        )
      );
      
      console.log('✅ Shop name updated in local state');
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('❌ Error updating shop name:', err);
      
      let errorMessage = 'Failed to update shop name';
      if (err.message?.includes('Wallet not connected')) {
        errorMessage = 'Please connect your wallet first';
      } else if (err.message?.includes('rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message?.includes('Only shop owner')) {
        errorMessage = 'Only the shop owner can update the name';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  // Refresh all data from blockchain
  const refreshData = async (signer: any) => {
    await getAllStores(signer);
  };

  const value: ShopContextType = {
    stores,
    products,
    isLoading,
    error,
    totalSalesByOwner,
    createStore,
    getAllStores,
    getStoreByName,
    updateStore,
    updateConfiguration,
    updateShopName,
    deleteStore,
    restoreStore,
    getDeletedStoreIds,
    addProduct,
    getProducts,
    updateProduct,
    updateProductOnBlockchain,
    deleteProduct,
    getTotalSalesByOwner,
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
