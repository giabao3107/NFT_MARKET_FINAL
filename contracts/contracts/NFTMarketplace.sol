// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./NFTCollection.sol";

/**
 * @title NFTMarketplace
 * @dev Marketplace contract for buying and selling NFTs with automatic royalty distribution
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {
    
    // Marketplace fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 public marketplaceFeePercentage = 250;
    
    // Struct for marketplace listings
    struct Listing {
        uint256 tokenId;
        address nftContract;
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
    }
    
    // Struct for transaction history
    struct Transaction {
        uint256 tokenId;
        address nftContract;
        address seller;
        address buyer;
        uint256 price;
        uint256 timestamp;
    }
    
    // Mapping from listing ID to listing details
    mapping(uint256 => Listing) public listings;
    
    // Mapping from contract address and token ID to listing ID
    mapping(address => mapping(uint256 => uint256)) public tokenToListing;
    
    // Array to store all transactions
    Transaction[] public transactions;
    
    // Mapping to track user transactions
    mapping(address => uint256[]) public userTransactions;
    
    // Counter for listing IDs
    uint256 private _listingIdCounter;
    
    // Events
    event NFTListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed nftContract, address seller, uint256 price);
    event NFTSold(uint256 indexed listingId, uint256 indexed tokenId, address indexed nftContract, address seller, address buyer, uint256 price);
    event NFTDelisted(uint256 indexed listingId, uint256 indexed tokenId, address indexed nftContract, address seller);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount);
    event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev List an NFT for sale
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Price in wei
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        require(IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) || 
                IERC721(nftContract).getApproved(tokenId) == address(this), 
                "Marketplace not approved to transfer NFT");
        require(tokenToListing[nftContract][tokenId] == 0, "NFT already listed");
        
        _listingIdCounter++;
        uint256 listingId = _listingIdCounter;
        
        listings[listingId] = Listing({
            tokenId: tokenId,
            nftContract: nftContract,
            seller: msg.sender,
            price: price,
            active: true,
            listedAt: block.timestamp
        });
        
        tokenToListing[nftContract][tokenId] = listingId;
        
        emit NFTListed(listingId, tokenId, nftContract, msg.sender, price);
    }
    
    /**
     * @dev Buy an NFT from the marketplace
     * @param listingId ID of the listing to purchase
     */
    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");
        
        address nftContract = listing.nftContract;
        uint256 tokenId = listing.tokenId;
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Mark listing as inactive
        listing.active = false;
        tokenToListing[nftContract][tokenId] = 0;
        
        // Calculate fees and royalties
        uint256 marketplaceFee = (price * marketplaceFeePercentage) / 10000;
        uint256 royaltyAmount = 0;
        address creator = address(0);
        
        // Check if it's our NFT contract and calculate royalty
        if (_isNFTCollection(nftContract)) {
            try NFTCollection(nftContract).getRoyaltyInfo(tokenId) returns (address _creator, uint256 _royaltyPercentage) {
                creator = _creator;
                if (creator != seller && creator != address(0)) {
                    royaltyAmount = (price * _royaltyPercentage) / 10000;
                }
            } catch {
                // If getRoyaltyInfo fails, no royalty
            }
        }
        
        uint256 sellerAmount = price - marketplaceFee - royaltyAmount;
        
        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);
        
        // Transfer payments
        if (royaltyAmount > 0 && creator != address(0)) {
            payable(creator).transfer(royaltyAmount);
            emit RoyaltyPaid(tokenId, creator, royaltyAmount);
        }
        
        payable(seller).transfer(sellerAmount);
        payable(owner()).transfer(marketplaceFee);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        // Record transaction
        uint256 transactionId = transactions.length;
        transactions.push(Transaction({
            tokenId: tokenId,
            nftContract: nftContract,
            seller: seller,
            buyer: msg.sender,
            price: price,
            timestamp: block.timestamp
        }));
        
        userTransactions[seller].push(transactionId);
        userTransactions[msg.sender].push(transactionId);
        
        emit NFTSold(listingId, tokenId, nftContract, seller, msg.sender, price);
    }
    
    /**
     * @dev Delist an NFT from the marketplace
     * @param listingId ID of the listing to remove
     */
    function delistNFT(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized to delist");
        
        listing.active = false;
        tokenToListing[listing.nftContract][listing.tokenId] = 0;
        
        emit NFTDelisted(listingId, listing.tokenId, listing.nftContract, listing.seller);
    }
    
    /**
     * @dev Update listing price
     * @param listingId ID of the listing to update
     * @param newPrice New price in wei
     */
    function updateListingPrice(uint256 listingId, uint256 newPrice) external {
        require(newPrice > 0, "Price must be greater than 0");
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender, "Not the seller");
        
        listing.price = newPrice;
    }
    
    /**
     * @dev Get all active listings
     * @return activeListings Array of active listing IDs
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256[] memory tempListings = new uint256[](_listingIdCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _listingIdCounter; i++) {
            if (listings[i].active) {
                tempListings[count] = i;
                count++;
            }
        }
        
        uint256[] memory activeListings = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            activeListings[i] = tempListings[i];
        }
        
        return activeListings;
    }
    
    /**
     * @dev Get listings by seller
     * @param seller Seller address
     * @return sellerListings Array of listing IDs
     */
    function getListingsBySeller(address seller) external view returns (uint256[] memory) {
        uint256[] memory tempListings = new uint256[](_listingIdCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _listingIdCounter; i++) {
            if (listings[i].seller == seller && listings[i].active) {
                tempListings[count] = i;
                count++;
            }
        }
        
        uint256[] memory sellerListings = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            sellerListings[i] = tempListings[i];
        }
        
        return sellerListings;
    }
    
    /**
     * @dev Get user transaction history
     * @param user User address
     * @return transactionIds Array of transaction IDs
     */
    function getUserTransactions(address user) external view returns (uint256[] memory) {
        return userTransactions[user];
    }
    
    /**
     * @dev Get total number of transactions
     */
    function getTotalTransactions() external view returns (uint256) {
        return transactions.length;
    }
    
    /**
     * @dev Update marketplace fee (only owner)
     * @param newFeePercentage New fee percentage in basis points
     */
    function updateMarketplaceFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%");
        uint256 oldFee = marketplaceFeePercentage;
        marketplaceFeePercentage = newFeePercentage;
        emit MarketplaceFeeUpdated(oldFee, newFeePercentage);
    }
    
    /**
     * @dev Withdraw marketplace fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Check if a contract is an NFTCollection
     * @param contractAddress Address to check
     */
    function _isNFTCollection(address contractAddress) private view returns (bool) {
        try NFTCollection(contractAddress).supportsInterface(0x80ac58cd) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev Emergency function to handle stuck NFTs (only owner)
     */
    function emergencyDelist(uint256 listingId) external onlyOwner {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        
        listing.active = false;
        tokenToListing[listing.nftContract][listing.tokenId] = 0;
        
        emit NFTDelisted(listingId, listing.tokenId, listing.nftContract, listing.seller);
    }
}