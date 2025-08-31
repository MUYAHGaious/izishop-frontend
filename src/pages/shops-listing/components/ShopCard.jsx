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
      className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-150 overflow-hidden h-full flex flex-col"
    >
      {/* Shop Banner */}
      <div className="relative h-48 bg-gradient-to-r from-teal-500/20 to-blue-500/20 flex-shrink-0">
        {shop.background_image ? (
          <img
            src={shop.background_image}
            alt={shop.name}
            className="w-full h-full object-cover transition-all duration-150 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-400/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Icon name="Store" size={32} className="text-teal-500/40" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
          <Button
            onClick={handleQuickPreview}
            variant="outline"
            className="bg-white/90 backdrop-blur-sm border-white text-gray-900 hover:bg-white"
          >
            <Icon name="Eye" size={16} className="mr-2" />
            Quick View
          </Button>
        </div>

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

        {/* Shop Logo */}
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 bg-white border-4 border-white rounded-xl overflow-hidden shadow-lg">
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
              <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center">
                <Icon name="Store" size={24} className="text-teal-500/60" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shop Info */}
      <div className="p-4 pt-10 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
              {shop.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2 min-h-[2.5rem]">
              {shop.description || 'No description available'}
            </p>
          </div>
          
          <button
            onClick={handleFollow}
            className={`ml-3 p-2.5 rounded-full transition-all duration-150 hover:scale-105 ${
              isFollowing 
                ? 'bg-red-500 text-white shadow-lg' :'bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-400'
            }`}
          >
            <Icon name={isFollowing ? "Heart" : "Heart"} size={16} />
          </button>
        </div>

        {/* Shop Stats */}
        <div className="flex items-center gap-4 mb-4 mt-3">
          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
            <Icon name="Star" size={14} className="text-yellow-500" />
            <span className="text-sm font-semibold text-yellow-700">
              {shop.average_rating || 'N/A'}
            </span>
            <span className="text-xs text-yellow-600">
              ({shop.total_reviews || 0})
            </span>
          </div>
          
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Icon name="MapPin" size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">
              {shop.address || 'No address'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto pt-4">
          <Button
            onClick={handleVisitShop}
            variant="default"
            size="sm"
            className="flex-1 font-semibold bg-teal-500 hover:bg-teal-600 text-white hover:shadow-lg transition-all duration-150"
            iconName="ExternalLink"
          >
            Visit Shop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;