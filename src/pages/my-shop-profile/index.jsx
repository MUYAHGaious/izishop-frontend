import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

// Import existing dashboard components
import ProductsTab from '../shop-owner-dashboard/components/ProductsTab';
import OrdersTab from '../shop-owner-dashboard/components/OrdersTab';
import ShopSettings from '../shop-owner-dashboard/components/ShopSettings';
import ReviewsTab from '../shop-owner-dashboard/components/ReviewsTab';

const MyShopProfile = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [imageUploads, setImageUploads] = useState({
    profileImage: null,
    backgroundImage: null,
    profileImagePreview: null,
    backgroundImagePreview: null,
    uploadingProfile: false,
    uploadingBackground: false
  });
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real data states
  const [shopStats, setShopStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    followers: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchAllShopData();
  }, [shopId]);

  const fetchAllShopData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch shop basic data
      let shopData;
      if (shopId) {
        shopData = await api.getShop(shopId);
      } else {
        shopData = await api.getMyShop();
      }
      
      setShop(shopData);
      setEditData({
        name: shopData.name || '',
        description: shopData.description || '',
        address: shopData.address || '',
        phone: shopData.phone || '',
        email: shopData.email || '',
        category: shopData.category || '',
        website: shopData.website || ''
      });

      // Fetch real shop statistics and data
      await fetchShopStatistics(shopData.id);
      
    } catch (err) {
      setError(err.message || 'Failed to load shop data');
      console.error('Shop data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopStatistics = async (currentShopId = null) => {
    try {
      setIsLoadingStats(true);
      const shopIdToUse = currentShopId || shop?.id;
      
      // Fetch all real data in parallel for better performance
      const [productsResponse, ordersResponse, reviewsResponse] = await Promise.all([
        api.getMyProducts(0, 5, true).catch(() => []),
        api.getShopOwnerRecentOrders(5).catch(() => []),
        api.getShopReviews(shopIdToUse || 'current', 1, 5).catch(() => ({ reviews: [] }))
      ]);

      // Get real product stats
      const allProducts = await api.getMyProducts(0, 1000, false).catch(() => []);
      const totalProducts = Array.isArray(allProducts) ? allProducts.length : 0;
      const activeProducts = Array.isArray(allProducts) 
        ? allProducts.filter(p => p.is_active).length 
        : 0;

      // Calculate real revenue from orders
      const allOrders = await api.getShopOwnerOrders({ limit: 1000 }).catch(() => ({ orders: [] }));
      const orders = allOrders.orders || allOrders || [];
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = orders.length;

      // Calculate real rating from reviews
      const reviews = reviewsResponse.reviews || [];
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Get shop followers count
      const followersCount = await api.getShopFollowersCount(shopIdToUse).catch(() => 0);

      setShopStats({
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue,
        averageRating: averageRating.toFixed(1),
        totalReviews: reviews.length,
        followers: followersCount || 0
      });

      setRecentProducts(Array.isArray(productsResponse) ? productsResponse.slice(0, 4) : []);
      setRecentOrders(Array.isArray(ordersResponse) ? ordersResponse.slice(0, 4) : []);
      setRecentReviews(reviews.slice(0, 3));

    } catch (error) {
      console.warn('Error fetching shop statistics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      name: shop.name || '',
      description: shop.description || '',
      address: shop.address || '',
      phone: shop.phone || '',
      email: shop.email || '',
      category: shop.category || '',
      website: shop.website || ''
    });
  };

  const handleSave = async () => {
    try {
      const updatedShop = await api.updateMyShop(editData);
      setShop(updatedShop);
      setIsEditing(false);
      showToast('Shop updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update shop', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setImageUploads(prev => ({
      ...prev,
      [imageType]: file,
      [`${imageType}Preview`]: previewUrl
    }));
  };

  const uploadImage = async (file, imageType) => {
    if (!file) return null;

    try {
      setImageUploads(prev => ({
        ...prev,
        [`uploading${imageType.charAt(0).toUpperCase() + imageType.slice(1)}`]: true
      }));

      // Convert to base64 for upload
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });

      // You can also upload to backend here if you have an upload endpoint
      // const response = await api.uploadShopImage(file, imageType);
      // return response.url;

      // For now, return the base64 data URL
      return base64;
    } catch (error) {
      console.error(`Error uploading ${imageType}:`, error);
      showToast(`Failed to upload ${imageType}`, 'error');
      return null;
    } finally {
      setImageUploads(prev => ({
        ...prev,
        [`uploading${imageType.charAt(0).toUpperCase() + imageType.slice(1)}`]: false
      }));
    }
  };

  const handleSaveWithImages = async () => {
    try {
      let updatedData = { ...editData };

      // Upload profile image if selected
      if (imageUploads.profileImage) {
        const profileImageUrl = await uploadImage(imageUploads.profileImage, 'profileImage');
        if (profileImageUrl) {
          updatedData.profile_photo = profileImageUrl;
        }
      }

      // Upload background image if selected
      if (imageUploads.backgroundImage) {
        const backgroundImageUrl = await uploadImage(imageUploads.backgroundImage, 'backgroundImage');
        if (backgroundImageUrl) {
          updatedData.background_image = backgroundImageUrl;
        }
      }

      const updatedShop = await api.updateMyShop(updatedData);
      setShop(updatedShop);
      setIsEditing(false);
      
      // Clear image uploads
      setImageUploads({
        profileImage: null,
        backgroundImage: null,
        profileImagePreview: null,
        backgroundImagePreview: null,
        uploadingProfile: false,
        uploadingBackground: false
      });

      showToast('Shop updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update shop', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shop profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Icon name="AlertCircle" size={48} className="text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Shop</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={fetchAllShopData} className="bg-red-600 hover:bg-red-700">
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/shop-owner-dashboard')}>
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 pt-20">
        {/* Shop Header - Modern Business Style */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Hero Section */}
          <div className="relative h-64 overflow-hidden">
            {/* Background Image */}
            {shop.background_image || imageUploads.backgroundImagePreview ? (
              <img 
                src={imageUploads.backgroundImagePreview || shop.background_image} 
                alt="Shop background" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            
            {/* Background Image Upload Button (Edit Mode) */}
            {isEditing && (
              <div className="absolute top-4 right-4">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 px-3 py-2 rounded-lg transition-all shadow-lg">
                  {imageUploads.uploadingBackground ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    <Icon name="Camera" size={16} />
                  )}
                  <span className="text-sm font-medium">Change Background</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, 'backgroundImage')}
                    className="hidden"
                    disabled={imageUploads.uploadingBackground}
                  />
                </label>
              </div>
            )}
            
            {/* Shop Logo & Info */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="flex items-center gap-4">
                  {/* Business Logo */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden">
                      {shop.profile_photo || imageUploads.profileImagePreview ? (
                        <img 
                          src={imageUploads.profileImagePreview || shop.profile_photo} 
                          alt="Shop logo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon name="Store" size={40} className="text-blue-600" />
                      )}
                    </div>
                    
                    {/* Profile Image Upload Button (Edit Mode) */}
                    {isEditing && (
                      <div className="absolute -bottom-2 -right-2">
                        <label className="cursor-pointer inline-flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-lg">
                          {imageUploads.uploadingProfile ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Icon name="Camera" size={14} />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageSelect(e, 'profileImage')}
                            className="hidden"
                            disabled={imageUploads.uploadingProfile}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {/* Shop Details */}
                  <div className="text-white">
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">{shop.name}</h1>
                    <div className="flex flex-wrap gap-4 text-sm opacity-90">
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={16} />
                        <span>Est. {new Date(shop.created_at).getFullYear()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={16} />
                        <span>{shop.address || 'Cameroon'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Users" size={16} />
                        <span>{shopStats.followers} followers</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 lg:ml-auto">
                  {user?.id === shop.owner_id && !isEditing && (
                    <Button
                      onClick={handleEdit}
                      className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                    >
                      <Icon name="Edit2" size={16} className="mr-2" />
                      Edit Shop
                    </Button>
                  )}
                  {isEditing && (
                    <>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="bg-white text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveWithImages}
                        disabled={imageUploads.uploadingProfile || imageUploads.uploadingBackground}
                        className="bg-green-600 text-white hover:bg-green-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {(imageUploads.uploadingProfile || imageUploads.uploadingBackground) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Icon name="Save" size={16} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shop Status Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shop.is_active ? 'active' : 'inactive')}`}>
                  {shop.is_active ? '✓ Active' : '⏸ Inactive'}
                </span>
                {shop.is_verified && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Icon name="CheckCircle" size={14} className="inline mr-1" />
                    Verified Business
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={16} className="text-yellow-400 fill-current" />
                  <span className="font-medium">{shopStats.averageRating}</span>
                  <span>({shopStats.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="TrendingUp" size={16} />
                  <span>{formatCurrency(shopStats.totalRevenue)} revenue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: 'BarChart3' },
                { id: 'products', label: 'Products', icon: 'Package' },
                { id: 'orders', label: 'Orders', icon: 'ShoppingBag' },
                { id: 'reviews', label: 'Reviews', icon: 'Star' },
                { id: 'settings', label: 'Settings', icon: 'Settings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  label: 'Products', 
                  value: isLoadingStats ? '...' : shopStats.totalProducts, 
                  icon: 'Package', 
                  color: 'bg-blue-500',
                  change: '+12%'
                },
                { 
                  label: 'Orders', 
                  value: isLoadingStats ? '...' : shopStats.totalOrders, 
                  icon: 'ShoppingBag', 
                  color: 'bg-green-500',
                  change: '+8%'
                },
                { 
                  label: 'Revenue', 
                  value: isLoadingStats ? '...' : formatCurrency(shopStats.totalRevenue), 
                  icon: 'Banknote', 
                  color: 'bg-purple-500',
                  change: '+15%'
                },
                { 
                  label: 'Rating', 
                  value: isLoadingStats ? '...' : `${shopStats.averageRating}★`, 
                  icon: 'Star', 
                  color: 'bg-yellow-500',
                  change: '+0.2'
                }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600 mt-1">
                        <Icon name="TrendingUp" size={12} className="inline mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <Icon name={stat.icon} size={24} className="text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* About Section */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Info" size={20} />
                  About Our Business
                </h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                      <input
                        name="name"
                        value={editData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter shop name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        name="description"
                        value={editData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Tell customers about your business..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          name="category"
                          value={editData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select category</option>
                          <option value="electronics">Electronics</option>
                          <option value="fashion">Fashion</option>
                          <option value="food">Food & Beverages</option>
                          <option value="health">Health & Beauty</option>
                          <option value="home">Home & Garden</option>
                          <option value="sports">Sports & Outdoors</option>
                          <option value="automotive">Automotive</option>
                          <option value="books">Books & Education</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          name="website"
                          value={editData.website}
                          onChange={handleInputChange}
                          type="url"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      {shop.description || 'No description provided yet. Share information about your business, what you sell, and what makes you unique.'}
                    </p>
                    {shop.category && (
                      <div className="flex items-center gap-2">
                        <Icon name="Tag" size={16} className="text-gray-400" />
                        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{shop.category}</span>
                      </div>
                    )}
                    {shop.website && (
                      <div className="flex items-center gap-2">
                        <Icon name="Globe" size={16} className="text-gray-400" />
                        <a 
                          href={shop.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {shop.website}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Phone" size={18} />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input
                          name="address"
                          value={editData.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Business address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          name="phone"
                          value={editData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          name="email"
                          value={editData.email}
                          onChange={handleInputChange}
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Business email"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {shop.address && (
                        <div className="flex items-start gap-3">
                          <Icon name="MapPin" size={16} className="text-gray-400 mt-0.5" />
                          <span className="text-gray-600">{shop.address}</span>
                        </div>
                      )}
                      {shop.phone && (
                        <div className="flex items-center gap-3">
                          <Icon name="Phone" size={16} className="text-gray-400" />
                          <span className="text-gray-600">{shop.phone}</span>
                        </div>
                      )}
                      {shop.email && (
                        <div className="flex items-center gap-3">
                          <Icon name="Mail" size={16} className="text-gray-400" />
                          <span className="text-gray-600">{shop.email}</span>
                        </div>
                      )}
                      {!shop.address && !shop.phone && !shop.email && (
                        <p className="text-gray-500 text-sm">No contact information provided</p>
                      )}
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm"
                      onClick={() => navigate('/add-product')}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Add Product
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm"
                      onClick={() => navigate('/shop-owner-dashboard')}
                    >
                      <Icon name="BarChart3" size={16} className="mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm"
                      onClick={() => navigate('/order-management')}
                    >
                      <Icon name="ShoppingBag" size={16} className="mr-2" />
                      Manage Orders
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Products */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Icon name="Package" size={18} />
                    Recent Products
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => navigate('/my-products')}>
                    View All
                  </Button>
                </div>
                {isLoadingStats ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentProducts.length > 0 ? (
                  <div className="space-y-3">
                    {recentProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Icon name="Package" size={16} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Package" size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No products yet</p>
                  </div>
                )}
              </div>

              {/* Recent Reviews */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Icon name="Star" size={18} />
                    Recent Reviews
                  </h3>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                {isLoadingStats ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse space-y-2">
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map(j => (
                            <div key={j} className="w-4 h-4 bg-gray-200 rounded"></div>
                          ))}
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Icon
                                key={star}
                                name="Star"
                                size={14}
                                className={`${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {review.user_name || 'Anonymous'}
                          </span>
                        </div>
                        {review.review && (
                          <p className="text-sm text-gray-600 line-clamp-2">{review.review}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Star" size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No reviews yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <ProductsTab />
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <OrdersTab />
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <ReviewsTab />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <ShopSettings shopData={shop} setShopData={setShop} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyShopProfile;