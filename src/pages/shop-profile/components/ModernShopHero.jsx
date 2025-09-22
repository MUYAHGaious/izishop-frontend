import React, { useState, useRef } from 'react';
import { Camera, Plus, X, MapPin, Star, Package, Users, Calendar, Shield, Phone, Mail, Heart, Share2, MessageCircle, Clock, Award, TrendingUp, ExternalLink } from 'lucide-react';
import { showToast } from '../../../components/ui/Toast';
import api from '../../../services/api';

const ModernShopHero = ({ shop, onFollow, onContact, isOwner }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const profileFileRef = useRef(null);
  const backgroundFileRef = useRef(null);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow(!isFollowing);
  };

  const handleProfileUpload = async (event) => {
    showToast('Image upload feature coming soon!', 'info');
    return;
  };

  const handleBackgroundUpload = async (event) => {
    showToast('Image upload feature coming soon!', 'info');
    return;
  };

  const formatJoinDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const formatRating = (rating) => {
    return rating ? parseFloat(rating).toFixed(1) : '0.0';
  };

  return (
    <div className="relative bg-white">
      {/* Hero Background */}
      <div className="relative h-96 bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 overflow-hidden">
        {/* Background Image or Gradient */}
        {shop.background_image ? (
          <img
            src={shop.background_image}
            alt={`${shop.name} background`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-100 via-blue-100 to-indigo-100" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Owner Upload Button */}
        {isOwner && (
          <button
            onClick={() => backgroundFileRef.current?.click()}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            title="Update background image"
          >
            <Camera size={20} />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="relative -mt-20 px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Shop Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Profile Header */}
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Shop Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-32 h-32 bg-white rounded-2xl shadow-lg border-4 border-white overflow-hidden">
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
                      <div className="w-full h-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                        <Package size={48} className="text-teal-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Verification Badge */}
                  {shop.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                      <Award size={16} />
                    </div>
                  )}
                  
                  {/* Owner Upload Button */}
                  {isOwner && (
                    <button
                      onClick={() => profileFileRef.current?.click()}
                      className="absolute -bottom-2 -left-2 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-full shadow-lg transition-all duration-200"
                      title="Update profile photo"
                    >
                      <Camera size={14} />
                    </button>
                  )}
                </div>

                {/* Shop Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {shop.name}
                      </h1>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {shop.description || 'Welcome to our shop! We offer quality products and excellent service.'}
                      </p>

                      {/* Shop Stats */}
                      <div className="flex flex-wrap items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={`${
                                  i < Math.floor(shop.average_rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-900 ml-1">
                            {formatRating(shop.average_rating)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({shop.total_reviews || 0} reviews)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={16} />
                          <span className="text-sm">{shop.address || 'Location not specified'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span className="text-sm">Joined {formatJoinDate(shop.created_at)}</span>
                        </div>
                      </div>

                      {/* Status Indicators */}
                      <div className="flex items-center gap-3">
                        {shop.is_active && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Active
                          </span>
                        )}
                        
                        {shop.is_verified && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            <Shield size={12} />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!isOwner && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleFollow}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                            isFollowing
                              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          <Heart size={18} className={isFollowing ? 'fill-current' : ''} />
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        
                        <button
                          onClick={() => onContact('general')}
                          className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <MessageCircle size={18} />
                          Contact
                        </button>
                        
                        <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200">
                          <Share2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="px-8 py-6 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {shop.product_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {shop.total_reviews || 0}
                  </div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {shop.followers_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatRating(shop.average_rating)}
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      {isOwner && (
        <>
          <input
            ref={profileFileRef}
            type="file"
            accept="image/*"
            onChange={handleProfileUpload}
            className="hidden"
          />
          <input
            ref={backgroundFileRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default ModernShopHero;
