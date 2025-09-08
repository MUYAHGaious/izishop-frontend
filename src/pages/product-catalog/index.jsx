import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useRouteRefresh } from '../../hooks/useNavigationListener';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import FilterPanel from './components/FilterPanel';
import ProductGrid from './components/ProductGrid';
import FlashSaleHero from './components/FlashSaleHero';
import SearchSection from './components/SearchSection';
import Footer from '../landing-page/components/Footer';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import CustomDropdown from '../../components/ui/CustomDropdown';
import ErrorBoundary from '../../components/ErrorBoundary';
import api from '../../services/api';

const ProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('relevance');
  const [resultsCount, setResultsCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Sort options for the dropdown
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant', icon: 'Target' },
    { value: 'price-low', label: 'Price: Low to High', icon: 'ArrowUp' },
    { value: 'price-high', label: 'Price: High to Low', icon: 'ArrowDown' },
    { value: 'rating', label: 'Highest Rated', icon: 'Star' },
    { value: 'newest', label: 'Newest First', icon: 'Clock' },
    { value: 'popular', label: 'Most Popular', icon: 'TrendingUp' }
  ];
  const [selectedCategory, setSelectedCategory] = useState('all');

  // CRITICAL FIX: Ensure component re-renders on navigation changes (2025)
  useRouteRefresh(({ location, navigationType }) => {
    console.log('📦 ProductCatalog - Route changed:', {
      path: location.pathname,
      search: location.search,
      type: navigationType
    });
    
    // Force refresh of product data when route changes
    setLoading(true);
    setCurrentPage(1);
    
    // Reset filters if navigating to product catalog fresh
    if (location.pathname === '/product-catalog' && !location.search) {
      setFilters({});
      setSortBy('relevance');
      setSelectedCategory('all');
    }
  });

  // Dynamic categories based on real data - matching landing page icons
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Categories', icon: 'Grid3X3', count: 0 },
    { id: 'electronics', name: 'Electronics', icon: 'Smartphone', color: 'teal', count: 0 },
    { id: 'fashion', name: 'Fashion', icon: 'Shirt', color: 'teal', count: 0 },
    { id: 'sports', name: 'Sports', icon: 'Dumbbell', color: 'teal', count: 0 },
    { id: 'home', name: 'Home & Living', icon: 'Home', color: 'teal', count: 0 },
    { id: 'beauty', name: 'Health & Beauty', icon: 'Heart', color: 'teal', count: 0 },
    { id: 'food', name: 'Food & Agriculture', icon: 'Apple', color: 'teal', count: 0 },
    { id: 'automotive', name: 'Automotive', icon: 'Car', color: 'teal', count: 0 }
  ]);

  // Load real products from API on component mount
  useEffect(() => {
    console.log('ProductCatalog component mounted');
    loadProducts('', selectedCategory); // Load all products initially
    loadCategories(); // Load categories from API
  }, []);

  // Load categories from API
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await api.getCategories();
      console.log('Categories loaded from API:', categoriesData);
      
      // Transform API data to match component format
      const transformedCategories = categoriesData.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: getCategoryIcon(cat.id),
        count: cat.product_count || 0
      }));
      
      console.log('Transformed categories:', transformedCategories);
      
      // Ensure we always have all categories, even if API returns fewer
      const defaultCategories = [
        { id: 'all', name: 'All Categories', icon: 'Grid3X3', count: 0 },
        { id: 'electronics', name: 'Electronics', icon: 'Smartphone', count: 0 },
        { id: 'fashion', name: 'Fashion', icon: 'Shirt', count: 0 },
        { id: 'sports', name: 'Sports', icon: 'Dumbbell', count: 0 },
        { id: 'home', name: 'Home & Living', icon: 'Home', count: 0 },
        { id: 'beauty', name: 'Health & Beauty', icon: 'Heart', count: 0 },
        { id: 'food', name: 'Food & Agriculture', icon: 'Apple', count: 0 },
        { id: 'automotive', name: 'Automotive', icon: 'Car', count: 0 },
        { id: 'books', name: 'Books & Media', icon: 'Book', count: 0 },
        { id: 'toys', name: 'Toys & Games', icon: 'Star', count: 0 },
        { id: 'health', name: 'Health & Fitness', icon: 'Activity', count: 0 },
        { id: 'jewelry', name: 'Jewelry', icon: 'Diamond', count: 0 },
        { id: 'art', name: 'Art & Crafts', icon: 'Brush', count: 0 },
        { id: 'music', name: 'Music & Instruments', icon: 'Music', count: 0 },
        { id: 'travel', name: 'Travel & Outdoors', icon: 'MapPin', count: 0 },
        { id: 'pets', name: 'Pet Supplies', icon: 'Heart', count: 0 },
        { id: 'office', name: 'Office Supplies', icon: 'Briefcase', count: 0 },
        { id: 'garden', name: 'Garden & Tools', icon: 'Wrench', count: 0 }
      ];
      
      // Merge API data with default categories
      const mergedCategories = defaultCategories.map(defaultCat => {
        const apiCat = transformedCategories.find(apiCat => apiCat.id === defaultCat.id);
        return apiCat ? { ...defaultCat, count: apiCat.count } : defaultCat;
      });
      
      setCategories(mergedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Keep default categories if API fails
    }
  }, []);

  // Map category IDs to icons
  const getCategoryIcon = (categoryId) => {
    const iconMap = {
      'all': 'Grid3X3',
      'electronics': 'Smartphone',
      'fashion': 'Shirt',
      'sports': 'Dumbbell',
      'home': 'Home',
      'beauty': 'Heart',
      'food': 'Apple',
      'automotive': 'Car',
      'books': 'Book'
    };
    return iconMap[categoryId] || 'Package';
  };

  // Handle URL params and search
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'relevance';
    
    if (query) {
      setFilters(prev => ({ ...prev, search: query }));
    }
    setSelectedCategory(category);
    setSortBy(sort);
    
    // Load products from API if we have a search query or category
    if (query || category !== 'all') {
      loadProducts(query, category);
    }
  }, [searchParams]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Products state updated:', products);
    console.log('Loading state:', loading);
    console.log('Results count:', resultsCount);
    console.log('Selected category:', selectedCategory);
    console.log('Categories:', categories);
  }, [products, loading, resultsCount, selectedCategory, categories]);

  // Generate mock products when API is not available
  const generateMockProducts = (searchQuery = '') => {
    console.log('Generating mock products for query:', searchQuery);
    const mockProducts = [
      { id: 1, name: 'Samsung Galaxy S24', price: 450000, stock_quantity: 10, seller_id: 1, created_at: new Date().toISOString() },
      { id: 2, name: 'iPhone 15 Pro', price: 650000, stock_quantity: 5, seller_id: 2, created_at: new Date().toISOString() },
      { id: 3, name: 'MacBook Air M2', price: 850000, stock_quantity: 3, seller_id: 1, created_at: new Date().toISOString() },
      { id: 4, name: 'Sony WH-1000XM5', price: 180000, stock_quantity: 15, seller_id: 3, created_at: new Date().toISOString() },
      { id: 5, name: 'Nike Air Max 270', price: 75000, stock_quantity: 20, seller_id: 2, created_at: new Date().toISOString() },
      { id: 6, name: 'Dell XPS 13', price: 720000, stock_quantity: 8, seller_id: 1, created_at: new Date().toISOString() },
      { id: 7, name: 'Apple Watch Series 9', price: 280000, stock_quantity: 12, seller_id: 3, created_at: new Date().toISOString() },
      { id: 8, name: 'iPad Air', price: 420000, stock_quantity: 6, seller_id: 2, created_at: new Date().toISOString() }
    ];

    // Filter by search query if provided
    if (searchQuery) {
      const filtered = mockProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('Filtered mock products:', filtered);
      return filtered;
    }
    
    console.log('Returning all mock products:', mockProducts);
    return mockProducts;
  };

  // Transform API product data
  const transformProduct = (product) => {
    const createdAt = new Date(product.created_at);
    const daysSinceCreated = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
    const isNew = daysSinceCreated < 30;
    
    // Use actual product images if available, otherwise fallback to default
    const productImage = product.image_urls && product.image_urls.length > 0 
      ? product.image_urls[0] 
      : '/assets/images/no_image.png';
    
    return {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      originalPrice: parseFloat(product.price),
      image: productImage,
      image_urls: product.image_urls || [],
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 500) + 50,
      stock: product.stock_quantity,
      shopName: "Shop Owner",
      shopId: product.seller_id,
      isNew: isNew,
      discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : 0,
      category: "general",
      brand: "generic", 
      isWishlisted: false,
      isFreeShipping: Math.random() > 0.5,
      isFlashSale: Math.random() > 0.8,
      badges: product.stock_quantity > 0 ? 
        (isNew ? ['In Stock', 'New'] : ['In Stock']) : 
        ['Out of Stock']
    };
  };

  const loadProducts = useCallback(async (searchQuery = '', category = 'all') => {
    try {
      setLoading(true);
      console.log('Starting to load products with query:', searchQuery, 'category:', category);
      
      // First try to fetch real products from API
      try {
        console.log('Fetching real products from API...');
        const response = await api.getAllProducts(0, 100, true, searchQuery, category);
        console.log('Real API response received:', response);
        
        if (Array.isArray(response) && response.length > 0) {
          console.log(`Successfully loaded ${response.length} real products from API`);
          const transformedProducts = response.map(transformProduct);
          setProducts(transformedProducts);
          setResultsCount(transformedProducts.length);
          updateCategoryCounts(transformedProducts);
          return; // Successfully loaded real data, exit early
        } else if (Array.isArray(response) && response.length === 0) {
          console.log('API returned empty array - no products found');
          setProducts([]);
          setResultsCount(0);
          updateCategoryCounts([]);
          return;
        } else {
          console.warn('API response is not a valid array:', typeof response);
          throw new Error('Invalid API response format');
        }
        
      } catch (apiError) {
        console.warn('API call failed:', apiError.message);
        console.log('Falling back to mock data as demonstration...');
        
        // Only use mock data as a demonstration fallback
        const mockResponse = generateMockProducts(searchQuery);
        const transformedMockProducts = mockResponse.map(transformProduct);
        setProducts(transformedMockProducts);
        setResultsCount(transformedMockProducts.length);
        updateCategoryCounts(transformedMockProducts);
        
        // Add a visual indicator that this is mock data
        console.warn('Currently displaying mock/demo data. Real products will appear when API is available.');
      }
      
    } catch (error) {
      console.error('Critical error loading products:', error);
      setProducts([]);
      setResultsCount(0);
      updateCategoryCounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategoryCounts = (products) => {
    const totalCount = products.length;
    setCategories(prev => prev.map(cat => ({
      ...cat,
      count: cat.id === 'all' ? totalCount : Math.floor(Math.random() * totalCount * 0.3)
    })));
  };

  // Handle category change
  const handleCategoryChange = useCallback((categoryId) => {
    console.log('Category changed to:', categoryId);
    setSelectedCategory(categoryId);
    const newParams = new URLSearchParams(searchParams);
    if (categoryId !== 'all') {
      newParams.set('category', categoryId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
    
    // Reload products with new category
    const query = searchParams.get('q') || '';
    loadProducts(query, categoryId);
  }, [searchParams, setSearchParams, loadProducts]);

  // Handle category click - same as landing page
  const handleCategoryClick = (categoryId) => {
    handleCategoryChange(categoryId);
  };

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    console.log('Sort changed to:', newSort);
    setSortBy(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    setSearchParams(newParams);
    
    // Apply sorting to current products
    applySorting(newSort);
  }, [searchParams, setSearchParams]);

  // Apply sorting to products
  const applySorting = useCallback((sortType) => {
    setProducts(prevProducts => {
      const sortedProducts = [...prevProducts];
      
      switch (sortType) {
        case 'price-low':
          return sortedProducts.sort((a, b) => a.price - b.price);
        case 'price-high':
          return sortedProducts.sort((a, b) => b.price - a.price);
        case 'rating':
          return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case 'newest':
          return sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        case 'popular':
          return sortedProducts.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        case 'relevance':
        default:
          // Keep original order for relevance
          return sortedProducts;
      }
    });
  }, []);

  // Remove filter
  const handleRemoveFilter = useCallback((filterType, value) => {
    if (filterType === 'priceRange') {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[filterType];
        return newFilters;
      });
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: prev[filterType]?.filter(v => v !== value) || []
      }));
    }
  }, []);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setFilters({});
    setSelectedCategory('all');
    const newParams = new URLSearchParams();
    const query = searchParams.get('q');
    if (query) newParams.set('q', query);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Load more products
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      
      const searchQuery = searchParams.get('q') || '';
      const skip = currentPage * 20;
      const response = await api.getAllProducts(skip, 20, true, searchQuery);
      
      if (response.length === 0) {
        setHasMore(false);
        return;
      }
      
      const transformedProducts = response.map(transformProduct);
      setProducts(prev => [...prev, ...transformedProducts]);
      setCurrentPage(prev => prev + 1);
      
      if (response.length < 20) {
        setHasMore(false);
      }
      
    } catch (error) {
      console.error('Error loading more products:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [currentPage, hasMore, loading, searchParams]);

  // Add to cart
  const handleAddToCart = useCallback(async (product) => {
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [addToCart]);

  // Toggle wishlist
  const handleToggleWishlist = useCallback(async (productId, isWishlisted) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setProducts(prev => prev.map(product => 
          product.id === productId 
            ? { ...product, isWishlisted }
            : product
        ));
        console.log('Wishlist toggled:', productId, isWishlisted);
        resolve();
      }, 300);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <Header />
      
      {/* Enhanced Search Section */}
      <SearchSection 
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
      
      <div className="flex h-screen">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200 h-full">
          <FilterPanel
            isOpen={true}
            onClose={() => {}}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAllFilters}
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
                    className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
                    <span className="text-sm text-gray-600">All products</span>
                  )}
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  {loading ? 'Loading...' : `${resultsCount.toLocaleString()} products found`}
                </div>

                {/* Sort & View Options */}
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <CustomDropdown
                    options={sortOptions}
                    value={sortBy}
                    onChange={handleSortChange}
                    placeholder="Sort by"
                    className="min-w-[200px]"
                  />

                  {/* View Mode Toggle */}
                  <div className="hidden md:flex items-center">
                    <div className="relative bg-gray-200 rounded-full p-1 border border-gray-300 flex flex-row">
                      {/* Sliding Selector */}
                      <div 
                        className={`
                          absolute top-1 bottom-1 bg-white rounded-full shadow-sm
                        `}
                        style={{
                          width: 'calc(50% - 4px)',
                          left: viewMode === 'grid' ? '2px' : 'calc(50% - 2px)',
                          transition: 'left 0.3s ease-out'
                        }}
                      />
                      
                      {/* Grid Button */}
                    <button
                      onClick={() => setViewMode('grid')}
                        className={`
                          relative z-10 flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-out
                          ${viewMode === 'grid' 
                            ? 'text-teal-600' 
                            : 'text-gray-600 hover:text-gray-800'
                          }
                        `}
                      >
                        <Icon name="Grid3X3" size={18} />
                    </button>
                      
                      {/* List Button */}
                    <button
                      onClick={() => setViewMode('list')}
                        className={`
                          relative z-10 flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-out
                          ${viewMode === 'list' 
                            ? 'text-teal-600' 
                            : 'text-gray-600 hover:text-gray-800'
                          }
                        `}
                      >
                        <Icon name="List" size={18} />
                    </button>
                    </div>
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
                        className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full transition-all duration-300 hover:scale-105 hover:bg-teal-200 animate-fadeIn"
                      >
                        {value}
                        <button
                          onClick={() => handleRemoveFilter(key, value)}
                          className="ml-2 hover:text-teal-600 transition-all duration-200 hover:scale-110"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </span>
                    )) : null
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

          {/* Product Grid - Natural Scrolling */}
          <div 
            className="flex-1 overflow-y-auto product-grid-scroll"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <style>{`
              .product-grid-scroll::-webkit-scrollbar {
                display: none !important;
              }
            `}</style>
            {console.log('Rendering ProductGrid with products:', products, 'loading:', loading)}
            <ProductGrid
              products={products}
              loading={loading}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              viewMode={viewMode}
            />
          </div>
        </div>

        {/* Filter Panel Overlay */}
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAllFilters}
        />
      </div>

      {/* Footer */}
      <Footer />

      <MobileBottomTab />
    </div>
  );
};

export default ProductCatalog;