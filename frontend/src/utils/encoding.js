/**
 * Utility functions for handling base64 encoding/decoding with Unicode support
 */

/**
 * Encode a string to base64 with proper Unicode support
 * @param {string} str - The string to encode
 * @returns {string} - Base64 encoded string
 */
export function encodeBase64Unicode(str) {
  try {
    // Use TextEncoder to properly handle Unicode characters
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const base64String = btoa(String.fromCharCode(...data));
    return base64String;
  } catch (error) {
    console.error('Error encoding to base64:', error);
    throw new Error('Failed to encode string to base64');
  }
}

/**
 * Decode a base64 string with proper Unicode support
 * @param {string} base64Str - The base64 string to decode
 * @returns {string} - Decoded string
 */
export function decodeBase64Unicode(base64Str) {
  try {
    // Properly decode base64 with Unicode support
    const binaryString = atob(base64Str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } catch (error) {
    console.error('Error decoding from base64:', error);
    throw new Error('Failed to decode base64 string');
  }
}

/**
 * Create a data URI with base64 encoded JSON metadata
 * @param {object} metadata - The metadata object to encode
 * @returns {string} - Data URI string
 */
export function createMetadataDataURI(metadata) {
  try {
    const metadataJSON = JSON.stringify(metadata);
    const base64String = encodeBase64Unicode(metadataJSON);
    return `data:application/json;base64,${base64String}`;
  } catch (error) {
    console.error('Error creating metadata data URI:', error);
    throw new Error('Failed to create metadata data URI');
  }
}

/**
 * Parse metadata from a data URI
 * @param {string} dataURI - The data URI to parse
 * @returns {object} - Parsed metadata object
 */
export function parseMetadataDataURI(dataURI) {
  try {
    if (!dataURI.startsWith('data:application/json;base64,')) {
      throw new Error('Invalid data URI format');
    }
    
    const base64Data = dataURI.split(',')[1];
    const jsonString = decodeBase64Unicode(base64Data);
    const metadata = JSON.parse(jsonString);
    
    return {
      ...metadata,
      image: metadata.image || '/placeholder-nft.svg',
    };
  } catch (error) {
    console.error('Error parsing metadata data URI:', error);
    throw new Error('Failed to parse metadata data URI');
  }
}

/**
 * Validate if a string contains only Latin1 characters (safe for btoa)
 * @param {string} str - The string to validate
 * @returns {boolean} - True if string is Latin1 safe
 */
export function isLatin1Safe(str) {
  // Check if all characters are within Latin1 range (0-255)
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      return false;
    }
  }
  return true;
}

/**
 * Safe base64 encoding that automatically chooses the right method
 * @param {string} str - The string to encode
 * @returns {string} - Base64 encoded string
 */
export function safeBase64Encode(str) {
  if (isLatin1Safe(str)) {
    // Use native btoa for Latin1 strings (faster)
    return btoa(str);
  } else {
    // Use Unicode-safe encoding for non-Latin1 strings
    return encodeBase64Unicode(str);
  }
}