// Application constants and configuration

// IPFS Configuration
export const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY || 'https://gray-reasonable-shrew-916.mypinata.cloud/ipfs/';

// Blockchain Explorer URLs
export const ETHERSCAN_URL = {
  1: 'https://etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
  31337: null, // Localhost
};

// NFT Categories
export const NFT_CATEGORIES = [
  { value: 'art', label: 'Art', icon: '🎨' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'collectibles', label: 'Collectibles', icon: '🏆' },
  { value: 'utility', label: 'Utility', icon: '🔧' },
  { value: 'virtual-worlds', label: 'Virtual Worlds', icon: '🌐' },
  { value: 'domain-names', label: 'Domain Names', icon: '🌍' },
  { value: 'memes', label: 'Memes', icon: '😂' },
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

// Price Ranges for Filtering
export const PRICE_RANGES = [
  { value: 'all', label: 'All Prices', min: 0, max: Infinity },
  { value: '0-0.1', label: '0 - 0.1 ETH', min: 0, max: 0.1 },
  { value: '0.1-1', label: '0.1 - 1 ETH', min: 0.1, max: 1 },
  { value: '1-5', label: '1 - 5 ETH', min: 1, max: 5 },
  { value: '5-10', label: '5 - 10 ETH', min: 5, max: 10 },
  { value: '10+', label: '10+ ETH', min: 10, max: Infinity },
];

// Network Configuration
export const SUPPORTED_NETWORKS = [
  {
    chainId: 31337,
    name: 'Localhost',
    currency: 'ETH',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: null,
  },
  {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    currency: 'ETH',
    rpcUrl: `https://sepolia.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
    blockExplorer: 'https://etherscan.io',
  },
];

// Default Network
export const DEFAULT_NETWORK = SUPPORTED_NETWORKS[0];

// Contract Configuration
export const CONTRACT_CONFIG = {
  MARKETPLACE_FEE: 250, // 2.5% in basis points
  MAX_ROYALTY: 1000, // 10% maximum royalty
  MIN_PRICE: '0.001', // Minimum NFT price in ETH
  MAX_PRICE: '1000', // Maximum NFT price in ETH
};

// File Upload Constraints
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
  MAX_PAGE_SIZE: 100,
};

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
};

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: 5000,
  POSITION: 'top-right',
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 7000,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  WALLET_CONNECTED: 'wallet_connected',
  THEME_MODE: 'theme_mode',
  USER_PREFERENCES: 'user_preferences',
  RECENT_SEARCHES: 'recent_searches',
  FAVORITE_NFTS: 'favorite_nfts',
  VIEWED_NFTS: 'viewed_nfts',
};

// API Endpoints
export const API_ENDPOINTS = {
  METADATA: '/api/metadata',
  UPLOAD: '/api/upload',
  ANALYTICS: '/api/analytics',
};

// Social Media Links
export const SOCIAL_LINKS = {
  TWITTER: process.env.REACT_APP_TWITTER_URL || 'https://twitter.com',
  DISCORD: process.env.REACT_APP_DISCORD_URL || 'https://discord.com',
  GITHUB: process.env.REACT_APP_GITHUB_URL || 'https://github.com',
  TELEGRAM: process.env.REACT_APP_TELEGRAM_URL || 'https://telegram.org',
  MEDIUM: process.env.REACT_APP_MEDIUM_URL || 'https://medium.com',
};

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  NETWORK_NOT_SUPPORTED: 'Please switch to a supported network',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  TRANSACTION_REJECTED: 'Transaction was rejected by user',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a supported image format.',
  METADATA_UPLOAD_FAILED: 'Failed to upload metadata to IPFS',
  CONTRACT_INTERACTION_FAILED: 'Failed to interact with smart contract',
  PRICE_TOO_LOW: 'Price must be at least 0.001 ETH',
  PRICE_TOO_HIGH: 'Price cannot exceed 1000 ETH',
  INVALID_ROYALTY: 'Royalty percentage must be between 0% and 10%',
  NFT_NOT_FOUND: 'NFT not found',
  NOT_NFT_OWNER: 'You are not the owner of this NFT',
  NFT_NOT_FOR_SALE: 'This NFT is not currently for sale',
  ALREADY_LISTED: 'This NFT is already listed for sale',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  WALLET_DISCONNECTED: 'Wallet disconnected',
  NFT_MINTED: 'NFT minted successfully!',
  NFT_LISTED: 'NFT listed for sale successfully!',
  NFT_PURCHASED: 'NFT purchased successfully!',
  NFT_DELISTED: 'NFT removed from marketplace',
  PRICE_UPDATED: 'Listing price updated successfully',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard',
  METADATA_UPLOADED: 'Metadata uploaded to IPFS',
};

// Loading Messages
export const LOADING_MESSAGES = {
  CONNECTING_WALLET: 'Connecting wallet...',
  LOADING_NFTS: 'Loading NFTs...',
  MINTING_NFT: 'Minting NFT...',
  UPLOADING_TO_IPFS: 'Uploading to IPFS...',
  LISTING_NFT: 'Listing NFT for sale...',
  PURCHASING_NFT: 'Purchasing NFT...',
  UPDATING_PRICE: 'Updating price...',
  DELISTING_NFT: 'Removing from marketplace...',
  PROCESSING_TRANSACTION: 'Processing transaction...',
};

// NFT Status
export const NFT_STATUS = {
  NOT_LISTED: 'not_listed',
  LISTED: 'listed',
  SOLD: 'sold',
  TRANSFERRED: 'transferred',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  MINT: 'mint',
  LIST: 'list',
  PURCHASE: 'purchase',
  DELIST: 'delist',
  TRANSFER: 'transfer',
  PRICE_UPDATE: 'price_update',
};

// View Modes
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
};

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#6366f1',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
};

// Breakpoints (matching Chakra UI)
export const BREAKPOINTS = {
  SM: '30em', // 480px
  MD: '48em', // 768px
  LG: '62em', // 992px
  XL: '80em', // 1280px
  '2XL': '96em', // 1536px
};

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
};

// Feature Flags
export const FEATURES = {
  ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
  DARK_MODE: process.env.REACT_APP_ENABLE_DARK_MODE === 'true',
  LAZY_LOADING: true,
  INFINITE_SCROLL: true,
  SEARCH_SUGGESTIONS: true,
  PRICE_ALERTS: false, // Future feature
  BULK_OPERATIONS: false, // Future feature
};

// Regular Expressions
export const REGEX = {
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  IPFS_HASH: /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Default Values
export const DEFAULTS = {
  NFT_NAME: '',
  NFT_DESCRIPTION: '',
  NFT_CATEGORY: 'art',
  NFT_ROYALTY: 5, // 5%
  SEARCH_QUERY: '',
  SORT_BY: 'newest',
  PRICE_RANGE: 'all',
  PAGE_SIZE: PAGINATION.DEFAULT_PAGE_SIZE,
  VIEW_MODE: VIEW_MODES.GRID,
};

// Validation Rules
export const VALIDATION = {
  NFT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  NFT_DESCRIPTION: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 1000,
  },
  NFT_PRICE: {
    MIN: 0.001,
    MAX: 1000,
  },
  NFT_ROYALTY: {
    MIN: 0,
    MAX: 10,
  },
  SEARCH_QUERY: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
};

// Time Constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
};

// Cache Configuration
export const CACHE = {
  NFT_METADATA: 5 * TIME.MINUTE,
  USER_BALANCE: 30 * TIME.SECOND,
  MARKETPLACE_LISTINGS: 1 * TIME.MINUTE,
  GAS_PRICE: 30 * TIME.SECOND,
};

export default {
  NFT_CATEGORIES,
  SORT_OPTIONS,
  PRICE_RANGES,
  SUPPORTED_NETWORKS,
  DEFAULT_NETWORK,
  CONTRACT_CONFIG,
  FILE_CONSTRAINTS,
  PAGINATION,
  ANIMATION_DURATION,
  TOAST_CONFIG,
  STORAGE_KEYS,
  API_ENDPOINTS,
  SOCIAL_LINKS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  NFT_STATUS,
  TRANSACTION_TYPES,
  VIEW_MODES,
  THEME_COLORS,
  BREAKPOINTS,
  Z_INDEX,
  FEATURES,
  REGEX,
  DEFAULTS,
  VALIDATION,
  TIME,
  CACHE,
};