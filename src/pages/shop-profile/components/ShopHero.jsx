import React, { useState, useRef } from 'react';
import { Camera, Plus, X, MapPin, Star, Package, Users, Calendar, Shield, Phone, Mail } from 'lucide-react';
import { showToast } from '../../../components/ui/Toast';
import api from '../../../services/api';

const ShopHero = ({ shop, onFollow, onContact, isOwner }) => {
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
    // Temporarily disabled - backend upload endpoint not ready
    showToast('Image upload feature coming soon!', 'info');
    return;
  };

  const handleBackgroundUpload = async (event) => {
    // Temporarily disabled - backend upload endpoint not ready
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

  return (
    <div className="relative">
      {/* Shop Background Banner */}
      <div className="relative h-72 md:h-80 lg:h-96 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {shop.background_image ? (
          <img
            src={`http://localhost:8001${shop.background_image}`}
            alt={`${shop.name} background`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
            <div className="text-center text-white/60">
              <Package size={64} className="mx-auto mb-4" />
              <p className="text-lg font-medium">Business Background</p>
            </div>
          </div>
        )}
        
        {/* Background Upload Button for Owner */}
        {isOwner && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => backgroundFileRef.current?.click()}
              disabled={isUploadingBackground}
              className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
              title="Change background image"
            >
              {isUploadingBackground ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Camera size={20} />
              )}
            </button>
            <input
              ref={backgroundFileRef}
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Shop Information Container */}
      <div className="relative -mt-32 mx-4 md:mx-6 lg:mx-8">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Main Shop Info */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Shop Profile Photo */}
              <div className="relative flex-shrink-0">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                  {shop.profile_photo ? (
                    <img
                      src={`http://localhost:8001${shop.profile_photo}`}
                      alt={`${shop.name} profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <Package size={48} className="text-blue-400" />
                    </div>
                  )}
                  
                  {/* Profile Upload Button for Owner */}
                  {isOwner && (
                    <button
                      onClick={() => profileFileRef.current?.click()}
                      disabled={isUploadingProfile}
                      className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors shadow-lg"
                      title="Change profile photo"
                    >
                      {isUploadingProfile ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Camera size={16} />
                      )}
                    </button>
                  )}
                </div>

                <input
                  ref={profileFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileUpload}
                  className="hidden"
                />

                {/* Verification Badge */}
                {shop.is_verified && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white shadow-lg">
                    <Shield size={16} />
                  </div>
                )}
              </div>

              {/* Shop Details */}
              <div className="flex-1 min-w-0">
                {/* Shop Name and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {shop.name}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      {shop.is_verified && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          <Shield size={14} />
                          Verified Business
                        </span>
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        shop.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {shop.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwner && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleFollow}
                        className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                          isFollowing
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <Users size={18} className="inline mr-2" />
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <button
                        onClick={() => onContact('general')}
                        className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                      >
                        Contact
                      </button>
                    </div>
                  )}
                </div>

                {/* Shop Description */}
                {shop.description && (
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    {shop.description}
                  </p>
                )}

                {/* Business Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {shop.total_sales || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Sales</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-2xl text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="text-yellow-500 fill-current mr-1" size={20} />
                      <span className="text-2xl font-bold text-green-600">
                        {shop.rating || 0}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {shop.total_reviews || 0}
                    </div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-2xl text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {shop.product_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  {shop.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{shop.address}</span>
                    </div>
                  )}
                  {shop.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                  {shop.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span>{shop.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Joined {formatJoinDate(shop.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHero;