import React from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Box
} from '@chakra-ui/react';
import { RoyaltyDashboard } from '../components/creator';

const Creator = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* Page Header */}
          <Box textAlign="center">
            <Heading size="xl" mb={4} color="purple.500">
              Creator Dashboard
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="2xl" mx="auto">
              Manage your NFT creations and track your royalty earnings from secondary sales
            </Text>
          </Box>

          {/* Royalty Dashboard */}
          <RoyaltyDashboard />
        </VStack>
      </Container>
    </Box>
  );
};

export default Creator;