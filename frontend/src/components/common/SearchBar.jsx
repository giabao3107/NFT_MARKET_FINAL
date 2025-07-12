import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
  useColorModeValue,
  useOutsideClick,
  Flex,
  Badge,
  Image,
  Spinner,
  useBreakpointValue
} from '@chakra-ui/react';
import { FiSearch, FiX, FiClock, FiTrendingUp } from 'react-icons/fi';
import { useSearchWithHistory, useDebounce } from '../../hooks';
import { formatAddress, formatEther } from '../../utils/web3';
import { NFT_CATEGORIES } from '../../utils/constants';

/**
 * Search Bar Component
 * Advanced search with history, suggestions, and real-time results
 */
const SearchBar = ({
  onSearch,
  onSelect,
  placeholder = 'Search NFTs, collections, or addresses...',
  size = 'md',
  variant = 'filled',
  showHistory = true,
  showSuggestions = true,
  showResults = true,
  maxResults = 10,
  searchCategories = ['nfts', 'collections', 'users'],
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef();
  const resultsRef = useRef();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Search functionality with history
  const {
    query,
    debouncedQuery,
    results,
    loading,
    error,
    searchHistory,
    searchWithHistory,
    clearSearch,
    removeFromSearchHistory,
    clearSearchHistory
  } = useSearchWithHistory(onSearch, {
    delay: 300,
    minLength: 2
  });

  // Close dropdown when clicking outside
  useOutsideClick({
    ref: searchRef,
    handler: () => {
      setIsFocused(false);
      setSelectedIndex(-1);
    }
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFocused) return;

      const totalItems = (
        (showHistory && !debouncedQuery ? searchHistory.length : 0) +
        (showResults && results.length > 0 ? results.length : 0)
      );

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < totalItems - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleItemSelect(selectedIndex);
          } else if (query.trim()) {
            handleSearch(query);
          }
          break;
        case 'Escape':
          setIsFocused(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, selectedIndex, searchHistory, results, query]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    searchWithHistory(value);
    setSelectedIndex(-1);
  };

  const handleSearch = (searchQuery) => {
    if (searchQuery.trim()) {
      searchWithHistory(searchQuery);
      if (onSelect) {
        onSelect({ type: 'search', query: searchQuery });
      }
      setIsFocused(false);
    }
  };

  const handleItemSelect = (index) => {
    let item;
    
    if (!debouncedQuery && showHistory) {
      // Selecting from history
      if (index < searchHistory.length) {
        item = { type: 'history', query: searchHistory[index] };
        searchWithHistory(searchHistory[index]);
      }
    } else if (showResults && results.length > 0) {
      // Selecting from results
      if (index < results.length) {
        item = { type: 'result', data: results[index] };
      }
    }

    if (item && onSelect) {
      onSelect(item);
    }
    
    setIsFocused(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    clearSearch();
    setSelectedIndex(-1);
  };

  const renderHistoryItem = (historyItem, index) => (
    <HStack
      key={`history-${index}`}
      p={3}
      cursor="pointer"
      bg={selectedIndex === index ? hoverBg : 'transparent'}
      _hover={{ bg: hoverBg }}
      onClick={() => handleItemSelect(index)}
      justify="space-between"
    >
      <HStack>
        <FiClock size={16} opacity={0.6} />
        <Text fontSize="sm">{historyItem}</Text>
      </HStack>
      <IconButton
        size="xs"
        variant="ghost"
        icon={<FiX />}
        onClick={(e) => {
          e.stopPropagation();
          removeFromSearchHistory(historyItem);
        }}
        aria-label="Remove from history"
      />
    </HStack>
  );

  const renderResultItem = (result, index) => {
    const adjustedIndex = !debouncedQuery && showHistory ? searchHistory.length + index : index;
    
    return (
      <HStack
        key={`result-${result.id || index}`}
        p={3}
        cursor="pointer"
        bg={selectedIndex === adjustedIndex ? hoverBg : 'transparent'}
        _hover={{ bg: hoverBg }}
        onClick={() => handleItemSelect(adjustedIndex)}
        spacing={3}
      >
        {result.image && (
          <Image
            src={result.image}
            alt={result.name}
            boxSize="40px"
            borderRadius="md"
            objectFit="cover"
          />
        )}
        <VStack align="start" spacing={1} flex={1}>
          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
            {result.name}
          </Text>
          <HStack spacing={2}>
            {result.type && (
              <Badge size="sm" colorScheme="blue">
                {result.type}
              </Badge>
            )}
            {result.price && (
              <Text fontSize="xs" color="gray.500">
                {formatEther(result.price)} ETH
              </Text>
            )}
            {result.address && (
              <Text fontSize="xs" color="gray.500">
                {formatAddress(result.address)}
              </Text>
            )}
          </HStack>
        </VStack>
        {result.trending && (
          <FiTrendingUp size={16} color="orange" />
        )}
      </HStack>
    );
  };

  const showDropdown = isFocused && (
    (showHistory && !debouncedQuery && searchHistory.length > 0) ||
    (showResults && results.length > 0) ||
    loading ||
    error
  );

  return (
    <Box ref={searchRef} position="relative" w="full" {...props}>
      <InputGroup size={size}>
        <InputLeftElement>
          <FiSearch color="gray.400" />
        </InputLeftElement>
        
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          variant={variant}
          pr={query ? '40px' : '16px'}
        />
        
        {query && (
          <InputRightElement>
            <IconButton
              size="sm"
              variant="ghost"
              icon={<FiX />}
              onClick={handleClear}
              aria-label="Clear search"
            />
          </InputRightElement>
        )}
      </InputGroup>

      {/* Search Dropdown */}
      {showDropdown && (
        <Box
          ref={resultsRef}
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="md"
          boxShadow="lg"
          zIndex={1000}
          maxH="400px"
          overflowY="auto"
        >
          {loading && (
            <Flex justify="center" p={4}>
              <Spinner size="sm" />
              <Text ml={2} fontSize="sm">Searching...</Text>
            </Flex>
          )}

          {error && (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color="red.500">
                Search failed. Please try again.
              </Text>
            </Box>
          )}

          {/* Search History */}
          {showHistory && !debouncedQuery && searchHistory.length > 0 && (
            <>
              <Box p={3} bg={sectionBg}>
                <HStack justify="space-between">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500">
                    RECENT SEARCHES
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={clearSearchHistory}
                  >
                    Clear All
                  </Button>
                </HStack>
              </Box>
              {searchHistory.slice(0, 5).map(renderHistoryItem)}
              {results.length > 0 && <Divider />}
            </>
          )}

          {/* Search Results */}
          {showResults && results.length > 0 && (
            <>
              {(!debouncedQuery || searchHistory.length === 0) && (
                <Box p={3} bg={sectionBg}>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500">
                    SEARCH RESULTS
                  </Text>
                </Box>
              )}
              {results.slice(0, maxResults).map(renderResultItem)}
              {results.length > maxResults && (
                <Box p={3} textAlign="center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSearch(debouncedQuery)}
                  >
                    View all {results.length} results
                  </Button>
                </Box>
              )}
            </>
          )}

          {/* No Results */}
          {!loading && !error && debouncedQuery && results.length === 0 && (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                No results found for "{debouncedQuery}"
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

/**
 * Quick Search Component
 * Simplified search bar for mobile or compact layouts
 */
export const QuickSearch = ({
  onSearch,
  placeholder = 'Search...',
  ...props
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery && onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <InputGroup size="sm" {...props}>
      <InputLeftElement>
        <FiSearch color="gray.400" size={14} />
      </InputLeftElement>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        variant="filled"
        borderRadius="full"
      />
    </InputGroup>
  );
};

/**
 * Category Search Component
 * Search with category filters
 */
export const CategorySearch = ({
  onSearch,
  onCategoryChange,
  selectedCategory = 'all',
  ...props
}) => {
  const categories = [{ value: 'all', label: 'All Categories' }, ...NFT_CATEGORIES];

  return (
    <VStack spacing={4} {...props}>
      <SearchBar onSearch={onSearch} />
      <HStack spacing={2} wrap="wrap">
        {categories.map((category) => (
          <Button
            key={category.value}
            size="sm"
            variant={selectedCategory === category.value ? 'solid' : 'outline'}
            onClick={() => onCategoryChange(category.value)}
          >
            {category.icon && <span style={{ marginRight: '4px' }}>{category.icon}</span>}
            {category.label}
          </Button>
        ))}
      </HStack>
    </VStack>
  );
};

export default SearchBar;