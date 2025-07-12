// MetaMask transaction helper for better activity tracking
import { ethers } from 'ethers';
import TransactionLogger from './transactionLogger';

/**
 * Enhanced MetaMask transaction helper
 * Ensures transactions appear properly in MetaMask activity
 */
export class MetaMaskTransactionHelper {
  /**
   * Wait for transaction with proper MetaMask integration
   * @param {Object} tx - Transaction object
   * @param {string} description - Transaction description
   * @param {Object} additionalData - Additional data for logging
   */
  static async waitForTransactionWithTracking(tx, description, additionalData = {}) {
    try {
      console.log(`⏳ Waiting for transaction: ${description}`);
      console.log(`📝 Transaction hash: ${tx.hash}`);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      console.log(`✅ Transaction confirmed: ${description}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`💰 Gas price: ${receipt.gasPrice ? receipt.gasPrice.toString() : 'N/A'}`);
      
      // Enhanced transaction data for MetaMask
      const enhancedTxData = {
        hash: receipt.transactionHash,
        from: receipt.from,
        to: receipt.to,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        gasUsed: receipt.gasUsed,
        gasPrice: receipt.gasPrice || tx.gasPrice,
        status: receipt.status,
        confirmations: receipt.confirmations,
        functionName: description,
        ...additionalData
      };
      
      // Log to TransactionLogger
      TransactionLogger.logTransaction(enhancedTxData);
      
      // Additional MetaMask activity enhancement
      this.enhanceMetaMaskActivity(enhancedTxData);
      
      return receipt;
    } catch (error) {
      console.error(`❌ Transaction failed: ${description}`, error);
      throw error;
    }
  }
  
  /**
   * Enhance MetaMask activity display
   * @param {Object} txData - Transaction data
   */
  static enhanceMetaMaskActivity(txData) {
    // Convert BigInt values to strings for JSON serialization
    const sanitizedTxData = this.sanitizeBigIntValues(txData);
    
    // Store transaction with enhanced metadata for MetaMask
    const metaMaskData = {
      ...sanitizedTxData,
      timestamp: Date.now(),
      type: 'contract_interaction',
      method: sanitizedTxData.functionName,
      // Add specific NFT marketplace context
      context: 'NFT_MARKETPLACE'
    };
    
    // Store in sessionStorage for immediate access
    const sessionKey = `metamask_tx_${sanitizedTxData.hash}`;
    sessionStorage.setItem(sessionKey, JSON.stringify(metaMaskData));
    
    // Dispatch custom event for MetaMask integration
    window.dispatchEvent(new CustomEvent('nft_transaction_completed', {
      detail: metaMaskData
    }));
  }
  
  /**
   * Track royalty payments specifically
   * @param {Object} receipt - Transaction receipt
   * @param {string} tokenId - NFT token ID
   */
  static trackRoyaltyPayment(receipt, tokenId) {
    if (!receipt || !receipt.logs) {
      console.warn('Invalid receipt or no logs found');
      return;
    }
    
    // Look for RoyaltyPaid events in the receipt
    const royaltyEventSignature = ethers.id('RoyaltyPaid(uint256,address,uint256)');
    const royaltyEvents = receipt.logs.filter(log => {
      try {
        // Check if this is a RoyaltyPaid event
        return log.topics && log.topics.length > 0 && log.topics[0] === royaltyEventSignature;
      } catch {
        return false;
      }
    });
    
    console.log(`Found ${royaltyEvents.length} royalty events in transaction`);
    
    royaltyEvents.forEach((event, index) => {
      try {
        // Validate event structure
        if (!event.topics || event.topics.length < 3) {
          console.warn(`Royalty event ${index}: insufficient topics`);
          return;
        }
        
        if (!event.data) {
          console.warn(`Royalty event ${index}: no data field`);
          return;
        }
        
        // For indexed parameters, they are in topics, not data
        // RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount)
        const tokenIdFromTopic = ethers.getBigInt(event.topics[1]);
        const creatorFromTopic = ethers.getAddress('0x' + event.topics[2].slice(26)); // Remove padding
        
        // Amount should be in data (non-indexed parameter)
        let amount;
        try {
          // Remove 0x prefix and ensure we have valid hex data
          const cleanData = event.data.startsWith('0x') ? event.data.slice(2) : event.data;
          if (cleanData.length === 64) { // 32 bytes = 64 hex chars
            amount = ethers.getBigInt('0x' + cleanData);
          } else {
            console.warn(`Royalty event ${index}: invalid data length ${cleanData.length}`);
            return;
          }
        } catch (dataError) {
          console.warn(`Royalty event ${index}: failed to parse amount from data:`, dataError);
          return;
        }
        
        const royaltyData = {
          tokenId: tokenIdFromTopic.toString(),
          creator: creatorFromTopic,
          amount: amount.toString(),
          amountInEth: ethers.formatEther(amount),
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          timestamp: Date.now(),
          eventIndex: index
        };
        
        console.log(`👑 Royalty Payment ${index} Detected:`, royaltyData);
        
        // Store royalty payment data
        this.storeRoyaltyPayment(royaltyData);
        
        // Dispatch royalty event
        window.dispatchEvent(new CustomEvent('royalty_payment_detected', {
          detail: royaltyData
        }));
        
      } catch (error) {
        console.warn(`Failed to decode royalty event ${index}:`, error);
      }
    });
  }
  
  /**
   * Store royalty payment data
   * @param {Object} royaltyData - Royalty payment data
   */
  static storeRoyaltyPayment(royaltyData) {
    try {
      const existingRoyalties = JSON.parse(
        localStorage.getItem('nft_royalty_payments') || '[]'
      );
      
      // Sanitize BigInt values before storing
      const sanitizedRoyaltyData = this.sanitizeBigIntValues(royaltyData);
      existingRoyalties.unshift(sanitizedRoyaltyData);
      
      // Keep only last 50 royalty payments
      if (existingRoyalties.length > 50) {
        existingRoyalties.splice(50);
      }
      
      localStorage.setItem(
        'nft_royalty_payments',
        JSON.stringify(existingRoyalties)
      );
    } catch (error) {
      console.warn('Failed to store royalty payment:', error);
    }
  }
  
  /**
   * Get royalty payment history
   * @param {string} creatorAddress - Creator address (optional)
   */
  static getRoyaltyPayments(creatorAddress = null) {
    try {
      const royalties = JSON.parse(
        localStorage.getItem('nft_royalty_payments') || '[]'
      );
      
      if (creatorAddress) {
        return royalties.filter(r => 
          r.creator.toLowerCase() === creatorAddress.toLowerCase()
        );
      }
      
      return royalties;
    } catch (error) {
      console.warn('Failed to retrieve royalty payments:', error);
      return [];
    }
  }
  
  /**
   * Get total royalties earned by creator
   * @param {string} creatorAddress - Creator address
   */
  static getTotalRoyaltiesEarned(creatorAddress) {
    const royalties = this.getRoyaltyPayments(creatorAddress);
    return royalties.reduce((total, royalty) => {
      return total + parseFloat(royalty.amountInEth);
    }, 0);
  }

  /**
   * Sanitize BigInt values for JSON serialization
   * @param {Object} obj - Object that may contain BigInt values
   * @returns {Object} - Object with BigInt values converted to strings
   */
  static sanitizeBigIntValues(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeBigIntValues(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeBigIntValues(value);
      }
      return sanitized;
    }
    
    return obj;
  }
}

export default MetaMaskTransactionHelper;