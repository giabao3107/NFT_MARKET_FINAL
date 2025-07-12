const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function cleanPreviousDeployment() {
  console.log("🧹 Cleaning previous deployment data...");
  
  const deploymentsPath = path.join(__dirname, "..", "deployments");
  
  // Remove previous deployment files
  if (fs.existsSync(deploymentsPath)) {
    fs.rmSync(deploymentsPath, { recursive: true, force: true });
    console.log("✅ Previous deployment files cleaned");
  }
  
  // Clean frontend contract files
  const frontendContractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (fs.existsSync(frontendContractsDir)) {
    fs.rmSync(frontendContractsDir, { recursive: true, force: true });
    console.log("✅ Frontend contract files cleaned");
  }
  
  console.log("🎉 Previous deployment data cleaned successfully!\n");
}

async function main() {
  // Clean previous deployment data first
  await cleanPreviousDeployment();
  
  console.log("🚀 Starting fresh deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy NFTCollection contract
  console.log("\n📦 Deploying NFTCollection...");
  const NFTCollection = await ethers.getContractFactory("NFTCollection");
  const nftCollection = await NFTCollection.deploy();
  await nftCollection.waitForDeployment();
  console.log("✅ NFTCollection deployed to:", await nftCollection.getAddress());

  // Deploy NFTMarketplace contract
  console.log("\n🏪 Deploying NFTMarketplace...");
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.waitForDeployment();
  console.log("✅ NFTMarketplace deployed to:", await nftMarketplace.getAddress());

  // Save contract addresses and ABIs
  const nftCollectionAddress = await nftCollection.getAddress();
  const nftMarketplaceAddress = await nftMarketplace.getAddress();
  
  const contractAddresses = {
    NFTCollection: nftCollectionAddress,
    NFTMarketplace: nftMarketplaceAddress,
    network: hre.network.name,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  // Save to contracts directory
  const contractsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, `${hre.network.name}.json`),
    JSON.stringify(contractAddresses, null, 2)
  );

  // Save ABIs
  const nftCollectionArtifact = await hre.artifacts.readArtifact("NFTCollection");
  const nftMarketplaceArtifact = await hre.artifacts.readArtifact("NFTMarketplace");

  fs.writeFileSync(
    path.join(contractsDir, "NFTCollection.json"),
    JSON.stringify({
      address: nftCollectionAddress,
      abi: nftCollectionArtifact.abi
    }, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "NFTMarketplace.json"),
    JSON.stringify({
      address: nftMarketplaceAddress,
      abi: nftMarketplaceArtifact.abi
    }, null, 2)
  );

  // Update .env file with contract addresses
  const envPath = path.join(__dirname, "..", "..", ".env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Update contract addresses
    envContent = envContent.replace(
      /NFT_COLLECTION_ADDRESS=.*/,
      `NFT_COLLECTION_ADDRESS=${nftCollectionAddress}`
    );
    envContent = envContent.replace(
      /NFT_MARKETPLACE_ADDRESS=.*/,
      `NFT_MARKETPLACE_ADDRESS=${nftMarketplaceAddress}`
    );
    envContent = envContent.replace(
      /REACT_APP_NFT_COLLECTION_ADDRESS=.*/,
      `REACT_APP_NFT_COLLECTION_ADDRESS=${nftCollectionAddress}`
    );
    envContent = envContent.replace(
      /REACT_APP_NFT_MARKETPLACE_ADDRESS=.*/,
      `REACT_APP_NFT_MARKETPLACE_ADDRESS=${nftMarketplaceAddress}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log("\n📝 .env file updated with contract addresses");
  }

  // Copy ABIs to frontend
  const frontendContractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // Copy contract files to frontend
  fs.copyFileSync(
    path.join(contractsDir, "NFTCollection.json"),
    path.join(frontendContractsDir, "NFTCollection.json")
  );
  fs.copyFileSync(
    path.join(contractsDir, "NFTMarketplace.json"),
    path.join(frontendContractsDir, "NFTMarketplace.json")
  );
  fs.copyFileSync(
    path.join(contractsDir, `${hre.network.name}.json`),
    path.join(frontendContractsDir, "addresses.json")
  );

  // Create index.js file for frontend contracts
  const indexJsContent = `// Contract utilities and configurations
import NFTCollectionABI from './NFTCollection.json';
import NFTMarketplaceABI from './NFTMarketplace.json';
import addresses from './addresses.json';

// Export contract ABIs
export { NFTCollectionABI, NFTMarketplaceABI };

// Export contract addresses
export const CONTRACT_ADDRESSES = addresses;

// Get current network configuration
export const getCurrentNetwork = () => {
  return {
    name: addresses.network || 'localhost',
    chainId: addresses.network === 'localhost' ? 31337 : 1,
    contracts: {
      NFTCollection: addresses.NFTCollection,
      NFTMarketplace: addresses.NFTMarketplace
    },
    deployer: addresses.deployer,
    deployedAt: addresses.deployedAt
  };
};

// Get contract address by name
export const getContractAddress = (contractName) => {
  return addresses[contractName];
};

// Check if contracts are deployed
export const areContractsDeployed = () => {
  return !!(addresses.NFTCollection && addresses.NFTMarketplace);
};

// Get network info
export const getNetworkInfo = () => {
  const network = getCurrentNetwork();
  return {
    name: network.name,
    chainId: network.chainId,
    isLocalhost: network.name === 'localhost'
  };
};

// Export all contract data
const contractUtils = {
  NFTCollectionABI,
  NFTMarketplaceABI,
  CONTRACT_ADDRESSES,
  getCurrentNetwork,
  getContractAddress,
  areContractsDeployed,
  getNetworkInfo
};

export default contractUtils;
`;

  fs.writeFileSync(
    path.join(frontendContractsDir, "index.js"),
    indexJsContent
  );

  console.log("\n📋 Contract ABIs copied to frontend");

  // Create sample NFT data for testing
  console.log("\n🎨 Creating sample NFT data...");
  
  const sampleNFTs = [
    {
      id: 1,
      name: "Digital Art #001",
      description: "A beautiful digital artwork showcasing modern creativity",
      image: "https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Art+%23001",
      creator: deployer.address,
      owner: deployer.address,
      price: "0.1",
      royalty: 500, // 5%
      category: "Art",
      tags: ["digital", "modern", "creative"]
    },
    {
      id: 2,
      name: "Pixel Avatar #042",
      description: "Unique pixel art avatar with rare traits",
      image: "https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Avatar+%23042",
      creator: deployer.address,
      owner: deployer.address,
      price: "0.05",
      royalty: 750, // 7.5%
      category: "Avatar",
      tags: ["pixel", "avatar", "rare"]
    },
    {
      id: 3,
      name: "Music NFT - Beat Drop",
      description: "Exclusive electronic music track with visual effects",
      image: "https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Music+NFT",
      creator: deployer.address,
      owner: deployer.address,
      price: "0.25",
      royalty: 1000, // 10%
      category: "Music",
      tags: ["electronic", "music", "exclusive"]
    },
    {
      id: 4,
      name: "3D Model - Futuristic Car",
      description: "High-quality 3D model of a futuristic vehicle",
      image: "https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=3D+Car",
      creator: deployer.address,
      owner: deployer.address,
      price: "0.15",
      royalty: 600, // 6%
      category: "3D",
      tags: ["3d", "vehicle", "futuristic"]
    },
    {
      id: 5,
      name: "Photography - Sunset",
      description: "Stunning sunset photography captured in 4K resolution",
      image: "https://via.placeholder.com/400x400/FFEAA7/FFFFFF?text=Sunset+Photo",
      creator: deployer.address,
      owner: deployer.address,
      price: "0.08",
      royalty: 400, // 4%
      category: "Photography",
      tags: ["photography", "sunset", "nature"]
    }
  ];

  // Save sample NFT data to frontend
  const sampleDataPath = path.join(frontendContractsDir, "sampleNFTs.json");
  fs.writeFileSync(
    sampleDataPath,
    JSON.stringify({
      nfts: sampleNFTs,
      totalCount: sampleNFTs.length,
      categories: ["Art", "Avatar", "Music", "3D", "Photography"],
      generatedAt: new Date().toISOString(),
      network: hre.network.name
    }, null, 2)
  );

  console.log("✅ Sample NFT data created:", sampleNFTs.length, "NFTs");
  console.log("📁 Sample data saved to:", sampleDataPath);

  console.log("\n🎉 Fresh deployment completed successfully!");
  console.log("\n📍 Contract Addresses:");
  console.log("   NFTCollection:", nftCollectionAddress);
  console.log("   NFTMarketplace:", nftMarketplaceAddress);
  console.log("\n🌐 Network:", hre.network.name);
  console.log("\n🎨 Sample NFTs:", sampleNFTs.length, "items created");
  console.log("\n💡 Note: All previous blockchain data has been reset!");
  console.log("\n🚀 You can now start the frontend and see sample NFT data!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });