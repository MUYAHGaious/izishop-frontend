import React, { useState } from 'react';
import { Star, MapPin, ShoppingBag, Users, Heart, Clock, Store, TrendingUp, CheckCircle, Plus } from 'lucide-react';

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

  const formatRating = (rating) => {
    return rating ? parseFloat(rating).toFixed(1) : '0.0';
  };

  const formatJoinDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    } catch {
      return 'Recently';
    }
  };

  const getShopCategory = () => {
    // Determine category based on shop data or use default
    if (shop.category) return shop.category;
    if (shop.description?.toLowerCase().includes('electronics')) return 'Electronics';
    if (shop.description?.toLowerCase().includes('fashion')) return 'Fashion';
    if (shop.description?.toLowerCase().includes('beauty')) return 'Beauty & Personal Care';
    return 'General';
  };

  const getShopTags = () => {
    const tags = [];
    if (shop.is_verified) tags.push('Verified');
    if (shop.description?.toLowerCase().includes('handmade')) tags.push('Handmade');
    if (shop.description?.toLowerCase().includes('organic')) tags.push('Organic');
    if (shop.description?.toLowerCase().includes('sustainable')) tags.push('Sustainable');
    if (tags.length === 0) tags.push('Quality', 'Reliable');
    return tags.slice(0, 3); // Limit to 3 tags
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < Math.floor(rating || 0)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden active:shadow-lg transition-all duration-200 active:scale-[0.98] group">
      {/* Shop Image Header - Mobile First */}
      <div className="relative h-36 bg-gray-100 overflow-hidden">
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
          <div className="w-full h-full bg-gradient-to-br from-teal-100 via-blue-100 to-indigo-100 flex items-center justify-center">
            <Store size={28} className="text-teal-400" />
          </div>
        )}
        
        {/* Badges - Mobile First */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {shop.is_verified && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <CheckCircle size={8} />
              Verified
            </span>
          )}
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {shop.is_active && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <TrendingUp size={8} />
              Trending
            </span>
          )}
          {!shop.is_active && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
              + New
            </span>
          )}
        </div>
      </div>

      {/* Shop Content - Mobile First */}
      <div className="p-4">
        {/* Shop Name */}
        <h3 className="text-base font-bold text-gray-900 mb-2 group-active:text-teal-600 transition-colors line-clamp-1">
          {shop.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {renderStars(shop.average_rating)}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {formatRating(shop.average_rating)} ({shop.total_reviews || 0})
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {shop.description || 'Quality products and excellent service for all your needs.'}
        </p>

        {/* Shop Details - Mobile First */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-gray-400" />
            <span className="truncate">{shop.address || 'Location not specified'}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <ShoppingBag size={14} className="text-gray-400" />
              <span>{shop.product_count || 0} products</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} className="text-gray-400" />
              <span>{shop.followers_count || 0} followers</span>
            </div>
          </div>
        </div>

        {/* Tags - Mobile First */}
        <div className="flex flex-wrap gap-2 mb-4">
          {getShopTags().map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons - Mobile First */}
        <div className="flex gap-3">
          <button
            onClick={handleVisitShop}
            className="flex-1 bg-teal-500 active:bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg active:shadow-xl active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <Store size={16} />
            Visit Shop
          </button>
          <button
            onClick={handleFollow}
            className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 border active:scale-95 ${
              isFollowing
                ? 'bg-red-500 active:bg-red-600 text-white border-red-500'
                : 'bg-white active:bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            <Heart size={16} className={isFollowing ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Activity Info - Mobile First */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span className="truncate">Active {formatJoinDate(shop.updated_at)}</span>
            </div>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
              {getShopCategory()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;