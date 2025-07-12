import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Spacer,
  Badge,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Spinner,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Checkbox,
  CheckboxGroup,
  Stack,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  Divider,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiDollarSign,
  FiHeart,
  FiStar
} from 'react-icons/fi';
import NFTCard, { NFTCardSkeleton } from './NFTCard';
import { Pagination } from '../common';
import { useInfiniteScroll, useDebounce, usePaginatedData } from '../../hooks';
import { formatEther } from '../../utils/web3';
import { formatDateTime } from '../../utils/helpers';

/**
 * NFT Grid Component with advanced filtering and sorting
 */
const NFTGrid = ({
  nfts = [],
  loading = false,
  error = null,
  onRefresh,
  onLoadMore,
  hasMore = false,
  variant = 'grid', // 'grid', 'list', 'compact'
  showFilters = true,
  showSearch = true,
  showSort = true,
  showViewToggle = true,
  itemsPerPage = 12,
  enableInfiniteScroll = false,
  onNFTSelect,
  selectedNFTs = [],
  selectionMode = false,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState(variant);
  const [filters, setFilters] = useState({
    status: [],
    priceRange: [0, 1000],
    categories: [],
    collections: [],
    attributes: {}
  });
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4, xl: 5 });
  
  // Filter and sort NFTs
  const filteredAndSortedNFTs = useMemo(() => {
    let filtered = [...nfts];
    
    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(nft => 
        nft.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        nft.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        nft.collection?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    // Apply status filters
    if (filters.status.length > 0) {
      filtered = filtered.filter(nft => {
        if (filters.status.includes('listed') && nft.isListed) return true;
        if (filters.status.includes('auction') && nft.isAuction) return true;
        if (filters.status.includes('sold') && nft.isSold) return true;
        if (filters.status.includes('not-listed') && !nft.isListed) return true;
        return false;
      });
    }
    
    // Apply price range filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      filtered = filtered.filter(nft => {
        if (!nft.price) return filters.priceRange[0] === 0;
        const priceInEth = parseFloat(formatEther(nft.price));
        return priceInEth >= filters.priceRange[0] && priceInEth <= filters.priceRange[1];
      });
    }
    
    // Apply category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(nft => 
        filters.categories.includes(nft.category)
      );
    }
    
    // Apply collection filters
    if (filters.collections.length > 0) {
      filtered = filtered.filter(nft => 
        filters.collections.includes(nft.collection?.address)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'price-high':
          return (parseFloat(formatEther(b.price || 0))) - (parseFloat(formatEther(a.price || 0)));
        case 'price-low':
          return (parseFloat(formatEther(a.price || 0))) - (parseFloat(formatEther(b.price || 0)));
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'popularity':
          return (b.views || 0) - (a.views || 0);
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [nfts, debouncedSearchTerm, filters, sortBy]);
  
  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData: displayedNFTs,
    goToPage,
    nextPage,
    prevPage
  } = usePaginatedData(filteredAndSortedNFTs, itemsPerPage);
  
  // Infinite scroll
  const { isLoading: infiniteLoading } = useInfiniteScroll({
    hasMore,
    onLoadMore,
    enabled: enableInfiniteScroll
  });
  
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);
  
  const handleClearFilters = useCallback(() => {
    setFilters({
      status: [],
      priceRange: [0, 1000],
      categories: [],
      collections: [],
      attributes: {}
    });
    setSearchTerm('');
  }, []);
  
  const getGridTemplateColumns = () => {
    switch (viewMode) {
      case 'list':
        return '1fr';
      case 'compact':
        return `repeat(${Math.min(gridColumns * 2, 6)}, 1fr)`;
      default:
        return `repeat(${gridColumns}, 1fr)`;
    }
  };
  
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Error loading NFTs!</AlertTitle>
          <AlertDescription>{error.message || 'Something went wrong'}</AlertDescription>
        </Box>
        {onRefresh && (
          <Button ml={4} size="sm" onClick={onRefresh}>
            Try Again
          </Button>
        )}
      </Alert>
    );
  }
  
  return (
    <Box {...props}>
      {/* Header Controls */}
      <VStack spacing={4} mb={6}>
        {/* Search and View Controls */}
        <Flex w="full" gap={4} align="center" wrap="wrap">
          {/* Search */}
          {showSearch && (
            <InputGroup maxW="300px">
              <InputLeftElement>
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={bgColor}
                border="1px"
                borderColor={borderColor}
              />
            </InputGroup>
          )}
          
          <Spacer />
          
          {/* View Toggle */}
          {showViewToggle && (
            <HStack spacing={1}>
              <Tooltip label="Grid View">
                <IconButton
                  size="sm"
                  variant={viewMode === 'grid' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  icon={<FiGrid />}
                  onClick={() => setViewMode('grid')}
                />
              </Tooltip>
              <Tooltip label="List View">
                <IconButton
                  size="sm"
                  variant={viewMode === 'list' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  icon={<FiList />}
                  onClick={() => setViewMode('list')}
                />
              </Tooltip>
            </HStack>
          )}
          
          {/* Sort */}
          {showSort && (
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              maxW="200px"
              bg={bgColor}
              border="1px"
              borderColor={borderColor}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="name">Name A-Z</option>
              <option value="popularity">Most Popular</option>
              <option value="likes">Most Liked</option>
            </Select>
          )}
          
          {/* Refresh */}
          {onRefresh && (
            <Tooltip label="Refresh">
              <IconButton
                size="sm"
                variant="outline"
                icon={<FiRefreshCw />}
                onClick={onRefresh}
                isLoading={loading}
              />
            </Tooltip>
          )}
        </Flex>
        
        {/* Filters */}
        {showFilters && (
          <NFTGridFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            nfts={nfts}
          />
        )}
        
        {/* Results Info */}
        <Flex w="full" align="center" fontSize="sm" color="gray.600">
          <Text>
            Showing {displayedNFTs.length} of {filteredAndSortedNFTs.length} NFTs
            {filteredAndSortedNFTs.length !== nfts.length && (
              <Text as="span" color="blue.500" ml={1}>
                (filtered from {nfts.length})
              </Text>
            )}
          </Text>
          
          <Spacer />
          
          {selectionMode && (
            <Text>
              {selectedNFTs.length} selected
            </Text>
          )}
        </Flex>
      </VStack>
      
      {/* Loading State */}
      {loading && displayedNFTs.length === 0 && (
        <SimpleGrid columns={gridColumns} spacing={6}>
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <NFTCardSkeleton key={index} variant={viewMode} />
          ))}
        </SimpleGrid>
      )}
      
      {/* Empty State */}
      {!loading && displayedNFTs.length === 0 && (
        <Center py={20}>
          <VStack spacing={4}>
            <Box fontSize="6xl" color="gray.300">
              🎨
            </Box>
            <VStack spacing={2}>
              <Text fontSize="xl" fontWeight="bold" color="gray.500">
                {filteredAndSortedNFTs.length === 0 && nfts.length > 0
                  ? 'No NFTs match your filters'
                  : 'No NFTs found'
                }
              </Text>
              <Text color="gray.400" textAlign="center">
                {filteredAndSortedNFTs.length === 0 && nfts.length > 0
                  ? 'Try adjusting your search or filter criteria'
                  : 'Be the first to mint an NFT in this collection'
                }
              </Text>
            </VStack>
            {filteredAndSortedNFTs.length === 0 && nfts.length > 0 && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </VStack>
        </Center>
      )}
      
      {/* NFT Grid */}
      {displayedNFTs.length > 0 && (
        <SimpleGrid
          columns={gridColumns}
          spacing={viewMode === 'list' ? 4 : 6}
          templateColumns={getGridTemplateColumns()}
        >
          {displayedNFTs.map((nft) => (
            <NFTCard
              key={`${nft.contractAddress}-${nft.tokenId}`}
              nft={nft}
              variant={viewMode}
              onSelect={onNFTSelect}
              isSelected={selectedNFTs.includes(nft.tokenId)}
              showActions={!selectionMode}
            />
          ))}
        </SimpleGrid>
      )}
      
      {/* Load More / Infinite Scroll Loading */}
      {enableInfiniteScroll && infiniteLoading && (
        <Center py={8}>
          <Spinner size="lg" color="blue.500" />
        </Center>
      )}
      
      {/* Pagination */}
      {!enableInfiniteScroll && totalPages > 1 && (
        <Box mt={8}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onNext={nextPage}
            onPrev={prevPage}
            showItemsPerPage={false}
          />
        </Box>
      )}
    </Box>
  );
};

/**
 * NFT Grid Filters Component
 */
const NFTGridFilters = ({ filters, onFilterChange, onClearFilters, nfts }) => {
  const { isOpen, onToggle } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Extract unique values from NFTs
  const uniqueCategories = useMemo(() => {
    const categories = nfts.map(nft => nft.category).filter(Boolean);
    return [...new Set(categories)];
  }, [nfts]);
  
  const uniqueCollections = useMemo(() => {
    const collections = nfts.map(nft => nft.collection).filter(Boolean);
    const uniqueColls = collections.reduce((acc, collection) => {
      if (!acc.find(c => c.address === collection.address)) {
        acc.push(collection);
      }
      return acc;
    }, []);
    return uniqueColls;
  }, [nfts]);
  
  const hasActiveFilters = useMemo(() => {
    return (
      filters.status.length > 0 ||
      filters.categories.length > 0 ||
      filters.collections.length > 0 ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 1000
    );
  }, [filters]);
  
  return (
    <Box w="full">
      {/* Filter Toggle */}
      <HStack spacing={4} mb={4}>
        <Button
          leftIcon={<FiFilter />}
          rightIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
          variant="outline"
          size="sm"
          onClick={onToggle}
        >
          Filters
          {hasActiveFilters && (
            <Badge ml={2} colorScheme="blue" variant="solid">
              {[
                ...filters.status,
                ...filters.categories,
                ...filters.collections
              ].length}
            </Badge>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button size="sm" variant="ghost" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </HStack>
      
      {/* Filter Content */}
      <Collapse in={isOpen}>
        <Box
          p={4}
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="md"
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {/* Status Filter */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Status
              </FormLabel>
              <CheckboxGroup
                value={filters.status}
                onChange={(value) => onFilterChange('status', value)}
              >
                <Stack spacing={2}>
                  <Checkbox value="listed">Listed</Checkbox>
                  <Checkbox value="auction">On Auction</Checkbox>
                  <Checkbox value="sold">Sold</Checkbox>
                  <Checkbox value="not-listed">Not Listed</Checkbox>
                </Stack>
              </CheckboxGroup>
            </FormControl>
            
            {/* Price Range Filter */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Price Range (ETH)
              </FormLabel>
              <VStack spacing={3}>
                <RangeSlider
                  value={filters.priceRange}
                  onChange={(value) => onFilterChange('priceRange', value)}
                  min={0}
                  max={1000}
                  step={0.1}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
                <HStack spacing={2} w="full">
                  <NumberInput
                    size="sm"
                    value={filters.priceRange[0]}
                    onChange={(value) => 
                      onFilterChange('priceRange', [parseFloat(value) || 0, filters.priceRange[1]])
                    }
                    min={0}
                    max={filters.priceRange[1]}
                  >
                    <NumberInputField placeholder="Min" />
                  </NumberInput>
                  <Text fontSize="sm">to</Text>
                  <NumberInput
                    size="sm"
                    value={filters.priceRange[1]}
                    onChange={(value) => 
                      onFilterChange('priceRange', [filters.priceRange[0], parseFloat(value) || 1000])
                    }
                    min={filters.priceRange[0]}
                    max={1000}
                  >
                    <NumberInputField placeholder="Max" />
                  </NumberInput>
                </HStack>
              </VStack>
            </FormControl>
            
            {/* Categories Filter */}
            {uniqueCategories.length > 0 && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Categories
                </FormLabel>
                <CheckboxGroup
                  value={filters.categories}
                  onChange={(value) => onFilterChange('categories', value)}
                >
                  <Stack spacing={2} maxH="150px" overflowY="auto">
                    {uniqueCategories.map((category) => (
                      <Checkbox key={category} value={category}>
                        {category}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
            )}
            
            {/* Collections Filter */}
            {uniqueCollections.length > 0 && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Collections
                </FormLabel>
                <CheckboxGroup
                  value={filters.collections}
                  onChange={(value) => onFilterChange('collections', value)}
                >
                  <Stack spacing={2} maxH="150px" overflowY="auto">
                    {uniqueCollections.map((collection) => (
                      <Checkbox key={collection.address} value={collection.address}>
                        {collection.name}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
            )}
          </SimpleGrid>
        </Box>
      </Collapse>
    </Box>
  );
};

/**
 * NFT Grid Stats Component
 */
const NFTGridStats = ({ nfts, filteredCount }) => {
  const stats = useMemo(() => {
    const listed = nfts.filter(nft => nft.isListed).length;
    const totalVolume = nfts.reduce((sum, nft) => {
      return sum + (nft.lastSale ? parseFloat(formatEther(nft.lastSale)) : 0);
    }, 0);
    const avgPrice = nfts.filter(nft => nft.price).reduce((sum, nft, _, arr) => {
      return sum + parseFloat(formatEther(nft.price)) / arr.length;
    }, 0);
    
    return {
      total: nfts.length,
      listed,
      totalVolume: totalVolume.toFixed(2),
      avgPrice: avgPrice.toFixed(2)
    };
  }, [nfts]);
  
  return (
    <HStack spacing={8} p={4} bg="gray.50" borderRadius="md">
      <VStack spacing={0}>
        <Text fontSize="2xl" fontWeight="bold">{stats.total}</Text>
        <Text fontSize="sm" color="gray.600">Total NFTs</Text>
      </VStack>
      <VStack spacing={0}>
        <Text fontSize="2xl" fontWeight="bold">{stats.listed}</Text>
        <Text fontSize="sm" color="gray.600">Listed</Text>
      </VStack>
      <VStack spacing={0}>
        <Text fontSize="2xl" fontWeight="bold">{stats.totalVolume} ETH</Text>
        <Text fontSize="sm" color="gray.600">Total Volume</Text>
      </VStack>
      <VStack spacing={0}>
        <Text fontSize="2xl" fontWeight="bold">{stats.avgPrice} ETH</Text>
        <Text fontSize="sm" color="gray.600">Avg Price</Text>
      </VStack>
    </HStack>
  );
};

export default NFTGrid;
export { NFTGridFilters, NFTGridStats };