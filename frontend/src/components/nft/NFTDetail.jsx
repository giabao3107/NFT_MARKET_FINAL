import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  IconButton,
  Tooltip,
  useColorModeValue,
  useBreakpointValue,
  Flex,
  Spacer,
  Divider,
  Avatar,
  AvatarGroup,
  Progress,
  Link,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Skeleton,
  SkeletonText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup
} from '@chakra-ui/react';
import ImageWithFallback from '../ImageWithFallback';
import {
  FiHeart,
  FiShare2,
  FiMoreVertical,
  FiEye,
  FiShoppingCart,
  FiTag,
  FiEdit3,
  FiTrash2,
  FiExternalLink,
  FiCopy,
  FiDownload,
  FiFlag,
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiUser,
  FiDollarSign,
  FiZap,
  FiGift,
  FiRefreshCw,
  FiActivity,
  FiBarChart,
  FiInfo,
  FiLayers,
  FiCalendar,
  FiGlobe,
  FiTwitter,
  FiInstagram,
  FiMessageCircle,
  FiThumbsUp,
  FiThumbsDown
} from 'react-icons/fi';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFTContext } from '../../contexts/NFTContext';
import { useCustomToast } from '../common/Toast';
import { useNFTOperations, useFavorites, useLocalStorage } from '../../hooks';
import { formatEther, formatAddress } from '../../utils/web3';
import { formatDateTime, formatCurrency, copyToClipboard } from '../../utils/helpers';
import { IPFS_GATEWAY, ETHERSCAN_URL } from '../../utils/constants';

/**
 * NFT Detail Component
 */
const NFTDetail = ({ nft, onClose, ...props }) => {
  const { account } = useWeb3();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [priceHistory, setPriceHistory] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { favorites, toggleFavorite } = useFavorites();
  const { addToRecentlyViewed } = useLocalStorage();
  const toast = useCustomToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  const isFavorited = favorites.includes(nft.tokenId);
  const isOwner = account && nft.owner?.toLowerCase() === account.toLowerCase();
  
  useEffect(() => {
    if (nft) {
      addToRecentlyViewed(nft);
      // Load additional data
      loadNFTData();
    }
  }, [nft]);
  
  const loadNFTData = async () => {
    setLoading(true);
    try {
      // Load price history, offers, activities
      // This would be API calls in a real implementation
      await Promise.all([
        loadPriceHistory(),
        loadOffers(),
        loadActivities()
      ]);
    } catch (error) {
      console.error('Error loading NFT data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadPriceHistory = async () => {
    // Fetch price history from blockchain events or API
    setPriceHistory([
      { date: '2024-01-15', price: '0.5', event: 'Sale' },
      { date: '2024-01-10', price: '0.3', event: 'Listed' },
      { date: '2024-01-05', price: '0.2', event: 'Minted' }
    ]);
  };
  
  const loadOffers = async () => {
    // Fetch active offers from marketplace contract
    setOffers([
      {
        id: '1',
        from: '0x1234...5678',
        amount: '0.4',
        expiration: '2024-02-01',
        status: 'active'
      }
    ]);
  };
  
  const loadActivities = async () => {
    // Fetch activity history from blockchain events
    setActivities([
      {
        id: '1',
        type: 'sale',
        from: '0x1234...5678',
        to: '0x8765...4321',
        price: '0.5',
        date: '2024-01-15',
        txHash: '0xabcd...efgh'
      }
    ]);
  };
  
  const handleFavoriteToggle = () => {
    toggleFavorite(nft.tokenId);
    toast.info(
      isFavorited ? 'Removed from favorites' : 'Added to favorites',
      nft.name
    );
  };
  
  const handleShare = () => {
    const url = `${window.location.origin}/nft/${nft.contractAddress}/${nft.tokenId}`;
    copyToClipboard(url);
    toast.success('Copied', 'NFT link copied to clipboard');
  };
  
  const getImageSrc = () => {
    if (!nft.image) return null; // No placeholder, return null if no image
    
    // Use the convertIpfsToHttp function for proper IPFS URL conversion
    const { convertIpfsToHttp } = require('../../utils/ipfs');
    return convertIpfsToHttp(nft.image);
  };
  
  if (!nft) {
    return (
      <Box p={8} textAlign="center">
        <Text>NFT not found</Text>
      </Box>
    );
  }
  
  return (
    <Box {...props}>
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        gap={8}
        maxW="7xl"
        mx="auto"
        p={6}
      >
        {/* Left Column - Image and Media */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Main Image */}
            <Box position="relative" borderRadius="xl" overflow="hidden">
              {!imageLoaded && (
                <Skeleton height="500px" borderRadius="xl" />
              )}
              
              <ImageWithFallback
                src={getImageSrc()}
                alt={nft.name}
                w="full"
                maxH="500px"
                objectFit="cover"
                onLoad={() => setImageLoaded(true)}
                borderRadius="xl"
              />
              
              {/* Image Actions */}
              <Box position="absolute" top={4} right={4}>
                <HStack spacing={2}>
                  <Tooltip label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
                    <IconButton
                      size="md"
                      variant="solid"
                      colorScheme={isFavorited ? 'red' : 'gray'}
                      icon={<FiHeart fill={isFavorited ? 'currentColor' : 'none'} />}
                      onClick={handleFavoriteToggle}
                      bg={isFavorited ? 'red.500' : 'whiteAlpha.900'}
                      color={isFavorited ? 'white' : 'gray.600'}
                      _hover={{
                        bg: isFavorited ? 'red.600' : 'whiteAlpha.800'
                      }}
                    />
                  </Tooltip>
                  
                  <Tooltip label="Share">
                    <IconButton
                      size="md"
                      variant="solid"
                      bg="whiteAlpha.900"
                      color="gray.600"
                      icon={<FiShare2 />}
                      onClick={handleShare}
                      _hover={{ bg: 'whiteAlpha.800' }}
                    />
                  </Tooltip>
                  
                  <Tooltip label="View on IPFS">
                    <IconButton
                      size="md"
                      variant="solid"
                      bg="whiteAlpha.900"
                      color="gray.600"
                      icon={<FiExternalLink />}
                      as={Link}
                      href={getImageSrc()}
                      isExternal
                      _hover={{ bg: 'whiteAlpha.800' }}
                    />
                  </Tooltip>
                </HStack>
              </Box>
            </Box>
            
            {/* NFT Properties */}
            {nft.attributes && nft.attributes.length > 0 && (
              <NFTProperties attributes={nft.attributes} />
            )}
          </VStack>
        </GridItem>
        
        {/* Right Column - Details and Actions */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <VStack spacing={4} align="start">
              {/* Collection */}
              {nft.collection && (
                <HStack spacing={2}>
                  <Avatar size="sm" name={nft.collection.name} src={nft.collection.image} />
                  <Link
                    href={`/collection/${nft.collection.address}`}
                    color="blue.500"
                    fontWeight="medium"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {nft.collection.name}
                  </Link>
                  {nft.collection.verified && (
                    <Badge colorScheme="blue" variant="solid">
                      ✓
                    </Badge>
                  )}
                </HStack>
              )}
              
              {/* Title */}
              <Text fontSize="3xl" fontWeight="bold">
                {nft.name || `NFT #${nft.tokenId}`}
              </Text>
              
              {/* Description */}
              {nft.description && (
                <Text color="gray.600" lineHeight="tall">
                  {nft.description}
                </Text>
              )}
              
              {/* Owner */}
              <HStack spacing={3}>
                <Avatar size="sm" name={nft.owner} />
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" color="gray.500">
                    Owned by
                  </Text>
                  <Link
                    href={`/profile/${nft.owner}`}
                    color="blue.500"
                    fontWeight="medium"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {formatAddress(nft.owner)}
                  </Link>
                </VStack>
              </HStack>
            </VStack>
            
            {/* Stats */}
            <NFTStats nft={nft} />
            
            {/* Price and Actions */}
            <NFTPriceAndActions nft={nft} isOwner={isOwner} />
            
            {/* Tabs */}
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
              <TabList>
                <Tab>Details</Tab>
                <Tab>Price History</Tab>
                <Tab>Offers</Tab>
                <Tab>Activity</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel px={0}>
                  <NFTDetailsTab nft={nft} />
                </TabPanel>
                
                <TabPanel px={0}>
                  <NFTPriceHistoryTab
                    priceHistory={priceHistory}
                    loading={loading}
                  />
                </TabPanel>
                
                <TabPanel px={0}>
                  <NFTOffersTab
                    offers={offers}
                    nft={nft}
                    isOwner={isOwner}
                    loading={loading}
                  />
                </TabPanel>
                
                <TabPanel px={0}>
                  <NFTActivityTab
                    activities={activities}
                    loading={loading}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};

/**
 * NFT Properties Component
 */
const NFTProperties = ({ attributes }) => {
  return (
    <Card>
      <CardHeader>
        <Text fontSize="lg" fontWeight="bold">
          Properties
        </Text>
      </CardHeader>
      <CardBody>
        <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={3}>
          {attributes.map((attr, index) => (
            <Box
              key={index}
              p={3}
              bg="gray.50"
              borderRadius="md"
              textAlign="center"
            >
              <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                {attr.trait_type}
              </Text>
              <Text fontSize="sm" fontWeight="medium" mt={1}>
                {attr.value}
              </Text>
              {attr.rarity && (
                <Text fontSize="xs" color="blue.500" mt={1}>
                  {attr.rarity}% rare
                </Text>
              )}
            </Box>
          ))}
        </Grid>
      </CardBody>
    </Card>
  );
};

/**
 * NFT Stats Component
 */
const NFTStats = ({ nft }) => {
  return (
    <StatGroup>
      <Stat>
        <StatLabel>Views</StatLabel>
        <StatNumber>{nft.views || 0}</StatNumber>
      </Stat>
      
      <Stat>
        <StatLabel>Likes</StatLabel>
        <StatNumber>{nft.likes || 0}</StatNumber>
      </Stat>
      
      {nft.lastSale && (
        <Stat>
          <StatLabel>Last Sale</StatLabel>
          <StatNumber>{formatEther(nft.lastSale)} ETH</StatNumber>
        </Stat>
      )}
    </StatGroup>
  );
};

/**
 * NFT Price and Actions Component
 */
const NFTPriceAndActions = ({ nft, isOwner }) => {
  const { buyNFT, listNFT, delistNFT } = useNFTOperations();
  const [loading, setLoading] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const toast = useCustomToast();
  
  const handleBuy = async () => {
    setLoading(true);
    try {
      await buyNFT(nft.listingId, nft.price);
      toast.success('Success', 'NFT purchased successfully!');
    } catch (error) {
      toast.error('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Current Price */}
          {nft.price && (
            <VStack spacing={1} align="start">
              <Text fontSize="sm" color="gray.500">
                Current Price
              </Text>
              <HStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold">
                  {formatEther(nft.price)} ETH
                </Text>
                <Text fontSize="lg" color="gray.500">
                  (${formatCurrency(parseFloat(formatEther(nft.price)) * 2000)})
                </Text>
              </HStack>
            </VStack>
          )}
          
          {/* Actions */}
          <HStack spacing={3}>
            {isOwner ? (
              <>
                {nft.isListed ? (
                  <Button
                    leftIcon={<FiTrash2 />}
                    colorScheme="red"
                    variant="outline"
                    flex={1}
                    onClick={() => delistNFT(nft.contractAddress, nft.tokenId)}
                  >
                    Delist
                  </Button>
                ) : (
                  <Button
                    leftIcon={<FiTag />}
                    colorScheme="blue"
                    flex={1}
                    onClick={() => setShowListModal(true)}
                  >
                    List for Sale
                  </Button>
                )}
                
                <Button
                  leftIcon={<FiGift />}
                  variant="outline"
                  flex={1}
                >
                  Transfer
                </Button>
              </>
            ) : (
              <>
                {nft.isListed && (
                  <Button
                    leftIcon={<FiShoppingCart />}
                    colorScheme="blue"
                    size="lg"
                    flex={1}
                    isLoading={loading}
                    onClick={handleBuy}
                  >
                    Buy Now
                  </Button>
                )}
                
                <Button
                  leftIcon={<FiDollarSign />}
                  variant="outline"
                  size="lg"
                  flex={1}
                  onClick={() => setShowOfferModal(true)}
                >
                  Make Offer
                </Button>
              </>
            )}
          </HStack>
        </VStack>
      </CardBody>
      
      {/* List Modal */}
      <ListNFTModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        nft={nft}
      />
      
      {/* Offer Modal */}
      <MakeOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        nft={nft}
      />
    </Card>
  );
};

/**
 * NFT Details Tab
 */
const NFTDetailsTab = ({ nft }) => {
  return (
    <VStack spacing={4} align="stretch">
      <Accordion allowMultiple defaultIndex={[0]}>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text fontWeight="medium">Contract Details</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text color="gray.500">Contract Address</Text>
                <Link
                  href={`${ETHERSCAN_URL}/address/${nft.contractAddress}`}
                  isExternal
                  color="blue.500"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {formatAddress(nft.contractAddress)}
                </Link>
              </HStack>
              
              <HStack justify="space-between">
                <Text color="gray.500">Token ID</Text>
                <Text fontWeight="medium">{nft.tokenId}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text color="gray.500">Token Standard</Text>
                <Badge>{nft.tokenStandard || 'ERC-721'}</Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text color="gray.500">Blockchain</Text>
                <Badge colorScheme="blue">Ethereum</Badge>
              </HStack>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
        
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text fontWeight="medium">Metadata</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <VStack spacing={3} align="stretch">
              {nft.metadataUri && (
                <HStack justify="space-between">
                  <Text color="gray.500">Metadata URI</Text>
                  <Link
                    href={nft.metadataUri}
                    isExternal
                    color="blue.500"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    View Metadata
                  </Link>
                </HStack>
              )}
              
              <HStack justify="space-between">
                <Text color="gray.500">Created</Text>
                <Text>{formatDateTime(nft.createdAt)}</Text>
              </HStack>
              
              {nft.creator && (
                <HStack justify="space-between">
                  <Text color="gray.500">Creator</Text>
                  <Link
                    href={`/profile/${nft.creator}`}
                    color="blue.500"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {formatAddress(nft.creator)}
                  </Link>
                </HStack>
              )}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  );
};

/**
 * NFT Price History Tab
 */
const NFTPriceHistoryTab = ({ priceHistory, loading }) => {
  if (loading) {
    return (
      <VStack spacing={4}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} height="60px" />
        ))}
      </VStack>
    );
  }
  
  if (priceHistory.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No price history available</Text>
      </Box>
    );
  }
  
  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Event</Th>
            <Th>Price</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {priceHistory.map((item, index) => (
            <Tr key={index}>
              <Td>
                <Badge
                  colorScheme={
                    item.event === 'Sale' ? 'green' :
                    item.event === 'Listed' ? 'blue' : 'gray'
                  }
                >
                  {item.event}
                </Badge>
              </Td>
              <Td fontWeight="medium">{item.price} ETH</Td>
              <Td color="gray.500">{formatDateTime(item.date)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

/**
 * NFT Offers Tab
 */
const NFTOffersTab = ({ offers, nft, isOwner, loading }) => {
  if (loading) {
    return (
      <VStack spacing={4}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} height="80px" />
        ))}
      </VStack>
    );
  }
  
  if (offers.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No offers yet</Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Be the first to make an offer!
        </Text>
      </Box>
    );
  }
  
  return (
    <VStack spacing={4} align="stretch">
      {offers.map((offer) => (
        <Card key={offer.id}>
          <CardBody>
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Avatar size="sm" name={offer.from} />
                <VStack spacing={0} align="start">
                  <Text fontWeight="medium">{offer.amount} ETH</Text>
                  <Text fontSize="sm" color="gray.500">
                    by {formatAddress(offer.from)}
                  </Text>
                </VStack>
              </HStack>
              
              <VStack spacing={0} align="end">
                <Text fontSize="sm" color="gray.500">
                  Expires {formatDateTime(offer.expiration)}
                </Text>
                {isOwner && offer.status === 'active' && (
                  <HStack spacing={2} mt={2}>
                    <Button size="sm" colorScheme="green">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline">
                      Counter
                    </Button>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
};

/**
 * NFT Activity Tab
 */
const NFTActivityTab = ({ activities, loading }) => {
  if (loading) {
    return (
      <VStack spacing={4}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} height="60px" />
        ))}
      </VStack>
    );
  }
  
  if (activities.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No activity yet</Text>
      </Box>
    );
  }
  
  return (
    <VStack spacing={4} align="stretch">
      {activities.map((activity) => (
        <HStack key={activity.id} spacing={4} p={4} bg="gray.50" borderRadius="md">
          <Box>
            {activity.type === 'sale' && <FiShoppingCart />}
            {activity.type === 'transfer' && <FiGift />}
            {activity.type === 'list' && <FiTag />}
          </Box>
          
          <VStack spacing={0} align="start" flex={1}>
            <Text fontWeight="medium">
              {activity.type === 'sale' && 'Sale'}
              {activity.type === 'transfer' && 'Transfer'}
              {activity.type === 'list' && 'Listed'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {activity.from && `From ${formatAddress(activity.from)}`}
              {activity.to && ` to ${formatAddress(activity.to)}`}
            </Text>
          </VStack>
          
          <VStack spacing={0} align="end">
            {activity.price && (
              <Text fontWeight="medium">{activity.price} ETH</Text>
            )}
            <Text fontSize="sm" color="gray.500">
              {formatDateTime(activity.date)}
            </Text>
          </VStack>
          
          {activity.txHash && (
            <Link
              href={`${ETHERSCAN_URL}/tx/${activity.txHash}`}
              isExternal
            >
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FiExternalLink />}
                aria-label="View transaction"
              />
            </Link>
          )}
        </HStack>
      ))}
    </VStack>
  );
};

/**
 * List NFT Modal
 */
const ListNFTModal = ({ isOpen, onClose, nft }) => {
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('7');
  const [loading, setLoading] = useState(false);
  const { listNFT } = useNFTOperations();
  const toast = useCustomToast();
  
  const handleList = async () => {
    if (!price) {
      toast.error('Error', 'Please enter a price');
      return;
    }
    
    setLoading(true);
    try {
      await listNFT(nft.contractAddress, nft.tokenId, price);
      toast.success('Success', 'NFT listed successfully!');
      onClose();
    } catch (error) {
      toast.error('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>List NFT for Sale</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Price (ETH)</FormLabel>
              <NumberInput value={price} onChange={setPrice}>
                <NumberInputField placeholder="0.0" />
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Duration</FormLabel>
              <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleList}
            isLoading={loading}
          >
            List NFT
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

/**
 * Make Offer Modal
 */
const MakeOfferModal = ({ isOpen, onClose, nft }) => {
  const [amount, setAmount] = useState('');
  const [expiration, setExpiration] = useState('7');
  const [loading, setLoading] = useState(false);
  const toast = useCustomToast();
  
  const handleMakeOffer = async () => {
    if (!amount) {
      toast.error('Error', 'Please enter an offer amount');
      return;
    }
    
    setLoading(true);
    try {
      // Make offer logic here
      toast.success('Success', 'Offer submitted successfully!');
      onClose();
    } catch (error) {
      toast.error('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Make an Offer</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Offer Amount (ETH)</FormLabel>
              <NumberInput value={amount} onChange={setAmount}>
                <NumberInputField placeholder="0.0" />
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Offer Expiration</FormLabel>
              <Select value={expiration} onChange={(e) => setExpiration(e.target.value)}>
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleMakeOffer}
            isLoading={loading}
          >
            Make Offer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NFTDetail;
export {
  NFTProperties,
  NFTStats,
  NFTPriceAndActions,
  NFTDetailsTab,
  NFTPriceHistoryTab,
  NFTOffersTab,
  NFTActivityTab,
  ListNFTModal,
  MakeOfferModal
};