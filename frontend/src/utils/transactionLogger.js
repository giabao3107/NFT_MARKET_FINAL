// Transaction logging utility for better MetaMask activity tracking
import { ethers } from 'ethers';

/**
 * Enhanced transaction logging for MetaMask activity
 * This helps users track their NFT marketplace transactions more clearly
 */
export class TransactionLogger {
  static logTransaction(txData) {
    const {
      hash,
      from,
      to,
      functionName,
      params = {},
      value = '0',
      gasUsed,
      gasPrice
    } = txData;

    const logEntry = {
      timestamp: new Date().toISOString(),
      transactionHash: hash,
      from: from,
      to: to,
      function: functionName,
      parameters: params,
      value: typeof value === 'bigint' ? value.toString() : value,
      gasUsed: typeof gasUsed === 'bigint' ? gasUsed.toString() : gasUsed,
      gasPrice: typeof gasPrice === 'bigint' ? gasPrice.toString() : gasPrice,
      status: 'completed'
    };

    // Log to console for debugging
    console.group(`🔗 ${functionName} Transaction`);
    console.log('Hash:', hash);
    console.log('From:', from);
    console.log('To:', to);
    console.log('Function:', functionName);
    console.log('Parameters:', params);
    if (value !== '0') {
      console.log('Value:', ethers.formatEther(value), 'ETH');
    }
    console.log('Timestamp:', logEntry.timestamp);
    console.groupEnd();

    // Store in localStorage for transaction history
    this.storeTransactionHistory(logEntry);

    return logEntry;
  }

  static storeTransactionHistory(logEntry) {
    try {
      const existingHistory = JSON.parse(
        localStorage.getItem('nft_transaction_history') || '[]'
      );
      
      // Convert BigInt values to strings for JSON serialization
      const serializedEntry = this.serializeBigInt(logEntry);
      
      existingHistory.unshift(serializedEntry); // Add to beginning
      
      // Keep only last 100 transactions
      if (existingHistory.length > 100) {
        existingHistory.splice(100);
      }
      
      localStorage.setItem(
        'nft_transaction_history',
        JSON.stringify(existingHistory)
      );
    } catch (error) {
      console.warn('Failed to store transaction history:', error);
    }
  }

  static serializeBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    }));
  }

  static getTransactionHistory() {
    try {
      return JSON.parse(
        localStorage.getItem('nft_transaction_history') || '[]'
      );
    } catch (error) {
      console.warn('Failed to retrieve transaction history:', error);
      return [];
    }
  }

  static clearTransactionHistory() {
    localStorage.removeItem('nft_transaction_history');
  }

  // Specific logging methods for different transaction types
  static logMintTransaction(tx, tokenId, metadataURI, royalty) {
    return this.logTransaction({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      functionName: 'Mint NFT',
      params: {
        tokenId: tokenId,
        metadataURI: metadataURI,
        royaltyPercentage: royalty + '%'
      },
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice
    });
  }

  static logListTransaction(tx, tokenId, price) {
    return this.logTransaction({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      functionName: 'List NFT for Sale',
      params: {
        tokenId: tokenId,
        price: ethers.formatEther(price) + ' ETH'
      },
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice
    });
  }

  static logBuyTransaction(tx, listingId, price) {
    return this.logTransaction({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      functionName: 'Buy NFT',
      params: {
        listingId: listingId,
        price: ethers.formatEther(price) + ' ETH'
      },
      value: price,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice
    });
  }

  static logDelistTransaction(tx, listingId) {
    return this.logTransaction({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      functionName: 'Remove NFT from Sale',
      params: {
        listingId: listingId
      },
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice
    });
  }

  static logUpdatePriceTransaction(tx, listingId, newPrice) {
    return this.logTransaction({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      functionName: 'Update Listing Price',
      params: {
        listingId: listingId,
        newPrice: ethers.formatEther(newPrice) + ' ETH'
      },
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice
    });
  }

  static logTransferTransaction(tx, tokenId, fromAddress, toAddress) {
    return this.logTransaction({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      functionName: 'Transfer NFT',
      params: {
        tokenId: tokenId,
        from: fromAddress,
        to: toAddress
      },
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice
    });
  }

  static logApproveTransaction(tx, tokenId, spender) {
    return this.logTransaction({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      functionName: 'Approve NFT Transfer',
      params: {
        tokenId: tokenId,
        approvedAddress: spender
      },
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice
    });
  }
}

export default TransactionLogger;