import React from 'react';
import { Link } from 'react-router-dom';
import Input from './Input';
import Icon from '../AppIcon';
import { useLoginValidation, LOGIN_VALIDATION_STATES } from '../../hooks/useLoginValidation';

const LoginEmailInput = ({
  label = "Email Address",
  name = "email",
  value,
  onChange,
  placeholder = "Enter your email",
  debounceDelay = 700,
  minLength = 5,
  disabled = false,
  required = false,
  className = "",
  onSwitchToRegister = null,
  ...props
}) => {
  const {
    validationState,
    message,
    isValidating,
    accountFound,
    accountNotFound,
    hasError
  } = useLoginValidation(value, debounceDelay, minLength);

  // Determine validation status for styling
  const getValidationStatus = () => {
    if (!value || value.trim().length < minLength) return null;
    if (isValidating) return 'checking';
    if (accountFound) return 'found';
    if (accountNotFound) return 'not_found';
    if (hasError) return 'error';
    return null;
  };

  const validationStatus = getValidationStatus();

  // Get appropriate icon
  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'checking':
        return <Icon name="Loader2" size={16} className="animate-spin text-blue-500" />;
      case 'found':
        return <Icon name="CheckCircle" size={16} className="text-green-500" />;
      case 'not_found':
        return <Icon name="AlertCircle" size={16} className="text-orange-500" />;
      case 'error':
        return <Icon name="XCircle" size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  // Get message color and style
  const getMessageColor = () => {
    switch (validationStatus) {
      case 'checking':
        return 'text-blue-600';
      case 'found':
        return 'text-green-600';
      case 'not_found':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Check if email format is valid
  const isValidEmailFormat = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const showValidation = value && value.trim().length >= minLength && isValidEmailFormat(value);


  return (
    <div className={className}>
      <div className="relative">
        <Input
          label={label}
          type="email"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`pr-10 ${
            validationStatus === 'found' ? 'border-green-300 focus:border-green-500' :
            validationStatus === 'not_found' ? 'border-orange-300 focus:border-orange-500' :
            validationStatus === 'error' ? 'border-red-300 focus:border-red-500' :
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
      {message && showValidation && (
        <div className={`mt-1 text-sm ${getMessageColor()} flex items-center gap-1`}>
          {message}
        </div>
      )}

      {/* Registration Suggestion */}
      {accountNotFound && showValidation && (
        <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="UserPlus" size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-orange-800 font-medium">
                No account found with this email
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Would you like to{" "}
                {onSwitchToRegister ? (
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="font-medium text-orange-800 hover:text-orange-900 underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    create a new account
                  </button>
                ) : (
                  <Link 
                    to="/auth?tab=register" 
                    className="font-medium text-orange-800 hover:text-orange-900 underline"
                  >
                    create a new account
                  </Link>
                )}
                {" "}instead?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Account Found Confirmation */}
      {accountFound && showValidation && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Account found. Please enter your password to continue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginEmailInput;