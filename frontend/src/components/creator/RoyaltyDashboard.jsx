import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Divider,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Link,
  Tooltip,
  Icon
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FaCrown, FaEthereum } from 'react-icons/fa';
import { useWeb3 } from '../../contexts/Web3Context';
import MetaMaskTransactionHelper from '../../utils/metaMaskTransactionHelper';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

const RoyaltyDashboard = () => {
  const { account, isConnected } = useWeb3();
  const [royaltyPayments, setRoyaltyPayments] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    if (isConnected && account) {
      loadRoyaltyData();
      
      // Listen for new royalty payments
      const handleRoyaltyPayment = (event) => {
        const { creator } = event.detail;
        if (creator.toLowerCase() === account.toLowerCase()) {
          loadRoyaltyData();
        }
      };
      
      window.addEventListener('royalty_payment_detected', handleRoyaltyPayment);
      
      return () => {
        window.removeEventListener('royalty_payment_detected', handleRoyaltyPayment);
      };
    }
  }, [account, isConnected]);

  const loadRoyaltyData = async () => {
    try {
      setLoading(true);
      
      // Get royalty payments for this creator
      const payments = MetaMaskTransactionHelper.getRoyaltyPayments(account);
      const total = MetaMaskTransactionHelper.getTotalRoyaltiesEarned(account);
      
      setRoyaltyPayments(payments);
      setTotalEarned(total);
    } catch (error) {
      console.error('Error loading royalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTokenId = (tokenId) => {
    return `#${tokenId}`;
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getBlockExplorerUrl = (txHash) => {
    return `https://etherscan.io/tx/${txHash}`;
  };

  if (!isConnected) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Please connect your wallet to view royalty dashboard
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="lg" color="purple.500" />
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <HStack spacing={3} mb={2}>
          <Icon as={FaCrown} color="yellow.500" boxSize={6} />
          <Heading size="lg" color="purple.500">
            Creator Royalty Dashboard
          </Heading>
        </HStack>
        <Text color={textColor}>
          Track your NFT royalty earnings from secondary sales
        </Text>
      </Box>

      {/* Stats Cards */}
      <HStack spacing={6} align="stretch">
        <Card flex={1} bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Total Royalties Earned</StatLabel>
              <StatNumber>
                <HStack>
                  <Icon as={FaEthereum} color="blue.500" />
                  <Text>{totalEarned.toFixed(4)} ETH</Text>
                </HStack>
              </StatNumber>
              <StatHelpText>From {royaltyPayments.length} transactions</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card flex={1} bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Average Royalty</StatLabel>
              <StatNumber>
                <HStack>
                  <Icon as={FaEthereum} color="blue.500" />
                  <Text>
                    {royaltyPayments.length > 0 
                      ? (totalEarned / royaltyPayments.length).toFixed(4)
                      : '0.0000'
                    } ETH
                  </Text>
                </HStack>
              </StatNumber>
              <StatHelpText>Per transaction</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card flex={1} bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Recent Activity</StatLabel>
              <StatNumber>
                {royaltyPayments.filter(p => {
                  const paymentDate = new Date(p.blockNumber * 1000); // Approximate
                  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                  return paymentDate > dayAgo;
                }).length}
              </StatNumber>
              <StatHelpText>Payments in last 24h</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </HStack>

      {/* Royalty Payments Table */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Recent Royalty Payments</Heading>
        </CardHeader>
        <CardBody>
          {royaltyPayments.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              No royalty payments received yet. Royalties are earned when your NFTs are resold.
            </Alert>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>NFT</Th>
                  <Th>Amount</Th>
                  <Th>Transaction</Th>
                  <Th>Block</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {royaltyPayments.slice(0, 10).map((payment, index) => (
                  <Tr key={index}>
                    <Td>
                      <Badge colorScheme="purple" variant="subtle">
                        {formatTokenId(payment.tokenId)}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <Icon as={FaEthereum} color="blue.500" boxSize={4} />
                        <Text fontWeight="semibold">
                          {parseFloat(payment.amountInEth).toFixed(4)} ETH
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Tooltip label="View on Etherscan">
                        <Link
                          href={getBlockExplorerUrl(payment.transactionHash)}
                          isExternal
                          color="blue.500"
                          _hover={{ textDecoration: 'underline' }}
                        >
                          <HStack spacing={1}>
                            <Text>{formatAddress(payment.transactionHash)}</Text>
                            <ExternalLinkIcon boxSize={3} />
                          </HStack>
                        </Link>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Text color={textColor} fontSize="sm">
                        #{payment.blockNumber}
                      </Text>
                    </Td>
                    <Td>
                      <Text color={textColor} fontSize="sm">
                        {formatDistanceToNow(new Date(payment.blockNumber * 1000), { addSuffix: true })}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Info Box */}
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="semibold">How Royalties Work</Text>
          <Text fontSize="sm" mt={1}>
            You earn royalties automatically when your NFTs are resold on the marketplace. 
            The royalty percentage is set when you mint the NFT and cannot be changed later.
          </Text>
        </Box>
      </Alert>
    </VStack>
  );
};

export default RoyaltyDashboard;