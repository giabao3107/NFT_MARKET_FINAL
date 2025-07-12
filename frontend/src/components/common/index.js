import React from 'react';
// Import components for internal use
import LoadingSpinner from './LoadingSpinner';
import { CustomAlert } from './Toast';

// Common Components Export
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as Modal } from './Modal';
export { default as SearchBar, QuickSearch, CategorySearch } from './SearchBar';
export { default as Pagination, SimplePagination, LoadMorePagination, CompactPagination } from './Pagination';
export { default as Filter, QuickFilter } from './Filter';
export { default as ToastProvider, useCustomToast, CustomAlert } from './Toast';

// Re-export specific components for convenience
export {
  // Loading components
  PageLoading,
  InlineLoading,
  ButtonLoading,
  CardLoading,
  NFTLoading
} from './LoadingSpinner';

export {
  // Modal components
  ConfirmationModal,
  AlertModal,
  FormModal,
  NFTActionModal,
  WalletModal
} from './Modal';

// Common component props and utilities
export const COMMON_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];
export const COMMON_VARIANTS = ['solid', 'outline', 'ghost', 'link'];
export const COMMON_COLOR_SCHEMES = [
  'gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink'
];

// Common component default props
export const DEFAULT_MODAL_PROPS = {
  size: 'md',
  isCentered: true,
  closeOnOverlayClick: true,
  closeOnEsc: true
};

export const DEFAULT_PAGINATION_PROPS = {
  size: 'md',
  variant: 'outline',
  colorScheme: 'blue',
  maxVisiblePages: 5,
  showItemsPerPage: true,
  showPageInfo: true,
  showFirstLast: true
};

export const DEFAULT_FILTER_PROPS = {
  showPriceRange: true,
  showCategories: true,
  showStatus: true,
  showSortBy: true,
  showCollections: true,
  showProperties: true
};

export const DEFAULT_SEARCH_PROPS = {
  size: 'md',
  variant: 'filled',
  showHistory: true,
  showSuggestions: true,
  showResults: true,
  maxResults: 10
};

export const DEFAULT_TOAST_PROPS = {
  duration: 5000,
  isClosable: true,
  position: 'top-right',
  variant: 'solid'
};

// Common utility functions for components
export const getResponsiveSize = (breakpoint) => {
  const sizeMap = {
    base: 'sm',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl'
  };
  return sizeMap[breakpoint] || 'md';
};

export const getColorSchemeByStatus = (status) => {
  const colorMap = {
    success: 'green',
    error: 'red',
    warning: 'orange',
    info: 'blue',
    loading: 'blue',
    pending: 'yellow'
  };
  return colorMap[status] || 'gray';
};

export const getIconByStatus = (status) => {
  const iconMap = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
    loading: '⟳',
    pending: '⏳'
  };
  return iconMap[status] || '';
};

// Common animation variants
export const FADE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const SLIDE_VARIANTS = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
};

export const SCALE_VARIANTS = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

// Common component compositions
export const withLoading = (Component) => {
  return ({ isLoading, loadingComponent, ...props }) => {
    if (isLoading) {
      return loadingComponent || <LoadingSpinner />;
    }
    return <Component {...props} />;
  };
};

export const withError = (Component) => {
  return ({ error, errorComponent, ...props }) => {
    if (error) {
      return errorComponent || (
        <CustomAlert
          status="error"
          title="Error"
          description={error.message || 'An error occurred'}
        />
      );
    }
    return <Component {...props} />;
  };
};

export const withEmpty = (Component) => {
  return ({ isEmpty, emptyComponent, emptyMessage = 'No data available', ...props }) => {
    if (isEmpty) {
      return emptyComponent || (
        <CustomAlert
          status="info"
          title="No Data"
          description={emptyMessage}
        />
      );
    }
    return <Component {...props} />;
  };
};

// Common hooks for components
export const useComponentState = (initialState = {}) => {
  const [state, setState] = React.useState({
    isLoading: false,
    error: null,
    data: null,
    ...initialState
  });

  const setLoading = (loading) => setState(prev => ({ ...prev, isLoading: loading }));
  const setError = (error) => setState(prev => ({ ...prev, error, isLoading: false }));
  const setData = (data) => setState(prev => ({ ...prev, data, isLoading: false, error: null }));
  const reset = () => setState({ isLoading: false, error: null, data: null });

  return {
    ...state,
    setLoading,
    setError,
    setData,
    reset
  };
};

// Common validation functions
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

export const validateNumber = (value, min, max) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  if (min !== undefined && num < min) {
    return `Value must be at least ${min}`;
  }
  if (max !== undefined && num > max) {
    return `Value must be at most ${max}`;
  }
  return null;
};

// Common formatting functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  return new Date(date).toLocaleDateString(undefined, defaultOptions);
};

export const formatTime = (date, options = {}) => {
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  return new Date(date).toLocaleTimeString(undefined, defaultOptions);
};

export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// Common constants
export const BREAKPOINTS = {
  base: '0px',
  sm: '480px',
  md: '768px',
  lg: '992px',
  xl: '1280px',
  '2xl': '1536px'
};

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070
};

export const TRANSITION_DURATION = {
  fast: '0.15s',
  normal: '0.2s',
  slow: '0.3s',
  slower: '0.5s'
};

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px'
};

export const SHADOW = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};