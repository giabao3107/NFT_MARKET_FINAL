// NFT Components
export { default as NFTCard } from './NFTCard';
export { default as NFTGrid } from './NFTGrid';
export { default as NFTDetail } from './NFTDetail';
export { default as NFTUpload, NFTPreviewModal } from './NFTUpload';
export { default as NFTCollection, CollectionCard, CollectionGrid, CollectionDetail } from './NFTCollection';

// Re-export sub-components
export {
  NFTCardSkeleton,
  NFTCardCompact,
  NFTCardDetailed
} from './NFTCard';

export {
  NFTGridSkeleton,
  NFTGridEmpty
} from './NFTGrid';

export {
  NFTDetailSkeleton,
  NFTProperties,
  NFTStats,
  NFTHistory,
  NFTOffers
} from './NFTDetail';

// Constants
export const NFT_CARD_VARIANTS = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  DETAILED: 'detailed',
  GRID: 'grid'
};

export const NFT_GRID_VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

export const NFT_SORT_OPTIONS = {
  PRICE_LOW_HIGH: 'price_asc',
  PRICE_HIGH_LOW: 'price_desc',
  RECENTLY_LISTED: 'listed_desc',
  RECENTLY_CREATED: 'created_desc',
  MOST_LIKED: 'likes_desc',
  MOST_VIEWED: 'views_desc',
  ENDING_SOON: 'auction_end_asc'
};

export const NFT_FILTER_OPTIONS = {
  STATUS: {
    ALL: 'all',
    BUY_NOW: 'buy_now',
    ON_AUCTION: 'on_auction',
    NEW: 'new',
    HAS_OFFERS: 'has_offers'
  },
  PRICE_RANGE: {
    MIN: 0,
    MAX: 1000
  },
  CATEGORIES: [
    'art',
    'music',
    'photography',
    'video',
    '3d',
    'gaming',
    'sports',
    'collectibles'
  ]
};

export const COLLECTION_SORT_OPTIONS = {
  VOLUME: 'volume',
  FLOOR_PRICE: 'floor',
  ITEMS: 'items',
  CREATED: 'created',
  NAME: 'name'
};

// Default Props
export const NFT_CARD_DEFAULT_PROPS = {
  variant: NFT_CARD_VARIANTS.DEFAULT,
  showOwner: true,
  showPrice: true,
  showLikes: true,
  showCollection: true,
  interactive: true
};

export const NFT_GRID_DEFAULT_PROPS = {
  viewMode: NFT_GRID_VIEW_MODES.GRID,
  sortBy: NFT_SORT_OPTIONS.RECENTLY_LISTED,
  itemsPerPage: 20,
  showFilters: true,
  showSearch: true,
  showSort: true,
  showViewToggle: true
};

export const NFT_UPLOAD_DEFAULT_PROPS = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  acceptedFileTypes: {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    'video/*': ['.mp4', '.webm', '.ogg'],
    'audio/*': ['.mp3', '.wav', '.ogg']
  },
  defaultRoyalty: 5,
  maxRoyalty: 20
};

// Utility Functions
export const getNFTStatusColor = (status) => {
  switch (status) {
    case 'listed':
      return 'green';
    case 'auction':
      return 'blue';
    case 'sold':
      return 'gray';
    case 'minted':
      return 'purple';
    default:
      return 'gray';
  }
};

export const getNFTStatusText = (nft) => {
  if (nft.auction && nft.auction.active) {
    return 'On Auction';
  }
  if (nft.price && nft.price > 0) {
    return 'Listed for Sale';
  }
  if (nft.offers && nft.offers.length > 0) {
    return 'Has Offers';
  }
  return 'Not for Sale';
};

export const formatNFTPrice = (price, currency = 'ETH') => {
  if (!price || price === 0) return 'Not for sale';
  return `${parseFloat(price).toFixed(4)} ${currency}`;
};

export const formatNFTRarity = (rarity) => {
  if (rarity >= 90) return { text: 'Legendary', color: 'orange' };
  if (rarity >= 70) return { text: 'Epic', color: 'purple' };
  if (rarity >= 50) return { text: 'Rare', color: 'blue' };
  if (rarity >= 30) return { text: 'Uncommon', color: 'green' };
  return { text: 'Common', color: 'gray' };
};

export const calculateNFTRarity = (nft, collection) => {
  if (!nft.attributes || !collection.totalSupply) return 0;
  
  let rarityScore = 0;
  nft.attributes.forEach(attr => {
    const traitCount = collection.traits?.[attr.trait_type]?.[attr.value] || 1;
    const traitRarity = (traitCount / collection.totalSupply) * 100;
    rarityScore += (100 - traitRarity);
  });
  
  return Math.min(100, rarityScore / nft.attributes.length);
};

// Validation Functions
export const validateNFTData = (nftData) => {
  const errors = {};
  
  if (!nftData.name || nftData.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (nftData.name.length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }
  
  if (nftData.description && nftData.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }
  
  if (!nftData.image) {
    errors.image = 'Image is required';
  }
  
  if (nftData.royalty < 0 || nftData.royalty > 20) {
    errors.royalty = 'Royalty must be between 0% and 20%';
  }
  
  if (nftData.listForSale && (!nftData.price || parseFloat(nftData.price) <= 0)) {
    errors.price = 'Price must be greater than 0';
  }
  
  return errors;
};

export const validateCollectionData = (collectionData) => {
  const errors = {};
  
  if (!collectionData.name || collectionData.name.trim().length === 0) {
    errors.name = 'Collection name is required';
  }
  
  if (!collectionData.symbol || collectionData.symbol.trim().length === 0) {
    errors.symbol = 'Collection symbol is required';
  }
  
  if (collectionData.description && collectionData.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }
  
  return errors;
};

// Animation Variants
export const nftCardAnimations = {
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

export const nftGridAnimations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  }
};

// Higher-Order Components
export const withNFTLoading = (Component) => {
  return function NFTWithLoading({ loading, ...props }) {
    if (loading) {
      return <NFTCardSkeleton {...props} />;
    }
    return <Component {...props} />;
  };
};

export const withNFTError = (Component) => {
  return function NFTWithError({ error, onRetry, ...props }) {
    if (error) {
      return (
        <Card p={6} textAlign="center">
          <VStack spacing={4}>
            <Text color="red.500">Failed to load NFT</Text>
            <Text fontSize="sm" color="gray.500">{error.message}</Text>
            {onRetry && (
              <Button size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
          </VStack>
        </Card>
      );
    }
    return <Component {...props} />;
  };
};

// Custom Hooks
export const useNFTFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    status: NFT_FILTER_OPTIONS.STATUS.ALL,
    category: '',
    priceRange: [NFT_FILTER_OPTIONS.PRICE_RANGE.MIN, NFT_FILTER_OPTIONS.PRICE_RANGE.MAX],
    collection: '',
    ...initialFilters
  });
  
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const resetFilters = () => {
    setFilters({
      status: NFT_FILTER_OPTIONS.STATUS.ALL,
      category: '',
      priceRange: [NFT_FILTER_OPTIONS.PRICE_RANGE.MIN, NFT_FILTER_OPTIONS.PRICE_RANGE.MAX],
      collection: ''
    });
  };
  
  const applyFilters = (nfts) => {
    return nfts.filter(nft => {
      // Status filter
      if (filters.status !== NFT_FILTER_OPTIONS.STATUS.ALL) {
        switch (filters.status) {
          case NFT_FILTER_OPTIONS.STATUS.BUY_NOW:
            if (!nft.price || nft.price <= 0) return false;
            break;
          case NFT_FILTER_OPTIONS.STATUS.ON_AUCTION:
            if (!nft.auction || !nft.auction.active) return false;
            break;
          case NFT_FILTER_OPTIONS.STATUS.NEW:
            const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
            if (new Date(nft.createdAt).getTime() < dayAgo) return false;
            break;
          case NFT_FILTER_OPTIONS.STATUS.HAS_OFFERS:
            if (!nft.offers || nft.offers.length === 0) return false;
            break;
        }
      }
      
      // Category filter
      if (filters.category && nft.category !== filters.category) {
        return false;
      }
      
      // Price range filter
      if (nft.price) {
        const price = parseFloat(nft.price);
        if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
          return false;
        }
      }
      
      // Collection filter
      if (filters.collection && nft.collectionId !== filters.collection) {
        return false;
      }
      
      return true;
    });
  };
  
  return {
    filters,
    updateFilter,
    resetFilters,
    applyFilters
  };
};

export const useNFTSort = (initialSort = NFT_SORT_OPTIONS.RECENTLY_LISTED) => {
  const [sortBy, setSortBy] = useState(initialSort);
  
  const sortNFTs = (nfts) => {
    return [...nfts].sort((a, b) => {
      switch (sortBy) {
        case NFT_SORT_OPTIONS.PRICE_LOW_HIGH:
          return (a.price || 0) - (b.price || 0);
        case NFT_SORT_OPTIONS.PRICE_HIGH_LOW:
          return (b.price || 0) - (a.price || 0);
        case NFT_SORT_OPTIONS.RECENTLY_LISTED:
          return new Date(b.listedAt || b.createdAt) - new Date(a.listedAt || a.createdAt);
        case NFT_SORT_OPTIONS.RECENTLY_CREATED:
          return new Date(b.createdAt) - new Date(a.createdAt);
        case NFT_SORT_OPTIONS.MOST_LIKED:
          return (b.likes || 0) - (a.likes || 0);
        case NFT_SORT_OPTIONS.MOST_VIEWED:
          return (b.views || 0) - (a.views || 0);
        case NFT_SORT_OPTIONS.ENDING_SOON:
          if (!a.auction || !b.auction) return 0;
          return new Date(a.auction.endTime) - new Date(b.auction.endTime);
        default:
          return 0;
      }
    });
  };
  
  return {
    sortBy,
    setSortBy,
    sortNFTs
  };
};

// Theme Extensions
export const nftTheme = {
  colors: {
    nft: {
      primary: '#3182CE',
      secondary: '#805AD5',
      accent: '#38B2AC',
      success: '#38A169',
      warning: '#D69E2E',
      error: '#E53E3E',
      rarity: {
        common: '#718096',
        uncommon: '#38A169',
        rare: '#3182CE',
        epic: '#805AD5',
        legendary: '#DD6B20'
      }
    }
  },
  shadows: {
    nftCard: '0 4px 12px rgba(0, 0, 0, 0.1)',
    nftCardHover: '0 8px 24px rgba(0, 0, 0, 0.15)'
  }
};

// Error Messages
export const NFT_ERROR_MESSAGES = {
  LOAD_FAILED: 'Failed to load NFT',
  MINT_FAILED: 'Failed to mint NFT',
  UPLOAD_FAILED: 'Failed to upload file',
  METADATA_FAILED: 'Failed to upload metadata',
  TRANSACTION_FAILED: 'Transaction failed',
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size too large',
  NETWORK_ERROR: 'Network error occurred'
};

// Success Messages
export const NFT_SUCCESS_MESSAGES = {
  MINTED: 'NFT minted successfully!',
  LISTED: 'NFT listed for sale!',
  PURCHASED: 'NFT purchased successfully!',
  TRANSFERRED: 'NFT transferred successfully!',
  FAVORITED: 'Added to favorites!',
  UNFAVORITED: 'Removed from favorites!',
  SHARED: 'Link copied to clipboard!'
};

// Loading Messages
export const NFT_LOADING_MESSAGES = {
  MINTING: 'Minting your NFT...',
  UPLOADING: 'Uploading to IPFS...',
  PROCESSING: 'Processing transaction...',
  LOADING: 'Loading NFTs...',
  FETCHING: 'Fetching data...'
};

// PropTypes (if using prop-types)
export const NFT_PROP_TYPES = {
  nft: {
    id: 'string.isRequired',
    name: 'string.isRequired',
    description: 'string',
    image: 'string.isRequired',
    price: 'number',
    owner: 'string.isRequired',
    creator: 'string.isRequired',
    collection: 'object',
    attributes: 'array',
    likes: 'number',
    views: 'number',
    createdAt: 'string.isRequired'
  },
  collection: {
    id: 'string.isRequired',
    name: 'string.isRequired',
    description: 'string',
    image: 'string',
    bannerImage: 'string',
    owner: 'string.isRequired',
    itemCount: 'number',
    floorPrice: 'number',
    volume: 'number',
    createdAt: 'string.isRequired'
  }
};

// Export everything as default object for convenience
const NFTComponents = {
  NFTCard,
  NFTGrid,
  NFTDetail,
  NFTUpload,
  NFTCollection,
  CollectionCard,
  CollectionGrid,
  CollectionDetail,
  NFTPreviewModal,
  // Constants
  NFT_CARD_VARIANTS,
  NFT_GRID_VIEW_MODES,
  NFT_SORT_OPTIONS,
  NFT_FILTER_OPTIONS,
  COLLECTION_SORT_OPTIONS,
  // Utils
  getNFTStatusColor,
  getNFTStatusText,
  formatNFTPrice,
  formatNFTRarity,
  calculateNFTRarity,
  validateNFTData,
  validateCollectionData,
  // Hooks
  useNFTFilters,
  useNFTSort,
  // HOCs
  withNFTLoading,
  withNFTError,
  // Theme
  nftTheme,
  // Messages
  NFT_ERROR_MESSAGES,
  NFT_SUCCESS_MESSAGES,
  NFT_LOADING_MESSAGES
};

export default NFTComponents;