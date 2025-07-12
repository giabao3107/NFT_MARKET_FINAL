// Web3 utility functions for blockchain interactions
import { ethers } from 'ethers';
import { SUPPORTED_NETWORKS } from './constants';
import { getCurrentNetwork } from '../contracts';

/**
 * Format Ethereum address for display
 * @param {string} address - Ethereum address
 * @param {number} startChars - Number of characters to show at start
 * @param {number} endChars - Number of characters to show at end
 * @returns {string} - Formatted address
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format ETH amount for display
 * @param {string|number} amount - Amount in wei or ETH
 * @param {boolean} isWei - Whether the amount is in wei
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted amount
 */
export const formatEther = (amount, isWei = true, decimals = 4) => {
  if (!amount) return '0';
  
  try {
    let ethAmount;
    if (isWei) {
      // Convert from wei to ether
      ethAmount = ethers.formatEther(amount);
    } else {
      // Already in ether, just convert to string
      ethAmount = amount.toString();
    }
    
    const num = parseFloat(ethAmount);
    
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    
    return num.toFixed(decimals).replace(/\.?0+$/, '');
  } catch (error) {
    console.error('Error formatting ether:', error);
    return '0';
  }
};

/**
 * Parse ETH amount to wei
 * @param {string|number} amount - Amount in ETH
 * @returns {string} - Amount in wei
 */
export const parseEther = (amount) => {
  try {
    return ethers.parseEther(amount.toString()).toString();
  } catch (error) {
    console.error('Error parsing ether:', error);
    throw new Error('Invalid amount');
  }
};

/**
 * Check if address is valid Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} - Whether address is valid
 */
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

/**
 * Get network name from chain ID
 * @param {number} chainId - Chain ID
 * @returns {string} - Network name
 */
export const getNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum Mainnet',
    3: 'Ropsten Testnet',
    4: 'Rinkeby Testnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    31337: 'Localhost',
    137: 'Polygon Mainnet',
    80001: 'Polygon Mumbai',
  };
  
  return networks[chainId] || `Unknown Network (${chainId})`;
};

/**
 * Get block explorer URL for address or transaction
 * @param {number} chainId - Chain ID
 * @param {string} hash - Address or transaction hash
 * @param {string} type - 'address' or 'tx'
 * @returns {string} - Block explorer URL
 */
export const getBlockExplorerUrl = (chainId, hash, type = 'address') => {
  const explorers = {
    1: 'https://etherscan.io',
    3: 'https://ropsten.etherscan.io',
    4: 'https://rinkeby.etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com',
  };
  
  const baseUrl = explorers[chainId];
  if (!baseUrl) return '';
  
  return `${baseUrl}/${type}/${hash}`;
};

/**
 * Wait for transaction confirmation
 * @param {Object} provider - Ethers provider
 * @param {string} txHash - Transaction hash
 * @param {number} confirmations - Number of confirmations to wait for
 * @returns {Promise<Object>} - Transaction receipt
 */
export const waitForTransaction = async (provider, txHash, confirmations = 1) => {
  try {
    console.log(`Waiting for transaction ${txHash} with ${confirmations} confirmations...`);
    
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    
    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }
    
    console.log('Transaction confirmed:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw error;
  }
};

/**
 * Estimate gas for a transaction
 * @param {Object} contract - Ethers contract instance
 * @param {string} method - Method name
 * @param {Array} args - Method arguments
 * @returns {Promise<string>} - Estimated gas
 */
export const estimateGas = async (contract, method, args = []) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...args);
    // Add 20% buffer
    return gasEstimate.mul(120).div(100).toString();
  } catch (error) {
    console.error('Error estimating gas:', error);
    // Return a default gas limit if estimation fails
    return '300000';
  }
};

/**
 * Get current gas price
 * @param {Object} provider - Ethers provider
 * @returns {Promise<string>} - Gas price in wei
 */
export const getGasPrice = async (provider) => {
  try {
    const gasPrice = await provider.getGasPrice();
    return gasPrice.toString();
  } catch (error) {
    console.error('Error getting gas price:', error);
    // Return a default gas price if fetching fails
    return ethers.parseUnits('20', 'gwei').toString();
  }
};

/**
 * Calculate transaction cost
 * @param {string} gasLimit - Gas limit
 * @param {string} gasPrice - Gas price in wei
 * @returns {string} - Transaction cost in ETH
 */
export const calculateTransactionCost = (gasLimit, gasPrice) => {
  try {
    // eslint-disable-next-line no-undef
    const cost = BigInt(gasLimit) * BigInt(gasPrice);
    return ethers.formatEther(cost);
  } catch (error) {
    console.error('Error calculating transaction cost:', error);
    return '0';
  }
};

/**
 * Switch to a specific network
 * @param {number} chainId - Target chain ID
 * @returns {Promise<boolean>} - Success status
 */
export const switchNetwork = async (chainId) => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (error) {
    // If network doesn't exist, try to add it
    if (error.code === 4902) {
      return await addNetwork(chainId);
    }
    throw error;
  }
};

/**
 * Add a network to MetaMask
 * @param {number} chainId - Chain ID to add
 * @returns {Promise<boolean>} - Success status
 */
export const addNetwork = async (chainId) => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }
  
  const network = Object.values(SUPPORTED_NETWORKS).find(n => 
    n.chainId === chainId
  );
  
  if (!network) {
    throw new Error(`Network with chain ID ${chainId} not supported`);
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [network],
    });
    return true;
  } catch (error) {
    console.error('Error adding network:', error);
    throw error;
  }
};

/**
 * Check if MetaMask is installed
 * @returns {boolean} - Whether MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
};

/**
 * Get MetaMask accounts
 * @returns {Promise<string[]>} - Array of account addresses
 */
export const getAccounts = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }
  
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    throw error;
  }
};

/**
 * Get current chain ID
 * @returns {Promise<number>} - Current chain ID
 */
export const getChainId = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }
  
  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });
    return parseInt(chainId, 16);
  } catch (error) {
    console.error('Error getting chain ID:', error);
    throw error;
  }
};

/**
 * Format transaction error message
 * @param {Error} error - Transaction error
 * @returns {string} - User-friendly error message
 */
export const formatTransactionError = (error) => {
  if (!error) return 'Unknown error occurred';
  
  const message = error.message || error.toString();
  
  // Common error patterns
  if (message.includes('user rejected')) {
    return 'Transaction was rejected by user';
  }
  
  if (message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  if (message.includes('gas required exceeds allowance')) {
    return 'Transaction requires more gas than allowed';
  }
  
  if (message.includes('nonce too low')) {
    return 'Transaction nonce is too low. Please try again.';
  }
  
  if (message.includes('replacement transaction underpriced')) {
    return 'Replacement transaction is underpriced';
  }
  
  if (message.includes('execution reverted')) {
    // Try to extract revert reason
    const revertMatch = message.match(/execution reverted: (.+)/);
    if (revertMatch) {
      return `Transaction failed: ${revertMatch[1]}`;
    }
    return 'Transaction was reverted by the contract';
  }
  
  // Return original message if no pattern matches
  return message;
};

/**
 * Validate transaction parameters
 * @param {Object} params - Transaction parameters
 * @returns {Object} - Validation result
 */
export const validateTransactionParams = (params) => {
  const errors = [];
  
  if (params.to && !isValidAddress(params.to)) {
    errors.push('Invalid recipient address');
  }
  
  if (params.value) {
    try {
      // eslint-disable-next-line no-undef
      BigInt(params.value);
    } catch {
      errors.push('Invalid transaction value');
    }
  }
  
  if (params.gasLimit) {
    try {
      // eslint-disable-next-line no-undef
      const gasLimit = BigInt(params.gasLimit);
      if (gasLimit <= 0n) {
        errors.push('Gas limit must be greater than 0');
      }
    } catch {
      errors.push('Invalid gas limit');
    }
  }
  
  if (params.gasPrice) {
    try {
      // eslint-disable-next-line no-undef
      const gasPrice = BigInt(params.gasPrice);
      if (gasPrice <= 0n) {
        errors.push('Gas price must be greater than 0');
      }
    } catch {
      errors.push('Invalid gas price');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const web3Utils = {
  formatAddress,
  formatEther,
  parseEther,
  isValidAddress,
  getNetworkName,
  getBlockExplorerUrl,
  waitForTransaction,
  estimateGas,
  getGasPrice,
  calculateTransactionCost,
  switchNetwork,
  addNetwork,
  isMetaMaskInstalled,
  getAccounts,
  getChainId,
  formatTransactionError,
  validateTransactionParams,
};

export default web3Utils;