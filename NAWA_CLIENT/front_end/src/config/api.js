/**
 * API Configuration
 * This file centralizes the API configuration using environment variables
 */

// API configuration from environment variables only
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Validate that API URL is provided
if (!API_BASE_URL || API_BASE_URL.trim() === '') {
  console.error('❌ VITE_API_URL environment variable is required but not set!');
  console.error('Available environment variables:', import.meta.env);
  throw new Error('VITE_API_URL environment variable is required. Please check your .env file.');
}

// Ensure the API URL has the correct format
const normalizedApiUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

// Debug logging (only in development)
if (import.meta.env.MODE === 'development') {
  console.log('🔧 API Configuration Debug:', JSON.stringify({
    'VITE_API_URL': import.meta.env.VITE_API_URL,
    'MODE': import.meta.env.MODE,
    'Final API_BASE_URL': normalizedApiUrl
  }, null, 2));
}

// Default request configuration
const DEFAULT_CONFIG = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
};

/**
 * Builds the full API URL for a given endpoint
 * @param {string} endpoint - The API endpoint (e.g., "/getTeachers")
 * @returns {string} The full API URL
 */
export const getApiUrl = (endpoint = '') => {
  // If no endpoint provided, return base URL
  if (!endpoint || endpoint.trim() === '') {
    return normalizedApiUrl;
  }
  
  // Make sure endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // For production with shared domain, ensure /api prefix is only added once
  if (isProduction && normalizedApiUrl.endsWith('/api') && formattedEndpoint.startsWith('/api/')) {
    // Remove /api prefix from endpoint to avoid duplication
    const endpointWithoutApiPrefix = formattedEndpoint.substring(4);
    return `${normalizedApiUrl}${endpointWithoutApiPrefix}`;
  }
  
  // For production with shared domain, ensure all routes have /api prefix
  if (isProduction && normalizedApiUrl.endsWith('/api') && !formattedEndpoint.startsWith('/api/')) {
    return `${normalizedApiUrl}${formattedEndpoint}`;
  }
  
  return `${normalizedApiUrl}${formattedEndpoint}`;
};

/**
 * Environment information
 */
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';

/**
 * School information
 */
export const SCHOOL_NAME = import.meta.env.VITE_APP_NAME || 'Nawa Tara English School';

export default {
  API_BASE_URL: normalizedApiUrl,
  DEFAULT_CONFIG,
  getApiUrl,
  isProduction,
  isDevelopment,
  SCHOOL_NAME
}; 