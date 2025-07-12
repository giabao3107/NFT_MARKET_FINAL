const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy NFTCollection contract
  console.log("\nDeploying NFTCollection...");
  const NFTCollection = await ethers.getContractFactory("NFTCollection");
  const nftCollection = await NFTCollection.deploy();
  await nftCollection.waitForDeployment();
  console.log("NFTCollection deployed to:", await nftCollection.getAddress());

  // Deploy NFTMarketplace contract
  console.log("\nDeploying NFTMarketplace...");
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.waitForDeployment();
  console.log("NFTMarketplace deployed to:", await nftMarketplace.getAddress());

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
    console.log("\n.env file updated with contract addresses");
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

  console.log("\nContract ABIs copied to frontend");
  console.log("\nDeployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("NFTCollection:", nftCollectionAddress);
  console.log("NFTMarketplace:", nftMarketplaceAddress);
  console.log("\nNetwork:", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });