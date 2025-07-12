import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Link,
  IconButton,
  Tooltip,
  useColorModeValue,
  useBreakpointValue,
  Flex,
  Spacer,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Alert,
  AlertIcon,
  AlertDescription,
  Card,
  CardBody,
  Divider,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import {
  FiExternalLink,
  FiCopy,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiRepeat,
  FiShoppingCart,
  FiTag,
  FiGift
} from 'react-icons/fi';
import { useWeb3 } from '../../contexts/Web3Context';
import { useCustomToast } from '../common/Toast';
import { LoadingSpinner, Pagination } from '../common';
import { formatAddress, getBlockExplorerUrl } from '../../utils/web3';
import { ethers } from 'ethers';
import { formatDateTime, copyToClipboard } from '../../utils/helpers';
import { useAsync, useDebounce } from '../../hooks';

/**
 * Transaction History Component
 * Displays user's transaction history with filtering and pagination
 */
const TransactionHistory = ({
  showFilters = true,
  showPagination = true,
  itemsPerPage = 10,
  maxHeight = '600px',
  ...props
}) => {
  const { account, chainId } = useWeb3();
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const debouncedSearch = useDebounce(filters.search, 500);
  const toast = useCustomToast();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Fetch transactions
  const {
    data: transactions,
    loading,
    error,
    execute: fetchTransactions
  } = useAsync(async () => {
    if (!account) return { transactions: [], total: 0 };
    
    // This would typically call your API or blockchain service
    // Fetch real transaction data from blockchain
    return fetchUserTransactions(account, {
      ...filters,
      search: debouncedSearch,
      page: currentPage,
      limit: itemsPerPage,
      sortBy,
      sortOrder
    });
  });

  useEffect(() => {
    fetchTransactions();
  }, [account, debouncedSearch, currentPage, sortBy, sortOrder, filters.type, filters.status]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchTransactions();
    toast.info('Refreshed', 'Transaction history updated');
  };

  const handleExport = () => {
    // Export functionality
    toast.info('Export', 'Exporting transaction history...');
  };

  if (!account) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertDescription>
          Please connect your wallet to view transaction history
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertDescription>
          Failed to load transaction history: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box {...props}>
      {/* Header */}
      <Flex mb={6} align="center">
        <VStack align="start" spacing={1}>
          <Text fontSize="xl" fontWeight="bold">
            Transaction History
          </Text>
          <Text fontSize="sm" color="gray.500">
            {transactions?.total || 0} transactions found
          </Text>
        </VStack>
        
        <Spacer />
        
        <HStack spacing={2}>
          <Tooltip label="Refresh">
            <IconButton
              icon={<FiRefreshCw />}
              onClick={handleRefresh}
              isLoading={loading}
              variant="outline"
              size="sm"
            />
          </Tooltip>
          
          <Tooltip label="Export">
            <IconButton
              icon={<FiDownload />}
              onClick={handleExport}
              variant="outline"
              size="sm"
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* Filters */}
      {showFilters && (
        <TransactionFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={setSortBy}
          onSortOrderChange={setSortOrder}
        />
      )}

      {/* Transaction List */}
      <Box maxH={maxHeight} overflowY="auto">
        {loading ? (
          <LoadingSpinner />
        ) : isMobile ? (
          <MobileTransactionList transactions={transactions?.transactions || []} />
        ) : (
          <DesktopTransactionTable transactions={transactions?.transactions || []} />
        )}
      </Box>

      {/* Pagination */}
      {showPagination && transactions?.total > itemsPerPage && (
        <Box mt={6}>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(transactions.total / itemsPerPage)}
            totalItems={transactions.total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </Box>
      )}
    </Box>
  );
};

/**
 * Transaction Filters Component
 */
const TransactionFilters = ({
  filters,
  onFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  onSortOrderChange
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');

  const transactionTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'mint', label: 'Mint' },
    { value: 'buy', label: 'Buy' },
    { value: 'sell', label: 'Sell' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'list', label: 'List' },
    { value: 'delist', label: 'Delist' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  const sortOptions = [
    { value: 'timestamp', label: 'Date' },
    { value: 'value', label: 'Value' },
    { value: 'gas', label: 'Gas Used' }
  ];

  return (
    <Box bg={bgColor} p={4} borderRadius="lg" mb={6}>
      <VStack spacing={4}>
        <Flex w="full" gap={4} wrap="wrap">
          {/* Search */}
          <InputGroup maxW="300px">
            <InputLeftElement>
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </InputGroup>

          {/* Type Filter */}
          <Select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            maxW="150px"
          >
            {transactionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            maxW="150px"
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>

          {/* Sort */}
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            maxW="120px"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </Flex>

        {/* Date Range */}
        <HStack spacing={4} w="full">
          <Text fontSize="sm" color="gray.500" minW="60px">
            Date Range:
          </Text>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            maxW="150px"
            size="sm"
          />
          <Text fontSize="sm" color="gray.500">
            to
          </Text>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            maxW="150px"
            size="sm"
          />
        </HStack>
      </VStack>
    </Box>
  );
};

/**
 * Desktop Transaction Table Component
 */
const DesktopTransactionTable = ({ transactions }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTx, setSelectedTx] = useState(null);
  const toast = useCustomToast();

  const handleViewDetails = (tx) => {
    setSelectedTx(tx);
    onOpen();
  };

  const handleCopyHash = (hash) => {
    copyToClipboard(hash);
    toast.success('Copied', 'Transaction hash copied to clipboard');
  };

  if (transactions.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <AlertDescription>
          No transactions found
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>NFT</Th>
              <Th>Value</Th>
              <Th>From/To</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.hash}
                transaction={tx}
                onViewDetails={handleViewDetails}
                onCopyHash={handleCopyHash}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <TransactionDetailsModal
          transaction={selectedTx}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </>
  );
};

/**
 * Transaction Row Component
 */
const TransactionRow = ({ transaction, onViewDetails, onCopyHash }) => {
  const { chainId } = useWeb3();
  const getTypeIcon = (type) => {
    const icons = {
      mint: <FiGift />,
      buy: <FiShoppingCart />,
      sell: <FiTag />,
      transfer: <FiRepeat />,
      list: <FiArrowUpRight />,
      delist: <FiArrowDownLeft />
    };
    return icons[type] || <FiRepeat />;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'green',
      pending: 'yellow',
      failed: 'red'
    };
    return colors[status] || 'gray';
  };

  return (
    <Tr>
      <Td>
        <HStack>
          {getTypeIcon(transaction.type)}
          <Text fontSize="sm" textTransform="capitalize">
            {transaction.type}
          </Text>
        </HStack>
      </Td>
      
      <Td>
        <HStack>
          {transaction.nft?.image && (
            <Image
              src={transaction.nft.image}
              alt={transaction.nft.name}
              boxSize="32px"
              borderRadius="md"
              objectFit="cover"
            />
          )}
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
              {transaction.nft?.name || 'Unknown NFT'}
            </Text>
            <Text fontSize="xs" color="gray.500">
              #{transaction.nft?.tokenId}
            </Text>
          </VStack>
        </HStack>
      </Td>
      
      <Td>
        <Text fontSize="sm" fontWeight="medium">
          {transaction.value ? `${ethers.formatEther(transaction.value)} ETH` : '-'}
        </Text>
      </Td>
      
      <Td>
        <VStack align="start" spacing={0}>
          <Text fontSize="xs" color="gray.500">
            {transaction.type === 'buy' || transaction.type === 'transfer' ? 'From:' : 'To:'}
          </Text>
          <Text fontSize="sm">
            {formatAddress(transaction.from || transaction.to)}
          </Text>
        </VStack>
      </Td>
      
      <Td>
        <Text fontSize="sm">
          {formatDateTime(transaction.timestamp)}
        </Text>
      </Td>
      
      <Td>
        <Badge colorScheme={getStatusColor(transaction.status)}>
          {transaction.status}
        </Badge>
      </Td>
      
      <Td>
        <HStack spacing={1}>
          <Tooltip label="View Details">
            <IconButton
              size="sm"
              variant="ghost"
              icon={<FiEye />}
              onClick={() => onViewDetails(transaction)}
            />
          </Tooltip>
          
          <Tooltip label="Copy Hash">
            <IconButton
              size="sm"
              variant="ghost"
              icon={<FiCopy />}
              onClick={() => onCopyHash(transaction.hash)}
            />
          </Tooltip>
          
          <Tooltip label="View on Etherscan">
            <IconButton
              size="sm"
              variant="ghost"
              icon={<FiExternalLink />}
              as={Link}
              href={getBlockExplorerUrl(chainId, transaction.hash, 'tx')}
              isExternal
            />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
};

/**
 * Mobile Transaction List Component
 */
const MobileTransactionList = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <AlertDescription>
          No transactions found
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <VStack spacing={4}>
      {transactions.map((tx) => (
        <MobileTransactionCard key={tx.hash} transaction={tx} />
      ))}
    </VStack>
  );
};

/**
 * Mobile Transaction Card Component
 */
const MobileTransactionCard = ({ transaction }) => {
  const { chainId } = useWeb3();
  const toast = useCustomToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleCopyHash = () => {
    copyToClipboard(transaction.hash);
    toast.success('Copied', 'Transaction hash copied to clipboard');
  };

  const getTypeIcon = (type) => {
    const icons = {
      mint: <FiGift />,
      buy: <FiShoppingCart />,
      sell: <FiTag />,
      transfer: <FiRepeat />,
      list: <FiArrowUpRight />,
      delist: <FiArrowDownLeft />
    };
    return icons[type] || <FiRepeat />;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'green',
      pending: 'yellow',
      failed: 'red'
    };
    return colors[status] || 'gray';
  };

  return (
    <Card w="full" bg={bgColor} border="1px" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={3} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <HStack>
              {getTypeIcon(transaction.type)}
              <Text fontSize="sm" fontWeight="medium" textTransform="capitalize">
                {transaction.type}
              </Text>
            </HStack>
            <Badge colorScheme={getStatusColor(transaction.status)}>
              {transaction.status}
            </Badge>
          </Flex>

          {/* NFT Info */}
          {transaction.nft && (
            <HStack>
              {transaction.nft.image && (
                <Image
                  src={transaction.nft.image}
                  alt={transaction.nft.name}
                  boxSize="40px"
                  borderRadius="md"
                  objectFit="cover"
                />
              )}
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium">
                  {transaction.nft.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  #{transaction.nft.tokenId}
                </Text>
              </VStack>
            </HStack>
          )}

          {/* Details */}
          <VStack spacing={2} align="stretch">
            {transaction.value && (
              <Flex justify="space-between">
                <Text fontSize="sm" color="gray.500">Value:</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {ethers.formatEther(transaction.value)} ETH
                </Text>
              </Flex>
            )}
            
            <Flex justify="space-between">
              <Text fontSize="sm" color="gray.500">Date:</Text>
              <Text fontSize="sm">
                {formatDateTime(transaction.timestamp)}
              </Text>
            </Flex>
            
            <Flex justify="space-between">
              <Text fontSize="sm" color="gray.500">Hash:</Text>
              <HStack>
                <Text fontSize="sm">
                  {formatAddress(transaction.hash)}
                </Text>
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={<FiCopy />}
                  onClick={handleCopyHash}
                />
              </HStack>
            </Flex>
          </VStack>

          <Divider />

          {/* Actions */}
          <HStack justify="center" spacing={4}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiExternalLink />}
              as={Link}
              href={getBlockExplorerUrl(chainId, transaction.hash, 'tx')}
              isExternal
            >
              View on Etherscan
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Transaction Details Modal Component
 */
const TransactionDetailsModal = ({ transaction, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transaction Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Transaction info would go here */}
            <Text>Transaction details for {transaction.hash}</Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Function to fetch real user transactions from blockchain
const fetchUserTransactions = async (account, filters, contracts) => {
  try {
    if (!contracts.nftCollection || !contracts.nftMarketplace) {
      return { transactions: [], total: 0 };
    }

    const transactions = [];
    
    // Get Transfer events for NFTs owned by the user
    const transferFilter = contracts.nftCollection.filters.Transfer(null, account);
    const receivedEvents = await contracts.nftCollection.queryFilter(transferFilter);
    
    // Get Transfer events for NFTs sent by the user
    const sentFilter = contracts.nftCollection.filters.Transfer(account, null);
    const sentEvents = await contracts.nftCollection.queryFilter(sentFilter);
    
    // Process received NFTs
    for (const event of receivedEvents) {
      const block = await event.getBlock();
      const isMint = event.args[0] === ethers.ZeroAddress;
      
      transactions.push({
        hash: event.transactionHash,
        type: isMint ? 'mint' : 'buy',
        status: 'completed',
        timestamp: new Date(block.timestamp * 1000),
        blockNumber: event.blockNumber,
        from: event.args[0],
        to: event.args[1],
        tokenId: Number(event.args[2]),
        nft: {
          tokenId: Number(event.args[2]),
          name: `NFT #${event.args[2]}`,
          image: '/placeholder-nft.svg'
        }
      });
    }
    
    // Process sent NFTs
    for (const event of sentEvents) {
      const block = await event.getBlock();
      
      transactions.push({
        hash: event.transactionHash,
        type: 'sell',
        status: 'completed',
        timestamp: new Date(block.timestamp * 1000),
        blockNumber: event.blockNumber,
        from: event.args[0],
        to: event.args[1],
        tokenId: Number(event.args[2]),
        nft: {
          tokenId: Number(event.args[2]),
          name: `NFT #${event.args[2]}`,
          image: '/placeholder-nft.svg'
        }
      });
    }
    
    // Sort by timestamp (most recent first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply filters
    let filteredTransactions = transactions;
    if (filters.type && filters.type !== 'all') {
      filteredTransactions = transactions.filter(tx => tx.type === filters.type);
    }
    
    return {
      transactions: filteredTransactions,
      total: filteredTransactions.length
    };
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return { transactions: [], total: 0 };
  }
};

export default TransactionHistory;