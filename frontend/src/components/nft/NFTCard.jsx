import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Badge,
  Card,
  CardBody,
  CardFooter,
  IconButton,
  Tooltip,
  useColorModeValue,
  useBreakpointValue,
  Flex,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Skeleton,
  SkeletonText,
  Avatar,
  AvatarGroup,
  Progress,
  Divider,
  Link,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Input,
  Textarea
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
  FiClock,
  FiUser,
  FiDollarSign,
  FiZap,
  FiGift,
  FiRefreshCw,
  FiImage
} from 'react-icons/fi';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFTContext } from '../../contexts/NFTContext';
import { useCustomToast } from '../common/Toast';
import { useNFTOperations, useFavorites, useLocalStorage } from '../../hooks';
import { formatEther, formatAddress } from '../../utils/web3';
import { formatDateTime, formatCurrency, copyToClipboard } from '../../utils/helpers';
import { IPFS_GATEWAY } from '../../utils/constants';

/**
 * Enhanced NFT Card Component
 */
const NFTCard = ({
  nft,
  variant = 'default', // 'default', 'compact', 'detailed', 'grid'
  showActions = true,
  showOwner = true,
  showPrice = true,
  showStats = false,
  isOwned = false,
  onSelect,
  isSelected = false,
  ...props
}) => {
  const { account } = useWeb3();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { favorites, toggleFavorite } = useFavorites();
  const { addToRecentlyViewed } = useLocalStorage();
  const toast = useCustomToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBorderColor = useColorModeValue('blue.300', 'blue.500');
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const isFavorited = favorites.includes(nft.tokenId);
  const isOwner = account && nft.owner?.toLowerCase() === account.toLowerCase();
  
  const handleCardClick = () => {
    addToRecentlyViewed(nft);
    if (onSelect) {
      onSelect(nft);
    }
  };
  
  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    toggleFavorite(nft.tokenId);
    toast.info(
      isFavorited ? 'Removed from favorites' : 'Added to favorites',
      nft.name
    );
  };
  
  const getImageSrc = () => {
    if (!nft.image) return null; // No placeholder, return null if no image
    if (nft.image.startsWith('ipfs://')) {
      return `${IPFS_GATEWAY}/${nft.image.replace('ipfs://', '')}`;
    }
    return nft.image;
  };
  
  // Render different variants
  if (variant === 'compact') {
    return <CompactNFTCard nft={nft} {...props} />;
  }
  
  if (variant === 'detailed') {
    return <DetailedNFTCard nft={nft} {...props} />;
  }
  
  if (variant === 'grid') {
    return <GridNFTCard nft={nft} {...props} />;
  }
  
  // Default variant
  return (
    <Card
      bg={bgColor}
      border="2px"
      borderColor={isSelected ? hoverBorderColor : borderColor}
      cursor="pointer"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{
        borderColor: hoverBorderColor,
        transform: 'translateY(-2px)',
        shadow: 'lg'
      }}
      transition="all 0.2s"
      position="relative"
      overflow="hidden"
      {...props}
    >
      {/* Image Section */}
      <Box position="relative" overflow="hidden">
        {!imageLoaded && !imageError && (
          <Skeleton height="250px" borderRadius="md" />
        )}
        
        <ImageWithFallback
          src={getImageSrc()}
          alt={nft.name}
          w="full"
          h="250px"
          objectFit="cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          transition="transform 0.3s"
          _hover={{ transform: 'scale(1.05)' }}
        />
        
        {/* Overlay Actions */}
        <Box
          position="absolute"
          top={2}
          right={2}
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.2s"
        >
          <HStack spacing={1}>
            <Tooltip label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton
                size="sm"
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
            
            <NFTCardMenu nft={nft} isOwner={isOwner} />
          </HStack>
        </Box>
        
        {/* Status Badges */}
        <Box position="absolute" top={2} left={2}>
          <VStack spacing={1} align="start">
            {nft.isListed || nft.price ? (
              <Badge colorScheme="green" variant="solid" fontSize="xs">
                For Sale
              </Badge>
            ) : (
              <Badge colorScheme="gray" variant="solid" fontSize="xs">
                Not Listed
              </Badge>
            )}
            {nft.isAuction && (
              <Badge colorScheme="purple" variant="solid" fontSize="xs">
                Auction
              </Badge>
            )}
            {isOwner && (
              <Badge colorScheme="blue" variant="solid" fontSize="xs">
                Owned
              </Badge>
            )}
          </VStack>
        </Box>
        
        {/* Price Badge */}
        {showPrice && (
          <Box position="absolute" bottom={2} right={2}>
            <Badge
              colorScheme={nft.price ? "blue" : "gray"}
              variant="solid"
              fontSize="sm"
              px={2}
              py={1}
              borderRadius="md"
            >
              {nft.price ? `${formatEther(nft.price)} ETH` : "Not for Sale"}
            </Badge>
          </Box>
        )}
      </Box>
      
      {/* Content Section */}
      <CardBody>
        <VStack spacing={3} align="stretch">
          {/* Title and Collection */}
          <VStack spacing={1} align="start">
            <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
              {nft.name || `NFT #${nft.tokenId}`}
            </Text>
            {nft.collection && (
              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                {nft.collection.name}
              </Text>
            )}
          </VStack>
          
          {/* Description */}
          {nft.description && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {nft.description}
            </Text>
          )}
          
          {/* Owner Info */}
          {showOwner && nft.owner && (
            <HStack spacing={2}>
              <Avatar size="xs" name={nft.owner} />
              <VStack spacing={0} align="start">
                <Text fontSize="xs" color="gray.500">
                  Owner
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formatAddress(nft.owner)}
                </Text>
              </VStack>
            </HStack>
          )}
          
          {/* Stats */}
          {showStats && (
            <HStack spacing={4} fontSize="xs" color="gray.500">
              <HStack spacing={1}>
                <FiEye />
                <Text>{nft.views || 0}</Text>
              </HStack>
              <HStack spacing={1}>
                <FiHeart />
                <Text>{nft.likes || 0}</Text>
              </HStack>
              {nft.lastSale && (
                <HStack spacing={1}>
                  <FiTrendingUp />
                  <Text>{formatEther(nft.lastSale)} ETH</Text>
                </HStack>
              )}
            </HStack>
          )}
        </VStack>
      </CardBody>
      
      {/* Actions */}
      {showActions && (
        <CardFooter pt={0}>
          <NFTCardActions nft={nft} isOwner={isOwner} />
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * Compact NFT Card Variant
 */
const CompactNFTCard = ({ nft, ...props }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Card
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      direction="row"
      size="sm"
      {...props}
    >
      <ImageWithFallback
        src={nft.image}
        alt={nft.name}
        boxSize="80px"
        objectFit="cover"
        borderRadius="md"
      />
      
      <CardBody>
        <VStack spacing={1} align="start">
          <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
            {nft.name || `NFT #${nft.tokenId}`}
          </Text>
          <Text fontSize="sm" color={nft.price ? "blue.500" : "gray.500"} fontWeight="medium">
            {nft.price ? `${formatEther(nft.price)} ETH` : "Not for Sale"}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {nft.collection?.name || 'Unknown Collection'}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Detailed NFT Card Variant
 */
const DetailedNFTCard = ({ nft, ...props }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Card
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      size="lg"
      {...props}
    >
      <ImageWithFallback
        src={nft.image}
        alt={nft.name}
        w="full"
        h="300px"
        objectFit="cover"
      />
      
      <CardBody>
        <VStack spacing={4} align="stretch">
          <VStack spacing={2} align="start">
            <Text fontSize="xl" fontWeight="bold">
              {nft.name || `NFT #${nft.tokenId}`}
            </Text>
            <Text fontSize="md" color="gray.600">
              {nft.description}
            </Text>
          </VStack>
          
          {nft.attributes && nft.attributes.length > 0 && (
            <VStack spacing={2} align="start">
              <Text fontSize="sm" fontWeight="medium" color="gray.500">
                Attributes
              </Text>
              <HStack spacing={2} wrap="wrap">
                {nft.attributes.slice(0, 4).map((attr, index) => (
                  <Badge key={index} variant="outline" fontSize="xs">
                    {attr.trait_type}: {attr.value}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          )}
          
          <Divider />
          
          <HStack justify="space-between">
            <VStack spacing={0} align="start">
              <Text fontSize="xs" color="gray.500">Current Price</Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.500">
                {nft.price ? `${formatEther(nft.price)} ETH` : 'Not listed'}
              </Text>
            </VStack>
            
            {nft.lastSale && (
              <VStack spacing={0} align="end">
                <Text fontSize="xs" color="gray.500">Last Sale</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formatEther(nft.lastSale)} ETH
                </Text>
              </VStack>
            )}
          </HStack>
        </VStack>
      </CardBody>
      
      <CardFooter>
        <NFTCardActions nft={nft} variant="detailed" />
      </CardFooter>
    </Card>
  );
};

/**
 * Grid NFT Card Variant
 */
const GridNFTCard = ({ nft, ...props }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      _hover={{ transform: 'scale(1.02)', shadow: 'md' }}
      transition="all 0.2s"
      {...props}
    >
      <ImageWithFallback
        src={nft.image}
        alt={nft.name}
        w="full"
        aspectRatio={1}
        objectFit="cover"
      />
      
      <Box p={3}>
        <VStack spacing={2} align="stretch">
          <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
            {nft.name || `NFT #${nft.tokenId}`}
          </Text>
          
          {nft.price && (
            <Text fontSize="sm" color="blue.500" fontWeight="medium">
              {formatEther(nft.price)} ETH
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

/**
 * NFT Card Menu Component
 */
const NFTCardMenu = ({ nft, isOwner }) => {
  const toast = useCustomToast();
  
  const handleShare = () => {
    const url = `${window.location.origin}/nft/${nft.contractAddress}/${nft.tokenId}`;
    copyToClipboard(url);
    toast.success('Copied', 'NFT link copied to clipboard');
  };
  
  const handleReport = () => {
    toast.info('Report', 'Report functionality coming soon');
  };
  
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        size="sm"
        variant="solid"
        bg="whiteAlpha.900"
        color="gray.600"
        icon={<FiMoreVertical />}
        _hover={{ bg: 'whiteAlpha.800' }}
      />
      <MenuList>
        <MenuItem icon={<FiEye />}>
          View Details
        </MenuItem>
        <MenuItem icon={<FiShare2 />} onClick={handleShare}>
          Share
        </MenuItem>
        <MenuItem icon={<FiCopy />}>
          Copy Link
        </MenuItem>
        <MenuDivider />
        {isOwner ? (
          <>
            <MenuItem icon={<FiEdit3 />}>
              Edit
            </MenuItem>
            <MenuItem icon={<FiTag />}>
              List for Sale
            </MenuItem>
            <MenuItem icon={<FiGift />}>
              Transfer
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem icon={<FiShoppingCart />}>
              Make Offer
            </MenuItem>
            <MenuItem icon={<FiFlag />} onClick={handleReport}>
              Report
            </MenuItem>
          </>
        )}
      </MenuList>
    </Menu>
  );
};

/**
 * NFT Card Actions Component
 */
const NFTCardActions = ({ nft, isOwner, variant = 'default' }) => {
  const { buyNFT, listNFT } = useNFTOperations();
  const [loading, setLoading] = useState(false);
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
  
  const handleList = async () => {
    // This would open a listing modal
    toast.info('List NFT', 'Listing functionality coming soon');
  };
  
  if (variant === 'detailed') {
    return (
      <HStack spacing={3} w="full">
        {isOwner ? (
          <>
            <Button
              leftIcon={<FiTag />}
              colorScheme="blue"
              variant="outline"
              flex={1}
              onClick={handleList}
            >
              List for Sale
            </Button>
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
              {(nft.isListed || nft.price) && (
                <Button
                  leftIcon={<FiShoppingCart />}
                  colorScheme="blue"
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
                flex={1}
              >
                Make Offer
              </Button>
            </>
        )}
      </HStack>
    );
  }
  
  // Default actions
  return (
    <HStack spacing={2} w="full">
      {isOwner ? (
        <Button
          size="sm"
          leftIcon={<FiTag />}
          colorScheme="blue"
          variant="outline"
          flex={1}
          onClick={handleList}
        >
          List
        </Button>
      ) : (
        <>
          {(nft.isListed || nft.price) && (
            <Button
              size="sm"
              leftIcon={<FiShoppingCart />}
              colorScheme="blue"
              flex={1}
              isLoading={loading}
              onClick={handleBuy}
            >
              Buy
            </Button>
          )}
          <IconButton
            size="sm"
            variant="outline"
            icon={<FiDollarSign />}
            aria-label="Make offer"
          />
        </>
      )}
    </HStack>
  );
};

/**
 * NFT Card Skeleton Component
 */
const NFTCardSkeleton = ({ variant = 'default' }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  if (variant === 'compact') {
    return (
      <Card bg={bgColor} border="1px" borderColor={borderColor} direction="row">
        <Skeleton boxSize="80px" borderRadius="md" />
        <CardBody>
          <VStack spacing={2} align="start">
            <Skeleton height="16px" width="120px" />
            <Skeleton height="14px" width="80px" />
            <Skeleton height="12px" width="100px" />
          </VStack>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <Skeleton height="250px" borderRadius="md" />
      <CardBody>
        <VStack spacing={3} align="stretch">
          <Skeleton height="20px" width="80%" />
          <SkeletonText noOfLines={2} spacing={2} />
          <HStack spacing={2}>
            <Skeleton boxSize="24px" borderRadius="full" />
            <Skeleton height="16px" width="100px" />
          </HStack>
        </VStack>
      </CardBody>
      <CardFooter>
        <HStack spacing={2} w="full">
          <Skeleton height="32px" flex={1} />
          <Skeleton height="32px" width="40px" />
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default NFTCard;
export { CompactNFTCard, DetailedNFTCard, GridNFTCard, NFTCardSkeleton, NFTCardMenu, NFTCardActions };