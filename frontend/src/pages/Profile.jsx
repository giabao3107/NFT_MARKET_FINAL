import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Avatar,
  Card,
  CardBody,
  Flex,
  Badge,
  SimpleGrid,
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
  useColorModeValue,
  useToast,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiEdit3,
  FiTag,
  FiTrash2,
  FiExternalLink,
  FiCopy,
  FiShare2,
  FiTrendingUp,
  FiDollarSign,
  FiEye,
  FiHeart,
  FiGrid,
  FiList,
} from 'react-icons/fi';
import { useNFT } from '../contexts/NFTContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import NFTCard from '../components/NFTCard';
import { useNFTOperations } from '../hooks/useNFTOperations';

const MotionBox = motion(Box);

const Profile = () => {
  const { userNFTs, loading, delistNFT } = useNFT();
  const { listNFTForSale } = useNFTOperations();
  const { isConnected, account, balance } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  const { address } = useParams();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [listPrice, setListPrice] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  
  const { isOpen: isListOpen, onOpen: onListOpen, onClose: onListClose } = useDisclosure();
  const { isOpen: isDelistOpen, onOpen: onDelistOpen, onClose: onDelistClose } = useDisclosure();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    if (isConnected && account && userNFTs) {
      // Calculate user stats from actual NFT data
      const listedNFTs = userNFTs.filter(nft => nft.isListed);
      const totalListedValue = listedNFTs.reduce((sum, nft) => sum + (parseFloat(nft.price) || 0), 0);
      
      const stats = {
        totalNFTs: userNFTs.length,
        totalValue: totalListedValue.toFixed(2),
        totalSales: 0, // This would come from transaction history
        totalEarnings: '0.0', // This would come from transaction history
        floorPrice: listedNFTs.length > 0 ? Math.min(...listedNFTs.map(nft => parseFloat(nft.price) || 0)).toFixed(2) : '0.0',
        avgSalePrice: listedNFTs.length > 0 ? (totalListedValue / listedNFTs.length).toFixed(2) : '0.0',
        views: 0, // Could be fetched from analytics service
        likes: 0, // Could be fetched from analytics service
      };
      setUserStats(stats);
      
      // Use actual user NFTs
      setFilteredNFTs(userNFTs);
    }
  }, [isConnected, account, userNFTs]);

  useEffect(() => {
    if (!userNFTs || !userNFTs.length) {
      setFilteredNFTs([]);
      return;
    }
    
    let filtered = [...userNFTs];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(nft => 
        nft.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (activeTab === 1) {
      filtered = filtered.filter(nft => nft.isListed);
    } else if (activeTab === 2) {
      filtered = filtered.filter(nft => !nft.isListed);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.tokenId || 0) - (a.tokenId || 0); // Use tokenId as proxy for creation time
        case 'oldest':
          return (a.tokenId || 0) - (b.tokenId || 0);
        case 'price-high':
          return parseFloat(b.price || 0) - parseFloat(a.price || 0);
        case 'price-low':
          return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        case 'most-liked':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });
    
    setFilteredNFTs(filtered);
  }, [userNFTs, searchQuery, sortBy, activeTab]);

  // Set active tab based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/favorites')) {
      setActiveTab(3); // Favorites tab
    } else if (path.includes('/created')) {
      setActiveTab(0); // Created tab
    } else if (path.includes('/collections')) {
      setActiveTab(4); // Collections tab
    } else if (path.includes('/activity')) {
      setActiveTab(5); // Activity tab
    } else {
      setActiveTab(0); // Default to created tab
    }
  }, [location.pathname]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    const baseUrl = `/profile/${address || account}`;
    switch (index) {
      case 0:
        navigate(baseUrl);
        break;
      case 1:
        navigate(baseUrl); // Listed items (same as all for now)
        break;
      case 2:
        navigate(baseUrl); // Not listed items (same as all for now)
        break;
      case 3:
        navigate(`${baseUrl}/favorites`);
        break;
      default:
        navigate(baseUrl);
    }
  };

  const handleList = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await listNFTForSale(selectedNFT.tokenId, listPrice);
      toast({
        title: 'NFT Listed Successfully!',
        description: `Your NFT is now listed for ${listPrice} ETH.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onListClose();
      setListPrice('');
      setSelectedNFT(null);
      
      // Refresh user NFTs to update listing status
      window.location.reload();
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast({
        title: 'Listing Failed',
        description: error.message || 'Failed to list NFT. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelist = async () => {
    try {
      await delistNFT(selectedNFT.tokenId);
      toast({
        title: 'NFT Delisted Successfully!',
        description: 'Your NFT has been removed from the marketplace.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onDelistClose();
      setSelectedNFT(null);
      
      // Refresh user NFTs to update listing status
      window.location.reload();
    } catch (error) {
      console.error('Error delisting NFT:', error);
      toast({
        title: 'Delisting Failed',
        description: error.message || 'Failed to delist NFT. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatAddress = (address) => {
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    toast({
      title: 'Address Copied!',
      description: 'Wallet address has been copied to clipboard.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (!isConnected) {
    return (
      <Box minH="100vh" bg={bg}>
        <Container maxW="4xl" py={16}>
          <VStack spacing={8} textAlign="center">
            <Text fontSize="6xl">👤</Text>
            <Heading size="xl">Connect Your Wallet</Heading>
            <Text color={textColor} fontSize="lg" maxW="500px">
              Connect your wallet to view your profile and manage your NFT collection.
            </Text>
            <Button variant="gradient" size="lg">
              Connect Wallet
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Profile Header */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
                  <Avatar
                    size="2xl"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${account}`}
                    border="4px solid"
                    borderColor="brand.500"
                  />
                  
                  <VStack align={{ base: 'center', md: 'start' }} spacing={3} flex={1}>
                    <VStack align={{ base: 'center', md: 'start' }} spacing={1}>
                      <Heading size="lg">My Collection</Heading>
                      <HStack>
                        <Text color={textColor}>{formatAddress(account)}</Text>
                        <Tooltip label="Copy address">
                          <IconButton
                            size="xs"
                            variant="ghost"
                            icon={<FiCopy />}
                            onClick={copyAddress}
                          />
                        </Tooltip>
                        <Tooltip label="View on Etherscan">
                          <IconButton
                            size="xs"
                            variant="ghost"
                            icon={<FiExternalLink />}
                            onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                          />
                        </Tooltip>
                      </HStack>
                    </VStack>
                    
                    <Text color={textColor} textAlign={{ base: 'center', md: 'left' }}>
                      Digital artist and NFT collector. Creating unique pieces that blend traditional art with modern technology.
                    </Text>
                    
                    <HStack spacing={4}>
                      <Button leftIcon={<FiEdit3 />} size="sm" variant="outline">
                        Edit Profile
                      </Button>
                      <Button leftIcon={<FiShare2 />} size="sm" variant="ghost">
                        Share
                      </Button>
                    </HStack>
                  </VStack>
                  
                  <VStack align="end" spacing={2}>
                    <Text fontSize="sm" color={mutedColor}>
                      Wallet Balance
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {parseFloat(balance || 0).toFixed(4)} ETH
                    </Text>
                  </VStack>
                </Flex>
              </CardBody>
            </Card>
          </MotionBox>



          {/* Filters and Search */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="center">
                  <InputGroup flex={1}>
                    <InputLeftElement>
                      <FiSearch color={mutedColor} />
                    </InputLeftElement>
                    <Input
                      placeholder="Search your NFTs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                  
                  <HStack spacing={4}>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      w="200px"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="most-liked">Most Liked</option>
                    </Select>
                    
                    <HStack>
                      <Tooltip label="Grid View">
                        <IconButton
                          icon={<FiGrid />}
                          variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                          onClick={() => setViewMode('grid')}
                        />
                      </Tooltip>
                      <Tooltip label="List View">
                        <IconButton
                          icon={<FiList />}
                          variant={viewMode === 'list' ? 'solid' : 'ghost'}
                          onClick={() => setViewMode('list')}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          </MotionBox>

          {/* NFT Tabs */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Tabs index={activeTab} onChange={handleTabChange} variant="soft-rounded" colorScheme="brand">
              <TabList>
                <Tab>All NFTs ({userNFTs?.length || 0})</Tab>
                <Tab>Listed ({userNFTs?.filter(nft => nft.isListed).length || 0})</Tab>
                <Tab>Not Listed ({userNFTs?.filter(nft => !nft.isListed).length || 0})</Tab>
                <Tab>Favorites</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel px={0}>
                  {loading ? (
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} bg={cardBg}>
                          <CardBody>
                            <VStack spacing={4}>
                              <Skeleton height="200px" w="full" borderRadius="lg" />
                              <SkeletonText noOfLines={2} w="full" />
                              <Skeleton height="20px" w="60px" />
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  ) : filteredNFTs.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                      {filteredNFTs.map((nft) => (
                        <MotionBox
                          key={nft.tokenId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -5 }}
                        >
                          <Card
                            bg={cardBg}
                            border="1px"
                            borderColor={borderColor}
                            overflow="hidden"
                            cursor="pointer"
                            onClick={() => navigate(`/nft/${nft.tokenId}`)}
                            _hover={{ shadow: 'lg', borderColor: 'brand.300' }}
                            transition="all 0.2s"
                            position="relative"
                          >
                            {/* Action Menu */}
                            <Box position="absolute" top={2} right={2} zIndex={1}>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  icon={<FiMoreVertical />}
                                  variant="ghost"
                                  size="sm"
                                  bg={cardBg}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <MenuList>
                                  <MenuItem
                                    icon={<FiEye />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/nft/${nft.tokenId}`);
                                    }}
                                  >
                                    View Details
                                  </MenuItem>
                                  {nft.isListed ? (
                                    <MenuItem
                                      icon={<FiTrash2 />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNFT(nft);
                                        onDelistOpen();
                                      }}
                                    >
                                      Remove from Sale
                                    </MenuItem>
                                  ) : (
                                    <MenuItem
                                      icon={<FiTag />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNFT(nft);
                                        onListOpen();
                                      }}
                                    >
                                      List for Sale
                                    </MenuItem>
                                  )}
                                  <MenuItem icon={<FiShare2 />}>Share</MenuItem>
                                </MenuList>
                              </Menu>
                            </Box>
                            
                            <NFTCard nft={nft} showActions={false} />
                            
                            {/* Status Badge */}
                            <Box position="absolute" top={2} left={2}>
                              {nft.isListed ? (
                                <Badge colorScheme="green">Listed</Badge>
                              ) : (
                                <Badge colorScheme="gray">Not Listed</Badge>
                              )}
                            </Box>
                          </Card>
                        </MotionBox>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <VStack spacing={6} py={16} textAlign="center">
                      <Text fontSize="6xl">🖼️</Text>
                      <Heading size="lg">No NFTs Found</Heading>
                      <Text color={textColor} maxW="400px">
                        {searchQuery
                          ? `No NFTs match your search "${searchQuery}"`
                          : "You don't have any NFTs yet. Start by creating your first NFT!"}
                      </Text>
                      {!searchQuery && (
                        <Button variant="gradient" onClick={() => navigate('/create')}>
                          Create Your First NFT
                        </Button>
                      )}
                    </VStack>
                  )}
                </TabPanel>
                
                {/* Listed NFTs Tab */}
                <TabPanel px={0}>
                  {/* Same content as All NFTs but filtered */}
                </TabPanel>
                
                {/* Not Listed NFTs Tab */}
                <TabPanel px={0}>
                  {/* Same content as All NFTs but filtered */}
                </TabPanel>
                
                {/* Favorites Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} py={16} textAlign="center">
                    <Text fontSize="6xl">❤️</Text>
                    <Heading size="lg">No Favorites Yet</Heading>
                    <Text color={textColor} maxW="400px">
                      Your favorite NFTs will appear here. Start exploring the marketplace to find NFTs you love!
                    </Text>
                    <Button variant="gradient" onClick={() => navigate('/marketplace')}>
                      Explore Marketplace
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </MotionBox>
        </VStack>
      </Container>

      {/* List NFT Modal */}
      <Modal isOpen={isListOpen} onClose={onListClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>List NFT for Sale</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedNFT && (
              <VStack spacing={4}>
                <img
                  src={selectedNFT.image}
                  alt={selectedNFT.name}
                  style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <Text fontWeight="bold" fontSize="lg">{selectedNFT.name}</Text>
                
                <FormControl>
                  <FormLabel>Price (ETH)</FormLabel>
                  <NumberInput value={listPrice} onChange={setListPrice} min={0} step={0.01}>
                    <NumberInputField placeholder="Enter price in ETH" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Marketplace Fee</AlertTitle>
                    <AlertDescription>
                      A 2.5% marketplace fee will be deducted from the sale price.
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onListClose}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleList} isLoading={loading}>
              List NFT
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delist NFT Modal */}
      <Modal isOpen={isDelistOpen} onClose={onDelistClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Remove from Sale</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedNFT && (
              <VStack spacing={4}>
                <img
                  src={selectedNFT.image}
                  alt={selectedNFT.name}
                  style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <Text fontWeight="bold" fontSize="lg">{selectedNFT.name}</Text>
                <Text textAlign="center" color={textColor}>
                  Are you sure you want to remove this NFT from the marketplace?
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDelistClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelist} isLoading={loading}>
              Remove from Sale
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;