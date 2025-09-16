import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const UserProfile = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileStats, setProfileStats] = useState({
    orders: 0,
    wishlist: 0,
    reviews: 0,
    following: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [userShops, setUserShops] = useState([]);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: null,
    coverImage: null,
    joinDate: null,
    lastActive: null
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/authentication-login-register');
      return;
    }

    const currentUser = getUserData();
    if (currentUser) {
      setProfileData({
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        profileImage: localStorage.getItem(`profile_image_${currentUser.id}`) || currentUser.profile_image_url || null,
        coverImage: localStorage.getItem(`cover_image_${currentUser.id}`) || currentUser.cover_image_url || null,
        joinDate: currentUser.created_at || null,
        lastActive: currentUser.last_login || null
      });
      
      // Fetch real-time data
      fetchProfileStats();
      fetchRecentActivity();
      
      // Fetch user shops if shop owner
      if (currentUser.role === 'SHOP_OWNER' || currentUser.role === 'shop_owner') {
        fetchUserShops();
      }
    }
  }, [user, isAuthenticated, navigate]);

  const fetchProfileStats = async () => {
    try {
      const [ordersRes, wishlistRes, reviewsRes, followingRes] = await Promise.allSettled([
        api.get('/user/orders/count'),
        api.get('/user/wishlist/count'),
        api.get('/user/reviews/count'),
        api.get('/user/following/count')
      ]);

      setProfileStats({
        orders: ordersRes.status === 'fulfilled' ? ordersRes.value.data.count : 0,
        wishlist: wishlistRes.status === 'fulfilled' ? wishlistRes.value.data.count : 0,
        reviews: reviewsRes.status === 'fulfilled' ? reviewsRes.value.data.count : 0,
        following: followingRes.status === 'fulfilled' ? followingRes.value.data.count : 0
      });
    } catch (error) {
      console.error('Failed to fetch profile stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await api.get('/user/activity/recent');
      setRecentActivity(response.data.activities || []);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      setRecentActivity([]);
    }
  };

  const fetchUserShops = async () => {
    try {
      const shops = await api.getMyShops();
      setUserShops(shops || []);
    } catch (error) {
      console.error('Failed to fetch user shops:', error);
      setUserShops([]);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file, type = 'profile') => {
    try {
      setIsUploadingImage(true);
      
      // Validate file
      if (!file) {
        showToast('No file selected', 'error');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      // For development: Use local storage for image persistence
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        
        // Save to localStorage with user-specific key
        const storageKey = type === 'profile' ? `profile_image_${user?.id}` : `cover_image_${user?.id}`;
        localStorage.setItem(storageKey, imageUrl);
        
        if (type === 'profile') {
          setProfileData(prev => ({ ...prev, profileImage: imageUrl }));
          showToast('Profile picture updated successfully', 'success');
        } else {
          setProfileData(prev => ({ ...prev, coverImage: imageUrl }));
          showToast('Cover photo updated successfully', 'success');
        }
        
        // Also save to user context if available
        if (user) {
          const updatedUser = {
            ...user,
            [type === 'profile' ? 'profile_image_url' : 'cover_image_url']: imageUrl
          };
          // Update localStorage user data
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        // Trigger header update
        window.dispatchEvent(new Event('profileImageUpdated'));
        
        // TODO: Replace with actual API call when backend is ready
        // Example API call structure:
        /*
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', type);
        formData.append('userId', user.id);

        const response = await api.post('/api/users/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
        });

        const { imageUrl, success } = response.data;
        if (success) {
          // Update user profile in database
          await api.put('/api/users/profile', {
            [type === 'profile' ? 'profile_image_url' : 'cover_image_url']: imageUrl
          });
        }
        */
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      showToast('Failed to upload image. Backend integration needed.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfilePictureClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file, 'profile');
      }
    };
    input.click();
  };

  const handleCoverPhotoClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file, 'cover');
      }
    };
    input.click();
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone
      };

      await api.put('/user/profile', updateData);
      
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Logout failed', 'error');
    }
  };

  const navigateToDashboard = () => {
    if (user?.role === 'ADMIN' || user?.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (user?.role === 'SHOP_OWNER' || user?.role === 'shop_owner') {
      navigate('/shop-owner-dashboard');
    } else {
      navigate('/customer-dashboard');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastActive = (dateString) => {
    if (!dateString) return 'Never';
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return 'Package';
      case 'review': return 'Star';
      case 'wishlist': return 'Heart';
      case 'follow': return 'UserPlus';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'order': return 'text-blue-600 bg-blue-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      case 'wishlist': return 'text-red-600 bg-red-50';
      case 'follow': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Handle loading state and user data
  const getUserData = () => {
    if (user) return user;
    
    // Fallback to localStorage if context user isn't loaded yet
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
    }
    
    return null;
  };

  const currentUser = getUserData();

  if (!currentUser && loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Available</h2>
            <p className="text-gray-600 mb-4">Unable to load user profile data.</p>
            <button 
              onClick={() => navigate('/authentication-login-register')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 relative overflow-hidden">
      {/* Modern blur effects with teal theme */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/8 rounded-full -translate-y-48 translate-x-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/5 rounded-full translate-y-40 -translate-x-40 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-400/4 rounded-full -translate-x-32 -translate-y-32 pointer-events-none"></div>
      
      <Header />
      
      <main className="pt-16 pb-20 lg:pb-8 relative z-10">
        {/* Cover/Header Section - Facebook Style */}
        <div className="relative">
          <div 
            className="h-48 sm:h-56 lg:h-72 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 bg-cover bg-center relative cursor-pointer group overflow-hidden"
            style={{
              backgroundImage: profileData.coverImage ? `url(${profileData.coverImage})` : 'none'
            }}
            onClick={handleCoverPhotoClick}
          >
            {/* Modern blur effects on cover */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 -translate-x-32 pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 translate-x-24 pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
            
            {/* Cover Photo Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30 group-hover:from-black/40 group-hover:to-black/50 transition-all duration-300"></div>
            
            {/* Edit Cover Button with glass morphism */}
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 rounded-xl px-4 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ">
              <div className="flex items-center space-x-2">
                <Icon name="Camera" size={16} className="text-white" />
                <span className="text-sm font-semibold text-white">Edit Cover</span>
              </div>
            </div>
            
            {isUploadingImage && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                  <span className="text-sm font-medium text-gray-700">Uploading...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile Picture Overlay */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 sm:left-6 sm:transform-none z-20">
            <div className="relative group">
              <div 
                className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-full p-1  cursor-pointer"
                onClick={handleProfilePictureClick}
              >
                <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden relative">
                  {profileData.profileImage ? (
                    <img 
                      src={profileData.profileImage} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-3xl font-bold text-white">
                      {profileData.firstName?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                  
                  {/* Profile Picture Overlay */}
                  <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-2">
                      <Icon name="Camera" size={20} className="text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile-friendly camera button */}
              <button 
                className="absolute -bottom-1 -right-1 w-10 h-10 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center text-white transition-colors  sm:hidden"
                onClick={handleProfilePictureClick}
              >
                <Icon name="Camera" size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 relative overflow-hidden">
          {/* Subtle background effects */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/5 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-4 pt-20 pb-6 relative z-10">
            <div className="text-center lg:text-left lg:flex lg:items-end lg:justify-between">
              <div className="lg:ml-40">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-gray-600 mb-4 text-lg font-medium">
                  {user?.role === 'SHOP_OWNER' ? 'Shop Owner' : user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                </p>
                
                {/* Stats Row - Facebook Style */}
                <div className="flex justify-center lg:justify-start space-x-6 text-sm text-gray-600 mb-4">
                  <span><strong className="text-gray-900">{profileStats.orders}</strong> Orders</span>
                  <span><strong className="text-gray-900">{profileStats.wishlist}</strong> Wishlist</span>
                  <span><strong className="text-gray-900">{profileStats.reviews}</strong> Reviews</span>
                  <span><strong className="text-gray-900">{profileStats.following}</strong> Following</span>
                </div>
              </div>
              
              <div className="flex justify-center lg:justify-end flex-wrap gap-2 mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  iconName={isEditing ? "X" : "Edit"}
                  size="sm"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/profile/${user?.id}`)}
                  iconName="Eye"
                  size="sm"
                >
                  View as Public
                </Button>
                <Button
                  variant="default"
                  onClick={navigateToDashboard}
                  iconName="LayoutDashboard"
                  size="sm"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - About & Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* About Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl  border border-white/20 p-6 relative overflow-hidden">
                {/* Subtle blur effect */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none"></div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mr-3 ">
                    <Icon name="User" size={18} className="text-white" />
                  </div>
                  About
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <Input
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50 border-0' : ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <Input
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50 border-0' : ''}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      value={profileData.email}
                      disabled
                      className="bg-gray-50 border-0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50 border-0' : ''}
                      placeholder="+237 XXX XXX XXX"
                    />
                  </div>
                  
                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Icon name="Calendar" size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(profileData.joinDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Icon name="Clock" size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Last active</p>
                        <p className="text-sm font-medium text-gray-900">{formatLastActive(profileData.lastActive)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        iconName="Save"
                        className="flex-1"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* My Shops Section - Only for Shop Owners */}
              {(user?.role === 'SHOP_OWNER' || user?.role === 'shop_owner') && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl  border border-white/20 p-6 relative overflow-hidden">
                  {/* Subtle blur effect */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/5 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center relative z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mr-3 ">
                      <Icon name="Store" size={18} className="text-white" />
                    </div>
                    My Shops ({userShops.length})
                  </h2>
                  
                  <div className="space-y-4">
                    {userShops.length > 0 ? (
                      userShops.map((shop) => (
                        <div key={shop.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-teal-300 transition-colors">
                          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Icon name="Store" size={20} className="text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{shop.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{shop.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className={`px-2 py-1 rounded-full ${shop.is_active ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>
                                {shop.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <span>Created {formatDate(shop.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => navigate(`/shop-profile/${shop.id}`)}
                              className="px-3 py-1 text-xs bg-teal-100 text-teal-800 rounded-md hover:bg-teal-200 transition-colors"
                            >
                              View Shop
                            </button>
                            <button
                              onClick={() => navigate('/shop-owner-dashboard')}
                              className="px-3 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-md hover:bg-emerald-200 transition-colors"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Icon name="Store" size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2">No shops yet</p>
                        <button
                          onClick={() => navigate('/shops-listing')}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Icon name="Plus" size={16} />
                          <span>Create Your First Shop</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl  border border-white/20 p-6 relative overflow-hidden">
                {/* Subtle blur effect */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-purple-400/5 rounded-full -translate-y-14 translate-x-14 pointer-events-none"></div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center relative z-10" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 ">
                    <Icon name="Activity" size={18} className="text-white" />
                  </div>
                  Recent Activity
                </h2>
                
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          <Icon name={getActivityIcon(activity.type)} size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatLastActive(activity.created_at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Icon name="Activity" size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              
              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl  border border-white/20 p-6 relative overflow-hidden">
                {/* Subtle blur effect */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none"></div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-6 relative z-10">
                  Quick Actions
                </h3>
                <div className="space-y-3 relative z-10">
                  <button
                    onClick={navigateToDashboard}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-teal-50/50 to-teal-100/30 hover:from-teal-100/70 hover:to-teal-200/50 rounded-xl transition-all duration-300 text-left active:scale-95 border border-teal-200/30 hover:border-teal-300/50 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center ">
                      <Icon name="LayoutDashboard" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Dashboard</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/shopping-cart')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 hover:from-emerald-100/70 hover:to-emerald-200/50 rounded-xl transition-all duration-300 text-left active:scale-95 border border-emerald-200/30 hover:border-emerald-300/50 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center ">
                      <Icon name="ShoppingCart" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">My Cart</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/order-management')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50/50 to-blue-100/30 hover:from-blue-100/70 hover:to-blue-200/50 rounded-xl transition-all duration-300 text-left active:scale-95 border border-blue-200/30 hover:border-blue-300/50 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center ">
                      <Icon name="Package" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Orders</span>
                  </button>
                  
                  {(user?.role === 'SHOP_OWNER' || user?.role === 'shop_owner') && (
                    <button
                      onClick={() => navigate('/my-shop-profile')}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-teal-50 rounded-lg transition-colors text-left active:scale-95"
                    >
                      <Icon name="Store" size={20} className="text-teal-600" />
                      <span className="text-sm font-medium text-gray-700">My Shop</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl  border border-white/20 p-6 relative overflow-hidden">
                {/* Subtle blur effect */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-400/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none"></div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-6 relative z-10">
                  Settings
                </h3>
                <div className="space-y-3 relative z-10">
                  <button 
                    onClick={() => showToast('Security settings coming soon', 'info')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 hover:from-gray-100/70 hover:to-gray-200/50 rounded-xl transition-all duration-300 text-left border border-gray-200/30 hover:border-gray-300/50 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center ">
                      <Icon name="Lock" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Security</span>
                  </button>
                  
                  <button 
                    onClick={() => showToast('Notification settings coming soon', 'info')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50/50 to-indigo-100/30 hover:from-indigo-100/70 hover:to-indigo-200/50 rounded-xl transition-all duration-300 text-left border border-indigo-200/30 hover:border-indigo-300/50 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center ">
                      <Icon name="Bell" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Notifications</span>
                  </button>
                  
                  <button 
                    onClick={() => showToast('Privacy settings coming soon', 'info')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-teal-50/50 to-teal-100/30 hover:from-teal-100/70 hover:to-teal-200/50 rounded-xl transition-all duration-300 text-left border border-teal-200/30 hover:border-teal-300/50 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center ">
                      <Icon name="Shield" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Privacy</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50/50 to-red-100/30 hover:from-red-100/70 hover:to-red-200/50 rounded-xl transition-all duration-300 text-left active:scale-95 border border-red-200/30 hover:border-red-300/50 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center ">
                      <Icon name="LogOut" size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-red-700">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <MobileBottomTab />
    </div>
  );
};

export default UserProfile;