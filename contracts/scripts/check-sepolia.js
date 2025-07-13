const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Checking Sepolia Testnet Configuration...");
  console.log("=".repeat(50));

  try {
    // Check network configuration
    const network = hre.network.name;
    console.log(`📡 Current Network: ${network}`);
    
    if (network !== "sepolia") {
      console.log("⚠️  Warning: Not connected to Sepolia network");
      console.log("   Run with: npx hardhat run scripts/check-sepolia.js --network sepolia");
      return;
    }

    // Check provider connection
    const provider = ethers.provider;
    const chainId = await provider.getNetwork();
    console.log(`🔗 Chain ID: ${chainId.chainId}`);
    
    if (chainId.chainId !== 11155111n) {
      console.log("❌ Error: Wrong chain ID. Expected 11155111 for Sepolia");
      return;
    }

    // Check deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer Address: ${deployer.address}`);
    
    // Check balance
    const balance = await provider.getBalance(deployer.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceInEth} ETH`);
    
    if (parseFloat(balanceInEth) < 0.05) {
      console.log("⚠️  Warning: Low balance. You need at least 0.05 ETH for deployment");
      console.log("   Get Sepolia ETH from: https://sepoliafaucet.com/");
    } else {
      console.log("✅ Sufficient balance for deployment");
    }

    // Check latest block
    const latestBlock = await provider.getBlockNumber();
    console.log(`📦 Latest Block: ${latestBlock}`);

    // Check gas price
    const gasPrice = await provider.getFeeData();
    console.log(`⛽ Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, "gwei")} gwei`);

    // Check environment variables
    console.log("\n🔧 Environment Configuration:");
    const envPath = path.join(__dirname, "..", "..", ".env");
    
    if (!fs.existsSync(envPath)) {
      console.log("❌ .env file not found");
      return;
    }

    const envContent = fs.readFileSync(envPath, "utf8");
    
    // Check required variables
    const requiredVars = [
      "ETHEREUM_TESTNET_RPC_URL",
      "PRIVATE_KEY",
      "INFURA_PROJECT_ID",
      "PINATA_API_KEY",
      "PINATA_SECRET_KEY",
      "PINATA_JWT"
    ];

    let allConfigured = true;
    requiredVars.forEach(varName => {
      const regex = new RegExp(`${varName}=(.+)`);
      const match = envContent.match(regex);
      
      if (!match || match[1].includes("YOUR_") || match[1].includes("your_") || match[1].trim() === "") {
        console.log(`❌ ${varName}: Not configured`);
        allConfigured = false;
      } else {
        console.log(`✅ ${varName}: Configured`);
      }
    });

    if (!allConfigured) {
      console.log("\n⚠️  Please configure all required environment variables before deployment");
      console.log("   See deploy-sepolia.md for detailed instructions");
      return;
    }

    // Test IPFS connection (Pinata)
    console.log("\n🌐 Testing IPFS Connection...");
    try {
      const pinataApiKey = process.env.PINATA_API_KEY;
      const pinataSecretKey = process.env.PINATA_SECRET_KEY;
      
      if (pinataApiKey && pinataSecretKey) {
        // Simple test - we won't actually upload anything
        console.log("✅ Pinata credentials found");
      } else {
        console.log("❌ Pinata credentials missing");
      }
    } catch (error) {
      console.log(`❌ IPFS connection error: ${error.message}`);
    }

    console.log("\n" + "=".repeat(50));
    
    if (allConfigured && parseFloat(balanceInEth) >= 0.05) {
      console.log("🎉 All checks passed! Ready for deployment");
      console.log("\n🚀 To deploy, run:");
      console.log("   npx hardhat run scripts/deploy.js --network sepolia");
    } else {
      console.log("⚠️  Please fix the issues above before deployment");
    }

  } catch (error) {
    console.error("❌ Error checking configuration:", error.message);
    
    if (error.message.includes("could not detect network")) {
      console.log("\n💡 Possible solutions:");
      console.log("   1. Check your ETHEREUM_TESTNET_RPC_URL in .env");
      console.log("   2. Verify your Infura project ID is correct");
      console.log("   3. Make sure you have internet connection");
    }
    
    if (error.message.includes("private key")) {
      console.log("\n💡 Possible solutions:");
      console.log("   1. Check your PRIVATE_KEY in .env (without 0x prefix)");
      console.log("   2. Make sure the private key is valid");
      console.log("   3. Ensure the account has Sepolia ETH");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });