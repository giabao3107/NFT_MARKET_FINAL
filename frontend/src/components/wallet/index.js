// Import components first
import WalletConnect from './WalletConnect';
import WalletInfo from './WalletInfo';
import TransactionHistory from './TransactionHistory';
import NetworkSwitcher from './NetworkSwitcher';

// Wallet Components Export
export { default as WalletConnect } from './WalletConnect';
export { default as WalletInfo } from './WalletInfo';
export { default as TransactionHistory } from './TransactionHistory';
export { default as NetworkSwitcher } from './NetworkSwitcher';

// Re-export sub-components for convenience
// TODO: Uncomment when sub-components are implemented
// export {
//   ConnectedWalletDisplay,
//   WalletModal,
//   WalletSelection
// } from './WalletConnect';

// export {
//   WalletHeader,
//   WalletOverview,
//   WalletNFTs,
//   WalletAnalytics
// } from './WalletInfo';

// export {
//   NetworkStatus,
//   NetworkHealth,
//   NetworkModal
// } from './NetworkSwitcher';

// Wallet-related utilities and constants
export const WALLET_TYPES = {
  METAMASK: 'metamask',
  WALLET_CONNECT: 'walletconnect',
  COINBASE: 'coinbase'
};

export const TRANSACTION_TYPES = {
  MINT: 'mint',
  BUY: 'buy',
  SELL: 'sell',
  TRANSFER: 'transfer',
  LIST: 'list',
  DELIST: 'delist',
  APPROVE: 'approve'
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Wallet component configurations
export const WALLET_CONNECT_CONFIG = {
  showBalance: true,
  showNetwork: true,
  autoConnect: true,
  persistConnection: true
};

export const WALLET_INFO_CONFIG = {
  showTransactions: true,
  showAnalytics: true,
  showNFTs: true,
  refreshInterval: 30000 // 30 seconds
};

export const TRANSACTION_HISTORY_CONFIG = {
  itemsPerPage: 10,
  maxHeight: '600px',
  showFilters: true,
  showPagination: true,
  autoRefresh: true,
  refreshInterval: 60000 // 1 minute
};

export const NETWORK_SWITCHER_CONFIG = {
  variant: 'button', // 'button', 'badge', 'minimal'
  showNetworkName: true,
  showChainId: false,
  size: 'md'
};

// Wallet component themes
export const WALLET_THEMES = {
  default: {
    colorScheme: 'blue',
    variant: 'solid',
    size: 'md'
  },
  minimal: {
    colorScheme: 'gray',
    variant: 'ghost',
    size: 'sm'
  },
  accent: {
    colorScheme: 'purple',
    variant: 'outline',
    size: 'lg'
  }
};

// Wallet error messages
export const WALLET_ERRORS = {
  NOT_INSTALLED: 'Wallet not installed. Please install MetaMask or another Web3 wallet.',
  CONNECTION_REJECTED: 'Connection rejected by user.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction.',
  TRANSACTION_REJECTED: 'Transaction rejected by user.',
  INVALID_ADDRESS: 'Invalid wallet address.',
  UNSUPPORTED_NETWORK: 'Unsupported network. Please switch to a supported network.',
  WALLET_LOCKED: 'Wallet is locked. Please unlock your wallet.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
};

// Wallet success messages
export const WALLET_SUCCESS = {
  CONNECTED: 'Wallet connected successfully!',
  DISCONNECTED: 'Wallet disconnected.',
  NETWORK_SWITCHED: 'Network switched successfully!',
  TRANSACTION_SENT: 'Transaction sent successfully!',
  TRANSACTION_CONFIRMED: 'Transaction confirmed!',
  ADDRESS_COPIED: 'Address copied to clipboard!'
};

// Wallet component props validation
export const WALLET_PROP_TYPES = {
  // WalletConnect props
  walletConnect: {
    showBalance: 'boolean',
    showNetwork: 'boolean',
    size: ['sm', 'md', 'lg'],
    variant: ['solid', 'outline', 'ghost']
  },
  
  // WalletInfo props
  walletInfo: {
    showTransactions: 'boolean',
    showAnalytics: 'boolean',
    showNFTs: 'boolean'
  },
  
  // TransactionHistory props
  transactionHistory: {
    showFilters: 'boolean',
    showPagination: 'boolean',
    itemsPerPage: 'number',
    maxHeight: 'string'
  },
  
  // NetworkSwitcher props
  networkSwitcher: {
    variant: ['button', 'badge', 'minimal'],
    showNetworkName: 'boolean',
    showChainId: 'boolean',
    size: ['sm', 'md', 'lg']
  }
};

// Wallet component default props
export const WALLET_DEFAULT_PROPS = {
  walletConnect: {
    showBalance: true,
    showNetwork: true,
    size: 'md',
    variant: 'solid'
  },
  
  walletInfo: {
    showTransactions: true,
    showAnalytics: true,
    showNFTs: true
  },
  
  transactionHistory: {
    showFilters: true,
    showPagination: true,
    itemsPerPage: 10,
    maxHeight: '600px'
  },
  
  networkSwitcher: {
    variant: 'button',
    showNetworkName: true,
    showChainId: false,
    size: 'md'
  }
};

// Wallet utility functions
export const walletUtils = {
  /**
   * Format wallet address for display
   */
  formatAddress: (address, length = 4) => {
    if (!address) return '';
    return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
  },
  
  /**
   * Validate wallet address
   */
  isValidAddress: (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },
  
  /**
   * Get wallet type from provider
   */
  getWalletType: (provider) => {
    if (provider?.isMetaMask) return WALLET_TYPES.METAMASK;
    if (provider?.isCoinbaseWallet) return WALLET_TYPES.COINBASE;
    return WALLET_TYPES.WALLET_CONNECT;
  },
  
  /**
   * Get transaction status color
   */
  getTransactionStatusColor: (status) => {
    const colors = {
      [TRANSACTION_STATUS.PENDING]: 'yellow',
      [TRANSACTION_STATUS.COMPLETED]: 'green',
      [TRANSACTION_STATUS.FAILED]: 'red',
      [TRANSACTION_STATUS.CANCELLED]: 'gray'
    };
    return colors[status] || 'gray';
  },
  
  /**
   * Get transaction type icon
   */
  getTransactionTypeIcon: (type) => {
    // This would return appropriate icons for each transaction type
    // Implementation depends on your icon library
    return null;
  },
  
  /**
   * Format transaction value
   */
  formatTransactionValue: (value, decimals = 4) => {
    if (!value) return '0';
    return parseFloat(value).toFixed(decimals);
  },
  
  /**
   * Get network color
   */
  getNetworkColor: (chainId) => {
    const colors = {
      1: '#627EEA', // Ethereum Mainnet
      5: '#627EEA', // Goerli
      11155111: '#627EEA', // Sepolia
      137: '#8247E5', // Polygon
      80001: '#8247E5', // Mumbai
      56: '#F3BA2F', // BSC
      97: '#F3BA2F' // BSC Testnet
    };
    return colors[chainId] || '#627EEA';
  }
};

// Wallet component hooks
export const useWalletComponents = () => {
  return {
    WALLET_TYPES,
    TRANSACTION_TYPES,
    TRANSACTION_STATUS,
    WALLET_ERRORS,
    WALLET_SUCCESS,
    walletUtils
  };
};
  
// Export everything as default for convenience
export default {
  WalletConnect,
  WalletInfo,
  TransactionHistory,
  NetworkSwitcher,
  // TODO: Uncomment when sub-components are implemented
  // ConnectedWalletDisplay,
  // WalletModal,
  // WalletSelection,
  // WalletHeader,
  // WalletOverview,
  // WalletNFTs,
  // WalletAnalytics,
  // NetworkStatus,
  // NetworkHealth,
  // NetworkModal,
  WALLET_TYPES,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  WALLET_CONNECT_CONFIG,
  WALLET_INFO_CONFIG,
  TRANSACTION_HISTORY_CONFIG,
  NETWORK_SWITCHER_CONFIG,
  WALLET_THEMES,
  WALLET_ERRORS,
  WALLET_SUCCESS,
  WALLET_PROP_TYPES,
  WALLET_DEFAULT_PROPS,
  walletUtils,
  useWalletComponents
};