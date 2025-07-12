import React, { useState, useEffect } from 'react';
import { Image, Box, Text, Spinner, useColorModeValue } from '@chakra-ui/react';
import { getFallbackUrls } from '../utils/ipfs';

const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackText = 'Image not available',
  width = '100%',
  height = '400px',
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError,
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [fallbackUrls, setFallbackUrls] = useState([]);

  const fallbackBg = useColorModeValue('gray.100', 'gray.600');
  const fallbackBorderColor = useColorModeValue('gray.300', 'gray.500');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setFallbackUrls(getFallbackUrls(src));
      setIsLoading(true);
      setHasError(false);
      setFallbackIndex(0);
    }
  }, [src]);

  const handleImageLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', currentSrc);
    
    if (onError) onError(e);
    
    // Try next fallback URL
    if (fallbackIndex < fallbackUrls.length - 1) {
      const nextIndex = fallbackIndex + 1;
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbackUrls[nextIndex]);
      console.log(`Trying fallback URL ${nextIndex + 1}:`, fallbackUrls[nextIndex]);
    } else {
      // All fallbacks failed, show placeholder
      setIsLoading(false);
      setHasError(true);
      console.log('All image URLs failed, showing placeholder');
    }
  };

  const renderFallback = () => (
    <Box
      width={width}
      height={height}
      bg={fallbackBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      border="2px dashed"
      borderColor={fallbackBorderColor}
      borderRadius="md"
      {...props}
    >
      <Text fontSize="6xl" mb={4} opacity={0.5}>🖼️</Text>
      <Text color={mutedColor} fontSize="lg" fontWeight="medium" textAlign="center">
        {fallbackText}
      </Text>
      {alt && (
        <Text color={mutedColor} fontSize="sm" mt={2} textAlign="center">
          {alt}
        </Text>
      )}
    </Box>
  );

  const renderLoading = () => (
    <Box
      width={width}
      height={height}
      bg={fallbackBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="md"
      {...props}
    >
      <Spinner size="xl" color="purple.500" />
    </Box>
  );

  if (hasError) {
    return renderFallback();
  }

  return (
    <Box position="relative" width={width} height={height} {...props}>
      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={2}
        >
          {renderLoading()}
        </Box>
      )}
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        objectFit={objectFit}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        borderRadius="md"
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </Box>
  );
};

export default ImageWithFallback;