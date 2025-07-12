import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Container,
  Spacer,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useBreakpointValue,
  Collapse,
  Divider,
  Link,
  Image,
  useToast,
  Portal,
  Slide,
  ScaleFade,
  Fade
} from '@chakra-ui/react';
import {
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiHome,
  FiCompass,
  FiTrendingUp,
  FiUser,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiBell,
  FiHeart,
  FiShoppingCart,
  FiCreditCard,
  FiGrid,
  FiList,
  FiActivity,
  FiBookmark,
  FiHelpCircle,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFTContext } from '../../contexts/NFTContext';
import { WalletConnect, NetworkSwitcher } from '../wallet';
import { SearchBar } from '../common';
import { useCustomToast } from '../common/Toast';
import { formatAddress } from '../../utils/web3';
import { useLocalStorage } from '../../hooks';

/**
 * Navigation Items
 */
const navigationItems = [
  {
    label: 'Home',
    path: '/',
    icon: FiHome,
    exact: true
  },
  {
    label: 'Explore',
    path: '/explore',
    icon: FiCompass,
    children: [
      { label: 'All NFTs', path: '/explore' },
      { label: 'Art', path: '/explore/art' },
      { label: 'Music', path: '/explore/music' },
      { label: 'Photography', path: '/explore/photography' },
      { label: 'Gaming', path: '/explore/gaming' },
      { label: 'Sports', path: '/explore/sports' }
    ]
  },
  {
    label: 'Collections',
    path: '/collections',
    icon: FiGrid
  },
  {
    label: 'Rankings',
    path: '/rankings',
    icon: FiTrendingUp
  },
  {
    label: 'Activity',
    path: '/activity',
    icon: FiActivity
  }
];

/**
 * Header Component
 */
const Header = ({ onMenuOpen }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { account, isConnected, disconnect } = useWeb3();
  const { userProfile } = useNFTContext();
  const navigate = useNavigate();
  const toast = useCustomToast();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  
  const handleDisconnect = () => {
    disconnect();
    toast.success('Disconnected', 'Wallet disconnected successfully');
    navigate('/');
  };
  
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
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
      backdropFilter="blur(10px)"
      bgOpacity={0.95}
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
            
            <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
              <HStack spacing={2}>
                <Box
                  w={8}
                  h={8}
                  bg="gradient.primary"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontWeight="bold"
                >
                  N
                </Box>
                <Text fontSize="xl" fontWeight="bold" color="brand.500">
                  NFTMarket
                </Text>
              </HStack>
            </Link>
          </HStack>
          
          {/* Search Bar - Desktop */}
          {!isMobile && (
            <Box flex={1} maxW="400px" mx={8}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Search NFTs, collections, users..."
                size="md"
              />
            </Box>
          )}
          
          {/* Actions */}
          <HStack spacing={4}>
            {/* Create Button */}
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              variant={isMobile ? 'ghost' : 'solid'}
              size={isMobile ? 'sm' : 'md'}
              onClick={handleCreateNFT}
            >
              {isMobile ? '' : 'Create'}
            </Button>
            
            {/* Theme Toggle */}
            <IconButton
              variant="ghost"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              aria-label="Toggle color mode"
            />
            
            {/* Notifications */}
            {isConnected && (
              <Menu>
                <MenuButton
                  as={IconButton}
                  variant="ghost"
                  icon={<FiBell />}
                  position="relative"
                >
                  {notifications.length > 0 && (
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
                      {notifications.length}
                    </Badge>
                  )}
                </MenuButton>
                <MenuList>
                  {notifications.length === 0 ? (
                    <MenuItem isDisabled>
                      No new notifications
                    </MenuItem>
                  ) : (
                    notifications.map((notification, index) => (
                      <MenuItem key={index}>
                        {notification.message}
                      </MenuItem>
                    ))
                  )}
                </MenuList>
              </Menu>
            )}
            
            {/* Network Switcher */}
            {isConnected && (
              <NetworkSwitcher variant="minimal" />
            )}
            
            {/* User Menu / Wallet Connect */}
            {isConnected ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  rightIcon={<FiChevronDown />}
                  size="sm"
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      src={userProfile?.avatar}
                      name={userProfile?.name || formatAddress(account)}
                    />
                    {!isMobile && (
                      <Text fontSize="sm">
                        {userProfile?.name || formatAddress(account)}
                      </Text>
                    )}
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
                    icon={<FiGrid />}
                    as={RouterLink}
                    to={`/profile/${account}/collected`}
                  >
                    My NFTs
                  </MenuItem>
                  <MenuItem
                    icon={<FiHeart />}
                    as={RouterLink}
                    to={`/profile/${account}/favorites`}
                  >
                    Favorites
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
            ) : (
              <WalletConnect size="sm" />
            )}
          </HStack>
        </Flex>
        
        {/* Mobile Search */}
        {isMobile && location.pathname !== '/search' && (
          <Box mt={4}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search NFTs, collections, users..."
              size="md"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

/**
 * Sidebar Component
 */
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  
  const toggleExpanded = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };
  
  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  const NavItem = ({ item, level = 0 }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.label];
    const active = isActive(item.path, item.exact);
    
    return (
      <Box>
        <Flex
          as={hasChildren ? Button : RouterLink}
          to={!hasChildren ? item.path : undefined}
          onClick={hasChildren ? () => toggleExpanded(item.label) : onClose}
          align="center"
          px={4 + level * 4}
          py={3}
          bg={active ? activeBg : 'transparent'}
          color={active ? activeColor : 'inherit'}
          _hover={{ bg: activeBg, color: activeColor }}
          borderRadius="md"
          mx={2}
          variant="ghost"
          justifyContent="flex-start"
          fontWeight={active ? 'semibold' : 'normal'}
          w="calc(100% - 16px)"
        >
          <Box as={item.icon} mr={3} />
          <Text flex={1} textAlign="left">
            {item.label}
          </Text>
          {hasChildren && (
            <Box as={isExpanded ? FiChevronUp : FiChevronDown} />
          )}
        </Flex>
        
        {hasChildren && (
          <Collapse in={isExpanded}>
            <VStack spacing={1} align="stretch" mt={1}>
              {item.children.map((child) => (
                <NavItem key={child.path} item={child} level={level + 1} />
              ))}
            </VStack>
          </Collapse>
        )}
      </Box>
    );
  };
  
  const SidebarContent = () => (
    <VStack spacing={1} align="stretch" py={4}>
      {navigationItems.map((item) => (
        <NavItem key={item.path} item={item} />
      ))}
      
      <Divider my={4} />
      
      {/* Quick Links */}
      <Box px={6} py={2}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={2}>
          Quick Links
        </Text>
        <VStack spacing={1} align="stretch">
          <Link
            as={RouterLink}
            to="/docs"
            fontSize="sm"
            color="gray.600"
            _hover={{ color: 'blue.500' }}
          >
            Documentation
          </Link>
          <Link
            href="https://discord.gg/nftmarket"
            fontSize="sm"
            color="gray.600"
            _hover={{ color: 'blue.500' }}
            isExternal
          >
            Discord <FiExternalLink style={{ display: 'inline', marginLeft: '4px' }} />
          </Link>
          <Link
            href="https://twitter.com/nftmarket"
            fontSize="sm"
            color="gray.600"
            _hover={{ color: 'blue.500' }}
            isExternal
          >
            Twitter <FiExternalLink style={{ display: 'inline', marginLeft: '4px' }} />
          </Link>
        </VStack>
      </Box>
    </VStack>
  );
  
  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w="280px"
        bg={bgColor}
        borderRight="1px"
        borderColor={borderColor}
        position="fixed"
        left={0}
        top="73px"
        bottom={0}
        overflowY="auto"
        zIndex={100}
      >
        <SidebarContent />
      </Box>
      
      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={2}>
              <Box
                w={6}
                h={6}
                bg="gradient.primary"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
                fontSize="sm"
              >
                N
              </Box>
              <Text fontSize="lg" fontWeight="bold" color="brand.500">
                NFTMarket
              </Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

/**
 * Footer Component
 */
const Footer = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      as="footer"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      mt="auto"
    >
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8}>
          {/* Main Footer Content */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'center', md: 'flex-start' }}
            w="full"
            spacing={8}
            gap={8}
          >
            {/* Brand */}
            <VStack spacing={4} align={{ base: 'center', md: 'flex-start' }}>
              <HStack spacing={2}>
                <Box
                  w={8}
                  h={8}
                  bg="gradient.primary"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontWeight="bold"
                >
                  N
                </Box>
                <Text fontSize="xl" fontWeight="bold" color="brand.500">
                  NFTMarket
                </Text>
              </HStack>
              <Text
                color="gray.600"
                textAlign={{ base: 'center', md: 'left' }}
                maxW="300px"
              >
                The world's first and largest digital marketplace for crypto collectibles and non-fungible tokens (NFTs).
              </Text>
            </VStack>
            
            {/* Links */}
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              spacing={8}
              gap={8}
              align={{ base: 'center', sm: 'flex-start' }}
            >
              <VStack spacing={3} align={{ base: 'center', sm: 'flex-start' }}>
                <Text fontWeight="semibold">Marketplace</Text>
                <VStack spacing={2} align={{ base: 'center', sm: 'flex-start' }}>
                  <Link as={RouterLink} to="/explore" fontSize="sm" color="gray.600">
                    Explore
                  </Link>
                  <Link as={RouterLink} to="/collections" fontSize="sm" color="gray.600">
                    Collections
                  </Link>
                  <Link as={RouterLink} to="/rankings" fontSize="sm" color="gray.600">
                    Rankings
                  </Link>
                  <Link as={RouterLink} to="/activity" fontSize="sm" color="gray.600">
                    Activity
                  </Link>
                </VStack>
              </VStack>
              
              <VStack spacing={3} align={{ base: 'center', sm: 'flex-start' }}>
                <Text fontWeight="semibold">Account</Text>
                <VStack spacing={2} align={{ base: 'center', sm: 'flex-start' }}>
                  <Link as={RouterLink} to="/profile" fontSize="sm" color="gray.600">
                    Profile
                  </Link>
                  <Link as={RouterLink} to="/favorites" fontSize="sm" color="gray.600">
                    Favorites
                  </Link>
                  <Link as={RouterLink} to="/settings" fontSize="sm" color="gray.600">
                    Settings
                  </Link>
                </VStack>
              </VStack>
              
              <VStack spacing={3} align={{ base: 'center', sm: 'flex-start' }}>
                <Text fontWeight="semibold">Resources</Text>
                <VStack spacing={2} align={{ base: 'center', sm: 'flex-start' }}>
                  <Link as={RouterLink} to="/help" fontSize="sm" color="gray.600">
                    Help Center
                  </Link>
                  <Link as={RouterLink} to="/docs" fontSize="sm" color="gray.600">
                    Documentation
                  </Link>
                  <Link href="#" fontSize="sm" color="gray.600">
                    Blog
                  </Link>
                  <Link href="#" fontSize="sm" color="gray.600">
                    Newsletter
                  </Link>
                </VStack>
              </VStack>
              
              <VStack spacing={3} align={{ base: 'center', sm: 'flex-start' }}>
                <Text fontWeight="semibold">Company</Text>
                <VStack spacing={2} align={{ base: 'center', sm: 'flex-start' }}>
                  <Link href="#" fontSize="sm" color="gray.600">
                    About
                  </Link>
                  <Link href="#" fontSize="sm" color="gray.600">
                    Careers
                  </Link>
                  <Link href="#" fontSize="sm" color="gray.600">
                    Terms
                  </Link>
                  <Link href="#" fontSize="sm" color="gray.600">
                    Privacy
                  </Link>
                </VStack>
              </VStack>
            </Flex>
          </Flex>
          
          <Divider />
          
          {/* Bottom Footer */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            w="full"
            gap={4}
          >
            <Text fontSize="sm" color="gray.600">
              © 2024 NFTMarket. All rights reserved.
            </Text>
            
            <HStack spacing={4}>
              <Link href="#" color="gray.600" _hover={{ color: 'blue.500' }}>
                <FiExternalLink />
              </Link>
              <Link href="#" color="gray.600" _hover={{ color: 'blue.500' }}>
                <FiExternalLink />
              </Link>
              <Link href="#" color="gray.600" _hover={{ color: 'blue.500' }}>
                <FiExternalLink />
              </Link>
            </HStack>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

/**
 * Main Layout Component
 */
const Layout = ({ children, showSidebar = true, showFooter = true, ...props }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  // Handle scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <Flex direction="column" minH="100vh" bg={bgColor} {...props}>
      {/* Header */}
      <Header onMenuOpen={onOpen} isScrolled={isScrolled} />
      
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar isOpen={isOpen} onClose={onClose} />
      )}
      
      {/* Main Content */}
      <Box
        flex={1}
        ml={{ base: 0, lg: showSidebar ? '280px' : 0 }}
        transition="margin-left 0.2s"
      >
        <Container
          maxW="container.xl"
          py={8}
          px={{ base: 4, md: 8 }}
        >
          {children}
        </Container>
      </Box>
      
      {/* Footer */}
      {showFooter && (
        <Box ml={{ base: 0, lg: showSidebar ? '280px' : 0 }}>
          <Footer />
        </Box>
      )}
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </Flex>
  );
};

/**
 * Scroll to Top Component
 */
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <ScaleFade in={isVisible}>
      <IconButton
        position="fixed"
        bottom={8}
        right={8}
        colorScheme="blue"
        borderRadius="full"
        size="lg"
        icon={<FiChevronUp />}
        onClick={scrollToTop}
        zIndex={1000}
        shadow="lg"
        aria-label="Scroll to top"
      />
    </ScaleFade>
  );
};

export default Layout;
export { Header, Sidebar, Footer, ScrollToTop };