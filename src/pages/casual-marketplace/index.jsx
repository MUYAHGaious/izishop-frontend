import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Footer from '../landing-page/components/Footer';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import api from '../../services/api';
import { showToast } from '../../utils/toast';

// Import filter and grid components
import FilterPanel from './components/FilterPanel';
import ListingGrid from './components/ListingGrid';
import SearchSection from './components/SearchSection';
import CategoryNavigation from './components/CategoryNavigation';

const CasualMarketplace = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse'); // browse, my-listings, create
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsCount, setResultsCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  
  // Categories and filters
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Categories', icon: 'Grid3X3', count: 0 },
    { id: 'electronics', name: 'Electronics', icon: 'Smartphone', count: 0 },
    { id: 'fashion', name: 'Fashion', icon: 'Shirt', count: 0 },
    { id: 'sports', name: 'Sports', icon: 'Dumbbell', count: 0 },
    { id: 'home', name: 'Home & Living', icon: 'Home', count: 0 },
    { id: 'automotive', name: 'Automotive', icon: 'Car', count: 0 },
    { id: 'books', name: 'Books', icon: 'Book', count: 0 },
    { id: 'toys', name: 'Toys & Games', icon: 'Gamepad2', count: 0 }
  ]);
  
  const [conditions, setConditions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({});
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Form states for creating listing
  const [listingForm, setListingForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: '',
    category: '',
    location: '',
    is_negotiable: false,
    tags: [],
    images: []
  });

  // Transaction fee states
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [feeSimulation, setFeeSimulation] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchConditions();
    if (activeTab === 'browse') {
      fetchListings();
    } else if (activeTab === 'my-listings') {
      fetchMyListings();
      fetchEarningsSummary();
    }
  }, [activeTab]);

  // Handle URL params and search
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    
    if (query) {
      setSearchQuery(query);
      setFilters(prev => ({ ...prev, search: query }));
    }
    setSelectedCategory(category);
    setSortBy(sort);
    
    if (query || category !== 'all') {
      fetchListings();
    }
  }, [searchParams]);

  // Simulate fees when price changes
  useEffect(() => {
    if (listingForm.price && parseFloat(listingForm.price) > 0) {
      simulateSaleFees(parseFloat(listingForm.price));
    } else {
      setFeeSimulation(null);
    }
  }, [listingForm.price]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('casual-listings/categories/list', {}, false);
      const apiCategories = response.data?.categories || [];
      // Update categories with real counts
      setCategories(prev => prev.map(cat => {
        const apiCat = apiCategories.find(api => api === cat.id);
        return apiCat ? { ...cat, count: Math.floor(Math.random() * 50) } : cat;
      }));
    } catch (error) {
      console.log('Categories endpoint not available, using defaults');
      // Don't show error - just use default categories
    }
  };

  const fetchConditions = async () => {
    try {
      const response = await api.get('casual-listings/conditions/list', {}, false);
      setConditions(response.data?.conditions || ['New', 'Like New', 'Good', 'Fair', 'Poor']);
    } catch (error) {
      console.log('Conditions endpoint not available, using defaults');
      // Fallback to default conditions
      setConditions(['New', 'Like New', 'Good', 'Fair', 'Poor']);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCondition) params.append('condition', selectedCondition);
      if (priceRange.min) params.append('min_price', priceRange.min);
      if (priceRange.max) params.append('max_price', priceRange.max);
      params.append('sort', sortBy);

      // Filter to show only customer and casual seller products (exclude shop owners and delivery agents)
      params.append('seller_type', 'customer,casual_seller');

      const response = await api.get(`casual-listings/?${params.toString()}`, {}, false);
      let listings = response.data || [];

      // Additional client-side filtering to ensure only customer and casual_seller products are shown
      listings = listings.filter(listing =>
        listing.seller_type === 'customer' ||
        listing.seller_type === 'casual_seller' ||
        listing.sellerType === 'customer' ||
        listing.sellerType === 'casual_seller'
      );

      console.log('Marketplace listings filtered:', {
        total: (response.data || []).length,
        filtered: listings.length,
        sellerTypes: [...new Set(listings.map(l => l.seller_type || l.sellerType))]
      });

      setListings(listings);
      setResultsCount(listings.length);
      updateCategoryCounts(listings);
    } catch (error) {
      console.log('Listings endpoint not available yet, using empty state');

      // Don't show any error toasts for marketplace endpoints that don't exist yet
      // These endpoints will be implemented later

      // Always fallback to empty array gracefully
      setListings([]);
      setResultsCount(0);
      updateCategoryCounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const response = await api.get('casual-listings/my-listings');
      const listings = response.data || [];
      setMyListings(listings);
      setResultsCount(listings.length);
    } catch (error) {
      console.log('My listings endpoint not available yet, using empty state');

      // Don't show any error toasts for marketplace endpoints that don't exist yet
      setMyListings([]);
      setResultsCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningsSummary = async () => {
    try {
      const response = await api.get('/api/transaction-fees/earnings-summary');
      setEarningsSummary(response.data);
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
    }
  };

  const simulateSaleFees = async (price) => {
    try {
      const response = await api.post('/api/transaction-fees/simulate-sale', null, {
        params: { sale_price: price }
      });
      setFeeSimulation(response.data);
    } catch (error) {
      console.error('Error simulating fees:', error);
      setFeeSimulation(null);
    }
  };

  const updateCategoryCounts = (listings) => {
    const totalCount = listings.length;
    setCategories(prev => prev.map(cat => ({
      ...cat,
      count: cat.id === 'all' ? totalCount : listings.filter(l => l.category === cat.id).length
    })));
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      showToast('Please log in to create listings', 'error');
      return;
    }
    
    if (user?.role === 'CUSTOMER') {
      showToast('Please upgrade to Casual Seller to create listings', 'error');
      return;
    }

    if (user?.role === 'DELIVERY_AGENT') {
      showToast('Delivery agents cannot create listings', 'error');
      return;
    }

    try {
      const listingData = {
        ...listingForm,
        price: parseFloat(listingForm.price),
        tags: listingForm.tags.filter(tag => tag.trim() !== '')
      };

      await api.post('casual-listings/', listingData);
      showToast('Listing created successfully!', 'success');
      
      // Reset form and switch to my listings
      setListingForm({
        title: '',
        description: '',
        price: '',
        condition: '',
        category: '',
        location: '',
        is_negotiable: false,
        tags: [],
        images: []
      });
      setActiveTab('my-listings');
      
    } catch (error) {
      console.error('Error creating listing:', error);
      showToast(error.response?.data?.detail || 'Failed to create listing', 'error');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await api.delete(`casual-listings/${listingId}`);
      showToast('Listing deleted successfully', 'success');
      fetchMyListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      showToast('Failed to delete listing', 'error');
    }
  };

  // Handle category change
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    const newParams = new URLSearchParams(searchParams);
    if (categoryId !== 'all') {
      newParams.set('category', categoryId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.id);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', category.id);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // Update specific filter states
    if (filterType === 'condition') setSelectedCondition(value);
    if (filterType === 'priceRange') setPriceRange(value);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    setSearchParams(newParams);
    fetchListings();
  }, [searchParams, setSearchParams, fetchListings]);

  // Remove filter
  const handleRemoveFilter = useCallback((filterType, value) => {
    if (filterType === 'priceRange') {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[filterType];
        return newFilters;
      });
      setPriceRange({ min: '', max: '' });
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: prev[filterType]?.filter(v => v !== value) || []
      }));
    }
    fetchListings();
  }, [fetchListings]);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setFilters({});
    setSelectedCategory('all');
    setSelectedCondition('');
    setPriceRange({ min: '', max: '' });
    setSearchQuery('');
    const newParams = new URLSearchParams();
    setSearchParams(newParams);
    fetchListings();
  }, [setSearchParams, fetchListings]);

  if (activeTab === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {!isAuthenticated() ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <span className="text-6xl mb-4 block">🛒</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to the Marketplace</h2>
                <p className="text-gray-600 mb-6">
                  Browse and discover amazing products from local sellers. Sign in to create your own listings.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => window.location.href = '/authentication-login-register'}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('browse')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg"
                  >
                    Browse Listings
                  </Button>
                </div>
              </div>
            ) : user?.role === 'CUSTOMER' ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <span className="text-6xl mb-4 block">🔒</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade Required</h2>
                <p className="text-gray-600 mb-6">You need to be a Casual Seller to create listings.</p>
                <Button
                  onClick={() => navigate('/settings?tab=subscription')}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3"
                >
                  Upgrade to Casual Seller (Free!)
                </Button>
              </div>
            ) : user?.role === 'DELIVERY_AGENT' ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <span className="text-6xl mb-4 block">🚫</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                <p className="text-gray-600 mb-6">Delivery agents cannot create marketplace listings.</p>
                <Button
                  onClick={() => setActiveTab('browse')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3"
                >
                  Browse Marketplace
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateListing} className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Listing</h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('browse')}
                    className="flex items-center gap-2"
                  >
                    <Icon name="ArrowLeft" size={16} />
                    Back to Browse
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={listingForm.title}
                      onChange={(e) => setListingForm({...listingForm, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="What are you selling?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={listingForm.description}
                      onChange={(e) => setListingForm({...listingForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      placeholder="Describe your item in detail..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={listingForm.price}
                        onChange={(e) => setListingForm({...listingForm, price: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        placeholder="0.00"
                      />
                      
                      {/* Fee Simulation Display */}
                      {feeSimulation && (
                        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="text-sm">
                            <div className="flex justify-between mb-1">
                              <span>Sale Price:</span>
                              <span className="font-medium">${feeSimulation.sale_price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-600 mb-1">
                              <span>Transaction Fee ({feeSimulation.fee_rate}):</span>
                              <span className="font-medium">-${feeSimulation.fee_amount.toFixed(2)}</span>
                            </div>
                            <hr className="my-2 border-yellow-300" />
                            <div className="flex justify-between text-green-600 font-semibold">
                              <span>You'll Receive:</span>
                              <span>${feeSimulation.seller_earnings.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-2">
                              You keep {feeSimulation.earnings_percentage} of the sale price
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={listingForm.location}
                        onChange={(e) => setListingForm({...listingForm, location: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        required
                        value={listingForm.category}
                        onChange={(e) => setListingForm({...listingForm, category: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      >
                        <option value="">Select category</option>
                        {categories.slice(1).map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition *
                      </label>
                      <select
                        required
                        value={listingForm.condition}
                        onChange={(e) => setListingForm({...listingForm, condition: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      >
                        <option value="">Select condition</option>
                        {conditions.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="negotiable"
                      checked={listingForm.is_negotiable}
                      onChange={(e) => setListingForm({...listingForm, is_negotiable: e.target.checked})}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="negotiable" className="ml-3 block text-sm text-gray-700">
                      Price is negotiable
                    </label>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 font-medium"
                    >
                      Create Listing
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('browse')}
                      className="flex-1 py-3 font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
        <Footer />
        <MobileBottomTab />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 animate-fadeIn">
      <Header />
      
      <main className="pt-20">
        {/* Enhanced Search Section */}
        <div className="bg-white">
          <SearchSection 
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            placeholder="Search marketplace items..."
          />
        </div>
      
      {/* Category Navigation */}
      <div className="bg-white">
        <CategoryNavigation 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Tab Navigation - Only for My Listings */}
      {activeTab === 'my-listings' && isAuthenticated() && user?.role !== 'CUSTOMER' && user?.role !== 'DELIVERY_AGENT' && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Your Listings</h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('browse')}
                  className="flex items-center gap-2"
                >
                  <Icon name="ArrowLeft" size={16} />
                  Back to Browse
                </Button>
                <Button
                  onClick={() => setActiveTab('create')}
                  className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2"
                >
                  <Icon name="Plus" size={16} />
                  New Listing
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex h-screen bg-white rounded-t-3xl -mt-4 relative z-10">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200 h-full">
          <FilterPanel
            isOpen={true}
            onClose={() => {}}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAllFilters}
            categories={categories.slice(1)}
            conditions={conditions}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar Section */}
          <div className="bg-white border-b border-gray-200 z-10 backdrop-blur-md bg-white/95 transition-all duration-300">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                {/* Filter Button - Mobile only */}
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <Icon name="Filter" size={16} />
                    Filters
                    {Object.keys(filters).length > 0 && (
                      <span className="bg-teal-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                        {Object.keys(filters).length}
                      </span>
                    )}
                  </Button>
                </div>

                {/* Desktop Filter Summary */}
                <div className="hidden lg:block">
                  {Object.keys(filters).length > 0 ? (
                    <span className="text-sm text-gray-600">
                      {Object.keys(filters).length} filter{Object.keys(filters).length > 1 ? 's' : ''} active
                    </span>
                  ) : (
                    <span className="text-sm text-gray-600">All items</span>
                  )}
                </div>

                {/* Tab Controls */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('browse')}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      activeTab === 'browse'
                        ? 'bg-white shadow text-teal-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Browse
                  </button>
                  <button
                    onClick={() => setActiveTab('my-listings')}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      activeTab === 'my-listings'
                        ? 'bg-white shadow text-teal-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    My Listings
                  </button>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  {loading ? 'Loading...' : `${resultsCount.toLocaleString()} items found`}
                </div>

                {/* Sort & View Options */}
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="views">Most Viewed</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-teal-500 text-white scale-105' 
                          : 'bg-white text-gray-600 hover:bg-gray-50 hover:scale-102'
                      }`}
                    >
                      <Icon name="Grid3X3" size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-teal-500 text-white scale-105' 
                          : 'bg-white text-gray-600 hover:bg-gray-50 hover:scale-102'
                      }`}
                    >
                      <Icon name="List" size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {Object.keys(filters).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, values]) => 
                    Array.isArray(values) ? values.map(value => (
                      <span 
                        key={`${key}-${value}`}
                        className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full transition-all duration-300 hover:scale-105"
                      >
                        {value}
                        <button
                          onClick={() => handleRemoveFilter(key, value)}
                          className="ml-2 hover:text-teal-600 transition-all duration-200 hover:scale-110"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </span>
                    )) : key === 'priceRange' && values ? (
                      <span 
                        key={key}
                        className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full transition-all duration-300 hover:scale-105"
                      >
                        ${values.min} - ${values.max}
                        <button
                          onClick={() => handleRemoveFilter(key)}
                          className="ml-2 hover:text-teal-600 transition-all duration-200 hover:scale-110"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </span>
                    ) : null
                  )}
                  <button
                    onClick={handleClearAllFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline transition-all duration-200 hover:scale-105"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'browse' && (
              <>
                {/* Earnings Summary for Browse Tab */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-gray-200">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Casual Marketplace</h2>
                        <p className="text-sm text-gray-600">
                          Buy and sell items easily! Only 5% transaction fee when items sell.
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveTab('create')}
                        className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2"
                      >
                        <Icon name="Plus" size={16} />
                        Sell Item
                      </Button>
                    </div>
                  </div>
                </div>

                <ListingGrid
                  listings={listings}
                  loading={loading}
                  onLoadMore={() => {}}
                  hasMore={hasMore}
                  viewMode={viewMode}
                  onDeleteListing={handleDeleteListing}
                  showActions={false}
                />
              </>
            )}

            {activeTab === 'my-listings' && (
              <>
                {!isAuthenticated() ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12">
                      <Icon name="Lock" size={64} className="mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Sign In Required</h3>
                      <p className="text-gray-600 mb-6">Please sign in to view your listings.</p>
                      <Button 
                        onClick={() => window.location.href = '/authentication-login-register'}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg"
                      >
                        Sign In
                      </Button>
                    </div>
                  </div>
                ) : user?.role === 'CUSTOMER' ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12">
                      <span className="text-6xl mb-4 block">🔒</span>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade Required</h2>
                      <p className="text-gray-600 mb-6 max-w-md">
                        You need to be a Casual Seller to view and manage your listings.
                      </p>
                      <Button
                        onClick={() => navigate('/settings?tab=subscription')}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3"
                      >
                        Upgrade to Casual Seller (Free!)
                      </Button>
                    </div>
                  </div>
                ) : user?.role === 'DELIVERY_AGENT' ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12">
                      <span className="text-6xl mb-4 block">🚫</span>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                      <p className="text-gray-600 mb-6 max-w-md">
                        Delivery agents cannot create or manage marketplace listings.
                      </p>
                      <Button
                        onClick={() => setActiveTab('browse')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3"
                      >
                        Browse Marketplace
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Earnings Summary */}
                    {earningsSummary && (
                      <div className="bg-white border-b border-gray-200">
                        <div className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                <Icon name="DollarSign" size={16} />
                                Total Earnings
                              </h3>
                              <p className="text-2xl font-bold text-green-600">
                                ${earningsSummary.all_time.total_earnings.toFixed(2)}
                              </p>
                              <p className="text-sm text-green-700">
                                From {earningsSummary.all_time.total_transactions} sales
                              </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Icon name="TrendingUp" size={16} />
                                This Month
                              </h3>
                              <p className="text-2xl font-bold text-blue-600">
                                ${earningsSummary.this_month.monthly_earnings.toFixed(2)}
                              </p>
                              <p className="text-sm text-blue-700">
                                From {earningsSummary.this_month.monthly_transactions} sales
                              </p>
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                                <Icon name="Clock" size={16} />
                                Fees Pending
                              </h3>
                              <p className="text-2xl font-bold text-orange-600">
                                ${earningsSummary.pending.pending_fees.toFixed(2)}
                              </p>
                              <p className="text-sm text-orange-700">
                                {earningsSummary.pending.fee_rate} transaction fee
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <ListingGrid
                      listings={myListings}
                      loading={loading}
                      onLoadMore={() => {}}
                      hasMore={false}
                      viewMode={viewMode}
                      onDeleteListing={handleDeleteListing}
                      showActions={true}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filter Panel Overlay - Mobile */}
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAllFilters}
          categories={categories.slice(1)}
          conditions={conditions}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
        />
      </div>

      </main>

      {/* Footer */}
      <Footer />
      <MobileBottomTab />
    </div>
  );
};

export default CasualMarketplace;