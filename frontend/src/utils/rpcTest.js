// RPC Connection Test Utility
import { ethers } from 'ethers';

/**
 * Test RPC connection and basic functionality
 */
export const testRPCConnection = async () => {
  try {
    console.log('Testing RPC connection...');
    
    // Test connection to local Hardhat node
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Test basic RPC calls
    const network = await provider.getNetwork();
    console.log('Network:', network);
    
    const blockNumber = await provider.getBlockNumber();
    console.log('Current block number:', blockNumber);
    
    // Test if we can get accounts
    const accounts = await provider.listAccounts();
    console.log('Available accounts:', accounts.length);
    
    if (accounts.length > 0) {
      const balance = await provider.getBalance(accounts[0]);
      console.log('First account balance:', ethers.formatEther(balance), 'ETH');
    }
    
    return {
      success: true,
      network: network.chainId.toString(),
      blockNumber,
      accountCount: accounts.length
    };
    
  } catch (error) {
    console.error('RPC connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test contract interaction
 */
export const testContractConnection = async (contractAddress, abi) => {
  try {
    console.log('Testing contract connection...');
    
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Try to call a view function (this should work without gas)
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x') {
      throw new Error('No contract deployed at this address');
    }
    
    console.log('Contract found at address:', contractAddress);
    
    return {
      success: true,
      contractAddress,
      hasCode: code !== '0x'
    };
    
  } catch (error) {
    console.error('Contract connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};