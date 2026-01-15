'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Trash, Pencil, Package } from 'phosphor-react';
import { useShop } from '@/context/ShopContext';
import { getIPFSUrl } from '@/lib/ipfs-upload';
import { Product } from '@/types';

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

interface ProductForm {
  name: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  category?: string;
  storeId: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { products, stores, isLoading, deleteProduct: removeProduct } = useShop();
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    price: 0,
    stock: 0,
    description: '',
    images: [],
    category: '',
    storeId: '',
  });

  // Set default storeId when stores are loaded
  useEffect(() => {
    if (stores.length > 0 && !formData.storeId) {
      setFormData(prev => ({ ...prev, storeId: stores[0].id }));
    }
  }, [stores]);

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      removeProduct(id);
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
                <h1 className="text-4xl font-bold text-(--onyx-stone) mb-2">Products</h1>
                <p className="text-(--onyx-grey)">
                  Manage your product catalog
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="container-custom py-8">

          {/* Products List - Grouped by Store */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--onyx-stone) mx-auto mb-4"></div>
                <p className="text-(--onyx-grey)">Loading products...</p>
              </div>
            </div>
          ) : products.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {stores.map((store) => {
                const storeProducts = products.filter(p => p.storeId === store.id);

                if (storeProducts.length === 0) return null;

                return (
                  <div key={store.id} className="space-y-4">
                    {/* Store Header */}
                    <div className="flex items-center justify-between border-b-2 border-(--onyx-grey-lighter) pb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-(--onyx-dark)">{store.name}</h2>
                        <p className="text-sm text-(--onyx-grey) mt-1">{storeProducts.length} product{storeProducts.length !== 1 ? 's' : ''}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/products/add?storeId=${store.id}&storeName=${encodeURIComponent(store.name)}&returnUrl=/dashboard/products`)}
                        className="px-4 py-2 bg-(--onyx-stone) text-(--onyx-white) rounded-lg hover:bg-(--onyx-dark) transition-colors flex items-center gap-2"
                      >
                        <Plus size={18} weight="bold" />
                        Add Product
                      </button>
                    </div>

                    {/* Products Grid for this Store */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {storeProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          variants={itemVariants}
                          className="card p-6 hover:shadow-lg transition-shadow group flex flex-col"
                        >
                          {/* Product Image */}
                          <div className="w-full h-80 rounded-lg bg-(--onyx-grey-lighter)/50 flex items-center justify-center mb-4 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={getIPFSUrl(product.images[0])}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop';
                                }}
                              />
                            ) : (
                              <Package size={40} weight="light" className="text-(--onyx-grey-light)" />
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-(--onyx-stone) mb-2">
                              {product.name}
                            </h3>
                            <p className="text-(--onyx-grey) text-sm mb-3 line-clamp-2">{product.description}</p>
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-xs text-(--onyx-grey)">Price</p>
                                  <p className="text-xl font-bold text-(--onyx-stone)">
                                    {product.price} MNT
                                  </p>
                                </div>
                                <div className='px-4'>
                                  <p className="text-xs text-(--onyx-grey)">Stock</p>
                                  <p className="text-xl font-bold text-(--onyx-stone)">
                                    {product.stock}
                                  </p>
                                </div>
                              </div>
                              {product.metadata?.category && (
                                <div>
                                  <p className="text-xs text-(--onyx-grey)">Category</p>
                                  <p className="text-sm font-medium text-(--onyx-stone)">{product.metadata.category}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 justify-end pt-4 border-t border-(--onyx-grey-lighter)">
                            <motion.button
                              onClick={() => router.push(`/dashboard/products/edit/${product.id}?storeId=${product.storeId}&returnUrl=/dashboard/products`)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-(--onyx-grey-lighter) rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Pencil size={18} weight="bold" className="text-(--onyx-grey)" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteProduct(product.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash size={18} weight="bold" className="text-red-500" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-12 text-center"
            >
              <Package size={48} weight="light" className="text-(--onyx-grey-lighter) mx-auto mb-4" />
              <p className="text-(--onyx-grey) mb-6">No products yet</p>
              <button
                onClick={() => {
                  const firstStore = stores[0];
                  if (firstStore) {
                    router.push(`/dashboard/products/add?storeId=${firstStore.id}&storeName=${encodeURIComponent(firstStore.name)}&returnUrl=/dashboard/products`);
                  } else {
                    alert('Please create a store first');
                    router.push('/dashboard/create-store');
                  }
                }}
                className="btn-primary inline-block"
              >
                Add Your First Product
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
