import React from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  Select,
  IconButton,
  useColorModeValue,
  useBreakpointValue,
  Flex,
  Spacer
} from '@chakra-ui/react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';

/**
 * Pagination Component
 * Comprehensive pagination with various display options
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showPageInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  size = 'md',
  variant = 'outline',
  colorScheme = 'blue',
  isDisabled = false,
  ...props
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !isDisabled) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(parseInt(newItemsPerPage));
    }
  };

  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      {...props}
    >
      <Flex
        direction={isMobile ? 'column' : 'row'}
        align="center"
        spacing={4}
        gap={4}
      >
        {/* Page Info */}
        {showPageInfo && totalItems > 0 && (
          <Text fontSize="sm" color="gray.600">
            Showing {startItem}-{endItem} of {totalItems} items
          </Text>
        )}

        <Spacer />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <HStack spacing={1}>
            {/* First Page */}
            {showFirstLast && currentPage > 1 && (
              <IconButton
                size={size}
                variant={variant}
                icon={<FiChevronsLeft />}
                onClick={() => handlePageChange(1)}
                isDisabled={isDisabled}
                aria-label="First page"
              />
            )}

            {/* Previous Page */}
            <IconButton
              size={size}
              variant={variant}
              icon={<FiChevronLeft />}
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1 || isDisabled}
              aria-label="Previous page"
            />

            {/* Page Numbers */}
            {!isMobile && visiblePages.map((page) => (
              <Button
                key={page}
                size={size}
                variant={page === currentPage ? 'solid' : variant}
                colorScheme={page === currentPage ? colorScheme : 'gray'}
                onClick={() => handlePageChange(page)}
                isDisabled={isDisabled}
                minW="40px"
              >
                {page}
              </Button>
            ))}

            {/* Mobile Page Indicator */}
            {isMobile && (
              <Text fontSize="sm" px={2}>
                {currentPage} / {totalPages}
              </Text>
            )}

            {/* Next Page */}
            <IconButton
              size={size}
              variant={variant}
              icon={<FiChevronRight />}
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages || isDisabled}
              aria-label="Next page"
            />

            {/* Last Page */}
            {showFirstLast && currentPage < totalPages && (
              <IconButton
                size={size}
                variant={variant}
                icon={<FiChevronsRight />}
                onClick={() => handlePageChange(totalPages)}
                isDisabled={isDisabled}
                aria-label="Last page"
              />
            )}
          </HStack>
        )}

        {/* Items Per Page */}
        {showItemsPerPage && (
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
              Items per page:
            </Text>
            <Select
              size={size}
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              isDisabled={isDisabled}
              w="80px"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </HStack>
        )}
      </Flex>
    </Box>
  );
};

/**
 * Simple Pagination Component
 * Minimal pagination for basic use cases
 */
export const SimplePagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  size = 'md',
  ...props
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <HStack spacing={2} justify="center" {...props}>
      <IconButton
        size={size}
        variant="outline"
        icon={<FiChevronLeft />}
        onClick={() => handlePageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        aria-label="Previous page"
      />
      
      <Text fontSize="sm" px={4}>
        Page {currentPage} of {totalPages}
      </Text>
      
      <IconButton
        size={size}
        variant="outline"
        icon={<FiChevronRight />}
        onClick={() => handlePageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        aria-label="Next page"
      />
    </HStack>
  );
};

/**
 * Load More Pagination Component
 * Infinite scroll style pagination
 */
export const LoadMorePagination = ({
  hasMore = false,
  isLoading = false,
  onLoadMore,
  loadingText = 'Loading...',
  loadMoreText = 'Load More',
  noMoreText = 'No more items',
  ...props
}) => {
  return (
    <Flex justify="center" p={4} {...props}>
      {hasMore ? (
        <Button
          onClick={onLoadMore}
          isLoading={isLoading}
          loadingText={loadingText}
          variant="outline"
          size="lg"
        >
          {loadMoreText}
        </Button>
      ) : (
        <Text color="gray.500" fontSize="sm">
          {noMoreText}
        </Text>
      )}
    </Flex>
  );
};

/**
 * Compact Pagination Component
 * Space-efficient pagination for sidebars or small areas
 */
export const CompactPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  ...props
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <HStack spacing={1} {...props}>
      <IconButton
        size="sm"
        variant="ghost"
        icon={<FiChevronLeft />}
        onClick={() => handlePageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        aria-label="Previous"
      />
      
      <Text fontSize="xs" minW="60px" textAlign="center">
        {currentPage}/{totalPages}
      </Text>
      
      <IconButton
        size="sm"
        variant="ghost"
        icon={<FiChevronRight />}
        onClick={() => handlePageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        aria-label="Next"
      />
    </HStack>
  );
};

export default Pagination;