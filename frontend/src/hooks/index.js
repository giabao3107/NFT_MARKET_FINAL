// Custom hooks index - centralized exports
import { useState, useEffect } from 'react';

// Import hooks first
import useWallet from './useWallet';
import useNFTOperations from './useNFTOperations';
import useAsync from './useAsync';
import useDebounce from './useDebounce';

// Wallet and Web3 hooks
export { useWallet } from './useWallet';

// NFT operations hooks
export { useNFTOperations } from './useNFTOperations';

// TODO: Uncomment when hooks are fully implemented
// Local storage hooks
// export {
//   useLocalStorage,
//   useUserPreferences,
//   useRecentlyViewed,
//   useFavorites,
//   useSearchHistory,
//   useWalletHistory,
//   default as useLocalStorageDefault
// } from './useLocalStorage';

// Infinite scroll and pagination hooks
// export {
//   useInfiniteScroll,
//   usePaginatedData,
//   useVirtualScroll,
//   useScrollPosition,
//   default as useInfiniteScrollDefault
// } from './useInfiniteScroll';

// Debounce and throttle hooks
export {
  useDebounce
} from './useDebounce';

// Async operation hooks
export {
  useAsync
} from './useAsync';

// TODO: Uncomment when all required hooks are implemented
// Commonly used hook combinations
// export const useNFTMarketplace = () => {
//   const wallet = useWallet();
//   const nftOps = useNFTOperations();
//   const favorites = useFavorites();
//   const recentlyViewed = useRecentlyViewed();
//   
//   return {
//     ...wallet,
//     ...nftOps,
//     favorites,
//     recentlyViewed
//   };
// };

// Simple implementation of useSearchWithHistory
export const useSearchWithHistory = (searchFunction, options = {}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const debouncedQuery = useDebounce(query, options.delay || 300);
  
  useEffect(() => {
    if (debouncedQuery && searchFunction) {
      setIsLoading(true);
      searchFunction(debouncedQuery)
        .then(setResults)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [debouncedQuery, searchFunction]);
  
  const addToHistory = (searchTerm) => {
    if (searchTerm.trim() && !searchHistory.includes(searchTerm)) {
      setSearchHistory(prev => [searchTerm, ...prev.slice(0, 9)]); // Keep last 10
    }
  };
  
  const searchWithHistory = (searchTerm) => {
    setQuery(searchTerm);
    addToHistory(searchTerm);
  };
  
  return {
    query,
    setQuery,
    results,
    isLoading,
    searchHistory,
    searchWithHistory,
    addToHistory
  };
};

// export const usePaginatedNFTs = (fetchFunction, options = {}) => {
//   const paginatedData = usePaginatedData({
//     fetchFunction,
//     pageSize: 20,
//     ...options
//   });
//   
//   const favorites = useFavorites();
//   const recentlyViewed = useRecentlyViewed();
//   
//   return {
//     ...paginatedData,
//     favorites,
//     recentlyViewed
//   };
// };

// Default export object with all hooks
export default {
  // Wallet
  useWallet,
  
  // NFT Operations
  useNFTOperations,
  
  // TODO: Uncomment when hooks are implemented
  // Storage
  // useLocalStorage,
  // useUserPreferences,
  // useRecentlyViewed,
  // useFavorites,
  // useSearchHistory,
  // useWalletHistory,
  
  // Scroll & Pagination
  // useInfiniteScroll,
  // usePaginatedData,
  // useVirtualScroll,
  // useScrollPosition,
  
  // Performance
  // useDebounce,
  // useDebouncedCallback,
  // useThrottle,
  // useThrottledCallback,
  // useDebouncedSearch,
  // useDebouncedValidation,
  // useDebouncedAPI,
  
  // Async
  // useAsync,
  // useAsyncQueue,
  // useAsyncRetry,
  // useAsyncCache,
  // useAsyncParallel,
  
  // Combinations
  // useNFTMarketplace,
  // useSearchWithHistory,
  // usePaginatedNFTs
};