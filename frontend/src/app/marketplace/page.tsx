'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MagnifyingGlass,
  FunnelSimple,
  Star,
  ShoppingCart,
  ArrowRight,
  Flame,
  TrendUp,
  Crown,
} from 'phosphor-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

interface Store {
  id: string;
  name: string;
  description: string;
  products: number;
  rating: number;
  reviews: number;
  created: string;
  category: string;
  featured?: boolean;
  trending?: boolean;
  owner: string;
  image?: string;
  sales?: number;
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const stores: Store[] = [
    {
      id: '1',
      name: 'Fashion Store',
      description: 'Premium clothing and accessories',
      products: 24,
      rating: 4.8,
      reviews: 156,
      created: '2024-01-10',
      category: 'fashion',
      featured: true,
      owner: '0x123...456',
      sales: 1200,
    },
    {
      id: '2',
      name: 'Electronics Hub',
      description: 'Latest tech gadgets and devices',
      products: 15,
      rating: 4.6,
      reviews: 89,
      created: '2024-01-05',
      category: 'electronics',
      trending: true,
      owner: '0x789...012',
      sales: 850,
    },
    {
      id: '3',
      name: 'Home & Living',
      description: 'Home decor and essentials',
      products: 32,
      rating: 4.9,
      reviews: 203,
      created: '2023-12-28',
      category: 'home',
      featured: true,
      owner: '0x345...678',
      sales: 2100,
    },
    {
      id: '4',
      name: 'Beauty & Wellness',
      description: 'Cosmetics and wellness products',
      products: 18,
      rating: 4.5,
      reviews: 72,
      created: '2024-01-02',
      category: 'beauty',
      trending: true,
      owner: '0x456...789',
      sales: 640,
    },
    {
      id: '5',
      name: 'Sports & Outdoor',
      description: 'Athletic gear and outdoor equipment',
      products: 28,
      rating: 4.7,
      reviews: 134,
      created: '2023-12-15',
      category: 'sports',
      owner: '0x567...890',
      sales: 1450,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Stores' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'home', label: 'Home' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'sports', label: 'Sports' },
  ];

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let result = stores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || store.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    if (sortBy === 'newest') {
      result.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      );
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.sales || 0) - (a.sales || 0));
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  const featuredStores = stores.filter((store) => store.featured);
  const trendingStores = stores.filter((store) => store.trending);

  return (
    <div className="min-h-screen bg-(--onyx-white)">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-linear-to-br from-(--onyx-dark) to-(--onyx-stone) text-(--onyx-white) py-16"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.2),transparent)]"></div>
        </div>
        <div className="container-custom relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-3">Marketplace</h1>
          <p className="text-lg text-(--onyx-grey-light) max-w-md">
            Discover and explore decentralized stores on the blockchain
          </p>
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="container-custom py-8"
      >
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlass
              size={20}
              weight="bold"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-(--onyx-grey)"
            />
            <input
              type="text"
              placeholder="Search stores by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg text-(--onyx-stone) placeholder-(--onyx-grey) focus:outline-none focus:ring-2 focus:ring-(--onyx-stone) focus:border-transparent transition-all"
            />
          </div>

          {/* Category and Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    selectedCategory === category.value
                      ? 'bg-gradient-onyx text-(--onyx-white) shadow-lg'
                      : 'bg-(--onyx-grey-lighter) text-(--onyx-stone) hover:bg-(--onyx-grey-lighter)'
                  }`}
                >
                  {category.label}
                </motion.button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <FunnelSimple size={18} className="text-(--onyx-grey)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg text-(--onyx-stone) focus:outline-none focus:ring-2 focus:ring-(--onyx-stone) focus:border-transparent text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-(--onyx-grey)">
            Showing {filteredStores.length} of {stores.length} stores
          </div>
        </div>
      </motion.div>

      {/* Featured Section */}
      {filteredStores.length > 0 && selectedCategory === 'all' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="container-custom py-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-(--onyx-stone) flex items-center gap-2">
              <Crown size={24} weight="fill" className="text-(--accent-gold)" />
              Featured Stores
            </h2>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {featuredStores.map((store) => (
              <motion.div
                key={store.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group relative bg-(--onyx-white) border-2 border-(--accent-gold) rounded-xl p-6 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Featured Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-(--accent-gold) text-(--onyx-black) px-3 py-1 rounded-full text-xs font-bold">
                  <Crown size={14} weight="fill" />
                  Featured
                </div>

                {/* Content */}
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-(--onyx-stone) mb-2">
                      {store.name}
                    </h3>
                    <p className="text-(--onyx-grey) text-sm">{store.description}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 py-6 border-y border-(--onyx-grey-lighter)">
                    <div>
                      <p className="text-xs text-(--onyx-grey) mb-1">Products</p>
                      <p className="text-2xl font-bold text-(--onyx-stone)">
                        {store.products}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-(--onyx-grey) mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star size={16} weight="fill" className="text-(--accent-gold)" />
                        <p className="text-lg font-bold text-(--onyx-stone)">
                          {store.rating}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-(--onyx-grey) mb-1">Sales</p>
                      <p className="text-lg font-bold text-(--success)">
                        {store.sales}
                      </p>
                    </div>
                  </div>

                  {/* Owner and Reviews */}
                  <div className="py-4">
                    <p className="text-xs text-(--onyx-grey) mb-2">Owner</p>
                    <p className="text-sm font-mono text-(--onyx-stone) mb-3">
                      {store.owner}
                    </p>
                    <p className="text-xs text-(--onyx-grey)">
                      {store.reviews} reviews
                    </p>
                  </div>

                  {/* Action */}
                  <Link
                    href={`/marketplace/${store.id}`}
                    className="mt-auto pt-4 inline-flex items-center gap-2 text-(--accent-gold) font-semibold hover:gap-3 transition-all group/link"
                  >
                    Explore Store
                    <ArrowRight
                      size={18}
                      weight="bold"
                      className="group-hover/link:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Trending Section */}
      {filteredStores.length > 0 && selectedCategory === 'all' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="container-custom py-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-(--onyx-stone) flex items-center gap-2">
              <Flame size={24} weight="fill" className="text-(--warning)" />
              Trending Now
            </h2>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {trendingStores.map((store) => (
              <motion.div
                key={store.id}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg p-4 hover:shadow-lg hover:border-(--warning) transition-all"
              >
                {/* Trending Badge */}
                <div className="flex items-center gap-1 bg-(--warning) bg-opacity-10 text-(--warning) px-2 py-1 rounded-full text-xs font-bold mb-3 w-fit">
                  <Flame size={12} weight="fill" />
                  Trending
                </div>

                {/* Store Info */}
                <h3 className="text-lg font-bold text-(--onyx-stone) mb-1 line-clamp-2">
                  {store.name}
                </h3>
                <p className="text-xs text-(--onyx-grey) mb-3 line-clamp-2">
                  {store.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-4 pb-4 border-b border-(--onyx-grey-lighter)">
                  <div className="flex justify-between text-xs">
                    <span className="text-(--onyx-grey)">Products:</span>
                    <span className="font-bold text-(--onyx-stone)">{store.products}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-(--onyx-grey)">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star size={12} weight="fill" className="text-(--accent-gold)" />
                      <span className="font-bold text-(--onyx-stone)">{store.rating}</span>
                    </div>
                  </div>
                </div>

                {/* View Button */}
                <Link
                  href={`/marketplace/${store.id}`}
                  className="w-full py-2 bg-gradient-onyx text-(--onyx-white) rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-1 group/btn"
                >
                  <ShoppingCart
                    size={14}
                    weight="bold"
                    className="group-hover/btn:scale-110 transition-transform"
                  />
                  View
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* All Stores Grid */}
      <div className="container-custom py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-(--onyx-stone) flex items-center gap-2">
            <ShoppingCart size={28} weight="bold" />
            {selectedCategory === 'all' ? 'All Stores' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Stores`}
          </h2>
        </div>

        {filteredStores.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStores.map((store) => (
              <motion.div
                key={store.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group bg-(--onyx-white) border border-(--onyx-grey-lighter) rounded-xl overflow-hidden hover:shadow-xl hover:border-(--onyx-grey) transition-all"
              >
                {/* Header with Category Badge */}
                <div className="relative bg-linear-to-br from-(--onyx-stone) to-(--onyx-dark) text-(--onyx-white) p-6">
                  <div className="absolute top-4 right-4 px-3 py-1 bg-(--onyx-white) bg-opacity-20 rounded-full text-xs font-semibold capitalize backdrop-blur-sm">
                    {store.category}
                  </div>
                  <h3 className="text-xl font-bold pr-24">{store.name}</h3>
                  <p className="text-sm text-(--onyx-grey-light) mt-1">
                    {store.description}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Rating and Reviews */}
                  <div className="flex items-center justify-between py-3 border-b border-(--onyx-grey-lighter)">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            weight={i < Math.floor(store.rating) ? 'fill' : 'light'}
                            className={
                              i < Math.floor(store.rating)
                                ? 'text-(--accent-gold)'
                                : 'text-(--onyx-grey-lighter)'
                            }
                          />
                        ))}
                      </div>
                      <span className="font-bold text-(--onyx-stone)">{store.rating}</span>
                    </div>
                    <p className="text-xs text-(--onyx-grey)">
                      {store.reviews} reviews
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-(--onyx-grey) mb-1">Products</p>
                      <p className="text-2xl font-bold text-(--onyx-stone)">
                        {store.products}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-(--onyx-grey) mb-1">Sales</p>
                      <p className="text-2xl font-bold text-(--success)">
                        {store.sales}
                      </p>
                    </div>
                  </div>

                  {/* Owner */}
                  <div>
                    <p className="text-xs text-(--onyx-grey) mb-1">Owner</p>
                    <p className="text-sm font-mono text-(--onyx-stone) font-bold">
                      {store.owner}
                    </p>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/marketplace/${store.id}`}
                    className="w-full py-3 bg-gradient-onyx text-(--onyx-white) rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 group/btn mt-4"
                  >
                    <ShoppingCart size={16} weight="bold" />
                    View Store
                    <ArrowRight
                      size={14}
                      weight="bold"
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </Link>
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
            <MagnifyingGlass
              size={48}
              weight="light"
              className="text-(--onyx-grey-lighter) mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-(--onyx-stone) mb-2">
              No stores found
            </h3>
            <p className="text-(--onyx-grey) mb-6">
              Try adjusting your search or filter criteria
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              Reset Filters
              <ArrowRight size={18} weight="bold" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
