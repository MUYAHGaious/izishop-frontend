import React from 'react';
import Input from './Input';
import Icon from '../AppIcon';
import { useRealTimeValidation, VALIDATION_STATES } from '../../hooks/useRealTimeValidation';

const ValidatedInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  validationType,
  debounceDelay = 500,
  minLength = 2,
  disabled = false,
  required = false,
  className = "",
  ...props
}) => {
  const {
    validationState,
    message,
    suggestions,
    isValidating,
    isValid,
    isInvalid,
    hasError
  } = useRealTimeValidation(value, validationType, debounceDelay, minLength);

  // Determine validation status for styling
  const getValidationStatus = () => {
    if (!value || value.trim().length < minLength) return null;
    if (isValidating) return 'checking';
    if (isValid) return 'valid';
    if (isInvalid) return 'invalid';
    if (hasError) return 'error';
    return null;
  };

  const validationStatus = getValidationStatus();

  // Get appropriate icon
  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'checking':
        return <Icon name="Loader2" size={16} className="animate-spin text-blue-500" />;
      case 'valid':
        return <Icon name="CheckCircle" size={16} className="text-green-500" />;
      case 'invalid':
        return <Icon name="XCircle" size={16} className="text-red-500" />;
      case 'error':
        return <Icon name="AlertCircle" size={16} className="text-orange-500" />;
      default:
        return null;
    }
  };

  // Get message color
  const getMessageColor = () => {
    switch (validationStatus) {
      case 'checking':
        return 'text-blue-600';
      case 'valid':
        return 'text-green-600';
      case 'invalid':
        return 'text-red-600';
      case 'error':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const event = {
      target: {
        name,
        value: suggestion
      }
    };
    onChange(event);
  };

  return (
    <div className={className}>
      <div className="relative">
        <Input
          label={label}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`pr-10 ${
            validationStatus === 'valid' ? 'border-green-300 focus:border-green-500' :
            validationStatus === 'invalid' ? 'border-red-300 focus:border-red-500' :
            validationStatus === 'error' ? 'border-orange-300 focus:border-orange-500' :
            ''
          }`}
          {...props}
        />
        
        {/* Validation Icon */}
        {getValidationIcon() && (
          <div className="absolute right-3 top-8 flex items-center">
            {getValidationIcon()}
          </div>
        )}
      </div>

      {/* Validation Message */}
      {message && value && value.trim().length >= minLength && (
        <div className={`mt-1 text-sm ${getMessageColor()} flex items-center gap-1`}>
          {message}
        </div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && isInvalid && (
        <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800 font-medium mb-2">
            Try these alternatives:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;