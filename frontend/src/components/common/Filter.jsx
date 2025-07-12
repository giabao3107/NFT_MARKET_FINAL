import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Input,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  IconButton,
  Divider,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue
} from '@chakra-ui/react';
import { FiFilter, FiX, FiRefreshCw } from 'react-icons/fi';
import { NFT_CATEGORIES, SORT_OPTIONS } from '../../utils/constants';
import { formatEther } from '../../utils/web3';

/**
 * Filter Component
 * Comprehensive filtering system for NFT marketplace
 */
const Filter = ({
  filters = {},
  onFiltersChange,
  onReset,
  showPriceRange = true,
  showCategories = true,
  showStatus = true,
  showSortBy = true,
  showCollections = true,
  showProperties = true,
  collections = [],
  properties = [],
  priceRange = { min: 0, max: 100 },
  ...props
}) => {
  const [localFilters, setLocalFilters] = useState({
    categories: [],
    status: 'all',
    priceMin: priceRange.min,
    priceMax: priceRange.max,
    sortBy: 'newest',
    collections: [],
    properties: {},
    search: '',
    ...filters
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'buy_now', label: 'Buy Now' },
    { value: 'on_auction', label: 'On Auction' },
    { value: 'new', label: 'New' },
    { value: 'has_offers', label: 'Has Offers' }
  ];

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(localFilters);
    }
  }, [localFilters, onFiltersChange]);

  const updateFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    const resetFilters = {
      categories: [],
      status: 'all',
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      sortBy: 'newest',
      collections: [],
      properties: {},
      search: ''
    };
    setLocalFilters(resetFilters);
    if (onReset) {
      onReset();
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.categories.length > 0) count++;
    if (localFilters.status !== 'all') count++;
    if (localFilters.priceMin > priceRange.min || localFilters.priceMax < priceRange.max) count++;
    if (localFilters.collections.length > 0) count++;
    if (Object.keys(localFilters.properties).length > 0) count++;
    if (localFilters.search) count++;
    return count;
  };

  const FilterContent = () => (
    <VStack spacing={6} align="stretch">
      {/* Search */}
      <Box>
        <Text fontWeight="semibold" mb={3}>Search</Text>
        <Input
          placeholder="Search by name or description..."
          value={localFilters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          size="sm"
        />
      </Box>

      <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
        {/* Categories */}
        {showCategories && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold">Categories</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <CheckboxGroup
                value={localFilters.categories}
                onChange={(value) => updateFilter('categories', value)}
              >
                <VStack align="start" spacing={2}>
                  {NFT_CATEGORIES.map((category) => (
                    <Checkbox key={category.value} value={category.value}>
                      <HStack>
                        {category.icon && <span>{category.icon}</span>}
                        <Text fontSize="sm">{category.label}</Text>
                      </HStack>
                    </Checkbox>
                  ))}
                </VStack>
              </CheckboxGroup>
            </AccordionPanel>
          </AccordionItem>
        )}

        {/* Status */}
        {showStatus && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold">Status</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <RadioGroup
                value={localFilters.status}
                onChange={(value) => updateFilter('status', value)}
              >
                <VStack align="start" spacing={2}>
                  {statusOptions.map((option) => (
                    <Radio key={option.value} value={option.value}>
                      <Text fontSize="sm">{option.label}</Text>
                    </Radio>
                  ))}
                </VStack>
              </RadioGroup>
            </AccordionPanel>
          </AccordionItem>
        )}

        {/* Price Range */}
        {showPriceRange && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold">Price Range (ETH)</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4}>
                <RangeSlider
                  min={priceRange.min}
                  max={priceRange.max}
                  step={0.01}
                  value={[localFilters.priceMin, localFilters.priceMax]}
                  onChange={([min, max]) => {
                    updateFilter('priceMin', min);
                    updateFilter('priceMax', max);
                  }}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
                
                <HStack spacing={2} w="full">
                  <NumberInput
                    size="sm"
                    min={priceRange.min}
                    max={localFilters.priceMax}
                    value={localFilters.priceMin}
                    onChange={(value) => updateFilter('priceMin', parseFloat(value) || 0)}
                    precision={2}
                  >
                    <NumberInputField placeholder="Min" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  
                  <Text>to</Text>
                  
                  <NumberInput
                    size="sm"
                    min={localFilters.priceMin}
                    max={priceRange.max}
                    value={localFilters.priceMax}
                    onChange={(value) => updateFilter('priceMax', parseFloat(value) || priceRange.max)}
                    precision={2}
                  >
                    <NumberInputField placeholder="Max" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        )}

        {/* Collections */}
        {showCollections && collections.length > 0 && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold">Collections</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <CheckboxGroup
                value={localFilters.collections}
                onChange={(value) => updateFilter('collections', value)}
              >
                <VStack align="start" spacing={2} maxH="200px" overflowY="auto">
                  {collections.map((collection) => (
                    <Checkbox key={collection.address} value={collection.address}>
                      <HStack>
                        {collection.image && (
                          <Box
                            w="20px"
                            h="20px"
                            borderRadius="sm"
                            bgImage={`url(${collection.image})`}
                            bgSize="cover"
                            bgPosition="center"
                          />
                        )}
                        <Text fontSize="sm">{collection.name}</Text>
                        <Badge size="sm">{collection.itemCount}</Badge>
                      </HStack>
                    </Checkbox>
                  ))}
                </VStack>
              </CheckboxGroup>
            </AccordionPanel>
          </AccordionItem>
        )}

        {/* Properties */}
        {showProperties && properties.length > 0 && (
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold">Properties</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                {properties.map((property) => (
                  <Box key={property.trait_type}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      {property.trait_type}
                    </Text>
                    <CheckboxGroup
                      value={localFilters.properties[property.trait_type] || []}
                      onChange={(value) => {
                        updateFilter('properties', {
                          ...localFilters.properties,
                          [property.trait_type]: value
                        });
                      }}
                    >
                      <VStack align="start" spacing={1} maxH="150px" overflowY="auto">
                        {property.values.map((value) => (
                          <Checkbox key={value.value} value={value.value}>
                            <HStack>
                              <Text fontSize="xs">{value.value}</Text>
                              <Badge size="xs">{value.count}</Badge>
                            </HStack>
                          </Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </Box>
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>

      {/* Sort By */}
      {showSortBy && (
        <Box>
          <Text fontWeight="semibold" mb={3}>Sort By</Text>
          <Select
            value={localFilters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            size="sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Box>
      )}

      {/* Reset Button */}
      <Button
        leftIcon={<FiRefreshCw />}
        onClick={handleReset}
        variant="outline"
        size="sm"
        isDisabled={getActiveFiltersCount() === 0}
      >
        Reset Filters
      </Button>
    </VStack>
  );

  if (isMobile) {
    return <MobileFilter FilterContent={FilterContent} activeCount={getActiveFiltersCount()} />;
  }

  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      {...props}
    >
      <HStack justify="space-between" mb={4}>
        <HStack>
          <FiFilter />
          <Text fontWeight="bold">Filters</Text>
          {getActiveFiltersCount() > 0 && (
            <Badge colorScheme="blue">{getActiveFiltersCount()}</Badge>
          )}
        </HStack>
      </HStack>
      
      <FilterContent />
    </Box>
  );
};

/**
 * Mobile Filter Component
 * Drawer-based filter for mobile devices
 */
const MobileFilter = ({ FilterContent, activeCount }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        leftIcon={<FiFilter />}
        onClick={onOpen}
        variant="outline"
        size="sm"
        rightIcon={activeCount > 0 ? <Badge>{activeCount}</Badge> : null}
      >
        Filters
      </Button>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <HStack>
              <FiFilter />
              <Text>Filters</Text>
              {activeCount > 0 && (
                <Badge colorScheme="blue">{activeCount}</Badge>
              )}
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <FilterContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

/**
 * Quick Filter Component
 * Simplified filter bar for quick access
 */
export const QuickFilter = ({
  onCategoryChange,
  onStatusChange,
  onSortChange,
  selectedCategory = 'all',
  selectedStatus = 'all',
  selectedSort = 'newest'
}) => {
  return (
    <HStack spacing={4} wrap="wrap">
      <Select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        size="sm"
        w="150px"
      >
        <option value="all">All Categories</option>
        {NFT_CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </Select>

      <Select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        size="sm"
        w="120px"
      >
        <option value="all">All Status</option>
        <option value="buy_now">Buy Now</option>
        <option value="on_auction">On Auction</option>
      </Select>

      <Select
        value={selectedSort}
        onChange={(e) => onSortChange(e.target.value)}
        size="sm"
        w="120px"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </HStack>
  );
};

export default Filter;