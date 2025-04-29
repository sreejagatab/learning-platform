/**
 * Performance optimization utilities for the learning platform
 */

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit how often a function can be called
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Memoize function to cache results of expensive function calls
 * @param {Function} func - The function to memoize
 * @returns {Function} - The memoized function
 */
export const memoize = (func) => {
  const cache = new Map();
  
  return function memoizedFunction(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  };
};

/**
 * Lazy load an image with IntersectionObserver
 * @param {HTMLImageElement} img - The image element to lazy load
 * @param {string} src - The source URL of the image
 */
export const lazyLoadImage = (img, src) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.disconnect();
      }
    });
  });
  
  observer.observe(img);
};

/**
 * Optimize rendering of large lists with windowing
 * @param {Array} items - The full list of items
 * @param {number} startIndex - The start index to render
 * @param {number} endIndex - The end index to render
 * @returns {Array} - The windowed list of items
 */
export const windowedList = (items, startIndex, endIndex) => {
  return items.slice(startIndex, endIndex);
};

/**
 * Batch state updates to reduce re-renders
 * @param {Function} setStateFn - The setState function
 * @param {Object} updates - The updates to apply
 */
export const batchUpdates = (setStateFn, updates) => {
  setStateFn(prevState => ({
    ...prevState,
    ...updates
  }));
};

/**
 * Check if an element is in the viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - Whether the element is in the viewport
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Prefetch data for anticipated user actions
 * @param {string} url - The URL to prefetch
 * @param {Function} fetchFn - The fetch function to use
 * @returns {Promise} - The fetch promise
 */
export const prefetchData = (url, fetchFn) => {
  return fetchFn(url)
    .then(response => response.json())
    .catch(error => console.error('Prefetch error:', error));
};

/**
 * Apply performance optimizations to a component
 * @param {React.Component} Component - The component to optimize
 * @param {Object} options - Optimization options
 * @returns {React.Component} - The optimized component
 */
export const optimizeComponent = (Component, options = {}) => {
  // Apply optimizations based on options
  // This is a placeholder for component-specific optimizations
  return Component;
};
