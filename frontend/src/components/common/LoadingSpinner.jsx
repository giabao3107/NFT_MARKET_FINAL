import React from 'react';
import {
  Box,
  Spinner,
  VStack,
  Text,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

// Custom loading animation
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -30px, 0); }
  70% { transform: translate3d(0, -15px, 0); }
  90% { transform: translate3d(0, -4px, 0); }
`;

/**
 * Loading Spinner Component
 * Displays various loading states with customizable appearance
 */
const LoadingSpinner = ({
  size = 'md',
  variant = 'spinner',
  message = 'Loading...',
  showMessage = true,
  color,
  thickness = '4px',
  speed = '0.65s',
  fullScreen = false,
  overlay = false,
  ...props
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const defaultSpinnerColor = useColorModeValue('blue.500', 'blue.300');
  const spinnerColor = color || defaultSpinnerColor;

  const sizeMap = {
    xs: '16px',
    sm: '24px',
    md: '32px',
    lg: '48px',
    xl: '64px'
  };

  const containerProps = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 3,
    ...props
  };

  if (fullScreen) {
    containerProps.position = 'fixed';
    containerProps.top = 0;
    containerProps.left = 0;
    containerProps.right = 0;
    containerProps.bottom = 0;
    containerProps.zIndex = 9999;
    containerProps.bg = overlay ? 'blackAlpha.600' : bgColor;
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <Flex gap={1} alignItems="center">
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                w={sizeMap[size] || '8px'}
                h={sizeMap[size] || '8px'}
                bg={spinnerColor}
                borderRadius="full"
                animation={`${bounce} 1.4s ease-in-out ${i * 0.16}s infinite both`}
              />
            ))}
          </Flex>
        );

      case 'pulse':
        return (
          <Box
            w={sizeMap[size] || '32px'}
            h={sizeMap[size] || '32px'}
            bg={spinnerColor}
            borderRadius="full"
            animation={`${pulse} 2s ease-in-out infinite`}
          />
        );

      case 'bars':
        return (
          <Flex gap={1} alignItems="end" h={sizeMap[size] || '32px'}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                w="4px"
                bg={spinnerColor}
                borderRadius="2px"
                animation={`${pulse} 1.2s ease-in-out ${i * 0.1}s infinite`}
                h={`${20 + (i % 3) * 10}%`}
              />
            ))}
          </Flex>
        );

      case 'ring':
        return (
          <Box
            w={sizeMap[size] || '32px'}
            h={sizeMap[size] || '32px'}
            border={thickness}
            borderColor={`${spinnerColor} transparent ${spinnerColor} transparent`}
            borderRadius="full"
            animation={`${rotate} ${speed} linear infinite`}
          />
        );

      case 'grid':
        return (
          <Box
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            gap={1}
            w={sizeMap[size] || '32px'}
            h={sizeMap[size] || '32px'}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <Box
                key={i}
                bg={spinnerColor}
                borderRadius="2px"
                animation={`${pulse} 1.5s ease-in-out ${(i % 3) * 0.1}s infinite`}
              />
            ))}
          </Box>
        );

      default:
        return (
          <Spinner
            size={size}
            color={spinnerColor}
            thickness={thickness}
            speed={speed}
          />
        );
    }
  };

  return (
    <VStack {...containerProps}>
      {renderSpinner()}
      {showMessage && (
        <Text
          fontSize={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'}
          color={textColor}
          textAlign="center"
          fontWeight="medium"
        >
          {message}
        </Text>
      )}
    </VStack>
  );
};

/**
 * Page Loading Component
 * Full-screen loading overlay for page transitions
 */
export const PageLoading = ({ message = 'Loading page...', ...props }) => (
  <LoadingSpinner
    fullScreen
    overlay
    size="lg"
    variant="ring"
    message={message}
    {...props}
  />
);

/**
 * Inline Loading Component
 * Small loading indicator for inline use
 */
export const InlineLoading = ({ message = 'Loading...', ...props }) => (
  <LoadingSpinner
    size="sm"
    variant="dots"
    message={message}
    showMessage={false}
    {...props}
  />
);

/**
 * Button Loading Component
 * Loading state for buttons
 */
export const ButtonLoading = ({ size = 'sm', ...props }) => (
  <LoadingSpinner
    size={size}
    variant="spinner"
    showMessage={false}
    {...props}
  />
);

/**
 * Card Loading Component
 * Loading state for cards and containers
 */
export const CardLoading = ({ message = 'Loading content...', ...props }) => (
  <LoadingSpinner
    size="md"
    variant="pulse"
    message={message}
    p={8}
    {...props}
  />
);

/**
 * NFT Loading Component
 * Specialized loading for NFT operations
 */
export const NFTLoading = ({ 
  operation = 'Loading NFT...', 
  progress = null,
  ...props 
}) => {
  const progressMessage = progress !== null 
    ? `${operation} (${Math.round(progress)}%)`
    : operation;

  return (
    <VStack spacing={4} {...props}>
      <LoadingSpinner
        size="lg"
        variant="ring"
        showMessage={false}
        color="blue.500"
      />
      <VStack spacing={2}>
        <Text fontSize="md" fontWeight="medium" textAlign="center">
          {progressMessage}
        </Text>
        {progress !== null && (
          <Box w="200px" bg="gray.200" borderRadius="full" h="4px">
            <Box
              bg="blue.500"
              h="100%"
              borderRadius="full"
              transition="width 0.3s ease"
              w={`${progress}%`}
            />
          </Box>
        )}
      </VStack>
    </VStack>
  );
};

export default LoadingSpinner;