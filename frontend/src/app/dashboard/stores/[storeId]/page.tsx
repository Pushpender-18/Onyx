'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowSquareOut, GearSix, Trash, ArrowLeft } from 'phosphor-react';
import { useShop } from '@/context/ShopContext';
import { Store, Product } from '@/types';

export default function StoreDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const { stores, products, getProducts, isLoading, getAllStores, deleteStore, signer } = useShop();
  const [store, setStore] = useState<Store | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load stores once on mount
  useEffect(() => {
    const loadStoreData = async () => {
      setIsLoadingData(true);
      
      // If stores array is empty, fetch from blockchain
      if (stores.length === 0) {
        await getAllStores(signer);
      }
      
      setIsLoadingData(false);
    };
    
    loadStoreData();
  }, []); // Empty dependency - only run once

  // Find and set the store when stores data changes
  useEffect(() => {
    const foundStore = stores.find(s => s.id === storeId);
    if (foundStore) {
      setStore(foundStore);
    }
  }, [stores, storeId]);

  // Load products once when store is found
  useEffect(() => {
    if (store && !hasLoadedProducts && getProducts) {
      console.log('Loading products for store:', store.id);
      getProducts(store.id, signer).then(storeProds => {
        console.log('Products loaded:', storeProds);
        setStoreProducts(storeProds);
        setHasLoadedProducts(true);
      }).catch(err => {
        console.error('Error loading products:', err);
        setHasLoadedProducts(true); // Mark as loaded even on error to prevent retry loop
      });
    }
  }, [store?.id]); // Only depend on store ID, not the getProducts function

  const handleDeleteStore = () => {
    if (store) {
      deleteStore(store.id);
      router.push('/dashboard/stores');
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--onyx-dark) mx-auto mb-4"></div>
          <p className="text-(--onyx-grey)">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (!store && !isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-(--onyx-dark) mb-4">Store Not Found</h2>
          <p className="text-(--onyx-grey) mb-6">The store you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard/stores')}
            className="px-6 py-2 bg-(--onyx-dark) text-white rounded-lg hover:bg-(--onyx-stone) transition-colors"
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  // Don't render until we have the store
  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.push('/dashboard/stores')}
          className="text-(--onyx-grey) hover:text-(--onyx-dark) transition-colors mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={18} weight="bold" />
          Back to Stores
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-(--onyx-dark) mb-2">{store.name}</h1>
            {store.description && (
              <p className="text-(--onyx-grey) text-lg">{store.description}</p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => window.open(`/${store.name}`, '_blank')}
              className="px-6 py-3 bg-(--onyx-stone) text-(--onyx-white) rounded-lg hover:bg-(--onyx-dark) transition-colors flex items-center gap-2"
            >
              <ArrowSquareOut size={18} weight="bold" />
              View Storefront
            </button>
            <button
              onClick={() => router.push(`/dashboard/editor?storeId=${storeId}&storeName=${encodeURIComponent(store.name)}&template=${store.templateId}`)}
              className="px-6 py-3 bg-(--onyx-white) text-(--onyx-stone) border-2 border-(--onyx-stone) rounded-lg hover:bg-(--onyx-grey-lighter) transition-colors flex items-center gap-2"
            >
              <GearSix size={18} weight="bold" />
              Edit Store
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-(--onyx-grey-lighter) text-(--onyx-stone) rounded-lg hover:bg-(--onyx-grey-light) transition-colors flex items-center gap-2"
              title="Delete Store"
            >
              <Trash size={18} weight="bold" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>

      {/* Store Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white rounded-lg shadow-sm"
        >
          <h3 className="text-sm font-medium text-(--onyx-grey) mb-2">Template</h3>
          <p className="text-2xl font-bold text-(--onyx-dark) capitalize">{store.templateId}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white rounded-lg shadow-sm"
        >
          <h3 className="text-sm font-medium text-(--onyx-grey) mb-2">Status</h3>
          <p className="text-2xl font-bold text-(--onyx-dark)">
            {store.isPublished ? (
              <span className="text-(--success)">✓ Published</span>
            ) : (
              <span className="text-(--warning)">○ Draft</span>
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white rounded-lg shadow-sm"
        >
          <h3 className="text-sm font-medium text-(--onyx-grey) mb-2">Store URL</h3>
          <div className="flex items-center gap-2">
            <code className="text-sm text-(--onyx-grey-dark) truncate flex-1">
              /{store.name}
            </code>
            <button
              onClick={() => {
                const url = `${window.location.origin}/${encodeURIComponent(store.name)}`;
                navigator.clipboard.writeText(url);
                alert('Store URL copied to clipboard!');
              }}
              className="px-3 py-1 bg-(--onyx-grey-lighter) text-(--onyx-stone) rounded text-xs hover:bg-(--onyx-grey-light) transition-colors"
              title="Copy URL"
            >
              Copy
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white rounded-lg shadow-sm"
        >
          <h3 className="text-sm font-medium text-(--onyx-grey) mb-2">Created</h3>
          <p className="text-2xl font-bold text-(--onyx-dark)">
            {new Date(store.createdAt).toLocaleDateString()}
          </p>
        </motion.div>
      </div>

      {/* Store URL Banner - Only show if published */}
      {store.isPublished && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-(--success) rounded-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-(--onyx-dark) mb-2 flex items-center gap-2">
                🎉 Your store is live!
              </h3>
              <p className="text-sm text-(--onyx-grey-dark) mb-3">
                Share this URL with your customers:
              </p>
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-(--onyx-grey-lighter)">
                <code className="text-(--onyx-grey-dark) font-mono text-sm flex-1">
                  {typeof window !== 'undefined' && `${window.location.origin}/${encodeURIComponent(store.name)}`}
                </code>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/${encodeURIComponent(store.name)}`;
                    navigator.clipboard.writeText(url);
                    alert('✓ Store URL copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-(--onyx-stone) text-(--onyx-white) rounded-lg hover:bg-(--onyx-dark) transition-colors text-sm font-medium"
                >
                  📋 Copy Link
                </button>
                <button
                  onClick={() => window.open(`/${store.name}`, '_blank')}
                  className="px-4 py-2 bg-(--onyx-white) text-(--onyx-stone) border-2 border-(--onyx-stone) rounded-lg hover:bg-(--onyx-grey-lighter) transition-colors text-sm font-medium"
                >
                  <ArrowSquareOut size={16} weight="bold" className="inline mr-1" />
                  View Store
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Draft Notice - Only show if not published */}
      {!store.isPublished && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-amber-50 border-2 border-(--warning) rounded-lg p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl"></div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-(--onyx-dark) mb-2">
                Store is in Draft Mode
              </h3>
              <p className="text-sm text-(--onyx-grey-dark) mb-3">
                This store is not yet published and cannot be accessed by customers. 
                Once published, it will be available at:
              </p>
              <code className="block bg-white rounded-lg p-3 border border-(--onyx-grey-lighter) text-(--onyx-grey-dark) font-mono text-sm mb-3">
                {typeof window !== 'undefined' && `${window.location.origin}/${encodeURIComponent(store.name)}`}
              </code>
              <button
                onClick={() => router.push(`/dashboard/stores/${storeId}/edit`)}
                className="px-6 py-2 bg-(--onyx-stone) text-(--onyx-white) rounded-lg hover:bg-(--onyx-dark) transition-colors text-sm font-medium"
              >
                Edit & Publish Store
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-(--onyx-dark)">Products</h2>
          <button
            onClick={() => router.push(`/dashboard/products?storeId=${storeId}`)}
            className="px-4 py-2 bg-(--onyx-dark) text-white rounded-lg hover:bg-(--onyx-stone) transition-colors"
          >
            Add Product
          </button>
        </div>

        {storeProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4"></div>
            <h3 className="text-xl font-semibold text-(--onyx-dark) mb-2">No Products Yet</h3>
            <p className="text-(--onyx-grey) mb-4">Start adding products to your store</p>
            <button
              onClick={() => router.push(`/dashboard/products?storeId=${storeId}`)}
              className="px-6 py-3 bg-(--onyx-dark) text-white rounded-lg hover:bg-(--onyx-stone) transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storeProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="border border-(--onyx-grey-lighter) rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-(--onyx-dark) mb-2">{product.name}</h3>
                <p className="text-sm text-(--onyx-grey) mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-(--onyx-dark)">
                      {product.price} MNT
                    </p>
                    <p className="text-xs text-(--onyx-grey)">
                      {product.metadata?.category || 'Uncategorized'}
                    </p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.isPublished 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {product.isPublished ? 'Published' : 'Draft'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Store Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm p-6 mt-6"
      >
        <h2 className="text-2xl font-bold text-(--onyx-dark) mb-4">Store Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-(--onyx-grey) mb-2">Store ID</h3>
            <p className="text-(--onyx-dark) font-mono text-sm">{store.id}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-(--onyx-grey) mb-2">Owner Address</h3>
            <p className="text-(--onyx-dark) font-mono text-sm">{store.userId}</p>
          </div>
          
          {store.customization && (
            <div>
              <h3 className="text-sm font-medium text-(--onyx-grey) mb-2">Theme Colors</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border border-(--onyx-grey-lighter)"
                    style={{ backgroundColor: store.customization.primaryColor }}
                  />
                  <span className="text-sm text-(--onyx-dark)">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border border-(--onyx-grey-lighter)"
                    style={{ backgroundColor: store.customization.secondaryColor }}
                  />
                  <span className="text-sm text-(--onyx-dark)">Secondary</span>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-(--onyx-grey) mb-2">Last Updated</h3>
            <p className="text-(--onyx-dark)">{new Date(store.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4"></div>
              <h2 className="text-2xl font-bold text-(--onyx-dark) mb-2">
                Hide Store?
              </h2>
              <p className="text-(--onyx-grey)">
                Are you sure you want to hide <strong>{store?.name}</strong> from your dashboard?
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Note:</strong> This will hide the store from your dashboard. The store and all its data will remain on the blockchain and accessible via its URL.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>💡 Tip:</strong> You can re-add this store to your dashboard later by refreshing your stores list.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 border border-(--onyx-grey-lighter) text-(--onyx-dark) rounded-lg hover:bg-(--onyx-grey-lighter)/30 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStore}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Hide Store
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
