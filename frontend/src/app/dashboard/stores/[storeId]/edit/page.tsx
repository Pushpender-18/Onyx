'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useShop } from '@/context/ShopContext';
import { Store, StoreCustomization } from '@/types';
import { FloppyDisk, X } from 'phosphor-react';

export default function EditStorePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const { stores, isLoading, getAllStores, updateStore, signer } = useShop();
  
  const [store, setStore] = useState<Store | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    isPublished: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadStoreData = async () => {
      setIsLoadingData(true);
      
      // If stores array is empty, fetch from blockchain
      if (stores.length === 0) {
        await getAllStores(signer);
      }
      
      setIsLoadingData(false);
    };
    
    loadStoreData();
  }, []);

  useEffect(() => {
    // Find the store after data is loaded
    const foundStore = stores.find(s => s.id === storeId);
    if (foundStore) {
      setStore(foundStore);
      setFormData({
        name: foundStore.name,
        description: foundStore.description || '',
        templateId: foundStore.templateId,
        primaryColor: foundStore.customization?.primaryColor || '#000000',
        secondaryColor: foundStore.customization?.secondaryColor || '#ffffff',
        isPublished: foundStore.isPublished,
      });
    }
  }, [storeId, stores]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      if (!store) {
        throw new Error('Store not found');
      }

      // Update store in context (in-memory only)
      // TODO: In the future, add blockchain function to update store on-chain
      const updates: Partial<Store> = {
        name: formData.name,
        description: formData.description,
        templateId: formData.templateId,
        isPublished: formData.isPublished,
        customization: {
          ...store.customization,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        },
      };

      updateStore(storeId, updates);

      setSaveSuccess(true);
      
      // Redirect back to store details after 1.5 seconds
      setTimeout(() => {
        router.push(`/dashboard/stores/${storeId}`);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating store:', error);
      setSaveError(error.message || 'Failed to update store');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--onyx-dark) mx-auto mb-4"></div>
          <p className="text-(--onyx-grey)">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store && !isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-(--onyx-dark) mb-4">Store Not Found</h2>
          <p className="text-(--onyx-grey) mb-6">The store you're trying to edit doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard/stores')}
            className="px-6 py-2 bg-(--onyx-dark) text-white rounded-lg hover:bg-(--onyx-stone) transition-colors"
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  // Don't render until we have the store
  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.push(`/dashboard/stores/${storeId}`)}
          className="text-(--onyx-grey) hover:text-(--onyx-dark) transition-colors mb-4 flex items-center gap-2"
        >
          <span>←</span> Back to Store
        </button>
        
        <h1 className="text-4xl font-bold text-(--onyx-dark) mb-2">Edit Store</h1>
        <p className="text-(--onyx-grey) text-lg">Update your store details and configuration</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm p-8 max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-(--onyx-dark) mb-2">
              Store Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-(--onyx-grey-lighter) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--onyx-dark) transition-all"
              placeholder="My Amazing Store"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-(--onyx-dark) mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-(--onyx-grey-lighter) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--onyx-dark) transition-all resize-none"
              placeholder="Tell customers about your store..."
            />
          </div>

          {/* Template Selection */}
          <div>
            <label htmlFor="templateId" className="block text-sm font-medium text-(--onyx-dark) mb-2">
              Template *
            </label>
            <select
              id="templateId"
              name="templateId"
              value={formData.templateId}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-(--onyx-grey-lighter) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--onyx-dark) transition-all"
            >
              <option value="minimal">Minimal</option>
              <option value="tech">Tech</option>
              <option value="fashion">Fashion</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          {/* Theme Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-(--onyx-dark) mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  className="w-16 h-12 border border-(--onyx-grey-lighter) rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1 px-4 py-3 border border-(--onyx-grey-lighter) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--onyx-dark) font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="secondaryColor" className="block text-sm font-medium text-(--onyx-dark) mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="secondaryColor"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleInputChange}
                  className="w-16 h-12 border border-(--onyx-grey-lighter) rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="flex-1 px-4 py-3 border border-(--onyx-grey-lighter) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--onyx-dark) font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Publish Status */}
          <div className="flex items-center gap-3 p-4 bg-(--onyx-grey-lighter)/30 rounded-lg">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleInputChange}
              className="w-5 h-5 text-(--onyx-dark) border-gray-300 rounded focus:ring-(--onyx-dark)"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-(--onyx-dark) cursor-pointer">
              Publish this store (make it visible to customers)
            </label>
          </div>

          {/* Error Message */}
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <X size={20} className="text-red-600 mt-0.5 shrink-0" weight="bold" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 mb-1">Error</h4>
                <p className="text-sm text-red-600">{saveError}</p>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-sm text-green-800 font-medium">✓ Store updated successfully!</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/stores/${storeId}`)}
              className="flex-1 px-6 py-3 border border-(--onyx-grey-lighter) text-(--onyx-dark) rounded-lg hover:bg-(--onyx-grey-lighter)/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || saveSuccess}
              className="flex-1 px-6 py-3 bg-(--onyx-dark) text-white rounded-lg hover:bg-(--onyx-stone) transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FloppyDisk size={20} weight="bold" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 max-w-3xl"
      >
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Note</h3>
        <p className="text-sm text-blue-700">
          Store updates are currently stored in memory during your session. Core store data is read from the blockchain. 
          Future versions will support updating store metadata on-chain for permanent, decentralized storage.
        </p>
      </motion.div>
    </div>
  );
}
