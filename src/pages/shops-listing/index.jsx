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
  const [sortBy, setSortBy] = useState('relevance');
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
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  // Load initial data - removed problematic dependencies to prevent infinite loops
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get URL parameters
        const query = searchParams.get('q') || '';
        const category = searchParams.get('category') || '';
        const sort = searchParams.get('sort') || 'relevance';
        
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
      setLoading(true);
      setError(null);
      
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
        setShops(shops);
        setResultsCount(shops.length);
        setHasMore(false);
        setCurrentPage(1);
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
      setLoading(true);
      setError(null);
      
      const newFilters = {
        ...filters,
        [filterType]: value
      };
      setFilters(newFilters);

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
        setShops(shops);
        setResultsCount(shops.length);
        setHasMore(false);
        setCurrentPage(1);
      }

    } catch (error) {
      console.error('Error filtering shops:', error);
      setError('Filter failed. Please try again.');
      showToast('Filter failed', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

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

      // Fetch sorted results
      const shopsParams = {
        page: 1,
        limit: 100,
        search: searchQuery,
        category: searchParams.get('category') || '',
        sort: newSort,
        ...filters
      };

      const shopsData = await fetchWithCache('shops', () => fetchShops(shopsParams), shopsParams, true);
      
      if (shopsData) {
        const shops = Array.isArray(shopsData) ? shopsData : (shopsData.shops || []);
        setShops(shops);
        setResultsCount(shops.length);
        setHasMore(false);
        setCurrentPage(1);
      }

    } catch (error) {
      console.error('Error sorting shops:', error);
      setError('Sort failed. Please try again.');
      showToast('Sort failed', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

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
    navigate(`/shops/${shopId}`);
  }, [navigate]);

  const handleQuickPreview = useCallback((shopId) => {
    console.log('Quick preview shop:', shopId);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    try {
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

      const shopsData = await fetchWithCache('shops', () => fetchShops(shopsParams), shopsParams, true);
      
      if (shopsData && shopsData.shops) {
        setShops(prev => [...prev, ...shopsData.shops]);
        setCurrentPage(nextPage);
        setHasMore(shopsData.shops.length >= 20);
        
        // Update total count if provided
        if (shopsData.total) {
          setResultsCount(shopsData.total);
        }
      } else {
        setHasMore(false);
      }

    } catch (error) {
      console.error('Error loading more shops:', error);
      setError('Failed to load more shops.');
      showToast('Failed to load more shops', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, hasMore, loading]);

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

  const filteredShops = shops.filter(shop => {
    if (filters.categories?.length > 0 && !filters.categories.includes(shop.category)) {
      return false;
    }
    if (filters.location && !shop.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.minRating && shop.rating < filters.minRating) {
      return false;
    }
    if (filters.verifiedOnly && !shop.isVerified) {
      return false;
    }
    if (filters.onlineOnly && !shop.isOnline) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
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

        {/* Hero Section with Search */}
        <div className="bg-surface border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                Discover Amazing Shops
              </h1>
              <p className="text-lg text-text-secondary mb-6">
                Find the perfect shops for all your needs in Cameroon
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                  <Input
                    type="search"
                    placeholder="Search shops..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" iconName="Search">
                    Search
                  </Button>
                </form>
                
                <Button
                  variant="outline"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={handleCreateShop}
                  className="whitespace-nowrap"
                >
                  Create Shop
                </Button>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>{isConnected ? 'Live updates enabled' : 'Offline mode'}</span>
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

        {/* Filter Chips */}
        <div className="border-b border-border bg-surface">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleFilterChange('categories', category.id === 'all' ? [] : [category.id])}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    (category.id === 'all' && !filters.categories?.length) ||
                    filters.categories?.includes(category.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-text-secondary hover:bg-muted-hover'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex">
            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block w-80 pr-8">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Filter & Sort */}
              <div className="lg:hidden flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(true)}
                  iconName="Filter"
                  iconPosition="left"
                >
                  Filters
                </Button>
                
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop Sort & Results Count */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <p className="text-text-secondary">
                  {resultsCount} shops found
                </p>
                
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-surface text-text-primary"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shops Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {/* Loading Skeletons */}
              {(loading || isLoading('shops')) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-xl p-4 space-y-4">
                        <div className="h-32 bg-muted-hover rounded-lg" />
                        <div className="space-y-2">
                          <div className="h-4 bg-muted-hover rounded w-3/4" />
                          <div className="h-3 bg-muted-hover rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && !loading && !isLoading('shops') && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Load More Shops
                  </Button>
                </div>
              )}

              {/* No Results */}
              {filteredShops.length === 0 && !loading && !isLoading('shops') && (
                <div className="text-center py-12">
                  <Icon name="Store" size={48} className="text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    No shops found
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {error ? error : "Try adjusting your filters or search query"}
                  </p>
                  {!error && (
                    <p className="text-text-tertiary text-sm">
                      No shops have been created yet. Be the first to create a shop!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFilterOpen(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                onClose={() => setIsFilterOpen(false)}
              />
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
      
      <ErrorBoundary>
        <MobileBottomTab />
      </ErrorBoundary>
    </div>
  );
};

export default ShopsListing;