import React from 'react';
import { useOnlineStatus } from '../../contexts/OnlineStatusContext';
import Icon from '../AppIcon';

const OnlineStatusIndicator = ({ 
  shopId, 
  shopOwnerId, 
  size = 'sm', 
  showText = true, 
  showIcon = true,
  className = '' 
}) => {
  const { getShopOnlineStatus, isConnected } = useOnlineStatus();
  
  if (!isConnected || !shopOwnerId) {
    return null;
  }

  const status = getShopOnlineStatus(shopId, shopOwnerId);
  
  const sizeClasses = {
    xs: {
      indicator: 'w-2 h-2',
      text: 'text-xs',
      icon: 12
    },
    sm: {
      indicator: 'w-3 h-3',
      text: 'text-sm',
      icon: 14
    },
    md: {
      indicator: 'w-4 h-4',
      text: 'text-base',
      icon: 16
    },
    lg: {
      indicator: 'w-5 h-5',
      text: 'text-lg',
      icon: 18
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {showIcon && (
        <div className="relative">
          <div 
            className={`${currentSize.indicator} ${status.indicator} rounded-full`}
            title={status.display}
          />
          {status.status === 'online' && (
            <div 
              className={`absolute inset-0 ${status.indicator} rounded-full animate-ping opacity-75`}
            />
          )}
        </div>
      )}
      
      {showText && (
        <span className={`${currentSize.text} ${status.color} font-medium`}>
          {status.display}
        </span>
      )}
    </div>
  );
};

// Compact version for use in cards/lists
export const OnlineStatusBadge = ({ shopId, shopOwnerId, className = '' }) => {
  const { getShopOnlineStatus, isConnected } = useOnlineStatus();
  
  if (!isConnected || !shopOwnerId) {
    return null;
  }

  const status = getShopOnlineStatus(shopId, shopOwnerId);
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      status.status === 'online' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-600'
    } ${className}`}>
      <div className={`w-2 h-2 ${status.indicator} rounded-full`} />
      <span>{status.status === 'online' ? 'Online' : 'Offline'}</span>
    </div>
  );
};

// Shop card version with tooltip
export const ShopOnlineStatus = ({ shop, size = 'sm', className = '' }) => {
  const { getShopOnlineStatus, isConnected } = useOnlineStatus();
  
  if (!isConnected || !shop?.owner_id) {
    return null;
  }

  const status = getShopOnlineStatus(shop.id, shop.owner_id);
  
  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      title={`Shop owner is ${status.display.toLowerCase()}`}
    >
      <div className="relative">
        <div className={`w-3 h-3 ${status.indicator} rounded-full`} />
        {status.status === 'online' && (
          <div className={`absolute inset-0 ${status.indicator} rounded-full animate-ping opacity-75`} />
        )}
      </div>
      <span className={`text-sm ${status.color}`}>
        {status.status === 'online' ? 'Online now' : status.display}
      </span>
    </div>
  );
};

// Admin dashboard version with more details
export const AdminOnlineStatus = ({ user, className = '' }) => {
  const { isUserOnline, formatLastSeen } = useOnlineStatus();
  
  const isOnline = isUserOnline(user.id);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className={`w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full`} />
        {isOnline && (
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
        )}
      </div>
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {!isOnline && (
          <span className="text-xs text-gray-500">
            Last seen {formatLastSeen(user.id)}
          </span>
        )}
      </div>
    </div>
  );
};

export default OnlineStatusIndicator;