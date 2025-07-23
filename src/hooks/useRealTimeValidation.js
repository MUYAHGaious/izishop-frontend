import { useState, useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';
import api from '../services/api';

/**
 * Validation states
 */
export const VALIDATION_STATES = {
  IDLE: 'idle',
  CHECKING: 'checking', 
  VALID: 'valid',
  INVALID: 'invalid',
  ERROR: 'error'
};

/**
 * Custom hook for real-time validation with debouncing and caching
 * @param {string} value - The value to validate
 * @param {string} validationType - Type of validation ('email' or 'shopName')
 * @param {number} delay - Debounce delay in milliseconds (default: 500)
 * @param {number} minLength - Minimum length before validation starts (default: 2)
 * @returns {object} - Validation state and helper functions
 */
export const useRealTimeValidation = (
  value, 
  validationType, 
  delay = 500, 
  minLength = 2
) => {
  const [validationState, setValidationState] = useState(VALIDATION_STATES.IDLE);
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const debouncedValue = useDebounce(value, delay);
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Clean value and check if validation should run
  const shouldValidate = (val) => {
    if (!val || typeof val !== 'string') return false;
    const cleaned = val.trim();
    return cleaned.length >= minLength;
  };

  // Get validation function based on type
  const getValidationFunction = (type) => {
    switch (type) {
      case 'email':
        return (email, options) => api.checkEmailAvailability(email, options);
      case 'shopName':
        return (name, options) => api.checkShopNameAvailability(name, options);
      case 'phone':
        return (phone, options) => api.checkPhoneAvailability(phone, options);
      case 'shopPhone':
        return (phone, options) => api.checkShopPhoneAvailability(phone, options);
      case 'businessLicense':
        return (license, options) => api.checkBusinessLicenseAvailability(license, options);
      default:
        throw new Error(`Unsupported validation type: ${type}`);
    }
  };

  // Validate function
  const validateValue = async (val) => {
    const cleanValue = val.trim();
    
    // Check cache first
    const cacheKey = `${validationType}:${cleanValue.toLowerCase()}`;
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      setValidationState(cached.available ? VALIDATION_STATES.VALID : VALIDATION_STATES.INVALID);
      setMessage(cached.message);
      setSuggestions(cached.suggestions || []);
      return;
    }

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      setValidationState(VALIDATION_STATES.CHECKING);
      setMessage('Checking availability...');
      setSuggestions([]);

      const validationFn = getValidationFunction(validationType);
      const result = await validationFn(cleanValue, {
        signal: abortControllerRef.current.signal
      });

      // Cache the result
      cacheRef.current.set(cacheKey, result);
      
      // Limit cache size to prevent memory issues
      if (cacheRef.current.size > 100) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      setValidationState(result.available ? VALIDATION_STATES.VALID : VALIDATION_STATES.INVALID);
      setMessage(result.message);
      setSuggestions(result.suggestions || []);

    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      
      console.error('Validation error:', error);
      setValidationState(VALIDATION_STATES.ERROR);
      setMessage('Unable to check availability');
      setSuggestions([]);
    }
  };

  // Effect to trigger validation
  useEffect(() => {
    if (!shouldValidate(debouncedValue)) {
      setValidationState(VALIDATION_STATES.IDLE);
      setMessage('');
      setSuggestions([]);
      return;
    }

    validateValue(debouncedValue);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedValue, validationType]);

  // Clear cache function
  const clearCache = () => {
    cacheRef.current.clear();
  };

  // Manual validation trigger
  const revalidate = () => {
    if (shouldValidate(value)) {
      const cacheKey = `${validationType}:${value.trim().toLowerCase()}`;
      cacheRef.current.delete(cacheKey);
      validateValue(value.trim());
    }
  };

  return {
    validationState,
    message,
    suggestions,
    isValidating: validationState === VALIDATION_STATES.CHECKING,
    isValid: validationState === VALIDATION_STATES.VALID,
    isInvalid: validationState === VALIDATION_STATES.INVALID,
    hasError: validationState === VALIDATION_STATES.ERROR,
    clearCache,
    revalidate
  };
};

export default useRealTimeValidation;