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
          color: 'text-primary bg-primary/10'
        };
      case 'casual':
        return {
          icon: 'User',
          label: 'Casual Seller',
          color: 'text-secondary bg-secondary/10'
        };
      case 'premium':
        return {
          icon: 'Crown',
          label: 'Premium Seller',
          color: 'text-warning bg-warning/10'
        };
      default:
        return {
          icon: 'User',
          label: 'Seller',
          color: 'text-text-secondary bg-muted'
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
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const badge = getSellerBadge(seller.type);

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      {/* Seller Header */}
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Image
            src={seller.avatar || '/assets/images/default-avatar.png'}
            alt={seller.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {seller.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-surface rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {seller.name}
            </h3>
            {seller.isVerified && (
              <Icon name="BadgeCheck" size={16} className="text-primary flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
              <Icon name={badge.icon} size={12} className="mr-1" />
              {badge.label}
            </span>
            
            {seller.isOnline && (
              <span className="text-xs text-success font-medium">Online</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={14} className="text-warning fill-current" />
              <span className="font-medium">{seller.rating}</span>
              <span>({seller.reviewCount})</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Icon name="Package" size={14} />
              <span>{seller.productCount} products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Stats */}
      <div className="grid grid-cols-2 gap-4 py-3 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">
            {seller.responseRate}%
          </div>
          <div className="text-xs text-text-secondary">Response Rate</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">
            {formatResponseTime(seller.responseTime)}
          </div>
          <div className="text-xs text-text-secondary">Response Time</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-2 text-sm">
        {seller.location && (
          <div className="flex items-center space-x-2 text-text-secondary">
            <Icon name="MapPin" size={14} />
            <span>{seller.location}</span>
          </div>
        )}
        
        {seller.joinedDate && (
          <div className="flex items-center space-x-2 text-text-secondary">
            <Icon name="Calendar" size={14} />
            <span>Joined {seller.joinedDate}</span>
          </div>
        )}
        
        {seller.lastSeen && (
          <div className="flex items-center space-x-2 text-text-secondary">
            <Icon name="Clock" size={14} />
            <span>Last seen {seller.lastSeen}</span>
          </div>
        )}
      </div>

      {/* Seller Badges/Achievements */}
      {seller.badges && seller.badges.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Achievements</h4>
          <div className="flex flex-wrap gap-1">
            {seller.badges.map((badge, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent"
              >
                <Icon name={badge.icon} size={12} className="mr-1" />
                {badge.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-border">
        <Button variant="outline" fullWidth onClick={handleViewShop}>
          <Icon name="Store" size={16} className="mr-2" />
          View Shop
        </Button>
        
        <Button variant="default" fullWidth onClick={handleContactSeller}>
          <Icon name="MessageCircle" size={16} className="mr-2" />
          Contact Seller
        </Button>
        
        {seller.type === 'shop' && (
          <Button variant="ghost" fullWidth onClick={handleFollowShop}>
            <Icon name="Heart" size={16} className="mr-2" />
            Follow Shop
          </Button>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <h4 className="text-sm font-medium text-foreground flex items-center">
          <Icon name="Shield" size={14} className="mr-2" />
          Trust & Safety
        </h4>
        
        <div className="space-y-1 text-xs text-text-secondary">
          {seller.isVerified && (
            <div className="flex items-center space-x-2">
              <Icon name="Check" size={12} className="text-success" />
              <span>Identity verified</span>
            </div>
          )}
          
          {seller.hasBusinessLicense && (
            <div className="flex items-center space-x-2">
              <Icon name="Check" size={12} className="text-success" />
              <span>Business license verified</span>
            </div>
          )}
          
          {seller.hasReturnPolicy && (
            <div className="flex items-center space-x-2">
              <Icon name="Check" size={12} className="text-success" />
              <span>Return policy available</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={12} className="text-success" />
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