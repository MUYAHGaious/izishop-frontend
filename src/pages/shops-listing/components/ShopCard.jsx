import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ShopCard = ({ shop, onVisitShop, onFollowShop, onQuickPreview }) => {
  const [isFollowing, setIsFollowing] = useState(shop.isFollowing);

  const handleFollow = (e) => {
    e.stopPropagation();
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    onFollowShop(shop.id, newFollowState);
  };

  const handleQuickPreview = (e) => {
    e.stopPropagation();
    onQuickPreview(shop.id);
  };

  const handleVisitShop = () => {
    onVisitShop(shop.id);
  };

  return (
    <div 
      onClick={handleVisitShop}
      className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-all duration-200 cursor-pointer group"
    >
      {/* Shop Banner */}
      <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20">
        <img
          src={shop.banner}
          alt={shop.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        
        {/* Shop Status */}
        <div className="absolute top-2 right-2 flex gap-1">
          {shop.isVerified && (
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
              Verified
            </span>
          )}
          {shop.isPremium && (
            <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
              Premium
            </span>
          )}
        </div>

        {/* Online Status */}
        <div className="absolute bottom-2 left-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            shop.isOnline 
              ? 'bg-success/10 text-success border border-success/20' :'bg-error/10 text-error border border-error/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              shop.isOnline ? 'bg-success' : 'bg-error'
            }`} />
            {shop.isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Shop Logo */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 bg-surface border-2 border-background rounded-lg overflow-hidden">
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/assets/images/no_image.png';
              }}
            />
          </div>
        </div>
      </div>

      {/* Shop Info */}
      <div className="p-4 pt-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
              {shop.name}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {shop.description}
            </p>
          </div>
          
          <button
            onClick={handleFollow}
            className={`ml-2 p-2 rounded-full transition-colors ${
              isFollowing 
                ? 'bg-primary/10 text-primary' :'bg-muted hover:bg-muted-hover text-text-secondary'
            }`}
          >
            <Icon name={isFollowing ? "Heart" : "Heart"} size={16} />
          </button>
        </div>

        {/* Shop Stats */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <Icon name="Star" size={14} className="text-accent" />
            <span className="text-sm font-medium text-text-primary">
              {shop.rating}
            </span>
            <span className="text-xs text-text-secondary">
              ({shop.reviewCount})
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Icon name="Package" size={14} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">
              {shop.productCount} products
            </span>
          </div>
        </div>

        {/* Location & Response Time */}
        <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
          <div className="flex items-center gap-1">
            <Icon name="MapPin" size={14} />
            <span>{shop.location}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Icon name="Clock" size={14} />
            <span>{shop.responseTime}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleVisitShop}
            variant="default"
            size="sm"
            className="flex-1"
          >
            Visit Shop
          </Button>
          
          <Button
            onClick={handleQuickPreview}
            variant="outline"
            size="sm"
            iconName="Eye"
          >
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;