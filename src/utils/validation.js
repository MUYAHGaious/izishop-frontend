// Comprehensive validation utilities for form inputs

export const ValidationError = class extends Error {
  constructor(field, message) {
    super(message);
    this.field = field;
    this.name = 'ValidationError';
  }
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }
  
  const cleanEmail = email.trim();
  
  if (cleanEmail.length === 0) {
    return 'Email is required';
  }
  
  if (cleanEmail.length > 254) {
    return 'Email address is too long (maximum 254 characters)';
  }
  
  if (!emailRegex.test(cleanEmail)) {
    return 'Please enter a valid email address (e.g., user@example.com)';
  }
  
  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const domain = cleanEmail.split('@')[1];
  const suggestions = {
    'gmail.co': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahoo.co': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'hotmai.com': 'hotmail.com',
    'outlook.co': 'outlook.com'
  };
  
  if (suggestions[domain]) {
    return `Did you mean ${cleanEmail.replace(domain, suggestions[domain])}?`;
  }
  
  return null;
};

// Phone number validation (Cameroon focused)
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return 'Phone number is required';
  }
  
  const cleanPhone = phone.replace(/[-\s()]/g, '');
  
  if (cleanPhone.length === 0) {
    return 'Phone number is required';
  }
  
  // Cameroon phone number patterns
  const cameroonPatterns = [
    /^\+237[2-9]\d{8}$/, // +237 + 9 digits starting with 2-9
    /^237[2-9]\d{8}$/, // 237 + 9 digits starting with 2-9
    /^[2-9]\d{8}$/ // 9 digits starting with 2-9 (local format)
  ];
  
  // International format (basic)
  const internationalPattern = /^\+?[1-9]\d{1,14}$/;
  
  // Check Cameroon patterns first
  const isCameroonNumber = cameroonPatterns.some(pattern => pattern.test(cleanPhone));
  
  if (cleanPhone.startsWith('+237') || cleanPhone.startsWith('237') || 
      (cleanPhone.length === 9 && /^[2-9]/.test(cleanPhone))) {
    if (!isCameroonNumber) {
      return 'Invalid Cameroon phone number. Format: +237 6XX XXX XXX';
    }
  } else if (!internationalPattern.test(cleanPhone)) {
    return 'Please enter a valid phone number';
  }
  
  return null;
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name || typeof name !== 'string') {
    return `${fieldName} is required`;
  }
  
  const cleanName = name.trim();
  
  if (cleanName.length === 0) {
    return `${fieldName} is required`;
  }
  
  if (cleanName.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  
  if (cleanName.length > 50) {
    return `${fieldName} must be less than 50 characters long`;
  }
  
  if (!/^[a-zA-Z\s'-\.]+$/.test(cleanName)) {
    return `${fieldName} can only contain letters, spaces, apostrophes, hyphens, and periods`;
  }
  
  // Check for suspicious patterns
  if (/^\s+|\s+$/.test(cleanName)) {
    return `${fieldName} cannot start or end with spaces`;
  }
  
  if (/\s{2,}/.test(cleanName)) {
    return `${fieldName} cannot contain multiple consecutive spaces`;
  }
  
  return null;
};

// Password validation
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (password.length > 128) {
    return 'Password must be less than 128 characters long';
  }
  
  const requirements = [];
  
  if (!/(?=.*[a-z])/.test(password)) {
    requirements.push('one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    requirements.push('one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    requirements.push('one number');
  }
  
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    requirements.push('one special character');
  }
  
  if (requirements.length > 0) {
    return `Password must contain at least ${requirements.join(', ')}`;
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty123', 'abc123456', 
    'password123', 'admin123', 'welcome123'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return 'This password is too common. Please choose a stronger password';
  }
  
  // Check for personal information patterns (basic)
  if (/(.)\1{2,}/.test(password)) {
    return 'Password cannot contain repeated characters (e.g., aaa, 111)';
  }
  
  return null;
};

// Password strength calculation
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length bonus
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;
  
  // Character type bonuses
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 15;
  
  // Complexity bonuses
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) strength += 10;
  
  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) strength -= 15;
  if (/123|abc|qwe/i.test(password)) strength -= 10;
  
  return Math.max(0, Math.min(100, strength));
};

// Generic field validation
export const validateField = (value, type, options = {}) => {
  const { required = false, minLength, maxLength, pattern, customValidator } = options;
  
  // Required check
  if (required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
    return `${options.fieldName || 'This field'} is required`;
  }
  
  // Skip further validation if field is not required and empty
  if (!required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
    return null;
  }
  
  // Type-specific validation
  switch (type) {
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'name':
      return validateName(value, options.fieldName);
    case 'password':
      return validatePassword(value);
    case 'text':
      // Generic text validation
      if (minLength && value.length < minLength) {
        return `${options.fieldName || 'This field'} must be at least ${minLength} characters long`;
      }
      if (maxLength && value.length > maxLength) {
        return `${options.fieldName || 'This field'} must be less than ${maxLength} characters long`;
      }
      if (pattern && !pattern.test(value)) {
        return options.patternMessage || `${options.fieldName || 'This field'} format is invalid`;
      }
      break;
  }
  
  // Custom validator
  if (customValidator && typeof customValidator === 'function') {
    return customValidator(value);
  }
  
  return null;
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];
    
    const error = validateField(value, rules.type, {
      ...rules,
      fieldName: rules.label || fieldName
    });
    
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Input sanitization
export const sanitizeInput = (value, type) => {
  if (!value || typeof value !== 'string') return value;
  
  switch (type) {
    case 'email':
      return value.toLowerCase().trim();
    case 'phone':
      return value.replace(/[^\d+\s-()]/g, '');
    case 'name':
      return value.trim().replace(/[<>\"'/\\]/g, '');
    case 'text':
      return value.trim().replace(/[<>\"']/g, '');
    default:
      return value.trim();
  }
};

// Format helpers
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Cameroon format
  if (cleaned.startsWith('237') && cleaned.length === 12) {
    return `+237 ${cleaned.slice(3, 4)}${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  if (cleaned.length === 9 && /^[2-9]/.test(cleaned)) {
    return `${cleaned.slice(0, 1)}${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};

export default {
  validateEmail,
  validatePhone,
  validateName,
  validatePassword,
  calculatePasswordStrength,
  validateField,
  validateForm,
  sanitizeInput,
  formatPhone,
  ValidationError
};