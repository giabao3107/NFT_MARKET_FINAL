import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Card,
  CardBody,
  Badge,
  Avatar,
  Tooltip,
  IconButton,
  useColorModeValue,
  useToast,
  Skeleton,
} from '@chakra-ui/react';
import {
  FiHeart,
  FiEye,
  FiTag,
  FiTrendingUp,
  FiUser,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const NFTCard = ({ nft, showActions = true, onLike, onBuy }) => {
  const navigate = useNavigate();
  const { account } = useWeb3();
  const toast = useToast();
  
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(nft.tokenId, !isLiked);
    }
  };

  const handleBuy = (e) => {
    e.stopPropagation();
    if (onBuy) {
      onBuy(nft);
    } else {
      navigate(`/nft/${nft.tokenId}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/nft/${nft.tokenId}`);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  const isOwner = account && nft.owner && account.toLowerCase() === nft.owner.toLowerCase();

  return (
    <MotionCard
      bg={bg}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      cursor="pointer"
      onClick={handleCardClick}
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
        borderColor: 'brand.300',
      }}
      transition="all 0.3s ease"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Box position="relative">
        {/* Image */}
        <Box position="relative" overflow="hidden">
          {!imageLoaded && !imageError && (
            <Skeleton height="250px" w="full" />
          )}
          
          {imageError ? (
            <Box
              height="250px"
              w="full"
              bg={hoverBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Text fontSize="4xl" mb={2}>🖼️</Text>
              <Text fontSize="sm" color={mutedColor}>
                Image not available
              </Text>
            </Box>
          ) : (
            <Image
              src={nft.image ? require('../utils/ipfs').convertIpfsToHttp(nft.image) : null}
              alt={nft.name}
              w="full"
              h="250px"
              objectFit="cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              style={{ display: imageLoaded ? 'block' : 'none' }}
              transition="transform 0.3s ease"
              _hover={{ transform: 'scale(1.05)' }}
            />
          )}
          
          {/* Overlay Actions */}
          {showActions && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.600"
              opacity={0}
              _hover={{ opacity: 1 }}
              transition="opacity 0.3s ease"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <HStack spacing={2}>
                <Tooltip label="View Details">
                  <IconButton
                    icon={<FiEye />}
                    variant="solid"
                    colorScheme="whiteAlpha"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/nft/${nft.tokenId}`);
                    }}
                  />
                </Tooltip>
                
                {nft.isListed && !isOwner && (
                  <Tooltip label="Buy Now">
                    <IconButton
                      icon={<FiTag />}
                      variant="solid"
                      colorScheme="brand"
                      size="sm"
                      onClick={handleBuy}
                    />
                  </Tooltip>
                )}
              </HStack>
            </Box>
          )}
          
          {/* Status Badge */}
          <Box position="absolute" top={3} left={3}>
            {nft.isListed ? (
              <Badge colorScheme="green" variant="solid">
                For Sale
              </Badge>
            ) : isOwner ? (
              <Badge colorScheme="blue" variant="solid">
                Owned
              </Badge>
            ) : (
              <Badge colorScheme="gray" variant="solid">
                Not Listed
              </Badge>
            )}
          </Box>
          
          {/* Like Button */}
          {showActions && (
            <Box position="absolute" top={3} right={3}>
              <IconButton
                icon={<FiHeart />}
                variant="solid"
                colorScheme={isLiked ? 'red' : 'whiteAlpha'}
                size="sm"
                onClick={handleLike}
                color={isLiked ? 'white' : 'gray.600'}
              />
            </Box>
          )}
        </Box>

        <CardBody p={4}>
          <VStack spacing={3} align="stretch">
            {/* NFT Info */}
            <VStack spacing={1} align="start">
              <Text
                fontWeight="bold"
                fontSize="lg"
                noOfLines={1}
                title={nft.name}
              >
                {nft.name}
              </Text>
              
              {nft.description && (
                <Text
                  color={textColor}
                  fontSize="sm"
                  noOfLines={2}
                  title={nft.description}
                >
                  {nft.description}
                </Text>
              )}
            </VStack>

            {/* Creator/Owner Info */}
            <HStack justify="space-between" align="center">
              <VStack spacing={0} align="start">
                <Text fontSize="xs" color={mutedColor}>
                  {isOwner ? 'You own this' : 'Creator'}
                </Text>
                <HStack spacing={1}>
                  <Avatar
                    size="xs"
                    src={nft.creator?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nft.creator?.address || nft.tokenId}`}
                  />
                  <Text fontSize="sm" fontWeight="medium">
                    {isOwner ? 'You' : nft.creator?.name || formatAddress(nft.creator?.address)}
                  </Text>
                  {nft.creator?.verified && (
                    <Badge colorScheme="blue" size="sm">
                      ✓
                    </Badge>
                  )}
                </HStack>
              </VStack>
              
              {/* Stats */}
              <VStack spacing={0} align="end">
                <HStack spacing={3} fontSize="xs" color={mutedColor}>
                  <HStack spacing={1}>
                    <FiEye />
                    <Text>{nft.views || 0}</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <FiHeart />
                    <Text>{(nft.likes || 0) + (isLiked ? 1 : 0)}</Text>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>

            {/* Price and Action */}
            {nft.isListed && nft.price && (
              <HStack justify="space-between" align="center" pt={2}>
                <VStack spacing={0} align="start">
                  <Text fontSize="xs" color={mutedColor}>
                    Current Price
                  </Text>
                  <HStack spacing={1}>
                    <Text fontSize="lg" fontWeight="bold">
                      {formatPrice(nft.price)}
                    </Text>
                    <Text fontSize="sm" color={mutedColor}>
                      {nft.currency || 'ETH'}
                    </Text>
                  </HStack>
                </VStack>
                
                {!isOwner && showActions && (
                  <Button
                    size="sm"
                    variant="gradient"
                    leftIcon={<FiTag />}
                    onClick={handleBuy}
                  >
                    Buy
                  </Button>
                )}
                
                {isOwner && showActions && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiTrendingUp />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/nft/${nft.tokenId}`);
                    }}
                  >
                    Manage
                  </Button>
                )}
              </HStack>
            )}
            
            {/* Not Listed State */}
            {!nft.isListed && (
              <HStack justify="space-between" align="center" pt={2}>
                <Text fontSize="sm" color={mutedColor}>
                  Not for sale
                </Text>
                
                {isOwner && showActions && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiTag />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/nft/${nft.tokenId}`);
                    }}
                  >
                    List
                  </Button>
                )}
              </HStack>
            )}

            {/* Category */}
            {nft.category && (
              <HStack justify="space-between" align="center">
                <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                  {nft.category}
                </Badge>
                
                {nft.createdAt && (
                  <Text fontSize="xs" color={mutedColor}>
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(new Date(nft.createdAt))}
                  </Text>
                )}
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Box>
    </MotionCard>
  );
};

export default NFTCard;