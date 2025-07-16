import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ShopInfo = ({ shop }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={14}
        className={index < Math.floor(rating) ? 'text-accent fill-current' : 'text-border'}
      />
    ));
  };

  const formatJoinDate = (date) => {
    return new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Shop Information</h3>
        <Link to="/shop-profile">
          <Button variant="outline" size="sm">
            Visit Shop
          </Button>
        </Link>
      </div>

      <div className="flex items-start space-x-4">
        <Image
          src={shop.logo}
          alt={shop.name}
          className="w-16 h-16 rounded-lg object-cover border border-border"
        />
        
        <div className="flex-1">
          <Link 
            to="/shop-profile"
            className="text-lg font-semibold text-text-primary hover:text-primary transition-colors"
          >
            {shop.name}
          </Link>
          
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center space-x-1">
              {renderStars(shop.rating)}
            </div>
            <span className="text-sm text-text-secondary">
              {shop.rating.toFixed(1)} ({shop.reviewCount} reviews)
            </span>
          </div>

          <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
            <div className="flex items-center space-x-1">
              <Icon name="Package" size={14} />
              <span>{shop.productCount} products</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>Joined {formatJoinDate(shop.joinDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-semibold text-text-primary">
            {shop.responseRate}%
          </div>
          <div className="text-xs text-text-secondary">Response Rate</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-text-primary">
            {shop.responseTime}
          </div>
          <div className="text-xs text-text-secondary">Response Time</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-text-primary">
            {shop.followers}
          </div>
          <div className="text-xs text-text-secondary">Followers</div>
        </div>
      </div>

      {/* Shop Actions */}
      <div className="flex space-x-2 pt-2">
        <Button variant="outline" size="sm" fullWidth iconName="MessageCircle" iconPosition="left">
          Chat Now
        </Button>
        <Button variant="outline" size="sm" fullWidth iconName="UserPlus" iconPosition="left">
          Follow
        </Button>
      </div>

      {/* Shop Badges */}
      {shop.badges && shop.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {shop.badges.map((badge, index) => (
            <div
              key={index}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-success/10 text-success text-xs font-medium rounded"
            >
              <Icon name="Shield" size={12} />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopInfo;