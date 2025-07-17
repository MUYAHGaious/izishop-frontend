import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import FilterPanel from './components/FilterPanel';
import ProductGrid from './components/ProductGrid';
import CategoryNavigation from './components/CategoryNavigation';
import FlashSaleHero from './components/FlashSaleHero';
import SearchSection from './components/SearchSection';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Enhanced mock product data with more variety
  const mockProducts = [
    {
      id: 1,
      name: "Samsung Galaxy S24 Ultra 256GB - Titanium Black",
      price: 850000,
      originalPrice: 950000,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
      rating: 4.8,
      reviewCount: 1247,
      stock: 15,
      shopName: "TechHub Cameroon",
      shopId: 1,
      isNew: true,
      discount: 11,
      category: "electronics",
      brand: "samsung",
      isWishlisted: false,
      isFreeShipping: true,
      isFlashSale: true,
      badges: ['Best Seller', 'Free Shipping']
    },
    {
      id: 2,
      name: "Nike Air Max 270 Running Shoes - Black/White",
      price: 125000,
      originalPrice: 145000,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      rating: 4.6,
      reviewCount: 892,
      stock: 8,
      shopName: "SportZone Douala",
      shopId: 2,
      isNew: false,
      discount: 14,
      category: "sports",
      brand: "nike",
      isBestSeller: true,
      isWishlisted: true,
      isFreeShipping: true,
      badges: ['Limited Edition']
    },
    {
      id: 3,
      name: "Apple MacBook Pro 14-inch M3 Chip",
      price: 1250000,
      originalPrice: 1350000,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
      rating: 4.9,
      reviewCount: 634,
      stock: 3,
      shopName: "Apple Store Yaoundé",
      shopId: 3,
      isNew: true,
      discount: 7,
      category: "electronics",
      brand: "apple",
      isWishlisted: false,
      isFreeShipping: true,
      badges: ['Premium', 'Fast Delivery']
    },
    {
      id: 4,
      name: "Adidas Ultraboost 22 Running Shoes",
      price: 95000,
      originalPrice: 110000,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop",
      rating: 4.5,
      reviewCount: 456,
      stock: 12,
      shopName: "SportZone Douala",
      shopId: 2,
      isNew: false,
      discount: 14,
      category: "sports",
      brand: "adidas",
      isWishlisted: false,
      isFreeShipping: false,
      badges: ['Eco-Friendly']
    },
    {
      id: 5,
      name: "Sony WH-1000XM5 Wireless Headphones",
      price: 285000,
      originalPrice: 320000,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      rating: 4.7,
      reviewCount: 321,
      stock: 6,
      shopName: "AudioMax Cameroon",
      shopId: 4,
      isNew: false,
      discount: 11,
      category: "electronics",
      brand: "sony",
      isBestSeller: true,
      isWishlisted: false,
      isFreeShipping: true,
      isFlashSale: true,
      badges: ['Noise Cancelling', 'Wireless']
    },
    {
      id: 6,
      name: "Elegant Summer Dress - Floral Print",
      price: 45000,
      originalPrice: 55000,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
      rating: 4.3,
      reviewCount: 289,
      stock: 20,
      shopName: "Fashion Boutique",
      shopId: 5,
      isNew: true,
      discount: 18,
      category: "fashion",
      brand: "local",
      isWishlisted: true,
      isFreeShipping: false,
      badges: ['Trending', 'Summer Collection']
    },
    {
      id: 7,
      name: "Home Garden Plant Set - Indoor Collection",
      price: 35000,
      originalPrice: 42000,
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
      rating: 4.4,
      reviewCount: 178,
      stock: 25,
      shopName: "Green Paradise",
      shopId: 6,
      isNew: false,
      discount: 17,
      category: "home",
      brand: "local",
      isWishlisted: false,
      isFreeShipping: true,
      badges: ['Eco-Friendly', 'Air Purifying']
    },
    {
      id: 8,
      name: "Canon EF 50mm f/1.8 STM Lens",
      price: 450000,
      originalPrice: 500000,
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop",
      rating: 4.8,
      reviewCount: 145,
      stock: 4,
      shopName: "Photo Pro Shop",
      shopId: 7,
      isNew: true,
      discount: 10,
      category: "electronics",
      brand: "canon",
      isWishlisted: false,
      isFreeShipping: true,
      badges: ['Professional', 'Portrait Lens']
    }
  ];

  // Categories for navigation
  const categories = [
    { id: 'all', name: 'All Categories', icon: 'Grid3X3', count: 2847 },
    { id: 'electronics', name: 'Electronics', icon: 'Smartphone', count: 1247 },
    { id: 'fashion', name: 'Fashion', icon: 'Shirt', count: 892 },
    { id: 'sports', name: 'Sports', icon: 'Dumbbell', count: 634 },
    { id: 'home', name: 'Home & Garden', icon: 'Home', count: 456 },
    { id: 'beauty', name: 'Beauty', icon: 'Sparkles', count: 321 },
    { id: 'books', name: 'Books', icon: 'Book', count: 289 },
    { id: 'automotive', name: 'Automotive', icon: 'Car', count: 178 }
  ];

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'relevance';
    
    if (query) {
      setFilters(prev => ({ ...prev, search: query }));
    }
    setSelectedCategory(category);
    setSortBy(sort);
    
    // Simulate initial load
    setTimeout(() => {
      setProducts(mockProducts);
      setResultsCount(mockProducts.length);
      setLoading(false);
    }, 1000);
  }, [searchParams]);

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
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProducts = mockProducts.map(product => ({
          ...product,
          id: product.id + (currentPage * 8)
        }));
        
        setProducts(prev => [...prev, ...newProducts]);
        setCurrentPage(prev => prev + 1);
        
        if (currentPage >= 3) {
          setHasMore(false);
        }
        
        resolve();
      }, 1000);
    });
  }, [currentPage, hasMore, loading, mockProducts]);

  // Add to cart
  const handleAddToCart = useCallback(async (product) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Added to cart:', product);
        resolve();
      }, 500);
    });
  }, []);

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
      <FlashSaleHero products={mockProducts.filter(p => p.isFlashSale)} />
      
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
                  <span className="text-gray-300 text-sm">support@izishop.cm</span>
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