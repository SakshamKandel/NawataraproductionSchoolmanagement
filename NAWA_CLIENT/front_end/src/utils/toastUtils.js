/**
 * Safe toast notifications to prevent React error #31
 */
import toast from 'react-hot-toast';
import { renderError } from './errorUtils.js';

/**
 * Safely show success toast
 */
export const showSuccessToast = (message) => {
  const safeMessage = renderError(message) || 'Success!';
  toast.success(safeMessage);
};

/**
 * Safely show error toast
 */
export const showErrorToast = (error) => {
  const safeMessage = renderError(error) || 'An error occurred!';
  toast.error(safeMessage);
};

/**
 * Safely show info toast
 */
export const showInfoToast = (message) => {
  const safeMessage = renderError(message) || 'Info';
  toast(safeMessage);
};

/**
 * Safely show loading toast
 */
export const showLoadingToast = (message) => {
  const safeMessage = renderError(message) || 'Loading...';
  return toast.loading(safeMessage);
};
