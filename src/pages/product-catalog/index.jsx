import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import FilterPanel from './components/FilterPanel';
import FilterChips from './components/FilterChips';
import SortDropdown from './components/SortDropdown';
import ProductGrid from './components/ProductGrid';
import CategoryBreadcrumbs from './components/CategoryBreadcrumbs';
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
  const [categories, setCategories] = useState([]);

  // Mock product data
  const mockProducts = [
    {
      id: 1,
      name: "Samsung Galaxy S24 Ultra 256GB",
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
      isWishlisted: false
    },
    {
      id: 2,
      name: "Nike Air Max 270 Running Shoes",
      price: 125000,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      rating: 4.6,
      reviewCount: 892,
      stock: 8,
      shopName: "SportZone Douala",
      shopId: 2,
      isNew: false,
      discount: null,
      category: "sports",
      brand: "nike",
      isBestSeller: true,
      isWishlisted: true
    },
    {
      id: 3,
      name: "Apple MacBook Pro 14-inch M3",
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
      isWishlisted: false
    },
    {
      id: 4,
      name: "Adidas Ultraboost 22 Black",
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
      isWishlisted: false
    },
    {
      id: 5,
      name: "Sony WH-1000XM5 Headphones",
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
      isWishlisted: false
    },
    {
      id: 6,
      name: "Elegant Summer Dress",
      price: 45000,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
      rating: 4.3,
      reviewCount: 289,
      stock: 20,
      shopName: "Fashion Boutique",
      shopId: 5,
      isNew: true,
      discount: null,
      category: "fashion",
      brand: "local",
      isWishlisted: true
    },
    {
      id: 7,
      name: "Home Garden Plant Set",
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
      isWishlisted: false
    },
    {
      id: 8,
      name: "Professional Camera Lens",
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
      isWishlisted: false
    }
  ];

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'relevance';
    
    if (query) {
      setFilters(prev => ({ ...prev, search: query }));
    }
    if (category) {
      setFilters(prev => ({ ...prev, categories: [category] }));
      setCategories([{ label: category.charAt(0).toUpperCase() + category.slice(1), path: `/product-catalog?category=${category}` }]);
    }
    setSortBy(sort);
    
    // Simulate initial load
    setTimeout(() => {
      setProducts(mockProducts);
      setResultsCount(mockProducts.length);
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (filterType === 'categories' && value.length > 0) {
      newParams.set('category', value[0]);
    } else if (filterType === 'categories' && value.length === 0) {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

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
    setCategories([]);
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
        // Show success notification
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

  // Pull to refresh (mobile)
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isRefreshing = false;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      
      if (diff > 100 && window.scrollY === 0 && !isRefreshing) {
        isRefreshing = true;
        setLoading(true);
        
        setTimeout(() => {
          setProducts(mockProducts);
          setCurrentPage(1);
          setHasMore(true);
          setLoading(false);
          isRefreshing = false;
        }, 1000);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [mockProducts]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 pb-16 lg:pb-0">
        {/* Category Breadcrumbs */}
        <CategoryBreadcrumbs categories={categories} />
        
        {/* Filter Chips */}
        <FilterChips
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />

        <div className="flex">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterPanel
              isOpen={true}
              onClose={() => {}}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAllFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-80">
            {/* Mobile Filter Button & Sort */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-border">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(true)}
                iconName="Filter"
                iconPosition="left"
              >
                Filters
              </Button>
              
              <div className="flex items-center gap-2">
                <Icon name="ArrowUpDown" size={16} className="text-text-secondary" />
                <span className="text-sm text-text-secondary">Sort</span>
              </div>
            </div>

            {/* Sort Dropdown */}
            <SortDropdown
              value={sortBy}
              onChange={handleSortChange}
              resultsCount={resultsCount}
            />

            {/* Product Grid */}
            <ProductGrid
              products={products}
              loading={loading}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>
        </div>

        {/* Mobile Filter Panel */}
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAllFilters}
        />
      </main>

      <MobileBottomTab />
    </div>
  );
};

export default ProductCatalog;