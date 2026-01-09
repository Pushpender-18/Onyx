/**
 * IPFS Upload Utility
 * 
 * This module handles uploading images to IPFS and returning their content identifiers (CIDs).
 * 
 * DEVELOPMENT MODE:
 * Currently uses placeholder IPFS hashes for development/testing.
 * 
 * PRODUCTION MODE:
 * To integrate a real IPFS service, uncomment and configure one of these options:
 * 1. Pinata (https://pinata.cloud) - easiest, cloud-hosted
 * 2. Infura IPFS (https://infura.io/product/ipfs) - reliable, requires API key
 * 3. Local IPFS node (https://docs.ipfs.tech) - fully decentralized
 */

// Type for upload result
export interface IPFSUploadResult {
  success: boolean;
  hash: string;
  url?: string;
  error?: string;
}

// Configuration for IPFS services (to be configured for production)
const IPFS_CONFIG = {
  // Set to 'placeholder' for development, or 'pinata', 'infura', 'local' for production
  provider: 'placeholder' as 'placeholder' | 'pinata' | 'infura' | 'local',
  
  // Pinata configuration
  pinata: {
    apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
    secretApiKey: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || '',
    gateway: 'https://gateway.pinata.cloud/ipfs/'
  },
  
  // Infura configuration
  infura: {
    projectId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID || '',
    projectSecret: process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET || '',
    gateway: 'https://ipfs.infura.io/ipfs/'
  },
  
  // Local IPFS node configuration
  local: {
    apiUrl: process.env.NEXT_PUBLIC_IPFS_API_URL || 'http://localhost:5001',
    gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'http://localhost:8080/ipfs/'
  }
};

/**
 * Upload an image to IPFS
 * @param imageData - Base64 encoded image data URL or File object
 * @returns Promise with IPFS hash
 */
export async function uploadImageToIPFS(imageData: string | File): Promise<IPFSUploadResult> {
  try {
    console.log('📤 Uploading image to IPFS...');
    
    switch (IPFS_CONFIG.provider) {
      case 'placeholder':
        return uploadToPlaceholder(imageData);
      
      case 'pinata':
        return uploadToPinata(imageData);
      
      case 'infura':
        return uploadToInfura(imageData);
      
      case 'local':
        return uploadToLocalNode(imageData);
      
      default:
        return uploadToPlaceholder(imageData);
    }
  } catch (error: any) {
    console.error('❌ Error uploading to IPFS:', error);
    return {
      success: false,
      hash: '',
      error: error.message || 'Failed to upload to IPFS'
    };
  }
}

/**
 * PLACEHOLDER MODE (for development)
 * Generates a mock IPFS hash without actually uploading to IPFS
 */
async function uploadToPlaceholder(imageData: string | File): Promise<IPFSUploadResult> {
  console.log('🔧 Using placeholder IPFS hash (development mode)');
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate a deterministic-looking placeholder hash
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 15);
  const placeholderHash = `QmPlaceholder${randomPart}${timestamp}`;
  
  console.log('✅ Generated placeholder IPFS hash:', placeholderHash);
  
  return {
    success: true,
    hash: placeholderHash,
    url: `https://ipfs.io/ipfs/${placeholderHash}`,
  };
}

/**
 * PINATA INTEGRATION (for production)
 * Upload to Pinata's IPFS pinning service
 */
async function uploadToPinata(imageData: string | File): Promise<IPFSUploadResult> {
  const { apiKey, secretApiKey, gateway } = IPFS_CONFIG.pinata;
  
  if (!apiKey || !secretApiKey) {
    throw new Error('Pinata API credentials not configured. Set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY');
  }
  
  // Convert base64 to blob if needed
  const blob = typeof imageData === 'string' 
    ? await fetch(imageData).then(r => r.blob())
    : imageData;
  
  const formData = new FormData();
  formData.append('file', blob);
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': secretApiKey,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  const ipfsHash = result.IpfsHash;
  
  console.log('✅ Uploaded to Pinata:', ipfsHash);
  
  return {
    success: true,
    hash: ipfsHash,
    url: `${gateway}${ipfsHash}`,
  };
}

/**
 * INFURA INTEGRATION (for production)
 * Upload to Infura's IPFS service
 */
async function uploadToInfura(imageData: string | File): Promise<IPFSUploadResult> {
  const { projectId, projectSecret, gateway } = IPFS_CONFIG.infura;
  
  if (!projectId || !projectSecret) {
    throw new Error('Infura credentials not configured. Set NEXT_PUBLIC_INFURA_PROJECT_ID and NEXT_PUBLIC_INFURA_PROJECT_SECRET');
  }
  
  // Convert base64 to blob if needed
  const blob = typeof imageData === 'string' 
    ? await fetch(imageData).then(r => r.blob())
    : imageData;
  
  const formData = new FormData();
  formData.append('file', blob);
  
  const auth = Buffer.from(`${projectId}:${projectSecret}`).toString('base64');
  
  const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Infura upload failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  const ipfsHash = result.Hash;
  
  console.log('✅ Uploaded to Infura:', ipfsHash);
  
  return {
    success: true,
    hash: ipfsHash,
    url: `${gateway}${ipfsHash}`,
  };
}

/**
 * LOCAL IPFS NODE INTEGRATION (for production)
 * Upload to a local IPFS node
 */
async function uploadToLocalNode(imageData: string | File): Promise<IPFSUploadResult> {
  const { apiUrl, gateway } = IPFS_CONFIG.local;
  
  // Convert base64 to blob if needed
  const blob = typeof imageData === 'string' 
    ? await fetch(imageData).then(r => r.blob())
    : imageData;
  
  const formData = new FormData();
  formData.append('file', blob);
  
  const response = await fetch(`${apiUrl}/api/v0/add`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Local IPFS node upload failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  const ipfsHash = result.Hash;
  
  console.log('✅ Uploaded to local IPFS node:', ipfsHash);
  
  return {
    success: true,
    hash: ipfsHash,
    url: `${gateway}${ipfsHash}`,
  };
}

/**
 * Retrieve an image from IPFS
 * @param ipfsHash - The IPFS content identifier
 * @returns URL to access the image
 */
export function getIPFSUrl(ipfsHash: string): string {
  // Remove any ipfs:// protocol prefix if present
  const cleanHash = ipfsHash.replace(/^ipfs:\/\//, '');
  
  // Use public gateway for retrieval
  return `https://ipfs.io/ipfs/${cleanHash}`;
}

/**
 * Upload multiple images to IPFS
 * @param images - Array of base64 data URLs or File objects
 * @returns Promise with array of IPFS hashes
 */
export async function uploadMultipleImagesToIPFS(
  images: (string | File)[]
): Promise<IPFSUploadResult[]> {
  console.log(`📤 Uploading ${images.length} images to IPFS...`);
  
  const uploadPromises = images.map(image => uploadImageToIPFS(image));
  const results = await Promise.all(uploadPromises);
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ Successfully uploaded ${successCount}/${images.length} images`);
  
  return results;
}
