import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Flex,
  Badge,
  Card,
  CardBody,
  Image,
  Avatar,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  Checkbox,
  CheckboxGroup,
  Stack,
  Divider,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  SearchIcon,
} from '@chakra-ui/icons';
import { FiFilter } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNFT } from '../contexts/NFTContext';
import { useWeb3 } from '../contexts/Web3Context';

const MotionCard = motion(Card);

const Marketplace = () => {
  const { nfts, marketplaceListings, loading, fetchAllNFTs, fetchMarketplaceListings } = useNFT();
  const { isConnected } = useWeb3();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'newest',
    priceRange: [0, 100],
    categories: [],
    status: 'all',
  });
  
  const [viewMode, setViewMode] = useState('grid');
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const filterBg = useColorModeValue('gray.50', 'gray.900');

  // Helper functions for listing info
  const isListed = (tokenId) => {
    return marketplaceListings.some(listing => listing.tokenId === tokenId);
  };

  const getListingInfo = (tokenId) => {
    return marketplaceListings.find(listing => listing.tokenId === tokenId);
  };

  // Filter and sort NFTs
  const filteredNFTs = useMemo(() => {
    // Combine all NFTs with their listing information
    let allNFTsWithListingInfo = nfts.map(nft => {
      const listingInfo = getListingInfo(nft.tokenId);
      return {
        ...nft,
        price: listingInfo?.price || null,
        isListed: isListed(nft.tokenId),
        listingId: listingInfo?.listingId || null,
        seller: listingInfo?.seller || nft.owner
      };
    });

    let filtered = [...allNFTsWithListingInfo];

    // Status filter
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'buy-now':
          filtered = filtered.filter(nft => nft.isListed);
          break;
        case 'auction':
          // For future auction functionality
          filtered = filtered.filter(nft => false);
          break;
        case 'new':
          // Show newest NFTs (last 10% of all NFTs)
          const newThreshold = Math.floor(nfts.length * 0.9);
          filtered = filtered.filter(nft => nft.tokenId > newThreshold);
          break;
        default:
          break;
      }
    }

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (nft) =>
          nft.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          nft.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
          nft.tokenId?.toString().includes(filters.search)
      );
    }

    // Price range filter (only for listed NFTs)
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) {
      filtered = filtered.filter(
        (nft) => {
          if (!nft.isListed) return filters.priceRange[0] === 0; // Include unlisted if min price is 0
          const price = parseFloat(nft.price || 0);
          return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        }
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price || 0);
          const priceB = parseFloat(b.price || 0);
          // Listed items first, then by price
          if (a.isListed && !b.isListed) return -1;
          if (!a.isListed && b.isListed) return 1;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price || 0);
          const priceB = parseFloat(b.price || 0);
          // Listed items first, then by price
          if (a.isListed && !b.isListed) return -1;
          if (!a.isListed && b.isListed) return 1;
          return priceB - priceA;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => b.tokenId - a.tokenId);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.tokenId - b.tokenId);
        break;
      default:
        break;
    }

    return filtered;
  }, [nfts, marketplaceListings, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredNFTs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNFTs = filteredNFTs.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Refresh listings and all NFTs on mount only once
  useEffect(() => {
    fetchAllNFTs();
    fetchMarketplaceListings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'newest',
      priceRange: [0, 100],
      categories: [],
      status: 'all',
    });
  };

  const NFTCard = ({ nft, index }) => (
    <MotionCard
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      cursor="pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: 'xl' }}
      as={RouterLink}
      to={`/nft/${nft.tokenId}`}
    >
      <Box position="relative">
        <Image
          src={nft.image}
          alt={nft.name}
          w="full"
          h="250px"
          objectFit="cover"
          fallback={
            <Box
              w="full"
              h="250px"
              bg="gray.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="4xl">🎨</Text>
            </Box>
          }
        />
        {nft.isListed && (
          <Badge
            position="absolute"
            top={3}
            right={3}
            colorScheme="green"
            variant="solid"
            borderRadius="full"
          >
            FOR SALE
          </Badge>
        )}
      </Box>
      
      <CardBody>
        <VStack align="start" spacing={3}>
          <Heading size="md" noOfLines={1}>
            {nft.name || `NFT #${nft.tokenId}`}
          </Heading>
          
          <Text color={textColor} noOfLines={2} fontSize="sm">
            {nft.description || 'No description available'}
          </Text>
          
          <HStack justify="space-between" w="full">
            <HStack spacing={2}>
              <Avatar size="xs" bg="brand.500" />
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color={textColor}>
                  Seller
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {nft.seller?.slice(0, 6)}...{nft.seller?.slice(-4)}
                </Text>
              </VStack>
            </HStack>
            
            {nft.isListed && nft.price ? (
              <VStack align="end" spacing={0}>
                <Text fontSize="xs" color={textColor}>
                  Price
                </Text>
                <Text fontWeight="bold" color="brand.500" fontSize="lg">
                  {nft.price} ETH
                </Text>
              </VStack>
            ) : (
              <VStack align="end" spacing={0}>
                <Text fontSize="xs" color={textColor}>
                  Status
                </Text>
                <Text fontWeight="bold" color="gray.500">
                  Not Listed
                </Text>
              </VStack>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </MotionCard>
  );

  const FilterPanel = () => (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="md">Filters</Heading>
        <Button size="sm" variant="ghost" onClick={clearFilters}>
          Clear All
        </Button>
      </HStack>
      
      <Divider />
      
      {/* Price Range */}
      <FormControl>
        <FormLabel fontSize="sm" fontWeight="bold">
          Price Range (ETH)
        </FormLabel>
        <VStack spacing={4}>
          <RangeSlider
            value={filters.priceRange}
            onChange={(value) => handleFilterChange('priceRange', value)}
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
          
          <HStack spacing={2} w="full">
            <NumberInput
              size="sm"
              value={filters.priceRange[0]}
              onChange={(value) =>
                handleFilterChange('priceRange', [parseFloat(value) || 0, filters.priceRange[1]])
              }
              min={0}
              max={filters.priceRange[1]}
            >
              <NumberInputField placeholder="Min" />
            </NumberInput>
            <Text>to</Text>
            <NumberInput
              size="sm"
              value={filters.priceRange[1]}
              onChange={(value) =>
                handleFilterChange('priceRange', [filters.priceRange[0], parseFloat(value) || 100])
              }
              min={filters.priceRange[0]}
              max={100}
            >
              <NumberInputField placeholder="Max" />
            </NumberInput>
          </HStack>
        </VStack>
      </FormControl>
      
      <Divider />
      
      {/* Categories */}
      <FormControl>
        <FormLabel fontSize="sm" fontWeight="bold">
          Categories
        </FormLabel>
        <CheckboxGroup
          value={filters.categories}
          onChange={(value) => handleFilterChange('categories', value)}
        >
          <Stack spacing={2}>
            <Checkbox value="art">Art</Checkbox>
            <Checkbox value="music">Music</Checkbox>
            <Checkbox value="photography">Photography</Checkbox>
            <Checkbox value="gaming">Gaming</Checkbox>
            <Checkbox value="collectibles">Collectibles</Checkbox>
            <Checkbox value="utility">Utility</Checkbox>
          </Stack>
        </CheckboxGroup>
      </FormControl>
      
      <Divider />
      
      {/* Status */}
      <FormControl>
        <FormLabel fontSize="sm" fontWeight="bold">
          Status
        </FormLabel>
        <Select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          size="sm"
        >
          <option value="all">All Items</option>
          <option value="buy-now">Buy Now</option>
          <option value="auction">On Auction</option>
          <option value="new">New</option>
        </Select>
      </FormControl>
    </VStack>
  );

  const MobileFilterDrawer = () => (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Filters</DrawerHeader>
        <DrawerBody>
          <FilterPanel />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <HStack spacing={2} justify="center">
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          isDisabled={currentPage === 1}
        >
          Previous
        </Button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? 'solid' : 'outline'}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          );
        })}
        
        <Button
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          isDisabled={currentPage === totalPages}
        >
          Next
        </Button>
      </HStack>
    );
  };

  return (
    <Box minH="100vh" bg={filterBg}>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="start">
            <Heading size="xl">Marketplace</Heading>
            <Text color={textColor} fontSize="lg">
              Discover, buy, and sell extraordinary NFTs
            </Text>
          </VStack>
          
          {/* Search and Controls */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={4}
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
          >
            <HStack spacing={4} flex={1}>
              <InputGroup maxW="400px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search NFTs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  bg={bg}
                />
              </InputGroup>
              
              {isMobile && (
                <IconButton
                  aria-label="Open filters"
                  icon={<FiFilter />}
                  onClick={onOpen}
                  variant="outline"
                />
              )}
            </HStack>
            
            <HStack spacing={4}>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                w="200px"
                bg={bg}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </Select>
              
              <Text color={textColor} fontSize="sm" whiteSpace="nowrap">
                {filteredNFTs.length} items
              </Text>
            </HStack>
          </Flex>
          
          {/* Main Content */}
          <Flex gap={8} align="start">
            {/* Desktop Filters */}
            {!isMobile && (
              <Box w="280px" bg={bg} p={6} borderRadius="xl" border="1px" borderColor={borderColor}>
                <FilterPanel />
              </Box>
            )}
            
            {/* NFT Grid */}
            <Box flex={1}>
              {loading ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <Card key={index} bg={cardBg} border="1px" borderColor={borderColor}>
                      <Skeleton height="250px" />
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <SkeletonText noOfLines={1} width="80%" />
                          <SkeletonText noOfLines={2} width="100%" />
                          <HStack justify="space-between" w="full">
                            <Skeleton height="20px" width="60px" />
                            <Skeleton height="20px" width="80px" />
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : paginatedNFTs.length > 0 ? (
                <VStack spacing={8}>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6} w="full">
                    {paginatedNFTs.map((nft, index) => (
                      <NFTCard key={nft.tokenId} nft={nft} index={index} />
                    ))}
                  </SimpleGrid>
                  
                  <Pagination />
                </VStack>
              ) : (
                <VStack spacing={6} py={12} textAlign="center">
                  <Text fontSize="6xl">
                    {filters.search || filters.categories.length > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 100 || filters.status !== 'all'
                      ? '🔍' : '🎨'}
                  </Text>
                  <Heading size="lg">
                    {filters.search || filters.categories.length > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 100 || filters.status !== 'all'
                      ? 'No NFTs match your filters'
                      : 'No NFTs available yet'}
                  </Heading>
                  <Text color={textColor} maxW="400px">
                    {filters.search || filters.categories.length > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 100 || filters.status !== 'all'
                      ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                      : 'Be the first to mint and list NFTs on our marketplace!'}
                  </Text>
                  {(filters.search || filters.categories.length > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 100 || filters.status !== 'all') && (
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  )}
                  {!isConnected ? (
                    <Button variant="gradient" size="lg">
                      Connect Wallet to Start
                    </Button>
                  ) : (
                    <Button
                      as={RouterLink}
                      to="/create"
                      variant="gradient"
                      size="lg"
                    >
                      Create Your First NFT
                    </Button>
                  )}
                </VStack>
              )}
            </Box>
          </Flex>
        </VStack>
      </Container>
      
      <MobileFilterDrawer />
    </Box>
  );
};

export default Marketplace;