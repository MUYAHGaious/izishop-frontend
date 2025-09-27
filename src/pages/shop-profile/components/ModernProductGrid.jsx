import React, { useState, useMemo } from 'react';
import { Star, Heart, ShoppingCart, Eye, Package, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';

const ModernProductGrid = ({ products, onProductClick, onAddToCart, onAddToWishlist }) => {
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState({
    category: 'all',
    priceRange: 'all',
    condition: 'all',
    availability: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < Math.floor(rating || 0)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['all', ...cats];
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply filters
    if (filterBy.category !== 'all') {
      filtered = filtered.filter(p => p.category === filterBy.category);
    }

    if (filterBy.priceRange !== 'all') {
      const [min, max] = filterBy.priceRange.split('-').map(Number);
      filtered = filtered.filter(p => {
        const price = p.price;
        if (max) return price >= min && price <= max;
        return price >= min;
      });
    }

    if (filterBy.condition !== 'all') {
      filtered = filtered.filter(p => p.condition === filterBy.condition);
    }

    if (filterBy.availability !== 'all') {
      if (filterBy.availability === 'in-stock') {
        filtered = filtered.filter(p => p.stock_quantity > 0);
      } else if (filterBy.availability === 'low-stock') {
        filtered = filtered.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
  }, [products, filterBy, sortBy]);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No products yet
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            This shop hasn't added any products yet. Check back later for amazing items!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Results count and view toggle */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {filteredAndSortedProducts.length} of {products.length} products
            </span>

            {/* View mode toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Right side - Sort and filter controls */}
          <div className="flex items-center gap-3">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm ${
                showFilters ? 'bg-teal-50 border-teal-200 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filterBy.category}
                  onChange={(e) => setFilterBy(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
                <select
                  value={filterBy.priceRange}
                  onChange={(e) => setFilterBy(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Prices</option>
                  <option value="0-10000">Under 10,000 XAF</option>
                  <option value="10000-50000">10,000 - 50,000 XAF</option>
                  <option value="50000-100000">50,000 - 100,000 XAF</option>
                  <option value="100000">Over 100,000 XAF</option>
                </select>
              </div>

              {/* Condition filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={filterBy.condition}
                  onChange={(e) => setFilterBy(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Conditions</option>
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              {/* Availability filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={filterBy.availability}
                  onChange={(e) => setFilterBy(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Items</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid/List */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Filter size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No products found
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              No products match your current filters. Try adjusting your search criteria.
            </p>
            <button
              onClick={() => {
                setFilterBy({
                  category: 'all',
                  priceRange: 'all',
                  condition: 'all',
                  availability: 'all'
                });
                setSortBy('newest');
              }}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredAndSortedProducts.map((product) => (
        <div
          key={product.id}
          className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
            viewMode === 'list' ? 'flex items-start' : ''
          }`}
        >
          {/* Product Image */}
          <div className={`relative bg-gray-100 overflow-hidden ${
            viewMode === 'list'
              ? 'w-32 h-32 flex-shrink-0'
              : 'aspect-square'
          }`}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package size={viewMode === 'list' ? 32 : 48} className="text-gray-400" />
              </div>
            )}
            
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToWishlist?.(product.id);
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  title="Add to wishlist"
                >
                  <Heart size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductClick?.(product.id);
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  title="Quick view"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>

            {/* Stock Badge */}
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Low Stock
              </div>
            )}
            
            {product.stock_quantity === 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Out of Stock
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
            <div className={viewMode === 'list' ? 'flex justify-between items-start gap-4' : ''}>
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
                  {product.name}
                </h3>

                <p className={`text-sm text-gray-600 mb-3 ${viewMode === 'list' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                  {product.description || 'No description available'}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.review_count || 0})
                  </span>
                </div>
              </div>

              {/* Price section */}
              <div className={viewMode === 'list' ? 'text-right flex-shrink-0' : ''}>
                <div className={`flex items-center gap-2 mb-4 ${viewMode === 'list' ? 'flex-col items-end' : 'justify-between'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart?.(product.id);
                  }}
                  disabled={product.stock_quantity === 0}
                  className={`${viewMode === 'list' ? 'px-6 py-2' : 'w-full py-3'} flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ${
                    product.stock_quantity === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <ShoppingCart size={16} />
                  {viewMode === 'list' ? (product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart') : (product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
        </div>
      )}
    </div>
  );
};

export default ModernProductGrid;
