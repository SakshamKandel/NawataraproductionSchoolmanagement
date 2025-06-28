/**
 * Safe form error rendering utility
 * Prevents React error #31 when rendering form validation errors
 */
import { renderError } from './errorUtils.js';

/**
 * Safely renders form field errors
 * @param {object} errors - The errors object from react-hook-form
 * @param {string} fieldName - The field name to get error for
 * @returns {string} Safe error message or empty string
 */
export const getFieldError = (errors, fieldName) => {
  if (!errors || !fieldName) return '';
  
  const fieldError = errors[fieldName];
  if (!fieldError) return '';
  
  // If it's a react-hook-form error object, get the message
  if (fieldError.message) {
    return renderError(fieldError.message);
  }
  
  // Otherwise, try to stringify safely
  return renderError(fieldError);
};

/**
 * Component to safely render form field errors
 * Note: This should be imported and used in JSX files
 */
export const createFieldErrorComponent = () => {
  return ({ errors, fieldName, className = "mt-1 text-sm text-red-600" }) => {
    const errorMessage = getFieldError(errors, fieldName);
    
    if (!errorMessage) return null;
    
    // Return a plain object that can be used to create elements
    return {
      type: 'p',
      className,
      children: errorMessage
    };
  };
};
