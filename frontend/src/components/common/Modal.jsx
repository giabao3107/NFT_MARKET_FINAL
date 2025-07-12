import React from 'react';
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Box,
  Divider
} from '@chakra-ui/react';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

/**
 * Base Modal Component
 * Reusable modal with customizable content and actions
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  isCentered = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  headerProps = {},
  bodyProps = {},
  footerProps = {},
  ...props
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <ChakraModal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      isCentered={isCentered}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
      {...props}
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        bg={bgColor}
        borderRadius="xl"
        border="1px"
        borderColor={borderColor}
        boxShadow="xl"
      >
        {title && (
          <>
            <ModalHeader
              fontSize="lg"
              fontWeight="bold"
              pb={2}
              {...headerProps}
            >
              {title}
            </ModalHeader>
            <Divider />
          </>
        )}
        
        {showCloseButton && <ModalCloseButton />}
        
        <ModalBody py={6} {...bodyProps}>
          {children}
        </ModalBody>
        
        {footer && (
          <>
            <Divider />
            <ModalFooter {...footerProps}>
              {footer}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </ChakraModal>
  );
};

/**
 * Confirmation Modal
 * Modal for confirming actions with customizable buttons
 */
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColorScheme = 'blue',
  isLoading = false,
  icon = FiInfo,
  iconColor = 'blue.500',
  ...props
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <HStack spacing={3} w="full" justify="flex-end">
          <Button
            variant="ghost"
            onClick={onClose}
            isDisabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            colorScheme={confirmColorScheme}
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText="Processing..."
          >
            {confirmText}
          </Button>
        </HStack>
      }
      {...props}
    >
      <VStack spacing={4} align="center" textAlign="center">
        <Box as={icon} boxSize={12} color={iconColor} />
        <Text fontSize="md" color="gray.600">
          {message}
        </Text>
      </VStack>
    </Modal>
  );
};

/**
 * Alert Modal
 * Modal for displaying alerts and notifications
 */
export const AlertModal = ({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
  actionText = 'OK',
  onAction,
  ...props
}) => {
  const typeConfig = {
    success: {
      icon: FiCheckCircle,
      iconColor: 'green.500',
      colorScheme: 'green',
      defaultTitle: 'Success'
    },
    error: {
      icon: FiX,
      iconColor: 'red.500',
      colorScheme: 'red',
      defaultTitle: 'Error'
    },
    warning: {
      icon: FiAlertTriangle,
      iconColor: 'orange.500',
      colorScheme: 'orange',
      defaultTitle: 'Warning'
    },
    info: {
      icon: FiInfo,
      iconColor: 'blue.500',
      colorScheme: 'blue',
      defaultTitle: 'Information'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  const handleAction = async () => {
    if (onAction) {
      await onAction();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || config.defaultTitle}
      size="sm"
      footer={
        <Button
          colorScheme={config.colorScheme}
          onClick={handleAction}
          w="full"
        >
          {actionText}
        </Button>
      }
      {...props}
    >
      <VStack spacing={4} align="center" textAlign="center">
        <Box as={config.icon} boxSize={12} color={config.iconColor} />
        <Text fontSize="md" color="gray.600">
          {message}
        </Text>
      </VStack>
    </Modal>
  );
};

/**
 * Form Modal
 * Modal specifically designed for forms
 */
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isSubmitting = false,
  isValid = true,
  size = 'md',
  ...props
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      closeOnOverlayClick={!isSubmitting}
      closeOnEsc={!isSubmitting}
      footer={
        <HStack spacing={3} w="full" justify="flex-end">
          <Button
            variant="ghost"
            onClick={onClose}
            isDisabled={isSubmitting}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            form="modal-form"
            colorScheme="blue"
            isLoading={isSubmitting}
            isDisabled={!isValid}
            loadingText="Submitting..."
          >
            {submitText}
          </Button>
        </HStack>
      }
      {...props}
    >
      <Box as="form" id="modal-form" onSubmit={handleSubmit}>
        {children}
      </Box>
    </Modal>
  );
};

/**
 * NFT Action Modal
 * Specialized modal for NFT-related actions
 */
export const NFTActionModal = ({
  isOpen,
  onClose,
  nft,
  action,
  onConfirm,
  isLoading = false,
  ...props
}) => {
  const actionConfig = {
    buy: {
      title: 'Purchase NFT',
      message: `Are you sure you want to purchase "${nft?.name}" for ${nft?.price} ETH?`,
      confirmText: 'Purchase',
      colorScheme: 'green',
      icon: FiCheckCircle
    },
    list: {
      title: 'List NFT for Sale',
      message: `List "${nft?.name}" on the marketplace?`,
      confirmText: 'List NFT',
      colorScheme: 'blue',
      icon: FiInfo
    },
    delist: {
      title: 'Remove from Sale',
      message: `Remove "${nft?.name}" from the marketplace?`,
      confirmText: 'Remove',
      colorScheme: 'orange',
      icon: FiAlertTriangle
    },
    transfer: {
      title: 'Transfer NFT',
      message: `Transfer "${nft?.name}" to another wallet?`,
      confirmText: 'Transfer',
      colorScheme: 'purple',
      icon: FiInfo
    }
  };

  const config = actionConfig[action] || actionConfig.list;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      confirmColorScheme={config.colorScheme}
      icon={config.icon}
      iconColor={`${config.colorScheme}.500`}
      isLoading={isLoading}
      {...props}
    />
  );
};

/**
 * Wallet Connection Modal
 * Modal for wallet connection options
 */
export const WalletModal = ({
  isOpen,
  onClose,
  onConnect,
  isConnecting = false,
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Wallet"
      size="sm"
      {...props}
    >
      <VStack spacing={4}>
        <Text fontSize="sm" color="gray.600" textAlign="center">
          Connect your wallet to start trading NFTs
        </Text>
        
        <Button
          w="full"
          size="lg"
          colorScheme="orange"
          onClick={onConnect}
          isLoading={isConnecting}
          loadingText="Connecting..."
          leftIcon={<Icon boxSize={6} />}
        >
          Connect MetaMask
        </Button>
        
        <Text fontSize="xs" color="gray.500" textAlign="center">
          By connecting your wallet, you agree to our Terms of Service
        </Text>
      </VStack>
    </Modal>
  );
};

export default Modal;