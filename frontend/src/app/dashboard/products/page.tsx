'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Trash, Pencil, Package } from 'phosphor-react';
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

interface ProductForm {
  name: string;
  price: number;
  description: string;
  images: string[];
  category?: string;
  storeId: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { products, stores, isLoading, addProduct, deleteProduct: removeProduct } = useShop();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    price: 0,
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

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.storeId) {
      alert('Please fill in all required fields and select a store');
      return;
    }

    const result = await addProduct(formData.storeId, {
      name: formData.name,
      storeId: formData.storeId,
      price: formData.price,
      description: formData.description,
      images: formData.images,
      metadata: {
        category: formData.category,
        tags: [],
      },
      isPublished: true,
    });

    if (result) {
      setFormData({
        name: '',
        price: 0,
        description: '',
        images: [],
        category: '',
        storeId: stores[0]?.id || '',
      });
      setShowForm(false);
    }
  };

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
            <motion.button
              onClick={() => {
                // Navigate to add product page with first store or let user select
                const firstStore = stores[0];
                if (firstStore) {
                  router.push(`/dashboard/products/add?storeId=${firstStore.id}&storeName=${encodeURIComponent(firstStore.name)}&returnUrl=/dashboard/products`);
                } else {
                  alert('Please create a store first');
                  router.push('/dashboard/create-store');
                }
              }}
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} weight="bold" />
              Add Product
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="container-custom py-8">
        
        {/* Add Product Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-(--onyx-stone) mb-6">
              Add New Product
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-(--onyx-stone) mb-2">
                  Select Store *
                </label>
                <select
                  value={formData.storeId}
                  onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-(--onyx-stone) mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium Headphones"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--onyx-stone) mb-2">
                  Price (MNT) *
                </label>
                <input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="input-field"
                  step="0.01"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-(--onyx-stone) mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description..."
                  className="input-field"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--onyx-stone) mb-2">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Electronics"
                  className="input-field"
                />
              </div>
            </div>
            <p className="text-xs text-(--onyx-grey) mb-6">
              ℹ️ Product data will be stored on IPFS for permanent decentralized storage
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleAddProduct}
                className="btn-primary"
              >
                Add Product
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Products List */}
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
            className="space-y-4"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="card p-6 flex items-start gap-6 hover:shadow-lg transition-shadow group"
              >
                {/* Product Image */}
                <div className="w-32 h-32 rounded-lg bg-(--onyx-grey-lighter)/50 shrink-0 flex items-center justify-center">
                  <Package size={40} weight="light" className="text-(--onyx-grey-light)" />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-(--onyx-stone) mb-2">
                    {product.name}
                  </h3>
                  <p className="text-(--onyx-grey) text-sm mb-3">{product.description}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-(--onyx-grey)">Price</p>
                      <p className="text-xl font-bold text-(--onyx-stone)">
                        {product.price} MNT
                      </p>
                    </div>
                    {product.metadata?.category && (
                      <div>
                        <p className="text-xs text-(--onyx-grey)">Category</p>
                        <p className="font-medium text-(--onyx-stone)">{product.metadata.category}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
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
              onClick={() => setShowForm(true)}
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
