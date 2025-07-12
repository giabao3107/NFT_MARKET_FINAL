// Contract utilities and configurations
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