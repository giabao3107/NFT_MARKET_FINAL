import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  useToast
} from '@chakra-ui/react';
import { testRPCConnection, testContractConnection } from '../../utils/rpcTest';
import { useNFT } from '../../contexts/NFTContext';
import { CONTRACT_ADDRESSES } from '../../contracts';
import NFTMarketplaceABI from '../../contracts/NFTMarketplace.json';

const RPCDebug = () => {
  const [rpcStatus, setRpcStatus] = useState(null);
  const [contractStatus, setContractStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { state, account } = useNFT();
  const toast = useToast();

  const testRPC = async () => {
    setLoading(true);
    try {
      const result = await testRPCConnection();
      setRpcStatus(result);
      
      if (result.success) {
        toast({
          title: 'RPC Test Successful',
          description: `Connected to network ${result.network}`,
          status: 'success',
          duration: 3000
        });
      } else {
        toast({
          title: 'RPC Test Failed',
          description: result.error,
          status: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('RPC test error:', error);
      setRpcStatus({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testContract = async () => {
    setLoading(true);
    try {
      const marketplaceAddress = CONTRACT_ADDRESSES?.NFTMarketplace;
      if (!marketplaceAddress) {
        throw new Error('Marketplace contract address not found');
      }
      
      const result = await testContractConnection(
        marketplaceAddress,
        NFTMarketplaceABI.abi
      );
      setContractStatus(result);
      
      if (result.success) {
        toast({
          title: 'Contract Test Successful',
          description: 'Contract is accessible',
          status: 'success',
          duration: 3000
        });
      } else {
        toast({
          title: 'Contract Test Failed',
          description: result.error,
          status: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Contract test error:', error);
      setContractStatus({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testRPC();
  }, []);

  return (
    <Box p={6} bg="gray.50" borderRadius="lg" maxW="600px" mx="auto">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        🔧 RPC & Contract Debug Panel
      </Text>
      
      <VStack spacing={4} align="stretch">
        {/* RPC Status */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="semibold">RPC Connection</Text>
            <Button size="sm" onClick={testRPC} isLoading={loading}>
              Test RPC
            </Button>
          </HStack>
          
          {rpcStatus && (
            <Alert status={rpcStatus.success ? 'success' : 'error'}>
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {rpcStatus.success ? 'Connected!' : 'Connection Failed'}
                </AlertTitle>
                <AlertDescription>
                  {rpcStatus.success ? (
                    <VStack align="start" spacing={1}>
                      <Text>Network: {rpcStatus.network}</Text>
                      <Text>Block: {rpcStatus.blockNumber}</Text>
                      <Text>Accounts: {rpcStatus.accountCount}</Text>
                    </VStack>
                  ) : (
                    <Code>{rpcStatus.error}</Code>
                  )}
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>

        <Divider />

        {/* Contract Status */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="semibold">Contract Connection</Text>
            <Button size="sm" onClick={testContract} isLoading={loading}>
              Test Contract
            </Button>
          </HStack>
          
          {contractStatus && (
            <Alert status={contractStatus.success ? 'success' : 'error'}>
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {contractStatus.success ? 'Contract Found!' : 'Contract Error'}
                </AlertTitle>
                <AlertDescription>
                  {contractStatus.success ? (
                    <Text>Address: {contractStatus.contractAddress}</Text>
                  ) : (
                    <Code>{contractStatus.error}</Code>
                  )}
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>

        <Divider />

        {/* Current State */}
        <Box>
          <Text fontWeight="semibold" mb={2}>Current State</Text>
          <VStack align="start" spacing={2}>
            <HStack>
              <Text>Wallet:</Text>
              <Badge colorScheme={account ? 'green' : 'red'}>
                {account ? 'Connected' : 'Disconnected'}
              </Badge>
            </HStack>
            
            <HStack>
              <Text>Contracts:</Text>
              <Badge colorScheme={state.contracts.nftMarketplace ? 'green' : 'red'}>
                {state.contracts.nftMarketplace ? 'Loaded' : 'Not Loaded'}
              </Badge>
            </HStack>
            
            {account && (
              <Text fontSize="sm">
                Account: <Code>{account}</Code>
              </Text>
            )}
            
            {CONTRACT_ADDRESSES?.NFTMarketplace && (
              <Text fontSize="sm">
                Marketplace: <Code>{CONTRACT_ADDRESSES.NFTMarketplace}</Code>
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default RPCDebug;