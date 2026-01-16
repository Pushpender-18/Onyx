'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Upload, FloppyDisk, X, Image as ImageIcon } from 'phosphor-react';
import { useShop } from '@/context/ShopContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';
import { uploadImageToIPFS } from '@/lib/ipfs-upload';

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');
  const storeName = searchParams.get('storeName');
  const returnUrl = searchParams.get('returnUrl') || '/dashboard/products';

  const { addProduct: addProductToBlockchain, stores, getAllStores, signer } = useShop();
  const [currentStore, setCurrentStore] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);

  // Image upload states
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Product form state
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image: '',
    stock: 0,
  });

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Food & Beverage',
    'General',
  ];

  // Load store info
  useEffect(() => {
    const loadStore = async () => {
      if (!storeId || !storeName) {
        toast.error('Missing store information');
        setLoadingStore(false);
        return;
      }

      console.log(' Looking for store:', { storeId, storeName });
      
      // First check if store is already in the stores array
      let store = stores.find(s => s.id === storeId);
      
      // If not found and stores array is empty, try to load all stores
      if (!store && stores.length === 0) {
        console.log('📡 Stores not loaded, fetching all stores...');
        try {
          await getAllStores(signer);
          // After loading, check again
          store = stores.find(s => s.id === storeId);
        } catch (error) {
          console.error('Error loading stores:', error);
        }
      }
      
      // If still not found, create a minimal store object from URL params
      if (!store) {
        console.log(' Store not found in array, creating from URL params');
        store = {
          id: storeId,
          name: storeName,
          description: '',
          templateId: '',
          userId: '',
          customization: {
            storeName: "placeholder",
            heroTitle: "placeholder",
            heroSubtitle: "placeholder",
            heroImage: "placeholder",
            aboutText: "placeholder",
            contactEmail: "placeholder",
            products: [],
            categories: [],
            accentColor: '#d4af37',
            primaryColor: '#1a1a1a',
            secondaryColor: '#d4af37',
            // layout: [],
            // fonts: {
            //   heading: 'Inter',
            //   body: 'Inter',
            // },
          },
          isPublished: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      
      console.log(' Using store:', store);
      setCurrentStore(store);
      setLoadingStore(false);
    };

    loadStore();
  }, [storeId, storeName, stores, getAllStores]);

  const handleInputChange = (field: string, value: string) => {
    setProductData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setUploadedImage(imageDataUrl);
      setShowImageEditor(true);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Handle image cropping
  const handleCropImage = () => {
    if (!imageRef.current || !uploadedImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const containerSize = 400;
    canvas.width = containerSize;
    canvas.height = containerSize;

    // Calculate dimensions for cropping
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const minDimension = Math.min(naturalWidth, naturalHeight);
    
    // Calculate source crop area (centered square)
    const sx = (naturalWidth - minDimension) / 2;
    const sy = (naturalHeight - minDimension) / 2;

    // Apply zoom by adjusting the source crop size
    const cropSize = minDimension / zoom;
    const cropX = sx + position.x;
    const cropY = sy + position.y;

    // Draw the cropped image
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      containerSize,
      containerSize
    );

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCroppedImage(croppedDataUrl);
    setProductData(prev => ({ ...prev, image: croppedDataUrl }));
    setShowImageEditor(false);
    toast.success('Image cropped successfully');
  };

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCancelCrop = () => {
    setShowImageEditor(false);
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentStore) {
      toast.error('Store not found. Please try again.');
      return;
    }

    if (!productData.name || !productData.price) {
      toast.error('Please fill in product name and price');
      return;
    }

    const price = parseFloat(productData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setSaving(true);
    
    // Show initial transaction toast
    const loadingToast = toast.loading('Preparing transaction...');
    
    try {
      console.log('➕ Adding new product to blockchain:', productData);
      console.log('Store ID (contract address):', currentStore.id);
      
      // Upload image to IPFS first if an image is provided
      let imageHash = '';
      if (productData.image) {
        toast.loading('Uploading image to IPFS...', { id: loadingToast });
        console.log('📤 Uploading product image to IPFS...');
        
        const ipfsResult = await uploadImageToIPFS(productData.image);
        
        if (!ipfsResult.success) {
          throw new Error(ipfsResult.error || 'Failed to upload image to IPFS');
        }
        
        imageHash = ipfsResult.hash;
        console.log(' Image uploaded to IPFS:', imageHash);
        console.log('🔗 Image URL:', ipfsResult.url);
      }
      
      // Update toast to show MetaMask is needed
      toast.loading('Please confirm transaction in MetaMask...', { id: loadingToast });

      const newProduct = await addProductToBlockchain(currentStore.id, {
        name: productData.name,
        storeId: currentStore.id,
        price: price,
        stock: productData.stock,
        description: productData.description,
        images: imageHash ? [imageHash] : [], // Pass IPFS hash instead of base64 data
        metadata: {
          category: productData.category,
          tags: [],
        },
        isPublished: true,
      }, await signer.getSigner());

      if (newProduct) {
        toast.success('Product added successfully!', { id: loadingToast });
        console.log(' Product saved:', newProduct);
        
        // Wait a moment for the user to see the success message
        setTimeout(() => {
          router.push(returnUrl);
        }, 1000);
      } else {
        toast.error('Failed to add product', { id: loadingToast });
      }
    } catch (error: any) {
      console.error(' Error adding product:', error);
      
      let errorMessage = 'Failed to add product';
      if (error.message?.includes('rejected')) {
        errorMessage = 'Transaction rejected';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas';
      } else if (error.message?.includes('Only owner')) {
        errorMessage = 'Only store owner can add products';
      } else if (error.message?.includes('IPFS')) {
        errorMessage = error.message; // Show IPFS upload errors
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      {loadingStore ? (
        <div className="min-h-screen flex items-center justify-center bg-(--onyx-white)">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--onyx-stone) mx-auto mb-4"></div>
            <p className="text-(--onyx-grey) font-medium">Loading store information...</p>
          </div>
        </div>
      ) : !currentStore || !storeId || !storeName ? (
        <div className="min-h-screen flex items-center justify-center bg-(--onyx-white)">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-(--onyx-stone) mb-2">Store Not Found</h1>
            <p className="text-(--onyx-grey) mb-6">
              Unable to load store information. Please try again.
            </p>
            <button
              onClick={() => router.push('/dashboard/stores')}
              className="btn-primary"
            >
              Back to Stores
            </button>
          </div>
        </div>
      ) : (
      <div className="min-h-screen bg-(--onyx-white)">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-(--onyx-grey-lighter) bg-white"
        >
          <div className="container-custom py-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-(--onyx-grey) hover:text-(--onyx-dark) transition-colors mb-4"
            >
              <ArrowLeft size={18} weight="bold" />
              Back
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-(--onyx-stone)">Add New Product</h1>
                {currentStore && (
                  <p className="text-(--onyx-grey) mt-2">
                    Adding to: <span className="font-semibold text-(--onyx-dark)">{currentStore.name}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <div className="container-custom py-12">
          <div className="max-w-3xl mx-auto">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-lg border border-(--onyx-grey-lighter) shadow-sm p-8 space-y-6"
            >
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-(--onyx-dark) mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className="input-field"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-(--onyx-dark) mb-2">
                  Description
                </label>
                <textarea
                  value={productData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product"
                  className="input-field"
                  rows={4}
                />
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-(--onyx-dark) mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className="input-field"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-(--onyx-grey)">MNT</span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-(--onyx-dark) mb-2">
                    Category
                  </label>
                  <select
                    value={productData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="input-field"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock Counter */}
              <div>
                <label className="block text-sm font-semibold text-(--onyx-dark) mb-2">
                  Stock Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setProductData(prev => ({ ...prev, stock: Math.max(0, prev.stock - 1) }))}
                    className="w-12 h-12 flex items-center justify-center bg-(--onyx-grey-lighter) hover:bg-(--onyx-grey-light) text-(--onyx-dark) rounded-lg font-bold text-xl transition-colors"
                  >
                    −
                  </button>
                    <input
                    type="number"
                    min="0"
                    value={productData.stock}
                    onChange={(e) => setProductData(prev => ({ ...prev, stock: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="input-field text-center font-semibold text-lg flex-1 max-w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  <button
                    type="button"
                    onClick={() => setProductData(prev => ({ ...prev, stock: prev.stock + 1 }))}
                    className="w-12 h-12 flex items-center justify-center bg-(--onyx-stone) hover:bg-(--onyx-dark) text-white rounded-lg font-bold text-xl transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-(--onyx-grey) ml-2">units available</span>
                </div>
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-sm font-semibold text-(--onyx-dark) mb-3">
                  Product Image
                </label>
                
                {/* Image Preview */}
                {productData.image && !showImageEditor && (
                  <div className="mb-4">
                    <div className="relative w-full max-w-md aspect-square bg-(--onyx-grey-lighter) rounded-lg overflow-hidden border border-(--onyx-grey-light)">
                      <img
                        src={productData.image}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setProductData(prev => ({ ...prev, image: '' }))}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <X size={16} weight="bold" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* File Upload Button */}
                <div className="flex gap-3 mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-(--onyx-stone) text-white rounded-lg hover:bg-(--onyx-dark) transition-colors"
                  >
                    <Upload size={18} weight="bold" />
                    Upload from Device
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter image URL:');
                      if (url) {
                        setProductData(prev => ({ ...prev, image: url }));
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-(--onyx-grey-light) text-(--onyx-dark) rounded-lg hover:bg-(--onyx-grey-lighter) transition-colors"
                  >
                    <ImageIcon size={18} weight="bold" />
                    Use URL
                  </button>
                </div>

                <p className="text-xs text-(--onyx-grey)">
                  💡 Recommended: 1:1 aspect ratio (square) • 500x500px or larger
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">ℹ️ Note:</span> Products are saved directly to the blockchain and will be immediately visible on your storefront.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FloppyDisk size={18} weight="bold" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        </div>

        {/* Image Editor Modal */}
        <AnimatePresence>
          {showImageEditor && uploadedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
              onClick={handleCancelCrop}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 max-w-2xl w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-(--onyx-stone)">Crop Image</h3>
                  <button
                    onClick={handleCancelCrop}
                    className="p-2 hover:bg-(--onyx-grey-lighter) rounded-full transition-colors"
                  >
                    <X size={24} weight="bold" />
                  </button>
                </div>

                {/* Image Editor Area */}
                <div className="mb-6">
                  <div
                    className="relative w-full aspect-square bg-(--onyx-grey-lighter) rounded-lg overflow-hidden border-2 border-(--onyx-grey-light) cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <img
                      ref={imageRef}
                      src={uploadedImage}
                      alt="Upload preview"
                      className="absolute"
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                        transformOrigin: 'top left',
                        maxWidth: 'none',
                        width: '100%',
                        height: 'auto',
                      }}
                      draggable={false}
                    />
                  </div>

                  {/* Zoom Control */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-(--onyx-dark) mb-2">
                      Zoom: {zoom.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <p className="text-sm text-(--onyx-grey) mt-2">
                    💡 Drag the image to reposition, use the slider to zoom
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelCrop}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropImage}
                    className="flex-1 btn-primary"
                  >
                    Apply Crop
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}
    </ProtectedRoute>
  );
}
