'use client';

import { useWeb3Auth, useWeb3AuthUser } from '@web3auth/modal/react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, ShoppingCart, TrendUp, ArrowRight, ArrowsClockwise } from 'phosphor-react';
import { ethers } from 'ethers';

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

export default function Dashboard() {
  const { userInfo } = useWeb3AuthUser();
  const userName = userInfo?.name ? userInfo.name : "User";

  // const [recentStores] = useState<Store[]>([]);
  const router = useRouter();
  const { provider } = useWeb3Auth();
  console.log("Chain ID: " + provider?.chainId);

  // const signer = getSigner(provider);
  const { stores, products, getProducts, isLoading, getAllStores, refreshData, getTotalSalesByOwner, totalSalesByOwner, signer, setSignerWrapper } = useShop();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tries, setTries] = useState(0);

  // Load stores from blockchain on mount
  useEffect(() => {
    if (signer == null) {
      const getSigner = async (provider: any) => {
        if (provider) {
          const signer = new ethers.BrowserProvider(provider);          
          setSignerWrapper(await signer.getSigner());
          // setSignerWrapper(signer);
        }
        return null;
      }

      getSigner(provider);
    }
    else {
      if (tries < 6) {
        setTries(tries + 1);
        if (stores.length === 0 && !isLoading) {
          getAllStores(signer);
          setTries(tries + 1);
        }
        if (stores.length === 0 && !isLoading) {
          getAllStores(signer);
          console.log("stores:", stores);
        } else if (products.length === 0 && !isLoading) {
          getProductsAndStores();

          const result = async () => {
            const sales = await getTotalSalesByOwner(signer);
            console.log("Total sales by owner:", sales);
          };
          result();

        }
      }
    }
  }, [stores, signer]);

  const getProductsAndStores = async () => {
    console.log("Fetching products for stores:", stores);
    for (let store of stores) {
      await getProducts(store.id, signer);
    }
    console.log("products:", products);
  };

  // Calculate stats from actual data
  const totalStores = stores.length;
  const totalSales = 0; // This would need to be tracked in smart contract

  // Get product count for each store
  const getProductCount = (storeId: string) => {
    return products.filter(p => p.storeId === storeId).length;
  };

  // Get recent stores (last 5)
  const recentStores = stores.slice(0, 5);

  // Handle refresh from blockchain
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData(signer);
    setIsRefreshing(false);
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
                <h1 className="text-4xl font-bold text-(--onyx-stone) mb-2">Dashboard</h1>
                <p className="text-(--onyx-grey)">
                  Welcome back, {userName}
                </p>
              </div>
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="btn-secondary flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Refresh from blockchain"
              >
                <ArrowsClockwise
                  size={20}
                  weight="bold"
                  className={isRefreshing ? 'animate-spin' : ''}
                />
                {isRefreshing ? 'Syncing...' : 'Sync'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="container-custom py-8 space-y-8">
          {/* Action Buttons and Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Create Store Card */}
            <motion.div variants={itemVariants}>
              <Link
                href="/dashboard/create-store"
                className="card p-6 block hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-(--onyx-stone) mb-2">
                      Create New Store
                    </h3>
                    <p className="text-sm text-(--onyx-grey)">
                      Launch your decentralized store
                    </p>
                  </div>
                  <Plus size={24} weight="bold" className="text-(--onyx-stone)" />
                </div>
              </Link>
            </motion.div>

            {/* Stats */}
            {[
              {
                label: 'Total Stores',
                value: totalStores,
                icon: ShoppingCart,
              },
              {
                label: 'Total Sales',
                value: `$${totalSalesByOwner?.totalSalesInEth || 0}`,
                icon: TrendUp,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card p-6"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-(--onyx-grey) mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-(--onyx-stone)">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-(--onyx-grey-lighter) flex items-center justify-center">
                    <stat.icon
                      size={24}
                      weight="bold"
                      className="text-(--onyx-stone)"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Stores */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="card p-6"
          >
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between mb-6"
            >
              <h2 className="text-xl font-semibold text-(--onyx-stone)">My Stores</h2>
              <Link
                href="/dashboard/stores"
                className="text-sm text-(--onyx-stone) hover:font-semibold transition-all flex items-center gap-1"
              >
                View All
                <ArrowRight size={16} weight="bold" />
              </Link>
            </motion.div>

            {recentStores.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {recentStores.map((store, index) => (
                  <motion.div
                    key={store.id}
                    variants={itemVariants}
                    onClick={() => router.push(`/dashboard/stores/${store.id}`)}
                    className="flex items-start justify-between p-4 bg-(--onyx-grey-lighter)/30 rounded-lg hover:bg-(--onyx-grey-lighter)/50 transition-colors cursor-pointer group"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div>
                      <h3 className="font-semibold text-(--onyx-stone) group-hover:text-(--onyx-dark) transition-colors">
                        {store.name}
                      </h3>
                      <p className="text-sm text-(--onyx-grey) mt-1">
                        {getProductCount(store.id)} products • Created {new Date(store.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-(--onyx-stone)">
                        {store.templateId}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="py-12 text-center"
              >
                <ShoppingCart
                  size={48}
                  weight="light"
                  className="text-(--onyx-grey-lighter) mx-auto mb-4"
                />
                <p className="text-(--onyx-grey) mb-4">No stores yet</p>
                <Link
                  href="/dashboard/create-store"
                  className="btn-primary text-sm inline-block"
                >
                  Create Your First Store
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-linear-to-br from-(--onyx-grey-lighter)/50 to-(--onyx-white) border border-(--onyx-grey-lighter) rounded-lg p-6"
          >
            <motion.h3
              variants={itemVariants}
              className="text-lg font-semibold text-(--onyx-stone) mb-4"
            >
              Quick Tips
            </motion.h3>
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {[
                'Customize your store with our drag-and-drop editor',
                'Add unlimited products and images to your catalog',
                'All product data is stored securely on IPFS',
                'Your store is fully decentralized and under your control',
              ].map((tip, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-3"
                >
                  <span className="inline-block w-1.5 h-1.5 bg-(--onyx-stone) rounded-full mt-2 shrink-0"></span>
                  <span className="text-(--onyx-grey)">{tip}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
