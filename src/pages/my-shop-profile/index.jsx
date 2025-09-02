import React, { useState, useEffect, useMemo } from 'react';
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
  
  // Determine if current user is the shop owner (computed after shop loads)
  const isOwnerView = useMemo(() => {
    if (!shop || !user) return false;
    // If no shopId in URL, this is "my shop" route - check if user owns the shop
    if (!shopId) return user.id === shop.owner_id;
    // If shopId in URL, this is public view - only owner if IDs match
    return user.id === shop.owner_id;
  }, [shop, user, shopId]);
  
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

  // Reset to overview tab if accessing owner-only tabs in public view
  useEffect(() => {
    if (!isOwnerView && (activeTab === 'orders' || activeTab === 'settings')) {
      setActiveTab('overview');
    }
  }, [isOwnerView, activeTab]);

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
      console.error('Shop data fetch error:', err);
      
      // Handle new users who don't have a shop yet
      if (err.message?.includes('Shop not found') || err.status === 404) {
        console.log('New user detected - no shop found, redirecting to dashboard');
        showToast('You need to create a shop first', 'info');
        navigate('/shop-owner-dashboard');
        return;
      }
      
      setError(err.message || 'Failed to load shop data');
    } finally {
      setLoading(false);
    }
  };

  const fetchShopStatistics = async (currentShopId = null) => {
    try {
      setIsLoadingStats(true);
      const shopIdToUse = currentShopId || shop?.id;
      const isOwnerView = !shopId && user?.id === shop?.owner_id;
      
      let productsResponse = [];
      let ordersResponse = [];
      let allProducts = [];
      
      if (isOwnerView) {
        // Owner view - use owner-specific APIs
        const [products, orders, reviews] = await Promise.all([
          api.getMyProducts(0, 5, true).catch(() => []),
          api.getShopOwnerRecentOrders(5).catch(() => []),
          api.getShopReviews(shopIdToUse || 'current', 1, 5).catch(() => ({ reviews: [] }))
        ]);
        productsResponse = products;
        ordersResponse = orders;
        
        // Get all products for count
        allProducts = await api.getMyProducts(0, 1000, false).catch(() => []);
      } else {
        // Public view - use public APIs  
        const reviews = await api.getShopReviews(shopIdToUse || 'current', 1, 5).catch(() => ({ reviews: [] }));
        
        // For public view, we can't get detailed product/order stats
        // We'll show basic stats from the shop object
        productsResponse = [];
        ordersResponse = [];
        allProducts = [];
      }

      // Calculate statistics
      const totalProducts = Array.isArray(allProducts) ? allProducts.length : 0;
      const activeProducts = Array.isArray(allProducts) 
        ? allProducts.filter(p => p.is_active).length 
        : 0;

      // Calculate revenue and orders (owner only)
      let totalRevenue = 0;
      let totalOrders = 0;
      if (isOwnerView) {
        const allOrders = await api.getShopOwnerOrders({ limit: 1000 }).catch(() => ({ orders: [] }));
        const orders = allOrders.orders || allOrders || [];
        totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        totalOrders = orders.length;
      }

      // Calculate rating from reviews
      const reviews = await api.getShopReviews(shopIdToUse || 'current', 1, 5).catch(() => ({ reviews: [] }));
      const reviewsList = reviews.reviews || [];
      const averageRating = reviewsList.length > 0 
        ? reviewsList.reduce((sum, review) => sum + review.rating, 0) / reviewsList.length 
        : 0;

      // Get shop followers count
      const followersCount = await api.getShopFollowersCount(shopIdToUse).catch(() => 0);

      setShopStats({
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue,
        averageRating: averageRating.toFixed(1),
        totalReviews: reviewsList.length,
        followers: followersCount || 0
      });

      setRecentProducts(Array.isArray(productsResponse) ? productsResponse.slice(0, 4) : []);
      setRecentOrders(Array.isArray(ordersResponse) ? ordersResponse.slice(0, 4) : []);
      setRecentReviews(reviewsList.slice(0, 3));

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
      {/* Decorative Background Elements - Matching Reference */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-2xl" />
      </div>
      
      <Header />
      
      {/* Modern Card-Based Layout */}
      <div className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        {/* Header with Brand Identity - Exact Reference Match */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-600">Shop Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-6">
            {shop?.name || "My Shop"}
          </h1>
          <div className="flex items-center justify-center gap-8 text-slate-600 mb-8">
            <div className="flex items-center gap-2">
              <Icon name="Star" size={20} className="text-yellow-500 fill-current" />
              <span className="font-semibold">{shopStats.averageRating || "5.0"}</span>
              <span className="text-sm">({shopStats.totalReviews || "48"} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="MapPin" size={16} />
              <span className="text-sm">{shop?.address || "Business Location"}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isOwnerView && (
              <button
                onClick={() => navigate('/shop-owner-dashboard')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:shadow-2xl hover:shadow-slate-800/25"
              >
                <Icon name="Settings" size={20} className="inline mr-2" />
                Manage Shop
              </button>
            )}
            {!isOwnerView && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Icon name="UserPlus" size={18} />
                  Follow Shop
                </button>
                <button className="flex-1 sm:flex-none px-6 py-4 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl font-semibold hover:bg-white hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Icon name="Share2" size={18} />
                  Share
                </button>
              </div>
            )}
            <button
              onClick={() => setActiveTab('products')}
              className="w-full sm:w-auto px-6 py-4 bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl font-semibold hover:bg-white hover:shadow-lg transition-all"
            >
              View Products
            </button>
          </div>
        </div>

        {/* Featured Product Hero - Exact Reference Match */}
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
                  <Icon name="Package" size={16} />
                  <span className="text-sm font-medium">Premium Collection</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {(shop?.description && !shop.description.includes('Tempor') && !shop.description.includes('Lorem') && !shop.description.includes('voluptate')) 
                    ? shop.description 
                    : "Discover Quality Products"}
                </h2>
                
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  Experience premium quality and exceptional service. Browse our carefully curated collection designed for your lifestyle.
                </p>

                <button 
                  onClick={() => setActiveTab('products')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-lime-400/25 transition-all transform hover:scale-105"
                >
                  View All Products
                  <div className="w-8 h-8 bg-slate-900/20 rounded-full flex items-center justify-center">
                    <Icon name="ArrowRight" size={16} />
                  </div>
                </button>

                {/* Social Links */}
                <div className="flex items-center gap-4 mt-8">
                  <span className="text-sm text-slate-400">Follow us on:</span>
                  <div className="flex gap-2">
                    {['Twitter', 'Instagram', 'Facebook', 'Youtube'].map((social) => (
                      <button key={social} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full transition-colors" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Content - Featured Product */}
              <div className="relative">
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="w-full h-80 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center mb-6">
                    {shop?.profile_photo || imageUploads.profileImagePreview ? (
                      <img 
                        src={imageUploads.profileImagePreview || shop.profile_photo} 
                        alt="Featured Product" 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <img 
                        src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=826&q=80" 
                        alt="Featured Product" 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Featured Product</h3>
                    <p className="text-slate-300 mb-4">Premium quality guaranteed</p>
                    <div className="flex items-center justify-center gap-2 text-lime-400 font-semibold">
                      <Icon name="Star" size={16} className="fill-current" />
                      <span>{shopStats.averageRating || "5.0"}</span>
                      <span className="text-slate-400">({shopStats.totalReviews || "48"} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Information Grid - Glass Morphism Effect */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Contact Information */}
          <div className="h-80">
            <div className="bg-white/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Icon name="Phone" size={16} className="text-blue-600" />
                </div>
                Contact Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-slate-200/50">
                    <Icon name="Phone" size={16} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-semibold text-slate-800">{shop?.phone || "+237 XXX XXX XXX"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-slate-200/50">
                    <Icon name="Mail" size={16} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-semibold text-slate-800">{shop?.email || "info@myshop.com"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-slate-200/50">
                    <Icon name="Clock" size={16} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Business Hours</p>
                    <p className="font-semibold text-slate-800">Mon-Sat: 8AM-8PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="h-80">
            <div className="bg-white/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Icon name="Shield" size={16} className="text-green-600" />
                </div>
                Trust & Safety
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50">
                  <Icon name="CheckCircle" size={24} className="text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">Verified</p>
                  <p className="text-xs text-slate-500">Identity</p>
                </div>
                <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50">
                  <Icon name="Star" size={24} className="text-yellow-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">Premium</p>
                  <p className="text-xs text-slate-500">Quality</p>
                </div>
                <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50">
                  <Icon name="Truck" size={24} className="text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">Fast</p>
                  <p className="text-xs text-slate-500">Delivery</p>
                </div>
                <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50">
                  <Icon name="RotateCcw" size={24} className="text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">Returns</p>
                  <p className="text-xs text-slate-500">30 Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="h-80">
            <div className="bg-white/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Icon name="Zap" size={16} className="text-purple-600" />
                </div>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-white/60 backdrop-blur-sm hover:bg-white/80 text-slate-800 rounded-2xl font-medium transition-all flex items-center gap-3 border border-slate-200/50 hover:border-slate-300/50">
                  <div className="w-8 h-8 bg-blue-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Icon name="MessageCircle" size={16} className="text-blue-600" />
                  </div>
                  <span>Chat with Shop</span>
                </button>
                <button className="w-full p-3 bg-white/60 backdrop-blur-sm hover:bg-white/80 text-slate-800 rounded-2xl font-medium transition-all flex items-center gap-3 border border-slate-200/50 hover:border-slate-300/50">
                  <div className="w-8 h-8 bg-green-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Icon name="Search" size={16} className="text-green-600" />
                  </div>
                  <span>Search Products</span>
                </button>
                <button className="w-full p-3 bg-white/60 backdrop-blur-sm hover:bg-white/80 text-slate-800 rounded-2xl font-medium transition-all flex items-center gap-3 border border-slate-200/50 hover:border-slate-300/50">
                  <div className="w-8 h-8 bg-purple-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Icon name="Filter" size={16} className="text-purple-600" />
                  </div>
                  <span>Filter Categories</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About Shop Owner */}
        <div className="mb-16">
          <div className="bg-white/30 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Icon name="User" size={24} />
              About the Shop Owner
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {shop?.owner_photo ? (
                      <img src={shop.owner_photo} alt="Owner" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" 
                        alt="Shop Owner" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{shop?.owner_name || "Shop Owner"}</h4>
                  <p className="text-sm text-gray-600 mb-4">Established 2020 • 4+ years experience</p>
                  <div className="flex justify-center gap-2">
                    {['Facebook', 'Instagram', 'Twitter'].map((social) => (
                      <button key={social} className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors">
                        <Icon name="ExternalLink" size={14} className="text-gray-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to our shop! We are passionate about providing high-quality products and exceptional customer service. 
                  With over 4 years of experience in the industry, we have built a reputation for reliability and excellence.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Our commitment is to offer you the best products at competitive prices, backed by our guarantee of quality and customer satisfaction. 
                  We carefully curate our inventory to ensure every item meets our high standards.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-2xl">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{shopStats.totalProducts || 150}</div>
                    <div className="text-xs sm:text-sm text-blue-600">Products</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-2xl">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{shopStats.totalOrders || 500}</div>
                    <div className="text-xs sm:text-sm text-green-600">Orders</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-2xl">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{shopStats.followers || 1200}</div>
                    <div className="text-xs sm:text-sm text-purple-600">Followers</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-2xl">
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">{shopStats.averageRating || "4.9"}</div>
                    <div className="text-xs sm:text-sm text-orange-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Product Categories - Exact Reference Match */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* New Gen Category */}
          <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:shadow-2xl transition-all group shadow-xl">
            <h4 className="text-lg font-bold text-slate-800 mb-4">New Gen Products</h4>
            <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
              {recentProducts[0]?.image ? (
                <img src={recentProducts[0].image} alt="New Gen" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" 
                  alt="New Gen Products" 
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{shopStats.activeProducts || 24} items</span>
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <Icon name="ArrowRight" size={16} className="text-white" />
              </div>
            </div>
          </div>

          {/* Premium Category */}
          <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:shadow-2xl transition-all group shadow-xl">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Premium Collection</h4>
            <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
              {recentProducts[1]?.image ? (
                <img src={recentProducts[1].image} alt="Premium" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=898&q=80" 
                  alt="Premium Collection" 
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{Math.ceil((shopStats.totalProducts || 24) * 0.3)} items</span>
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <Icon name="ArrowRight" size={16} className="text-white" />
              </div>
            </div>
          </div>

          {/* Latest Category */}
          <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:shadow-2xl transition-all group shadow-xl">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Latest Arrivals</h4>
            <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
              {recentProducts[2]?.image ? (
                <img src={recentProducts[2].image} alt="Latest" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Latest Arrivals" 
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{Math.ceil((shopStats.totalProducts || 24) * 0.2)} items</span>
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <Icon name="ArrowRight" size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Product Grid - Exact Reference Match */}
        <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/20 mb-16 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">More Products</h2>
              <p className="text-slate-600">Discover our complete collection</p>
            </div>
            <div className="text-sm text-slate-500">
              {shopStats.totalProducts || 24} products
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentProducts.length > 0 ? (
              recentProducts.slice(0, 8).map((product, index) => (
                <div key={product.id || index} className="group bg-white/30 backdrop-blur-md rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-2xl mb-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <img 
                        src={`https://images.unsplash.com/photo-${['1560472354-b33ff0c44a43', '1542291026-7eec264c27ff', '1525966222134-fcfa99b8ae77', '1594633313593-bab3825d0caf', '1571945153237-4929e783af4a', '1507003211169-0a1dd7228f2d', '1551698618-1dfe5d97d256', '1549298916-b41d501d3772'][index % 8]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80`}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    
                    {/* Heart Icon */}
                    <div className="absolute top-3 right-3">
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-all">
                        <Icon name="Heart" size={16} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute bottom-3 right-3">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <Icon name="ArrowUpRight" size={16} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {product.name || `Product ${index + 1}`}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      Premium quality product with excellent features
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(product.price || 25000)}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={16} className="text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-700">5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Placeholder products matching reference design
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="group bg-white/30 backdrop-blur-md rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-2xl mb-4">
                    <img 
                      src={`https://images.unsplash.com/photo-${['1560472354-b33ff0c44a43', '1542291026-7eec264c27ff', '1525966222134-fcfa99b8ae77', '1594633313593-bab3825d0caf', '1571945153237-4929e783af4a', '1507003211169-0a1dd7228f2d', '1551698618-1dfe5d97d256', '1549298916-b41d501d3772'][index % 8]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80`}
                      alt={`Premium Product ${index + 1}`}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Heart Icon */}
                    <div className="absolute top-3 right-3">
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-all">
                        <Icon name="Heart" size={16} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute bottom-3 right-3">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <Icon name="ArrowUpRight" size={16} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      Premium Product {index + 1}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      High-quality product with modern design
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(25000 + (index * 5000))}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={16} className="text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-700">5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mb-16">
          <div className="bg-white/30 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0 flex items-center gap-2">
                <Icon name="MessageSquare" size={24} />
                Customer Reviews
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={20} className="text-yellow-500 fill-current" />
                  <span className="text-xl font-bold text-gray-800">{shopStats.averageRating || "4.9"}</span>
                </div>
                <span className="text-gray-600">({shopStats.totalReviews || 124} reviews)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentReviews.length > 0 ? (
                recentReviews.map((review, index) => (
                  <div key={review.id || index} className="bg-white/50 p-4 sm:p-6 rounded-2xl border border-white/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs sm:text-sm">
                          {review.customer_name?.charAt(0) || "A"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{review.customer_name || "Anonymous"}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Icon key={i} name="Star" size={12} className={`${i < (review.rating || 5) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {review.comment || "Great products and excellent service. Highly recommended!"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString() : "2 days ago"}
                    </p>
                  </div>
                ))
              ) : (
                // Placeholder reviews
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white/50 p-4 sm:p-6 rounded-2xl border border-white/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs sm:text-sm">
                          {['A', 'M', 'S'][index]}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{['Alice K.', 'Mike R.', 'Sarah L.'][index]}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Icon key={i} name="Star" size={12} className="text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {[
                        "Excellent quality products and fast delivery. Will definitely order again!",
                        "Great customer service and professional handling. Highly recommend this shop.",
                        "Amazing shopping experience. Products exactly as described and well packaged."
                      ][index]}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {[3, 5, 7][index]} days ago
                    </p>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-6">
              <button className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-gray-800 rounded-2xl font-semibold hover:shadow-lg transition-all">
                View All Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyShopProfile;
