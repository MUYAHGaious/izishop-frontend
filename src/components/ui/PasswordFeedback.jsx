import React from 'react';
import Icon from '../AppIcon';

const PasswordFeedback = ({ password, showOnlyOnError = false, hasError = false }) => {
  // Only show if explicitly requested or there's an error
  if (showOnlyOnError && !hasError) return null;
  
  // Don't show for empty passwords
  if (!password || password.length === 0) return null;

  // Password criteria
  const criteria = [
    { 
      test: password.length >= 8, 
      text: 'At least 8 characters',
      icon: password.length >= 8 ? 'CheckCircle' : 'XCircle'
    },
    { 
      test: /[a-z]/.test(password), 
      text: 'One lowercase letter',
      icon: /[a-z]/.test(password) ? 'CheckCircle' : 'XCircle'
    },
    { 
      test: /[A-Z]/.test(password), 
      text: 'One uppercase letter',
      icon: /[A-Z]/.test(password) ? 'CheckCircle' : 'XCircle'
    },
    { 
      test: /[0-9]/.test(password), 
      text: 'One number',
      icon: /[0-9]/.test(password) ? 'CheckCircle' : 'XCircle'
    },
    { 
      test: /[^A-Za-z0-9]/.test(password), 
      text: 'One special character',
      icon: /[^A-Za-z0-9]/.test(password) ? 'CheckCircle' : 'XCircle'
    }
  ];

  const passedCriteria = criteria.filter(c => c.test).length;
  const totalCriteria = criteria.length;

  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="Info" size={14} className="text-blue-600" />
        <span className="text-sm font-medium text-blue-800">
          Password Requirements ({passedCriteria}/{totalCriteria})
        </span>
      </div>
      
      <div className="space-y-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center gap-2">
            <Icon 
              name={criterion.icon} 
              size={12} 
              className={criterion.test ? 'text-green-600' : 'text-gray-400'} 
            />
            <span className={`text-xs ${criterion.test ? 'text-green-700' : 'text-gray-600'}`}>
              {criterion.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordFeedback;