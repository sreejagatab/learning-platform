/**
 * Cache middleware for API responses
 * Implements a simple in-memory cache with configurable TTL
 */
const logger = require('../utils/logger');

// In-memory cache store
const cache = new Map();

// Cache statistics for monitoring
const cacheStats = {
  hits: 0,
  misses: 0,
  size: 0
};

/**
 * Clear the entire cache
 */
const clearCache = () => {
  cache.clear();
  cacheStats.size = 0;
  logger.info('Cache cleared');
};

/**
 * Remove a specific key from the cache
 * @param {String} key - Cache key to remove
 */
const invalidateCache = (key) => {
  if (cache.has(key)) {
    cache.delete(key);
    cacheStats.size--;
    logger.debug(`Cache invalidated for key: ${key}`);
  }
};

/**
 * Remove all keys that match a pattern
 * @param {RegExp} pattern - Regular expression pattern to match keys
 */
const invalidateCachePattern = (pattern) => {
  let count = 0;
  
  for (const key of cache.keys()) {
    if (pattern.test(key)) {
      cache.delete(key);
      count++;
      cacheStats.size--;
    }
  }
  
  if (count > 0) {
    logger.debug(`Invalidated ${count} cache entries matching pattern: ${pattern}`);
  }
};

/**
 * Cache middleware factory
 * @param {Object} options - Cache options
 * @param {Number} options.ttl - Time to live in seconds (default: 60)
 * @param {Function} options.keyGenerator - Function to generate cache key (default: req => req.originalUrl)
 * @param {Array} options.methods - HTTP methods to cache (default: ['GET'])
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 60,
    keyGenerator = req => req.originalUrl,
    methods = ['GET']
  } = options;
  
  return (req, res, next) => {
    // Only cache specified methods
    if (!methods.includes(req.method)) {
      return next();
    }
    
    // Generate cache key
    const key = keyGenerator(req);
    
    // Check if we have a cached response
    if (cache.has(key)) {
      const cachedData = cache.get(key);
      
      // Check if the cached data is still valid
      if (cachedData.expiresAt > Date.now()) {
        // Cache hit
        cacheStats.hits++;
        
        // Log cache hit
        logger.debug(`Cache hit for: ${key}`);
        
        // Send cached response
        res.set('X-Cache', 'HIT');
        res.status(cachedData.status).json(cachedData.data);
        return;
      } else {
        // Expired cache entry
        cache.delete(key);
        cacheStats.size--;
      }
    }
    
    // Cache miss
    cacheStats.misses++;
    
    // Store the original json method
    const originalJson = res.json;
    
    // Override the json method to cache the response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const cachedData = {
          data,
          status: res.statusCode,
          expiresAt: Date.now() + (ttl * 1000)
        };
        
        // Store in cache
        cache.set(key, cachedData);
        cacheStats.size++;
        
        // Log cache miss and storage
        logger.debug(`Cache miss for: ${key}, stored in cache`);
        
        // Set cache header
        res.set('X-Cache', 'MISS');
      }
      
      // Call the original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
const getCacheStats = () => ({
  ...cacheStats,
  hitRate: cacheStats.hits + cacheStats.misses > 0 
    ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2) + '%' 
    : '0%'
});

module.exports = {
  cacheMiddleware,
  clearCache,
  invalidateCache,
  invalidateCachePattern,
  getCacheStats
};
