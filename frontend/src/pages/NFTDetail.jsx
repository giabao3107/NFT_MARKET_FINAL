import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Image,
  Card,
  CardBody,
  Flex,
  Badge,
  Avatar,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  useToast,
  Skeleton,
  SkeletonText,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Icon,
  Link,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  FiHeart,
  FiShare2,
  FiExternalLink,
  FiCopy,
  FiEye,
  FiTag,
  FiClock,
  FiTrendingUp,
  FiUser,
  FiGlobe,
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { useNFT } from '../contexts/NFTContext';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { formatEther } from 'ethers';
import { motion } from 'framer-motion';
import { convertIpfsToHttp, getFallbackUrls } from '../utils/ipfs';
import ImageWithFallback from '../components/ImageWithFallback';
import { useNFTOperations } from '../hooks/useNFTOperations';
import { ETHERSCAN_URL } from '../utils/constants';

const MotionBox = motion(Box);

const NFTDetail = () => {
  const { id: tokenId } = useParams();
  const navigate = useNavigate();
  const { loading: contextLoading, fetchNFTMetadata, contracts, fetchMetadata } = useNFT();
  const { purchaseNFT, listNFTForSale, updateNFTPrice, removeNFTFromSale } = useNFTOperations();
  const { isConnected, account } = useWeb3();
  const toast = useToast();
  
  const [nft, setNft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  
  const { isOpen: isBuyOpen, onOpen: onBuyOpen, onClose: onBuyClose } = useDisclosure();
  const { isOpen: isListOpen, onOpen: onListOpen, onClose: onListClose } = useDisclosure();
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();
  const { isOpen: isRemoveOpen, onOpen: onRemoveOpen, onClose: onRemoveClose } = useDisclosure();

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  const loadNFT = async () => {
    try {
      setIsLoading(true);
      
      // Wait for contracts to be initialized
      if (!contracts.nftCollection || !contracts.nftMarketplace) {
        console.log('Contracts not yet initialized, waiting...');
        return;
      }

      // Get NFT metadata from blockchain
      const tokenURI = await contracts.nftCollection.tokenURI(tokenId);
      const metadata = await fetchMetadata(tokenURI);
      const owner = await contracts.nftCollection.ownerOf(tokenId);
      const creator = await contracts.nftCollection.getCreator(tokenId);
      const royaltyInfo = await contracts.nftCollection.getRoyaltyInfo(tokenId);
      
      // Check if NFT is listed on marketplace
      let listingInfo = null;
      try {
        const activeListings = await contracts.nftMarketplace.getActiveListings();
        for (const listingId of activeListings) {
          const listing = await contracts.nftMarketplace.listings(listingId);
          if (Number(listing.tokenId) === Number(tokenId)) {
            listingInfo = {
              listingId: Number(listingId),
              price: ethers.formatEther(listing.price),
              seller: listing.seller,
              isListed: true
            };
            break;
          }
        }
      } catch (error) {
        console.log('No active listing found for this NFT');
      }
      
      // Process image URL with improved IPFS handling
      let imageUrl = metadata.image;
      if (imageUrl) {
        // Convert IPFS URLs to HTTP using Pinata gateway
        imageUrl = convertIpfsToHttp(imageUrl);
      }
      // No placeholder image - only use real images from IPFS
      
      const nftData = {
        tokenId: Number(tokenId),
        name: metadata.name || `NFT #${tokenId}`,
        description: metadata.description || 'No description available',
        image: imageUrl,
        creator: {
          address: creator,
          name: creator === account ? 'You' : `${creator.slice(0, 6)}...${creator.slice(-4)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator}`,
          verified: false,
        },
        owner: {
          address: owner,
          name: owner === account ? 'You' : `${owner.slice(0, 6)}...${owner.slice(-4)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${owner}`,
        },
        price: listingInfo?.price || '0',
        currency: 'ETH',
        isListed: !!listingInfo,
        listingId: listingInfo?.listingId,
        seller: listingInfo?.seller,
        category: 'Digital Art',
        royalty: Number(royaltyInfo[1]) / 100, // Convert basis points to percentage
        views: 0, // This would need to be tracked separately
        likes: 0, // This would need to be tracked separately
        attributes: metadata.attributes || [],
        blockchain: 'Ethereum',
        tokenStandard: 'ERC-721',
        contractAddress: contracts.nftCollection.target || contracts.nftCollection.address,
      };
      
      // Get transaction history from blockchain events
      // This is a simplified version - in production you'd want to query events more efficiently
      const transferFilter = contracts.nftCollection.filters.Transfer(null, null, tokenId);
      const transferEvents = await contracts.nftCollection.queryFilter(transferFilter);
      
      const history = await Promise.all(
        transferEvents.map(async (event) => {
          const block = await event.getBlock();
          const isMint = event.args[0] === ethers.ZeroAddress;
          
          return {
            type: isMint ? 'Minted' : 'Transfer',
            from: isMint ? null : event.args[0],
            to: event.args[1],
            price: null, // Would need to correlate with marketplace events for sale prices
            date: new Date(block.timestamp * 1000),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          };
        })
      );
      
      setNft(nftData);
      setTransactionHistory(history.reverse()); // Show most recent first
    } catch (error) {
      console.error('Error loading NFT:', error);
      toast({
        title: 'Error Loading NFT',
        description: 'Failed to load NFT details. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenId && contracts.nftCollection && contracts.nftMarketplace) {
      loadNFT();
    }
  }, [tokenId, account, toast, contracts.nftCollection, contracts.nftMarketplace, fetchMetadata]);

  const handleBuy = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to purchase NFTs.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      if (!nft.listingId) {
        throw new Error('NFT is not listed for sale');
      }
      await purchaseNFT(nft.listingId, nft.price);
      toast({
        title: 'Purchase Successful!',
        description: `You have successfully purchased ${nft.name}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onBuyClose();
      // Refresh NFT data by reloading from blockchain
      loadNFT();
    } catch (error) {
      console.error('Error buying NFT:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to purchase NFT. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleList = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to list NFTs.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

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

    setLoading(true);
    try {
      const isUpdate = nft.isListed;
      
      if (isUpdate) {
        // Update existing listing price
        await updateNFTPrice(nft.listingId, listPrice);
        toast({
          title: 'Price Updated Successfully!',
          description: `Your NFT price has been updated to ${listPrice} ETH.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // List NFT for the first time
        await listNFTForSale(tokenId, listPrice);
        toast({
          title: 'NFT Listed Successfully!',
          description: `Your NFT is now listed for ${listPrice} ETH.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      onListClose();
      setListPrice('');
      // Refresh NFT data by reloading from blockchain
      loadNFT();
    } catch (error) {
      console.error('Error with NFT listing:', error);
      
      let errorMessage = 'Failed to process request. Please try again.';
      
      if (error.message?.includes('User denied')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees.';
      } else if (error.message?.includes('not approved')) {
        errorMessage = 'Please approve the marketplace contract first.';
      }
      
      toast({
        title: nft.isListed ? 'Price Update Failed' : 'Listing Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };



  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied!',
      description: 'NFT link has been copied to clipboard.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onShareClose();
  };

  const handleRemoveListing = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to remove listing.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!nft.listingId) {
      toast({
        title: 'Error',
        description: 'NFT is not currently listed.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await removeNFTFromSale(nft.listingId);
      
      // Refresh NFT data after successful removal
      await loadNFT();
      
      onRemoveClose();
    } catch (error) {
      console.error('Remove listing error:', error);
      toast({
        title: 'Remove Listing Failed',
        description: error.message || 'Failed to remove NFT from marketplace',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatPrice = (price) => {
    if (!price || price === '0') return '0';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '0';
    
    // If the number is very small (less than 0.0001), show more decimal places
    if (numPrice < 0.0001 && numPrice > 0) {
      return numPrice.toFixed(8);
    }
    
    // For normal numbers, show up to 4 decimal places but remove trailing zeros
    return parseFloat(numPrice.toFixed(4)).toString();
  };

  // Show loading state when contracts are not initialized or NFT is loading
  if (isLoading || !contracts.nftCollection || !contracts.nftMarketplace) {
    return (
      <Box minH="100vh" bg={bg}>
        <Container maxW="7xl" py={8}>
          <VStack spacing={8} textAlign="center">
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <VStack spacing={2}>
              <Heading size="lg">Loading NFT Details</Heading>
              <Text color={textColor}>
                {!contracts.nftCollection || !contracts.nftMarketplace 
                  ? 'Initializing blockchain connection...' 
                  : 'Fetching NFT data from blockchain...'}
              </Text>
            </VStack>
          </VStack>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mt={8}>
            <Skeleton height="600px" borderRadius="xl" />
            <VStack spacing={6} align="stretch">
              <SkeletonText noOfLines={2} spacing={4} />
              <Skeleton height="100px" />
              <Skeleton height="200px" />
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>
    );
  }

  if (!nft) {
    return (
      <Box minH="100vh" bg={bg}>
        <Container maxW="4xl" py={16}>
          <VStack spacing={8} textAlign="center">
            <Text fontSize="6xl">🖼️</Text>
            <Heading size="xl">NFT Not Found</Heading>
            <Text color={textColor} fontSize="lg">
              The NFT you're looking for doesn't exist or has been removed.
            </Text>
            <Button variant="gradient" onClick={() => navigate('/marketplace')}>
              Browse Marketplace
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  const isOwner = account && account.toLowerCase() === nft.owner.address.toLowerCase();

  return (
    <Box minH="100vh" bg={bg}>
      <Container maxW="7xl" py={8}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Left Column - Image */}
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card bg={cardBg} border="1px" borderColor={borderColor} overflow="hidden">
              <CardBody p={0}>
                <ImageWithFallback
                  src={nft.image}
                  alt={nft.name}
                  width="full"
                  height="600px"
                  objectFit="cover"
                  loading="lazy"
                  fallbackText="Image not available"
                  onLoad={() => {
                    console.log('Image loaded successfully:', nft.image);
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', nft.image);
                    console.error('Error details:', e);
                  }}
                />
              </CardBody>
            </Card>
          </MotionBox>

          {/* Right Column - Details */}
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <VStack spacing={6} align="stretch">
              {/* Header */}
              <VStack spacing={4} align="start">
                <HStack justify="space-between" w="full">
                  <Badge colorScheme="purple" fontSize="sm">
                    {nft.category}
                  </Badge>
                  <HStack spacing={2}>
                    <Tooltip label="Views">
                      <HStack spacing={1} color={mutedColor}>
                        <Icon as={FiEye} />
                        <Text fontSize="sm">{nft.views}</Text>
                      </HStack>
                    </Tooltip>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiHeart />}
                      color={isLiked ? 'red.500' : mutedColor}
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      {nft.likes + (isLiked ? 1 : 0)}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FiShare2 />}
                      onClick={onShareOpen}
                    >
                      Share
                    </Button>
                  </HStack>
                </HStack>
                
                <Heading size="xl">{nft.name}</Heading>
                <Text color={textColor} fontSize="lg">
                  {nft.description}
                </Text>
              </VStack>

              {/* Creator & Owner */}
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack spacing={2} align="start">
                      <Text fontSize="sm" color={mutedColor}>
                        Creator
                      </Text>
                      <HStack>
                        <Avatar size="sm" src={nft.creator.avatar} />
                        <VStack spacing={0} align="start">
                          <HStack>
                            <Text fontWeight="bold" fontSize="sm">
                              {nft.creator.name}
                            </Text>
                            {nft.creator.verified && (
                              <Badge colorScheme="blue" size="sm">
                                ✓
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="xs" color={mutedColor}>
                            {formatAddress(nft.creator.address)}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                    
                    <VStack spacing={2} align="start">
                      <Text fontSize="sm" color={mutedColor}>
                        Owner
                      </Text>
                      <HStack>
                        <Avatar size="sm" src={nft.owner.avatar} />
                        <VStack spacing={0} align="start">
                          <Text fontWeight="bold" fontSize="sm">
                            {isOwner ? 'You' : nft.owner.name}
                          </Text>
                          <Text fontSize="xs" color={mutedColor}>
                            {formatAddress(nft.owner.address)}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Price & Actions */}
              {nft.isListed ? (
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <VStack spacing={1} align="start">
                        <Text fontSize="sm" color={mutedColor}>
                          Current Price
                        </Text>
                        <HStack>
                          <Text fontSize="3xl" fontWeight="bold">
                            {formatPrice(nft.price)}
                          </Text>
                          <Text fontSize="xl" color={mutedColor}>
                            {nft.currency}
                          </Text>
                        </HStack>
                      </VStack>
                      
                      {!isOwner ? (
                        <Button
                          variant="gradient"
                          size="lg"
                          leftIcon={<FiTag />}
                          onClick={onBuyOpen}
                          isDisabled={!isConnected}
                        >
                          {isConnected ? 'Buy Now' : 'Connect Wallet'}
                        </Button>
                      ) : (
                        <HStack spacing={3}>
                          <Button
                            variant="outline"
                            size="lg"
                            leftIcon={<FiTrendingUp />}
                            onClick={onListOpen}
                            flex={1}
                          >
                            Update Price
                          </Button>
                          <Button
                            variant="ghost"
                            size="lg"
                            colorScheme="red"
                            flex={1}
                            onClick={onRemoveOpen}
                            isDisabled={!isConnected}
                          >
                            Remove Listing
                          </Button>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ) : (
                isOwner && (
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" color={mutedColor}>
                            Status
                          </Text>
                          <Badge colorScheme="gray" fontSize="md" p={2}>
                            Not Listed
                          </Badge>
                        </VStack>
                        
                        <Button
                          variant="gradient"
                          size="lg"
                          leftIcon={<FiTag />}
                          onClick={onListOpen}
                          isDisabled={!isConnected}
                        >
                          {isConnected ? 'List for Sale' : 'Connect Wallet to List'}
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                )
              )}

              {/* Tabs */}
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Tabs variant="soft-rounded" colorScheme="brand">
                    <TabList>
                      <Tab>Properties</Tab>
                      <Tab>Details</Tab>
                      <Tab>History</Tab>
                    </TabList>
                    
                    <TabPanels>
                      {/* Properties */}
                      <TabPanel px={0}>
                        <SimpleGrid columns={2} spacing={3}>
                          {nft.attributes.map((attr, index) => (
                            <Card key={index} size="sm" bg={bg}>
                              <CardBody textAlign="center">
                                <Text fontSize="xs" color={mutedColor} textTransform="uppercase">
                                  {attr.trait_type}
                                </Text>
                                <Text fontWeight="bold">{attr.value}</Text>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      </TabPanel>
                      
                      {/* Details */}
                      <TabPanel px={0}>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text color={mutedColor}>Contract Address</Text>
                            <HStack>
                              <Text fontSize="sm">{formatAddress(nft.contractAddress)}</Text>
                              <Button size="xs" variant="ghost" leftIcon={<FiExternalLink />}>
                                View
                              </Button>
                            </HStack>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text color={mutedColor}>Token ID</Text>
                            <Text fontSize="sm">{nft.tokenId}</Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text color={mutedColor}>Token Standard</Text>
                            <Text fontSize="sm">{nft.tokenStandard}</Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text color={mutedColor}>Blockchain</Text>
                            <Text fontSize="sm">{nft.blockchain}</Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text color={mutedColor}>Creator Royalty</Text>
                            <Text fontSize="sm">{nft.royalty}%</Text>
                          </HStack>
                        </VStack>
                      </TabPanel>
                      
                      {/* History */}
                      <TabPanel px={0}>
                        <VStack spacing={3} align="stretch">
                          {transactionHistory.map((tx, index) => (
                            <HStack key={index} justify="space-between" p={3} bg={bg} borderRadius="md">
                              <VStack spacing={1} align="start">
                                <HStack>
                                  <Badge colorScheme={tx.type === 'Minted' ? 'green' : 'blue'}>
                                    {tx.type}
                                  </Badge>
                                  {tx.price && (
                                    <Text fontSize="sm" fontWeight="bold">
                                      {formatPrice(tx.price)} ETH
                                    </Text>
                                  )}
                                </HStack>
                                <Text fontSize="xs" color={mutedColor}>
                                  {formatDate(tx.date)}
                                </Text>
                              </VStack>
                              
                              <Button size="xs" variant="ghost" leftIcon={<FiExternalLink />}>
                                View
                              </Button>
                            </HStack>
                          ))}
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </CardBody>
              </Card>
            </VStack>
          </MotionBox>
        </SimpleGrid>
      </Container>

      {/* Buy Modal */}
      <Modal isOpen={isBuyOpen} onClose={onBuyClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Purchase NFT</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Image src={nft.image} alt={nft.name} boxSize="200px" objectFit="cover" borderRadius="lg" />
              <Text fontWeight="bold" fontSize="lg">{nft.name}</Text>
              <Text fontSize="2xl" fontWeight="bold">{formatPrice(nft.price)} {nft.currency}</Text>
              
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Transaction Details</AlertTitle>
                  <AlertDescription>
                    You will pay {formatPrice(nft.price)} ETH plus gas fees. This transaction cannot be undone.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBuyClose}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleBuy} isLoading={loading}>
              Confirm Purchase
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* List Modal */}
      <Modal isOpen={isListOpen} onClose={onListClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{nft?.isListed ? 'Update NFT Price' : 'List NFT for Sale'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Image src={nft?.image} alt={nft?.name} boxSize="200px" objectFit="cover" borderRadius="lg" />
              <Text fontWeight="bold" fontSize="lg">{nft?.name}</Text>
              
              {nft?.isListed && (
                <VStack spacing={2} align="start" w="full">
                  <Text fontSize="sm" color={mutedColor}>
                    Current Price
                  </Text>
                  <Text fontSize="xl" fontWeight="bold">
                    {formatPrice(nft.price)} {nft.currency}
                  </Text>
                </VStack>
              )}
              
              <FormControl>
                <FormLabel>{nft?.isListed ? 'New Price (ETH)' : 'Price (ETH)'}</FormLabel>
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
                  <AlertTitle>{nft?.isListed ? 'Update Fee' : 'Listing Fee'}</AlertTitle>
                  <AlertDescription>
                    {nft?.isListed 
                      ? 'A small gas fee will be required to update your NFT price.'
                      : 'A small gas fee will be required to list your NFT. You will also need to approve the marketplace contract to transfer your NFT.'
                    }
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onListClose}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleList} isLoading={loading}>
              {nft?.isListed ? 'Update Price' : 'List NFT'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={isShareOpen} onClose={onShareClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share NFT</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Share this NFT with others:</Text>
              <Button leftIcon={<FiCopy />} onClick={handleShare} w="full">
                Copy Link
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Remove Listing Modal */}
      <Modal isOpen={isRemoveOpen} onClose={onRemoveClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Remove NFT Listing</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Image src={nft?.image} alt={nft?.name} boxSize="200px" objectFit="cover" borderRadius="lg" />
              <Text fontWeight="bold" fontSize="lg">{nft?.name}</Text>
              <Text fontSize="xl" fontWeight="bold" color="red.500">
                Current Price: {formatPrice(nft?.price)} {nft?.currency}
              </Text>
              
              <Alert status="warning">
                <AlertIcon />
                <Box>
                  <AlertTitle>Remove from Marketplace</AlertTitle>
                  <AlertDescription>
                    Are you sure you want to remove this NFT from the marketplace? 
                    This action will delist your NFT and it will no longer be available for purchase.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRemoveClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleRemoveListing} isLoading={loading}>
              Remove Listing
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default NFTDetail;