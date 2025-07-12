import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Collapse,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReset }) => {
  const { isOpen, onToggle } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const reloadPage = () => {
    window.location.reload();
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <Box
        maxW="2xl"
        w="full"
        bg={bg}
        border="1px"
        borderColor={borderColor}
        borderRadius="xl"
        p={8}
        boxShadow="lg"
      >
        <VStack spacing={6} align="stretch">
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Something went wrong!</AlertTitle>
              <AlertDescription>
                An unexpected error occurred while rendering this page.
              </AlertDescription>
            </Box>
          </Alert>

          <VStack spacing={4} align="center">
            <Heading size="lg" textAlign="center">
              Oops! We encountered an error
            </Heading>
            <Text textAlign="center" color="gray.600">
              We're sorry for the inconvenience. This error has been logged and we'll
              look into it. In the meantime, you can try the following:
            </Text>
          </VStack>

          <VStack spacing={3} align="stretch">
            <Button onClick={onReset} colorScheme="brand" size="lg">
              Try Again
            </Button>
            <Button onClick={reloadPage} variant="outline" size="lg">
              Reload Page
            </Button>
            <Button onClick={goHome} variant="ghost" size="lg">
              Go to Homepage
            </Button>
          </VStack>

          {/* Error Details (for development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <Box>
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              >
                {isOpen ? 'Hide' : 'Show'} Error Details
              </Button>
              
              <Collapse in={isOpen} animateOpacity>
                <Box mt={4} p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="bold" color="red.700" mb={2}>
                        Error Message:
                      </Text>
                      <Code p={2} bg="red.100" color="red.800" borderRadius="md" display="block">
                        {error.toString()}
                      </Code>
                    </Box>
                    
                    {errorInfo && errorInfo.componentStack && (
                      <Box>
                        <Text fontWeight="bold" color="red.700" mb={2}>
                          Component Stack:
                        </Text>
                        <Code
                          p={2}
                          bg="red.100"
                          color="red.800"
                          borderRadius="md"
                          display="block"
                          whiteSpace="pre-wrap"
                          fontSize="xs"
                          maxH="200px"
                          overflowY="auto"
                        >
                          {errorInfo.componentStack}
                        </Code>
                      </Box>
                    )}
                    
                    {error.stack && (
                      <Box>
                        <Text fontWeight="bold" color="red.700" mb={2}>
                          Stack Trace:
                        </Text>
                        <Code
                          p={2}
                          bg="red.100"
                          color="red.800"
                          borderRadius="md"
                          display="block"
                          whiteSpace="pre-wrap"
                          fontSize="xs"
                          maxH="200px"
                          overflowY="auto"
                        >
                          {error.stack}
                        </Code>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </Collapse>
            </Box>
          )}

          <Box textAlign="center">
            <Text fontSize="sm" color="gray.500">
              If this problem persists, please contact our support team.
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default ErrorBoundary;