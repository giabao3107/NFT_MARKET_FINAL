const fs = require('fs');
const path = require('path');

// Script để chuyển đổi giữa Local và Sepolia network

const networks = {
  local: {
    REACT_APP_DEFAULT_CHAIN_ID: '31337',
    REACT_APP_ETHEREUM_RPC_URL: 'http://127.0.0.1:8545',
    description: 'Hardhat Local Network'
  },
  sepolia: {
    REACT_APP_DEFAULT_CHAIN_ID: '11155111',
    REACT_APP_ETHEREUM_RPC_URL: 'https://sepolia.infura.io/v3/2409133a88704cf4a95aa76e6ed2563a',
    description: 'Sepolia Testnet'
  }
};

function updateEnvFile(networkType) {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ File .env không tồn tại');
    return;
  }

  const network = networks[networkType];
  if (!network) {
    console.log('❌ Network không hợp lệ. Sử dụng: local hoặc sepolia');
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Cập nhật cấu hình network
  envContent = envContent.replace(
    /REACT_APP_DEFAULT_CHAIN_ID=.*/,
    `REACT_APP_DEFAULT_CHAIN_ID=${network.REACT_APP_DEFAULT_CHAIN_ID}`
  );
  
  envContent = envContent.replace(
    /REACT_APP_ETHEREUM_RPC_URL=.*/,
    `REACT_APP_ETHEREUM_RPC_URL=${network.REACT_APP_ETHEREUM_RPC_URL}`
  );

  fs.writeFileSync(envPath, envContent);
  
  console.log(`✅ Đã chuyển sang ${network.description}`);
  console.log(`📡 Chain ID: ${network.REACT_APP_DEFAULT_CHAIN_ID}`);
  console.log(`🔗 RPC URL: ${network.REACT_APP_ETHEREUM_RPC_URL}`);
  
  if (networkType === 'sepolia') {
    console.log('\n⚠️  Lưu ý:');
    console.log('- Đảm bảo đã cập nhật PRIVATE_KEY cho Sepolia');
    console.log('- Cần có Sepolia ETH để deploy');
    console.log('- Chạy: npx hardhat run scripts/check-sepolia.js --network sepolia');
  } else {
    console.log('\n💡 Để sử dụng local network:');
    console.log('- Chạy: npx hardhat node (trong terminal riêng)');
    console.log('- Deploy: npx hardhat run scripts/deploy.js --network localhost');
  }
  
  console.log('\n🔄 Restart frontend để áp dụng thay đổi');
}

function showCurrentNetwork() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ File .env không tồn tại');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const chainIdMatch = envContent.match(/REACT_APP_DEFAULT_CHAIN_ID=(.*)/);  
  const rpcUrlMatch = envContent.match(/REACT_APP_ETHEREUM_RPC_URL=(.*)/);  
  
  if (chainIdMatch && rpcUrlMatch) {
    const chainId = chainIdMatch[1];
    const rpcUrl = rpcUrlMatch[1];
    
    console.log('📊 Cấu hình network hiện tại:');
    console.log(`📡 Chain ID: ${chainId}`);
    console.log(`🔗 RPC URL: ${rpcUrl}`);
    
    if (chainId === '31337') {
      console.log('🏠 Network: Hardhat Local');
    } else if (chainId === '11155111') {
      console.log('🌐 Network: Sepolia Testnet');
    } else {
      console.log('❓ Network: Unknown');
    }
  }
}

function showHelp() {
  console.log('🔧 Script chuyển đổi network cho NFT Marketplace');
  console.log('\nCách sử dụng:');
  console.log('  node switch-network.js <command>');
  console.log('\nCommands:');
  console.log('  local     - Chuyển sang Hardhat Local Network');
  console.log('  sepolia   - Chuyển sang Sepolia Testnet');
  console.log('  status    - Hiển thị network hiện tại');
  console.log('  help      - Hiển thị hướng dẫn này');
  console.log('\nVí dụ:');
  console.log('  node switch-network.js sepolia');
  console.log('  node switch-network.js local');
  console.log('  node switch-network.js status');
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'local':
    updateEnvFile('local');
    break;
  case 'sepolia':
    updateEnvFile('sepolia');
    break;
  case 'status':
    showCurrentNetwork();
    break;
  case 'help':
  case undefined:
    showHelp();
    break;
  default:
    console.log(`❌ Command không hợp lệ: ${command}`);
    showHelp();
    break;
}