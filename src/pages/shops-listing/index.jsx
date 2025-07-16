import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import ShopCard from './components/ShopCard';
import FilterPanel from './components/FilterPanel';
import FeaturedShops from './components/FeaturedShops';

const ShopsListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('relevance');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultsCount, setResultsCount] = useState(0);

  // Mock shops data
  const mockShops = [
    {
      id: 1,
      name: "TechHub Electronics",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center",
      banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center",
      rating: 4.8,
      reviewCount: 1247,
      productCount: 156,
      location: "Douala, Cameroon",
      category: "electronics",
      isVerified: true,
      isPremium: true,
      isOnline: true,
      isFollowing: false,
      description: "Premier electronics store with latest gadgets and competitive prices",
      yearsActive: 5,
      responseTime: "< 2 hours"
    },
    {
      id: 2,
      name: "SportZone Douala",
      logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
      banner: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center",
      rating: 4.6,
      reviewCount: 892,
      productCount: 234,
      location: "Douala, Cameroon",
      category: "sports",
      isVerified: true,
      isPremium: false,
      isOnline: true,
      isFollowing: true,
      description: "Your one-stop shop for sports equipment and athletic wear",
      yearsActive: 3,
      responseTime: "< 1 hour"
    },
    {
      id: 3,
      name: "Fashion Boutique",
      logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop&crop=center",
      banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center",
      rating: 4.3,
      reviewCount: 567,
      productCount: 89,
      location: "Yaoundé, Cameroon",
      category: "fashion",
      isVerified: false,
      isPremium: true,
      isOnline: false,
      isFollowing: false,
      description: "Trendy fashion and accessories for the modern African woman",
      yearsActive: 2,
      responseTime: "< 4 hours"
    },
    {
      id: 4,
      name: "Green Paradise",
      logo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop&crop=center",
      banner: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop&crop=center",
      rating: 4.4,
      reviewCount: 324,
      productCount: 145,
      location: "Bamenda, Cameroon",
      category: "home",
      isVerified: true,
      isPremium: false,
      isOnline: true,
      isFollowing: false,
      description: "Beautiful plants and home garden supplies for your space",
      yearsActive: 4,
      responseTime: "< 3 hours"
    },
    {
      id: 5,
      name: "Auto Parts Pro",
      logo: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&h=200&fit=crop&crop=center",
      banner: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=200&fit=crop&crop=center",
      rating: 4.7,
      reviewCount: 678,
      productCount: 298,
      location: "Douala, Cameroon",
      category: "automotive",
      isVerified: true,
      isPremium: true,
      isOnline: true,
      isFollowing: false,
      description: "Quality auto parts and accessories for all vehicle makes",
      yearsActive: 6,
      responseTime: "< 2 hours"
    },
    {
      id: 6,
      name: "Book Haven",
      logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=center",
      banner: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&crop=center",
      rating: 4.5,
      reviewCount: 234,
      productCount: 567,
      location: "Yaoundé, Cameroon",
      category: "books",
      isVerified: false,
      isPremium: false,
      isOnline: true,
      isFollowing: true,
      description: "Extensive collection of books, magazines, and educational materials",
      yearsActive: 1,
      responseTime: "< 6 hours"
    }
  ];

  const featuredShops = mockShops.filter(shop => shop.isPremium || shop.isVerified).slice(0, 3);

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

  // Initialize from URL params
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'relevance';
    
    setSearchQuery(query);
    if (category) {
      setFilters(prev => ({ ...prev, categories: [category] }));
    }
    setSortBy(sort);
    
    // Simulate initial load
    setTimeout(() => {
      setShops(mockShops);
      setResultsCount(mockShops.length);
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newParams.set('q', searchQuery);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleFollowShop = useCallback((shopId, isFollowing) => {
    setShops(prev => prev.map(shop => 
      shop.id === shopId ? { ...shop, isFollowing } : shop
    ));
  }, []);

  const handleVisitShop = useCallback((shopId) => {
    navigate(`/shop-profile?id=${shopId}`);
  }, [navigate]);

  const handleQuickPreview = useCallback((shopId) => {
    console.log('Quick preview shop:', shopId);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newShops = mockShops.map(shop => ({
          ...shop,
          id: shop.id + (currentPage * 6)
        }));
        
        setShops(prev => [...prev, ...newShops]);
        setCurrentPage(prev => prev + 1);
        
        if (currentPage >= 3) {
          setHasMore(false);
        }
        
        setLoading(false);
        resolve();
      }, 1000);
    });
  }, [currentPage, hasMore, loading, mockShops]);

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
      <Header />
      
      <main className="pt-16 pb-16 lg:pb-0">
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
              
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
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
            </div>
          </div>
        </div>

        {/* Featured Shops */}
        <FeaturedShops 
          shops={featuredShops}
          onVisitShop={handleVisitShop}
          onFollowShop={handleFollowShop}
        />

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
              {loading && (
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
              {hasMore && !loading && (
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
              {filteredShops.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Icon name="Store" size={48} className="text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    No shops found
                  </h3>
                  <p className="text-text-secondary">
                    Try adjusting your filters or search query
                  </p>
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

      <MobileBottomTab />
    </div>
  );
};

export default ShopsListing;