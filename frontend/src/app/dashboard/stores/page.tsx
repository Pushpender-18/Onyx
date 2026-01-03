'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Pencil, Eye, ShoppingCart, ArrowRight } from 'phosphor-react';

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

interface Store {
  id: string;
  name: string;
  description?: string;
  products: number;
  created: string;
  template: string;
}

export default function StoresPage() {
  const stores: Store[] = [];

  return (
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
            <Link
              href="/dashboard/create-store"
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} weight="bold" />
              Create Store
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="container-custom py-8">
        {stores.length > 0 ? (
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
                    <h3 className="text-lg font-semibold text-(--onyx-stone) mb-1">
                      {store.name}
                    </h3>
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
                    <p className="text-2xl font-bold text-(--onyx-stone)">{store.products}</p>
                  </div>
                  <div>
                    <p className="text-xs text-(--onyx-grey) mb-1">Template</p>
                    <p className="text-sm font-semibold text-(--onyx-stone) capitalize">
                      {store.template}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <p className="text-xs text-(--onyx-grey) py-4">
                  Created {new Date(store.created).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                    title="View store"
                  >
                    <Eye size={16} weight="bold" />
                    View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
                    title="Edit store"
                  >
                    <Pencil size={16} weight="bold" />
                    Edit
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
    </div>
  );
}
