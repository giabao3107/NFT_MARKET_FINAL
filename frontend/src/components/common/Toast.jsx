import React, { createContext, useContext, useCallback } from 'react';
import {
  useToast,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Link,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  useColorModeValue
} from '@chakra-ui/react';
import { FiExternalLink, FiCopy, FiCheck } from 'react-icons/fi';
import { formatAddress, getBlockExplorerUrl } from '../../utils/web3';
import { copyToClipboard } from '../../utils/helpers';
import { useWeb3 } from '../../contexts/Web3Context';

// Toast Context
const ToastContext = createContext();

/**
 * Toast Provider Component
 * Provides toast functionality throughout the app
 */
export const ToastProvider = ({ children }) => {
  const toast = useToast();

  const showToast = useCallback((options) => {
    const {
      title,
      description,
      status = 'info',
      duration = 5000,
      isClosable = true,
      position = 'top-right',
      variant = 'solid',
      ...rest
    } = options;

    return toast({
      title,
      description,
      status,
      duration,
      isClosable,
      position,
      variant,
      ...rest
    });
  }, [toast]);

  // Predefined toast types
  const success = useCallback((title, description, options = {}) => {
    return showToast({
      title,
      description,
      status: 'success',
      ...options
    });
  }, [showToast]);

  const error = useCallback((title, description, options = {}) => {
    return showToast({
      title,
      description,
      status: 'error',
      duration: 8000,
      ...options
    });
  }, [showToast]);

  const warning = useCallback((title, description, options = {}) => {
    return showToast({
      title,
      description,
      status: 'warning',
      ...options
    });
  }, [showToast]);

  const info = useCallback((title, description, options = {}) => {
    return showToast({
      title,
      description,
      status: 'info',
      ...options
    });
  }, [showToast]);

  // Transaction-specific toasts
  const transactionPending = useCallback((txHash, options = {}) => {
    return showToast({
      title: 'Transaction Pending',
      description: (
        <TransactionToast
          txHash={txHash}
          status="pending"
          message="Your transaction is being processed..."
        />
      ),
      status: 'info',
      duration: null,
      isClosable: true,
      ...options
    });
  }, [showToast]);

  const transactionSuccess = useCallback((txHash, message = 'Transaction completed successfully!', options = {}) => {
    return showToast({
      title: 'Transaction Successful',
      description: (
        <TransactionToast
          txHash={txHash}
          status="success"
          message={message}
        />
      ),
      status: 'success',
      duration: 8000,
      ...options
    });
  }, [showToast]);

  const transactionError = useCallback((error, txHash = null, options = {}) => {
    const errorMessage = error?.reason || error?.message || 'Transaction failed';
    
    return showToast({
      title: 'Transaction Failed',
      description: (
        <TransactionToast
          txHash={txHash}
          status="error"
          message={errorMessage}
          error={error}
        />
      ),
      status: 'error',
      duration: 10000,
      ...options
    });
  }, [showToast]);

  // Wallet-specific toasts
  const walletConnected = useCallback((address, options = {}) => {
    return showToast({
      title: 'Wallet Connected',
      description: (
        <WalletToast
          address={address}
          status="connected"
          message="Successfully connected to your wallet"
        />
      ),
      status: 'success',
      ...options
    });
  }, [showToast]);

  const walletDisconnected = useCallback((options = {}) => {
    return showToast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
      status: 'info',
      ...options
    });
  }, [showToast]);

  const networkChanged = useCallback((networkName, options = {}) => {
    return showToast({
      title: 'Network Changed',
      description: `Switched to ${networkName}`,
      status: 'info',
      ...options
    });
  }, [showToast]);

  // NFT-specific toasts
  const nftMinted = useCallback((tokenId, txHash, options = {}) => {
    return showToast({
      title: 'NFT Minted Successfully!',
      description: (
        <NFTToast
          tokenId={tokenId}
          txHash={txHash}
          action="minted"
        />
      ),
      status: 'success',
      duration: 8000,
      ...options
    });
  }, [showToast]);

  const nftListed = useCallback((tokenId, price, txHash, options = {}) => {
    return showToast({
      title: 'NFT Listed for Sale',
      description: (
        <NFTToast
          tokenId={tokenId}
          txHash={txHash}
          action="listed"
          price={price}
        />
      ),
      status: 'success',
      duration: 8000,
      ...options
    });
  }, [showToast]);

  const nftSold = useCallback((tokenId, price, txHash, options = {}) => {
    return showToast({
      title: 'NFT Sold!',
      description: (
        <NFTToast
          tokenId={tokenId}
          txHash={txHash}
          action="sold"
          price={price}
        />
      ),
      status: 'success',
      duration: 8000,
      ...options
    });
  }, [showToast]);

  const value = {
    showToast,
    success,
    error,
    warning,
    info,
    transactionPending,
    transactionSuccess,
    transactionError,
    walletConnected,
    walletDisconnected,
    networkChanged,
    nftMinted,
    nftListed,
    nftSold
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast functionality
 */
export const useCustomToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useCustomToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Transaction Toast Component
 */
const TransactionToast = ({ txHash, status, message, error }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { chainId } = useWeb3();

  const handleCopyHash = () => {
    if (txHash) {
      copyToClipboard(txHash);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'blue';
      case 'success': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box bg={bgColor} border="1px" borderColor={borderColor} borderRadius="md" p={3}>
      <VStack spacing={2} align="start">
        <Text fontSize="sm">{message}</Text>
        
        {status === 'pending' && (
          <Progress size="xs" isIndeterminate colorScheme={getStatusColor()} w="full" />
        )}
        
        {txHash && (
          <HStack spacing={2} w="full">
            <Text fontSize="xs" color="gray.500" flex={1} noOfLines={1}>
              {formatAddress(txHash)}
            </Text>
            
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<FiCopy />}
              onClick={handleCopyHash}
            >
              Copy
            </Button>
            
            <Link
              href={getBlockExplorerUrl(chainId, txHash, 'tx')}
              isExternal
            >
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<FiExternalLink />}
              >
                View
              </Button>
            </Link>
          </HStack>
        )}
        
        {error && error.code && (
          <Text fontSize="xs" color="red.500">
            Error Code: {error.code}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

/**
 * Wallet Toast Component
 */
const WalletToast = ({ address, status, message }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { chainId } = useWeb3();

  const handleCopyAddress = () => {
    copyToClipboard(address);
  };

  return (
    <Box bg={bgColor} border="1px" borderColor={borderColor} borderRadius="md" p={3}>
      <VStack spacing={2} align="start">
        <Text fontSize="sm">{message}</Text>
        
        {address && (
          <HStack spacing={2} w="full">
            <Text fontSize="xs" color="gray.500" flex={1}>
              {formatAddress(address)}
            </Text>
            
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<FiCopy />}
              onClick={handleCopyAddress}
            >
              Copy
            </Button>
            
            <Link
              href={getBlockExplorerUrl(chainId, address, 'address')}
              isExternal
            >
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<FiExternalLink />}
              >
                View
              </Button>
            </Link>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

/**
 * NFT Toast Component
 */
const NFTToast = ({ tokenId, txHash, action, price }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { chainId } = useWeb3();

  const getActionMessage = () => {
    switch (action) {
      case 'minted':
        return `NFT #${tokenId} has been minted successfully!`;
      case 'listed':
        return `NFT #${tokenId} is now listed for ${price} ETH`;
      case 'sold':
        return `NFT #${tokenId} has been sold for ${price} ETH`;
      default:
        return `NFT #${tokenId} action completed`;
    }
  };

  return (
    <Box bg={bgColor} border="1px" borderColor={borderColor} borderRadius="md" p={3}>
      <VStack spacing={2} align="start">
        <Text fontSize="sm">{getActionMessage()}</Text>
        
        {txHash && (
          <HStack spacing={2} w="full">
            <Text fontSize="xs" color="gray.500" flex={1} noOfLines={1}>
              Tx: {formatAddress(txHash)}
            </Text>
            
            <Link
              href={getBlockExplorerUrl(chainId, txHash, 'tx')}
              isExternal
            >
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<FiExternalLink />}
              >
                View
              </Button>
            </Link>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

/**
 * Custom Alert Component
 * Enhanced alert with additional features
 */
export const CustomAlert = ({
  status = 'info',
  title,
  description,
  isClosable = false,
  onClose,
  action,
  ...props
}) => {
  return (
    <Alert status={status} borderRadius="md" {...props}>
      <AlertIcon />
      <Box flex="1">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </Box>
      {action && <Box ml={2}>{action}</Box>}
      {isClosable && (
        <CloseButton
          alignSelf="flex-start"
          position="relative"
          right={-1}
          top={-1}
          onClick={onClose}
        />
      )}
    </Alert>
  );
};

export default ToastProvider;