import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage management
 * Provides type-safe localStorage operations with React state synchronization
 */
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Set value in localStorage and state
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for managing user preferences in localStorage
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences, removePreferences] = useLocalStorage('userPreferences', {
    theme: 'dark',
    currency: 'ETH',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      marketplace: true,
      price: true
    },
    display: {
      gridSize: 'medium',
      showPrices: true,
      showOwners: true,
      autoPlay: false
    }
  });

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setPreferences]);

  const updateNestedPreference = useCallback((category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    removePreferences();
  }, [removePreferences]);

  return {
    preferences,
    updatePreference,
    updateNestedPreference,
    resetPreferences
  };
};

/**
 * Hook for managing recently viewed NFTs
 */
export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage('recentlyViewedNFTs', []);

  const addToRecentlyViewed = useCallback((nft) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => 
        !(item.contractAddress === nft.contractAddress && item.tokenId === nft.tokenId)
      );
      
      // Add to beginning and limit to 20 items
      return [nft, ...filtered].slice(0, 20);
    });
  }, [setRecentlyViewed]);

  const removeFromRecentlyViewed = useCallback((contractAddress, tokenId) => {
    setRecentlyViewed(prev => 
      prev.filter(item => 
        !(item.contractAddress === contractAddress && item.tokenId === tokenId)
      )
    );
  }, [setRecentlyViewed]);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
  }, [setRecentlyViewed]);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed
  };
};

/**
 * Hook for managing favorite NFTs
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage('favoriteNFTs', []);

  const addToFavorites = useCallback((nft) => {
    setFavorites(prev => {
      const exists = prev.some(item => 
        item.contractAddress === nft.contractAddress && item.tokenId === nft.tokenId
      );
      
      if (exists) return prev;
      
      return [...prev, {
        ...nft,
        addedAt: new Date().toISOString()
      }];
    });
  }, [setFavorites]);

  const removeFromFavorites = useCallback((contractAddress, tokenId) => {
    setFavorites(prev => 
      prev.filter(item => 
        !(item.contractAddress === contractAddress && item.tokenId === tokenId)
      )
    );
  }, [setFavorites]);

  const isFavorite = useCallback((contractAddress, tokenId) => {
    return favorites.some(item => 
      item.contractAddress === contractAddress && item.tokenId === tokenId
    );
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, [setFavorites]);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites
  };
};

/**
 * Hook for managing search history
 */
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useLocalStorage('searchHistory', []);

  const addToSearchHistory = useCallback((query) => {
    if (!query || query.trim().length < 2) return;
    
    const trimmedQuery = query.trim().toLowerCase();
    
    setSearchHistory(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item !== trimmedQuery);
      
      // Add to beginning and limit to 10 items
      return [trimmedQuery, ...filtered].slice(0, 10);
    });
  }, [setSearchHistory]);

  const removeFromSearchHistory = useCallback((query) => {
    setSearchHistory(prev => prev.filter(item => item !== query));
  }, [setSearchHistory]);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, [setSearchHistory]);

  return {
    searchHistory,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory
  };
};

/**
 * Hook for managing wallet connection history
 */
export const useWalletHistory = () => {
  const [walletHistory, setWalletHistory] = useLocalStorage('walletHistory', []);

  const addWalletToHistory = useCallback((walletInfo) => {
    setWalletHistory(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.address !== walletInfo.address);
      
      // Add to beginning and limit to 5 wallets
      return [{
        ...walletInfo,
        lastConnected: new Date().toISOString()
      }, ...filtered].slice(0, 5);
    });
  }, [setWalletHistory]);

  const removeWalletFromHistory = useCallback((address) => {
    setWalletHistory(prev => prev.filter(item => item.address !== address));
  }, [setWalletHistory]);

  const clearWalletHistory = useCallback(() => {
    setWalletHistory([]);
  }, [setWalletHistory]);

  return {
    walletHistory,
    addWalletToHistory,
    removeWalletFromHistory,
    clearWalletHistory
  };
};

export default useLocalStorage;