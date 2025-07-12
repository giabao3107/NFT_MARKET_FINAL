import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Flex,
  Spacer,
  Badge,
  IconButton,
  Tooltip,
  Avatar,
  AvatarGroup,
  SimpleGrid,
  Center,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Progress,
  CircularProgress,
  CircularProgressLabel
} from '@chakra-ui/react';
import {
  FiGrid,
  FiList,
  FiMoreVertical,
  FiShare2,
  FiHeart,
  FiEye,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiImage,
  FiDollarSign,
  FiCalendar,
  FiExternalLink,
  FiCopy,
  FiEdit,
  FiSettings,
  FiStar,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiBarChart,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFTContext } from '../../contexts/NFTContext';
import { useCustomToast } from '../common/Toast';
import { NFTCard } from './NFTCard';
import { NFTGrid } from './NFTGrid';
import { SearchBar, Filter } from '../common';
import { usePaginatedData, useDebounce, useFavorites } from '../../hooks';
import { formatEther, formatAddress } from '../../utils/web3';
import { formatDate, formatNumber } from '../../utils/helpers';

/**
 * Collection Card Component
 */
const CollectionCard = ({ collection, variant = 'default', onClick, ...props }) => {
  const { account } = useWeb3();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const toast = useCustomToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  const isOwner = account && collection.owner === account;
  const isFav = isFavorite('collection', collection.id);
  
  const handleFavorite = (e) => {
    e.stopPropagation();
    if (isFav) {
      removeFromFavorites('collection', collection.id);
      toast.success('Removed', 'Collection removed from favorites');
    } else {
      addToFavorites('collection', collection.id, collection);
      toast.success('Added', 'Collection added to favorites');
    }
  };
  
  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + `/collection/${collection.id}`);
    toast.success('Copied', 'Collection link copied to clipboard');
  };
  
  if (variant === 'compact') {
    return (
      <Card
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ transform: 'translateY(-2px)', shadow: 'lg', bg: hoverBg }}
        onClick={() => onClick?.(collection)}
        {...props}
      >
        <CardBody p={4}>
          <HStack spacing={4}>
            <Avatar
              size="md"
              src={collection.image}
              name={collection.name}
            />
            
            <VStack spacing={1} align="start" flex={1}>
              <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                {collection.name}
              </Text>
              <HStack spacing={4} fontSize="xs" color="gray.500">
                <Text>{collection.itemCount} items</Text>
                <Text>{formatEther(collection.floorPrice)} ETH floor</Text>
              </HStack>
            </VStack>
            
            <VStack spacing={1} align="end">
              <Text fontSize="sm" fontWeight="medium">
                {formatEther(collection.volume)} ETH
              </Text>
              <HStack spacing={1}>
                {collection.volumeChange > 0 ? (
                  <FiTrendingUp color="green" />
                ) : (
                  <FiTrendingDown color="red" />
                )}
                <Text
                  fontSize="xs"
                  color={collection.volumeChange > 0 ? 'green.500' : 'red.500'}
                >
                  {Math.abs(collection.volumeChange)}%
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
      onClick={() => onClick?.(collection)}
      {...props}
    >
      {/* Cover Image */}
      <Box position="relative" h="200px" overflow="hidden">
        <Image
          src={collection.bannerImage || collection.image}
          alt={collection.name}
          w="full"
          h="full"
          objectFit="cover"
        />
        
        {/* Actions */}
        <Box position="absolute" top={2} right={2}>
          <HStack spacing={2}>
            <IconButton
              size="sm"
              variant="solid"
              bg="blackAlpha.600"
              color="white"
              _hover={{ bg: 'blackAlpha.800' }}
              icon={<FiHeart />}
              onClick={handleFavorite}
              colorScheme={isFav ? 'red' : 'gray'}
            />
            <IconButton
              size="sm"
              variant="solid"
              bg="blackAlpha.600"
              color="white"
              _hover={{ bg: 'blackAlpha.800' }}
              icon={<FiShare2 />}
              onClick={handleShare}
            />
          </HStack>
        </Box>
        
        {/* Owner Badge */}
        {isOwner && (
          <Badge
            position="absolute"
            top={2}
            left={2}
            colorScheme="blue"
            variant="solid"
          >
            Owner
          </Badge>
        )}
      </Box>
      
      <CardBody>
        <VStack spacing={4} align="start">
          {/* Header */}
          <HStack spacing={3} w="full">
            <Avatar
              size="md"
              src={collection.image}
              name={collection.name}
              border="2px"
              borderColor="white"
              mt="-6"
            />
            
            <VStack spacing={1} align="start" flex={1}>
              <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                {collection.name}
              </Text>
              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                by {formatAddress(collection.owner)}
              </Text>
            </VStack>
            
            {collection.verified && (
              <Tooltip label="Verified Collection">
                <Box color="blue.500">
                  <FiStar />
                </Box>
              </Tooltip>
            )}
          </HStack>
          
          {/* Description */}
          {collection.description && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {collection.description}
            </Text>
          )}
          
          {/* Stats */}
          <SimpleGrid columns={3} spacing={4} w="full">
            <Stat size="sm">
              <StatLabel fontSize="xs">Items</StatLabel>
              <StatNumber fontSize="md">{formatNumber(collection.itemCount)}</StatNumber>
            </Stat>
            
            <Stat size="sm">
              <StatLabel fontSize="xs">Floor</StatLabel>
              <StatNumber fontSize="md">{formatEther(collection.floorPrice)} ETH</StatNumber>
            </Stat>
            
            <Stat size="sm">
              <StatLabel fontSize="xs">Volume</StatLabel>
              <StatNumber fontSize="md">{formatEther(collection.volume)} ETH</StatNumber>
              <StatHelpText fontSize="xs">
                <StatArrow type={collection.volumeChange > 0 ? 'increase' : 'decrease'} />
                {Math.abs(collection.volumeChange)}%
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Collection Grid Component
 */
const CollectionGrid = ({ 
  collections = [], 
  loading = false, 
  variant = 'default',
  onCollectionClick,
  ...props 
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('volume');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  // Filter and sort collections
  const filteredCollections = useMemo(() => {
    let filtered = collections;
    
    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(collection =>
        collection.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        collection.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    
    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(collection => collection.category === filterBy);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return b.volume - a.volume;
        case 'floor':
          return b.floorPrice - a.floorPrice;
        case 'items':
          return b.itemCount - a.itemCount;
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [collections, debouncedSearch, filterBy, sortBy]);
  
  if (loading) {
    return (
      <VStack spacing={6} {...props}>
        <HStack spacing={4} w="full" justify="space-between">
          <Skeleton height="40px" width="300px" />
          <HStack spacing={2}>
            <Skeleton height="40px" width="120px" />
            <Skeleton height="40px" width="100px" />
          </HStack>
        </HStack>
        
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
          spacing={6}
          w="full"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <Skeleton height="200px" />
              <CardBody>
                <VStack spacing={3} align="start">
                  <HStack spacing={3}>
                    <SkeletonCircle size="12" />
                    <VStack spacing={1} align="start">
                      <Skeleton height="20px" width="120px" />
                      <Skeleton height="16px" width="80px" />
                    </VStack>
                  </HStack>
                  <SkeletonText noOfLines={2} spacing={2} />
                  <SimpleGrid columns={3} spacing={4} w="full">
                    <Skeleton height="40px" />
                    <Skeleton height="40px" />
                    <Skeleton height="40px" />
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    );
  }
  
  return (
    <VStack spacing={6} {...props}>
      {/* Controls */}
      <HStack spacing={4} w="full" justify="space-between" flexWrap="wrap">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search collections..."
          size="md"
          maxW="400px"
        />
        
        <HStack spacing={2} flexWrap="wrap">
          {/* Filter */}
          <Menu>
            <MenuButton as={Button} leftIcon={<FiFilter />} size="sm">
              {filterBy === 'all' ? 'All Categories' : filterBy}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setFilterBy('all')}>All Categories</MenuItem>
              <MenuDivider />
              <MenuItem onClick={() => setFilterBy('art')}>Art</MenuItem>
              <MenuItem onClick={() => setFilterBy('music')}>Music</MenuItem>
              <MenuItem onClick={() => setFilterBy('photography')}>Photography</MenuItem>
              <MenuItem onClick={() => setFilterBy('gaming')}>Gaming</MenuItem>
              <MenuItem onClick={() => setFilterBy('sports')}>Sports</MenuItem>
            </MenuList>
          </Menu>
          
          {/* Sort */}
          <Menu>
            <MenuButton as={Button} leftIcon={<FiBarChart />} size="sm">
              Sort: {sortBy}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setSortBy('volume')}>Volume</MenuItem>
              <MenuItem onClick={() => setSortBy('floor')}>Floor Price</MenuItem>
              <MenuItem onClick={() => setSortBy('items')}>Items</MenuItem>
              <MenuItem onClick={() => setSortBy('created')}>Recently Created</MenuItem>
              <MenuItem onClick={() => setSortBy('name')}>Name</MenuItem>
            </MenuList>
          </Menu>
          
          {/* View Mode */}
          <HStack spacing={0} border="1px" borderColor="gray.200" borderRadius="md">
            <IconButton
              size="sm"
              variant={viewMode === 'grid' ? 'solid' : 'ghost'}
              icon={<FiGrid />}
              onClick={() => setViewMode('grid')}
              borderRadius="md 0 0 md"
            />
            <IconButton
              size="sm"
              variant={viewMode === 'list' ? 'solid' : 'ghost'}
              icon={<FiList />}
              onClick={() => setViewMode('list')}
              borderRadius="0 md md 0"
            />
          </HStack>
        </HStack>
      </HStack>
      
      {/* Results Count */}
      <HStack w="full" justify="space-between">
        <Text color="gray.500" fontSize="sm">
          {filteredCollections.length} collection{filteredCollections.length !== 1 ? 's' : ''} found
        </Text>
      </HStack>
      
      {/* Collections Grid/List */}
      {filteredCollections.length === 0 ? (
        <Center py={20}>
          <VStack spacing={4}>
            <Box fontSize="4xl" color="gray.400">
              <FiImage />
            </Box>
            <VStack spacing={2}>
              <Text fontSize="lg" fontWeight="medium">
                No collections found
              </Text>
              <Text color="gray.500" textAlign="center">
                {searchQuery || filterBy !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No collections available at the moment'}
              </Text>
            </VStack>
          </VStack>
        </Center>
      ) : (
        <SimpleGrid
          columns={{
            base: 1,
            md: viewMode === 'list' ? 1 : 2,
            lg: viewMode === 'list' ? 1 : 3,
            xl: viewMode === 'list' ? 1 : 4
          }}
          spacing={6}
          w="full"
        >
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              variant={viewMode === 'list' ? 'compact' : variant}
              onClick={onCollectionClick}
            />
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};

/**
 * Collection Detail Component
 */
const CollectionDetail = ({ collection, onBack, ...props }) => {
  const { account } = useWeb3Context();
  const { nfts, loading: nftsLoading, fetchNFTsByCollection } = useNFTContext();
  const toast = useCustomToast();
  
  const [activeTab, setActiveTab] = useState(0);
  const [nftFilters, setNftFilters] = useState({});
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const isOwner = account && collection.owner === account;
  
  useEffect(() => {
    if (collection.id) {
      fetchNFTsByCollection(collection.id);
    }
  }, [collection.id, fetchNFTsByCollection]);
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Copied', 'Collection link copied to clipboard');
  };
  
  const collectionNFTs = nfts.filter(nft => nft.collectionId === collection.id);
  
  return (
    <Box {...props}>
      {/* Header */}
      <Box position="relative" h="300px" overflow="hidden" borderRadius="lg">
        <Image
          src={collection.bannerImage || collection.image}
          alt={collection.name}
          w="full"
          h="full"
          objectFit="cover"
        />
        
        {/* Overlay */}
        <Box
          position="absolute"
          inset={0}
          bg="blackAlpha.600"
          display="flex"
          alignItems="end"
          p={8}
        >
          <HStack spacing={6} align="end">
            <Avatar
              size="2xl"
              src={collection.image}
              name={collection.name}
              border="4px"
              borderColor="white"
            />
            
            <VStack spacing={2} align="start" color="white">
              <HStack spacing={2}>
                <Text fontSize="3xl" fontWeight="bold">
                  {collection.name}
                </Text>
                {collection.verified && (
                  <Box color="blue.300" fontSize="xl">
                    <FiStar />
                  </Box>
                )}
              </HStack>
              
              <Text fontSize="lg" opacity={0.9}>
                by {formatAddress(collection.owner)}
              </Text>
              
              {collection.description && (
                <Text maxW="600px" opacity={0.8}>
                  {collection.description}
                </Text>
              )}
            </VStack>
          </HStack>
        </Box>
        
        {/* Actions */}
        <Box position="absolute" top={4} right={4}>
          <HStack spacing={2}>
            {onBack && (
              <Button
                variant="solid"
                bg="blackAlpha.600"
                color="white"
                _hover={{ bg: 'blackAlpha.800' }}
                onClick={onBack}
              >
                Back
              </Button>
            )}
            <IconButton
              variant="solid"
              bg="blackAlpha.600"
              color="white"
              _hover={{ bg: 'blackAlpha.800' }}
              icon={<FiShare2 />}
              onClick={handleShare}
            />
            {isOwner && (
              <IconButton
                variant="solid"
                bg="blackAlpha.600"
                color="white"
                _hover={{ bg: 'blackAlpha.800' }}
                icon={<FiSettings />}
              />
            )}
          </HStack>
        </Box>
      </Box>
      
      {/* Stats */}
      <Card mt={6} bg={bgColor} border="1px" borderColor={borderColor}>
        <CardBody>
          <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={6}>
            <Stat>
              <StatLabel>Items</StatLabel>
              <StatNumber>{formatNumber(collection.itemCount)}</StatNumber>
            </Stat>
            
            <Stat>
              <StatLabel>Owners</StatLabel>
              <StatNumber>{formatNumber(collection.ownerCount)}</StatNumber>
            </Stat>
            
            <Stat>
              <StatLabel>Floor Price</StatLabel>
              <StatNumber>{formatEther(collection.floorPrice)} ETH</StatNumber>
            </Stat>
            
            <Stat>
              <StatLabel>Volume Traded</StatLabel>
              <StatNumber>{formatEther(collection.volume)} ETH</StatNumber>
              <StatHelpText>
                <StatArrow type={collection.volumeChange > 0 ? 'increase' : 'decrease'} />
                {Math.abs(collection.volumeChange)}%
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Avg. Price</StatLabel>
              <StatNumber>{formatEther(collection.avgPrice)} ETH</StatNumber>
            </Stat>
            
            <Stat>
              <StatLabel>Created</StatLabel>
              <StatNumber fontSize="md">{formatDate(collection.createdAt)}</StatNumber>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>
      
      {/* Tabs */}
      <Tabs index={activeTab} onChange={setActiveTab} mt={6}>
        <TabList>
          <Tab>Items ({collectionNFTs.length})</Tab>
          <Tab>Activity</Tab>
          <Tab>Analytics</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
            <NFTGrid
              nfts={collectionNFTs}
              loading={nftsLoading}
              showCollection={false}
              filters={nftFilters}
              onFiltersChange={setNftFilters}
            />
          </TabPanel>
          
          <TabPanel px={0}>
            <Center py={20}>
              <VStack spacing={4}>
                <Box fontSize="4xl" color="gray.400">
                  <FiActivity />
                </Box>
                <Text fontSize="lg" fontWeight="medium">
                  Activity Coming Soon
                </Text>
                <Text color="gray.500" textAlign="center">
                  Collection activity and transaction history will be available soon
                </Text>
              </VStack>
            </Center>
          </TabPanel>
          
          <TabPanel px={0}>
            <Center py={20}>
              <VStack spacing={4}>
                <Box fontSize="4xl" color="gray.400">
                  <FiPieChart />
                </Box>
                <Text fontSize="lg" fontWeight="medium">
                  Analytics Coming Soon
                </Text>
                <Text color="gray.500" textAlign="center">
                  Detailed analytics and insights will be available soon
                </Text>
              </VStack>
            </Center>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

/**
 * Main Collection Component
 */
const NFTCollection = ({ 
  mode = 'grid', // 'grid' | 'detail'
  collectionId,
  collections = [],
  loading = false,
  onCollectionClick,
  onBack,
  ...props 
}) => {
  const [selectedCollection, setSelectedCollection] = useState(null);
  
  // If collectionId is provided, find the collection
  useEffect(() => {
    if (collectionId && collections.length > 0) {
      const collection = collections.find(c => c.id === collectionId);
      setSelectedCollection(collection);
    }
  }, [collectionId, collections]);
  
  const handleCollectionClick = (collection) => {
    if (onCollectionClick) {
      onCollectionClick(collection);
    } else {
      setSelectedCollection(collection);
    }
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setSelectedCollection(null);
    }
  };
  
  if (mode === 'detail' || selectedCollection) {
    return (
      <CollectionDetail
        collection={selectedCollection}
        onBack={handleBack}
        {...props}
      />
    );
  }
  
  return (
    <CollectionGrid
      collections={collections}
      loading={loading}
      onCollectionClick={handleCollectionClick}
      {...props}
    />
  );
};

export default NFTCollection;
export { CollectionCard, CollectionGrid, CollectionDetail };