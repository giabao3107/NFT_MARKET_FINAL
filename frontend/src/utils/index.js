// Utility functions index - centralized exports

// Re-export all utility functions
export * from './constants';
export * from './helpers';
export * from './ipfs';
export * from './web3';

// Default exports
export { default as constants } from './constants';
export { default as helpers } from './helpers';
export { default as ipfs } from './ipfs';
export { default as web3 } from './web3';

// Commonly used utilities for convenience
export {
  // Constants
  NFT_CATEGORIES,
  SORT_OPTIONS,
  PRICE_RANGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  SUPPORTED_NETWORKS,
  CONTRACT_CONFIG,
  FILE_CONSTRAINTS,
} from './constants';

export {
  // Helpers
  debounce,
  throttle,
  formatDate,
  formatDateTime,
  getRelativeTime,
  copyToClipboard,
  formatFileSize,
  truncateText,
  storage,
} from './helpers';

export {
  // IPFS
  uploadFileToIPFS,
  uploadJSONToIPFS,
  uploadNFTToIPFS,
  fetchFromIPFS,
  getIPFSUrl,
  validateFileForIPFS,
} from './ipfs';

export {
  // Web3
  formatAddress,
  formatEther,
  parseEther,
  isValidAddress,
  getNetworkName,
  getBlockExplorerUrl,
  waitForTransaction,
  switchNetwork,
  isMetaMaskInstalled,
  formatTransactionError,
} from './web3';