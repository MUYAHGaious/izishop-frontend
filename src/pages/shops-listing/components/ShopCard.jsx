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
      className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-elevated hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
    >
      {/* Shop Banner */}
      <div className="relative h-40 bg-gradient-to-r from-primary/20 to-secondary/20">
        {shop.background_image ? (
          <img
            src={shop.background_image}
            alt={shop.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Icon name="Store" size={32} className="text-primary/40" />
          </div>
        )}
        
        {/* Shop Status */}
        <div className="absolute top-3 right-3 flex gap-2">
          {shop.is_verified && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md backdrop-blur-sm">
              <Icon name="CheckCircle" size={12} />
              Verified
            </span>
          )}
          {shop.is_active && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Active
            </span>
          )}
        </div>

        {/* Creation Date */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-black/30 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
            <Icon name="Calendar" size={12} />
            Est. {new Date(shop.created_at).getFullYear()}
          </div>
        </div>

        {/* Shop Logo */}
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 bg-surface border-4 border-white rounded-xl overflow-hidden shadow-lg">
            {shop.profile_photo ? (
              <img
                src={shop.profile_photo}
                alt={shop.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Icon name="Store" size={24} className="text-primary/60" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shop Info */}
      <div className="p-5 pt-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">
              {shop.name}
            </h3>
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
              {shop.description || 'No description available'}
            </p>
          </div>
          
          <button
            onClick={handleFollow}
            className={`ml-3 p-2.5 rounded-full transition-all duration-200 hover:scale-105 ${
              isFollowing 
                ? 'bg-red-500 text-white shadow-lg' :'bg-muted hover:bg-primary/10 hover:text-primary text-text-secondary'
            }`}
          >
            <Icon name={isFollowing ? "HeartFilled" : "Heart"} size={16} />
          </button>
        </div>

        {/* Shop Stats */}
        <div className="flex items-center gap-4 mb-4 mt-1">
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Icon name="Star" size={14} className="text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-700">
              {shop.average_rating || 'N/A'}
            </span>
            <span className="text-xs text-yellow-600">
              ({shop.total_reviews || 0})
            </span>
          </div>
          
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Icon name="MapPin" size={14} className="text-blue-500 flex-shrink-0" />
            <span className="text-sm text-text-secondary truncate">
              {shop.address || 'No address'}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 gap-2 text-sm text-text-secondary mb-4">
          {shop.phone && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
              <Icon name="Phone" size={14} className="text-blue-500" />
              <span className="text-blue-700 font-medium">{shop.phone}</span>
            </div>
          )}
          
          {shop.email && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
              <Icon name="Mail" size={14} className="text-green-500" />
              <span className="text-green-700 font-medium truncate">{shop.email}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleVisitShop}
            variant="default"
            size="sm"
            className="flex-1 font-semibold hover:shadow-lg transition-all duration-200"
            iconName="ExternalLink"
          >
            Visit Shop
          </Button>
          
          <Button
            onClick={handleQuickPreview}
            variant="outline"
            size="sm"
            iconName="Eye"
            className="hover:shadow-md transition-all duration-200"
          >
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;