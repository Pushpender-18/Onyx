'use client';

import React from 'react';
import Link from 'next/link';
import { useWeb3Auth } from '@/context/Web3AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Cube,
  ShoppingCart,
  Lock,
  Rocket,
  ArrowRight,
  Check,
} from 'phosphor-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
} as const;

export default function Home() {
  const { isAuthenticated, login, isLoading } = useWeb3Auth();
  const router = useRouter();

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      try {
        await login();
        router.push('/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-(--onyx-white)">
      {/* Hero Section */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 right-10 w-72 h-72 bg-(--accent-gold) rounded-full opacity-10 blur-3xl"
            animate={{
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          ></motion.div>
          <motion.div
            className="absolute bottom-0 left-10 w-96 h-96 bg-(--onyx-stone) rounded-full opacity-5 blur-3xl"
            animate={{
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          ></motion.div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
          >
            {/* Left Content */}
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                <div className="inline-block px-4 py-2 bg-(--onyx-grey-lighter) rounded-full">
                  <span className="text-xs font-semibold text-(--onyx-stone)">
                    ✨ Built on Mantle Network
                  </span>
                </div>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-6xl font-bold leading-tight"
              >
                Your Store,{' '}
                <span className="text-gradient">Completely Decentralized</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg text-(--onyx-grey) leading-relaxed"
              >
                Launch your own e-commerce store on the blockchain. No middlemen, no fees,
                just you and your customers. Powered by Onyx and Mantle Network.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <motion.button
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  className="btn-primary flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? 'Connecting...' : 'Get Started'}
                  <ArrowRight size={18} weight="bold" />
                </motion.button>
                <motion.a
                  href="#features"
                  className="btn-secondary flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.a>
              </motion.div>
            </div>

            {/* Right Illustration */}
            <motion.div
              variants={itemVariants}
              className="relative h-96 md:h-full flex items-center justify-center"
            >
              <motion.div
                className="w-full max-w-sm"
                animate={{
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="relative">
                  {/* Store Window */}
                  <div className="bg-gradient-onyx rounded-lg p-8 text-(--onyx-white) shadow-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <ShoppingCart size={24} weight="bold" />
                        <span className="font-semibold">Your Store</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-(--onyx-grey-lighter)/20 rounded w-3/4"></div>
                        <div className="h-3 bg-(--onyx-grey-lighter)/20 rounded w-full"></div>
                        <div className="h-3 bg-(--onyx-grey-lighter)/20 rounded w-5/6"></div>
                      </div>
                      <div className="pt-4 border-t border-(--onyx-grey-lighter)/20">
                        <div className="text-sm font-semibold flex justify-between">
                          <span>Total Sales</span>
                          <span className="text-(--accent-gold)">$0</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-20 h-20 bg-(--accent-gold) rounded-lg flex items-center justify-center shadow-lg"
                    animate={{
                      rotate: [0, 10, 0],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Cube size={32} weight="fill" className="text-(--onyx-black)" />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 -left-4 w-16 h-16 bg-(--onyx-stone) rounded-lg flex items-center justify-center shadow-lg"
                    animate={{
                      rotate: [0, -10, 0],
                      y: [0, 10, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Lock size={24} weight="fill" className="text-(--onyx-white)" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section bg-(--onyx-grey-lighter)/30">
        <div className="container-custom">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-center mb-4"
            >
              Why Choose Onyx?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-center text-(--onyx-grey) max-w-2xl mx-auto"
            >
              Everything you need to build and manage a thriving decentralized store.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Rocket,
                title: 'Easy to Use',
                description: 'Launch your store in minutes with our intuitive drag-and-drop editor.',
              },
              {
                icon: Lock,
                title: 'Fully Secure',
                description: 'Built on blockchain technology for maximum security and transparency.',
              },
              {
                icon: ShoppingCart,
                title: 'Full Control',
                description: 'Own your store and data. No middlemen, no hidden fees, no restrictions.',
              },
              {
                icon: Cube,
                title: 'Flexible Templates',
                description: 'Choose from pre-designed templates or customize completely from scratch.',
              },
              {
                icon: Check,
                title: 'Multi-Chain Support',
                description: 'Built on Mantle Network for fast transactions and low fees.',
              },
              {
                icon: Check,
                title: 'IPFS Integration',
                description: 'Store your product data on IPFS for permanent, decentralized storage.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card p-6 group hover:shadow-lg transition-shadow"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-(--onyx-grey-lighter) rounded-lg flex items-center justify-center mb-4 group-hover:bg-(--onyx-stone) group-hover:text-(--onyx-white) transition-colors">
                  <feature.icon size={24} weight="bold" />
                </div>
                <h3 className="text-lg font-semibold text-(--onyx-black) mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-(--onyx-grey) leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-center mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-center text-(--onyx-grey) max-w-2xl mx-auto"
            >
              Get started in three simple steps.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                number: '01',
                title: 'Connect Wallet',
                description: 'Connect your Web3 wallet to get started. We support all major wallets on Mantle Network.',
              },
              {
                number: '02',
                title: 'Design Your Store',
                description: 'Choose a template or start from scratch. Use our drag-and-drop editor to customize.',
              },
              {
                number: '03',
                title: 'Add Products & Launch',
                description: 'Add your products with images and details. Launch and start selling immediately.',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-(--onyx-stone) text-(--onyx-white) flex items-center justify-center text-2xl font-bold mb-6"
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.number}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-(--onyx-black) mb-3">
                    {step.title}
                  </h3>
                  <p className="text-(--onyx-grey) leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[40%] h-0.5 bg-linear-to-r from-(--onyx-stone) to-transparent"></div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-onyx text-(--onyx-white)">
        <div className="container-custom">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Ready to Launch Your Store?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg opacity-90 mb-8"
            >
              Join the decentralized commerce revolution. Start building your store today.
            </motion.p>
            <motion.button
              variants={itemVariants}
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-(--accent-gold) text-(--onyx-black) px-8 py-4 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Connecting...' : 'Get Started Now'}
              <ArrowRight size={20} weight="bold" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
