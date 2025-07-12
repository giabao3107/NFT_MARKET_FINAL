import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  SimpleGrid,
  Skeleton,
  Center,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Checkbox,
  CheckboxGroup,
  Stack,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown,
  FiTrendingUp,
  FiClock,
  FiDollarSign,
  FiHeart,
  FiEye,
  FiRefreshCw
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNFT } from '../contexts/NFTContext';
import { useWeb3 } from '../contexts/Web3Context';
import { NFTCard, NFTGrid } from '../components/nft';
import { SearchBar, Pagination, LoadingSpinner } from '../components/common';
import { useDebounce, usePaginatedData, useLocalStorage } from '../hooks';

const MotionBox = motion(Box);

/**
 * Filter Sidebar Component
 */
const FilterSidebar = ({ filters, onFiltersChange, isOpen, onClose }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const categories = [
    'Art', 'Music', 'Photography', 'Gaming', 'Sports',
    'Collectibles', 'Virtual Worlds', 'Domain Names'
  ];
  
  const collections = [
    'Bored Ape Yacht Club', 'CryptoPunks', 'Azuki',
    'Doodles', 'Cool Cats', 'World of Women'
  ];
  
  const FilterContent = () => (
    <VStack spacing={6} align="stretch">
      {/* Price Range */}
      <Box>
        <Text fontWeight="semibold" mb={3}>Price Range (ETH)</Text>
        <VStack spacing={4}>
          <HStack w="full">
            <NumberInput
              size="sm"
              value={filters.priceRange[0]}
              onChange={(value) => onFiltersChange({
                ...filters,
                priceRange: [parseFloat(value) || 0, filters.priceRange[1]]
              })}
              min={0}
              precision={3}
            >
              <NumberInputField placeholder="Min" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text>to</Text>
            <NumberInput
              size="sm"
              value={filters.priceRange[1]}
              onChange={(value) => onFiltersChange({
                ...filters,
                priceRange: [filters.priceRange[0], parseFloat(value) || 100]
              })}
              min={0}
              precision={3}
            >
              <NumberInputField placeholder="Max" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
          <RangeSlider
            value={filters.priceRange}
            onChange={(value) => onFiltersChange({
              ...filters,
              priceRange: value
            })}
            min={0}
            max={100}
            step={0.1}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
        </VStack>
      </Box>
      
      <Divider />
      
      {/* Categories */}
      <Box>
        <Text fontWeight="semibold" mb={3}>Categories</Text>
        <CheckboxGroup
          value={filters.categories}
          onChange={(value) => onFiltersChange({
            ...filters,
            categories: value
          })}
        >
          <Stack spacing={2}>
            {categories.map((category) => (
              <Checkbox key={category} value={category}>
                {category}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      </Box>
      
      <Divider />
      
      {/* Collections */}
      <Box>
        <Text fontWeight="semibold" mb={3}>Collections</Text>
        <CheckboxGroup
          value={filters.collections}
          onChange={(value) => onFiltersChange({
            ...filters,
            collections: value
          })}
        >
          <Stack spacing={2}>
            {collections.map((collection) => (
              <Checkbox key={collection} value={collection}>
                {collection}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      </Box>
      
      <Divider />
      
      {/* Sale Status */}
      <Box>
        <Text fontWeight="semibold" mb={3}>Sale Status</Text>
        <CheckboxGroup
          value={filters.saleStatus}
          onChange={(value) => onFiltersChange({
            ...filters,
            saleStatus: value
          })}
        >
          <Stack spacing={2}>
            <Checkbox value="buy_now">Buy Now</Checkbox>
            <Checkbox value="on_auction">On Auction</Checkbox>
            <Checkbox value="new">New</Checkbox>
            <Checkbox value="has_offers">Has Offers</Checkbox>
          </Stack>
        </CheckboxGroup>
      </Box>
      
      <Divider />
      
      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={() => onFiltersChange({
          search: '',
          categories: [],
          collections: [],
          priceRange: [0, 100],
          saleStatus: [],
          sortBy: 'recently_listed'
        })}
      >
        Clear All Filters
      </Button>
    </VStack>
  );
  
  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w="300px"
        bg={bg}
        border="1px"
        borderColor={borderColor}
        borderRadius="xl"
        p={6}
        h="fit-content"
        position="sticky"
        top={6}
      >
        <Text fontSize="lg" fontWeight="bold" mb={6}>Filters</Text>
        <FilterContent />
      </Box>
      
      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Filters</DrawerHeader>
          <DrawerBody>
            <FilterContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

/**
 * Sort and View Controls
 */
const SortControls = ({ sortBy, onSortChange, viewMode, onViewModeChange, totalItems }) => {
  const sortOptions = [
    { value: 'recently_listed', label: 'Recently Listed', icon: FiClock },
    { value: 'price_low_high', label: 'Price: Low to High', icon: FiDollarSign },
    { value: 'price_high_low', label: 'Price: High to Low', icon: FiDollarSign },
    { value: 'most_liked', label: 'Most Liked', icon: FiHeart },
    { value: 'most_viewed', label: 'Most Viewed', icon: FiEye },
    { value: 'trending', label: 'Trending', icon: FiTrendingUp }
  ];
  
  return (
    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
      <HStack spacing={4}>
        <Text color="gray.600" fontSize="sm">
          {totalItems.toLocaleString()} items
        </Text>
        
        <Menu>
          <MenuButton as={Button} rightIcon={<FiChevronDown />} variant="outline" size="sm">
            {sortOptions.find(option => option.value === sortBy)?.label || 'Sort By'}
          </MenuButton>
          <MenuList>
            {sortOptions.map((option) => (
              <MenuItem
                key={option.value}
                icon={<option.icon />}
                onClick={() => onSortChange(option.value)}
              >
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </HStack>
      
      <HStack spacing={2}>
        <IconButton
          icon={<FiGrid />}
          variant={viewMode === 'grid' ? 'solid' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          aria-label="Grid view"
        />
        <IconButton
          icon={<FiList />}
          variant={viewMode === 'list' ? 'solid' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('list')}
          aria-label="List view"
        />
      </HStack>
    </Flex>
  );
};

/**
 * Main Explore Component
 */
const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State
  const [filters, setFilters] = useLocalStorage('explore-filters', {
    search: searchParams.get('search') || '',
    categories: searchParams.getAll('category') || [],
    collections: searchParams.getAll('collection') || [],
    priceRange: [0, 100],
    saleStatus: [],
    sortBy: searchParams.get('sort') || 'recently_listed'
  });
  
  const [viewMode, setViewMode] = useLocalStorage('explore-view-mode', 'grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 500);
  
  // Use real marketplace data
  const { marketplaceListings } = useNFT();
  const { data: nfts, isLoading, error, refetch } = usePaginatedData(
    async (page, limit) => {
      // Use actual marketplace listings
      const allNFTs = marketplaceListings.map(nft => ({
        id: `nft-${nft.tokenId}`,
        tokenId: nft.tokenId,
        name: nft.name || `NFT #${nft.tokenId}`,
        description: nft.description || '',
        image: nft.image,
        price: nft.price,
        collection: nft.collection || 'Unknown Collection',
        category: nft.category || 'Art',
        owner: nft.owner,
        seller: nft.seller,
        likes: 0, // Could be fetched from a separate service
        views: 0, // Could be fetched from a separate service
        isListed: true,
        createdAt: new Date()
      }));
      
      // Apply filters
      let filteredNFTs = allNFTs;
      
      if (debouncedSearch) {
        filteredNFTs = filteredNFTs.filter(nft => 
          nft.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          nft.collection.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }
      
      if (filters.categories.length > 0) {
        filteredNFTs = filteredNFTs.filter(nft => 
          filters.categories.includes(nft.category)
        );
      }
      
      if (filters.collections.length > 0) {
        filteredNFTs = filteredNFTs.filter(nft => 
          filters.collections.includes(nft.collection)
        );
      }
      
      filteredNFTs = filteredNFTs.filter(nft => {
        const price = parseFloat(nft.price);
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
      
      // Apply sorting
      switch (filters.sortBy) {
        case 'price_low_high':
          filteredNFTs.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price_high_low':
          filteredNFTs.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'most_liked':
          filteredNFTs.sort((a, b) => b.likes - a.likes);
          break;
        case 'most_viewed':
          filteredNFTs.sort((a, b) => b.views - a.views);
          break;
        case 'recently_listed':
        default:
          filteredNFTs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        items: filteredNFTs.slice(startIndex, endIndex),
        totalItems: filteredNFTs.length,
        totalPages: Math.ceil(filteredNFTs.length / limit),
        currentPage: page
      };
    },
    [debouncedSearch, filters, currentPage],
    { itemsPerPage: 20 }
  );
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy !== 'recently_listed') params.set('sort', filters.sortBy);
    
    filters.categories.forEach(category => {
      params.append('category', category);
    });
    
    filters.collections.forEach(collection => {
      params.append('collection', collection);
    });
    
    setSearchParams(params);
  }, [filters, setSearchParams]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };
  
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  const handleSortChange = (sortBy) => {
    setFilters({ ...filters, sortBy });
    setCurrentPage(1);
  };
  
  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="flex-start">
            <Heading size="xl">Explore NFTs</Heading>
            <Text color="gray.600" fontSize="lg">
              Discover unique digital assets from creators around the world
            </Text>
            
            {/* Search Bar */}
            <HStack w="full" spacing={4}>
              <Box flex={1} maxW="500px">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search NFTs, collections, or creators..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </InputGroup>
              </Box>
              
              <Button
                leftIcon={<FiFilter />}
                variant="outline"
                onClick={onOpen}
                display={{ base: 'flex', lg: 'none' }}
              >
                Filters
              </Button>
              
              <IconButton
                icon={<FiRefreshCw />}
                variant="outline"
                onClick={handleRefresh}
                isLoading={isRefreshing}
                aria-label="Refresh"
              />
            </HStack>
          </VStack>
          
          <Flex gap={8} align="flex-start">
            {/* Filters Sidebar */}
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={isOpen}
              onClose={onClose}
            />
            
            {/* Main Content */}
            <Box flex={1}>
              <VStack spacing={6} align="stretch">
                {/* Sort Controls */}
                <SortControls
                  sortBy={filters.sortBy}
                  onSortChange={handleSortChange}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  totalItems={nfts?.totalItems || 0}
                />
                
                {/* NFT Grid */}
                {isLoading ? (
                  <SimpleGrid
                    columns={{ base: 1, sm: 2, md: 3, lg: viewMode === 'grid' ? 4 : 2 }}
                    spacing={6}
                  >
                    {Array.from({ length: 20 }).map((_, i) => (
                      <Box key={i}>
                        <Skeleton height="300px" borderRadius="xl" />
                        <VStack mt={4} spacing={2} align="start">
                          <Skeleton height="20px" width="80%" />
                          <Skeleton height="16px" width="60%" />
                          <Skeleton height="24px" width="40%" />
                        </VStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : error ? (
                  <Center py={12}>
                    <Alert status="error" borderRadius="lg" maxW="400px">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="bold">Failed to load NFTs</Text>
                        <Text fontSize="sm">{error.message}</Text>
                      </Box>
                    </Alert>
                  </Center>
                ) : nfts?.items?.length > 0 ? (
                  <>
                    <SimpleGrid
                      columns={{
                        base: 1,
                        sm: 2,
                        md: viewMode === 'grid' ? 3 : 2,
                        lg: viewMode === 'grid' ? 4 : 3,
                        xl: viewMode === 'grid' ? 5 : 3
                      }}
                      spacing={6}
                    >
                      {nfts.items.map((nft, index) => (
                        <MotionBox
                          key={nft.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <NFTCard
                            nft={nft}
                            variant={viewMode === 'grid' ? 'default' : 'compact'}
                          />
                        </MotionBox>
                      ))}
                    </SimpleGrid>
                    
                    {/* Pagination */}
                    {nfts.totalPages > 1 && (
                      <Flex justify="center" mt={8}>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={nfts.totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </Flex>
                    )}
                  </>
                ) : (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Text fontSize="6xl">🔍</Text>
                      <Heading size="lg" textAlign="center">
                        No NFTs Found
                      </Heading>
                      <Text color="gray.600" textAlign="center" maxW="400px">
                        Try adjusting your search criteria or filters to find what you're looking for.
                      </Text>
                      <Button
                        onClick={() => handleFiltersChange({
                          search: '',
                          categories: [],
                          collections: [],
                          priceRange: [0, 100],
                          saleStatus: [],
                          sortBy: 'recently_listed'
                        })}
                      >
                        Clear All Filters
                      </Button>
                    </VStack>
                  </Center>
                )}
              </VStack>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Explore;
export { FilterSidebar, SortControls };