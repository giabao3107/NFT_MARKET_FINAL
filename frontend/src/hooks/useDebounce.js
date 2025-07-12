import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for debouncing values
 * Delays updating the value until after the specified delay
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for debounced callbacks
 * Delays executing the callback until after the specified delay
 */
export const useDebouncedCallback = (callback, delay = 500, dependencies = []) => {
  const timeoutRef = useRef();

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return [debouncedCallback, cancel];
};

/**
 * Hook for throttling values
 * Limits the rate at which a value can be updated
 */
export const useThrottle = (value, limit = 500) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * Hook for throttled callbacks
 * Limits the rate at which a callback can be executed
 */
export const useThrottledCallback = (callback, limit = 500, dependencies = []) => {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef();

  const throttledCallback = useCallback((...args) => {
    if (Date.now() - lastRan.current >= limit) {
      callback(...args);
      lastRan.current = Date.now();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRan.current = Date.now();
      }, limit - (Date.now() - lastRan.current));
    }
  }, [callback, limit, ...dependencies]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

/**
 * Hook for debounced search functionality
 * Combines debouncing with search state management
 */
export const useDebouncedSearch = ({
  searchFunction,
  delay = 500,
  minLength = 2,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debouncedQuery = useDebounce(query, delay);
  const abortControllerRef = useRef();

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < minLength) {
        setResults([]);
        setLoading(false);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);
        
        const searchResults = await searchFunction(debouncedQuery, {
          signal: abortControllerRef.current.signal
        });
        
        setResults(searchResults);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    };

    performSearch();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, searchFunction, minLength]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  const setSearchQuery = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  return {
    query,
    debouncedQuery,
    results,
    loading,
    error,
    setQuery: setSearchQuery,
    clearSearch
  };
};

/**
 * Hook for debounced form validation
 * Validates form fields with debouncing to improve performance
 */
export const useDebouncedValidation = ({
  validationFunction,
  delay = 300,
  dependencies = []
}) => {
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);
  
  const debouncedValidate = useDebouncedCallback(async (values) => {
    setIsValidating(true);
    
    try {
      const validationErrors = await validationFunction(values);
      setErrors(validationErrors || {});
      setIsValid(Object.keys(validationErrors || {}).length === 0);
    } catch (error) {
      console.error('Validation error:', error);
      setErrors({ general: 'Validation failed' });
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  }, delay, dependencies);

  const validate = useCallback((values) => {
    debouncedValidate(values);
  }, [debouncedValidate]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  return {
    errors,
    isValidating,
    isValid,
    validate,
    clearErrors
  };
};

/**
 * Hook for debounced API calls
 * Manages API calls with debouncing and loading states
 */
export const useDebouncedAPI = ({
  apiFunction,
  delay = 500,
  dependencies = []
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef();

  const debouncedCall = useDebouncedCallback(async (...args) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args, {
        signal: abortControllerRef.current.signal
      });
      
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, delay, dependencies);

  const call = useCallback((...args) => {
    debouncedCall(...args);
  }, [debouncedCall]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    call,
    reset
  };
};

export default useDebounce;