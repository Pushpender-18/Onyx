'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Warning, CheckCircle } from 'phosphor-react';
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

  const storeUrl = `${storeName}.onyx-shop.vercel.app`;
  const isValid = !errors.storeName && storeName.trim().length >= 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      <motion.div
        className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {publishSuccess ? (
              <CheckCircle size={28} weight="fill" className="text-white" />
            ) : (
              <span className="text-3xl">🚀</span>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">
                {publishSuccess ? 'Store Published!' : 'Save & Publish Store'}
              </h2>
              <p className="text-blue-100 text-sm">
                {publishSuccess ? 'Your store is now live' : 'Finalize your store URL'}
              </p>
            </div>
          </div>
          {!publishSuccess && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" weight="bold" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {publishSuccess ? (
            // Success State
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-semibold mb-2">Your store is now live!</p>
                <a
                  href={`https://${storeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-mono text-sm hover:underline break-all"
                >
                  https://{storeUrl}
                </a>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  ✓ Store settings saved
                  <br />✓ Products configured
                  <br />✓ URL deployed
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm font-semibold mb-2">Share your store:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://${storeUrl}`);
                      toast.success('URL copied to clipboard!');
                    }}
                    className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Copy URL
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20new%20store%20on%20Onyx:%20https://${storeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors text-center"
                  >
                    Share
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            // Input State
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Choose Your Store URL
                </label>

                <div className="relative">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-t-lg border-b border-gray-300">
                    <span className="text-sm text-gray-600 font-medium">https://</span>
                    <input
                      type="text"
                      value={storeName}
                      onChange={handleNameChange}
                      placeholder="mystorename"
                      maxLength={50}
                      disabled={isLoading}
                      className={`flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder-gray-400 ${
                        errors.storeName ? 'text-red-600' : 'text-gray-900'
                      }`}
                    />
                    {isValid && (
                      <Check size={20} weight="bold" className="text-green-600" />
                    )}
                    {errors.storeName && (
                      <Warning size={20} weight="bold" className="text-red-600" />
                    )}
                  </div>
                  <div className="px-4 py-3 bg-white rounded-b-lg border border-t-0 border-gray-300 text-sm text-gray-600">
                    <span className="text-gray-600">.onyx-shop.vercel.app</span>
                  </div>
                </div>

                {/* Character Count */}
                <div className="mt-2 text-right">
                  <p className="text-xs text-gray-500">
                    {storeName.length}/50 characters
                  </p>
                </div>

                {/* Error Message */}
                {errors.storeName && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <Warning size={16} weight="bold" />
                      {errors.storeName}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Preview */}
              <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-700 font-semibold mb-2">Your store will be available at:</p>
                <p className="text-lg font-mono font-bold text-blue-900 break-all">
                  https://{storeUrl}
                </p>
              </div>

              {/* Validation Rules */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">URL Requirements:</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className={storeName.length >= 3 ? 'text-green-600' : ''}>
                    ✓ 3-50 characters long
                  </li>
                  <li className={/^[a-zA-Z]/.test(storeName) ? 'text-green-600' : ''}>
                    ✓ Must start with a letter
                  </li>
                  <li
                    className={
                      /^[a-zA-Z0-9_-]*$/.test(storeName) ? 'text-green-600' : ''
                    }
                  >
                    ✓ Only letters, numbers, dashes & underscores
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {!publishSuccess && (
          <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!isValid || isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                isValid && !isLoading
                  ? 'bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⚙️
                  </motion.span>
                  Publishing...
                </>
              ) : (
                <>
                  <span>🚀</span>
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
