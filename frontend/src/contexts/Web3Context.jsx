import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@chakra-ui/react';

// Initial state
const initialState = {
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  balance: '0',
  isConnecting: false,
  isConnected: false,
  error: null,
};

// Action types
const WEB3_ACTIONS = {
  SET_CONNECTING: 'SET_CONNECTING',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_ACCOUNT: 'SET_ACCOUNT',
  SET_CHAIN_ID: 'SET_CHAIN_ID',
  SET_BALANCE: 'SET_BALANCE',
  SET_ERROR: 'SET_ERROR',
  DISCONNECT: 'DISCONNECT',
};

// Reducer
function web3Reducer(state, action) {
  switch (action.type) {
    case WEB3_ACTIONS.SET_CONNECTING:
      return {
        ...state,
        isConnecting: action.payload,
        error: null,
      };
    case WEB3_ACTIONS.SET_CONNECTED:
      return {
        ...state,
        provider: action.payload.provider,
        signer: action.payload.signer,
        isConnected: true,
        isConnecting: false,
        error: null,
      };
    case WEB3_ACTIONS.SET_ACCOUNT:
      return {
        ...state,
        account: action.payload,
      };
    case WEB3_ACTIONS.SET_CHAIN_ID:
      return {
        ...state,
        chainId: action.payload,
      };
    case WEB3_ACTIONS.SET_BALANCE:
      return {
        ...state,
        balance: action.payload,
      };
    case WEB3_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isConnecting: false,
      };
    case WEB3_ACTIONS.DISCONNECT:
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

// Create context
const Web3Context = createContext();

// Provider component
export function Web3Provider({ children }) {
  const [state, dispatch] = useReducer(web3Reducer, initialState);
  const toast = useToast();

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      dispatch({
        type: WEB3_ACTIONS.SET_ERROR,
        payload: 'MetaMask is not installed. Please install MetaMask to continue.',
      });
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask to connect your wallet.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      dispatch({ type: WEB3_ACTIONS.SET_CONNECTING, payload: true });

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(account);

      dispatch({
        type: WEB3_ACTIONS.SET_CONNECTED,
        payload: { provider, signer },
      });
      dispatch({ type: WEB3_ACTIONS.SET_ACCOUNT, payload: account });
      dispatch({ type: WEB3_ACTIONS.SET_CHAIN_ID, payload: Number(network.chainId) });
      dispatch({
        type: WEB3_ACTIONS.SET_BALANCE,
        payload: ethers.formatEther(balance),
      });

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${account.slice(0, 6)}...${account.slice(-4)}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      let errorMessage = 'Failed to connect wallet';
      
      if (error.code === 4001) {
        errorMessage = 'User rejected the connection request';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending';
      }

      dispatch({ type: WEB3_ACTIONS.SET_ERROR, payload: errorMessage });
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    dispatch({ type: WEB3_ACTIONS.DISCONNECT });
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Switch network
  const switchNetwork = async (chainId) => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask to switch networks.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Error switching network:', error);
      
      // If the network doesn't exist, add it (for local development)
      if (error.code === 4902 && chainId === 31337) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7A69',
                chainName: 'Localhost 8545',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast({
            title: 'Network Error',
            description: 'Failed to add the local network.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Network Switch Failed',
          description: 'Failed to switch to the requested network.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Update balance
  const updateBalance = async () => {
    if (state.provider && state.account) {
      try {
        const balance = await state.provider.getBalance(state.account);
        dispatch({
          type: WEB3_ACTIONS.SET_BALANCE,
          payload: ethers.formatEther(balance),
        });
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };

  // Check if already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account and network changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== state.account) {
          connectWallet();
        }
      };

      const handleChainChanged = (chainId) => {
        dispatch({ type: WEB3_ACTIONS.SET_CHAIN_ID, payload: parseInt(chainId, 16) });
        if (state.isConnected) {
          connectWallet(); // Reconnect to update provider
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.account, state.isConnected]);

  const value = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    updateBalance,
    isMetaMaskInstalled,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

// Custom hook to use Web3 context
export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

export default Web3Context;