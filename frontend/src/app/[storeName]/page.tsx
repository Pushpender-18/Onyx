'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, House, Heart } from 'phosphor-react';
import toast from 'react-hot-toast';
import { useShop } from '@/context/ShopContext';
import { Store, Product as StoreProduct } from '@/types';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  badge?: string;
}

interface StoreData {
  storeName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  products: Product[];
  categories: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor?: string;
  aboutText: string;
  contactEmail: string;
  publishedAt?: string;
}

export default function PublishedStorePage() {
  const params = useParams();
  const storeName = params.storeName as string;
  const { stores, products, getProducts, getStoreByName } = useShop();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [cartItems, setCartItems] = useState<{ id: string; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadStore = async () => {
      setLoading(true);
      try {
        console.log('🏪 Loading storefront for:', storeName);
        
        // First try to find in loaded stores
        let foundStore = stores.find(s => s.name.toLowerCase() === storeName.toLowerCase());
        
        // If not found, fetch from blockchain
        if (!foundStore) {
          console.log('📡 Store not in cache, fetching from blockchain...');
          const fetchedStore = await getStoreByName(storeName);
          if (fetchedStore) {
            foundStore = fetchedStore;
          }
        }
        
        if (!foundStore) {
          setError('Store not found. It may not have been published yet.');
          setLoading(false);
          return;
        }

        console.log('✅ Store found:', foundStore);
        setStore(foundStore);

        // Load products for this store
        const storeProds = await getProducts(foundStore.id);
        console.log('📦 Store products:', storeProds);
        setStoreProducts(storeProds);

        // Convert to StoreData format for existing UI
        const categories = [...new Set(storeProds.map(p => p.metadata?.category || 'Uncategorized'))];
        
        const convertedData: StoreData = {
          storeName: foundStore.name,
          heroTitle: foundStore.name,
          heroSubtitle: foundStore.description || 'Welcome to our store',
          heroImage: '', // TODO: Add hero image support
          products: storeProds.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.images[0] || '',
            category: p.metadata?.category || 'Uncategorized',
            description: p.description,
            badge: p.isPublished ? undefined : 'Draft',
          })),
          categories: ['All', ...categories],
          primaryColor: foundStore.customization?.primaryColor || '#1a1a1a',
          secondaryColor: foundStore.customization?.secondaryColor || '#d4af37',
          accentColor: foundStore.customization?.primaryColor || '#1a1a1a',
          textColor: '#1a1a1a',
          aboutText: foundStore.description || '',
          contactEmail: 'contact@' + foundStore.name.toLowerCase().replace(/\s+/g, '') + '.com',
          publishedAt: foundStore.createdAt.toISOString(),
        };

        setStoreData(convertedData);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error loading store:', err);
        setError('Failed to load store data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [storeName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <div className="text-4xl">🏪</div>
        </motion.div>
        <p className="ml-4 text-gray-600 font-semibold">Loading store...</p>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This store has not been published yet.'}</p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const filteredProducts = storeData.products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cartItems.reduce((total, item) => {
    const product = storeData.products.find((p) => p.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const addToCart = (productId: string) => {
    const product = storeData.products.find((p) => p.id === productId);
    if (product) {
      setCartItems((prev) => {
        const existing = prev.find((item) => item.id === productId);
        if (existing) {
          return prev.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { id: productId, quantity: 1 }];
      });
      toast.success(`${product.name} added to cart!`);
    }
  };

  // Navbar
  const Navbar = () => (
    <div
      className="sticky top-0 z-40 border-b shadow-lg"
      style={{
        backgroundColor: storeData.primaryColor,
        borderColor: storeData.secondaryColor,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: storeData.accentColor }}
        >
          {storeData.storeName}
        </h1>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-sm font-semibold transition-colors hover:opacity-70 flex items-center gap-2"
              style={{ color: currentPage === 'home' ? storeData.accentColor : '#cbd5e1' }}
            >
              <House size={18} weight="fill" />
              Home
            </button>
            <button
              onClick={() => setCurrentPage('shop')}
              className="text-sm font-semibold transition-colors hover:opacity-70"
              style={{ color: currentPage === 'shop' ? storeData.accentColor : '#cbd5e1' }}
            >
              Shop
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className="text-sm font-semibold transition-colors hover:opacity-70"
              style={{ color: currentPage === 'about' ? storeData.accentColor : '#cbd5e1' }}
            >
              About
            </button>
          </nav>
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative px-6 py-2 rounded font-semibold text-white text-sm transition-all hover:shadow-lg flex items-center gap-2"
            style={{ backgroundColor: storeData.accentColor }}
          >
            <ShoppingCart size={18} weight="fill" />
            Cart ({cartItems.length})
          </button>
        </div>
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
          background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.75) 0%, rgba(26, 31, 58, 0.6) 100%)',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <motion.h2
          className="text-5xl md:text-6xl font-bold mb-4 leading-tight text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {storeData.heroTitle}
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl mb-8 max-w-2xl font-light text-gray-300"
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
            color: storeData.primaryColor,
          }}
          onClick={() => setCurrentPage('shop')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Shop Now
        </motion.button>
      </div>
    </div>
  );

  // Products Grid
  const ProductsGrid = () => (
    <div>
      <div className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-3 overflow-x-auto pb-2">
          {storeData.categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor:
                  selectedCategory === category ? storeData.accentColor : undefined,
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedProduct(product)}
          >
            <div className="relative h-64 overflow-hidden bg-gray-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform"
              />
              {product.badge && (
                <div
                  className="absolute top-4 right-4 px-3 py-1 text-white text-sm font-semibold rounded-full"
                  style={{ backgroundColor: storeData.accentColor }}
                >
                  {product.badge}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span
                  className="text-2xl font-bold"
                  style={{ color: storeData.accentColor }}
                >
                  ${product.price.toFixed(2)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product.id);
                  }}
                  className="p-2 rounded-full text-white transition-all hover:scale-110"
                  style={{ backgroundColor: storeData.accentColor }}
                >
                  <ShoppingCart size={20} weight="fill" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No products found</p>
        </div>
      )}
    </div>
  );

  // About Section
  const AboutSection = () => (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-4xl font-bold mb-6 text-gray-900">About {storeData.storeName}</h2>
      <p className="text-lg text-gray-700 leading-relaxed">{storeData.aboutText}</p>
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-gray-900">
          <strong>Contact:</strong> {storeData.contactEmail}
        </p>
      </div>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HeroSection />;
      case 'shop':
        return <ProductsGrid />;
      case 'about':
        return <AboutSection />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: storeData.primaryColor }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderPage()}
      </div>

      {/* Footer */}
      <footer
        className="mt-16 border-t py-12"
        style={{
          borderColor: storeData.secondaryColor,
          backgroundColor: storeData.secondaryColor,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>© 2025 {storeData.storeName}. All rights reserved.</p>
          <p className="text-sm mt-2">Powered by Onyx Shop</p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            className="bg-white rounded-lg max-w-2xl w-full overflow-auto max-h-96"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="grid grid-cols-2 gap-6 p-8">
              <div>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full rounded-lg"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedProduct.name}
                </h2>
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                <div
                  className="text-4xl font-bold mb-6"
                  style={{ color: storeData.accentColor }}
                >
                  ${selectedProduct.price.toFixed(2)}
                </div>
                <button
                  onClick={() => {
                    addToCart(selectedProduct.id);
                    setSelectedProduct(null);
                  }}
                  className="w-full px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: storeData.accentColor }}
                >
                  <ShoppingCart size={20} weight="fill" />
                  Add to Cart
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-full mt-3 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cart Sidebar */}
      {cartOpen && (
        <motion.div
          className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          initial={{ x: 400 }}
          animate={{ x: 0 }}
        >
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
            <button onClick={() => setCartOpen(false)} className="text-2xl">
              ✕
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {cartItems.map((item) => {
                const product = storeData.products.find((p) => p.id === item.id);
                return (
                  <div key={item.id} className="flex gap-4 pb-4 border-b">
                    <img
                      src={product?.image}
                      alt={product?.name}
                      className="w-20 h-20 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{product?.name}</h3>
                      <p className="text-sm text-gray-600">
                        ${product?.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total:</span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: storeData.accentColor }}
                  >
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  className="w-full px-6 py-3 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
                  style={{ backgroundColor: storeData.accentColor }}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {cartOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30"
          onClick={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}
