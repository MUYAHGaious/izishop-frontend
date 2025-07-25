import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDataCache } from '../../contexts/DataCacheContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import api from '../../services/api';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import ShopHero from './components/ShopHero';
import ShopStats from './components/ShopStats';
import ShopOwnerInfo from './components/ShopOwnerInfo';
import ProductGrid from './components/ProductGrid';
import ReviewsSection from './components/ReviewsSection';
import AboutSection from './components/AboutSection';
import FloatingContact from './components/FloatingContact';
import { showToast } from '../../components/ui/Toast';

const ShopProfile = () => {
  const [searchParams] = useSearchParams();
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { fetchWithCache, invalidateCache, isLoading } = useDataCache();
  const { subscribeToProductUpdates, isConnected } = useWebSocket();
  
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [shopData, setShopData] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // Get shop identifier from URL
  const shopId = id || searchParams.get('id');
  const shopSlug = slug;

  useEffect(() => {
    loadShopData();
  }, [shopId, shopSlug, user]);

  // Set up real-time updates for shop data
  useEffect(() => {
    if (!isConnected || !shopData?.id) return;

    const unsubscribeProducts = subscribeToProductUpdates((updateData) => {
      console.log('Product update received for shop:', updateData);
      
      if (updateData.shop_id === shopData.id) {
        // Invalidate and refresh product data
        invalidateCache(`shop-products-${shopData.id}`);
        loadProducts(shopData.id);
        
        // If it's a new product, show notification
        if (updateData.action === 'created') {
          showToast(`New product added: ${updateData.product?.name}`, 'info');
        }
      }
    });

    return () => {
      unsubscribeProducts();
    };
  }, [isConnected, shopData?.id, subscribeToProductUpdates, invalidateCache]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let shop = null;
      const currentShopId = shopId || id;
      
      console.log('Loading shop data for:', { shopId: currentShopId, slug, id });
      
      if (currentShopId) {
        // Use caching for shop data
        shop = await fetchWithCache(`shop-${currentShopId}`, () => api.getShop(currentShopId), { shopId: currentShopId });
        console.log('Shop data loaded:', shop);
      } else if (slug) {
        // For slug-based URLs, search for shop by slug
        const response = await fetchWithCache(`shop-slug-${slug}`, () => api.getAllShops(1, 100, slug), { slug });
        if (response && response.shops) {
          shop = response.shops.find(s => s.slug === slug || s.name.toLowerCase().includes(slug.toLowerCase()));
        }
        console.log('Shop found by slug:', shop);
      }
      
      if (!shop) {
        setError('Shop not found');
        return;
      }
      
      setShopData(shop);
      setIsOwner(isAuthenticated() && user?.id === shop.owner_id);
      
      // Load products and reviews with caching (don't let these errors affect main shop data)
      try {
        await Promise.all([
          loadProducts(shop.id),
          loadReviews(shop.id)
        ]);
      } catch (productError) {
        console.warn('Error loading products/reviews, but continuing with shop data:', productError);
        // Set empty arrays as fallbacks
        setProducts([]);
        setReviews([]);
      }
      
    } catch (error) {
      console.error('Error loading shop data:', error);
      setError(error.message || 'Failed to load shop data');
      showToast('Failed to load shop data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (shopId) => {
    try {
      const response = await fetchWithCache(`shop-products-${shopId}`, () => api.getShopProducts(shopId), { shopId });
      console.log('Products loaded for shop:', response);
      setProducts(response.products || response || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const loadReviews = async (shopId) => {
    try {
      const response = await fetchWithCache(`shop-reviews-${shopId}`, () => api.getShopReviews(shopId), { shopId });
      console.log('Reviews loaded for shop:', response);
      setReviews(response.reviews || response || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    }
  };

  const handleFollow = async (isFollowing) => {
    if (!isAuthenticated()) {
      showToast('Please login to follow shops', 'info');
      navigate('/authentication-login-register');
      return;
    }
    
    try {
      if (isFollowing) {
        await api.followShop(shopData.id);
        showToast('Shop followed successfully!', 'success');
      } else {
        await api.unfollowShop(shopData.id);
        showToast('Shop unfollowed successfully!', 'success');
      }
      
      // Invalidate cache and refresh shop data
      invalidateCache(`shop-${shopData.id}`);
      loadShopData();
    } catch (error) {
      console.error('Error following/unfollowing shop:', error);
      showToast('Failed to update follow status', 'error');
    }
  };

  const handleContact = (type) => {
    if (!shopData) return;
    
    if (!isAuthenticated()) {
      showToast('Please login to contact the shop', 'info');
      navigate('/authentication-login-register');
      return;
    }
    
    switch (type) {
      case 'chat':
        // Open chat interface (placeholder for future implementation)
        showToast('Chat feature coming soon!', 'info');
        console.log('Opening chat with shop:', shopData.name);
        break;
      case 'call':
        if (shopData.phone) {
          window.open(`tel:${shopData.phone}`);
          showToast(`Calling ${shopData.name}...`, 'info');
        } else {
          showToast('Phone number not available', 'error');
        }
        break;
      case 'email':
        if (shopData.email) {
          window.open(`mailto:${shopData.email}?subject=Inquiry about ${shopData.name}`);
          showToast(`Opening email to ${shopData.name}...`, 'info');
        } else {
          showToast('Email not available', 'error');
        }
        break;
      case 'whatsapp':
        if (shopData.phone) {
          const message = encodeURIComponent(`Hello! I'm interested in your products at ${shopData.name}.`);
          window.open(`https://wa.me/${shopData.phone.replace(/\D/g, '')}?text=${message}`);
          showToast('Opening WhatsApp...', 'info');
        } else {
          showToast('WhatsApp contact not available', 'error');
        }
        break;
      default:
        showToast('Contact options: Call, Email, or Chat', 'info');
    }
  };

  if (loading || isLoading('shop-products')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-20">
          <div className="animate-pulse">
            <div className="h-48 md:h-64 lg:h-80 bg-muted" />
            <div className="container mx-auto px-4 py-8">
              <div className="space-y-6">
                <div className="h-8 bg-muted rounded w-1/3" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-muted rounded-xl" />
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-48 bg-muted rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <MobileBottomTab />
      </div>
    );
  }

  if (error || !shopData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || 'Shop not found'}
            </h1>
            <button
              onClick={() => navigate('/shops-listing')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse All Shops
            </button>
          </div>
        </div>
        <MobileBottomTab />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', path: '/product-catalog' },
    { label: 'Shops', path: '/shops-listing' },
    { label: shopData.name, path: shopSlug ? `/shop/${shopSlug}` : `/shops/${shopData.id}` }
  ];

  const tabs = [
    { id: 'products', label: 'Products', count: products.length },
    { id: 'reviews', label: 'Reviews', count: reviews.length },
    { id: 'about', label: 'About' }
  ];

  // Add management tab for shop owners
  if (isOwner) {
    tabs.push({ id: 'manage', label: 'Manage Shop' });
  }

  const statsData = {
    salesVolume: shopData.total_sales ? `${(shopData.total_sales / 1000).toFixed(1)}K XAF` : "0 XAF",
    salesChange: 15.3,
    responseTime: "< 2 hours",
    shippingTime: "1-3 days",
    satisfactionRate: Math.round(shopData.rating * 20) // Convert 5-star to percentage
  };

  const ratingDistribution = {
    5: Math.floor(reviews.length * 0.68),
    4: Math.floor(reviews.length * 0.24),
    3: Math.floor(reviews.length * 0.06),
    2: Math.floor(reviews.length * 0.01),
    1: Math.floor(reviews.length * 0.01)
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 lg:pt-20 pb-20 lg:pb-8">
        {/* Shop Hero Section */}
        <ShopHero 
          shop={shopData} 
          onFollow={handleFollow}
          onContact={() => handleContact('general')}
          isOwner={isOwner}
        />

        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="flex items-center border-b border-border mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-text-secondary'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in">
                {activeTab === 'products' && (
                  <ProductGrid products={products} shopId={shopData.id} />
                )}
                
                {activeTab === 'reviews' && (
                  <ReviewsSection 
                    reviews={reviews}
                    overallRating={shopData.rating}
                    ratingDistribution={ratingDistribution}
                  />
                )}
                
                {activeTab === 'about' && (
                  <AboutSection shop={shopData} />
                )}
                
                {activeTab === 'manage' && isOwner && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Shop Management</h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => navigate('/shop-owner-dashboard')}
                        className="w-full p-4 text-left bg-surface border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        <h4 className="font-medium">Go to Dashboard</h4>
                        <p className="text-sm text-text-secondary">Manage products, orders, and analytics</p>
                      </button>
                      <button
                        onClick={() => navigate('/product-management')}
                        className="w-full p-4 text-left bg-surface border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        <h4 className="font-medium">Manage Products</h4>
                        <p className="text-sm text-text-secondary">Add, edit, or remove products</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <ShopStats stats={statsData} />
              <ShopOwnerInfo owner={shopData.owner || { name: 'Unknown', photo: '/default-avatar.png', email: '', phone: '', memberSince: '', bio: '', certifications: [] }} />
            </div>
          </div>
        </div>
      </main>

      <FloatingContact shop={shopData} onContact={handleContact} />
      <MobileBottomTab />
    </div>
  );
};

export default ShopProfile;

