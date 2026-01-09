'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Warning, CheckCircle, Rocket, Globe } from 'phosphor-react';
import toast from 'react-hot-toast';

interface SavePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (storeName: string) => Promise<void>;
  initialStoreName: string;
  isPublishing?: boolean;
}

export const SavePublishModal: React.FC<SavePublishModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  initialStoreName,
  isPublishing = false,
}) => {
  const [storeName, setStoreName] = useState(initialStoreName);
  const [isLoading, setIsLoading] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setStoreName(initialStoreName);
    setPublishSuccess(false);
    setErrors({});
  }, [isOpen, initialStoreName]);

  // Validation function
  const validateStoreName = (name: string): boolean => {
    const newErrors: Record<string, string> = {};

    // Check if empty
    if (!name.trim()) {
      newErrors.storeName = 'Store name is required';
    }

    // Check length
    if (name.length < 3) {
      newErrors.storeName = 'Store name must be at least 3 characters long';
    } else if (name.length > 50) {
      newErrors.storeName = 'Store name must be at most 50 characters long';
    }

    // Check for valid characters (alphanumeric, dashes, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      newErrors.storeName =
        'Store name can only contain letters, numbers, dashes, and underscores';
    }

    // Check if it starts with a letter
    if (!/^[a-zA-Z]/.test(name)) {
      newErrors.storeName = 'Store name must start with a letter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateStoreName(storeName)) {
      return;
    }

    setIsLoading(true);

    try {
      await onPublish(storeName);
      setPublishSuccess(true);
      // Keep modal open for 2 seconds to show success state
      setTimeout(() => {
        setPublishSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish store';
      toast.error(errorMessage);
      setErrors({ publish: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setStoreName(newName);
    // Clear error on typing
    if (errors.storeName) {
      setErrors({ ...errors, storeName: '' });
    }
  };

  if (!isOpen) return null;

  const storeUrl = `onyx-shop.vercel.app/${storeName}`;
  const isValid = !errors.storeName && storeName.trim().length >= 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-gray-900 to-gray-800 px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {publishSuccess ? (
              <CheckCircle size={40} weight="fill" className="text-green-400" />
            ) : (
              <Rocket size={40} weight="duotone" className="text-white" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">
                {publishSuccess ? 'Store Published!' : 'Save & Publish Store'}
              </h2>
              <p className="text-gray-300 text-base mt-1">
                {publishSuccess ? 'Your store is now live' : 'Finalize your store URL'}
              </p>
            </div>
          </div>
          {!publishSuccess && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={28} className="text-white" weight="bold" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-8 py-8 space-y-6">
          {publishSuccess ? (
            // Success State
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle size={24} weight="fill" className="text-green-600" />
                  <p className="text-green-800 font-bold text-lg">Your store is now live!</p>
                </div>
                <a
                  href={`https://${storeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-mono text-base hover:underline break-all inline-block"
                >
                  https://{storeUrl}
                </a>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <p className="text-gray-800 text-base space-y-2">
                  <span className="flex items-center gap-2">
                    <Check size={20} weight="bold" className="text-green-600" /> Store settings saved
                  </span>
                  <span className="flex items-center gap-2">
                    <Check size={20} weight="bold" className="text-green-600" /> Products configured
                  </span>
                  <span className="flex items-center gap-2">
                    <Check size={20} weight="bold" className="text-green-600" /> URL deployed
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <p className="text-gray-700 text-base font-semibold mb-4">Share your store:</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://${storeUrl}`);
                      toast.success('URL copied to clipboard!');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-base font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Globe size={18} weight="duotone" />
                    Copy URL
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20new%20store%20on%20Onyx:%20https://${storeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <Rocket size={18} weight="duotone" />
                    Share
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            // Input State
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <label className="block text-base font-bold text-gray-900 mb-4">
                  Choose Your Store URL
                </label>

                <div className="relative">
                  <div className="flex items-center gap-3 px-5 py-4 bg-gray-100 rounded-xl border-2 border-gray-300 focus-within:border-gray-900 transition-colors">
                    <span className="text-base text-gray-600 font-medium whitespace-nowrap">
                      https://onyx-shop.vercel.app/
                    </span>
                    <input
                      type="text"
                      value={storeName}
                      onChange={handleNameChange}
                      placeholder="mystorename"
                      maxLength={50}
                      disabled={isLoading}
                      className={`flex-1 bg-transparent text-base font-semibold focus:outline-none placeholder-gray-400 ${
                        errors.storeName ? 'text-red-600' : 'text-gray-900'
                      }`}
                    />
                    {isValid && (
                      <Check size={24} weight="bold" className="text-green-600" />
                    )}
                    {errors.storeName && (
                      <Warning size={24} weight="bold" className="text-red-600" />
                    )}
                  </div>
                </div>

                {/* Character Count */}
                <div className="mt-3 text-right">
                  <p className="text-sm text-gray-500 font-medium">
                    {storeName.length}/50 characters
                  </p>
                </div>

                {/* Error Message */}
                {errors.storeName && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                  >
                    <p className="text-base text-red-700 flex items-center gap-2 font-medium">
                      <Warning size={20} weight="bold" />
                      {errors.storeName}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Preview */}
              <div className="bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={20} weight="duotone" className="text-gray-700" />
                  <p className="text-sm text-gray-700 font-bold">Your store will be available at:</p>
                </div>
                <p className="text-xl font-mono font-bold text-gray-900 break-all">
                  https://{storeUrl}
                </p>
              </div>

              {/* Validation Rules */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <p className="text-sm font-bold text-gray-700 mb-4">URL Requirements:</p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className={`flex items-center gap-2 ${storeName.length >= 3 && storeName.length <= 50 ? 'text-green-600 font-semibold' : ''}`}>
                    <span className="text-lg">{storeName.length >= 3 && storeName.length <= 50 ? '✓' : '○'}</span>
                    3-50 characters long
                  </li>
                  <li className={`flex items-center gap-2 ${/^[a-zA-Z]/.test(storeName) ? 'text-green-600 font-semibold' : ''}`}>
                    <span className="text-lg">{/^[a-zA-Z]/.test(storeName) ? '✓' : '○'}</span>
                    Must start with a letter
                  </li>
                  <li className={`flex items-center gap-2 ${/^[a-zA-Z0-9_-]*$/.test(storeName) && storeName ? 'text-green-600 font-semibold' : ''}`}>
                    <span className="text-lg">{/^[a-zA-Z0-9_-]*$/.test(storeName) && storeName ? '✓' : '○'}</span>
                    Only letters, numbers, dashes & underscores
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {!publishSuccess && (
          <div className="bg-gray-50 px-8 py-6 flex gap-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl font-bold text-base text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!isValid || isLoading}
              className={`flex-1 px-6 py-3.5 rounded-xl font-bold text-base text-white transition-colors flex items-center justify-center gap-2 ${
                isValid && !isLoading
                  ? 'bg-linear-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Rocket size={20} weight="duotone" />
                  </motion.div>
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket size={20} weight="duotone" />
                  Publish Store
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
