const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to kill processes on specific port
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    // For Windows
    if (process.platform === 'win32') {
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (stdout) {
          const lines = stdout.split('\n');
          const pids = [];
          
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
              const pid = parts[4];
              if (pid && pid !== '0') {
                pids.push(pid);
              }
            }
          });
          
          if (pids.length > 0) {
            pids.forEach(pid => {
              exec(`taskkill /F /PID ${pid}`, () => {});
            });
            console.log(`✅ Killed processes on port ${port}`);
          }
        }
        resolve();
      });
    } else {
      // For Unix-like systems
      exec(`lsof -ti:${port}`, (error, stdout) => {
        if (stdout) {
          const pids = stdout.trim().split('\n');
          pids.forEach(pid => {
            if (pid) {
              exec(`kill -9 ${pid}`, () => {});
            }
          });
          console.log(`✅ Killed processes on port ${port}`);
        }
        resolve();
      });
    }
  });
}

// Function to clean blockchain data
function cleanBlockchainData() {
  console.log('🧹 Cleaning blockchain data...');
  
  // Clean Hardhat cache and artifacts
  const cachePath = path.join(__dirname, '..', 'cache');
  const artifactsPath = path.join(__dirname, '..', 'artifacts');
  
  if (fs.existsSync(cachePath)) {
    fs.rmSync(cachePath, { recursive: true, force: true });
    console.log('✅ Cache cleaned');
  }
  
  if (fs.existsSync(artifactsPath)) {
    fs.rmSync(artifactsPath, { recursive: true, force: true });
    console.log('✅ Artifacts cleaned');
  }
  
  console.log('✅ Blockchain data cleaned');
}

// Function to start fresh Hardhat node
function startFreshNode() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting fresh Hardhat node...');
    
    const nodeProcess = spawn('npx', ['hardhat', 'node'], {
      stdio: 'inherit',
      shell: true
    });
    
    // Give the node some time to start
    setTimeout(() => {
      console.log('✅ Hardhat node started on http://127.0.0.1:8545');
      console.log('🎉 Fresh blockchain is ready!');
      console.log('\n📝 Next steps:');
      console.log('   1. Run: npm run deploy:fresh');
      console.log('   2. Or run: npm run deploy:local');
      resolve(nodeProcess);
    }, 3000);
    
    nodeProcess.on('error', (error) => {
      console.error('❌ Failed to start Hardhat node:', error);
      reject(error);
    });
  });
}

async function main() {
  console.log('🔄 Resetting local blockchain...');
  
  try {
    // Step 1: Kill any existing processes on port 8545
    await killProcessOnPort(8545);
    
    // Step 2: Clean blockchain data
    cleanBlockchainData();
    
    // Step 3: Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Start fresh node
    await startFreshNode();
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

main().catch(console.error);