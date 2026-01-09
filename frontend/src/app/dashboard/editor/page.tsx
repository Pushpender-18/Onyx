'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect, useTransition } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useShop } from '@/context/ShopContext';
import { Store as StoreType, Product, StoreCustomization as StoreData } from '@/types';
import {
  ArrowLeft,
  Eye,
  FloppyDisk,
  Trash,
  MagnifyingGlass,
  FunnelSimple,
  Plus,
  X,
  ShoppingCart,
  House,
  Storefront,
  Upload,
  PencilSimple,
  XCircle,
  Question,
  EnvelopeSimple,
} from 'phosphor-react';
import { TEMPLATES, DEFAULT_TEMPLATE, type TemplateConfig } from '../templateConfig';
import { SavePublishModal } from '@/components/SavePublishModal';
import { publishShop, updateShopConfiguration } from '@/lib/shop_interaction';

type PageType = 'home' | 'shop' | 'product' | 'about' | 'contact' | 'cart' | 'checkout';

export default function StoreEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeName = searchParams.get('storeName') || 'My Store';
  const storeId = searchParams.get('storeId'); // Get storeId from URL
  const templateId = (searchParams.get('template') || 'minimal') as keyof typeof TEMPLATES;
  
  // Use Shop context for blockchain operations
  const { stores, products: blockchainProducts, addProduct: addProductToBlockchain, getProducts, getStoreByName } = useShop();
  const [currentStore, setCurrentStore] = useState<StoreType | null>(null);
  const [loadingStore, setLoadingStore] = useState(false);
  const [hasLoadedStore, setHasLoadedStore] = useState(false); // Flag to prevent re-loading
  
  // Load the selected template or use default
  const selectedTemplate: TemplateConfig = TEMPLATES[templateId] || DEFAULT_TEMPLATE;
  
  const [storeData, setStoreData] = useState<StoreData>({
    storeName: storeName,
    heroTitle: selectedTemplate.heroTitle,
    heroSubtitle: selectedTemplate.heroSubtitle,
    heroImage: selectedTemplate.heroImage,
    products: [],
    categories: selectedTemplate.categories,
    primaryColor: selectedTemplate.primaryColor,
    secondaryColor: selectedTemplate.secondaryColor,
    accentColor: selectedTemplate.accentColor,
    textColor: selectedTemplate.textColor,
    aboutText: selectedTemplate.aboutText,
    contactEmail: selectedTemplate.contactEmail,
  });
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [cartItems, setCartItems] = useState<{ id: string; quantity: number }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [showHeroImageUploadModal, setShowHeroImageUploadModal] = useState(false);
  const [heroUploadedImage, setHeroUploadedImage] = useState<string | null>(null);
  const [isHeroImageUpload, setIsHeroImageUpload] = useState(false);
  const [showSavePublishModal, setShowSavePublishModal] = useState(false);

  // Load store and products from blockchain on mount
  useEffect(() => {
    const loadStoreData = async () => {
      // Only load once
      if (hasLoadedStore || (!storeId && !storeName)) return;

      setLoadingStore(true);
      try {
        console.log('🔄 Loading store data for editor...');
        
        // Find store by ID or name
        let foundStore: StoreType | null = null;
        
        if (storeId) {
          foundStore = stores.find(s => s.id === storeId) || null;
        } else {
          foundStore = stores.find(s => s.name.toLowerCase() === storeName.toLowerCase()) || null;
          if (!foundStore) {
            foundStore = await getStoreByName(storeName);
          }
        }

        if (foundStore) {
          const data = await getStoreByName(foundStore.name);
          console.log('✅ Store found:', data);
          setCurrentStore(data);

          // Load products for this store
          const storeProducts = await getProducts(foundStore.id);
          console.log('📦 Loaded products:', storeProducts);

          // No conversion needed - storeProducts is already Product[]
          
          console.log(data?.customization);

          setStoreData(prev => ({
            ...prev,
            storeName: data?.name || prev.storeName,
            heroTitle: data?.customization.heroTitle || prev.heroTitle,
            heroSubtitle: data?.customization.heroSubtitle || prev.heroSubtitle,
            heroImage: data?.customization.heroImage || prev.heroImage,
            aboutText: data?.customization.aboutText || prev.aboutText,
            contactEmail: data?.customization.contactEmail || prev.contactEmail,
            primaryColor: data?.customization.primaryColor || prev.primaryColor,
            products: storeProducts, // Use directly instead of converting
          }));
          
          setHasLoadedStore(true); // Mark as loaded
        }
      } catch (error) {
        console.error('❌ Error loading store data:', error);
        toast.error('Failed to load store data');
      } finally {
        setLoadingStore(false);
      }
    };

    loadStoreData();
  }, [storeId, storeName]); // Removed 'stores' from dependencies

  const filteredProducts = storeData.products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.metadata?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateStoreData = (updates: Partial<StoreData>) => {
    setStoreData((prev) => ({ ...prev, ...updates }));
  };

  const addToCart = (productId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateProduct = async (updatedProduct: Product) => {
    if (!currentStore) {
      toast.error('Store not loaded. Please refresh the page.');
      return;
    }

    try {
      // Check if this is a new product (not yet in blockchain)
      const existingProduct = storeData.products.find(p => p.id === updatedProduct.id);
      const isNewProduct = !existingProduct || existingProduct.id.startsWith('temp-');

      if (isNewProduct) {
        // Add new product to blockchain
        console.log('➕ Adding new product to blockchain:', updatedProduct);
        const newProduct = await addProductToBlockchain(currentStore.id, {
          name: updatedProduct.name,
          storeId: currentStore.id,
          price: updatedProduct.price,
          description: updatedProduct.description,
          images: updatedProduct.images,
          metadata: updatedProduct.metadata,
          isPublished: true,
        });

        if (newProduct) {
          // Update local state with blockchain product
          setStoreData((prev) => ({
            ...prev,
            products: prev.products.map((p) =>
              p.id === updatedProduct.id ? newProduct : p
            ),
          }));
          toast.success('Product added successfully!');
        } else {
          toast.error('Failed to add product to blockchain');
          return;
        }
      } else {
        // Update existing product (currently just local state)
        // TODO: Add blockchain update function when available
        setStoreData((prev) => ({
          ...prev,
          products: prev.products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ),
        }));
        toast.success('Product updated!');
      }

      setEditingProduct(null);
      setShowProductModal(false);
    } catch (error) {
      console.error('❌ Error updating product:', error);
      toast.error('Failed to save product');
    }
  };

  const deleteProduct = (productId: string) => {
    setStoreData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }));
  };

  const addNewProduct = () => {
    if (!currentStore) {
      toast.error('Store not loaded. Please refresh the page.');
      return;
    }
    
    // Navigate to the Add Product page with store info
    const currentUrl = window.location.pathname + window.location.search;
    router.push(`/dashboard/products/add?storeId=${currentStore.id}&storeName=${encodeURIComponent(currentStore.name)}&returnUrl=${encodeURIComponent(currentUrl)}`);
  };

  // Publish handler
  const handlePublish = async (finalStoreName: string) => {
    if (!currentStore) {
      toast.error('Store not found. Please refresh the page.');
      return;
    }

    const loadingToast = toast.loading('Preparing to publish store...');

    try {
      console.log('📢 Publishing store to blockchain...');
      console.log('Store address:', currentStore.id);
      console.log('Store name:', finalStoreName);
      
      // Update toast to show MetaMask is needed
      toast.loading('Please confirm transaction in MetaMask...', { id: loadingToast });
      
      
      // Call blockchain function to publish the shop
      const result = await publishShop(currentStore.id);
      
      
      // Save UI customization data to localStorage for quick access
      const uiCustomization = {
        storeName: finalStoreName,
          heroTitle: storeData.heroTitle,
          heroSubtitle: storeData.heroSubtitle,
          heroImage: storeData.heroImage,
          aboutText: storeData.aboutText,
          contactEmail: storeData.contactEmail,
          primaryColor: storeData.primaryColor,
          secondaryColor: storeData.secondaryColor,
          accentColor: storeData.accentColor,
          textColor: storeData.textColor,
          products: storeData.products,
          categories: storeData.categories,
        };
      
      const uiCustomizationString = JSON.stringify(uiCustomization);

      // Update configuration on blockchain
      console.log('🔧 Updating shop configuration...');
      const configUpdated = await updateShopConfiguration(currentStore.id, uiCustomizationString, currentStore.name);
      
      if (!configUpdated) {
        throw new Error('Failed to update shop configuration');
      }
      
      console.log('✅ Configuration updated successfully');
      
      // Save to localStorage for quick access
      localStorage.setItem(
        `onyx-ui-${currentStore.id}`,
        uiCustomizationString
      );

      toast.success(`Store "${finalStoreName}" is now live!`, { id: loadingToast });

      // Redirect to the published store after a short delay
      setTimeout(() => {
        window.location.href = `/${finalStoreName}`;
      }, 2000);
    } catch (error: any) {
      console.error('❌ Error publishing store:', error);
      
      let errorMessage = 'Failed to publish store';
      if (error.message?.includes('rejected')) {
        errorMessage = 'Transaction rejected';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas';
      } else if (error.message?.includes('Only owner')) {
        errorMessage = 'Only store owner can publish';
      } else if (error.message?.includes('already published')) {
        errorMessage = 'Store is already published';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  // Professional Navbar Component
  const Navbar = () => (
    <div
      className="sticky top-0 z-40 border-b shadow-lg"
      style={{
        background: selectedTemplate.navGradient || storeData.primaryColor,
        borderColor: storeData.secondaryColor,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold" style={{ color: storeData.accentColor }}>
            {storeData.storeName}
          </h1>
          <nav className="hidden md:flex items-center gap-8">
            {selectedTemplate.navItems.map((item) => {
              const IconComponent = item.icon as any;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.page)}
                  className="text-sm font-semibold transition-colors hover:opacity-70 flex items-center gap-2"
                  style={{ color: currentPage === item.page ? storeData.accentColor : '#cbd5e1' }}
                >
                  <IconComponent size={18} weight="fill" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        <button
          onClick={() => setCurrentPage('cart')}
          className="relative px-6 py-2 rounded font-semibold text-white text-sm transition-all hover:shadow-lg flex items-center gap-2"
          style={{ backgroundColor: storeData.accentColor }}
        >
          <ShoppingCart size={18} weight="fill" />
          CART ({cartItems.length})
        </button>
      </div>
    </div>
  );

  // Hero Section
  const HeroSection = () => (
    <div
      className="relative h-96 overflow-hidden rounded-2xl shadow-2xl"
      style={{
        backgroundImage: `url('${storeData.heroImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: selectedTemplate.heroGradient || 'linear-gradient(135deg, rgba(10, 14, 39, 0.75) 0%, rgba(26, 31, 58, 0.6) 100%)',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <motion.h2
          className="text-5xl md:text-6xl font-bold mb-4 leading-tight"
          style={{ color: storeData.textColor }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {storeData.heroTitle}
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl mb-8 max-w-2xl font-light"
          style={{ color: '#cbd5e1' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {storeData.heroSubtitle}
        </motion.p>
        <motion.button
          className="px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-2xl"
          style={{ 
            backgroundColor: storeData.accentColor,
            color: storeData.primaryColor
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setCurrentPage('shop')}
        >
          SHOP NOW
        </motion.button>
      </div>
    </div>
  );

  // Category Filter Section
  const CategoryFilter = () => (
    <div
      className="py-8 border-b"
      style={{ 
        background: `linear-gradient(180deg, ${storeData.secondaryColor} 0%, ${storeData.primaryColor} 100%)`
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-xs font-bold mb-6 uppercase tracking-widest" style={{ color: '#a0aec0' }}>
          Browse by Category
        </h3>
        <div className="flex flex-wrap gap-3">
          {storeData.categories.map((category) => {
            const IconComponent = selectedTemplate.categoryIcons?.[category] as any;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'shadow-lg'
                    : ''
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === category ? storeData.accentColor : '#2d3748',
                  color: selectedCategory === category ? '#0a0e27' : '#cbd5e1',
                  border: selectedCategory === category ? 'none' : '1px solid #4a5568',
                }}
              >
                {IconComponent && <IconComponent size={16} weight="fill" />}
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Search Bar
  const SearchFilterBar = () => (
    <div
      className="py-6 border-b"
      style={{ 
        backgroundColor: storeData.primaryColor,
        borderColor: storeData.secondaryColor
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass
              className="absolute left-4 top-1/2 -translate-y-1/2"
              size={18}
              color="#718096"
              weight="bold"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none transition-all"
              style={{ 
                backgroundColor: '#2d3748',
                color: '#e8eaed',
                borderColor: '#4a5568',
                border: '1px solid #4a5568',
                '--tw-ring-color': storeData.accentColor
              } as any}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all"
            style={{
              backgroundColor: '#2d3748',
              color: '#cbd5e1',
              border: '1px solid #4a5568'
            }}
          >
            <FunnelSimple size={18} weight="bold" />
            <span className="font-semibold text-sm">Filter</span>
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="mt-6 p-4 rounded-lg"
              style={{ backgroundColor: storeData.secondaryColor }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase" style={{ color: '#a0aec0' }}>
                    Sort By
                  </label>
                  <select className="w-full px-3 py-2 rounded text-sm" style={{ 
                    backgroundColor: '#1a1f3a',
                    color: '#e8eaed',
                    border: '1px solid #4a5568'
                  }}>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Best Sellers</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // Products Grid
  const ProductsSection = () => (
    <div className="py-12" style={{ backgroundColor: storeData.primaryColor }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-2" style={{ color: storeData.textColor }}>Featured Products</h2>
          <p style={{ color: '#a0aec0' }}>
            Showing {filteredProducts.length} of {storeData.products.length} products
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#a0aec0' }} className="text-lg">No products found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const productImage = product.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop';
              const productCategory = product.metadata?.category || 'General';
              const productBadge = product.isPublished ? undefined : 'Draft';
              
              return (
                <motion.div
                  key={product.id}
                  className="group rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: storeData.secondaryColor,
                    border: '1px solid #4a5568'
                  }}
                  whileHover={{ y: -6, boxShadow: `0 20px 25px -5px ${storeData.accentColor}33` }}
                  onClick={() => {
                    setSelectedProduct(product);
                    setCurrentPage('product');
                  }}
                >
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${storeData.accentColor}dd 0%, #0a0e27 100%)`,
                      }}
                    >
                      <button
                        className="px-6 py-2 bg-white rounded-lg font-semibold text-sm transition-all hover:shadow-lg"
                        style={{ color: storeData.accentColor }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                          setCurrentPage('product');
                        }}
                      >
                        Quick View
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: storeData.accentColor,
                          color: storeData.primaryColor
                        }}
                      >
                        {productCategory}
                      </span>
                      {productBadge && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ 
                          backgroundColor: '#4a5568',
                          color: '#fbbf24'
                        }}>
                          {productBadge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-1" style={{ color: storeData.textColor }}>{product.name}</h3>
                    <p style={{ color: '#a0aec0' }} className="text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: storeData.accentColor }}
                      >
                        ${product.price.toFixed(2)}
                      </span>
                      <button
                        className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-lg"
                        style={{ 
                          backgroundColor: storeData.accentColor,
                          color: storeData.primaryColor
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product.id);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Product Detail Page
  const ProductDetailPage = () => {
    if (!selectedProduct) return null;
    
    const productImage = selectedProduct.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop';
    const productCategory = selectedProduct.metadata?.category || 'General';

    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => setCurrentPage('shop')}
            className="mb-8 flex items-center gap-2 px-4 py-2"
            style={{ color: storeData.accentColor }}
          >
            <ArrowLeft size={20} />
            Back to Shop
          </button>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Image */}
            <motion.div
              className="rounded-lg overflow-hidden bg-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <img
                src={productImage}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Product Info */}
            <motion.div
              className="flex flex-col justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="mb-6">
                <span
                  className="inline-block text-sm font-bold px-4 py-1 rounded-full text-white mb-4"
                  style={{ backgroundColor: storeData.accentColor }}
                >
                  {productCategory}
                </span>
                <h1 className="text-5xl font-bold mb-2" style={{ color: storeData.accentColor }}>{selectedProduct.name}</h1>
                <p className="text-lg" style={{ color: '#a0aec0' }}>{selectedProduct.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-5xl font-bold"
                    style={{ color: storeData.accentColor }}
                  >
                    ${selectedProduct.price.toFixed(2)}
                  </span>
                  <span style={{ color: '#a0aec0' }}>USD</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>Quantity</label>
                  <div className="flex items-center gap-4 w-fit border rounded-lg p-2" style={{ borderColor: '#2d3748', color: '#cbd5e1' }}>
                    <button className="text-xl hover:opacity-70">−</button>
                    <span className="w-8 text-center">1</span>
                    <button className="text-xl hover:opacity-70">+</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => addToCart(selectedProduct.id)}
                  className="flex-1 px-8 py-4 rounded font-semibold text-white text-lg transition-all hover:shadow-lg"
                  style={{ backgroundColor: storeData.accentColor }}
                >
                  Add to Cart
                </button>
                <button
                  className="flex-1 px-8 py-4 rounded font-semibold border-2 transition-all"
                  style={{ borderColor: storeData.accentColor, color: storeData.accentColor }}
                >
                  Save for Later
                </button>
              </div>

              <div className="mt-12 pt-8 border-t" style={{ borderColor: '#2d3748' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: storeData.accentColor }}>Details</h3>
                <ul className="space-y-3" style={{ color: '#a0aec0' }}>
                  <li className="flex justify-between">
                    <span>Category:</span>
                    <strong style={{ color: '#cbd5e1' }}>{productCategory}</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>SKU:</span>
                    <strong style={{ color: '#cbd5e1' }}>{selectedProduct.id}</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>In Stock:</span>
                    <strong style={{ color: storeData.accentColor }}>Yes</strong>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  // About Page
  const AboutPage = () => (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-6">
        <button
          onClick={() => setCurrentPage('home')}
          className="mb-8 flex items-center gap-2 px-4 py-2"
          style={{ color: storeData.accentColor }}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-5xl font-bold mb-8" style={{ color: storeData.accentColor }}>About Us</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed mb-6" style={{ color: '#a0aec0' }}>
              {storeData.aboutText}
            </p>
            <p className="leading-relaxed mb-6" style={{ color: '#cbd5e1' }}>
              Since our founding, we have been committed to bringing you the finest curated goods from artisans and makers
              around the world. Each product is carefully selected to ensure it meets our high standards for quality,
              craftsmanship, and sustainability.
            </p>
            <p className="leading-relaxed" style={{ color: '#cbd5e1' }}>
              We believe that buying mindfully means choosing quality over quantity. Our products are designed to last,
              bringing joy and functionality to your home for years to come.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Contact Page
  const ContactPage = () => (
    <div className="py-16">
      <div className="max-w-2xl mx-auto px-6">
        <button
          onClick={() => setCurrentPage('home')}
          className="mb-8 flex items-center gap-2 px-4 py-2"
          style={{ color: storeData.accentColor }}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-5xl font-bold mb-4" style={{ color: storeData.accentColor }}>Contact Us</h1>
          <p className="text-xl mb-12" style={{ color: '#a0aec0' }}>
            We would love to hear from you. Get in touch with us today!
          </p>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="Your name"
                style={{ 
                  '--tw-ring-color': storeData.accentColor,
                  borderColor: '#2d3748',
                  backgroundColor: '#1a1f3a',
                  color: '#cbd5e1'
                } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="your@email.com"
                style={{ 
                  '--tw-ring-color': storeData.accentColor,
                  borderColor: '#2d3748',
                  backgroundColor: '#1a1f3a',
                  color: '#cbd5e1'
                } as any}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#cbd5e1' }}>Message</label>
              <textarea
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                placeholder="Your message"
                rows={6}
                style={{ 
                  '--tw-ring-color': storeData.accentColor,
                  borderColor: '#2d3748',
                  backgroundColor: '#1a1f3a',
                  color: '#cbd5e1'
                } as any}
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 rounded font-semibold text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: storeData.accentColor }}
            >
              Send Message
            </button>
          </form>

          <div className="mt-12 pt-12 border-t" style={{ borderColor: '#2d3748' }}>
            <h3 className="text-2xl font-bold mb-6" style={{ color: storeData.accentColor }}>Other Ways to Reach Us</h3>
            <div className="space-y-4" style={{ color: '#a0aec0' }}>
              <p>
                <strong style={{ color: '#cbd5e1' }}>Email:</strong> {storeData.contactEmail}
              </p>
              <p>
                <strong style={{ color: '#cbd5e1' }}>Hours:</strong> Monday - Friday, 9 AM - 5 PM EST
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Shopping Cart Page
  const CartPage = () => {
    const cartProducts = cartItems
      .map((item) => ({
        ...storeData.products.find((p) => p.id === item.id),
        quantity: item.quantity,
      }))
      .filter((p) => p) as (Product & { quantity: number })[];

    const total = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <button
            onClick={() => setCurrentPage('shop')}
            className="mb-8 flex items-center gap-2 px-4 py-2"
            style={{ color: storeData.accentColor }}
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>

          <h1 className="text-5xl font-bold mb-12" style={{ color: storeData.accentColor }}>Shopping Cart</h1>

          {cartProducts.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart size={64} className="mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <p className="text-2xl mb-8" style={{ color: '#a0aec0' }}>Your cart is empty</p>
              <button
                onClick={() => setCurrentPage('shop')}
                className="px-6 py-3 rounded font-semibold text-white"
                style={{ backgroundColor: storeData.accentColor }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="md:col-span-2">
                <div className="space-y-4">
                  {cartProducts.map((item) => {
                    const itemImage = item.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop';
                    
                    return (
                      <div
                        key={item.id}
                        className="flex gap-6 p-6 border rounded-lg"
                        style={{ borderColor: '#2d3748', backgroundColor: '#1a1f3a' }}
                      >
                        <img
                          src={itemImage}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold" style={{ color: '#cbd5e1' }}>{item.name}</h3>
                          <p style={{ color: '#a0aec0' }}>${item.price.toFixed(2)}</p>
                          <div className="flex items-center gap-4 mt-4">
                            <span className="text-sm" style={{ color: '#a0aec0' }}>Qty: {item.quantity}</span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold" style={{ color: storeData.accentColor }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-6 rounded-lg h-fit border" style={{ backgroundColor: '#1a1f3a', borderColor: '#2d3748' }}>
                <h3 className="text-xl font-bold mb-6" style={{ color: storeData.accentColor }}>Order Summary</h3>
                <div className="space-y-4 mb-6" style={{ color: '#a0aec0' }}>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>$10.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(total * 0.1).toFixed(2)}</span>
                  </div>
                </div>
                <div
                  className="border-t pt-4 mb-6 flex justify-between text-xl font-bold"
                  style={{ borderColor: '#2d3748', color: storeData.accentColor }}
                >
                  <span>Total</span>
                  <span>${(total + 10 + total * 0.1).toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setCurrentPage('checkout')}
                  className="w-full px-6 py-3 rounded font-semibold text-white transition-all hover:shadow-lg"
                  style={{ backgroundColor: storeData.accentColor }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Checkout Page
  const CheckoutPage = () => {
    const cartProducts = cartItems
      .map((item) => ({
        ...storeData.products.find((p) => p.id === item.id),
        quantity: item.quantity,
      }))
      .filter((p) => p) as (Product & { quantity: number })[];
    const total = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => setCurrentPage('cart')}
            className="mb-8 flex items-center gap-2 px-4 py-2"
            style={{ color: storeData.accentColor }}
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>

          <h1 className="text-5xl font-bold mb-12" style={{ color: storeData.accentColor }}>Checkout</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="md:col-span-2 p-8 rounded-lg" style={{ backgroundColor: '#1a1f3a' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: storeData.accentColor }}>Shipping Information</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      '--tw-ring-color': storeData.accentColor,
                      borderColor: '#2d3748',
                      backgroundColor: '#0a0e27',
                      color: '#cbd5e1'
                    } as any}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      '--tw-ring-color': storeData.accentColor,
                      borderColor: '#2d3748',
                      backgroundColor: '#0a0e27',
                      color: '#cbd5e1'
                    } as any}
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    '--tw-ring-color': storeData.accentColor,
                    borderColor: '#2d3748',
                    backgroundColor: '#0a0e27',
                    color: '#cbd5e1'
                  } as any}
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    '--tw-ring-color': storeData.accentColor,
                    borderColor: '#2d3748',
                    backgroundColor: '#0a0e27',
                    color: '#cbd5e1'
                  } as any}
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      '--tw-ring-color': storeData.accentColor,
                      borderColor: '#2d3748',
                      backgroundColor: '#0a0e27',
                      color: '#cbd5e1'
                    } as any}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      '--tw-ring-color': storeData.accentColor,
                      borderColor: '#2d3748',
                      backgroundColor: '#0a0e27',
                      color: '#cbd5e1'
                    } as any}
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      '--tw-ring-color': storeData.accentColor,
                      borderColor: '#2d3748',
                      backgroundColor: '#0a0e27',
                      color: '#cbd5e1'
                    } as any}
                  />
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6" style={{ color: storeData.accentColor }}>Payment Information</h2>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    '--tw-ring-color': storeData.accentColor,
                    borderColor: '#2d3748',
                    backgroundColor: '#0a0e27',
                    color: '#cbd5e1'
                  } as any}
                />
                <input
                  type="text"
                  placeholder="Card Number"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    '--tw-ring-color': storeData.accentColor,
                    borderColor: '#2d3748',
                    backgroundColor: '#0a0e27',
                    color: '#cbd5e1'
                  } as any}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      '--tw-ring-color': storeData.accentColor,
                      borderColor: '#2d3748',
                      backgroundColor: '#0a0e27',
                      color: '#cbd5e1'
                    } as any}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ 
                      '--tw-ring-color': storeData.accentColor,
                      borderColor: '#2d3748',
                      backgroundColor: '#0a0e27',
                      color: '#cbd5e1'
                    } as any}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 rounded font-bold text-lg text-white transition-all hover:shadow-lg mt-8"
                  style={{ backgroundColor: storeData.accentColor }}
                >
                  Place Order
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="p-6 rounded-lg h-fit" style={{ backgroundColor: '#1a1f3a' }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: storeData.accentColor }}>Order Summary</h3>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto" style={{ color: '#a0aec0' }}>
                {cartProducts.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-6" style={{ borderTop: `1px solid #2d3748`, color: '#a0aec0' }}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(total * 0.1).toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between text-lg font-bold pt-4"
                  style={{ borderTop: `2px solid ${storeData.accentColor}`, color: storeData.accentColor }}
                >
                  <span>Total</span>
                  <span>${(total + 10 + total * 0.1).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Product Edit Modal
  const ProductEditModal = () => {
    if (!editingProduct || !showProductModal) return null;

    const productImage = editingProduct.images?.[0] || '';
    const productCategory = editingProduct.metadata?.category || '';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        <motion.div
          className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Product</h2>
            <button
              onClick={() => {
                setShowProductModal(false);
                setEditingProduct(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Product Name</label>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={productCategory}
                  onChange={(e) =>
                    setEditingProduct({ 
                      ...editingProduct, 
                      metadata: { ...editingProduct.metadata, category: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {storeData.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Product Image</label>
              <div className="space-y-3">
                {/* Current Image Preview */}
                {productImage && (
                  <div className="w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                    <div className="relative w-full aspect-square">
                      <img
                        src={productImage}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Image URL Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={productImage}
                    onChange={(e) =>
                      setEditingProduct({ 
                        ...editingProduct, 
                        images: [e.target.value]
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                {/* Upload Button */}
                <button
                  onClick={() => setShowImageUploadModal(true)}
                  className="w-full px-4 py-2 border-2 border-dashed border-blue-400 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Or Upload from Computer
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Recommended: 1:1 aspect ratio (square) • 500x500px
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => updateProduct(editingProduct)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                {editingProduct.id.startsWith('temp-') ? 'Add Product' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Image Upload and Crop Modal
  const ImageUploadModal = () => {
    if (!showImageUploadModal) return null;

    // Use callbacks to prevent re-rendering the entire modal on slider changes
    const handleCropScaleChange = useCallback((value: number) => {
      setCropScale(value);
    }, []);

    const handleCropOffsetXChange = useCallback((value: number) => {
      setCropOffsetX(value);
    }, []);

    const handleCropOffsetYChange = useCallback((value: number) => {
      setCropOffsetY(value);
    }, []);

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upload Product Image</h2>
            <button
              onClick={() => {
                setShowImageUploadModal(false);
                setUploadedImage(null);
                setCropScale(1);
                setCropOffsetX(0);
                setCropOffsetY(0);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-4 border-b pb-4">
              <button
                onClick={() => {
                  setImageUploadMode('upload');
                  setUploadedImage(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  imageUploadMode === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Upload size={18} className="inline mr-2" />
                Upload from Computer
              </button>
              <button
                onClick={() => setImageUploadMode('url')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  imageUploadMode === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Use Image URL
              </button>
            </div>

            {/* Upload from Computer */}
            {imageUploadMode === 'upload' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Select Image (Recommended: 1:1 aspect ratio for products)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setUploadedImage(event.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-700 font-semibold mb-1">Click to upload</p>
                      <p className="text-sm text-gray-500">or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                </div>

                {/* Image Preview and Crop */}
                {uploadedImage && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Preview</label>
                      {/* <ImagePreview src={uploadedImage} scale={cropScale} offsetX={cropOffsetX} offsetY={cropOffsetY} /> */}
                    </div>

                    {/* Crop Controls */}
                    {/* <CropControls
                      scale={cropScale}
                      offsetX={cropOffsetX}
                      offsetY={cropOffsetY}
                      onScaleChange={handleCropScaleChange}
                      onOffsetXChange={handleCropOffsetXChange}
                      onOffsetYChange={handleCropOffsetYChange}
                    /> */}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Aspect Ratio:</strong> 1:1 (Square) is recommended for product images. The image will display at 500x500px in the store.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (editingProduct) {
                            setEditingProduct({
                              ...editingProduct,
                              images: [uploadedImage],
                            });
                          }
                          setShowImageUploadModal(false);
                          setUploadedImage(null);
                          setCropScale(1);
                          setCropOffsetX(0);
                          setCropOffsetY(0);
                        }}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Use This Image
                      </button>
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setCropScale(1);
                          setCropOffsetX(0);
                          setCropOffsetY(0);
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* URL Input Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    defaultValue={editingProduct?.images?.[0] || ''}
                    onChange={(e) => {
                      if (editingProduct) {
                        setEditingProduct({
                          ...editingProduct,
                          images: [e.target.value],
                        });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {editingProduct?.images?.[0] && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Preview</label>
                    <div className="w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                      <div className="relative w-full aspect-square">
                        <img
                          src={editingProduct.images[0]}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={() => {
                            alert('Unable to load image from URL');
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Aspect Ratio:</strong> 1:1 (Square) is recommended for product images. The image will display at 500x500px in the store.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowImageUploadModal(false);
                      setImageUploadMode('upload');
                    }}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  // Hero Image Upload Modal
  const HeroImageUploadModal = () => {
    if (!showHeroImageUploadModal) return null;

    const handleHeroImageUpload = useCallback((value: number) => {
      // Placeholder for future crop functionality
    }, []);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        <motion.div
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upload Hero Image</h2>
            <button
              onClick={() => {
                setShowHeroImageUploadModal(false);
                setHeroUploadedImage(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Upload from Computer */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Select Hero Image (Recommended: 1200x600px)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setHeroUploadedImage(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="heroImageUpload"
                  />
                  <label htmlFor="heroImageUpload" className="cursor-pointer">
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-700 font-semibold mb-1">Click to upload</p>
                    <p className="text-sm text-gray-500">or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 10MB</p>
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {heroUploadedImage && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Preview</label>
                    <div className="w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                      <div className="relative w-full h-64">
                        <img
                          src={heroUploadedImage}
                          alt="Hero Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Aspect Ratio:</strong> 2:1 (2 width to 1 height) is recommended for hero images. The image will display at 1200x600px on the store.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        updateStoreData({ heroImage: heroUploadedImage });
                        setShowHeroImageUploadModal(false);
                        setHeroUploadedImage(null);
                      }}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Use This Image
                    </button>
                    <button
                      onClick={() => {
                        setHeroUploadedImage(null);
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Footer
  const Footer = () => (
    <div
      className="border-t"
      style={{ backgroundColor: storeData.primaryColor, borderColor: storeData.secondaryColor }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>
              {storeData.storeName}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
              Curated goods for a simpler, more intentional life.
            </p>
          </div>
          {[
            { title: 'Explore', links: ['Shop All', 'New Arrivals', 'Best Sellers'] },
            { title: 'Support', links: ['Contact Us', 'Shipping Info', 'Returns'] },
            { title: 'Connect', links: ['Instagram', 'Facebook', 'Newsletter'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest" style={{ color: '#ffffff' }}>
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#a0aec0' }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t pt-8 flex justify-between text-sm" style={{ borderColor: storeData.secondaryColor, color: '#a0aec0' }}>
          <p>© 2025 {storeData.storeName}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" style={{ color: '#a0aec0' }} className="hover:opacity-70 transition-opacity">Privacy Policy</a>
            <a href="#" style={{ color: '#a0aec0' }} className="hover:opacity-70 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );

  // Render current page
  const renderStorePage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <HeroSection />
            <div className="mt-16">
              <CategoryFilter />
              <SearchFilterBar />
              <ProductsSection />
            </div>
          </>
        );
      case 'shop':
        return (
          <>
            <CategoryFilter />
            <SearchFilterBar />
            <ProductsSection />
          </>
        );
      case 'product':
        return <ProductDetailPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      default:
        return null;
    }
  };

  // Preview Mode
  if (isPreviewMode) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: storeData.primaryColor }}>
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <button
              onClick={() => setIsPreviewMode(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Editor
            </button>
          </div>

          {renderStorePage()}
          <div className="mt-16">
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  // Editor Mode
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Editor Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} weight="bold" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Store Editor</h1>
                <p className="text-sm text-gray-500">{storeName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPreviewMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
              >
                <Eye size={18} weight="bold" />
                Preview
              </button>
              <button
                onClick={() => setShowSavePublishModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                <FloppyDisk size={18} weight="bold" />
                Save & Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex gap-6 p-6">
        {/* Left Sidebar - Settings */}
        <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Store Settings</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Store Name</label>
              <input
                type="text"
                value={storeData.storeName}
                onChange={(e) => updateStoreData({ storeName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Hero Title</label>
              <textarea
                value={storeData.heroTitle}
                onChange={(e) => updateStoreData({ heroTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Hero Subtitle</label>
              <textarea
                value={storeData.heroSubtitle}
                onChange={(e) => updateStoreData({ heroSubtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Hero Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storeData.heroImage}
                  onChange={(e) => updateStoreData({ heroImage: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
                <button
                  onClick={() => {
                    setShowHeroImageUploadModal(true);
                    setIsHeroImageUpload(true);
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">About Text</label>
              <textarea
                value={storeData.aboutText}
                onChange={(e) => updateStoreData({ aboutText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Contact Email</label>
              <input
                type="email"
                value={storeData.contactEmail}
                onChange={(e) => updateStoreData({ contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Colors</label>
              <div className="space-y-3">
                {[
                  { label: 'Primary Color', key: 'primaryColor' as const },
                  { label: 'Secondary Color', key: 'secondaryColor' as const },
                  { label: 'Accent Color', key: 'accentColor' as const },
                ].map((color) => (
                  <div key={color.key}>
                    <label className="text-xs text-gray-600 mb-1 block">{color.label}</label>
                    <input
                      type="color"
                      value={storeData[color.key]}
                      onChange={(e) => updateStoreData({ [color.key]: e.target.value })}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center - Preview */}
        <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="min-h-full" style={{ backgroundColor: storeData.primaryColor }}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8">
              {renderStorePage()}
              <div className="mt-16">
                <Footer />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Products Manager */}
        <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Products ({storeData.products.length})</h3>
            <button
              onClick={addNewProduct}
              className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
              title="Add new product"
            >
              <Plus size={20} weight="bold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {storeData.products.map((product) => {
              const productImage = product.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop';
              const productCategory = product.metadata?.category || 'General';
              
              return (
                <motion.div
                  key={product.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex gap-3 items-start">
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                      <span className="text-xs text-gray-600">{productCategory}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductModal(true);
                        }}
                        className="p-1 hover:bg-blue-100 text-blue-600 rounded"
                        title="Edit"
                      >
                        <PencilSimple size={16} weight="bold" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <ProductEditModal />
      <ImageUploadModal />
      <HeroImageUploadModal />
      <SavePublishModal
        isOpen={showSavePublishModal}
        onClose={() => setShowSavePublishModal(false)}
        onPublish={handlePublish}
        initialStoreName={storeData.storeName}
      />
    </div>
    </ProtectedRoute>
  );
}
