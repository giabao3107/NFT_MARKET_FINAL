import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Alert,
  AlertIcon,
  AlertDescription,
  IconButton,
  Tooltip,
  useColorModeValue,
  useBreakpointValue,
  Flex,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  Card,
  CardBody,
  Spinner,
  useToast,
  Divider,
  Link
} from '@chakra-ui/react';
import {
  FiChevronDown,
  FiWifi,
  FiWifiOff,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiExternalLink,
  FiSettings,
  FiGlobe,
  FiZap,
  FiShield
} from 'react-icons/fi';
import { useWeb3 } from '../../contexts/Web3Context';
import { useWallet } from '../../hooks/useWallet';
import { useCustomToast } from '../common/Toast';
import { SUPPORTED_NETWORKS, NETWORK_CONFIGS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

/**
 * Network Switcher Component
 */
const NetworkSwitcher = ({ 
  variant = 'button', // 'button', 'badge', 'minimal'
  showNetworkName = true,
  showChainId = false,
  size = 'md',
  ...props 
}) => {
  const { chainId, isConnected } = useWeb3();
  const { isNetworkSupported, switchToNetwork } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [switching, setSwitching] = useState(false);
  const toast = useCustomToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const currentNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === chainId);
  const isWrongNetwork = isConnected && !isNetworkSupported(chainId);

  const handleNetworkSwitch = async (network) => {
    if (network.chainId === chainId) return;
    
    setSwitching(true);
    try {
      await switchToNetwork(network.chainId);
      toast.success('Success', `Switched to ${network.name}`);
      onClose();
    } catch (error) {
      toast.error('Error', `Failed to switch network: ${error.message}`);
    } finally {
      setSwitching(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  // Render different variants
  if (variant === 'badge') {
    return (
      <Badge
        colorScheme={isWrongNetwork ? 'red' : 'green'}
        variant="subtle"
        cursor="pointer"
        onClick={onOpen}
        {...props}
      >
        {currentNetwork?.name || 'Unknown Network'}
        <NetworkModal
          isOpen={isOpen}
          onClose={onClose}
          currentNetwork={currentNetwork}
          onNetworkSwitch={handleNetworkSwitch}
          switching={switching}
        />
      </Badge>
    );
  }

  if (variant === 'minimal') {
    return (
      <HStack
        spacing={2}
        cursor="pointer"
        onClick={onOpen}
        {...props}
      >
        <Box
          w={2}
          h={2}
          borderRadius="full"
          bg={isWrongNetwork ? 'red.400' : 'green.400'}
        />
        {showNetworkName && (
          <Text fontSize="sm">
            {currentNetwork?.name || 'Unknown'}
          </Text>
        )}
        <NetworkModal
          isOpen={isOpen}
          onClose={onClose}
          currentNetwork={currentNetwork}
          onNetworkSwitch={handleNetworkSwitch}
          switching={switching}
        />
      </HStack>
    );
  }

  // Default button variant
  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<FiChevronDown />}
          leftIcon={
            isWrongNetwork ? (
              <FiAlertTriangle color="orange" />
            ) : (
              <FiCheck color="green" />
            )
          }
          variant="outline"
          size={size}
          colorScheme={isWrongNetwork ? 'orange' : 'green'}
          {...props}
        >
          <VStack spacing={0} align="start">
            <Text fontSize="sm" fontWeight="medium">
              {currentNetwork?.name || 'Unknown Network'}
            </Text>
            {showChainId && (
              <Text fontSize="xs" color="gray.500">
                Chain ID: {chainId}
              </Text>
            )}
          </VStack>
        </MenuButton>
        
        <MenuList>
          <MenuItem onClick={onOpen} icon={<FiSettings />}>
            Switch Network
          </MenuItem>
          
          {currentNetwork && (
            <>
              <MenuDivider />
              <MenuItem
                as={Link}
                href={currentNetwork.blockExplorerUrl}
                isExternal
                icon={<FiExternalLink />}
              >
                View Block Explorer
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
      
      <NetworkModal
        isOpen={isOpen}
        onClose={onClose}
        currentNetwork={currentNetwork}
        onNetworkSwitch={handleNetworkSwitch}
        switching={switching}
      />
    </>
  );
};

/**
 * Network Status Indicator Component
 */
const NetworkStatus = ({ showDetails = false }) => {
  const { chainId, isConnected } = useWeb3();
  const { isNetworkSupported } = useWallet();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!isConnected) {
    return (
      <Alert status="warning" size="sm">
        <AlertIcon />
        <AlertDescription>
          Wallet not connected
        </AlertDescription>
      </Alert>
    );
  }

  const currentNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === chainId);
  const isWrongNetwork = !isNetworkSupported(chainId);

  if (isWrongNetwork) {
    return (
      <Alert status="error" size="sm">
        <AlertIcon />
        <AlertDescription>
          Unsupported network. Please switch to a supported network.
        </AlertDescription>
      </Alert>
    );
  }

  if (!showDetails) {
    return (
      <HStack spacing={2}>
        <Box w={2} h={2} borderRadius="full" bg="green.400" />
        <Text fontSize="sm" color="green.500">
          Connected to {currentNetwork?.name}
        </Text>
      </HStack>
    );
  }

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor} size="sm">
      <CardBody>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">
              Network Status
            </Text>
            <Badge colorScheme="green" variant="subtle">
              Connected
            </Badge>
          </HStack>
          
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.500">Network:</Text>
              <Text fontSize="xs" fontWeight="medium">
                {currentNetwork?.name}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.500">Chain ID:</Text>
              <Text fontSize="xs" fontWeight="medium">
                {chainId}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.500">Currency:</Text>
              <Text fontSize="xs" fontWeight="medium">
                {currentNetwork?.nativeCurrency?.symbol}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Network Modal Component
 */
const NetworkModal = ({ 
  isOpen, 
  onClose, 
  currentNetwork, 
  onNetworkSwitch, 
  switching 
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleNetworkSelect = async (network) => {
    setSelectedNetwork(network.chainId);
    await onNetworkSwitch(network);
    setSelectedNetwork(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <FiGlobe />
            <Text>Switch Network</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Current Network */}
            {currentNetwork && (
              <>
                <Text fontSize="sm" fontWeight="medium" color="gray.500">
                  Current Network
                </Text>
                
                <NetworkCard
                  network={currentNetwork}
                  isCurrent={true}
                  isSelected={false}
                  onClick={() => {}}
                  isLoading={false}
                />
                
                <Divider />
              </>
            )}
            
            {/* Available Networks */}
            <Text fontSize="sm" fontWeight="medium" color="gray.500">
              Available Networks
            </Text>
            
            <SimpleGrid columns={1} spacing={3}>
              {SUPPORTED_NETWORKS.map(network => {
                const isCurrent = network.chainId === currentNetwork?.chainId;
                const isSelected = selectedNetwork === network.chainId;
                const isLoading = switching && isSelected;
                
                return (
                  <NetworkCard
                    key={network.chainId}
                    network={network}
                    isCurrent={isCurrent}
                    isSelected={isSelected}
                    onClick={() => !isCurrent && handleNetworkSelect(network)}
                    isLoading={isLoading}
                  />
                );
              })}
            </SimpleGrid>
            
            <Alert status="info" size="sm">
              <AlertIcon />
              <AlertDescription fontSize="xs">
                Switching networks may require approval in your wallet.
              </AlertDescription>
            </Alert>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

/**
 * Network Card Component
 */
const NetworkCard = ({ 
  network, 
  isCurrent, 
  isSelected, 
  onClick, 
  isLoading 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBorderColor = useColorModeValue('blue.300', 'blue.500');
  const currentBorderColor = useColorModeValue('green.300', 'green.500');
  
  const getBorderColor = () => {
    if (isCurrent) return currentBorderColor;
    if (isSelected) return selectedBorderColor;
    return borderColor;
  };

  const getStatusIcon = () => {
    if (isLoading) return <Spinner size="sm" />;
    if (isCurrent) return <FiCheck color="green" />;
    return null;
  };

  const getStatusBadge = () => {
    if (isCurrent) return <Badge colorScheme="green" size="sm">Current</Badge>;
    if (network.testnet) return <Badge colorScheme="orange" size="sm">Testnet</Badge>;
    return <Badge colorScheme="blue" size="sm">Mainnet</Badge>;
  };

  return (
    <Card
      bg={bgColor}
      border="2px"
      borderColor={getBorderColor()}
      cursor={isCurrent ? 'default' : 'pointer'}
      onClick={onClick}
      _hover={!isCurrent ? { borderColor: selectedBorderColor } : {}}
      opacity={isLoading ? 0.7 : 1}
    >
      <CardBody>
        <Flex align="center">
          <HStack spacing={3} flex={1}>
            {/* Network Icon */}
            <Box
              w={10}
              h={10}
              borderRadius="full"
              bg={network.color || 'gray.200'}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {network.icon ? (
                <Image src={network.icon} alt={network.name} boxSize="24px" />
              ) : (
                <FiGlobe color="white" size={20} />
              )}
            </Box>
            
            {/* Network Info */}
            <VStack align="start" spacing={1} flex={1}>
              <HStack>
                <Text fontWeight="medium">{network.name}</Text>
                {getStatusBadge()}
              </HStack>
              
              <Text fontSize="xs" color="gray.500">
                Chain ID: {network.chainId} • {network.nativeCurrency?.symbol}
              </Text>
              
              {network.description && (
                <Text fontSize="xs" color="gray.400" noOfLines={1}>
                  {network.description}
                </Text>
              )}
            </VStack>
          </HStack>
          
          {/* Status Icon */}
          <Box ml={3}>
            {getStatusIcon()}
          </Box>
        </Flex>
        
        {/* Network Details */}
        {(isSelected || isCurrent) && (
          <VStack spacing={2} mt={3} pt={3} borderTop="1px" borderColor={borderColor}>
            <HStack w="full" justify="space-between">
              <Text fontSize="xs" color="gray.500">RPC URL:</Text>
              <Text fontSize="xs" fontFamily="mono" noOfLines={1}>
                {network.rpcUrl}
              </Text>
            </HStack>
            
            {network.blockExplorerUrl && (
              <HStack w="full" justify="space-between">
                <Text fontSize="xs" color="gray.500">Explorer:</Text>
                <Link
                  href={network.blockExplorerUrl}
                  isExternal
                  fontSize="xs"
                  color="blue.500"
                >
                  View Explorer <FiExternalLink />
                </Link>
              </HStack>
            )}
          </VStack>
        )}
      </CardBody>
    </Card>
  );
};

/**
 * Network Health Component
 */
const NetworkHealth = () => {
  const { chainId } = useWeb3();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const currentNetwork = SUPPORTED_NETWORKS.find(n => n.chainId === chainId);

  useEffect(() => {
    if (currentNetwork) {
      checkNetworkHealth();
    }
  }, [currentNetwork]);

  const checkNetworkHealth = async () => {
    setLoading(true);
    try {
      // This would typically check network status
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHealth({
        status: 'healthy',
        latency: Math.floor(Math.random() * 100) + 50,
        blockHeight: Math.floor(Math.random() * 1000000) + 18000000
      });
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentNetwork) return null;

  return (
    <Card size="sm">
      <CardBody>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">
              Network Health
            </Text>
            <IconButton
              size="xs"
              variant="ghost"
              icon={<FiRefreshCw />}
              onClick={checkNetworkHealth}
              isLoading={loading}
            />
          </HStack>
          
          {loading ? (
            <HStack justify="center">
              <Spinner size="sm" />
              <Text fontSize="xs" color="gray.500">Checking...</Text>
            </HStack>
          ) : health ? (
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">Status:</Text>
                <Badge
                  colorScheme={health.status === 'healthy' ? 'green' : 'red'}
                  size="sm"
                >
                  {health.status}
                </Badge>
              </HStack>
              
              {health.latency && (
                <HStack justify="space-between">
                  <Text fontSize="xs" color="gray.500">Latency:</Text>
                  <Text fontSize="xs">{health.latency}ms</Text>
                </HStack>
              )}
              
              {health.blockHeight && (
                <HStack justify="space-between">
                  <Text fontSize="xs" color="gray.500">Block:</Text>
                  <Text fontSize="xs">#{health.blockHeight.toLocaleString()}</Text>
                </HStack>
              )}
            </VStack>
          ) : (
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Click refresh to check network health
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default NetworkSwitcher;
export { NetworkStatus, NetworkHealth, NetworkModal };