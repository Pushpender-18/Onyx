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
  // Check if Pinata credentials are available, otherwise use placeholder
  provider: (process.env.NEXT_PUBLIC_PINATA_API_KEY && process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY) 
    ? 'pinata' 
    : 'placeholder' as 'placeholder' | 'pinata' | 'infura' | 'local',
  
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
    console.log('🔧 Using provider:', IPFS_CONFIG.provider);
    console.log(' Config details:', {
      provider: IPFS_CONFIG.provider,
      hasPinataKey: !!IPFS_CONFIG.pinata.apiKey,
      hasInfuraId: !!IPFS_CONFIG.infura.projectId,
    });
    
    switch (IPFS_CONFIG.provider) {
      case 'placeholder':
        console.log(' Using placeholder mode (no real IPFS upload)');
        return uploadToPlaceholder(imageData);
      
      case 'pinata':
        console.log('🎯 Using Pinata provider');
        return uploadToPinata(imageData);
      
      case 'infura':
        console.log('🎯 Using Infura provider');
        return uploadToInfura(imageData);
      
      case 'local':
        console.log('🎯 Using local IPFS node');
        return uploadToLocalNode(imageData);
      
      default:
        console.log(' Unknown provider, falling back to placeholder');
        return uploadToPlaceholder(imageData);
    }
  } catch (error: any) {
    console.error(' Error uploading to IPFS:', error);
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
  
  console.log(' Generated placeholder IPFS hash:', placeholderHash);
  
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
  
  console.log('🔑 Pinata credentials check:', {
    hasApiKey: !!apiKey,
    hasSecretKey: !!secretApiKey,
    apiKeyLength: apiKey?.length || 0,
    secretKeyLength: secretApiKey?.length || 0,
  });
  
  if (!apiKey || !secretApiKey) {
    throw new Error('Pinata API credentials not configured. Set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY');
  }
  
  try {
    // Convert base64 to blob if needed
    console.log(' Converting image data to blob...');
    const blob = typeof imageData === 'string' 
      ? await fetch(imageData).then(r => r.blob())
      : imageData;
    
    console.log('📤 Blob created, size:', blob.size, 'bytes');
    
    const formData = new FormData();
    formData.append('file', blob);
    
    console.log('📨 Sending request to Pinata API...');
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretApiKey,
      },
      body: formData,
    });
    
    console.log('📬 Pinata response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Pinata error response:', errorText);
      throw new Error(`Pinata upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(' Pinata response:', result);
    
    const ipfsHash = result.IpfsHash;
    if (!ipfsHash) {
      throw new Error('No IpfsHash in Pinata response');
    }
    
    console.log(' Uploaded to Pinata:', ipfsHash);
    
    return {
      success: true,
      hash: ipfsHash,
      url: `${gateway}${ipfsHash}`,
    };
  } catch (error: any) {
    console.error(' Error in Pinata upload:', error.message);
    throw error;
  }
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
  
  console.log(' Uploaded to Infura:', ipfsHash);
  
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
  
  console.log(' Uploaded to local IPFS node:', ipfsHash);
  
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
  // Handle empty or invalid hash
  // if (!ipfsHash || typeof ipfsHash !== 'string') {
  //   console.warn(' Invalid IPFS hash provided:', ipfsHash);
  //   return 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop';
  // }

  // // Remove any ipfs:// protocol prefix if present
  // const cleanHash = ipfsHash.trim().replace(/^ipfs:\/\//, '');
  
  // console.log(' Processing IPFS hash:', { original: ipfsHash, cleaned: cleanHash });

  // // Validate that it looks like a valid hash
  // // Accepts: CIDv0 (Qm followed by chars) or CIDv1 (bafy or z prefix) or any alphanumeric that looks like a hash
  // const isValidHash = cleanHash.match(/^(Qm[a-zA-Z0-9]+|bafy[a-zA-Z0-9]+|z[a-zA-Z0-9]+|[a-zA-Z0-9]{46,})$/);
  
  // if (!isValidHash) {
  //   console.warn(' Invalid IPFS hash format:', cleanHash, 'length:', cleanHash.length);
  //   return 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop';
  // }

  // console.log(' Valid IPFS hash detected:', cleanHash);

  // // Use Pinata gateway as primary (since we upload via Pinata)
  // // Fallback to ipfs.io if Pinata has issues
  // const gateways = [
  //   `https://gateway.pinata.cloud/ipfs/${cleanHash}`,  // Primary - Pinata
  //   `https://ipfs.io/ipfs/${cleanHash}`,                 // Fallback - Public gateway
  //   `https://cloudflare-ipfs.com/ipfs/${cleanHash}`,    // Fallback - Cloudflare
  // ];
  
  // // Return primary gateway
  // console.log('📍 IPFS URL:', gateways[0]);
  
  // return gateways[0];
  return "";
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
  console.log(` Successfully uploaded ${successCount}/${images.length} images`);
  
  return results;
}

/**
 * Get alternative IPFS gateway URLs for the same hash
 * Useful for fallback when primary gateway fails
 * @param ipfsHash - The IPFS content identifier
 * @returns Array of gateway URLs
 */
export function getIPFSGatewayUrls(ipfsHash: string): string[] {
  // Handle empty or invalid hash
  if (!ipfsHash || typeof ipfsHash !== 'string') {
    return ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&h=500&fit=crop'];
  }

  // Remove any ipfs:// protocol prefix if present
  const cleanHash = ipfsHash.trim().replace(/^ipfs:\/\//, '');
  
  // Return multiple gateway options
  return [
    `https://gateway.pinata.cloud/ipfs/${cleanHash}`,  // Primary - Pinata
    `https://ipfs.io/ipfs/${cleanHash}`,                 // Fallback - Public gateway
    `https://cloudflare-ipfs.com/ipfs/${cleanHash}`,    // Fallback - Cloudflare
    `https://dweb.link/ipfs/${cleanHash}`,               // Fallback - IPFS DNSLink gateway
  ];
}
