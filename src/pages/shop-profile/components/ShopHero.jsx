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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-2xl" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header with Brand Identity */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-600">Shop Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-6">
            {shop.name}
          </h1>
          <div className="flex items-center justify-center gap-8 text-slate-600 mb-8">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-semibold">{shop.rating || "5.0"}</span>
              <span className="text-sm">({shop.total_reviews || "48"} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{shop.address || "Business Location"}</span>
            </div>
          </div>
          
          {!isOwner && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleFollow}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 ${
                  isFollowing
                    ? 'bg-slate-800 text-white shadow-2xl shadow-slate-800/25'
                    : 'bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:shadow-2xl hover:shadow-slate-800/25'
                }`}
              >
                <Users size={20} className="inline mr-2" />
                {isFollowing ? 'Following' : 'Follow Shop'}
              </button>
              <button
                onClick={() => onContact('general')}
                className="px-6 py-4 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl font-semibold hover:bg-white hover:shadow-lg transition-all"
              >
                Contact
              </button>
            </div>
          )}
        </div>

        {/* Featured Product Hero */}
        <div className="relative mb-20">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-12 md:p-16 text-white overflow-hidden relative">
            {/* Decorative circles */}
            <div className="absolute top-8 right-8 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute top-16 right-16 w-16 h-16 bg-white/5 rounded-full" />
            <div className="absolute bottom-8 left-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute bottom-16 left-16 w-20 h-20 bg-white/10 rounded-full" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Premium Collection</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {shop.description || "Discover Quality Products"}
                </h2>
                
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  Experience premium quality and exceptional service. Browse our carefully curated collection designed for your lifestyle.
                </p>

                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-lime-400/25 transition-all transform hover:scale-105">
                  View All Products
                  <div className="w-8 h-8 bg-slate-900/20 rounded-full flex items-center justify-center">
                    <Plus size={16} />
                  </div>
                </button>

                {/* Social Links */}
                <div className="flex items-center gap-4 mt-8">
                  <span className="text-sm text-slate-400">Follow us on:</span>
                  <div className="flex gap-2">
                    {['twitter', 'instagram', 'facebook', 'youtube'].map((social) => (
                      <button key={social} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full transition-colors" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Content - Featured Product */}
              <div className="relative">
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="w-full h-80 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center mb-6">
                    <Package size={80} className="text-slate-400" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Featured Product</h3>
                    <p className="text-slate-300 mb-4">Premium quality guaranteed</p>
                    <div className="flex items-center justify-center gap-2 text-lime-400 font-semibold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>5.0</span>
                      <span className="text-slate-400">({shop.total_reviews || "48"} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Colors Palette */}
        <div className="mb-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Popular Colors</h3>
            <div className="flex gap-4">
              {[
                'bg-blue-500',
                'bg-orange-500', 
                'bg-green-500',
                'bg-red-500',
                'bg-cyan-500'
              ].map((color, index) => (
                <button key={index} className={`w-12 h-12 ${color} rounded-full hover:scale-110 transition-transform shadow-lg`} />
              ))}
            </div>
          </div>
        </div>

        {/* Product Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* New Gen Category */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 hover:shadow-2xl transition-all group">
            <h4 className="text-lg font-bold text-slate-800 mb-4">New Gen Products</h4>
            <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package size={48} className="text-slate-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{shop.product_count || 24} items</span>
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
            </div>
          </div>

          {/* Premium Category */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 hover:shadow-2xl transition-all group">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Premium Collection</h4>
            <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield size={48} className="text-amber-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{Math.ceil((shop.product_count || 24) * 0.3)} items</span>
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
            </div>
          </div>

          {/* Latest Category */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 hover:shadow-2xl transition-all group">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Latest Arrivals</h4>
            <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Star size={48} className="text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{Math.ceil((shop.product_count || 24) * 0.2)} items</span>
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Upload Areas for Owner */}
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
            <div className="fixed bottom-8 right-8 z-50">
              <button
                onClick={() => profileFileRef.current?.click()}
                className="mb-4 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl transition-all"
                title="Update shop images"
              >
                <Camera size={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopHero;