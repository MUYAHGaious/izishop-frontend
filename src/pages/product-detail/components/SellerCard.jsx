import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import ChatInterfaceModal from '../../chat-interface-modal';

const SellerCard = ({ seller }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  const formatResponseTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hr`;
    return `${Math.floor(minutes / 1440)} day`;
  };

  const getSellerBadge = (type) => {
    switch (type) {
      case 'shop':
        return {
          icon: 'Store',
          label: 'Verified Shop',
          color: 'text-teal-700 bg-teal-100'
        };
      case 'individual':
        return {
          icon: 'User',
          label: 'Individual Seller',
          color: 'text-gray-700 bg-gray-100'
        };
      case 'premium':
        return {
          icon: 'Crown',
          label: 'Premium Seller',
          color: 'text-yellow-700 bg-yellow-100'
        };
      default:
        return {
          icon: 'User',
          label: 'Seller',
          color: 'text-gray-600 bg-gray-100'
        };
    }
  };

  const handleContactSeller = () => {
    setIsChatOpen(true);
  };

  const handleViewShop = () => {
    if (seller?.id) {
      navigate(`/shop-profile?id=${seller.id}`);
    }
  };

  const handleFollowShop = () => {
    // TODO: Implement follow shop functionality
    console.log('Follow shop:', seller?.id);
  };

  if (!seller) {
    return (
      <div className="bg-white border border-teal-200 rounded-2xl p-4 shadow-lg">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-teal-100 to-cyan-100 rounded w-3/4"></div>
              <div className="h-3 bg-gradient-to-r from-teal-100 to-cyan-100 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const badge = getSellerBadge(seller.type);

  return (
    <div className="bg-white border border-teal-200 rounded-2xl p-6 space-y-4">
      {/* Seller Header */}
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Image
            src={seller.avatar || '/assets/images/default-avatar.png'}
            alt={seller.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {seller.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {seller.name}
            </h3>
            {seller.isVerified && (
              <Icon name="BadgeCheck" size={16} className="text-teal-600 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
              <Icon name={badge.icon} size={12} className="mr-1" />
              {badge.label}
            </span>
            
            {seller.isOnline && (
              <span className="text-xs text-green-600 font-medium">Online</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {seller.rating && (
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={14} className="text-yellow-400 fill-current" />
                <span className="font-medium">{seller.rating}</span>
                <span>({seller.reviewCount || 0})</span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Icon name="Package" size={14} />
              <span>{seller.productCount || 0} products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Stats - only show if data exists */}
      {(seller.responseRate || seller.responseTime) && (
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-teal-200/50">
          {seller.responseRate && (
            <div className="text-center">
              <div className="text-lg font-bold text-teal-600">
                {seller.responseRate}%
              </div>
              <div className="text-xs text-gray-500">Response Rate</div>
            </div>
          )}

          {seller.responseTime && (
            <div className="text-center">
              <div className="text-lg font-bold text-teal-600">
                {formatResponseTime(seller.responseTime)}
              </div>
              <div className="text-xs text-gray-500">Response Time</div>
            </div>
          )}
        </div>
      )}

      {/* Additional Info */}
      <div className="space-y-2 text-sm">
        {seller.location && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Icon name="MapPin" size={14} className="text-teal-600" />
            <span>{seller.location}</span>
          </div>
        )}
        
        {seller.joinedDate && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Icon name="Calendar" size={14} className="text-teal-600" />
            <span>Joined {seller.joinedDate}</span>
          </div>
        )}
        
        {seller.lastSeen && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Icon name="Clock" size={14} className="text-teal-600" />
            <span>Last seen {seller.lastSeen}</span>
          </div>
        )}
      </div>

      {/* Seller Badges/Achievements */}
      {seller.badges && seller.badges.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Achievements</h4>
          <div className="flex flex-wrap gap-1">
            {seller.badges.map((badge, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700"
              >
                <Icon name={badge.icon} size={12} className="mr-1" />
                {badge.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-teal-200/50">
        <Button 
          className="border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400 w-full py-3 rounded-xl font-medium transition-all duration-300"
          variant="outline" 
          fullWidth 
          onClick={handleViewShop}
        >
          <Icon name="Store" size={16} className="mr-2" />
          View Shop
        </Button>
        
        <Button 
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white w-full py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          variant="default" 
          fullWidth 
          onClick={handleContactSeller}
        >
          <Icon name="MessageCircle" size={16} className="mr-2" />
          Contact Seller
        </Button>
        
        {seller.type === 'shop' && (
          <Button 
            className="text-teal-600 hover:bg-teal-50 w-full py-3 rounded-xl font-medium transition-all duration-300"
            variant="ghost" 
            fullWidth 
            onClick={handleFollowShop}
          >
            <Icon name="Heart" size={16} className="mr-2" />
            Follow Shop
          </Button>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <Icon name="Shield" size={14} className="mr-2 text-teal-600" />
          Trust & Safety
        </h4>
        
        <div className="space-y-1 text-xs text-gray-600">
          {seller.isVerified && (
            <div className="flex items-center space-x-2">
              <Icon name="Check" size={12} className="text-green-500" />
              <span>Identity verified</span>
            </div>
          )}
          
          {seller.hasBusinessLicense && (
            <div className="flex items-center space-x-2">
              <Icon name="Check" size={12} className="text-green-500" />
              <span>Business license verified</span>
            </div>
          )}
          
          {seller.hasReturnPolicy && (
            <div className="flex items-center space-x-2">
              <Icon name="Check" size={12} className="text-green-500" />
              <span>Return policy available</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={12} className="text-green-500" />
            <span>Secure payment protected</span>
          </div>
        </div>
      </div>

      {/* Chat Interface Modal */}
      {isChatOpen && (
        <ChatInterfaceModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          shop={seller}
          currentProduct={null}
        />
      )}
    </div>
  );
};

export default SellerCard;