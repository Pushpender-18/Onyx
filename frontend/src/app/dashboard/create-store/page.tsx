'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'phosphor-react';
import {
  FiTarget,
  FiShoppingBag,
  FiStar,
  FiGift,
  FiShoppingCart,
  FiSettings,
} from 'react-icons/fi';

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

const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design',
    features: ['Simple navigation', 'Focused on products', 'Fast loading'],
    icon: FiTarget,
  },
  {
    id: 'tech',
    name: 'Tech Store',
    description: 'Technology and gadgets focused',
    features: ['Specs showcase', 'Tech comparisons', 'Review section'],
    icon: FiSettings,
  },
];

export default function CreateStore() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  const handleCreateStore = async () => {
    if (!selectedTemplate || !storeName) {
      alert('Please select a template and enter a store name');
      return;
    }

    // Simulate store creation
    console.log('Creating store:', {
      template: selectedTemplate,
      name: storeName,
      description: storeDescription,
    });

    // Redirect to editor
    router.push(`/dashboard/editor?template=${selectedTemplate}&storeName=${storeName}`);
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
        <div className="container-custom py-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-(--onyx-stone) hover:text-(--onyx-dark) transition-colors mb-4"
          >
            <ArrowLeft size={18} weight="bold" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-(--onyx-stone)">Create Your Store</h1>
          <p className="text-(--onyx-grey) mt-2">
            Choose a template and customize it to match your brand
          </p>
        </div>
      </motion.div>

      <div className="container-custom py-12">
        {/* Store Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-12"
        >
          <h2 className="text-2xl font-semibold text-(--onyx-stone) mb-6">
            Store Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-(--onyx-stone) mb-2">
                Store Name *
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g., My Fashion Store"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-(--onyx-stone) mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="e.g., Premium fashion items"
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        {/* Template Selection */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-semibold text-(--onyx-stone) mb-6"
          >
            Choose a Template
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {TEMPLATES.map((template) => (
              <motion.div
                key={template.id}
                variants={itemVariants}
                onClick={() => setSelectedTemplate(template.id)}
                className={`card p-6 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'ring-2 ring-(--onyx-stone)'
                    : 'hover:shadow-lg'
                }`}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Template Preview */}
                <div className="w-full h-32 bg-(--onyx-grey-lighter)/30 rounded-lg flex items-center justify-center mb-4">
                  <template.icon size={80} className="text-(--accent-gold)" />
                </div>

                {/* Template Info */}
                <h3 className="text-lg font-semibold text-(--onyx-stone) mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-(--onyx-grey) mb-4">{template.description}</p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check
                        size={16}
                        weight="bold"
                        className="text-(--accent-gold)"
                      />
                      <span className="text-xs text-(--onyx-grey)">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Selection Indicator */}
                {selectedTemplate === template.id && (
                  <motion.div
                    layoutId="template-selection"
                    className="absolute top-4 right-4 w-6 h-6 bg-(--onyx-stone) text-(--onyx-white) rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Check size={16} weight="bold" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 justify-end"
        >
          <Link href="/dashboard" className="btn-secondary">
            Cancel
          </Link>
          <button
            onClick={handleCreateStore}
            disabled={!selectedTemplate || !storeName}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Store
          </button>
        </motion.div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
