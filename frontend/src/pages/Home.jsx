import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Image,
  useColorModeValue,
  Flex,
  Badge,
  Card,
  CardBody,
  CardFooter,
  Avatar,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNFT } from '../contexts/NFTContext';
import { useWeb3 } from '../contexts/Web3Context';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const Home = () => {
  const { nfts, marketplaceListings, loading, fetchAllNFTs, fetchMarketplaceListings } = useNFT();
  const { isConnected } = useWeb3();
  const [stats, setStats] = useState({
    totalNFTs: 0,
    totalVolume: 0,
    totalUsers: 0,
    floorPrice: 0,
  });

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Fetch data on component mount
  useEffect(() => {
    fetchAllNFTs();
    fetchMarketplaceListings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate marketplace statistics
  useEffect(() => {
    const allNFTsCount = nfts.length;
    const marketplaceVolume = marketplaceListings.reduce(
      (sum, nft) => sum + parseFloat(nft.price || 0),
      0
    );
    const floorPrice = marketplaceListings.length > 0 ? Math.min(
      ...marketplaceListings.map(nft => parseFloat(nft.price || 0))
    ) : 0;

    setStats({
      totalNFTs: allNFTsCount,
      totalVolume: marketplaceVolume.toFixed(2),
      totalUsers: 0, // Could be fetched from user analytics service
      floorPrice: floorPrice.toFixed(3),
    });
  }, [nfts, marketplaceListings]);

  const featuredNFTs = nfts.slice(0, 8);

  const HeroSection = () => (
    <Box
      bgGradient="linear(to-br, brand.500, purple.600)"
      color="white"
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        backgroundImage={`url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`}
      />
      
      <Container maxW="7xl" position="relative">
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="space-between"
          spacing={12}
        >
          <MotionBox
            flex={1}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <VStack align="start" spacing={6} maxW="600px">
              <Badge
                colorScheme="purple"
                variant="solid"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                🚀 New Platform Launch
              </Badge>
              
              <Heading
                size={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontWeight="bold"
                lineHeight="shorter"
              >
                Discover, Create & Trade
                <Text as="span" display="block" color="purple.200">
                  Unique NFTs
                </Text>
              </Heading>
              
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color="purple.100"
                maxW="500px"
              >
                Join the digital marketplace for crypto
                collectibles and non-fungible tokens (NFTs).
              </Text>
              
              <HStack spacing={4} pt={4}>
                <Button
                  as={RouterLink}
                  to="/marketplace"
                  size="lg"
                  bg="white"
                  color="brand.500"
                  _hover={{
                    bg: 'gray.100',
                    transform: 'translateY(-2px)',
                  }}
                  boxShadow="lg"
                >
                  Explore NFTs
                </Button>
                
                <Button
                  as={RouterLink}
                  to="/create"
                  size="lg"
                  variant="outline"
                  borderColor="white"
                  color="white"
                  _hover={{
                    bg: 'whiteAlpha.200',
                    transform: 'translateY(-2px)',
                  }}
                >
                  Create NFT
                </Button>
              </HStack>
            </VStack>
          </MotionBox>
          
          <MotionBox
            flex={1}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            display={{ base: 'none', lg: 'block' }}
          >
            <Box position="relative">
              <Image
                src="/hero-nft.png"
                alt="Featured NFT"
                borderRadius="2xl"
                boxShadow="2xl"
                fallback={
                  <Box
                    w="400px"
                    h="400px"
                    bg="whiteAlpha.200"
                    borderRadius="2xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="6xl">🎨</Text>
                  </Box>
                }
              />
              
              {/* Floating elements */}
              <Box
                position="absolute"
                top="20px"
                right="20px"
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                borderRadius="lg"
                p={3}
              >
                <Text fontSize="sm" fontWeight="bold">
                  🔥 Trending
                </Text>
              </Box>
            </Box>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  );

  const StatsSection = () => (
    <Box py={16} bg={bg}>
      <Container maxW="7xl">
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
          <Stat textAlign="center">
            <StatNumber fontSize="3xl" fontWeight="bold" color="brand.500">
              {stats.totalNFTs}+
            </StatNumber>
            <StatLabel fontSize="lg" color={textColor}>
              NFTs Listed
            </StatLabel>
          </Stat>
          
          <Stat textAlign="center">
            <StatNumber fontSize="3xl" fontWeight="bold" color="brand.500">
              {stats.totalVolume} ETH
            </StatNumber>
            <StatLabel fontSize="lg" color={textColor}>
              Total Volume
            </StatLabel>
          </Stat>
          
          <Stat textAlign="center">
            <StatNumber fontSize="3xl" fontWeight="bold" color="brand.500">
              {stats.totalUsers}+
            </StatNumber>
            <StatLabel fontSize="lg" color={textColor}>
              Active Users
            </StatLabel>
          </Stat>
          
          <Stat textAlign="center">
            <StatNumber fontSize="3xl" fontWeight="bold" color="brand.500">
              {stats.floorPrice} ETH
            </StatNumber>
            <StatLabel fontSize="lg" color={textColor}>
              Floor Price
            </StatLabel>
          </Stat>
        </SimpleGrid>
      </Container>
    </Box>
  );

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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, boxShadow: 'xl' }}
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
              <Text fontSize="sm" color={textColor}>
                {nft.seller?.slice(0, 6)}...{nft.seller?.slice(-4)}
              </Text>
            </HStack>
            
            {nft.isListed && nft.price ? (
              <VStack align="end" spacing={0}>
                <Text fontSize="xs" color={textColor}>
                  Price
                </Text>
                <Text fontWeight="bold" color="brand.500">
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

  const FeaturedSection = () => {
    // Check if NFT is listed for sale
    const isListed = (tokenId) => {
      return marketplaceListings.some(listing => listing.tokenId === tokenId);
    };

    // Get listing info for an NFT
    const getListingInfo = (tokenId) => {
      return marketplaceListings.find(listing => listing.tokenId === tokenId);
    };

    return (
      <Box py={16}>
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" fontWeight="bold">
                Featured NFTs
              </Heading>
              <Text fontSize="lg" color={textColor} maxW="600px">
                Discover all NFTs in our collection - both available for sale and in private collections
              </Text>
            </VStack>
            
            {loading ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
                {Array.from({ length: 8 }).map((_, index) => (
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
            ) : featuredNFTs.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
                {featuredNFTs.map((nft, index) => {
                  const listingInfo = getListingInfo(nft.tokenId);
                  const nftWithListingInfo = {
                    ...nft,
                    price: listingInfo?.price || null,
                    isListed: isListed(nft.tokenId),
                    listingId: listingInfo?.listingId || null
                  };
                  return (
                    <NFTCard key={nft.tokenId} nft={nftWithListingInfo} index={index} />
                  );
                })}
              </SimpleGrid>
            ) : (
              <VStack spacing={6} py={12}>
                <Text fontSize="6xl">🎨</Text>
                <Heading size="lg" textAlign="center">
                  No NFTs Available Yet
                </Heading>
                <Text color={textColor} textAlign="center" maxW="400px">
                  Be the first to mint and list NFTs on our marketplace!
                </Text>
                <Button
                  as={RouterLink}
                  to={isConnected ? "/create" : "/marketplace"}
                  variant="gradient"
                  size="lg"
                >
                  {isConnected ? "Create Your First NFT" : "Connect Wallet to Start"}
                </Button>
              </VStack>
            )}
            
            {featuredNFTs.length > 0 && (
              <Button
                as={RouterLink}
                to="/marketplace"
                variant="outline"
                size="lg"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
              >
                View All NFTs
              </Button>
            )}
          </VStack>
        </Container>
      </Box>
    );
  };

  return (
    <Box>
      <HeroSection />
      <StatsSection />
      <FeaturedSection />
    </Box>
  );
};

export default Home;