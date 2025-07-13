import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@chakra-ui/react';
import { useWeb3 } from './Web3Context';
import NFTCollectionABI from '../contracts/NFTCollection.json';
import NFTMarketplaceABI from '../contracts/NFTMarketplace.json';
import contractAddresses from '../contracts/addresses.json';
import { createMetadataDataURI, parseMetadataDataURI } from '../utils/encoding';
import TransactionLogger from '../utils/transactionLogger';
import MetaMaskTransactionHelper from '../utils/metaMaskTransactionHelper';

// Initial state
const initialState = {
  nfts: [],
  userNFTs: [],
  marketplaceListings: [],
  loading: false,
  error: null,
  contracts: {
    nftCollection: null,
    nftMarketplace: null,
  },
};

// Action types
const NFT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CONTRACTS: 'SET_CONTRACTS',
  SET_NFTS: 'SET_NFTS',
  SET_USER_NFTS: 'SET_USER_NFTS',
  SET_MARKETPLACE_LISTINGS: 'SET_MARKETPLACE_LISTINGS',
  ADD_NFT: 'ADD_NFT',
  UPDATE_NFT: 'UPDATE_NFT',
  REMOVE_NFT: 'REMOVE_NFT',
  CLEAR_DATA: 'CLEAR_DATA',
};

// Reducer
function nftReducer(state, action) {
  switch (action.type) {
    case NFT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case NFT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case NFT_ACTIONS.SET_CONTRACTS:
      return {
        ...state,
        contracts: action.payload,
      };
    case NFT_ACTIONS.SET_NFTS:
      return {
        ...state,
        nfts: action.payload,
        loading: false,
      };
    case NFT_ACTIONS.SET_USER_NFTS:
      return {
        ...state,
        userNFTs: action.payload,
        loading: false,
      };
    case NFT_ACTIONS.SET_MARKETPLACE_LISTINGS:
      return {
        ...state,
        marketplaceListings: action.payload,
        loading: false,
      };
    case NFT_ACTIONS.ADD_NFT:
      return {
        ...state,
        nfts: [...state.nfts, action.payload],
        userNFTs: [...state.userNFTs, action.payload],
      };
    case NFT_ACTIONS.UPDATE_NFT:
      return {
        ...state,
        nfts: state.nfts.map(nft => 
          nft.tokenId === action.payload.tokenId ? { ...nft, ...action.payload } : nft
        ),
        userNFTs: state.userNFTs.map(nft => 
          nft.tokenId === action.payload.tokenId ? { ...nft, ...action.payload } : nft
        ),
        marketplaceListings: state.marketplaceListings.map(listing => 
          listing.tokenId === action.payload.tokenId ? { ...listing, ...action.payload } : listing
        ),
      };
    case NFT_ACTIONS.REMOVE_NFT:
      return {
        ...state,
        marketplaceListings: state.marketplaceListings.filter(
          listing => listing.tokenId !== action.payload
        ),
      };
    case NFT_ACTIONS.CLEAR_DATA:
      return {
        ...initialState,
        contracts: state.contracts,
      };
    default:
      return state;
  }
}

// Create context
const NFTContext = createContext();

// Provider component
export function NFTProvider({ children }) {
  const [state, dispatch] = useReducer(nftReducer, initialState);
  const { provider, signer, account, isConnected } = useWeb3();
  const toast = useToast();

  // Initialize contracts
  const initializeContracts = useCallback(async () => {
    if (!provider || !contractAddresses) return;

    try {
      const nftCollection = new ethers.Contract(
        contractAddresses.NFTCollection,
        NFTCollectionABI.abi,
        provider
      );

      const nftMarketplace = new ethers.Contract(
        contractAddresses.NFTMarketplace,
        NFTMarketplaceABI.abi,
        provider
      );

      dispatch({
        type: NFT_ACTIONS.SET_CONTRACTS,
        payload: { nftCollection, nftMarketplace },
      });
    } catch (error) {
      console.error('Error initializing contracts:', error);
      dispatch({
        type: NFT_ACTIONS.SET_ERROR,
        payload: 'Failed to initialize contracts',
      });
    }
  }, [provider]);

  // Fetch NFT metadata from IPFS or data URI
  const fetchMetadata = useCallback(async (tokenURI) => {
    try {
      // Handle placeholder URIs or invalid URIs
      if (!tokenURI || tokenURI.includes('QmExample') || tokenURI.trim() === '') {
        throw new Error('Invalid or missing token URI');
      }

      // Handle data URIs (base64 encoded JSON)
      if (tokenURI.startsWith('data:application/json;base64,')) {
        try {
          return parseMetadataDataURI(tokenURI);
        } catch (parseError) {
          throw new Error('Failed to parse base64 encoded metadata');
        }
      }

      // Handle IPFS URIs
      const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY || 'https://gray-reasonable-shrew-916.mypinata.cloud/ipfs';
      let ipfsUrl;
      
      if (tokenURI.startsWith('ipfs://')) {
        ipfsUrl = tokenURI.replace('ipfs://', `${IPFS_GATEWAY}/`);
      } else if (tokenURI.startsWith('http')) {
        ipfsUrl = tokenURI;
      } else {
        throw new Error('Unsupported URI format');
      }
      
      const response = await fetch(ipfsUrl, {
        timeout: 10000, // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const metadata = await response.json();
      
      // Convert image URL properly using the convertIpfsToHttp function
      let imageUrl = metadata.image;
      if (imageUrl) {
        // Import the conversion function
        const { convertIpfsToHttp } = await import('../utils/ipfs');
        imageUrl = convertIpfsToHttp(imageUrl);
      }
      
      return {
        name: metadata.name || 'Unnamed NFT',
        description: metadata.description || 'No description available',
        image: imageUrl,
        attributes: metadata.attributes || [],
        ...metadata,
      };
    } catch (error) {
      console.error('Error fetching metadata:', error.message);
      throw error;
    }
  }, []);

  // Mint NFT
  const mintNFT = async (metadata, royaltyPercentage = 250) => {
    if (!signer || !state.contracts.nftCollection) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });

      // Upload metadata to IPFS or use provided URI
      // For now, we'll use the provided metadata directly
      const metadataToUpload = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        attributes: metadata.attributes || []
      };
      
      // In a real implementation, upload to IPFS and get the hash
      // For now, we'll encode as data URI with proper Unicode support
      const metadataURI = createMetadataDataURI(metadataToUpload);

      const contract = state.contracts.nftCollection.connect(signer);
      
      // Add transaction description for MetaMask
      const tx = await contract.mintNFT(account, metadataURI, royaltyPercentage, {
        gasLimit: 500000 // Set reasonable gas limit
      });
      
      // Enhanced transaction tracking for MetaMask activity
      const receipt = await MetaMaskTransactionHelper.waitForTransactionWithTracking(
        tx,
        'Mint NFT',
        {
          params: {
            metadataURI: metadataURI,
            royaltyPercentage: (royaltyPercentage / 100) + '%'
          }
        }
      );

      // Get token ID from event
      const transferEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id('Transfer(address,address,uint256)')
      );
      const tokenId = parseInt(transferEvent.topics[3], 16);
      
      // Log transaction for better MetaMask activity tracking (legacy support)
      TransactionLogger.logMintTransaction(receipt, tokenId, metadataURI, royaltyPercentage);

      const nftData = {
        tokenId,
        owner: account,
        creator: account,
        tokenURI: metadataURI,
        royaltyPercentage,
        ...metadataToUpload,
      };

      dispatch({ type: NFT_ACTIONS.ADD_NFT, payload: nftData });

      // Refresh all NFTs to show the new one on homepage
      await fetchAllNFTs();

      toast({
        title: 'NFT Minted Successfully',
        description: `Token ID: ${tokenId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      return nftData;
    } catch (error) {
      console.error('Error minting NFT:', error);
      dispatch({
        type: NFT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to mint NFT',
      });
      throw error;
    } finally {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // List NFT for sale
  const listNFT = async (tokenId, price) => {
    if (!signer || !state.contracts.nftMarketplace || !state.contracts.nftCollection) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });

      const nftContract = state.contracts.nftCollection.connect(signer);
      const marketplaceContract = state.contracts.nftMarketplace.connect(signer);

      // Approve marketplace to transfer NFT
      const approveTx = await nftContract.approve(
        contractAddresses.NFTMarketplace,
        tokenId,
        { gasLimit: 150000 }
      );
      
      // Enhanced transaction tracking for approve
      const approveReceipt = await MetaMaskTransactionHelper.waitForTransactionWithTracking(
        approveTx,
        'Approve NFT for Marketplace',
        {
          params: {
            tokenId: tokenId,
            spender: contractAddresses.NFTMarketplace
          }
        }
      );
      
      // Log approve transaction (legacy support)
      TransactionLogger.logApproveTransaction(approveReceipt, tokenId, contractAddresses.NFTMarketplace);

      // Price is already in wei from useNFTOperations
      const listTx = await marketplaceContract.listNFT(
        contractAddresses.NFTCollection,
        tokenId,
        price, // price is already converted to wei in useNFTOperations
        { gasLimit: 300000 }
      );
      
      // Enhanced transaction tracking for list
      const listReceipt = await MetaMaskTransactionHelper.waitForTransactionWithTracking(
        listTx,
        'List NFT for Sale',
        {
          params: {
            tokenId: tokenId,
            price: ethers.formatEther(price) + ' ETH'
          }
        }
      );
      
      // Log list transaction (legacy support)
      TransactionLogger.logListTransaction(listReceipt, tokenId, price);

      // Convert back to ETH for display
      const priceInEth = ethers.formatEther(price);
      toast({
        title: 'NFT Listed Successfully',
        description: `Token ID ${tokenId} listed for ${priceInEth} ETH`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh listings
      await fetchMarketplaceListings();
    } catch (error) {
      console.error('Error listing NFT:', error);
      dispatch({
        type: NFT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to list NFT',
      });
      throw error;
    } finally {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Buy NFT
  const buyNFT = async (listingId, price) => {
    if (!signer || !state.contracts.nftMarketplace) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });

      const contract = state.contracts.nftMarketplace.connect(signer);
      
      // Validate listing exists and is active
      const listing = await contract.listings(listingId);
      if (!listing.active) {
        throw new Error('This NFT is no longer available for purchase');
      }
      
      // Check if user is trying to buy their own NFT
      if (listing.seller.toLowerCase() === account.toLowerCase()) {
        throw new Error('You cannot buy your own NFT');
      }
      
      // Validate price matches listing price
      const listingPrice = listing.price.toString();
      const providedPrice = price.toString();
      if (providedPrice !== listingPrice) {
        throw new Error('Price mismatch. Please refresh and try again.');
      }
      
      // Check user balance
      const balance = await signer.provider.getBalance(account);
      if (balance < price) {
        throw new Error('Insufficient balance to purchase this NFT');
      }
      
      // Estimate gas first
      let gasEstimate;
      try {
        gasEstimate = await contract.buyNFT.estimateGas(listingId, { value: price });
        // Add 20% buffer to gas estimate
        gasEstimate = gasEstimate * 120n / 100n;
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        gasEstimate = 400000n; // Fallback gas limit
      }
      
      const tx = await contract.buyNFT(
        listingId,
        { 
          value: price,
          gasLimit: gasEstimate
        }
      );
      
      // Enhanced transaction tracking for MetaMask activity
      const receipt = await MetaMaskTransactionHelper.waitForTransactionWithTracking(
        tx,
        'Buy NFT',
        {
          params: {
            listingId: listingId,
            price: ethers.formatEther(price) + ' ETH'
          },
          value: price
        }
      );
      
      // Track royalty payments if any
      MetaMaskTransactionHelper.trackRoyaltyPayment(receipt, listing.tokenId);
      
      // Log buy transaction (legacy support)
      TransactionLogger.logBuyTransaction(receipt, listingId, price);

      // Convert back to ETH for display
      const priceInEth = ethers.formatEther(price);
      toast({
        title: 'NFT Purchased Successfully',
        description: `NFT purchased successfully for ${priceInEth} ETH`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh data
      await Promise.all([
        fetchMarketplaceListings(),
        fetchUserNFTs(),
      ]);
    } catch (error) {
      console.error('Error buying NFT:', error);
      dispatch({
        type: NFT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to buy NFT',
      });
      throw error;
    } finally {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Delist NFT
  const delistNFT = async (listingId) => {
    if (!signer || !state.contracts.nftMarketplace) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });

      const contract = state.contracts.nftMarketplace.connect(signer);
      const tx = await contract.delistNFT(listingId, {
        gasLimit: 150000
      });
      
      // Enhanced transaction tracking for delist
      const receipt = await MetaMaskTransactionHelper.waitForTransactionWithTracking(
        tx,
        'Delist NFT',
        {
          params: {
            listingId: listingId
          }
        }
      );
      
      // Log delist transaction (legacy support)
      TransactionLogger.logDelistTransaction(receipt, listingId);

      toast({
        title: 'NFT Delisted Successfully',
        description: 'Your NFT has been removed from the marketplace',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh data
      await Promise.all([
        fetchMarketplaceListings(),
        fetchUserNFTs(),
      ]);
    } catch (error) {
      console.error('Error delisting NFT:', error);
      dispatch({
        type: NFT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to delist NFT',
      });
      throw error;
    } finally {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Update NFT price
  const updatePrice = async (listingId, newPrice) => {
    if (!signer || !state.contracts.nftMarketplace) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });

      const contract = state.contracts.nftMarketplace.connect(signer);
      const tx = await contract.updateListingPrice(listingId, newPrice, {
        gasLimit: 100000
      });
      
      // Enhanced transaction tracking for price update
      const receipt = await MetaMaskTransactionHelper.waitForTransactionWithTracking(
        tx,
        'Update NFT Price',
        {
          params: {
            listingId: listingId,
            newPrice: ethers.formatEther(newPrice) + ' ETH'
          }
        }
      );
      
      // Log update price transaction (legacy support)
      TransactionLogger.logUpdatePriceTransaction(receipt, listingId, newPrice);

      // Convert back to ETH for display
      const priceInEth = ethers.formatEther(newPrice);
      toast({
        title: 'Price Updated Successfully',
        description: `NFT price updated to ${priceInEth} ETH`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh data
      await Promise.all([
        fetchMarketplaceListings(),
        fetchUserNFTs(),
      ]);
    } catch (error) {
      console.error('Error updating price:', error);
      dispatch({
        type: NFT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to update price',
      });
      throw error;
    } finally {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Transfer NFT
  const transferNFT = async (tokenId, toAddress) => {
    if (!signer || !state.contracts.nftCollection) {
      throw new Error('Wallet not connected or contracts not initialized');
    }

    try {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });

      const contract = state.contracts.nftCollection.connect(signer);
      const tx = await contract.transferFrom(account, toAddress, tokenId, {
        gasLimit: 150000
      });
      
      // Enhanced transaction tracking for transfer
      const receipt = await MetaMaskTransactionHelper.waitForTransactionWithTracking(
        tx,
        'Transfer NFT',
        {
          params: {
            tokenId: tokenId,
            from: account,
            to: toAddress
          }
        }
      );
      
      // Log transfer transaction (legacy support)
      TransactionLogger.logTransferTransaction(receipt, tokenId, account, toAddress);

      toast({
        title: 'NFT Transferred Successfully',
        description: `NFT transferred to ${toAddress}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh data
      await fetchUserNFTs();
    } catch (error) {
      console.error('Error transferring NFT:', error);
      dispatch({
        type: NFT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to transfer NFT',
      });
      throw error;
    } finally {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Fetch marketplace listings
  const fetchMarketplaceListings = useCallback(async () => {
    if (!state.contracts.nftMarketplace || !state.contracts.nftCollection) return;

    try {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });

      const listingIds = await state.contracts.nftMarketplace.getActiveListings();

      const listingsWithMetadata = await Promise.all(
        listingIds.map(async (listingId) => {
          try {
            const listing = await state.contracts.nftMarketplace.listings(listingId);
            const tokenURI = await state.contracts.nftCollection.tokenURI(listing.tokenId);
            
            let metadata = {
              name: `NFT #${listing.tokenId}`,
              description: 'No description available',
              image: null,
            };
            
            // Only try to fetch metadata if tokenURI is valid
            if (tokenURI && tokenURI.trim() !== '' && !tokenURI.includes('QmExample')) {
              try {
                metadata = await fetchMetadata(tokenURI);
              } catch (metadataError) {
                console.warn(`Failed to fetch metadata for listing ${listingId}:`, metadataError);
                // Keep default metadata if fetch fails
              }
            }
            
            return {
              listingId: Number(listingId),
              tokenId: Number(listing.tokenId),
              seller: listing.seller,
              price: ethers.formatEther(listing.price),
              tokenURI,
              ...metadata,
            };
          } catch (listingError) {
            console.warn(`Failed to process listing ${listingId}:`, listingError);
            // Return basic listing info even if processing fails
            return {
              listingId: Number(listingId),
              tokenId: 0,
              seller: '',
              price: '0',
              tokenURI: '',
              name: `Listing #${listingId}`,
              description: 'Error loading listing data',
              image: null,
            };
          }
        })
      );

      dispatch({
        type: NFT_ACTIONS.SET_MARKETPLACE_LISTINGS,
        payload: listingsWithMetadata,
      });
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
      dispatch({
        type: NFT_ACTIONS.SET_ERROR,
        payload: 'Failed to fetch marketplace listings',
      });
    } finally {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.contracts.nftMarketplace, state.contracts.nftCollection, fetchMetadata]);

  // Fetch all NFTs (for homepage display)
  const fetchAllNFTs = useCallback(async () => {
    if (!state.contracts.nftCollection) return;

    try {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });

      // Get total supply of NFTs
      const totalSupply = await state.contracts.nftCollection.totalSupply();
      const tokenIds = [];
      
      // Get all token IDs
      for (let i = 1; i <= Number(totalSupply); i++) {
        try {
          // Check if token exists
          await state.contracts.nftCollection.ownerOf(i);
          tokenIds.push(i);
        } catch (error) {
          // Token doesn't exist, skip
          continue;
        }
      }
      
      const nftsWithMetadata = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await state.contracts.nftCollection.tokenURI(tokenId);
            const owner = await state.contracts.nftCollection.ownerOf(tokenId);
            const creator = await state.contracts.nftCollection.getCreator(tokenId);
            const royaltyInfo = await state.contracts.nftCollection.getRoyaltyInfo(tokenId);
            
            let metadata = {
              name: `NFT #${tokenId}`,
              description: 'No description available',
              image: null,
            };
            
            // Only try to fetch metadata if tokenURI is valid
            if (tokenURI && tokenURI.trim() !== '' && !tokenURI.includes('QmExample')) {
              try {
                metadata = await fetchMetadata(tokenURI);
              } catch (metadataError) {
                console.warn(`Failed to fetch metadata for token ${tokenId}:`, metadataError);
                // Keep default metadata if fetch fails
              }
            }
            
            return {
              tokenId: Number(tokenId),
              owner,
              creator,
              tokenURI,
              royaltyPercentage: Number(royaltyInfo[1]) / 100, // Convert basis points to percentage
              ...metadata,
            };
          } catch (tokenError) {
            console.warn(`Failed to process token ${tokenId}:`, tokenError);
            // Return basic NFT info even if processing fails
            return {
              tokenId: Number(tokenId),
              owner: '',
              creator: '',
              tokenURI: '',
              royaltyPercentage: 0,
              name: `NFT #${tokenId}`,
              description: 'Error loading NFT data',
              image: null,
            };
          }
        })
      );

      dispatch({
        type: NFT_ACTIONS.SET_NFTS,
        payload: nftsWithMetadata,
      });
    } catch (error) {
      console.error('Error fetching all NFTs:', error);
      dispatch({
        type: NFT_ACTIONS.SET_ERROR,
        payload: 'Failed to fetch all NFTs',
      });
    } finally {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.contracts.nftCollection, fetchMetadata]);

  // Fetch user's NFTs
  const fetchUserNFTs = useCallback(async () => {
    if (!account || !state.contracts.nftCollection) return;

    try {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: true });

      const tokenIds = await state.contracts.nftCollection.getTokensByOwner(account);
      
      // Get current marketplace listings to check if NFTs are listed
      let currentListings = [];
      if (state.contracts.nftMarketplace) {
        try {
          const listingIds = await state.contracts.nftMarketplace.getActiveListings();
          currentListings = await Promise.all(
            listingIds.map(async (listingId) => {
              try {
                const listing = await state.contracts.nftMarketplace.listings(listingId);
                return {
                  listingId: Number(listingId),
                  tokenId: Number(listing.tokenId),
                  seller: listing.seller,
                  price: ethers.formatEther(listing.price),
                };
              } catch (error) {
                return null;
              }
            })
          );
          currentListings = currentListings.filter(listing => listing !== null);
        } catch (error) {
          console.warn('Failed to fetch marketplace listings for user NFTs:', error);
        }
      }
      
      const nftsWithMetadata = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await state.contracts.nftCollection.tokenURI(tokenId);
            const creator = await state.contracts.nftCollection.getCreator(tokenId);
            const royaltyInfo = await state.contracts.nftCollection.getRoyaltyInfo(tokenId);
            
            // Check if this NFT is currently listed
            const listing = currentListings.find(l => l.tokenId === Number(tokenId) && l.seller.toLowerCase() === account.toLowerCase());
            const isListed = !!listing;
            const listingPrice = listing ? listing.price : null;
            const listingId = listing ? listing.listingId : null;
            
            let metadata = {
              name: `NFT #${tokenId}`,
              description: 'No description available',
              image: null,
            };
            
            // Only try to fetch metadata if tokenURI is valid
            if (tokenURI && tokenURI.trim() !== '' && !tokenURI.includes('QmExample')) {
              try {
                metadata = await fetchMetadata(tokenURI);
              } catch (metadataError) {
                console.warn(`Failed to fetch metadata for token ${tokenId}:`, metadataError);
                // Keep default metadata if fetch fails
              }
            }
            
            return {
              tokenId: Number(tokenId),
              owner: account,
              creator,
              tokenURI,
              royaltyPercentage: Number(royaltyInfo[1]) / 100, // Convert basis points to percentage
              isListed,
              price: listingPrice,
              listingId,
              ...metadata,
            };
          } catch (tokenError) {
            console.warn(`Failed to process token ${tokenId}:`, tokenError);
            // Return basic NFT info even if processing fails
            return {
              tokenId: Number(tokenId),
              owner: account,
              creator: account, // Fallback to owner
              tokenURI: '',
              royaltyPercentage: 0,
              isListed: false,
              price: null,
              listingId: null,
              name: `NFT #${tokenId}`,
              description: 'Error loading NFT data',
              image: null,
            };
          }
        })
      );

      dispatch({
        type: NFT_ACTIONS.SET_USER_NFTS,
        payload: nftsWithMetadata,
      });
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      dispatch({
        type: NFT_ACTIONS.SET_ERROR,
        payload: 'Failed to fetch user NFTs',
      });
    } finally {
      dispatch({ type: NFT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [account, state.contracts.nftCollection, state.contracts.nftMarketplace, fetchMetadata]);

  // Initialize contracts when provider changes
  React.useEffect(() => {
    initializeContracts();
  }, [initializeContracts]);

  // Fetch data when contracts are ready and user is connected
  React.useEffect(() => {
    if (state.contracts.nftCollection && state.contracts.nftMarketplace) {
      fetchMarketplaceListings();
      if (account) {
        fetchUserNFTs();
      }
    }
  }, [state.contracts.nftCollection, state.contracts.nftMarketplace, account, fetchMarketplaceListings, fetchUserNFTs]);

  // Clear data when user disconnects
  React.useEffect(() => {
    if (!isConnected) {
      dispatch({ type: NFT_ACTIONS.CLEAR_DATA });
    }
  }, [isConnected]);

  const value = {
    ...state,
    mintNFT,
    listNFT,
    buyNFT,
    delistNFT,
    updatePrice,
    transferNFT,
    fetchMarketplaceListings,
    fetchUserNFTs,
    fetchAllNFTs,
    fetchMetadata,
  };

  return <NFTContext.Provider value={value}>{children}</NFTContext.Provider>;
}

// Custom hook to use NFT context
export function useNFT() {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error('useNFT must be used within an NFTProvider');
  }
  return context;
}

export default NFTContext;