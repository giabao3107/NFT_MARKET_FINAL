// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTCollection
 * @dev ERC721 contract for minting and managing NFTs with royalty support
 */
contract NFTCollection is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;
    
    // Royalty info
    struct RoyaltyInfo {
        address creator;
        uint256 royaltyPercentage; // Basis points (e.g., 1000 = 10%)
    }
    
    // Mapping from token ID to royalty info
    mapping(uint256 => RoyaltyInfo) private _royalties;
    
    // Mapping from token ID to creator
    mapping(uint256 => address) private _creators;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed creator, address indexed to, string tokenURI, uint256 royaltyPercentage);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount);
    
    constructor() ERC721("NFT Marketplace Collection", "NFTMC") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new NFT
     * @param to Address to mint the NFT to
     * @param _tokenURI Metadata URI for the NFT
     * @param royaltyPercentage Royalty percentage in basis points (max 1000 = 10%)
     */
    function mintNFT(
        address to,
        string memory _tokenURI,
        uint256 royaltyPercentage
    ) public returns (uint256) {
        require(royaltyPercentage <= 1000, "Royalty percentage cannot exceed 10%");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // Set royalty info
        _royalties[tokenId] = RoyaltyInfo({
            creator: msg.sender,
            royaltyPercentage: royaltyPercentage
        });
        
        _creators[tokenId] = msg.sender;
        
        emit NFTMinted(tokenId, msg.sender, to, _tokenURI, royaltyPercentage);
        
        return tokenId;
    }
    
    /**
     * @dev Get royalty info for a token
     * @param tokenId Token ID to get royalty info for
     * @return creator Creator address
     * @return royaltyPercentage Royalty percentage in basis points
     */
    function getRoyaltyInfo(uint256 tokenId) public view returns (address creator, uint256 royaltyPercentage) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        RoyaltyInfo memory royalty = _royalties[tokenId];
        return (royalty.creator, royalty.royaltyPercentage);
    }
    
    /**
     * @dev Get creator of a token
     * @param tokenId Token ID
     * @return creator Creator address
     */
    function getCreator(uint256 tokenId) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _creators[tokenId];
    }
    
    /**
     * @dev Calculate royalty amount for a sale
     * @param tokenId Token ID
     * @param salePrice Sale price
     * @return royaltyAmount Amount to be paid as royalty
     */
    function calculateRoyalty(uint256 tokenId, uint256 salePrice) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        RoyaltyInfo memory royalty = _royalties[tokenId];
        return (salePrice * royalty.royaltyPercentage) / 10000;
    }
    
    /**
     * @dev Get total number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get all tokens owned by an address
     * @param owner Owner address
     * @return tokenIds Array of token IDs
     */
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalSupply(); i++) {
            if (ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get all tokens created by an address
     * @param creator Creator address
     * @return tokenIds Array of token IDs
     */
    function getTokensByCreator(address creator) public view returns (uint256[] memory) {
        uint256 totalTokens = totalSupply();
        uint256[] memory tempTokenIds = new uint256[](totalTokens);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_creators[i] == creator) {
                tempTokenIds[count] = i;
                count++;
            }
        }
        
        // Create array with exact size
        uint256[] memory tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tempTokenIds[i];
        }
        
        return tokenIds;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}