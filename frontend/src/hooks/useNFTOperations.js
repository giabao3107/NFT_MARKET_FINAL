import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useWeb3 } from '../contexts/Web3Context';
import { useNFT } from '../contexts/NFTContext';
import { uploadNFTToIPFS, uploadFileToIPFS, uploadJSONToIPFS } from '../utils/ipfs';
import { parseEther, formatEther, estimateGas } from '../utils/web3';
import { validateFile, generateId } from '../utils/helpers';
import { 
  FILE_CONSTRAINTS, 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '../utils/constants';

/**
 * Custom hook for NFT operations
 * Handles minting, listing, buying, and other NFT-related operations
 */
export const useNFTOperations = () => {
  const { account, isConnected } = useWeb3();
  const { 
    mintNFT, 
    listNFT, 
    buyNFT, 
    delistNFT, 
    updatePrice,
    transferNFT,
    loading 
  } = useNFT();
  
  const [operationLoading, setOperationLoading] = useState({
    minting: false,
    listing: false,
    buying: false,
    delisting: false,
    updating: false,
    transferring: false,
    uploading: false
  });
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();

  // Set loading state for specific operation
  const setLoading = useCallback((operation, isLoading) => {
    setOperationLoading(prev => ({
      ...prev,
      [operation]: isLoading
    }));
  }, []);

  // Validate NFT creation data
  const validateNFTData = useCallback((data) => {
    const { name, description, image, category, attributes } = data;
    
    if (!name || name.trim().length < 3) {
      throw new Error('Name must be at least 3 characters long');
    }
    
    if (!description || description.trim().length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }
    
    if (!image) {
      throw new Error('Image is required');
    }
    
    if (!category) {
      throw new Error('Category is required');
    }
    
    // Validate image file
    if (image instanceof File) {
      const validation = validateFile(image, {
        maxSize: FILE_CONSTRAINTS.MAX_SIZE,
        allowedTypes: FILE_CONSTRAINTS.ALLOWED_TYPES
      });
      
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
    }
    
    // Validate attributes if provided
    if (attributes && Array.isArray(attributes)) {
      for (const attr of attributes) {
        if (!attr.trait_type || !attr.value) {
          throw new Error('All attributes must have trait_type and value');
        }
      }
    }
    
    return true;
  }, []);

  // Create and mint NFT
  const createNFT = useCallback(async (nftData) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    try {
      setLoading('minting', true);
      setUploadProgress(0);
      
      // Validate data
      validateNFTData(nftData);
      
      setLoading('uploading', true);
      setUploadProgress(25);
      
      // Upload image to IPFS
      let imageHash;
      if (nftData.image instanceof File) {
        imageHash = await uploadFileToIPFS(nftData.image, `${nftData.name}_image`);
      } else {
        imageHash = nftData.image; // Already uploaded
      }
      
      setUploadProgress(50);
      
      // Prepare metadata
      const metadata = {
        name: nftData.name.trim(),
        description: nftData.description.trim(),
        image: `ipfs://${imageHash}`, // Use actual uploaded image
        category: nftData.category,
        attributes: nftData.attributes || [],
        created_by: account,
        created_at: new Date().toISOString(),
        external_url: nftData.external_url || '',
        animation_url: nftData.animation_url || ''
      };
      
      setUploadProgress(75);
      
      // Upload metadata to IPFS
      const metadataHash = await uploadJSONToIPFS(metadata, `${nftData.name}_metadata`);
      
      setUploadProgress(90);
      setLoading('uploading', false);
      
      // Mint NFT - pass the metadata object, not the hash
      const tokenId = await mintNFT(metadata);
      
      setUploadProgress(100);
      
      toast({
        title: 'NFT Created Successfully!',
        description: `Your NFT has been minted with token ID: ${tokenId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return { tokenId, metadataHash, imageHash };
      
    } catch (error) {
      console.error('NFT creation error:', error);
      toast({
        title: 'NFT Creation Failed',
        description: error.message || ERROR_MESSAGES.TRANSACTION_FAILED,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setLoading('minting', false);
      setLoading('uploading', false);
      setUploadProgress(0);
    }
  }, [isConnected, account, mintNFT, validateNFTData, toast]);

  // List NFT for sale
  const listNFTForSale = useCallback(async (tokenId, price) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    try {
      setLoading('listing', true);
      
      if (!price || parseFloat(price) <= 0) {
        throw new Error('Price must be greater than 0');
      }
      
      const priceInWei = parseEther(price.toString());
      
      // Estimate gas before transaction
      const gasEstimate = await estimateGas({
        from: account,
        to: process.env.REACT_APP_MARKETPLACE_ADDRESS,
        value: '0'
      });
      
      await listNFT(tokenId, priceInWei);
      
      toast({
        title: 'NFT Listed Successfully!',
        description: `Your NFT is now listed for ${price} ETH`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('NFT listing error:', error);
      toast({
        title: 'Listing Failed',
        description: error.message || ERROR_MESSAGES.TRANSACTION_FAILED,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setLoading('listing', false);
    }
  }, [isConnected, account, listNFT, toast]);

  // Buy NFT
  const purchaseNFT = useCallback(async (listingId, price) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    try {
      setLoading('buying', true);
      
      const priceInWei = parseEther(price.toString());
      
      await buyNFT(listingId, priceInWei);
      
      toast({
        title: 'NFT Purchased Successfully!',
        description: `You have successfully purchased the NFT for ${price} ETH`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('NFT purchase error:', error);
      
      let errorMessage = error.message || ERROR_MESSAGES.TRANSACTION_FAILED;
      
      // Handle specific error types
      if (error.message?.includes('Internal JSON-RPC error')) {
        errorMessage = 'Transaction failed. Please check your wallet balance and try again.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to complete this transaction.';
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (error.message?.includes('execution reverted')) {
        errorMessage = 'Transaction failed. The NFT may no longer be available.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast({
        title: 'Purchase Failed',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      throw error;
    } finally {
      setLoading('buying', false);
    }
  }, [isConnected, buyNFT, toast]);

  // Delist NFT
  const removeNFTFromSale = useCallback(async (listingId) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    try {
      setLoading('delisting', true);
      
      await delistNFT(listingId);
      
      toast({
        title: 'NFT Delisted Successfully!',
        description: 'Your NFT has been removed from the marketplace',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('NFT delisting error:', error);
      toast({
        title: 'Delisting Failed',
        description: error.message || ERROR_MESSAGES.TRANSACTION_FAILED,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setLoading('delisting', false);
    }
  }, [isConnected, delistNFT, toast]);

  // Update NFT price
  const updateNFTPrice = useCallback(async (listingId, newPrice) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    try {
      setLoading('updating', true);
      
      if (!newPrice || parseFloat(newPrice) <= 0) {
        throw new Error('Price must be greater than 0');
      }
      
      const priceInWei = parseEther(newPrice.toString());
      
      await updatePrice(listingId, priceInWei);
      
      toast({
        title: 'Price Updated Successfully!',
        description: `NFT price updated to ${newPrice} ETH`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('Price update error:', error);
      toast({
        title: 'Price Update Failed',
        description: error.message || ERROR_MESSAGES.TRANSACTION_FAILED,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setLoading('updating', false);
    }
  }, [isConnected, updatePrice, toast]);

  // Transfer NFT
  const transferNFTToAddress = useCallback(async (tokenId, toAddress) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    try {
      setLoading('transferring', true);
      
      if (!toAddress || toAddress.length !== 42 || !toAddress.startsWith('0x')) {
        throw new Error('Invalid recipient address');
      }
      
      await transferNFT(tokenId, toAddress);
      
      toast({
        title: 'NFT Transferred Successfully!',
        description: `NFT has been transferred to ${toAddress}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('NFT transfer error:', error);
      toast({
        title: 'Transfer Failed',
        description: error.message || ERROR_MESSAGES.TRANSACTION_FAILED,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setLoading('transferring', false);
    }
  }, [isConnected, transferNFT, toast]);

  return {
    // Operations
    createNFT,
    listNFTForSale,
    purchaseNFT,
    removeNFTFromSale,
    updateNFTPrice,
    transferNFTToAddress,
    
    // Loading states
    isLoading: operationLoading,
    uploadProgress,
    
    // Utility
    validateNFTData,
    
    // Global loading from context
    contextLoading: loading
  };
};

export default useNFTOperations;