import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Badge,
  Divider,
  Link,
  useColorModeValue,
  useBreakpointValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar
} from '@chakra-ui/react';
import {
  FiCreditCard,
  FiChevronDown,
  FiCopy,
  FiExternalLink,
  FiLogOut,
  FiSettings,
  FiRefreshCw,
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';
import { useWeb3 } from '../../contexts/Web3Context';
import { useCustomToast } from '../common/Toast';
import { formatAddress, getBlockExplorerUrl } from '../../utils/web3';
import { copyToClipboard } from '../../utils/helpers';
import { SUPPORTED_NETWORKS } from '../../utils/constants';

/**
 * Wallet Connect Component
 * Main component for wallet connection and management
 */
const WalletConnect = ({ size = 'md', variant = 'solid', ...props }) => {
  const {
    account,
    balance,
    network,
    isConnecting,
    isConnected,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    error
  } = useWeb3();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useCustomToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!isConnected) {
    return (
      <>
        <Button
          leftIcon={<FiCreditCard />}
          onClick={onOpen}
          isLoading={isConnecting}
          loadingText="Connecting..."
          size={size}
          variant={variant}
          colorScheme="blue"
          {...props}
        >
          Connect Wallet
        </Button>
        
        <WalletModal isOpen={isOpen} onClose={onClose} />
      </>
    );
  }

  if (isMobile) {
    return <MobileWalletInfo />;
  }

  return <DesktopWalletInfo />;
};

/**
 * Desktop Wallet Info Component
 */
const DesktopWalletInfo = () => {
  const {
    account,
    balance,
    network,
    chainId,
    disconnectWallet,
    switchNetwork
  } = useWeb3();
  
  const toast = useCustomToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleCopyAddress = () => {
    copyToClipboard(account);
    toast.success('Address Copied', 'Wallet address copied to clipboard');
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.info('Wallet Disconnected', 'Your wallet has been disconnected');
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<FiChevronDown />}
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        _hover={{ borderColor: 'blue.300' }}
        _active={{ borderColor: 'blue.500' }}
      >
        <HStack spacing={3}>
          <Avatar size="sm" name={account} />
          <VStack spacing={0} align="start">
            <Text fontSize="sm" fontWeight="medium">
              {formatAddress(account)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {parseFloat(balance).toFixed(4)} ETH
            </Text>
          </VStack>
          {network && (
            <Badge
              colorScheme={network.name === 'mainnet' ? 'green' : 'orange'}
              variant="subtle"
              fontSize="xs"
            >
              {network.name}
            </Badge>
          )}
        </HStack>
      </MenuButton>
      
      <MenuList>
        <MenuItem icon={<FiCopy />} onClick={handleCopyAddress}>
          Copy Address
        </MenuItem>
        
        <MenuItem
          icon={<FiExternalLink />}
          as={Link}
          href={getBlockExplorerUrl(chainId, account, 'address')}
          isExternal
        >
          View on Etherscan
        </MenuItem>
        
        <MenuDivider />
        
        <MenuItem icon={<FiSettings />}>
          Wallet Settings
        </MenuItem>
        
        <MenuItem icon={<FiRefreshCw />}>
          Refresh Balance
        </MenuItem>
        
        <MenuDivider />
        
        <MenuItem icon={<FiLogOut />} onClick={handleDisconnect}>
          Disconnect
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

/**
 * Mobile Wallet Info Component
 */
const MobileWalletInfo = () => {
  const { account, balance, network } = useWeb3();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton
        icon={<FiCreditCard />}
        onClick={onOpen}
        variant="outline"
        size="sm"
        aria-label="Wallet"
      />
      
      <WalletInfoModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

/**
 * Wallet Modal Component
 * Modal for selecting and connecting wallets
 */
const WalletModal = ({ isOpen, onClose }) => {
  const { connectWallet, isConnecting, error } = useWeb3();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const toast = useCustomToast();

  const walletOptions = [
    {
      name: 'MetaMask',
      icon: '/images/metamask.svg',
      description: 'Connect using browser wallet',
      connector: 'metamask',
      installed: typeof window !== 'undefined' && window.ethereum?.isMetaMask
    },
    {
      name: 'WalletConnect',
      icon: '/images/walletconnect.svg',
      description: 'Connect using WalletConnect',
      connector: 'walletconnect',
      installed: true
    },
    {
      name: 'Coinbase Wallet',
      icon: '/images/coinbase.svg',
      description: 'Connect using Coinbase Wallet',
      connector: 'coinbase',
      installed: typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet
    }
  ];

  const handleConnect = async (connector) => {
    try {
      setSelectedWallet(connector);
      await connectWallet(connector);
      toast.success('Wallet Connected', 'Successfully connected to your wallet');
      onClose();
    } catch (err) {
      toast.error('Connection Failed', err.message || 'Failed to connect wallet');
    } finally {
      setSelectedWallet(null);
    }
  };

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <FiCreditCard />
            <Text>Connect Wallet</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={4}>
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Choose how you want to connect. If you don't have a wallet, you can select a provider and create one.
            </Text>
            
            <VStack spacing={3} w="full">
              {walletOptions.map((wallet) => (
                <WalletOption
                  key={wallet.connector}
                  wallet={wallet}
                  isConnecting={isConnecting && selectedWallet === wallet.connector}
                  onConnect={handleConnect}
                  onInstall={wallet.name === 'MetaMask' ? handleInstallMetaMask : null}
                />
              ))}
            </VStack>
            
            <Divider />
            
            <Text fontSize="xs" color="gray.500" textAlign="center">
              By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

/**
 * Wallet Option Component
 */
const WalletOption = ({ wallet, isConnecting, onConnect, onInstall }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!wallet.installed && onInstall) {
    return (
      <Box
        w="full"
        p={4}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        bg={bgColor}
      >
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Image src={wallet.icon} alt={wallet.name} boxSize="32px" />
            <VStack align="start" spacing={0}>
              <Text fontWeight="medium">{wallet.name}</Text>
              <Text fontSize="sm" color="gray.500">
                Not installed
              </Text>
            </VStack>
          </HStack>
          
          <Button size="sm" onClick={onInstall}>
            Install
          </Button>
        </HStack>
      </Box>
    );
  }

  return (
    <Box
      w="full"
      p={4}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
      _hover={{ bg: hoverBg, cursor: 'pointer' }}
      onClick={() => onConnect(wallet.connector)}
      position="relative"
    >
      <HStack justify="space-between">
        <HStack spacing={3}>
          <Image src={wallet.icon} alt={wallet.name} boxSize="32px" />
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium">{wallet.name}</Text>
            <Text fontSize="sm" color="gray.500">
              {wallet.description}
            </Text>
          </VStack>
        </HStack>
        
        {isConnecting ? (
          <Spinner size="sm" />
        ) : wallet.installed ? (
          <FiCheck color="green" />
        ) : (
          <FiAlertCircle color="orange" />
        )}
      </HStack>
    </Box>
  );
};

/**
 * Wallet Info Modal Component
 * Detailed wallet information modal for mobile
 */
const WalletInfoModal = ({ isOpen, onClose }) => {
  const {
    account,
    balance,
    network,
    chainId,
    disconnectWallet
  } = useWeb3();
  
  const toast = useCustomToast();

  const handleCopyAddress = () => {
    copyToClipboard(account);
    toast.success('Address Copied', 'Wallet address copied to clipboard');
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.info('Wallet Disconnected', 'Your wallet has been disconnected');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <FiCreditCard />
            <Text>Wallet Info</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <Avatar size="lg" name={account} />
            
            <VStack spacing={2}>
              <Text fontSize="lg" fontWeight="bold">
                {parseFloat(balance).toFixed(4)} ETH
              </Text>
              
              <HStack>
                <Text fontSize="sm" color="gray.500">
                  {formatAddress(account)}
                </Text>
                <IconButton
                  size="xs"
                  icon={<FiCopy />}
                  onClick={handleCopyAddress}
                  aria-label="Copy address"
                />
              </HStack>
              
              {network && (
                <Badge colorScheme={network.name === 'mainnet' ? 'green' : 'orange'}>
                  {network.name}
                </Badge>
              )}
            </VStack>
            
            <VStack spacing={2} w="full">
              <Button
                leftIcon={<FiExternalLink />}
                as={Link}
                href={getBlockExplorerUrl(chainId, account, 'address')}
                isExternal
                w="full"
                variant="outline"
              >
                View on Etherscan
              </Button>
              
              <Button
                leftIcon={<FiLogOut />}
                onClick={handleDisconnect}
                w="full"
                colorScheme="red"
                variant="outline"
              >
                Disconnect Wallet
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

/**
 * Network Switcher Component
 */
export const NetworkSwitcher = ({ size = 'sm' }) => {
  const { network, switchNetwork } = useWeb3();
  const toast = useCustomToast();

  const handleNetworkSwitch = async (networkId) => {
    try {
      await switchNetwork(networkId);
      const networkName = SUPPORTED_NETWORKS.find(n => n.chainId === networkId)?.name;
      toast.success('Network Switched', `Switched to ${networkName}`);
    } catch (error) {
      toast.error('Network Switch Failed', error.message);
    }
  };

  return (
    <Menu>
      <MenuButton as={Button} size={size} variant="outline">
        <HStack spacing={2}>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg={network?.name === 'mainnet' ? 'green.400' : 'orange.400'}
          />
          <Text fontSize="sm">{network?.name || 'Unknown'}</Text>
          <FiChevronDown size={12} />
        </HStack>
      </MenuButton>
      
      <MenuList>
        {SUPPORTED_NETWORKS.map((net) => (
          <MenuItem
            key={net.chainId}
            onClick={() => handleNetworkSwitch(net.chainId)}
            icon={
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={net.name === 'mainnet' ? 'green.400' : 'orange.400'}
              />
            }
          >
            {net.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

/**
 * Wallet Status Component
 */
export const WalletStatus = () => {
  const { isConnected, account, balance, network } = useWeb3();

  if (!isConnected) {
    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <AlertDescription>
          Please connect your wallet to continue
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert status="success" borderRadius="md">
      <AlertIcon />
      <VStack align="start" spacing={1} flex={1}>
        <Text fontSize="sm" fontWeight="medium">
          Wallet Connected
        </Text>
        <HStack spacing={4}>
          <Text fontSize="xs" color="gray.600">
            {formatAddress(account)}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {parseFloat(balance).toFixed(4)} ETH
          </Text>
          {network && (
            <Badge size="sm" colorScheme={network.name === 'mainnet' ? 'green' : 'orange'}>
              {network.name}
            </Badge>
          )}
        </HStack>
      </VStack>
    </Alert>
  );
};

export default WalletConnect;