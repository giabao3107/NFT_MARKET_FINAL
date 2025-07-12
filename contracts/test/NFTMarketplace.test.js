const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let nftCollection, nftMarketplace;
  let owner, seller, buyer, creator;
  let tokenId;
  const tokenURI = "https://example.com/token/1";
  const royaltyPercentage = 500; // 5%
  const listingPrice = ethers.utils.parseEther("1"); // 1 ETH

  beforeEach(async function () {
    [owner, seller, buyer, creator] = await ethers.getSigners();

    // Deploy NFTCollection
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy();
    await nftCollection.deployed();

    // Deploy NFTMarketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();

    // Mint an NFT
    await nftCollection.connect(creator).mintNFT(seller.address, tokenURI, royaltyPercentage);
    tokenId = 1;
  });

  describe("NFT Collection", function () {
    it("Should mint NFT with correct details", async function () {
      expect(await nftCollection.ownerOf(tokenId)).to.equal(seller.address);
      expect(await nftCollection.tokenURI(tokenId)).to.equal(tokenURI);
      expect(await nftCollection.getCreator(tokenId)).to.equal(creator.address);
      
      const [royaltyCreator, royaltyPercent] = await nftCollection.getRoyaltyInfo(tokenId);
      expect(royaltyCreator).to.equal(creator.address);
      expect(royaltyPercent).to.equal(royaltyPercentage);
    });

    it("Should calculate royalty correctly", async function () {
      const salePrice = ethers.utils.parseEther("10");
      const expectedRoyalty = salePrice.mul(royaltyPercentage).div(10000);
      const calculatedRoyalty = await nftCollection.calculateRoyalty(tokenId, salePrice);
      expect(calculatedRoyalty).to.equal(expectedRoyalty);
    });

    it("Should get tokens by owner", async function () {
      const tokens = await nftCollection.getTokensByOwner(seller.address);
      expect(tokens.length).to.equal(1);
      expect(tokens[0]).to.equal(tokenId);
    });

    it("Should get tokens by creator", async function () {
      const tokens = await nftCollection.getTokensByCreator(creator.address);
      expect(tokens.length).to.equal(1);
      expect(tokens[0]).to.equal(tokenId);
    });
  });

  describe("NFT Marketplace", function () {
    beforeEach(async function () {
      // Approve marketplace to transfer NFT
      await nftCollection.connect(seller).approve(nftMarketplace.address, tokenId);
    });

    it("Should list NFT for sale", async function () {
      await nftMarketplace.connect(seller).listNFT(nftCollection.address, tokenId, listingPrice);
      
      const listing = await nftMarketplace.listings(1);
      expect(listing.tokenId).to.equal(tokenId);
      expect(listing.nftContract).to.equal(nftCollection.address);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(listingPrice);
      expect(listing.active).to.be.true;
    });

    it("Should not allow listing without approval", async function () {
      // Remove approval
      await nftCollection.connect(seller).approve(ethers.constants.AddressZero, tokenId);
      
      await expect(
        nftMarketplace.connect(seller).listNFT(nftCollection.address, tokenId, listingPrice)
      ).to.be.revertedWith("Marketplace not approved to transfer NFT");
    });

    it("Should buy NFT and distribute payments correctly", async function () {
      // List NFT
      await nftMarketplace.connect(seller).listNFT(nftCollection.address, tokenId, listingPrice);
      
      // Get initial balances
      const initialSellerBalance = await seller.getBalance();
      const initialCreatorBalance = await creator.getBalance();
      const initialOwnerBalance = await owner.getBalance();
      
      // Buy NFT
      await nftMarketplace.connect(buyer).buyNFT(1, { value: listingPrice });
      
      // Check NFT ownership
      expect(await nftCollection.ownerOf(tokenId)).to.equal(buyer.address);
      
      // Check listing is inactive
      const listing = await nftMarketplace.listings(1);
      expect(listing.active).to.be.false;
      
      // Calculate expected payments
      const marketplaceFee = listingPrice.mul(250).div(10000); // 2.5%
      const royaltyAmount = listingPrice.mul(royaltyPercentage).div(10000); // 5%
      const sellerAmount = listingPrice.sub(marketplaceFee).sub(royaltyAmount);
      
      // Check balances (approximately, due to gas costs)
      const finalSellerBalance = await seller.getBalance();
      const finalCreatorBalance = await creator.getBalance();
      const finalOwnerBalance = await owner.getBalance();
      
      expect(finalSellerBalance.sub(initialSellerBalance)).to.equal(sellerAmount);
      expect(finalCreatorBalance.sub(initialCreatorBalance)).to.equal(royaltyAmount);
      expect(finalOwnerBalance.sub(initialOwnerBalance)).to.equal(marketplaceFee);
    });

    it("Should not allow buying own NFT", async function () {
      await nftMarketplace.connect(seller).listNFT(nftCollection.address, tokenId, listingPrice);
      
      await expect(
        nftMarketplace.connect(seller).buyNFT(1, { value: listingPrice })
      ).to.be.revertedWith("Cannot buy your own NFT");
    });

    it("Should allow delisting NFT", async function () {
      await nftMarketplace.connect(seller).listNFT(nftCollection.address, tokenId, listingPrice);
      await nftMarketplace.connect(seller).delistNFT(1);
      
      const listing = await nftMarketplace.listings(1);
      expect(listing.active).to.be.false;
    });

    it("Should update listing price", async function () {
      await nftMarketplace.connect(seller).listNFT(nftCollection.address, tokenId, listingPrice);
      
      const newPrice = ethers.utils.parseEther("2");
      await nftMarketplace.connect(seller).updateListingPrice(1, newPrice);
      
      const listing = await nftMarketplace.listings(1);
      expect(listing.price).to.equal(newPrice);
    });

    it("Should get active listings", async function () {
      await nftMarketplace.connect(seller).listNFT(nftCollection.address, tokenId, listingPrice);
      
      const activeListings = await nftMarketplace.getActiveListings();
      expect(activeListings.length).to.equal(1);
      expect(activeListings[0]).to.equal(1);
    });

    it("Should get listings by seller", async function () {
      await nftMarketplace.connect(seller).listNFT(nftCollection.address, tokenId, listingPrice);
      
      const sellerListings = await nftMarketplace.getListingsBySeller(seller.address);
      expect(sellerListings.length).to.equal(1);
      expect(sellerListings[0]).to.equal(1);
    });

    it("Should record transaction history", async function () {
      await nftMarketplace.connect(seller).listNFT(nftCollection.address, tokenId, listingPrice);
      await nftMarketplace.connect(buyer).buyNFT(1, { value: listingPrice });
      
      const totalTransactions = await nftMarketplace.getTotalTransactions();
      expect(totalTransactions).to.equal(1);
      
      const transaction = await nftMarketplace.transactions(0);
      expect(transaction.tokenId).to.equal(tokenId);
      expect(transaction.seller).to.equal(seller.address);
      expect(transaction.buyer).to.equal(buyer.address);
      expect(transaction.price).to.equal(listingPrice);
    });

    it("Should update marketplace fee (owner only)", async function () {
      const newFee = 500; // 5%
      await nftMarketplace.connect(owner).updateMarketplaceFee(newFee);
      
      expect(await nftMarketplace.marketplaceFeePercentage()).to.equal(newFee);
    });

    it("Should not allow non-owner to update marketplace fee", async function () {
      const newFee = 500;
      await expect(
        nftMarketplace.connect(seller).updateMarketplaceFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});