import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Badge,
  useColorModeValue,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Switch,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { FiUpload, FiImage, FiInfo } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNFT } from '../contexts/NFTContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useNavigate } from 'react-router-dom';

const Create = () => {
  const { mintNFT, loading } = useNFT();
  const { isConnected, account } = useWeb3();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef();
  
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const uploadBg = useColorModeValue('gray.50', 'gray.900');

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be less than 50 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters'),
    category: Yup.string().required('Category is required'),
    royalty: Yup.number()
      .min(0, 'Royalty cannot be negative')
      .max(10, 'Royalty cannot exceed 10%')
      .required('Royalty percentage is required'),
    image: Yup.mixed().required('Image is required'),
  });

  // Form handling
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      category: '',
      royalty: 2.5,
      image: null,
      attributes: [],
      unlockableContent: false,
      explicitContent: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!isConnected) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet to mint NFTs.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(25);

        // Simulate image upload to IPFS
        // In production, you would upload to a real IPFS service
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUploadProgress(50);

        const metadata = {
          name: values.name,
          description: values.description,
          image: '', // No placeholder - will be set when image is uploaded
          attributes: values.attributes,
          category: values.category,
        };

        setUploadProgress(75);

        // Convert royalty percentage to basis points (e.g., 2.5% = 250)
        const royaltyBasisPoints = Math.floor(values.royalty * 100);

        const nft = await mintNFT(metadata, royaltyBasisPoints);
        setUploadProgress(100);

        toast({
          title: 'NFT Minted Successfully!',
          description: `Your NFT "${values.name}" has been minted with Token ID ${nft.tokenId}.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Navigate to the NFT detail page
        navigate(`/nft/${nft.tokenId}`);
      } catch (error) {
        console.error('Error minting NFT:', error);
        toast({
          title: 'Minting Failed',
          description: error.message || 'Failed to mint NFT. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
  });

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP).',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload an image smaller than 10MB.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      formik.setFieldValue('image', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Categories
  const categories = [
    { value: 'art', label: 'Art' },
    { value: 'music', label: 'Music' },
    { value: 'photography', label: 'Photography' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'utility', label: 'Utility' },
    { value: 'other', label: 'Other' },
  ];

  if (!isConnected) {
    return (
      <Box minH="100vh" bg={uploadBg}>
        <Container maxW="4xl" py={16}>
          <VStack spacing={8} textAlign="center">
            <Text fontSize="6xl">🔒</Text>
            <Heading size="xl">Connect Your Wallet</Heading>
            <Text color={textColor} fontSize="lg" maxW="500px">
              You need to connect your wallet to create and mint NFTs on our platform.
            </Text>
            <Button variant="gradient" size="lg">
              Connect Wallet
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={uploadBg}>
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="start">
            <Heading size="xl">Create New NFT</Heading>
            <Text color={textColor} fontSize="lg">
              Upload your digital artwork and mint it as an NFT
            </Text>
          </VStack>

          {/* Progress Bar */}
          {isUploading && (
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontWeight="bold">Minting Your NFT...</Text>
                  <Progress value={uploadProgress} w="full" colorScheme="brand" />
                  <Text fontSize="sm" color={textColor}>
                    {uploadProgress < 25 && 'Preparing metadata...'}
                    {uploadProgress >= 25 && uploadProgress < 50 && 'Uploading to IPFS...'}
                    {uploadProgress >= 50 && uploadProgress < 75 && 'Creating metadata...'}
                    {uploadProgress >= 75 && uploadProgress < 100 && 'Minting NFT...'}
                    {uploadProgress === 100 && 'Complete!'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
              {/* Left Column - Image Upload */}
              <Box flex={1}>
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Upload Image</Heading>
                    <Text color={textColor} fontSize="sm">
                      File types supported: JPG, PNG, GIF, WebP. Max size: 10MB
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6}>
                      {/* Upload Area */}
                      <Box
                        w="full"
                        h="400px"
                        border="2px"
                        borderStyle="dashed"
                        borderColor={formik.errors.image && formik.touched.image ? 'red.300' : borderColor}
                        borderRadius="xl"
                        bg={uploadBg}
                        cursor="pointer"
                        onClick={() => fileInputRef.current?.click()}
                        _hover={{ borderColor: 'brand.300' }}
                        transition="border-color 0.2s"
                        position="relative"
                        overflow="hidden"
                      >
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            w="full"
                            h="full"
                            objectFit="cover"
                            borderRadius="lg"
                          />
                        ) : (
                          <VStack
                            justify="center"
                            h="full"
                            spacing={4}
                            color={textColor}
                          >
                            <Icon as={FiUpload} boxSize={12} />
                            <VStack spacing={2}>
                              <Text fontWeight="bold">Click to upload</Text>
                              <Text fontSize="sm">or drag and drop</Text>
                            </VStack>
                          </VStack>
                        )}
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                      </Box>
                      
                      {formik.errors.image && formik.touched.image && (
                        <Text color="red.500" fontSize="sm">
                          {formik.errors.image}
                        </Text>
                      )}
                      
                      {imagePreview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImagePreview(null);
                            formik.setFieldValue('image', null);
                          }}
                        >
                          Remove Image
                        </Button>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </Box>

              {/* Right Column - Form Fields */}
              <Box flex={1}>
                <VStack spacing={6} align="stretch">
                  {/* Basic Information */}
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Basic Information</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={6}>
                        <FormControl isInvalid={formik.errors.name && formik.touched.name}>
                          <FormLabel>Name *</FormLabel>
                          <Input
                            name="name"
                            placeholder="Enter NFT name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={formik.errors.description && formik.touched.description}>
                          <FormLabel>Description *</FormLabel>
                          <Textarea
                            name="description"
                            placeholder="Describe your NFT"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            rows={4}
                            resize="vertical"
                          />
                          <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
                          <FormHelperText>
                            {formik.values.description.length}/500 characters
                          </FormHelperText>
                        </FormControl>

                        <FormControl isInvalid={formik.errors.category && formik.touched.category}>
                          <FormLabel>Category *</FormLabel>
                          <Select
                            name="category"
                            placeholder="Select category"
                            value={formik.values.category}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            {categories.map((category) => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </Select>
                          <FormErrorMessage>{formik.errors.category}</FormErrorMessage>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Royalties */}
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardHeader>
                      <HStack justify="space-between">
                        <Heading size="md">Royalties</Heading>
                        <Tooltip label="Royalties are paid to you every time your NFT is resold">
                          <Box as="span" color={textColor}>
                            <FiInfo />
                          </Box>
                        </Tooltip>
                      </HStack>
                      <Text color={textColor} fontSize="sm">
                        Earn royalties on secondary sales
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <FormControl isInvalid={formik.errors.royalty && formik.touched.royalty}>
                        <FormLabel>Royalty Percentage</FormLabel>
                        <NumberInput
                          value={formik.values.royalty}
                          onChange={(value) => formik.setFieldValue('royalty', parseFloat(value) || 0)}
                          min={0}
                          max={10}
                          step={0.1}
                          precision={1}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <FormHelperText>
                          Suggested: 2.5%. Maximum: 10%
                        </FormHelperText>
                        <FormErrorMessage>{formik.errors.royalty}</FormErrorMessage>
                      </FormControl>
                    </CardBody>
                  </Card>

                  {/* Additional Options */}
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Additional Options</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="unlockable" mb="0">
                            Unlockable Content
                          </FormLabel>
                          <Switch
                            id="unlockable"
                            isChecked={formik.values.unlockableContent}
                            onChange={(e) => formik.setFieldValue('unlockableContent', e.target.checked)}
                          />
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="explicit" mb="0">
                            Explicit & Sensitive Content
                          </FormLabel>
                          <Switch
                            id="explicit"
                            isChecked={formik.values.explicitContent}
                            onChange={(e) => formik.setFieldValue('explicitContent', e.target.checked)}
                          />
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    isLoading={loading || isUploading}
                    loadingText={isUploading ? 'Minting...' : 'Creating...'}
                    isDisabled={!formik.isValid || !formik.values.image}
                  >
                    Create NFT
                  </Button>

                  {/* Info Alert */}
                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Gas Fees Required</AlertTitle>
                      <AlertDescription>
                        Creating an NFT requires a transaction fee (gas) to be paid to the network.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </Box>
            </Flex>
          </form>
        </VStack>
      </Container>
    </Box>
  );
};

export default Create;