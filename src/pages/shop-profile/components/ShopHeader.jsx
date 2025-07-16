import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ShopHeader = ({ shop, onFollowToggle, isFollowing }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : '0.0';
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="bg-surface border-b border-border">
      {/* Cover Image */}
      <div className="relative h-32 md:h-48 overflow-hidden">
        <Image
          src={shop.coverImage}
          alt={`${shop.name} cover`}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Shop Info */}
      <div className="relative px-4 pb-4 -mt-12 md:-mt-16">
        <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
          {/* Shop Logo */}
          <div className="relative mb-4 md:mb-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-surface overflow-hidden bg-surface">
              <Image
                src={shop.logo}
                alt={`${shop.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
            {shop.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-surface">
                <Icon name="Check" size={12} color="white" />
              </div>
            )}
          </div>

          {/* Shop Details */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-3 md:mb-0">
                <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                  {shop.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-warning fill-current" />
                    <span className="font-medium">{formatRating(shop.rating)}</span>
                    <span>({shop.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={14} />
                    <span>{formatFollowers(shop.followers)} followers</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={onFollowToggle}
                  iconName={isFollowing ? "UserMinus" : "UserPlus"}
                  iconPosition="left"
                  iconSize={16}
                >
                  {isFollowing ? "Following" : "Follow Shop"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="MessageCircle"
                  iconPosition="left"
                  iconSize={16}
                >
                  Chat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-foreground">
              {shop.totalProducts}
            </div>
            <div className="text-xs text-text-secondary">Products</div>
          </div>
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-foreground">
              {shop.yearsInBusiness}+
            </div>
            <div className="text-xs text-text-secondary">Years</div>
          </div>
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-foreground">
              {shop.satisfactionRate}%
            </div>
            <div className="text-xs text-text-secondary">Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;