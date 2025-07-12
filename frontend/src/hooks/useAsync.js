import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing async operations
 * Provides loading, error, and data states for async functions
 */
export const useAsync = (asyncFunction, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef();

  // Execute async function
  const execute = useCallback(async (...args) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction(...args, {
        signal: abortControllerRef.current.signal
      });
      
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [asyncFunction]);

  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Execute on mount or dependency change
  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Hook for managing multiple async operations
 */
export const useAsyncQueue = () => {
  const [queue, setQueue] = useState([]);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});
  const processingRef = useRef(false);

  // Add operation to queue
  const addToQueue = useCallback((id, asyncFunction, ...args) => {
    setQueue(prev => [...prev, { id, asyncFunction, args }]);
  }, []);

  // Process queue
  const processQueue = useCallback(async () => {
    if (processingRef.current || queue.length === 0) return;
    
    processingRef.current = true;
    
    while (queue.length > 0) {
      const operation = queue[0];
      setCurrentOperation(operation);
      
      try {
        const result = await operation.asyncFunction(...operation.args);
        setResults(prev => ({ ...prev, [operation.id]: result }));
      } catch (error) {
        setErrors(prev => ({ ...prev, [operation.id]: error }));
      }
      
      setQueue(prev => prev.slice(1));
    }
    
    setCurrentOperation(null);
    processingRef.current = false;
  }, [queue]);

  // Auto-process queue when items are added
  useEffect(() => {
    processQueue();
  }, [processQueue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentOperation(null);
    processingRef.current = false;
  }, []);

  const clearResults = useCallback(() => {
    setResults({});
    setErrors({});
  }, []);

  return {
    queue,
    currentOperation,
    results,
    errors,
    isProcessing: processingRef.current,
    addToQueue,
    clearQueue,
    clearResults
  };
};

/**
 * Hook for retry logic with exponential backoff
 */
export const useAsyncRetry = (asyncFunction, maxRetries = 3, baseDelay = 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  const execute = useCallback(async (...args) => {
    let currentRetry = 0;
    
    const attemptExecution = async () => {
      try {
        setLoading(true);
        setError(null);
        setRetryCount(currentRetry);
        
        const result = await asyncFunction(...args);
        
        if (mountedRef.current) {
          setData(result);
          setRetryCount(0);
        }
      } catch (err) {
        if (mountedRef.current) {
          if (currentRetry < maxRetries) {
            currentRetry++;
            const delay = baseDelay * Math.pow(2, currentRetry - 1);
            
            setTimeout(() => {
              if (mountedRef.current) {
                attemptExecution();
              }
            }, delay);
          } else {
            setError(err);
          }
        }
      } finally {
        if (mountedRef.current && (currentRetry >= maxRetries || !error)) {
          setLoading(false);
        }
      }
    };
    
    await attemptExecution();
  }, [asyncFunction, maxRetries, baseDelay]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setRetryCount(0);
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    retryCount,
    execute,
    reset,
    canRetry: retryCount < maxRetries
  };
};

/**
 * Hook for caching async results
 */
export const useAsyncCache = (cacheKey, asyncFunction, ttl = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const cacheRef = useRef(new Map());

  const isExpired = useCallback(() => {
    if (!lastFetch) return true;
    return Date.now() - lastFetch > ttl;
  }, [lastFetch, ttl]);

  const execute = useCallback(async (...args) => {
    const fullCacheKey = `${cacheKey}_${JSON.stringify(args)}`;
    
    // Check cache first
    if (cacheRef.current.has(fullCacheKey) && !isExpired()) {
      const cachedData = cacheRef.current.get(fullCacheKey);
      setData(cachedData);
      return cachedData;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction(...args);
      
      // Cache the result
      cacheRef.current.set(fullCacheKey, result);
      setData(result);
      setLastFetch(Date.now());
      
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, asyncFunction, isExpired]);

  const clearCache = useCallback((specificKey = null) => {
    if (specificKey) {
      cacheRef.current.delete(specificKey);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const invalidateCache = useCallback(() => {
    setLastFetch(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    clearCache,
    invalidateCache,
    isExpired: isExpired()
  };
};

/**
 * Hook for parallel async operations
 */
export const useAsyncParallel = (asyncFunctions = []) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [completed, setCompleted] = useState(0);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setResults([]);
    setErrors([]);
    setCompleted(0);

    try {
      const promises = asyncFunctions.map(async (fn, index) => {
        try {
          const result = await fn(...args);
          setCompleted(prev => prev + 1);
          return { index, result, error: null };
        } catch (error) {
          setCompleted(prev => prev + 1);
          return { index, result: null, error };
        }
      });

      const outcomes = await Promise.all(promises);
      
      const newResults = [];
      const newErrors = [];
      
      outcomes.forEach(({ index, result, error }) => {
        newResults[index] = result;
        newErrors[index] = error;
      });
      
      setResults(newResults);
      setErrors(newErrors);
    } catch (error) {
      console.error('Parallel execution error:', error);
    } finally {
      setLoading(false);
    }
  }, [asyncFunctions]);

  const progress = asyncFunctions.length > 0 ? (completed / asyncFunctions.length) * 100 : 0;

  return {
    results,
    errors,
    loading,
    completed,
    total: asyncFunctions.length,
    progress,
    execute
  };
};

export default useAsync;