'use client';

import React, { useState, useCallback } from 'react';
import { getIPFSUrl, getIPFSGatewayUrls } from '@/lib/ipfs-upload';

interface IPFSImageProps {
  hash: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const IPFSImage: React.FC<IPFSImageProps> = ({
  hash,
  alt,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop',
  onError: onErrorProp,
}) => {
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [failedGateways, setFailedGateways] = useState<Set<string>>(new Set());

  // If no hash provided, use fallback immediately
  if (!hash) {
    return <img src={fallbackSrc} alt={alt} className={className} />;
  }

  // Get all available gateway URLs
  const gatewayUrls = getIPFSGatewayUrls(hash);
  const currentUrl = gatewayUrls[currentGatewayIndex];

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      console.warn(` Failed to load image from gateway ${currentGatewayIndex}:`, currentUrl);

      // Add current gateway to failed set
      setFailedGateways((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentUrl);
        return newSet;
      });

      // Try next gateway
      if (currentGatewayIndex < gatewayUrls.length - 1) {
        console.log(
          `🔄 Trying alternative gateway ${currentGatewayIndex + 1}/${gatewayUrls.length - 1}`
        );
        setCurrentGatewayIndex((prev) => prev + 1);
      } else {
        // All gateways failed, use fallback
        console.error(' All IPFS gateways failed, using fallback image');
        (e.target as HTMLImageElement).src = fallbackSrc;

        // Call original error handler if provided
        if (onErrorProp) {
          onErrorProp(e);
        }
      }
    },
    [currentGatewayIndex, fallbackSrc, onErrorProp, gatewayUrls]
  );

  console.log(`🖼️ Loading IPFS image [${currentGatewayIndex + 1}/${gatewayUrls.length}]:`, currentUrl);

  return <img src={currentUrl} alt={alt} className={className} onError={handleImageError} />;
};
