'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Pencil, Eye, ShoppingCart, ArrowRight, ArrowsClockwise, Trash, ArrowSquareOut, GearSix } from 'phosphor-react';
import { useShop } from '@/context/ShopContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function StoresPage() {
  const router = useRouter();
  const { stores, products, isLoading, error, getAllStores, deleteStore } = useShop();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [storeToDelete, setStoreToDelete] = React.useState<{ id: string; name: string } | null>(null);

  // Load stores from blockchain on mount
  useEffect(() => {
    if (stores.length === 0 && !isLoading) {
      getAllStores();
    }
  }, []);
  
  // Calculate product count for each store
  const getProductCount = (storeId: string) => {
    return products.filter(p => p.storeId === storeId).length;
  };

  const handleSyncStores = async () => {
    await getAllStores();
  };

  const handleDeleteClick = (storeId: string, storeName: string) => {
    setStoreToDelete({ id: storeId, name: storeName });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (storeToDelete) {
      deleteStore(storeToDelete.id);
      setShowDeleteModal(false);
      setStoreToDelete(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-(--onyx-white)">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
  className="border-b border-(--onyx-grey-lighter)"
      >
        <div className="container-custom py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-(--onyx-stone) mb-2">My Stores</h1>
              <p className="text-(--onyx-grey)">
                Manage all your decentralized stores
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={handleSyncStores}
                disabled={isLoading}
                className="btn-secondary flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Sync with blockchain"
              >
                <ArrowsClockwise 
                  size={20} 
                  weight="bold" 
                  className={isLoading ? 'animate-spin' : ''}
                />
                Sync
              </motion.button>
              <Link
                href="/dashboard/create-store"
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} weight="bold" />
                Create Store
              </Link>
            </div>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-800 text-sm">{error}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="container-custom py-8">
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--onyx-stone) mx-auto mb-4"></div>
              <p className="text-(--onyx-grey)">Loading stores...</p>
            </div>
          </div>
        ) : stores.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {stores.map((store) => (
              <motion.div
                key={store.id}
                variants={itemVariants}
                className="card p-6 flex flex-col hover:shadow-lg transition-shadow group"
                whileHover={{ y: -5 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-(--onyx-stone)">
                        {store.name}
                      </h3>
                      {store.isPublished ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          ✓ Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                          ○ Draft
                        </span>
                      )}
                    </div>
                    {store.description && (
                      <p className="text-sm text-(--onyx-grey)">{store.description}</p>
                    )}
                  </div>
                  <div className="w-10 h-10 bg-gradient-onyx rounded-lg flex items-center justify-center shrink-0 ml-2">
                    <ShoppingCart size={20} weight="bold" className="text-(--onyx-white)" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-(--onyx-grey-lighter)">
                  <div>
                    <p className="text-xs text-(--onyx-grey) mb-1">Products</p>
                    <p className="text-2xl font-bold text-(--onyx-stone)">{getProductCount(store.id)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-(--onyx-grey) mb-1">Template</p>
                    <p className="text-sm font-semibold text-(--onyx-stone) capitalize">
                      {store.templateId}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <p className="text-xs text-(--onyx-grey) py-4">
                  Created {new Date(store.createdAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open(`/${store.name}`, '_blank')}
                    className="flex-1 bg-(--onyx-stone) text-(--onyx-white) text-sm flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-(--onyx-dark) transition-colors"
                    title="View storefront"
                  >
                    <ArrowSquareOut size={16} weight="bold" />
                    Storefront
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/dashboard/stores/${store.id}`)}
                    className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                    title="Manage store"
                  >
                    <GearSix size={16} weight="bold" />
                    Manage
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteClick(store.id, store.name)}
                    className="bg-(--onyx-grey-lighter) text-(--onyx-stone) p-2 rounded-lg hover:bg-(--onyx-grey-light) transition-colors"
                    title="Hide store"
                  >
                    <Trash size={18} weight="bold" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <ShoppingCart
              size={48}
              weight="light"
              className="text-(--onyx-grey-lighter) mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-(--onyx-stone) mb-2">
              No stores yet
            </h3>
            <p className="text-(--onyx-grey) mb-6">
              Create your first decentralized store to get started
            </p>
            <Link
              href="/dashboard/create-store"
              className="btn-primary inline-flex items-center gap-2"
            >
              Create Your First Store
              <ArrowRight size={18} weight="bold" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && storeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                <Trash size={24} weight="bold" />
              </div>
              <h3 className="text-xl font-bold text-(--onyx-stone)">Hide Store?</h3>
            </div>

            <p className="text-(--onyx-grey) mb-4">
              Are you sure you want to hide <span className="font-semibold text-(--onyx-stone)">"{storeToDelete.name}"</span> from your dashboard?
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> This will hide the store from your dashboard. The store and all its data will remain on the blockchain and accessible via its URL.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-800">
                💡 You can re-add this store to your dashboard later by refreshing your stores list.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStoreToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-(--onyx-grey-lighter) rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Hide Store
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
