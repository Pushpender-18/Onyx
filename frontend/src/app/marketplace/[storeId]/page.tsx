'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  MapPin,
  Clock,
  Flame,
  TrendUp,
  Share,
  CheckCircle,
} from 'phosphor-react';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating: number;
  reviews: number;
}

interface StoreDetails {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerImage?: string;
  rating: number;
  reviews: number;
  products: number;
  sales: number;
  created: string;
  category: string;
  featured?: boolean;
  verified?: boolean;
  location?: string;
  responseTime?: string;
  products_list: Product[];
}

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock store data - in real app, fetch from API
  const storeData: StoreDetails = {
    id: storeId,
    name: 'Fashion Store',
    description: 'Premium clothing and accessories handpicked for style and quality',
    owner: '0x123...456',
    rating: 4.8,
    reviews: 156,
    products: 24,
    sales: 1200,
    created: '2024-01-10',
    category: 'fashion',
    featured: true,
    verified: true,
    location: 'Global',
    responseTime: '< 1 hour',
    products_list: [
      {
        id: '1',
        name: 'Premium Cotton T-Shirt',
        price: 29.99,
        rating: 4.9,
        reviews: 45,
      },
      {
        id: '2',
        name: 'Leather Jacket',
        price: 199.99,
        rating: 4.7,
        reviews: 32,
      },
      {
        id: '3',
        name: 'Denim Jeans',
        price: 79.99,
        rating: 4.6,
        reviews: 28,
      },
      {
        id: '4',
        name: 'Summer Dress',
        price: 59.99,
        rating: 4.8,
        reviews: 41,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-(--onyx-white)">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-(--onyx-white) border-b border-(--onyx-grey-lighter)"
      >
        <div className="container-custom py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-(--onyx-stone) hover:text-(--onyx-grey-dark) transition-colors mb-4 font-medium"
          >
            <ArrowLeft size={20} weight="bold" />
            Back to Marketplace
          </button>
        </div>
      </motion.div>

      {/* Store Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-linear-to-br from-(--onyx-dark) to-(--onyx-stone) text-(--onyx-white)"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.2),transparent)]"></div>
        </div>

        <div className="container-custom relative z-10 py-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            {/* Store Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-5xl font-bold">{storeData.name}</h1>
                    {storeData.verified && (
                      <div className="flex items-center gap-1 bg-(--onyx-white) bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                        <CheckCircle size={16} weight="fill" />
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-lg text-(--onyx-grey-light)">
                    {storeData.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                      isFavorite
                        ? 'bg-(--accent-gold) text-(--onyx-black)'
                        : 'bg-(--onyx-white) bg-opacity-20 text-(--onyx-white) hover:bg-opacity-30'
                    }`}
                  >
                    <Heart size={24} weight={isFavorite ? 'fill' : 'bold'} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-lg bg-(--onyx-white) bg-opacity-20 text-(--onyx-white) flex items-center justify-center hover:bg-opacity-30 transition-all"
                  >
                    <Share size={24} weight="bold" />
                  </motion.button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-(--onyx-grey-light) mb-1">Rating</p>
                  <div className="flex items-center gap-2">
                    <Star size={16} weight="fill" className="text-(--accent-gold)" />
                    <span className="text-2xl font-bold">{storeData.rating}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-(--onyx-grey-light) mb-1">Reviews</p>
                  <p className="text-2xl font-bold">{storeData.reviews}</p>
                </div>
                <div>
                  <p className="text-xs text-(--onyx-grey-light) mb-1">Products</p>
                  <p className="text-2xl font-bold">{storeData.products}</p>
                </div>
                <div>
                  <p className="text-xs text-(--onyx-grey-light) mb-1">Sales</p>
                  <p className="text-2xl font-bold">{storeData.sales}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Store Details Section */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About Store */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-(--onyx-stone) mb-6">About Store</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock size={24} className="text-(--onyx-stone)" />
                    <div>
                      <p className="text-xs text-(--onyx-grey)">Response Time</p>
                      <p className="text-lg font-bold text-(--onyx-stone)">
                        {storeData.responseTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin size={24} className="text-(--onyx-stone)" />
                    <div>
                      <p className="text-xs text-(--onyx-grey)">Location</p>
                      <p className="text-lg font-bold text-(--onyx-stone)">
                        {storeData.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Products Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-(--onyx-stone) mb-6">Featured Products</h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {storeData.products_list.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg p-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-(--onyx-stone)">
                        {product.name}
                      </h3>
                      <span className="text-(--accent-gold) font-bold text-xl">
                        ${product.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            weight={i < Math.floor(product.rating) ? 'fill' : 'light'}
                            className={
                              i < Math.floor(product.rating)
                                ? 'text-(--accent-gold)'
                                : 'text-(--onyx-grey-lighter)'
                            }
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-(--onyx-stone)">
                        {product.rating}
                      </span>
                      <span className="text-(--onyx-grey)">
                        ({product.reviews})
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <Link
                href="#"
                className="mt-8 inline-flex items-center gap-2 text-(--onyx-stone) font-semibold hover:text-(--accent-gold) transition-colors"
              >
                View All Products
                <ArrowLeft size={18} weight="bold" className="rotate-180" />
              </Link>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Store Owner Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-linear-to-br from-(--onyx-grey-lighter) to-(--onyx-white) border border-(--onyx-grey-lighter) rounded-xl p-6 mb-6 sticky top-24"
            >
              <h3 className="text-lg font-bold text-(--onyx-stone) mb-4">Store Owner</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-(--onyx-grey) mb-1">Wallet Address</p>
                  <p className="text-sm font-mono font-bold text-(--onyx-stone)">
                    {storeData.owner}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-(--onyx-grey) mb-1">Member Since</p>
                  <p className="text-sm font-bold text-(--onyx-stone)">
                    {new Date(storeData.created).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>

                <div className="border-t border-(--onyx-grey-lighter) pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-(--onyx-grey)">Positive Feedback</span>
                    <span className="text-sm font-bold text-(--success)">98%</span>
                  </div>
                  <div className="w-full bg-(--onyx-grey-lighter) rounded-full h-2">
                    <div className="bg-linear-to-r from-(--success) to-(--onyx-stone) h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-3 bg-gradient-onyx text-(--onyx-white) rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <ShoppingCart size={18} weight="bold" />
                  Shop Now
                </motion.button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-(--onyx-stone) mb-4 flex items-center gap-2">
                <TrendUp size={20} className="text-(--onyx-stone)" />
                Store Stats
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-(--onyx-grey-lighter)">
                  <span className="text-sm text-(--onyx-grey)">Total Sales</span>
                  <span className="font-bold text-(--onyx-stone)">{storeData.sales}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-(--onyx-grey-lighter)">
                  <span className="text-sm text-(--onyx-grey)">Total Products</span>
                  <span className="font-bold text-(--onyx-stone)">{storeData.products}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-(--onyx-grey)">Customer Reviews</span>
                  <span className="font-bold text-(--onyx-stone)">{storeData.reviews}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
