import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import ShopCard from './components/ShopCard';
import FilterPanel from './components/FilterPanel';
import FeaturedShops from './components/FeaturedShops';
import CreateShopModal from '../../components/ui/CreateShopModal';
import { useAuth } from '../../contexts/AuthContext';
import { useDataCache } from '../../contexts/DataCacheContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import api from '../../services/api';
import { showToast } from '../../components/ui/Toast';
import Footer from '../landing-page/components/Footer';

const ShopsListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { fetchWithCache, invalidateCache, isLoading } = useDataCache();
  const { subscribeToProductUpdates, isConnected } = useWebSocket();
  
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultsCount, setResultsCount] = useState(0);
  const [isCreateShopOpen, setIsCreateShopOpen] = useState(false);
  const [error, setError] = useState(null);

  // API functions for fetching shops data
  const fetchShops = useCallback(async (params = {}) => {
    try {
      const { page = 1, limit = 100, search = '', category = '', sort = 'relevance', ...filters } = params;
      console.log('=== FETCHING SHOPS DEBUG ===');
      console.log('Params:', { page, limit, search, category, sort, filters });
      console.log('API base URL:', 'http://localhost:8000/api');
      console.log('Expected endpoint: /api/shops');
      
      const response = await api.getAllShops(page, limit, search, category, sort, filters);
      console.log('=== SHOPS API RESPONSE ===');
      console.log('Response type:', typeof response);
      console.log('Response is array:', Array.isArray(response));
      console.log('Response length:', response?.length);
      console.log('Full response:', response);
      
      // Also check shop count for debugging
      try {
        const countResponse = await fetch('http://localhost:8000/api/shops/debug/count');
        const countData = await countResponse.json();
        console.log('=== SHOP COUNT DEBUG ===');
        console.log('Shop count data:', countData);
      } catch (countError) {
        console.log('Could not fetch shop count:', countError);
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching shops:', error);
      console.error('Error details:', error.message, error.response?.data);
      
      // Throw error instead of returning mock data - let the component handle empty states
      throw error;
    }
  }, []);

  const fetchFeaturedShops = useCallback(async () => {
    try {
      console.log('Fetching featured shops...');
      const response = await api.getFeaturedShops();
      console.log('API response for getFeaturedShops:', response);
      return response;
    } catch (error) {
      console.error('Error fetching featured shops:', error);
      console.error('Featured shops error details:', error.message, error.response?.data);
      
      // Throw error instead of returning mock data - let the component handle empty states
      throw error;
    }
  }, []);

  // Featured shops state
  const [featuredShops, setFeaturedShops] = useState([]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'sports', label: 'Sports' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'home', label: 'Home & Garden' },
    { id: 'automotive', label: 'Automotive' },
    { id: 'books', label: 'Books' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  // Load initial data - removed problematic dependencies to prevent infinite loops
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('🔄 loadInitialData triggered - URL searchParams changed');
        setLoading(true);
        setError(null);

        // Get URL parameters
        const query = searchParams.get('q') || '';
        const category = searchParams.get('category') || '';
        const sort = searchParams.get('sort') || 'newest';
        
        setSearchQuery(query);
        if (category) {
          setFilters(prev => ({ ...prev, categories: [category] }));
        }
        setSortBy(sort);

        // Load shops with caching - use static params to avoid dependency loops
        const shopsParams = {
          page: 1,
          limit: 100,
          search: query,
          category: category,
          sort: sort
        };

        const [shopsData, featuredData] = await Promise.all([
          fetchWithCache ? fetchWithCache('shops', () => fetchShops(shopsParams), shopsParams) : fetchShops(shopsParams),
          fetchWithCache ? fetchWithCache('featured-shops', fetchFeaturedShops, {}) : fetchFeaturedShops()
        ]);



        if (shopsData) {
          // Handle new standardized API response format
          if (shopsData.success && shopsData.data) {
            // Standard success response with data
            const shops = Array.isArray(shopsData.data) ? shopsData.data : [];
            const meta = shopsData.meta || {};
            

            
            setShops(shops);
            setResultsCount(meta.total_count || shops.length);
            setHasMore(meta.has_more || false);
            setCurrentPage(meta.pagination?.page || 1);
          } else if (shopsData.success === true && Array.isArray(shopsData.data) && shopsData.data.length === 0) {
            // Empty data response

            setShops([]);
            setResultsCount(0);
            setHasMore(false);
            
            // Show the reason if provided
            if (shopsData.reason) {
              console.log('No shops available:', shopsData.reason);
              if (shopsData.suggestions) {
                console.log('Suggestions:', shopsData.suggestions);
              }
            }
          } else {
            // Legacy format support
            const shops = Array.isArray(shopsData) ? shopsData : (shopsData.shops || []);

            setShops(shops);
            setResultsCount(shops.length);
            setHasMore(false);
          }
        } else {
          console.log('No shopsData received');
          setShops([]);
          setResultsCount(0);
        }

        if (featuredData) {
          setFeaturedShops(featuredData);
        } else {
          setFeaturedShops([]);
        }

      } catch (error) {
        console.error('Error loading shops data:', error);
        
        // Check if it's a network error or API error
        let errorMessage = 'Failed to load shops. Please try again.';
        if (error.message && error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Shops service not available.';
        }
        
        setError(errorMessage);
        setShops([]); // Show empty state instead of mock data
        setResultsCount(0);
        
        showToast({
          type: 'error',
          message: errorMessage,
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [searchParams]);

  // Set up real-time updates for shops - simplified to prevent loops
  useEffect(() => {
    if (!isConnected || !subscribeToProductUpdates) return;

    const unsubscribeShops = subscribeToProductUpdates((updateData) => {
      console.log('Shop-related update received:', updateData);
      
      // If a shop is updated, just invalidate cache - don't auto-refresh to prevent loops
      if (updateData.type === 'shop_update') {
        if (invalidateCache) {
          invalidateCache('shops');
          invalidateCache('featured-shops');
        }
        
        // Show a toast to let user know data has been updated
        showToast({
          type: 'info',
          message: 'Shop data updated',
          duration: 3000
        });
      }
    });

    return unsubscribeShops;
  }, [isConnected]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous searches
    if (loading) return;
    
    try {
      console.log('🔎 Search triggered:', searchQuery);
      setLoading(true);
      setError(null);
      
      // Reset pagination when search changes (this is correct behavior)  
      setCurrentPage(1);
      
      // Update URL params
      const newParams = new URLSearchParams(searchParams);
      if (searchQuery.trim()) {
        newParams.set('q', searchQuery.trim());
      } else {
        newParams.delete('q');
      }
      setSearchParams(newParams);

      // Fetch new search results
      const shopsParams = {
        page: 1,
        limit: 100,
        search: searchQuery.trim(),
        category: searchParams.get('category') || '',
        sort: sortBy,
        ...filters
      };

      // Force refresh for new search
      const shopsData = await fetchWithCache('shops', () => fetchShops(shopsParams), shopsParams, true);
      
      if (shopsData) {
        const shops = Array.isArray(shopsData) ? shopsData : (shopsData.shops || []);
        console.log('🔎 Setting search results:', shops.length, 'shops');
        setShops(shops); // This should replace shops when searching - this is correct
        setResultsCount(shops.length);
        setHasMore(false);
      }

    } catch (error) {
      console.error('Error searching shops:', error);
      setError('Search failed. Please try again.');
      showToast({
        type: 'error',
        message: 'Search failed. Please try again.',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback(async (filterType, value) => {
    // Prevent multiple simultaneous filter operations
    if (loading) return;
    
    try {
      console.log('🔍 Filter change triggered:', filterType, value);
      setLoading(true);
      setError(null);
      
      const newFilters = {
        ...filters,
        [filterType]: value
      };
      setFilters(newFilters);

      // Reset pagination when filter changes (this is correct behavior)
      setCurrentPage(1);
      
      // Fetch filtered results
      const shopsParams = {
        page: 1,
        limit: 100,
        search: searchQuery,
        category: searchParams.get('category') || '',
        sort: sortBy,
        ...newFilters
      };

      const shopsData = await fetchWithCache('shops', () => fetchShops(shopsParams), shopsParams, true);
      
      if (shopsData) {
        const shops = Array.isArray(shopsData) ? shopsData : (shopsData.shops || []);
        console.log('🔍 Setting filtered shops:', shops.length, 'shops');
        setShops(shops); // This should replace shops when filtering - this is correct
        setResultsCount(shops.length);
        setHasMore(false);
      }

    } catch (error) {
      console.error('Error filtering shops:', error);
      setError('Filter failed. Please try again.');
      showToast('Filter failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, filters, fetchWithCache]);

  const handleSortChange = useCallback(async (newSort) => {
    // Prevent multiple simultaneous sort operations
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      setSortBy(newSort);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('sort', newSort);
      setSearchParams(newParams);

      // Try to fetch from API first, but fall back to client-side sorting if needed
      let shopsData;
      try {
      const shopsParams = {
        page: 1,
        limit: 100,
        search: searchQuery,
        category: searchParams.get('category') || '',
        sort: newSort,
        ...filters
      };

        shopsData = await fetchWithCache('shops', () => fetchShops(shopsParams), shopsParams, true);
      } catch (apiError) {
        console.log('API sorting failed, using client-side sorting:', apiError);
        // If API fails, we'll sort client-side using current state
        shopsData = null; // Signal to use client-side sorting
      }
      
      if (shopsData) {
        // API sorting succeeded - use new data and reset pagination
        let shops = Array.isArray(shopsData) ? shopsData : (shopsData.shops || []);
        
        console.log('🔄 Sort via API - setting', shops.length, 'shops');
        setShops(shops);
        setResultsCount(shops.length);
        setHasMore(false);
        setCurrentPage(1);
      } else {
        // API sorting failed - use client-side sorting on current shops
        console.log('🔄 Sort client-side - using current shops state');
        setShops(prevShops => {
          let sortedShops = [...prevShops];
          
          if (newSort === 'newest') {
            sortedShops = sortedShops.sort((a, b) => {
              const dateA = new Date(a.created_at || a.createdAt || 0);
              const dateB = new Date(b.created_at || b.createdAt || 0);
              return dateB - dateA; // Newest first
            });
          } else if (newSort === 'rating') {
            sortedShops = sortedShops.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
          } else if (newSort === 'popularity') {
            sortedShops = sortedShops.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
          }
          // 'relevance' keeps original order
          
          console.log('🔄 Client-side sort complete -', sortedShops.length, 'shops');
          return sortedShops;
        });
      }

    } catch (error) {
      console.error('Error sorting shops:', error);
      setError('Sort failed. Please try again.');
      showToast('Sort failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, fetchWithCache, searchParams, setSearchParams]);

  const handleFollowShop = useCallback(async (shopId, isFollowing) => {
    if (!isAuthenticated()) {
      showToast('Please login to follow shops', 'error');
      navigate('/authentication-login-register');
      return;
    }

    try {
      // Optimistically update UI
      setShops(prev => prev.map(shop => 
        shop.id === shopId ? { ...shop, isFollowing } : shop
      ));

      // Make API call
      if (isFollowing) {
        await api.followShop(shopId);
        showToast('Shop followed successfully', 'success');
      } else {
        await api.unfollowShop(shopId);
        showToast('Shop unfollowed successfully', 'success');
      }

      // Invalidate cache to refresh data
      invalidateCache('shops');

    } catch (error) {
      console.error('Error following/unfollowing shop:', error);
      // Revert optimistic update on error
      setShops(prev => prev.map(shop => 
        shop.id === shopId ? { ...shop, isFollowing: !isFollowing } : shop
      ));
      showToast('Failed to update follow status', 'error');
    }
  }, [isAuthenticated, navigate, invalidateCache]);

  const handleVisitShop = useCallback((shopId) => {
    console.log('Visiting shop:', shopId);
    navigate(`/my-shop-profile/${shopId}`);
  }, [navigate]);

  const handleQuickPreview = useCallback((shopId) => {
    console.log('Quick preview shop:', shopId);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loading) {
      console.log('📄 LoadMore skipped - hasMore:', hasMore, 'loading:', loading);
      return;
    }
    
    try {
      console.log('📄 LoadMore triggered - current shops:', shops.length, 'currentPage:', currentPage);
      setLoading(true);
      setError(null);

      const nextPage = currentPage + 1;
      const shopsParams = {
        page: nextPage,
        limit: 100,
        search: searchQuery,
        category: searchParams.get('category') || '',
        sort: sortBy,
        ...filters
      };

      console.log('📄 Fetching page', nextPage, 'with params:', shopsParams);
      const shopsData = await fetchWithCache('shops', () => fetchShops(shopsParams), shopsParams, true);
      
      if (shopsData && shopsData.shops) {
        console.log('📄 Appending', shopsData.shops.length, 'more shops to existing', shops.length);
        setShops(prev => [...prev, ...shopsData.shops]);
        setCurrentPage(nextPage);
        setHasMore(shopsData.shops.length >= 20);
        
        // Update total count if provided
        if (shopsData.total) {
          setResultsCount(shopsData.total);
        }
        
        console.log('📄 LoadMore complete - total shops now:', shops.length + shopsData.shops.length);
      } else {
        console.log('📄 No more shops found, setting hasMore to false');
        setHasMore(false);
      }

    } catch (error) {
      console.error('Error loading more shops:', error);
      setError('Failed to load more shops.');
      showToast('Failed to load more shops', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, hasMore, loading, searchQuery, searchParams, sortBy, filters, fetchWithCache]);

  const handleCreateShop = useCallback(async () => {
    console.log('Create shop clicked. Auth status:', {
      isAuthenticated: isAuthenticated(),
      user: user,
      role: user?.role,
      token: !!localStorage.getItem('authToken')
    });
    
    if (!isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      showToast('Please login to create a shop', 'info');
      navigate('/authentication-login-register');
      return;
    }
    
    if (user?.role !== 'SHOP_OWNER') {
      console.log('User is not a shop owner:', user?.role);
      showToast('Only shop owners can create shops', 'error');
      navigate('/authentication-login-register');
      return;
    }
    
    // Check if user already has a shop
    try {
      const userShops = await api.getMyShops();
      if (userShops && userShops.length > 0) {
        console.log('User already has shops:', userShops);
        
        if (userShops.length === 1) {
          // User has one shop - ask if they want to view it or create another
          const shouldViewCurrent = window.confirm(
            `You already have a shop called "${userShops[0].name}". Would you like to view your current shop instead? Click "Cancel" to create another shop.`
          );
          
          if (shouldViewCurrent) {
            navigate(`/shop-profile/${userShops[0].id}`);
            return;
          }
        } else {
          // User has multiple shops - show selection
          const shopNames = userShops.map(shop => shop.name).join(', ');
          const shouldChoose = window.confirm(
            `You already have ${userShops.length} shops: ${shopNames}. Would you like to choose which shop to view? Click "Cancel" to create another shop.`
          );
          
          if (shouldChoose) {
            showToast('Feature coming soon: Shop selection menu', 'info');
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error checking user shops:', error);
      // Continue with shop creation if check fails
    }
    
    console.log('Opening create shop modal');
    // Open create shop modal
    setIsCreateShopOpen(true);
  }, [isAuthenticated, user, navigate]);

  // Simple, working filter system
  let filteredShops = [...shops]; // Start with all shops
  
  // Apply category filter
  if (filters.categories && filters.categories.length > 0 && filters.categories[0] !== 'all') {
    filteredShops = filteredShops.filter(shop => {
      // Check multiple possible category fields
      const shopCategory = shop.category || shop.category_id || shop.category_name || '';
      const filterCategory = filters.categories[0];
      
      // Simple matching - if category contains the filter or vice versa
      return shopCategory.toLowerCase().includes(filterCategory.toLowerCase()) || 
             filterCategory.toLowerCase().includes(shopCategory.toLowerCase());
    });
  }
  
  // Apply location filter
  if (filters.location && filters.location.trim()) {
    filteredShops = filteredShops.filter(shop => {
      const shopLocation = shop.address || shop.location || shop.city || shop.region || '';
      return shopLocation.toLowerCase().includes(filters.location.toLowerCase());
    });
  }
  
  // Apply rating filter
  if (filters.minRating && filters.minRating > 0) {
    filteredShops = filteredShops.filter(shop => {
      const shopRating = shop.average_rating || shop.rating || shop.rating_score || 0;
      return shopRating >= filters.minRating;
    });
  }
  
  // Apply verification filter
  if (filters.verification && filters.verification.length > 0) {
    filteredShops = filteredShops.filter(shop => {
      const isVerified = shop.is_verified || shop.verified || shop.verification_status === 'verified';
      return filters.verification.includes(isVerified ? 'verified' : 'unverified');
    });
  }
  
  // Apply features filter
  if (filters.features && filters.features.length > 0) {
    filteredShops = filteredShops.filter(shop => {
      const shopFeatures = shop.features || shop.shop_features || shop.amenities || [];
      return filters.features.some(feature => shopFeatures.includes(feature));
    });
  }
  
  // Apply sorting
  if (sortBy === 'newest') {
    filteredShops.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || a.updated_at || a.updatedAt || 0);
      const dateB = new Date(b.created_at || b.createdAt || b.updated_at || b.updatedAt || 0);
      return dateB - dateA; // Newest first
    });
  } else if (sortBy === 'rating') {
    filteredShops.sort((a, b) => {
      const ratingA = a.average_rating || a.rating || a.rating_score || 0;
      const ratingB = b.average_rating || b.rating || b.rating_score || 0;
      return ratingB - ratingA; // Highest rating first
    });
  } else if (sortBy === 'popularity') {
    filteredShops.sort((a, b) => {
      const popularityA = a.total_reviews || a.review_count || a.followers || 0;
      const popularityB = b.total_reviews || b.review_count || b.followers || 0;
      return popularityB - popularityA; // Most popular first
    });
  }
  // 'relevance' keeps original order



  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>
      
      <main className="pt-16 pb-16 lg:pb-0">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <Icon name="AlertCircle" size={20} className="text-red-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Professional Hero Section */}
        <div className="relative bg-gradient-to-br from-teal-50 via-white to-blue-50 overflow-hidden">
          <div className="absolute inset-0 opacity-60" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.3'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <div className="relative container mx-auto px-6 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-4">
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                  Discover
                  <span className="text-teal-600 block mt-2">
                    Amazing Shops
                  </span>
                </h1>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Find the perfect shops for all your needs across Cameroon. From verified stores to individual sellers.
                </p>
              </div>
              
              {/* Enhanced Search Section */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 max-w-2xl mx-auto mb-6">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Icon name="Search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search for shops, brands, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-150"
                    />
                  </div>
                  <button
                    type="submit"
                                          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-150 shadow-md hover:shadow-lg"
                  >
                    Search
                  </button>
                </form>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                  onClick={handleCreateShop}
                                     className="flex items-center gap-3 px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl text-gray-700 font-medium hover:bg-white hover:shadow-md transition-all duration-150"
                >
                  <Icon name="Plus" size={18} />
                  Create Your Shop
                </button>
                
                {/* Connection Status */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>{isConnected ? 'Live updates enabled' : 'Offline mode'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Shops */}
        <ErrorBoundary>
          <FeaturedShops 
            shops={featuredShops}
            onVisitShop={handleVisitShop}
            onFollowShop={handleFollowShop}
          />
        </ErrorBoundary>

        {/* Enhanced Category Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 border-b border-gray-100">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Browse by Category</h2>
              <span className="text-sm text-gray-500">{resultsCount} shops found</span>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => {
                const isActive = (category.id === 'all' && !filters.categories?.length) || filters.categories?.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleFilterChange('categories', category.id === 'all' ? [] : [category.id])}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 border ${
                      isActive
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700'
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 min-h-screen">
          <div className="container mx-auto px-6 py-6">
            <div className="flex gap-8">
              {/* Enhanced Desktop Filter Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-24">
                  <FilterPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    categories={categories}
                  />
                </div>
              </div>

              {/* Main Content with Professional Layout */}
              <div className="flex-1 max-w-none">
                {/* Mobile Controls */}
                <div className="lg:hidden flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 shadow-sm"
                  >
                    <Icon name="SlidersHorizontal" size={18} />
                    Filters
                    {Object.keys(filters).length > 0 && (
                      <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-1">
                        {Object.keys(filters).length}
                      </span>
                    )}
                  </button>
                  
                  <div className="relative flex-1">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Icon name="ChevronDown" size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Desktop Sort Controls */}
                <div className="hidden lg:flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900">All Shops</h3>
                    {Object.keys(filters).length > 0 && (
                      <button
                        onClick={() => setFilters({})}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-all duration-150"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none cursor-pointer pr-12 shadow-sm hover:shadow-md transition-all duration-150"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Icon name="ChevronDown" size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Enhanced Shops Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredShops.map((shop) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      onVisitShop={handleVisitShop}
                      onFollowShop={handleFollowShop}
                      onQuickPreview={handleQuickPreview}
                    />
                  ))}
                </div>

                {/* Professional Loading Skeletons */}
                {(loading || isLoading('shops')) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl" />
                          <div className="space-y-3">
                            <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-3/4" />
                            <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-1/2" />
                            <div className="flex gap-2">
                              <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-16" />
                              <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20" />
                            </div>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <div className="h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex-1" />
                            <div className="h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-10" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Enhanced Load More Button */}
                {hasMore && !loading && !isLoading('shops') && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleLoadMore}
                                             className="flex items-center gap-3 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-150 shadow-md hover:shadow-lg"
                    >
                      <Icon name="Plus" size={18} />
                      Load More Shops
                    </button>
                  </div>
                )}

                {/* Enhanced No Results State */}
                {filteredShops.length === 0 && !loading && !isLoading('shops') && (
                  <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Icon name="Store" size={40} className="text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        No shops found
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {error ? error : "We couldn't find any shops matching your criteria. Try adjusting your filters or search query."}
                      </p>
                      {!error && (
                        <div className="space-y-4">
                          <p className="text-gray-500 text-sm">
                            No shops have been created yet. Be the first to create a shop!
                          </p>
                          <button
                            onClick={handleCreateShop}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all duration-150 shadow-md hover:shadow-lg"
                          >
                            <Icon name="Plus" size={18} />
                            Create Your Shop
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Filter Panel */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Icon name="SlidersHorizontal" size={20} className="text-gray-600" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                    <p className="text-sm text-gray-500">Refine your search</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-150"
                >
                  <Icon name="X" size={18} className="text-gray-600" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 max-h-[calc(85vh-100px)] custom-scrollbar">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                  onClose={() => setIsFilterOpen(false)}
                />
                
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 mt-6 -mx-6">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Create Shop Modal */}
      <ErrorBoundary>
        <CreateShopModal
          isOpen={isCreateShopOpen}
          onClose={() => setIsCreateShopOpen(false)}
          onShopCreated={(newShop) => {
            // Add new shop to the list optimistically
            setShops(prev => [newShop, ...prev]);
            setResultsCount(prev => prev + 1);
            
            // Invalidate cache to ensure fresh data on next load
            invalidateCache('shops');
            invalidateCache('featured-shops');
            
            // Show success message
            showToast('Shop created successfully!', 'success');
            
            // Refresh featured shops if the new shop qualifies
            fetchWithCache('featured-shops', fetchFeaturedShops, {}, true)
              .then(featuredData => {
                if (featuredData) {
                  setFeaturedShops(featuredData);
                }
              })
              .catch(console.error);
          }}
        />
      </ErrorBoundary>

      {/* Footer */}
      <Footer />
      
      <ErrorBoundary>
        <MobileBottomTab />
      </ErrorBoundary>
    </div>
  );
};

export default ShopsListing;
