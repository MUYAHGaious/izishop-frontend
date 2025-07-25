import React from 'react';

const LoadingSpinner = ({ size = 'default', className = "" }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`}>
      </div>
    </div>
  );
};

export default LoadingSpinner;