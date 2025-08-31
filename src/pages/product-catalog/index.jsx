import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import FilterPanel from './components/FilterPanel';
import { ProductGrid } from '../../components/ProductDisplay';
import CategoryNavigation from './components/CategoryNavigation';
import FlashSaleHero from './components/FlashSaleHero';
import SearchSection from './components/SearchSection';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
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
  const [selectedCategory, setSelectedCategory] = useState('all');


  // Dynamic categories based on real data
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Categories', icon: 'Grid3X3', count: 0 },
    { id: 'electronics', name: 'Electronics', icon: 'Smartphone', count: 0 },
    { id: 'fashion', name: 'Fashion', icon: 'Shirt', count: 0 },
    { id: 'sports', name: 'Sports', icon: 'Dumbbell', count: 0 },
    { id: 'home', name: 'Home & Garden', icon: 'Home', count: 0 },
    { id: 'beauty', name: 'Beauty', icon: 'Sparkles', count: 0 },
    { id: 'books', name: 'Books', icon: 'Book', count: 0 },
    { id: 'automotive', name: 'Automotive', icon: 'Car', count: 0 }
  ]);

  // Initialize with mock products as fallback
  useEffect(() => {
    console.log('ProductCatalog component mounted');
    const mockProducts = generateMockProducts('');
    console.log('Generated mock products:', mockProducts);
    const transformedProducts = mockProducts.map(transformProduct);
    console.log('Transformed products:', transformedProducts);
    setProducts(transformedProducts);
    setResultsCount(transformedProducts.length);
    setLoading(false);
    console.log('State set - products:', transformedProducts.length, 'loading:', false);
  }, []);

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
    
    // Load products from API if we have a search query
    if (query) {
      loadProducts(query);
    }
  }, [searchParams]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Products state updated:', products);
    console.log('Loading state:', loading);
    console.log('Results count:', resultsCount);
  }, [products, loading, resultsCount]);

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
      discount: 0,
      category: "general",
      brand: "generic",
      isWishlisted: false,
      isFreeShipping: Math.random() > 0.5,
      isFlashSale: false,
      badges: product.stock_quantity > 0 ? 
        (isNew ? ['In Stock', 'New'] : ['In Stock']) : 
        ['Out of Stock']
    };
  };

  const loadProducts = async (searchQuery = '') => {
    try {
      setLoading(true);
      console.log('Starting to load products...');
      
      // Fetch products from API with fallback
      let response;
      try {
        console.log('Attempting to fetch products from API...');
        response = await api.getAllProducts(0, 100, true, searchQuery);
        console.log('API response received:', response);
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        // Fallback to mock data when API is not available
        response = generateMockProducts(searchQuery);
        console.log('Using mock data:', response);
      }
      
      // Ensure response is an array
      if (!Array.isArray(response)) {
        console.warn('API response is not an array, using mock data');
        response = generateMockProducts(searchQuery);
      }
      
      // Transform API response using shared transform function
      const transformedProducts = response.map(transformProduct);
      console.log('Transformed products:', transformedProducts);
      
      setProducts(transformedProducts);
      setResultsCount(transformedProducts.length);
      
      // Update category counts dynamically
      updateCategoryCounts(transformedProducts);
      
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to mock data on any error
      try {
        console.log('Falling back to mock data due to error...');
        const mockResponse = generateMockProducts(searchQuery);
        const transformedMockProducts = mockResponse.map(transformProduct);
        setProducts(transformedMockProducts);
        setResultsCount(transformedMockProducts.length);
        updateCategoryCounts(transformedMockProducts);
        console.log('Fallback to mock data successful');
      } catch (mockError) {
        console.error('Even mock data failed:', mockError);
        setProducts([]);
        setResultsCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryCounts = (products) => {
    const totalCount = products.length;
    setCategories(prev => prev.map(cat => ({
      ...cat,
      count: cat.id === 'all' ? totalCount : Math.floor(Math.random() * totalCount * 0.3)
    })));
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

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Enhanced Search Section */}
      <SearchSection 
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
      
      {/* Flash Sale Hero Section */}
      <FlashSaleHero products={products.filter(p => p.isFlashSale)} />
      
      {/* Category Navigation */}
      <CategoryNavigation 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      <div className="flex min-h-screen">
        {/* Main Content Area */}
        <div className="flex-1">
          {/* Toolbar Section */}
          <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                {/* Filter Button - Works on both mobile and desktop */}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Icon name="Filter" size={16} />
                    Filters
                    {Object.keys(filters).length > 0 && (
                      <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                        {Object.keys(filters).length}
                      </span>
                    )}
                  </Button>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  {loading ? 'Loading...' : `${resultsCount.toLocaleString()} products found`}
                </div>

                {/* Sort & View Options */}
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Icon name="Grid3X3" size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
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
                        className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                      >
                        {value}
                        <button
                          onClick={() => handleRemoveFilter(key, value)}
                          className="ml-2 hover:text-orange-600"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </span>
                    )) : null
                  )}
                  <button
                    onClick={handleClearAllFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Grid */}
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

        {/* Filter Panel Overlay */}
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAllFilters}
        />
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingBag" size={20} color="white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                  IziShop
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Your trusted marketplace for quality products in Cameroon. Shop with confidence and discover amazing deals.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <Icon name="Facebook" size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <Icon name="Twitter" size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <Icon name="Instagram" size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <Icon name="Linkedin" size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-white mb-4">Categories</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Electronics</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Fashion</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Sports</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Home & Garden</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">Books</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-white mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Icon name="MapPin" size={16} className="text-gray-400" />
                  <span className="text-gray-300 text-sm">Douala, Cameroon</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Phone" size={16} className="text-gray-400" />
                  <span className="text-gray-300 text-sm">+237 6XX XXX XXX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Mail" size={16} className="text-gray-400" />
                  <span className="text-gray-300 text-sm">support@izishopin.cm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 IziShop. All rights reserved. Made with ❤️ in Cameroon.
            </p>
          </div>
        </div>
      </footer>

      <MobileBottomTab />
    </div>
  );
};

export default ProductCatalog;