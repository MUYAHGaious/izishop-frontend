import { useState, useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';
import api from '../services/api';

/**
 * Login validation states
 */
export const LOGIN_VALIDATION_STATES = {
  IDLE: 'idle',
  CHECKING: 'checking',
  FOUND: 'found',        // Email exists - good for login
  NOT_FOUND: 'not_found', // Email doesn't exist - suggest register
  ERROR: 'error'
};

/**
 * Custom hook for login email validation
 * @param {string} email - The email to validate
 * @param {number} delay - Debounce delay in milliseconds (default: 700)
 * @param {number} minLength - Minimum length before validation starts (default: 5)
 * @returns {object} - Validation state and helper functions
 */
export const useLoginValidation = (
  email, 
  delay = 700, 
  minLength = 5
) => {
  const [validationState, setValidationState] = useState(LOGIN_VALIDATION_STATES.IDLE);
  const [message, setMessage] = useState('');
  
  const debouncedEmail = useDebounce(email, delay);
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Email format validation
  const isValidEmailFormat = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Check if validation should run
  const shouldValidate = (email) => {
    if (!email || typeof email !== 'string') return false;
    const cleaned = email.trim();
    return cleaned.length >= minLength && isValidEmailFormat(cleaned);
  };

  // Validate email existence
  const validateEmail = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check cache first
    const cacheKey = `login_email:${cleanEmail}`;
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      setValidationState(cached.accountExists ? LOGIN_VALIDATION_STATES.FOUND : LOGIN_VALIDATION_STATES.NOT_FOUND);
      setMessage(cached.message);
      return;
    }

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      setValidationState(LOGIN_VALIDATION_STATES.CHECKING);
      setMessage('Checking account...');

      const result = await api.checkEmailAvailability(cleanEmail, {
        signal: abortControllerRef.current.signal
      });

      // For login context: 
      // - If email is "available" for registration = account NOT found (bad for login)
      // - If email is "not available" for registration = account EXISTS (good for login)
      const accountExists = !result.available;
      
      const loginResult = {
        accountExists: accountExists,
        message: accountExists 
          ? "Account found" 
          : "No account found with this email"
      };
      
      cacheRef.current.set(cacheKey, loginResult);
      
      // Limit cache size
      if (cacheRef.current.size > 50) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      // Set the correct validation state
      setValidationState(accountExists ? LOGIN_VALIDATION_STATES.FOUND : LOGIN_VALIDATION_STATES.NOT_FOUND);
      setMessage(loginResult.message);

    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      
      console.error('Email validation error:', error);
      setValidationState(LOGIN_VALIDATION_STATES.ERROR);
      setMessage('Unable to verify account');
    }
  };

  // Effect to trigger validation
  useEffect(() => {
    if (!shouldValidate(debouncedEmail)) {
      setValidationState(LOGIN_VALIDATION_STATES.IDLE);
      setMessage('');
      return;
    }

    validateEmail(debouncedEmail);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedEmail]);

  // Clear cache function
  const clearCache = () => {
    cacheRef.current.clear();
  };

  // Manual validation trigger
  const revalidate = () => {
    if (shouldValidate(email)) {
      const cacheKey = `login_email:${email.trim().toLowerCase()}`;
      cacheRef.current.delete(cacheKey);
      validateEmail(email.trim());
    }
  };

  return {
    validationState,
    message,
    isValidating: validationState === LOGIN_VALIDATION_STATES.CHECKING,
    accountFound: validationState === LOGIN_VALIDATION_STATES.FOUND,
    accountNotFound: validationState === LOGIN_VALIDATION_STATES.NOT_FOUND,
    hasError: validationState === LOGIN_VALIDATION_STATES.ERROR,
    clearCache,
    revalidate
  };
};

export default useLoginValidation;