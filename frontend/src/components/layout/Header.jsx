import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  IconButton,
  useColorMode,
  useColorModeValue,
  Container,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useBreakpointValue,
  Link,
  Tooltip,
  InputGroup,
  InputLeftElement,
  Input,
  VStack,
  Divider,
  useOutsideClick
} from '@chakra-ui/react';
import {
  FiMenu,
  FiSun,
  FiMoon,
  FiUser,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiBell,
  FiHeart,
  FiGrid,
  FiActivity,
  FiHelpCircle,
  FiChevronDown,
  FiTrendingUp,
  FiBookmark,
  FiShoppingBag
} from 'react-icons/fi';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFT } from '../../contexts/NFTContext';
import { WalletConnect, NetworkSwitcher } from '../wallet';
import { useCustomToast } from '../common/Toast';
import { formatAddress } from '../../utils/web3';
import { useDebounce } from '../../hooks';

/**
 * Logo Component
 */
const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: { box: 6, text: 'md' },
    md: { box: 8, text: 'xl' },
    lg: { box: 10, text: '2xl' }
  };
  
  const currentSize = sizes[size];
  
  return (
    <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
      <HStack spacing={2}>
        <Box
          w={currentSize.box}
          h={currentSize.box}
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          fontWeight="bold"
          fontSize={size === 'sm' ? 'sm' : 'md'}
          shadow="md"
          _hover={{ transform: 'scale(1.05)' }}
          transition="transform 0.2s"
        >
          N
        </Box>
        <Text 
          fontSize={currentSize.text} 
          fontWeight="bold" 
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
        >
          NFTMarket
        </Text>
      </HStack>
    </Link>
  );
};

/**
 * Search Bar Component
 */
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = React.useRef();
  const { marketplaceListings } = useNFT();
  
  // Color mode values - moved outside of callbacks
  const searchBg = useColorModeValue('white', 'gray.700');
  const searchBorderColor = useColorModeValue('gray.200', 'gray.600');
  const searchHoverBorderColor = useColorModeValue('gray.300', 'gray.500');
  const suggestionsBg = useColorModeValue('white', 'gray.800');
  const suggestionsBorderColor = useColorModeValue('gray.200', 'gray.600');
  const suggestionHoverBg = useColorModeValue('gray.50', 'gray.700');
  
  useOutsideClick({
    ref: searchRef,
    handler: () => setIsOpen(false)
  });
  
  // Search function using real marketplace data
  const searchNFTs = async (searchQuery, listings) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Search through marketplace listings for real NFT data
      const nftResults = listings
        .filter(nft => 
          nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5) // Limit to 5 results
        .map(nft => ({
          type: 'nft',
          id: nft.tokenId.toString(),
          name: nft.name,
          image: nft.image,
          collection: 'NFT Collection',
          price: `${nft.price} ETH`
        }));
      
      setResults(nftResults);
    } catch (error) {
      console.error('Error searching NFTs:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (debouncedQuery) {
      searchNFTs(debouncedQuery, marketplaceListings);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery, marketplaceListings]);
  
  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setQuery('');
    }
  };
  
  const handleResultClick = (result) => {
    switch (result.type) {
      case 'nft':
        navigate(`/nft/${result.id}`);
        break;
      case 'collection':
        navigate(`/collection/${result.id}`);
        break;
      case 'user':
        navigate(`/profile/${result.id}`);
        break;
      default:
        break;
    }
    setIsOpen(false);
    setQuery('');
  };
  
  const getResultIcon = (type) => {
    switch (type) {
      case 'nft': return FiGrid;
      case 'collection': return FiBookmark;
      case 'user': return FiUser;
      default: return FiSearch;
    }
  };
  
  return (
    <Box position="relative" ref={searchRef}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search NFTs, collections, users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
          onFocus={() => query && setIsOpen(true)}
          bg={searchBg}
          border="1px"
          borderColor={searchBorderColor}
          _hover={{
            borderColor: searchHoverBorderColor
          }}
          _focus={{
            borderColor: 'blue.500',
            boxShadow: '0 0 0 1px blue.500'
          }}
        />
      </InputGroup>
      
      {/* Search Results Dropdown */}
      {isOpen && (query || results.length > 0) && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={2}
          bg={suggestionsBg}
          border="1px"
          borderColor={suggestionsBorderColor}
          borderRadius="md"
          shadow="lg"
          zIndex={1000}
          maxH="400px"
          overflowY="auto"
        >
          {isLoading ? (
            <Box p={4} textAlign="center">
              <Text color="gray.500">Searching...</Text>
            </Box>
          ) : results.length > 0 ? (
            <VStack spacing={0} align="stretch">
              {results.map((result, index) => {
                const Icon = getResultIcon(result.type);
                return (
                  <Box
                    key={result.id}
                    p={3}
                    _hover={{ bg: suggestionHoverBg }}
                    cursor="pointer"
                    onClick={() => handleResultClick(result)}
                    borderBottom={index < results.length - 1 ? '1px' : 'none'}
                    borderColor={suggestionsBorderColor}
                  >
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        src={result.image || result.avatar}
                        name={result.name}
                      />
                      <VStack spacing={0} align="flex-start" flex={1}>
                        <HStack spacing={2}>
                          <Icon size={14} />
                          <Text fontWeight="medium" fontSize="sm">
                            {result.name}
                          </Text>
                          {result.verified && (
                            <Badge colorScheme="blue" size="sm">
                              ✓
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {result.type === 'nft' && `${result.collection} • ${result.price}`}
                          {result.type === 'collection' && `${result.items} items • Floor: ${result.floorPrice}`}
                          {result.type === 'user' && 'User Profile'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
              
              {query && (
                <>
                  <Divider />
                  <Box
                    p={3}
                    _hover={{ bg: suggestionHoverBg }}
                    cursor="pointer"
                    onClick={() => handleSearch(query)}
                  >
                    <HStack spacing={3}>
                      <Box
                        w={8}
                        h={8}
                        bg="blue.500"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                      >
                        <FiSearch size={16} />
                      </Box>
                      <Text fontWeight="medium" fontSize="sm">
                        Search for "{query}"
                      </Text>
                    </HStack>
                  </Box>
                </>
              )}
            </VStack>
          ) : query ? (
            <Box p={4} textAlign="center">
              <Text color="gray.500" fontSize="sm">
                No results found for "{query}"
              </Text>
              <Button
                size="sm"
                variant="ghost"
                mt={2}
                onClick={() => handleSearch(query)}
              >
                Search anyway
              </Button>
            </Box>
          ) : null}
        </Box>
      )}
    </Box>
  );
};

/**
 * Notifications Component
 */
const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'bid',
      title: 'New bid received',
      message: 'Someone bid 0.5 ETH on your NFT "Cool Art #123"',
      time: '2 minutes ago',
      read: false,
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '2',
      type: 'sale',
      title: 'NFT sold!',
      message: 'Your NFT "Digital Masterpiece" has been sold for 1.2 ETH',
      time: '1 hour ago',
      read: false,
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '3',
      type: 'follow',
      title: 'New follower',
      message: 'CryptoCollector started following you',
      time: '3 hours ago',
      read: true,
      avatar: '/api/placeholder/32/32'
    }
  ]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Color mode values - moved outside of callbacks
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const unreadBg = useColorModeValue('blue.50', 'blue.900');
  
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bid': return FiTrendingUp;
      case 'sale': return FiShoppingBag;
      case 'follow': return FiUser;
      default: return FiBell;
    }
  };
  
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        variant="ghost"
        icon={<FiBell />}
        position="relative"
        aria-label="Notifications"
      >
        {unreadCount > 0 && (
          <Badge
            position="absolute"
            top="-1"
            right="-1"
            colorScheme="red"
            borderRadius="full"
            fontSize="xs"
            minW={5}
            h={5}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </MenuButton>
      <MenuList maxW="350px" p={0}>
        {/* Header */}
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center">
            <Text fontWeight="semibold">Notifications</Text>
            {unreadCount > 0 && (
              <Button size="xs" variant="ghost" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </Flex>
        </Box>
        
        {/* Notifications List */}
        <VStack spacing={0} align="stretch" maxH="400px" overflowY="auto">
          {notifications.length === 0 ? (
            <Box p={8} textAlign="center">
              <FiBell size={32} color="gray.400" style={{ margin: '0 auto 16px' }} />
              <Text color="gray.500" fontSize="sm">
                No notifications yet
              </Text>
            </Box>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <Box
                  key={notification.id}
                  p={4}
                  _hover={{ bg: hoverBg }}
                  cursor="pointer"
                  onClick={() => markAsRead(notification.id)}
                  bg={!notification.read ? unreadBg : 'transparent'}
                  borderLeft={!notification.read ? '3px solid' : 'none'}
                  borderColor="blue.500"
                >
                  <HStack spacing={3} align="flex-start">
                    <Avatar size="sm" src={notification.avatar} />
                    <VStack spacing={1} align="flex-start" flex={1}>
                      <HStack spacing={2}>
                        <Icon size={14} />
                        <Text fontWeight="medium" fontSize="sm">
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <Box w={2} h={2} bg="blue.500" borderRadius="full" />
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.600">
                        {notification.message}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {notification.time}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              );
            })
          )}
        </VStack>
        
        {/* Footer */}
        {notifications.length > 0 && (
          <Box p={3} borderTop="1px" borderColor={borderColor}>
            <Button size="sm" variant="ghost" w="full" as={RouterLink} to="/notifications">
              View all notifications
            </Button>
          </Box>
        )}
      </MenuList>
    </Menu>
  );
};

/**
 * User Menu Component
 */
const UserMenu = () => {
  const { account, isConnected, disconnect, balance } = useWeb3();
  const { userProfile } = useNFT();
  const navigate = useNavigate();
  const toast = useCustomToast();
  
  const handleDisconnect = () => {
    disconnect();
    toast.success('Disconnected', 'Wallet disconnected successfully');
    navigate('/');
  };
  
  if (!isConnected) {
    return <WalletConnect size="sm" />;
  }
  
  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        rightIcon={<FiChevronDown />}
        size="sm"
        px={2}
      >
        <HStack spacing={2}>
          <Avatar
            size="sm"
            src={userProfile?.avatar}
            name={userProfile?.name || formatAddress(account)}
          />
          <VStack spacing={0} align="flex-start" display={{ base: 'none', md: 'flex' }}>
            <Text fontSize="sm" fontWeight="medium">
              {userProfile?.name || formatAddress(account)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0 ETH'}
            </Text>
          </VStack>
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuItem
          icon={<FiUser />}
          as={RouterLink}
          to={`/profile/${account}`}
        >
          My Profile
        </MenuItem>
        <MenuItem
          icon={<FiShoppingBag />}
          as={RouterLink}
          to="/marketplace"
        >
          Marketplace
        </MenuItem>
        <MenuItem
          icon={<FiActivity />}
          as={RouterLink}
          to={`/profile/${account}/activity`}
        >
          Activity
        </MenuItem>

        <MenuDivider />
        <MenuItem
          icon={<FiSettings />}
          as={RouterLink}
          to="/settings"
        >
          Settings
        </MenuItem>
        <MenuItem
          icon={<FiHelpCircle />}
          as={RouterLink}
          to="/help"
        >
          Help & Support
        </MenuItem>
        <MenuDivider />
        <MenuItem
          icon={<FiLogOut />}
          onClick={handleDisconnect}
          color="red.500"
        >
          Disconnect
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

/**
 * Main Header Component
 */
const Header = ({ onMenuOpen, isScrolled = false }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isConnected } = useWeb3();
  const navigate = useNavigate();
  const toast = useCustomToast();
  const location = useLocation();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  const handleCreateNFT = () => {
    if (!isConnected) {
      toast.error('Wallet Required', 'Please connect your wallet to create NFTs');
      return;
    }
    navigate('/create');
  };
  
  return (
    <Box
      as="header"
      bg={isScrolled ? `${bgColor}F2` : bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
      backdropFilter="blur(10px)"
      shadow={isScrolled ? 'sm' : 'none'}
      transition="all 0.2s"
    >
      <Container maxW="container.xl" py={4}>
        <Flex align="center" justify="space-between">
          {/* Logo & Mobile Menu */}
          <HStack spacing={4}>
            {isMobile && (
              <IconButton
                variant="ghost"
                icon={<FiMenu />}
                onClick={onMenuOpen}
                aria-label="Open menu"
              />
            )}
            
            <Logo size={isMobile ? 'sm' : 'md'} />
          </HStack>
          
          {/* Search Bar - Desktop */}
          {!isMobile && (
            <Box flex={1} maxW="500px" mx={8}>
              <SearchBar />
            </Box>
          )}
          
          {/* Actions */}
          <HStack spacing={2}>
            {/* Create Button */}
            <Tooltip label="Create NFT" hasArrow>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                variant={isMobile ? 'ghost' : 'solid'}
                size={isMobile ? 'sm' : 'md'}
                onClick={handleCreateNFT}
              >
                {isMobile ? '' : 'Create'}
              </Button>
            </Tooltip>
            
            {/* Theme Toggle */}
            <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} hasArrow>
              <IconButton
                variant="ghost"
                icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
              />
            </Tooltip>
            
            {/* Notifications */}
            {isConnected && <NotificationMenu />}
            
            {/* Network Switcher */}
            {isConnected && (
              <NetworkSwitcher variant="minimal" />
            )}
            
            {/* User Menu / Wallet Connect */}
            <UserMenu />
          </HStack>
        </Flex>
        
        {/* Mobile Search */}
        {isMobile && location.pathname !== '/search' && (
          <Box mt={4}>
            <SearchBar />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Header;
export { Logo, SearchBar, NotificationMenu, UserMenu };