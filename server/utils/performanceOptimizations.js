/**
 * Performance optimization utilities for the server
 */
const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Optimize MongoDB queries
 * @param {Object} query - Mongoose query object
 * @param {Object} options - Optimization options
 * @returns {Object} - Optimized query
 */
exports.optimizeQuery = (query, options = {}) => {
  // Apply lean() to get plain JavaScript objects instead of Mongoose documents
  if (options.lean !== false) {
    query = query.lean();
  }
  
  // Apply select() to only fetch needed fields
  if (options.fields && Array.isArray(options.fields) && options.fields.length > 0) {
    query = query.select(options.fields.join(' '));
  }
  
  // Apply pagination
  if (options.page && options.limit) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
  } else if (options.limit) {
    query = query.limit(parseInt(options.limit));
  }
  
  return query;
};

/**
 * Create compound indexes for frequently used queries
 * @param {Object} model - Mongoose model
 * @param {Array} indexes - Array of index definitions
 */
exports.createCompoundIndexes = (model, indexes) => {
  if (!model || !indexes || !Array.isArray(indexes)) {
    return;
  }
  
  indexes.forEach(index => {
    model.collection.createIndex(index.fields, index.options || {})
      .then(() => {
        logger.info(`Created index on ${model.modelName}: ${JSON.stringify(index.fields)}`);
      })
      .catch(err => {
        logger.error(`Error creating index on ${model.modelName}: ${err.message}`);
      });
  });
};

/**
 * Batch database operations for better performance
 * @param {Array} operations - Array of operations to perform
 * @param {Object} options - Batch options
 * @returns {Promise} - Promise resolving to operation results
 */
exports.batchDatabaseOperations = async (operations, options = {}) => {
  if (!operations || !Array.isArray(operations) || operations.length === 0) {
    return [];
  }
  
  const batchSize = options.batchSize || 100;
  const results = [];
  
  // Process operations in batches
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchPromises = batch.map(op => op());
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Cache expensive database queries
 * @param {Function} queryFn - Function that returns a query
 * @param {Object} options - Cache options
 * @returns {Function} - Function that returns cached results or executes query
 */
exports.cacheQuery = (queryFn, options = {}) => {
  const cache = new Map();
  const ttl = options.ttl || 60000; // Default TTL: 1 minute
  
  return async function cachedQuery(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      const cached = cache.get(key);
      
      // Check if cache is still valid
      if (Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }
    }
    
    // Execute query and cache results
    const data = await queryFn(...args);
    
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  };
};

/**
 * Optimize aggregation pipelines
 * @param {Array} pipeline - MongoDB aggregation pipeline
 * @param {Object} options - Optimization options
 * @returns {Array} - Optimized pipeline
 */
exports.optimizeAggregation = (pipeline, options = {}) => {
  if (!pipeline || !Array.isArray(pipeline)) {
    return pipeline;
  }
  
  // Add $limit stage early in the pipeline if specified
  if (options.limit && typeof options.limit === 'number') {
    // Find the earliest possible position to add $limit
    // (after $match and $sort stages, but before processing stages)
    let insertPosition = 0;
    
    for (let i = 0; i < pipeline.length; i++) {
      const stage = pipeline[i];
      
      if (stage.$match || stage.$sort) {
        insertPosition = i + 1;
      } else if (stage.$group || stage.$project || stage.$unwind) {
        break;
      }
    }
    
    pipeline.splice(insertPosition, 0, { $limit: options.limit });
  }
  
  // Add $project stage to limit fields if specified
  if (options.fields && Array.isArray(options.fields) && options.fields.length > 0) {
    const project = {};
    
    options.fields.forEach(field => {
      project[field] = 1;
    });
    
    pipeline.push({ $project: project });
  }
  
  return pipeline;
};

/**
 * Monitor database query performance
 * @param {Function} queryFn - Function that executes a query
 * @param {string} queryName - Name of the query for logging
 * @returns {Function} - Function that executes and monitors the query
 */
exports.monitorQueryPerformance = (queryFn, queryName) => {
  return async function monitoredQuery(...args) {
    const startTime = Date.now();
    
    try {
      const result = await queryFn(...args);
      const duration = Date.now() - startTime;
      
      // Log slow queries (> 100ms)
      if (duration > 100) {
        logger.warn(`Slow query [${queryName}]: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Query error [${queryName}] after ${duration}ms: ${error.message}`);
      throw error;
    }
  };
};
