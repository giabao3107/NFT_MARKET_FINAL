// IPFS utility functions for uploading and retrieving NFT metadata and images

import { safeBase64Encode } from './encoding';

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY;
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY || 'https://gray-reasonable-shrew-916.mypinata.cloud/ipfs';
const FALLBACK_GATEWAY = 'https://gray-reasonable-shrew-916.mypinata.cloud/ipfs';

/**
 * Upload file to IPFS via Pinata
 * @param {File} file - The file to upload
 * @param {string} name - Optional name for the file
 * @returns {Promise<string>} - IPFS hash of the uploaded file
 */
export const uploadFileToIPFS = async (file, name = null) => {
  try {
    // Check for JWT first (preferred), then fallback to API key/secret
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      throw new Error('Pinata credentials not configured. Please set REACT_APP_PINATA_JWT or both REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY in your .env file.');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (name) {
      formData.append('pinataMetadata', JSON.stringify({ name }));
    }

    // Use JWT if available, otherwise use API key/secret
    const headers = PINATA_JWT 
      ? { 'Authorization': `Bearer ${PINATA_JWT}` }
      : {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        };

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param {Object} metadata - The metadata object to upload
 * @param {string} name - Optional name for the metadata
 * @returns {Promise<string>} - IPFS hash of the uploaded metadata
 */
export const uploadJSONToIPFS = async (metadata, name = null) => {
  try {
    // Check for JWT first (preferred), then fallback to API key/secret
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      throw new Error('Pinata credentials not configured. Please set REACT_APP_PINATA_JWT or both REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY in your .env file.');
    }

    const data = {
      pinataContent: metadata,
      pinataMetadata: {
        name: name || `NFT-Metadata-${Date.now()}`,
      },
    };

    // Use JWT if available, otherwise use API key/secret
    const headers = PINATA_JWT 
      ? {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      : {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        };

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
};

/**
 * Fetch data from IPFS
 * @param {string} hash - IPFS hash to fetch
 * @returns {Promise<any>} - The fetched data
 */
export const fetchFromIPFS = async (hash) => {
  try {
    const url = `${IPFS_GATEWAY}/${hash}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Try to parse as JSON first
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    // If not JSON, return as text
    return await response.text();
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error('Failed to fetch data from IPFS');
  }
};

/**
 * Get IPFS URL for a given hash
 * @param {string} hash - IPFS hash
 * @returns {string} - Full IPFS URL
 */
export const getIPFSUrl = (hash) => {
  if (!hash) return '';
  
  // Handle both full URLs and just hashes
  if (hash.startsWith('http')) {
    return hash;
  }
  
  // Remove ipfs:// prefix if present
  const cleanHash = hash.replace('ipfs://', '');
  
  return `${IPFS_GATEWAY}/${cleanHash}`;
};

/**
 * Convert IPFS URL to HTTP URL using Pinata gateway with fallbacks
 * @param {string} ipfsUrl - The IPFS URL to convert
 * @returns {string} - HTTP URL using Pinata gateway
 */
export const convertIpfsToHttp = (ipfsUrl) => {
  if (!ipfsUrl) return null;
  
  // Skip null or empty URLs
  if (!ipfsUrl) {
    return null;
  }
  
  // Handle IPFS protocol URLs
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '');
    return `${IPFS_GATEWAY}/${hash}`;
  }
  
  // Handle IPFS hash only
  if (ipfsUrl.match(/^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/) || ipfsUrl.match(/^baf[a-z0-9]{56,}$/)) {
    return `${IPFS_GATEWAY}/${ipfsUrl}`;
  }
  
  // Handle other relative paths that start with / (but not placeholders)
  if (ipfsUrl.startsWith('/') && !ipfsUrl.includes('placeholder')) {
    // Convert relative paths to IPFS gateway URLs
    const cleanPath = ipfsUrl.substring(1);
    return `${IPFS_GATEWAY}/${cleanPath}`;
  }
  
  // Handle relative paths
  if (ipfsUrl.startsWith('./') || ipfsUrl.startsWith('../')) {
    const cleanPath = ipfsUrl.replace(/^\.\/?\//, '');
    return `${IPFS_GATEWAY}/${cleanPath}`;
  }
  
  // If it's already an HTTP URL, return as is
  if (ipfsUrl.startsWith('http://') || ipfsUrl.startsWith('https://')) {
    return ipfsUrl;
  }
  
  // Default case - assume it's an IPFS hash
  return `${IPFS_GATEWAY}/${ipfsUrl}`;
};

/**
 * Get fallback image URLs with multiple gateway options
 * @param {string} ipfsUrl - The original IPFS URL
 * @returns {string[]} - Array of fallback URLs
 */
export const getFallbackUrls = (ipfsUrl) => {
  if (!ipfsUrl) return [];
  
  // Skip null or empty URLs
  if (!ipfsUrl) {
    return [];
  }
  
  // Handle other relative paths that start with / (but not placeholders)
  if (ipfsUrl.startsWith('/') && !ipfsUrl.includes('placeholder')) {
    // Convert relative paths to IPFS gateway URLs
    const cleanPath = ipfsUrl.substring(1);
    return [`${IPFS_GATEWAY}/${cleanPath}`];
  }
  
  // Handle IPFS URLs and hashes
  const hash = ipfsUrl.replace(/^ipfs:\/\//, '').replace(/^\.\/?\//, '');
  
  // Only create IPFS gateway URLs if we have a valid hash
  if (hash && (hash.match(/^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/) || hash.match(/^baf[a-z0-9]{56,}$/))) {
    return [
      `${IPFS_GATEWAY}/${hash}`,
      `${FALLBACK_GATEWAY}/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];
  }
  
  // For invalid or non-IPFS URLs, return empty array
  return [];
};



/**
 * Validate if a URL is a valid image URL
 * @param {string} url - URL to validate
 * @returns {Promise<boolean>} - Promise that resolves to true if valid
 */
export const validateImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 10 seconds
    setTimeout(() => resolve(false), 10000);
  });
};

/**
 * Upload complete NFT metadata (image + metadata) to IPFS
 * @param {Object} nftData - NFT data including image file and metadata
 * @returns {Promise<string>} - IPFS hash of the metadata JSON
 */
export const uploadNFTToIPFS = async (nftData) => {
  try {
    const { image, name, description, attributes, royalty, category } = nftData;
    
    // First upload the image
    const imageHash = await uploadFileToIPFS(image, `${name}-image`);
    const imageUrl = `ipfs://${imageHash}`;
    
    // Create metadata object following OpenSea standard
    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes: attributes || [],
      external_url: '', // Can be set to project website
      background_color: '', // Optional background color
      animation_url: '', // For videos/animations
      youtube_url: '', // For YouTube videos
      // Custom properties
      royalty_percentage: royalty || 0,
      category: category || 'Art',
      created_at: new Date().toISOString(),
    };
    
    // Upload metadata JSON
    const metadataHash = await uploadJSONToIPFS(metadata, `${name}-metadata`);
    
    return metadataHash;
  } catch (error) {
    console.error('Error uploading NFT to IPFS:', error);
    throw error;
  }
};



/**
 * Validate file for IPFS upload
 * @param {File} file - File to validate
 * @returns {Object} - Validation result
 */
export const validateFileForIPFS = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
  } else {
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type must be JPEG, PNG, GIF, WebP, or SVG');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Extract IPFS hash from various URL formats
 * @param {string} url - URL or hash
 * @returns {string} - Clean IPFS hash
 */
export const extractIPFSHash = (url) => {
  if (!url) return '';
  
  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }
  
  // Handle gateway URLs
  const gatewayMatch = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  if (gatewayMatch) {
    return gatewayMatch[1];
  }
  
  // Assume it's already a hash
  return url;
};

/**
 * Check if IPFS service is available
 * @returns {Promise<boolean>} - Service availability
 */
export const checkIPFSAvailability = async () => {
  try {
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      return false;
    }
    
    const headers = PINATA_JWT 
      ? { 'Authorization': `Bearer ${PINATA_JWT}` }
      : {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        };
    
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers,
    });
    
    return response.ok;
  } catch (error) {
    console.error('IPFS service check failed:', error);
    return false;
  }
};

/**
 * Get file info from IPFS
 * @param {string} hash - IPFS hash
 * @returns {Promise<Object>} - File information
 */
export const getIPFSFileInfo = async (hash) => {
  try {
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      throw new Error('Pinata credentials not available');
    }
    
    const headers = PINATA_JWT 
      ? { 'Authorization': `Bearer ${PINATA_JWT}` }
      : {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        };
    
    const response = await fetch(`https://api.pinata.cloud/data/pinList?hashContains=${hash}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting IPFS file info:', error);
    return null;
  }
};

export default {
  uploadFileToIPFS,
  uploadJSONToIPFS,
  fetchFromIPFS,
  getIPFSUrl,
  uploadNFTToIPFS,
  validateFileForIPFS,
  extractIPFSHash,
  checkIPFSAvailability,
  getIPFSFileInfo,
};