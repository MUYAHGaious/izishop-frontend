import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ShopHero = ({ shop, onFollow, onContact }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow(!isFollowing);
  };

  return (
    <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
      {/* Banner Image */}
      <div className="relative h-48 md:h-64 lg:h-80 overflow-hidden">
        <Image
          src={shop.bannerImage}
          alt={`${shop.name} banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Shop Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Shop Logo */}
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-elevated bg-white">
              <Image
                src={shop.logo}
                alt={`${shop.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
            {shop.isVerified && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center border-2 border-white">
                <Icon name="Check" size={16} color="white" />
              </div>
            )}
          </div>

          {/* Shop Details */}
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{shop.name}</h1>
              {shop.isPremium && (
                <div className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                  Premium
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Icon name="Star" size={16} className="text-accent fill-current" />
                <span className="font-medium">{shop.rating}</span>
                <span className="text-white/80">({shop.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-white/80">
                <Icon name="MapPin" size={16} />
                <span>{shop.location}</span>
              </div>
            </div>

            {/* Shop Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Icon name="Package" size={14} />
                <span>{shop.productCount} Products</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Users" size={14} />
                <span>{shop.followerCount} Followers</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Calendar" size={14} />
                <span>{shop.yearsActive} Years Active</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 md:flex-col lg:flex-row">
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
              iconName={isFollowing ? "UserCheck" : "UserPlus"}
              iconPosition="left"
              className="flex-1 md:flex-none bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button
              variant="outline"
              onClick={onContact}
              iconName="MessageCircle"
              iconPosition="left"
              className="flex-1 md:flex-none bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              Contact
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHero;