/**
 * Error handling utilities for React components
 * Prevents React error #31 by ensuring only strings are rendered
 */

/**
 * Safely converts any value to a string for rendering
 * @param {any} value - The value to convert
 * @returns {string} A safe string representation
 */
export const safeStringify = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (typeof value === 'object') {
    // If it's an Error object, return the message
    if (value instanceof Error) {
      return value.message || 'An error occurred';
    }
    
    // If it has a message property, use that
    if (value.message && typeof value.message === 'string') {
      return value.message;
    }
    
    // If it has an error property, use that
    if (value.error && typeof value.error === 'string') {
      return value.error;
    }
    
    // For other objects, try to stringify safely
    try {
      return JSON.stringify(value);
    } catch (err) {
      return 'Unable to display error details';
    }
  }
  
  return String(value);
};

/**
 * Safely renders an error message
 * @param {any} error - The error to render
 * @returns {string} A safe error message
 */
export const renderError = (error) => {
  return safeStringify(error);
};

/**
 * Higher-order component to wrap error-prone components
 * Note: This should be used in .jsx files with proper React import
 * @param {React.Component} Component - The component to wrap
 * @returns {React.Component} The wrapped component
 */
export const createErrorBoundaryWrapper = (Component) => {
  // This function returns a component factory that can be used in JSX files
  return (props) => {
    try {
      return Component(props);
    } catch (error) {
      console.error('Component error:', error);
      return null; // Return null instead of JSX to avoid parse errors
    }
  };
};
