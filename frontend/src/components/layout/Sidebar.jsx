import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Collapse,
  Divider,
  Link,
  Badge,
  Avatar,
  Tooltip,
  useBreakpointValue,
  IconButton,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure
} from '@chakra-ui/react';
import {
  FiHome,
  FiCompass,
  FiTrendingUp,
  FiUser,
  FiGrid,
  FiActivity,
  FiBookmark,
  FiHelpCircle,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiStar,
  FiImage,
  FiMusic,
  FiCamera,
  FiGamepad2,
  FiZap,
  FiTool,
  FiGlobe,
  FiHeart,
  FiEye,
  FiDollarSign,
  FiUsers,
  FiTrendingDown,
  FiBarChart,
  FiPieChart,
  FiSettings,
  FiInfo
} from 'react-icons/fi';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFTContext } from '../../contexts/NFTContext';
import { Logo } from './Header';
import { formatEther } from '../../utils/web3';
import { useLocalStorage } from '../../hooks';

/**
 * Navigation Items Configuration
 */
const navigationItems = [
  {
    label: 'Home',
    path: '/',
    icon: FiHome,
    exact: true,
    description: 'Discover trending NFTs'
  },
  {
    label: 'Explore',
    path: '/explore',
    icon: FiCompass,
    description: 'Browse all NFTs',
    children: [
      { 
        label: 'All NFTs', 
        path: '/explore', 
        icon: FiGrid,
        description: 'Browse all available NFTs'
      },
      { 
        label: 'Art', 
        path: '/explore/art', 
        icon: FiImage,
        description: 'Digital art and illustrations'
      },
      { 
        label: 'Music', 
        path: '/explore/music', 
        icon: FiMusic,
        description: 'Music and audio NFTs'
      },
      { 
        label: 'Photography', 
        path: '/explore/photography', 
        icon: FiCamera,
        description: 'Photography and visual art'
      },
      { 
        label: 'Gaming', 
        path: '/explore/gaming', 
        icon: FiGamepad2,
        description: 'Gaming items and collectibles'
      },
      { 
        label: 'Sports', 
        path: '/explore/sports', 
        icon: FiZap,
        description: 'Sports memorabilia and cards'
      },
      { 
        label: 'Utility', 
        path: '/explore/utility', 
        icon: FiTool,
        description: 'Utility and membership NFTs'
      },
      { 
        label: 'Virtual Worlds', 
        path: '/explore/virtual-worlds', 
        icon: FiGlobe,
        description: 'Metaverse and virtual world assets'
      }
    ]
  },
  {
    label: 'Collections',
    path: '/collections',
    icon: FiBookmark,
    description: 'Featured collections'
  },
  {
    label: 'Rankings',
    path: '/rankings',
    icon: FiTrendingUp,
    description: 'Top collections and creators',
    children: [
      {
        label: 'Top Collections',
        path: '/rankings/collections',
        icon: FiBarChart,
        description: 'Collections by volume'
      },
      {
        label: 'Top Creators',
        path: '/rankings/creators',
        icon: FiUsers,
        description: 'Top selling creators'
      },
      {
        label: 'Trending',
        path: '/rankings/trending',
        icon: FiTrendingUp,
        description: 'Trending NFTs'
      }
    ]
  },
  {
    label: 'Activity',
    path: '/activity',
    icon: FiActivity,
    description: 'Recent marketplace activity'
  }
];

/**
 * Market Stats Component
 */
const MarketStats = () => {
  const [stats, setStats] = useState({
    totalVolume: '1,234,567',
    totalSales: '456,789',
    totalUsers: '123,456',
    floorPrice: '0.05',
    change24h: '+12.5'
  });
  
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      mx={2}
      mb={4}
    >
      <Text fontSize="sm" fontWeight="semibold" mb={3}>
        Market Overview
      </Text>
      
      <VStack spacing={3} align="stretch">
        <Stat size="sm">
          <StatLabel fontSize="xs">24h Volume</StatLabel>
          <StatNumber fontSize="sm">{stats.totalVolume} ETH</StatNumber>
          <StatHelpText fontSize="xs" mb={0}>
            <StatArrow type="increase" />
            {stats.change24h}%
          </StatHelpText>
        </Stat>
        
        <Stat size="sm">
          <StatLabel fontSize="xs">Total Sales</StatLabel>
          <StatNumber fontSize="sm">{stats.totalSales}</StatNumber>
        </Stat>
        
        <Stat size="sm">
          <StatLabel fontSize="xs">Active Users</StatLabel>
          <StatNumber fontSize="sm">{stats.totalUsers}</StatNumber>
        </Stat>
        
        <Stat size="sm">
          <StatLabel fontSize="xs">Floor Price</StatLabel>
          <StatNumber fontSize="sm">{stats.floorPrice} ETH</StatNumber>
        </Stat>
      </VStack>
    </Box>
  );
};

/**
 * Featured Collections Component
 */
const FeaturedCollections = () => {
  const [collections] = useState([
    {
      id: '1',
      name: 'Cool Cats',
      image: '/api/placeholder/40/40',
      floorPrice: '0.5',
      change: '+5.2'
    },
    {
      id: '2',
      name: 'Bored Apes',
      image: '/api/placeholder/40/40',
      floorPrice: '12.5',
      change: '-2.1'
    },
    {
      id: '3',
      name: 'Azuki',
      image: '/api/placeholder/40/40',
      floorPrice: '3.2',
      change: '+8.7'
    }
  ]);
  
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      mx={2}
      mb={4}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontSize="sm" fontWeight="semibold">
          Featured Collections
        </Text>
        <Link as={RouterLink} to="/collections" fontSize="xs" color="blue.500">
          View all
        </Link>
      </Flex>
      
      <VStack spacing={2} align="stretch">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            as={RouterLink}
            to={`/collection/${collection.id}`}
            _hover={{ textDecoration: 'none' }}
          >
            <HStack
              spacing={3}
              p={2}
              borderRadius="md"
              _hover={{ bg: useColorModeValue('white', 'gray.600') }}
              transition="background 0.2s"
            >
              <Avatar size="sm" src={collection.image} name={collection.name} />
              <VStack spacing={0} align="flex-start" flex={1}>
                <Text fontSize="xs" fontWeight="medium" noOfLines={1}>
                  {collection.name}
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="xs" color="gray.500">
                    {collection.floorPrice} ETH
                  </Text>
                  <Text
                    fontSize="xs"
                    color={collection.change.startsWith('+') ? 'green.500' : 'red.500'}
                  >
                    {collection.change}%
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

/**
 * Navigation Item Component
 */
const NavItem = ({ item, level = 0, onClose, isCollapsed = false }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.exact 
    ? location.pathname === item.path 
    : location.pathname.startsWith(item.path);
  
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  
  // Auto-expand if current path matches any child
  useEffect(() => {
    if (hasChildren && !isExpanded) {
      const hasActiveChild = item.children.some(child => 
        location.pathname.startsWith(child.path)
      );
      if (hasActiveChild) {
        setIsExpanded(true);
      }
    }
  }, [location.pathname, hasChildren, item.children, isExpanded]);
  
  const toggleExpanded = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };
  
  const handleClick = () => {
    if (hasChildren) {
      toggleExpanded();
    } else {
      onClose?.();
    }
  };
  
  return (
    <Box>
      <Tooltip
        label={isCollapsed ? item.label : item.description}
        placement="right"
        hasArrow
        isDisabled={!isCollapsed && !item.description}
      >
        <Flex
          as={hasChildren ? Button : RouterLink}
          to={!hasChildren ? item.path : undefined}
          onClick={handleClick}
          align="center"
          px={isCollapsed ? 2 : 4 + level * 4}
          py={3}
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : 'inherit'}
          _hover={{ bg: isActive ? activeBg : hoverBg }}
          borderRadius="md"
          mx={2}
          variant="ghost"
          justifyContent={isCollapsed ? 'center' : 'flex-start'}
          fontWeight={isActive ? 'semibold' : 'normal'}
          w={isCollapsed ? '40px' : 'calc(100% - 16px)'}
          h="40px"
          minH="40px"
          transition="all 0.2s"
          position="relative"
        >
          <Box as={item.icon} size={18} />
          
          {!isCollapsed && (
            <>
              <Text flex={1} textAlign="left" ml={3} fontSize="sm">
                {item.label}
              </Text>
              {hasChildren && (
                <Box as={isExpanded ? FiChevronUp : FiChevronDown} size={14} />
              )}
            </>
          )}
          
          {isCollapsed && hasChildren && (
            <Box
              position="absolute"
              right="-2px"
              top="50%"
              transform="translateY(-50%)"
              w={2}
              h={2}
              bg="blue.500"
              borderRadius="full"
            />
          )}
        </Flex>
      </Tooltip>
      
      {hasChildren && !isCollapsed && (
        <Collapse in={isExpanded}>
          <VStack spacing={1} align="stretch" mt={1}>
            {item.children.map((child) => (
              <NavItem 
                key={child.path} 
                item={child} 
                level={level + 1} 
                onClose={onClose}
                isCollapsed={isCollapsed}
              />
            ))}
          </VStack>
        </Collapse>
      )}
    </Box>
  );
};

/**
 * Sidebar Content Component
 */
const SidebarContent = ({ onClose, isCollapsed = false }) => {
  const { isConnected, account } = useWeb3();
  const [favorites] = useLocalStorage('favorites', []);
  
  return (
    <VStack spacing={0} align="stretch" h="full">
      {/* Navigation Items */}
      <Box flex={1} overflowY="auto" py={4}>
        <VStack spacing={1} align="stretch">
          {navigationItems.map((item) => (
            <NavItem 
              key={item.path} 
              item={item} 
              onClose={onClose}
              isCollapsed={isCollapsed}
            />
          ))}
        </VStack>
        
        {!isCollapsed && (
          <>
            <Divider my={4} />
            
            {/* User-specific items */}
            {isConnected && (
              <VStack spacing={1} align="stretch">
                <NavItem
                  item={{
                    label: 'My Profile',
                    path: `/profile/${account}`,
                    icon: FiUser,
                    description: 'View your profile'
                  }}
                  onClose={onClose}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  item={{
                    label: 'My NFTs',
                    path: `/profile/${account}/collected`,
                    icon: FiGrid,
                    description: 'Your collected NFTs'
                  }}
                  onClose={onClose}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  item={{
                    label: 'Favorites',
                    path: `/profile/${account}/favorites`,
                    icon: FiHeart,
                    description: 'Your favorite NFTs',
                    badge: favorites.length > 0 ? favorites.length : undefined
                  }}
                  onClose={onClose}
                  isCollapsed={isCollapsed}
                />
              </VStack>
            )}
            
            <Divider my={4} />
            
            {/* Quick Links */}
            <Box px={4} py={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={2}>
                Resources
              </Text>
              <VStack spacing={1} align="stretch">
                <Link
                  as={RouterLink}
                  to="/help"
                  fontSize="sm"
                  color="gray.600"
                  _hover={{ color: 'blue.500' }}
                  py={1}
                >
                  <HStack spacing={2}>
                    <FiHelpCircle size={14} />
                    <Text>Help Center</Text>
                  </HStack>
                </Link>
                <Link
                  href="https://docs.nftmarket.com"
                  fontSize="sm"
                  color="gray.600"
                  _hover={{ color: 'blue.500' }}
                  isExternal
                  py={1}
                >
                  <HStack spacing={2}>
                    <FiExternalLink size={14} />
                    <Text>Documentation</Text>
                  </HStack>
                </Link>
                <Link
                  href="https://discord.gg/nftmarket"
                  fontSize="sm"
                  color="gray.600"
                  _hover={{ color: 'blue.500' }}
                  isExternal
                  py={1}
                >
                  <HStack spacing={2}>
                    <FiExternalLink size={14} />
                    <Text>Discord</Text>
                  </HStack>
                </Link>
                <Link
                  href="https://twitter.com/nftmarket"
                  fontSize="sm"
                  color="gray.600"
                  _hover={{ color: 'blue.500' }}
                  isExternal
                  py={1}
                >
                  <HStack spacing={2}>
                    <FiExternalLink size={14} />
                    <Text>Twitter</Text>
                  </HStack>
                </Link>
              </VStack>
            </Box>
          </>
        )}
      </Box>
      
      {/* Market Stats and Featured Collections */}
      {!isCollapsed && (
        <Box>
          <MarketStats />
          <FeaturedCollections />
        </Box>
      )}
    </VStack>
  );
};

/**
 * Main Sidebar Component
 */
const Sidebar = ({ isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar-collapsed', false);
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w={isCollapsed ? '60px' : '280px'}
        bg={bgColor}
        borderRight="1px"
        borderColor={borderColor}
        position="fixed"
        left={0}
        top="73px"
        bottom={0}
        overflowY="auto"
        zIndex={100}
        transition="width 0.2s"
      >
        {/* Collapse Toggle */}
        <Box position="absolute" top={4} right={-4} zIndex={101}>
          <IconButton
            size="sm"
            variant="solid"
            bg={bgColor}
            border="1px"
            borderColor={borderColor}
            icon={isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            transform={isCollapsed ? 'rotate(0deg)' : 'rotate(-90deg)'}
            transition="transform 0.2s"
          />
        </Box>
        
        <SidebarContent onClose={onClose} isCollapsed={isCollapsed} />
      </Box>
      
      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" py={4}>
            <Logo size="sm" />
          </DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent onClose={onClose} isCollapsed={false} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
export { SidebarContent, NavItem, MarketStats, FeaturedCollections };