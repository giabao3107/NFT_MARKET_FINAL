import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  Avatar,
  Badge,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWeb3();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const navItems = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Create', path: '/create' },
    { name: 'Creator', path: '/creator' },
    { name: 'Profile', path: '/profile' },
  ];

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    if (!balance || balance === '0') return '0';
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) return '0';
    
    // If the number is very small (less than 0.0001), show more decimal places
    if (numBalance < 0.0001 && numBalance > 0) {
      return numBalance.toFixed(8);
    }
    
    // For normal numbers, show up to 4 decimal places but remove trailing zeros
    return parseFloat(numBalance.toFixed(4)).toString();
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 11155111:
        return 'Sepolia';
      case 31337:
        return 'Localhost';
      default:
        return 'Unknown';
    }
  };

  const getNetworkColor = (chainId) => {
    switch (chainId) {
      case 1:
        return 'green';
      case 11155111:
        return 'purple';
      case 31337:
        return 'blue';
      default:
        return 'red';
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, ...props }) => (
    <Button
      as={RouterLink}
      to={to}
      variant="ghost"
      size="md"
      fontWeight={isActivePath(to) ? 'bold' : 'medium'}
      color={isActivePath(to) ? 'brand.500' : textColor}
      _hover={{
        bg: hoverBg,
        color: 'brand.500',
      }}
      {...props}
    >
      {children}
    </Button>
  );

  const WalletButton = () => {
    if (!isConnected) {
      return (
        <Button
          onClick={connectWallet}
          isLoading={isConnecting}
          loadingText="Connecting..."
          variant="gradient"
          size="md"
        >
          Connect Wallet
        </Button>
      );
    }

    return (
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          variant="outline"
          size="md"
        >
          <HStack spacing={2}>
            <Avatar size="xs" bg="brand.500" />
            <VStack spacing={0} align="start">
              <Text fontSize="sm" fontWeight="medium">
                {formatAddress(account)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {formatBalance(balance)} ETH
              </Text>
            </VStack>
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="medium">
                Account
              </Text>
              <Text fontSize="xs" color="gray.500">
                {account}
              </Text>
            </VStack>
          </MenuItem>
          <MenuItem>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="medium">
                Balance
              </Text>
              <Text fontSize="xs" color="gray.500">
                {formatBalance(balance)} ETH
              </Text>
            </VStack>
          </MenuItem>
          <MenuItem>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" fontWeight="medium">
                Network
              </Text>
              <Badge colorScheme={getNetworkColor(chainId)} size="sm">
                {getNetworkName(chainId)}
              </Badge>
            </HStack>
          </MenuItem>
          <MenuDivider />
          <MenuItem onClick={() => switchNetwork(11155111)}>
            Switch to Sepolia
          </MenuItem>
          <MenuItem onClick={() => switchNetwork(31337)}>
            Switch to Localhost
          </MenuItem>
          <MenuDivider />
          <MenuItem onClick={disconnectWallet} color="red.500">
            Disconnect
          </MenuItem>
        </MenuList>
      </Menu>
    );
  };

  const MobileNav = () => (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <Text
            fontSize="xl"
            fontWeight="bold"
            bgGradient="linear(to-r, brand.500, purple.500)"
            bgClip="text"
          >
            NFT Market
          </Text>
        </DrawerHeader>
        <DrawerBody>
          <VStack spacing={4} align="stretch">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                justifyContent="flex-start"
              >
                {item.name}
              </NavLink>
            ))}
            <Box pt={4}>
              <WalletButton />
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <>
      <Box
        bg={bg}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={1000}
        backdropFilter="blur(10px)"
      >
        <Flex
          maxW="7xl"
          mx="auto"
          px={{ base: 4, md: 8 }}
          py={4}
          align="center"
          justify="space-between"
        >
          {/* Logo */}
          <Box>
            <Text
              as={RouterLink}
              to="/"
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, purple.500)"
              bgClip="text"
              _hover={{
                transform: 'scale(1.05)',
              }}
              transition="transform 0.2s"
            >
              NFT Market
            </Text>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <HStack spacing={8}>
              <HStack spacing={4}>
                {navItems.map((item) => (
                  <NavLink key={item.name} to={item.path}>
                    {item.name}
                  </NavLink>
                ))}
              </HStack>

              <HStack spacing={2}>
                <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
                  <IconButton
                    aria-label="Toggle color mode"
                    icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                    onClick={toggleColorMode}
                    variant="ghost"
                    size="md"
                  />
                </Tooltip>
                <WalletButton />
              </HStack>
            </HStack>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <HStack spacing={2}>
              <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton
                  aria-label="Toggle color mode"
                  icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size="md"
                />
              </Tooltip>
              <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                onClick={onOpen}
                variant="ghost"
                size="md"
              />
            </HStack>
          )}
        </Flex>
      </Box>

      <MobileNav />
    </>
  );
};

export default Header;