import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Image,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  useToast,
  Flex,
  Spacer,
  Badge,
  IconButton,
  Tooltip,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Checkbox,
  CheckboxGroup,
  Stack,
  Divider,
  SimpleGrid,
  Center,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import {
  FiUpload,
  FiImage,
  FiVideo,
  FiMusic,
  FiFile,
  FiX,
  FiPlus,
  FiMinus,
  FiEye,
  FiSettings,
  FiInfo,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
  FiCopy,
  FiExternalLink
} from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNFTContext } from '../../contexts/NFTContext';
import { useCustomToast } from '../common/Toast';
import { useNFTOperations } from '../../hooks';
import { uploadToIPFS, uploadMetadataToIPFS } from '../../utils/ipfs';
import { formatEther } from '../../utils/web3';
import { validateNFTData, generateMetadata } from '../../utils/helpers';
import { createMetadataDataURI } from '../../utils/encoding';

/**
 * NFT Upload Component
 */
const NFTUpload = ({ onSuccess, onCancel, ...props }) => {
  const { account, isConnected } = useWeb3();
  const { mintNFT } = useNFTOperations();
  const toast = useCustomToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    category: '',
    collection: '',
    attributes: [],
    royalty: 5,
    supply: 1,
    price: '',
    listForSale: false,
    unlockableContent: false,
    unlockableDescription: '',
    explicitContent: false
  });
  
  // UI state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [newAttribute, setNewAttribute] = useState({ trait_type: '', value: '' });
  
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const fileInputRef = useRef();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const dropzoneBg = useColorModeValue('gray.50', 'gray.700');
  
  // File upload with drag & drop
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: null }));
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'audio/*': ['.mp3', '.wav', '.ogg']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  // Add attribute
  const addAttribute = () => {
    if (newAttribute.trait_type && newAttribute.value) {
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { ...newAttribute }]
      }));
      setNewAttribute({ trait_type: '', value: '' });
    }
  };
  
  // Remove attribute
  const removeAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = validateNFTData(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle file upload
  const uploadFile = async () => {
    if (!formData.image) {
      throw new Error('No file selected');
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Import IPFS upload function
      const { uploadFileToIPFS } = await import('../../utils/ipfs');
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Upload file to IPFS
      const ipfsHash = await uploadFileToIPFS(formData.image, formData.name);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Return IPFS URL
      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle metadata upload
  const uploadMetadata = async (imageUri) => {
    const metadata = {
      name: formData.name,
      description: formData.description,
      image: imageUri,
      attributes: formData.attributes || [],
      category: formData.category,
      collection: formData.collection
    };
    
    try {
      // Create base64 data URI for metadata with Unicode support
      return createMetadataDataURI(metadata);
    } catch (error) {
      console.error('Metadata creation error:', error);
      throw new Error('Failed to create metadata');
    }
  };
  
  // Handle NFT minting
  const handleMint = async () => {
    if (!validateForm()) {
      toast.error('Validation Error', 'Please fix the errors in the form');
      return;
    }
    
    if (!isConnected) {
      toast.error('Wallet Error', 'Please connect your wallet');
      return;
    }
    
    setIsMinting(true);
    
    try {
      // Step 1: Upload file
      toast.info('Processing', 'Processing file...');
      const imageUri = await uploadFile();
      
      // Step 2: Create metadata
      toast.info('Creating', 'Creating metadata...');
      const metadataUri = await uploadMetadata(imageUri);
      
      // Step 3: Mint NFT
      toast.info('Minting', 'Minting your NFT...');
      const result = await mintNFT({
        name: formData.name,
        description: formData.description,
        image: imageUri,
        attributes: formData.attributes || [],
        category: formData.category,
        collection: formData.collection
      }, formData.royalty * 100); // Convert percentage to basis points
      
      toast.success('Success', 'NFT minted successfully!');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Minting error:', error);
      toast.error('Minting Error', error.message || 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: null,
      category: '',
      collection: '',
      attributes: [],
      royalty: 5,
      supply: 1,
      price: '',
      listForSale: false,
      unlockableContent: false,
      unlockableDescription: '',
      explicitContent: false
    });
    setPreviewUrl(null);
    setErrors({});
    setCurrentStep(1);
    setUploadProgress(0);
  };
  
  // Get file type icon
  const getFileIcon = (file) => {
    if (!file) return <FiFile />;
    
    if (file.type.startsWith('image/')) return <FiImage />;
    if (file.type.startsWith('video/')) return <FiVideo />;
    if (file.type.startsWith('audio/')) return <FiMusic />;
    return <FiFile />;
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <FileUploadStep />;
      case 2:
        return <NFTDetailsStep />;
      case 3:
        return <AttributesStep />;
      case 4:
        return <SaleSettingsStep />;
      case 5:
        return <ReviewStep />;
      default:
        return <FileUploadStep />;
    }
  };
  
  // File Upload Step
  const FileUploadStep = () => (
    <VStack spacing={6}>
      <Text fontSize="xl" fontWeight="bold">
        Upload your file
      </Text>
      
      {/* Dropzone */}
      <Box
        {...getRootProps()}
        w="full"
        h="300px"
        border="2px dashed"
        borderColor={isDragActive ? 'blue.400' : borderColor}
        borderRadius="lg"
        bg={isDragActive ? 'blue.50' : dropzoneBg}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <Center h="full">
          {formData.image ? (
            <VStack spacing={4}>
              {previewUrl && (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  maxH="200px"
                  maxW="200px"
                  objectFit="cover"
                  borderRadius="md"
                />
              )}
              <VStack spacing={2}>
                <HStack>
                  {getFileIcon(formData.image)}
                  <Text fontWeight="medium">{formData.image.name}</Text>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FiRefreshCw />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData(prev => ({ ...prev, image: null }));
                    setPreviewUrl(null);
                  }}
                >
                  Change File
                </Button>
              </VStack>
            </VStack>
          ) : (
            <VStack spacing={4}>
              <Box fontSize="4xl" color="gray.400">
                <FiUpload />
              </Box>
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="medium">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </Text>
                <Text color="gray.500">
                  or click to browse
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Supports: Images, Videos, Audio (Max 100MB)
                </Text>
              </VStack>
            </VStack>
          )}
        </Center>
      </Box>
      
      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>File rejected!</AlertTitle>
            <AlertDescription>
              {fileRejections[0].errors[0].message}
            </AlertDescription>
          </Box>
        </Alert>
      )}
      
      {/* Upload Progress */}
      {isUploading && (
        <Box w="full">
          <Text fontSize="sm" mb={2}>
            Uploading... {uploadProgress}%
          </Text>
          <Progress value={uploadProgress} colorScheme="blue" />
        </Box>
      )}
    </VStack>
  );
  
  // NFT Details Step
  const NFTDetailsStep = () => (
    <VStack spacing={6}>
      <Text fontSize="xl" fontWeight="bold">
        NFT Details
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
        <FormControl isInvalid={errors.name}>
          <FormLabel>Name *</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter NFT name"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>
        
        <FormControl isInvalid={errors.category}>
          <FormLabel>Category</FormLabel>
          <Select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="Select category"
          >
            <option value="art">Art</option>
            <option value="music">Music</option>
            <option value="photography">Photography</option>
            <option value="video">Video</option>
            <option value="3d">3D</option>
            <option value="gaming">Gaming</option>
            <option value="sports">Sports</option>
            <option value="collectibles">Collectibles</option>
          </Select>
          <FormErrorMessage>{errors.category}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>
      
      <FormControl isInvalid={errors.description}>
        <FormLabel>Description</FormLabel>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your NFT"
          rows={4}
        />
        <FormErrorMessage>{errors.description}</FormErrorMessage>
      </FormControl>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
        <FormControl>
          <FormLabel>Collection</FormLabel>
          <Select
            value={formData.collection}
            onChange={(e) => handleInputChange('collection', e.target.value)}
            placeholder="Select collection"
          >
            <option value="default">Default Collection</option>
            {/* Add more collections here */}
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Royalty (%)</FormLabel>
          <NumberInput
            value={formData.royalty}
            onChange={(value) => handleInputChange('royalty', parseInt(value) || 0)}
            min={0}
            max={20}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            Percentage you'll receive from secondary sales
          </FormHelperText>
        </FormControl>
      </SimpleGrid>
    </VStack>
  );
  
  // Attributes Step
  const AttributesStep = () => (
    <VStack spacing={6}>
      <Text fontSize="xl" fontWeight="bold">
        Attributes
      </Text>
      
      <Text color="gray.600" textAlign="center">
        Add attributes to make your NFT more discoverable and valuable
      </Text>
      
      {/* Add New Attribute */}
      <Card w="full">
        <CardBody>
          <VStack spacing={4}>
            <Text fontWeight="medium">Add New Attribute</Text>
            
            <HStack spacing={4} w="full">
              <FormControl>
                <FormLabel fontSize="sm">Trait Type</FormLabel>
                <Input
                  value={newAttribute.trait_type}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, trait_type: e.target.value }))}
                  placeholder="e.g., Color, Size, Rarity"
                  size="sm"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">Value</FormLabel>
                <Input
                  value={newAttribute.value}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., Blue, Large, Rare"
                  size="sm"
                />
              </FormControl>
              
              <Button
                leftIcon={<FiPlus />}
                onClick={addAttribute}
                isDisabled={!newAttribute.trait_type || !newAttribute.value}
                size="sm"
                mt={6}
              >
                Add
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
      
      {/* Existing Attributes */}
      {formData.attributes.length > 0 && (
        <Card w="full">
          <CardHeader>
            <Text fontWeight="medium">Current Attributes</Text>
          </CardHeader>
          <CardBody>
            <Wrap spacing={3}>
              {formData.attributes.map((attr, index) => (
                <WrapItem key={index}>
                  <Tag size="lg" variant="outline">
                    <TagLabel>
                      <Text fontSize="xs" color="gray.500">{attr.trait_type}:</Text>
                      <Text fontSize="sm" fontWeight="medium" ml={1}>{attr.value}</Text>
                    </TagLabel>
                    <TagCloseButton onClick={() => removeAttribute(index)} />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
  
  // Sale Settings Step
  const SaleSettingsStep = () => (
    <VStack spacing={6}>
      <Text fontSize="xl" fontWeight="bold">
        Sale Settings
      </Text>
      
      <Card w="full">
        <CardBody>
          <VStack spacing={6}>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>List for sale immediately</FormLabel>
              <Switch
                isChecked={formData.listForSale}
                onChange={(e) => handleInputChange('listForSale', e.target.checked)}
              />
            </FormControl>
            
            {formData.listForSale && (
              <FormControl isInvalid={errors.price}>
                <FormLabel>Price (ETH)</FormLabel>
                <NumberInput
                  value={formData.price}
                  onChange={(value) => handleInputChange('price', value)}
                  min={0}
                  precision={4}
                >
                  <NumberInputField placeholder="0.0" />
                </NumberInput>
                <FormErrorMessage>{errors.price}</FormErrorMessage>
              </FormControl>
            )}
            
            <Divider />
            
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Unlockable content</FormLabel>
              <Switch
                isChecked={formData.unlockableContent}
                onChange={(e) => handleInputChange('unlockableContent', e.target.checked)}
              />
            </FormControl>
            
            {formData.unlockableContent && (
              <FormControl>
                <FormLabel>Unlockable Description</FormLabel>
                <Textarea
                  value={formData.unlockableDescription}
                  onChange={(e) => handleInputChange('unlockableDescription', e.target.value)}
                  placeholder="Describe the unlockable content"
                  rows={3}
                />
              </FormControl>
            )}
            
            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Explicit & sensitive content</FormLabel>
              <Switch
                isChecked={formData.explicitContent}
                onChange={(e) => handleInputChange('explicitContent', e.target.checked)}
              />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
  
  // Review Step
  const ReviewStep = () => (
    <VStack spacing={6}>
      <Text fontSize="xl" fontWeight="bold">
        Review & Mint
      </Text>
      
      <Card w="full">
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Preview */}
            <VStack spacing={4}>
              <Text fontWeight="medium">Preview</Text>
              {previewUrl && (
                <Image
                  src={previewUrl}
                  alt="NFT Preview"
                  maxH="200px"
                  maxW="200px"
                  objectFit="cover"
                  borderRadius="md"
                  border="1px"
                  borderColor={borderColor}
                />
              )}
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FiEye />}
                onClick={onPreviewOpen}
              >
                Full Preview
              </Button>
            </VStack>
            
            {/* Details */}
            <VStack spacing={4} align="start">
              <Text fontWeight="medium">Details</Text>
              
              <VStack spacing={2} align="start" fontSize="sm">
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">Name:</Text>
                  <Text fontWeight="medium">{formData.name}</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">Category:</Text>
                  <Text>{formData.category || 'None'}</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">Royalty:</Text>
                  <Text>{formData.royalty}%</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text color="gray.500">Attributes:</Text>
                  <Text>{formData.attributes.length}</Text>
                </HStack>
                
                {formData.listForSale && (
                  <HStack justify="space-between" w="full">
                    <Text color="gray.500">Price:</Text>
                    <Text fontWeight="medium">{formData.price} ETH</Text>
                  </HStack>
                )}
              </VStack>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>
      
      {/* Minting Info */}
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Ready to mint!</AlertTitle>
          <AlertDescription>
            Your NFT will be minted on the blockchain. This action cannot be undone.
          </AlertDescription>
        </Box>
      </Alert>
    </VStack>
  );
  
  return (
    <Box {...props}>
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Flex align="center">
            <VStack spacing={1} align="start">
              <Text fontSize="2xl" fontWeight="bold">
                Create NFT
              </Text>
              <Text color="gray.500">
                Step {currentStep} of 5
              </Text>
            </VStack>
            
            <Spacer />
            
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Flex>
          
          {/* Progress */}
          <Progress
            value={(currentStep / 5) * 100}
            colorScheme="blue"
            size="sm"
            mt={4}
          />
        </CardHeader>
        
        <CardBody>
          {renderStepContent()}
        </CardBody>
        
        <CardFooter>
          <HStack spacing={4} w="full" justify="space-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              isDisabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <Spacer />
            
            {currentStep < 5 ? (
              <Button
                colorScheme="blue"
                onClick={() => {
                  if (currentStep === 1 && !formData.image) {
                    toast.error('Error', 'Please select a file first');
                    return;
                  }
                  setCurrentStep(Math.min(5, currentStep + 1));
                }}
                isDisabled={currentStep === 1 && !formData.image}
              >
                Next
              </Button>
            ) : (
              <Button
                colorScheme="green"
                leftIcon={<FiCheck />}
                onClick={handleMint}
                isLoading={isMinting || isUploading}
                loadingText={isUploading ? 'Uploading...' : 'Minting...'}
                size="lg"
              >
                Mint NFT
              </Button>
            )}
          </HStack>
        </CardFooter>
      </Card>
      
      {/* Preview Modal */}
      <NFTPreviewModal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        nft={{
          ...formData,
          image: previewUrl,
          owner: account
        }}
      />
    </Box>
  );
};

/**
 * NFT Preview Modal
 */
const NFTPreviewModal = ({ isOpen, onClose, nft }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>NFT Preview</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            {nft.image && (
              <Image
                src={nft.image}
                alt={nft.name}
                maxH="400px"
                maxW="400px"
                objectFit="cover"
                borderRadius="md"
              />
            )}
            
            <VStack spacing={4} align="start" w="full">
              <Text fontSize="xl" fontWeight="bold">
                {nft.name || 'Untitled'}
              </Text>
              
              {nft.description && (
                <Text color="gray.600">
                  {nft.description}
                </Text>
              )}
              
              {nft.attributes && nft.attributes.length > 0 && (
                <Box w="full">
                  <Text fontWeight="medium" mb={2}>Attributes</Text>
                  <Wrap spacing={2}>
                    {nft.attributes.map((attr, index) => (
                      <WrapItem key={index}>
                        <Badge variant="outline">
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NFTUpload;
export { NFTPreviewModal };