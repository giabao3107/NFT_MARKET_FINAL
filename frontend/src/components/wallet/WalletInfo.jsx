import React, { useState, useEffect } from 'react';
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
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  IconButton,
  useColorModeValue,
  useBreakpointValue,
  Flex,
  Spacer,
  Link,
  SkeletonText,
  Avatar,
  AvatarBadge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiActivity,
  FiCopy,
  FiExternalLink,
  FiRefreshCw,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiMoreVertical,
  FiPieChart,
  FiBarChart,
  FiShield,
  FiGrid,
  FiList,
  FiDollarSign,
  FiHeart
} from 'react-icons/fi';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFT } from '../../contexts/NFTContext';
import { useCustomToast } from '../common/Toast';
import { LoadingSpinner } from '../common';
import { formatAddress, getBlockExplorerUrl } from '../../utils/web3';
import { formatCurrency, copyToClipboard } from '../../utils/helpers';
import { useAsync } from '../../hooks';
import TransactionHistory from './TransactionHistory';

/**
 * Main Wallet Info Component
 */
const WalletInfo = ({ showTransactions = true, ...props }) => {
  const { account, balance, chainId, isConnected } = useWeb3();
  const { userNFTs } = useNFT();
  const [activeView, setActiveView] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const toast = useCustomToast();

  // Fetch wallet analytics
  const {
    data: analytics,
    loading: analyticsLoading,
    execute: fetchAnalytics
  } = useAsync(async () => {
    if (!account) return null;
    return fetchWalletAnalytics(account);
  });

  useEffect(() => {
    if (account) {
      fetchAnalytics();
    }
  }, [account]);

  if (!isConnected) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertDescription>
          Please connect your wallet to view wallet information
        </AlertDescription>
      </Alert>
    );
  }

  const views = [
    { id: 'overview', label: 'Overview', icon: FiPieChart },
    { id: 'nfts', label: 'NFTs', icon: FiGrid },
    { id: 'activity', label: 'Activity', icon: FiActivity },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart }
  ];

  return (
    <Box {...props}>
      {/* Header */}
      <WalletHeader
        account={account}
        balance={balance}
        chainId={chainId}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
        onRefresh={fetchAnalytics}
        isLoading={analyticsLoading}
      />

      {/* Navigation */}
      <Box mt={6}>
        <HStack spacing={1} mb={6} overflowX="auto">
          {views.map(view => {
            const Icon = view.icon;
            return (
              <Button
                key={view.id}
                variant={activeView === view.id ? 'solid' : 'ghost'}
                size="sm"
                leftIcon={<Icon />}
                onClick={() => setActiveView(view.id)}
                minW="fit-content"
              >
                {view.label}
              </Button>
            );
          })}
        </HStack>

        {/* Content */}
        {activeView === 'overview' && (
          <WalletOverview
            account={account}
            balance={balance}
            analytics={analytics}
            userNFTs={userNFTs}
            isLoading={analyticsLoading}
          />
        )}
        
        {activeView === 'nfts' && (
          <WalletNFTs nfts={userNFTs} />
        )}
        
        {activeView === 'activity' && showTransactions && (
          <TransactionHistory />
        )}
        
        {activeView === 'analytics' && (
          <WalletAnalytics
            analytics={analytics}
            isLoading={analyticsLoading}
          />
        )}
      </Box>
    </Box>
  );
};

/**
 * Wallet Header Component
 */
const WalletHeader = ({
  account,
  balance,
  chainId,
  showBalance,
  onToggleBalance,
  onRefresh,
  isLoading
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useCustomToast();

  const handleCopyAddress = () => {
    copyToClipboard(account);
    toast.success('Copied', 'Address copied to clipboard');
  };

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardHeader>
        <Flex align="center">
          <HStack spacing={3}>
            <Avatar size="md" name={account}>
              <AvatarBadge boxSize="1em" bg="green.500" />
            </Avatar>
            
            <VStack align="start" spacing={1}>
              <HStack>
                <Text fontSize="lg" fontWeight="bold">
                  {formatAddress(account, 6)}
                </Text>
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={<FiCopy />}
                  onClick={handleCopyAddress}
                />
              </HStack>
              
              <HStack spacing={2}>
                <Badge colorScheme="green" variant="subtle">
                  Connected
                </Badge>
                <Link
                  href={getBlockExplorerUrl(chainId, account, 'address')}
                  isExternal
                  fontSize="xs"
                  color="blue.500"
                >
                  View on Etherscan <FiExternalLink />
                </Link>
              </HStack>
            </VStack>
          </HStack>
          
          <Spacer />
          
          <HStack spacing={2}>
            <IconButton
              icon={showBalance ? <FiEye /> : <FiEyeOff />}
              onClick={onToggleBalance}
              variant="ghost"
              size="sm"
            />
            
            <IconButton
              icon={<FiRefreshCw />}
              onClick={onRefresh}
              isLoading={isLoading}
              variant="ghost"
              size="sm"
            />
            
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem icon={<FiSettings />}>
                  Settings
                </MenuItem>
                <MenuItem icon={<FiShield />}>
                  Security
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FiExternalLink />}>
                  View on Etherscan
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </CardHeader>
      
      <CardBody pt={0}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Stat>
            <StatLabel>Balance</StatLabel>
            <StatNumber>
              {showBalance ? (
                balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0 ETH'
              ) : (
                '••••••••'
              )}
            </StatNumber>
            <StatHelpText>
              {showBalance && balance && (
                <Text fontSize="xs" color="gray.500">
                  ≈ ${formatCurrency(parseFloat(balance) * 2000)} USD
                </Text>
              )}
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>NFTs Owned</StatLabel>
            <StatNumber>0</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              0 this month
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Total Value</StatLabel>
            <StatNumber>
              {showBalance ? '$0.00' : '••••••••'}
            </StatNumber>
            <StatHelpText>
              <StatArrow type="decrease" />
              0% this month
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};

/**
 * Wallet Overview Component
 */
const WalletOverview = ({ account, balance, analytics, userNFTs, isLoading }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <SkeletonText noOfLines={4} spacing={4} />
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      {/* Portfolio Summary */}
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <FiPieChart />
            <Text fontSize="lg" fontWeight="bold">
              Portfolio Summary
            </Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">Total Assets</Text>
              <Text fontSize="sm" fontWeight="medium">1</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">ETH Balance</Text>
              <Text fontSize="sm" fontWeight="medium">
                {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0 ETH'}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">NFTs Owned</Text>
              <Text fontSize="sm" fontWeight="medium">
                {userNFTs?.length || 0}
              </Text>
            </HStack>
            
            <Progress value={75} colorScheme="blue" size="sm" />
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Portfolio Health: Good
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <FiActivity />
            <Text fontSize="lg" fontWeight="bold">
              Recent Activity
            </Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" color="gray.500" textAlign="center">
              No recent activity
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <FiSettings />
            <Text fontSize="lg" fontWeight="bold">
              Quick Actions
            </Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={2} spacing={3}>
            <Button size="sm" variant="outline" leftIcon={<FiDollarSign />}>
              Buy ETH
            </Button>
            <Button size="sm" variant="outline" leftIcon={<FiGrid />}>
              Browse NFTs
            </Button>
            <Button size="sm" variant="outline" leftIcon={<FiTrendingUp />}>
              View Market
            </Button>
            <Button size="sm" variant="outline" leftIcon={<FiShield />}>
              Security
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Favorites */}
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <FiHeart />
            <Text fontSize="lg" fontWeight="bold">
              Favorites
            </Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" color="gray.500" textAlign="center">
              No favorites yet
            </Text>
            <Button size="sm" variant="outline">
              Explore Collections
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};

/**
 * Wallet NFTs Component
 */
const WalletNFTs = ({ nfts }) => {
  const [viewMode, setViewMode] = useState('grid');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardHeader>
        <Flex align="center">
          <HStack>
            <FiGrid />
            <Text fontSize="lg" fontWeight="bold">
              My NFTs ({nfts?.length || 0})
            </Text>
          </HStack>
          
          <Spacer />
          
          <HStack spacing={2}>
            <IconButton
              icon={<FiGrid />}
              variant={viewMode === 'grid' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            />
            <IconButton
              icon={<FiList />}
              variant={viewMode === 'list' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            />
          </HStack>
        </Flex>
      </CardHeader>
      
      <CardBody>
        {!nfts || nfts.length === 0 ? (
          <VStack spacing={4} py={8}>
            <FiGrid size={48} color="gray.400" />
            <Text color="gray.500" textAlign="center">
              You don't own any NFTs yet
            </Text>
            <Button colorScheme="blue" size="sm">
              Explore Marketplace
            </Button>
          </VStack>
        ) : (
          <SimpleGrid
            columns={viewMode === 'grid' ? { base: 2, md: 3, lg: 4 } : 1}
            spacing={4}
          >
            {nfts.map((nft, index) => (
              <NFTCard key={index} nft={nft} viewMode={viewMode} />
            ))}
          </SimpleGrid>
        )}
      </CardBody>
    </Card>
  );
};

/**
 * NFT Card Component
 */
const NFTCard = ({ nft, viewMode }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (viewMode === 'list') {
    return (
      <HStack
        p={3}
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        spacing={3}
      >
        <Image
          src={nft.image}
          alt={nft.name}
          boxSize="60px"
          borderRadius="md"
          objectFit="cover"
        />
        <VStack align="start" spacing={1} flex={1}>
          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
            {nft.name}
          </Text>
          <Text fontSize="xs" color="gray.500">
            #{nft.tokenId}
          </Text>
        </VStack>
        <VStack align="end" spacing={1}>
          <Text fontSize="sm" fontWeight="medium">
            {nft.price ? `${nft.price} ETH` : 'Not listed'}
          </Text>
          <Badge size="sm" colorScheme={nft.isListed ? 'green' : 'gray'}>
            {nft.isListed ? 'Listed' : 'Owned'}
          </Badge>
        </VStack>
      </HStack>
    );
  }

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor} cursor="pointer">
      <CardBody p={3}>
        <VStack spacing={3}>
          <Image
            src={nft.image}
            alt={nft.name}
            w="full"
            aspectRatio={1}
            borderRadius="md"
            objectFit="cover"
          />
          <VStack spacing={1} w="full">
            <Text fontSize="sm" fontWeight="medium" noOfLines={1} w="full" textAlign="center">
              {nft.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              #{nft.tokenId}
            </Text>
            {nft.price && (
              <Text fontSize="sm" fontWeight="bold" color="blue.500">
                {nft.price} ETH
              </Text>
            )}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Wallet Analytics Component
 */
const WalletAnalytics = ({ analytics, isLoading }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <FiBarChart />
            <Text fontSize="lg" fontWeight="bold">
              Trading Analytics
            </Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500" textAlign="center">
              No trading data available
            </Text>
          </VStack>
        </CardBody>
      </Card>

      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <FiTrendingUp />
            <Text fontSize="lg" fontWeight="bold">
              Performance
            </Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500" textAlign="center">
              No performance data available
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};

// Function to fetch real wallet analytics from blockchain data
const fetchWalletAnalytics = async (account, userNFTs, marketplaceListings) => {
  try {
    // Calculate total value from owned NFTs that are listed
    const listedNFTs = userNFTs.filter(nft => 
      marketplaceListings.some(listing => 
        listing.tokenId === nft.tokenId && listing.seller === account
      )
    );
    
    const totalValue = listedNFTs.reduce((sum, nft) => {
      const listing = marketplaceListings.find(l => l.tokenId === nft.tokenId);
      return sum + (listing ? parseFloat(listing.price) : 0);
    }, 0);
    
    return {
      totalValue: totalValue.toFixed(4),
      nftCount: userNFTs.length,
      listedCount: listedNFTs.length,
      transactions: 0, // Would need to track this separately
      performance: {
        daily: 0,
        weekly: 0,
        monthly: 0
      }
    };
  } catch (error) {
    console.error('Error fetching wallet analytics:', error);
    return {
      totalValue: 0,
      nftCount: 0,
      listedCount: 0,
      transactions: 0,
      performance: {
        daily: 0,
        weekly: 0,
        monthly: 0
      }
    };
  }
};

export default WalletInfo;
export { WalletHeader, WalletOverview, WalletNFTs, WalletAnalytics };