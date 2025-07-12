import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  isMetaMaskInstalled, 
  switchNetwork, 
  addNetwork,
  getNetworkName,
  formatAddress 
} from '../utils/web3';
import { SUPPORTED_NETWORKS } from '../utils/constants';

/**
 * Custom hook for wallet operations
 * Provides wallet connection, network switching, and account management
 */
export const useWallet = () => {
  const { 
    account, 
    chainId, 
    balance, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet,
    error 
  } = useWeb3();
  
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  const [supportedNetworks, setSupportedNetworks] = useState([]);
  const toast = useToast();

  // Initialize supported networks
  useEffect(() => {
    setSupportedNetworks(Object.values(SUPPORTED_NETWORKS));
  }, []);

  // Check if current network is supported
  const isNetworkSupported = useCallback(() => {
    return supportedNetworks.some(network => network.chainId === chainId);
  }, [chainId, supportedNetworks]);

  // Get current network info
  const getCurrentNetwork = useCallback(() => {
    return supportedNetworks.find(network => network.chainId === chainId) || null;
  }, [chainId, supportedNetworks]);

  // Switch to a specific network
  const switchToNetwork = useCallback(async (networkName) => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    const network = SUPPORTED_NETWORKS[networkName.toUpperCase()];
    if (!network) {
      toast({
        title: 'Network Not Supported',
        description: `Network ${networkName} is not supported.`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    setIsNetworkSwitching(true);
    
    try {
      const success = await switchNetwork(network.chainId);
      
      if (!success) {
        // Try to add the network if switching failed
        const added = await addNetwork(network);
        if (!added) {
          throw new Error('Failed to add network');
        }
      }

      toast({
        title: 'Network Switched',
        description: `Successfully switched to ${network.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      console.error('Network switch error:', err);
      toast({
        title: 'Network Switch Failed',
        description: err.message || 'Failed to switch network',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsNetworkSwitching(false);
    }
  }, [isConnected, toast]);

  // Connect wallet with network check
  const connectWithNetworkCheck = useCallback(async (preferredNetwork = 'SEPOLIA') => {
    try {
      await connectWallet();
      
      // Check if we need to switch networks after connection
      setTimeout(async () => {
        if (!isNetworkSupported()) {
          await switchToNetwork(preferredNetwork);
        }
      }, 1000);
    } catch (err) {
      console.error('Wallet connection error:', err);
    }
  }, [connectWallet, isNetworkSupported, switchToNetwork]);

  // Check MetaMask installation
  const checkMetaMask = useCallback(() => {
    const installed = isMetaMaskInstalled();
    if (!installed) {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask to use this application.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    return installed;
  }, [toast]);

  // Get formatted account address
  const getFormattedAddress = useCallback(() => {
    return account ? formatAddress(account) : null;
  }, [account]);

  // Get network display name
  const getNetworkDisplayName = useCallback(() => {
    return getNetworkName(chainId) || 'Unknown Network';
  }, [chainId]);

  // Check if wallet is ready for transactions
  const isWalletReady = useCallback(() => {
    return isConnected && isNetworkSupported() && !isConnecting && !isNetworkSwitching;
  }, [isConnected, isNetworkSupported, isConnecting, isNetworkSwitching]);

  // Get wallet status
  const getWalletStatus = useCallback(() => {
    if (!isMetaMaskInstalled()) return 'not_installed';
    if (!isConnected) return 'not_connected';
    if (isConnecting) return 'connecting';
    if (isNetworkSwitching) return 'switching_network';
    if (!isNetworkSupported()) return 'wrong_network';
    return 'ready';
  }, [isConnected, isConnecting, isNetworkSwitching, isNetworkSupported]);

  return {
    // Wallet state
    account,
    chainId,
    balance,
    isConnected,
    isConnecting,
    isNetworkSwitching,
    error,
    
    // Network info
    currentNetwork: getCurrentNetwork(),
    isNetworkSupported,
    supportedNetworks,
    networkDisplayName: getNetworkDisplayName(),
    
    // Wallet actions
    connectWallet: connectWithNetworkCheck,
    disconnectWallet,
    switchToNetwork,
    checkMetaMask,
    
    // Utility functions
    formattedAddress: getFormattedAddress(),
    isWalletReady: isWalletReady(),
    walletStatus: getWalletStatus(),
  };
};

export default useWallet;