import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for infinite scrolling functionality
 * Automatically loads more content when user scrolls near the bottom
 */
export const useInfiniteScroll = ({
  fetchMore,
  hasMore = true,
  threshold = 100,
  rootMargin = '0px',
  enabled = true
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const observerRef = useRef();
  const loadingRef = useRef();

  // Intersection Observer callback
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isFetching && enabled) {
      setIsFetching(true);
      setError(null);
      
      fetchMore()
        .then(() => {
          setIsFetching(false);
        })
        .catch((err) => {
          setError(err);
          setIsFetching(false);
        });
    }
  }, [fetchMore, hasMore, isFetching, enabled]);

  // Set up intersection observer
  useEffect(() => {
    if (!enabled) return;

    const option = {
      root: null,
      rootMargin,
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);
    
    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, rootMargin, enabled]);

  // Manual trigger for loading more
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore && enabled) {
      setIsFetching(true);
      setError(null);
      
      fetchMore()
        .then(() => {
          setIsFetching(false);
        })
        .catch((err) => {
          setError(err);
          setIsFetching(false);
        });
    }
  }, [fetchMore, hasMore, isFetching, enabled]);

  return {
    isFetching,
    error,
    loadingRef,
    loadMore
  };
};

/**
 * Hook for paginated data with infinite scroll
 */
export const usePaginatedData = ({
  fetchFunction,
  pageSize = 20,
  initialData = [],
  dependencies = []
}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Reset data when dependencies change
  useEffect(() => {
    setData(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
    setTotalCount(0);
  }, dependencies);

  // Fetch initial data
  useEffect(() => {
    if (page === 1) {
      loadInitialData();
    }
  }, [page, ...dependencies]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction({ page: 1, limit: pageSize });
      
      setData(result.data || []);
      setTotalCount(result.total || 0);
      setHasMore((result.data || []).length >= pageSize && (result.data || []).length < (result.total || 0));
      
    } catch (err) {
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const result = await fetchFunction({ page: nextPage, limit: pageSize });
      
      const newData = result.data || [];
      
      setData(prev => [...prev, ...newData]);
      setPage(nextPage);
      setTotalCount(result.total || 0);
      
      // Check if we have more data
      const totalLoaded = data.length + newData.length;
      setHasMore(totalLoaded < (result.total || 0));
      
    } catch (err) {
      setError(err);
    }
  };

  const refresh = useCallback(() => {
    setPage(1);
    setData([]);
    setHasMore(true);
    setError(null);
  }, []);

  const { isFetching, loadingRef } = useInfiniteScroll({
    fetchMore: loadMoreData,
    hasMore,
    enabled: !loading
  });

  return {
    data,
    loading: loading || isFetching,
    error,
    hasMore,
    totalCount,
    page,
    loadingRef,
    refresh,
    loadMore: loadMoreData
  };
};

/**
 * Hook for scroll-based virtual loading
 */
export const useVirtualScroll = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef();

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    index: startIndex + index
  }));

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    isScrolling,
    handleScroll,
    startIndex,
    endIndex
  };
};

/**
 * Hook for scroll position management
 */
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [scrollDirection, setScrollDirection] = useState('down');
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;

      setScrollPosition({ x: currentScrollX, y: currentScrollY });
      setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
      setIsScrolling(true);

      lastScrollY.current = currentScrollY;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollTo = useCallback((x, y, behavior = 'smooth') => {
    window.scrollTo({ left: x, top: y, behavior });
  }, []);

  const scrollToTop = useCallback((behavior = 'smooth') => {
    window.scrollTo({ top: 0, behavior });
  }, []);

  const scrollToElement = useCallback((elementId, behavior = 'smooth') => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior, block: 'start' });
    }
  }, []);

  return {
    scrollPosition,
    scrollDirection,
    isScrolling,
    scrollTo,
    scrollToTop,
    scrollToElement
  };
};

export default useInfiniteScroll;