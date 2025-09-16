import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import FilterChips from './components/FilterChips';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { t } = useLanguage();
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
    { value: 'relevance', label: t('sort.mostRelevant'), icon: 'Target' },
    { value: 'price-low', label: t('sort.priceLowHigh'), icon: 'ArrowUp' },
    { value: 'price-high', label: t('sort.priceHighLow'), icon: 'ArrowDown' },
    { value: 'rating', label: t('sort.highestRated'), icon: 'Star' },
    { value: 'newest', label: 'Newest First', icon: 'Clock' },
    { value: 'popular', label: 'Most Popular', icon: 'TrendingUp' }
  ];
  const [selectedCategory, setSelectedCategory] = useState('all');

  // CRITICAL FIX: Ensure component re-renders on navigation changes (2025)
  const handleRouteChange = useCallback(({ location, navigationType }) => {
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
  }, []);

  useRouteRefresh(handleRouteChange);

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
    console.log('ProductCatalog component mounted - loading shop owner products only');
    loadProducts('', selectedCategory, 'shop_owner'); // Load shop owner products initially
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

    console.log('URL params - query:', query, 'category:', category, 'sort:', sort);
    console.log('All search params:', Object.fromEntries(searchParams.entries()));
    // Parse filter params from URL (enhancement)
    const parseCsv = (val) => (val ? val.split(',').map(v => v.trim()).filter(Boolean) : []);
    const clampNumber = (n, min, max) => {
      const x = Number(n);
      if (Number.isNaN(x)) return null;
      if (max !== undefined) return Math.min(Math.max(x, min), max);
      return Math.max(x, min);
    };

    if (query) {
      setFilters(prev => ({ ...prev, search: query }));
    }
    setSelectedCategory(category);
    setSortBy(sort);
    // Build filters object from URL params
    const urlFilters = {};

    // Price - only apply if values are meaningful (greater than 0)
    const minPriceParam = searchParams.get('min_price');
    const maxPriceParam = searchParams.get('max_price');
    const minPrice = clampNumber(minPriceParam, 0);
    const maxPrice = clampNumber(maxPriceParam, 0);

    // Only apply price filters if they have meaningful values
    const validMinPrice = minPrice !== null && minPrice > 0 ? minPrice : null;
    const validMaxPrice = maxPrice !== null && maxPrice > 0 ? maxPrice : null;

    if (validMinPrice !== null || validMaxPrice !== null) {
      // ensure min <= max if both present
      let minV = validMinPrice;
      let maxV = validMaxPrice;
      if (minV !== null && maxV !== null && minV > maxV) {
        const t = minV; minV = maxV; maxV = t;
      }
      urlFilters.priceRange = { min: minV, max: maxV };
    }

    // Brands, Features, Categories (comma-separated)
    const brandsParam = parseCsv(searchParams.get('brands'));
    if (brandsParam.length) urlFilters.brands = brandsParam.slice(0, 20);

    const featuresParam = parseCsv(searchParams.get('features'));
    if (featuresParam.length) urlFilters.features = featuresParam.slice(0, 20);

    const categoriesParam = parseCsv(searchParams.get('categories'));
    if (categoriesParam.length) urlFilters.categories = categoriesParam.slice(0, 20);

    // Rating (min rating) - only apply if meaningful (2+ stars)
    const ratingParam = clampNumber(searchParams.get('rating'), 1, 5);
    if (ratingParam !== null && ratingParam > 1) urlFilters.rating = [ratingParam];

    // Check if there are invalid URL parameters that should be cleaned
    const hasInvalidParams = searchParams.get('min_price') === '0' ||
                           searchParams.get('max_price') === '0' ||
                           searchParams.get('rating') === '1';

    if (hasInvalidParams) {
      console.log('Cleaning invalid URL parameters');
      const cleanParams = new URLSearchParams();
      if (query) cleanParams.set('q', query);
      if (category !== 'all') cleanParams.set('category', category);
      if (sort !== 'relevance') cleanParams.set('sort', sort);
      setSearchParams(cleanParams);
      setFilters(query ? { search: query } : {});
      return;
    }

    // Only apply URL filters if we actually have valid filters to apply
    if (Object.keys(urlFilters).length > 0) {
      console.log('Applying URL filters:', urlFilters);
      setFilters(prev => ({ ...prev, ...urlFilters }));
    } else {
      // Clear filters if no URL filters are present
      console.log('No URL filters found, clearing filters');
      setFilters(prev => {
        const { search, ...otherFilters } = prev;
        // Keep search filter if present, clear others
        return query ? { search: query } : {};
      });
    }

    // Load products from API if we have a search query or category
    if (query || category !== 'all') {
      loadProducts(query, category, 'shop_owner');
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
  const generateMockProducts = (searchQuery = '', sellerTypeFilter = 'shop_owner') => {
    console.log('Generating mock products for query:', searchQuery, 'sellerType:', sellerTypeFilter);
    const mockProducts = [
      {
        id: 1, name: 'Samsung Galaxy S24', price: 450000, stock_quantity: 10, seller_id: 1,
        created_at: new Date().toISOString(), sellerType: 'shop_owner',
        shopName: 'Tech Haven Store', shopVerified: true, shopRating: 4.8
      },
      {
        id: 2, name: 'iPhone 15 Pro', price: 650000, stock_quantity: 5, seller_id: 2,
        created_at: new Date().toISOString(), sellerType: 'casual_seller',
        shopName: 'John\'s Electronics', shopVerified: false, shopRating: 4.2
      },
      {
        id: 3, name: 'MacBook Air M2', price: 850000, stock_quantity: 3, seller_id: 1,
        created_at: new Date().toISOString(), sellerType: 'shop_owner',
        shopName: 'Tech Haven Store', shopVerified: true, shopRating: 4.8
      },
      {
        id: 4, name: 'Sony WH-1000XM5', price: 180000, stock_quantity: 15, seller_id: 3,
        created_at: new Date().toISOString(), sellerType: 'shop_owner',
        shopName: 'Audio Pro Shop', shopVerified: true, shopRating: 4.6
      },
      {
        id: 5, name: 'Nike Air Max 270', price: 75000, stock_quantity: 20, seller_id: 2,
        created_at: new Date().toISOString(), sellerType: 'casual_seller',
        shopName: 'Sarah\'s Fashion Corner', shopVerified: false, shopRating: 4.1
      },
      {
        id: 6, name: 'Dell XPS 13', price: 720000, stock_quantity: 8, seller_id: 1,
        created_at: new Date().toISOString(), sellerType: 'shop_owner',
        shopName: 'Tech Haven Store', shopVerified: true, shopRating: 4.8
      },
      {
        id: 7, name: 'Apple Watch Series 9', price: 280000, stock_quantity: 12, seller_id: 3,
        created_at: new Date().toISOString(), sellerType: 'casual_seller',
        shopName: 'Mike\'s Gadgets', shopVerified: false, shopRating: 3.9
      },
      {
        id: 8, name: 'iPad Air', price: 420000, stock_quantity: 6, seller_id: 2,
        created_at: new Date().toISOString(), sellerType: 'shop_owner',
        shopName: 'Digital World', shopVerified: true, shopRating: 4.7
      }
    ];

    // Filter by seller type first
    let filteredProducts = mockProducts;
    if (sellerTypeFilter && sellerTypeFilter !== 'all') {
      filteredProducts = mockProducts.filter(product => product.sellerType === sellerTypeFilter);
      console.log(`Filtered by seller type '${sellerTypeFilter}':`, filteredProducts.length, 'products');
    }

    // Filter by search query if provided
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('Filtered by search query:', filteredProducts.length, 'products');
    }

    console.log('Returning filtered products:', filteredProducts);
    return filteredProducts;
  };

  // Transform API product data with enhanced image handling and shop name fetching
  const transformProduct = async (product) => {
    const createdAt = new Date(product.created_at);
    const daysSinceCreated = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
    const isNew = daysSinceCreated < 7; // More realistic "new" threshold

    // Enhanced image URL handling
    let productImage = '/assets/images/no_image.png';
    let imageUrls = [];

    if (product.image_urls) {
      try {
        // Handle JSON string or array
        if (typeof product.image_urls === 'string') {
          imageUrls = JSON.parse(product.image_urls);
        } else if (Array.isArray(product.image_urls)) {
          imageUrls = product.image_urls;
        }

        if (imageUrls && imageUrls.length > 0) {
          productImage = imageUrls[0];
        }
      } catch (error) {
        console.warn('Failed to parse image URLs for product:', product.id, error);
      }
    }

    // Fetch shop name if not already included
    let shopName = product.shopName || "Loading...";
    let shopVerified = product.shopVerified || false;
    let shopRating = product.shopRating || 0;

    if (!product.shopName && product.seller_id) {
      try {
        const userResponse = await api.request(`/api/users/${product.seller_id}`, {}, false);
        if (userResponse) {
          shopName = userResponse.first_name + ' ' + userResponse.last_name;

          // Try to get shop info if user is a shop owner
          try {
            const shopResponse = await api.request(`/api/shops/by-owner/${product.seller_id}`, {}, false);
            if (shopResponse) {
              shopName = shopResponse.name;
              shopVerified = shopResponse.verified || false;
              shopRating = shopResponse.average_rating || 0;
            }
          } catch (shopError) {
            // User might not have a shop, continue with user name
            console.log('No shop found for user:', product.seller_id);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch seller info for product:', product.id, error);
        shopName = "Shop Owner";
      }
    }

    // Enhanced badge system based on real product data
    const badges = [];

    // Stock status badges
    if (product.stock_quantity === 0) {
      badges.push({ type: 'stock', label: 'Out of Stock', color: 'red', priority: 1 });
    } else if (product.stock_quantity <= 5) {
      badges.push({ type: 'stock', label: 'Low Stock', color: 'orange', priority: 2 });
    } else {
      badges.push({ type: 'stock', label: 'In Stock', color: 'green', priority: 3 });
    }

    // New product badge
    if (isNew) {
      badges.push({ type: 'new', label: 'New', color: 'blue', priority: 4 });
    }

    // Discount badge (calculate based on comparison with category average)
    const hasDiscount = product.original_price && product.original_price > product.price;
    if (hasDiscount) {
      const discountPercent = Math.round(((product.original_price - product.price) / product.original_price) * 100);
      badges.push({ type: 'discount', label: `-${discountPercent}%`, color: 'red', priority: 5 });
    }

    // Free shipping badge (based on product value or seller settings)
    const isFreeShipping = product.price > 50000 || product.free_shipping === true;
    if (isFreeShipping) {
      badges.push({ type: 'shipping', label: 'Free Shipping', color: 'green', priority: 6 });
    }

    // Best seller badge (based on sales data if available)
    if (product.is_bestseller || product.total_sales > 100) {
      badges.push({ type: 'bestseller', label: 'Best Seller', color: 'purple', priority: 7 });
    }

    // Sort badges by priority (highest first)
    badges.sort((a, b) => b.priority - a.priority);

    return {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      originalPrice: parseFloat(product.original_price || product.price),
      image: productImage,
      image_urls: imageUrls,
      rating: product.rating || Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      reviewCount: product.review_count || Math.floor(Math.random() * 200) + 10,
      stock: product.stock_quantity,
      shopName: shopName,
      shopId: product.seller_id,
      sellerType: product.sellerType || 'shop_owner',
      shopVerified: shopVerified,
      shopRating: shopRating,
      isNew: isNew,
      discount: hasDiscount ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0,
      category: product.category || "general",
      brand: (product.brand || product.manufacturer || "Generic").toString(),
      isWishlisted: false,
      isFreeShipping: isFreeShipping,
      isFlashSale: product.is_flash_sale || false,
      badges: badges.slice(0, 3), // Show max 3 badges to avoid clutter
      isBestSeller: product.is_bestseller || product.total_sales > 100
    };
  };

  const loadProducts = useCallback(async (searchQuery = '', category = 'all', sellerTypeFilter = 'shop_owner') => {
    try {
      setLoading(true);
      console.log('Starting to load products with query:', searchQuery, 'category:', category, 'sellerType:', sellerTypeFilter);

      // First try to fetch real products from API
      try {
        console.log('Fetching real products from API...');
        // Add seller type to filters for API call
        const extendedFilters = { ...filters, sellerType: sellerTypeFilter };
        const response = await api.getAllProducts(0, 100, true, searchQuery, category, extendedFilters);
        console.log('Real API response received:', response);
        
        if (Array.isArray(response) && response.length > 0) {
          console.log(`Successfully loaded ${response.length} real products from API`);
          const transformedProducts = await Promise.all(response.map(transformProduct));
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
        const mockResponse = generateMockProducts(searchQuery, sellerTypeFilter);
        const transformedMockProducts = await Promise.all(mockResponse.map(transformProduct));
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
  }, [filters]);

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
    loadProducts(query, categoryId, 'shop_owner');
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

  // Sync filters to URL (debounced) - only when user explicitly sets filters
  useEffect(() => {
    // Don't sync to URL on initial load if no filters are set
    if (Object.keys(filters).length === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);

      // Price - only set if values are meaningful (greater than 0)
      if (filters.priceRange && (filters.priceRange.min != null || filters.priceRange.max != null)) {
        if (filters.priceRange.min != null && filters.priceRange.min > 0) {
          newParams.set('min_price', String(filters.priceRange.min));
        } else {
          newParams.delete('min_price');
        }
        if (filters.priceRange.max != null && filters.priceRange.max > 0) {
          newParams.set('max_price', String(filters.priceRange.max));
        } else {
          newParams.delete('max_price');
        }
      } else {
        newParams.delete('min_price');
        newParams.delete('max_price');
      }

      // Arrays -> CSV
      const setCsv = (key, arr) => {
        if (Array.isArray(arr) && arr.length) newParams.set(key, arr.join(',')); else newParams.delete(key);
      };
      setCsv('brands', filters.brands);
      setCsv('features', filters.features);
      setCsv('categories', filters.categories);

      // Rating -> min rating number (only set if greater than 1, since 1-star is meaningless filter)
      if (Array.isArray(filters.rating) && filters.rating.length) {
        const minRating = Math.max(...filters.rating.map(r => Number(r)).filter(n => !Number.isNaN(n)));
        if (minRating && minRating > 1) {
          newParams.set('rating', String(Math.min(Math.max(minRating, 2), 5)));
        } else {
          newParams.delete('rating');
        }
      } else {
        newParams.delete('rating');
      }

      // Avoid unnecessary updates
      const before = searchParams.toString();
      const after = newParams.toString();
      if (before !== after) setSearchParams(newParams);
    }, 300);
    return () => clearTimeout(timeout);
  }, [filters, searchParams, setSearchParams]);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    console.log('Sort changed to:', newSort);
    setSortBy(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    setSearchParams(newParams);
    // Sorting is applied to visible products via memoized selector
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

  // Derive filtered and sorted products without changing original order state
  const visibleProducts = useMemo(() => {
    let result = products;
    const f = filters || {};

    // Price range
    if (f.priceRange && (f.priceRange.min != null || f.priceRange.max != null)) {
      const min = f.priceRange.min != null ? Number(f.priceRange.min) : null;
      const max = f.priceRange.max != null ? Number(f.priceRange.max) : null;
      result = result.filter(p => {
        const price = Number(p.price) || 0;
        if (min != null && price < min) return false;
        if (max != null && price > max) return false;
        return true;
      });
    }

    // Brands (any-of)
    if (Array.isArray(f.brands) && f.brands.length) {
      const setB = new Set(f.brands.map(b => b.toString().toLowerCase()));
      result = result.filter(p => setB.has((p.brand || '').toString().toLowerCase()));
    }

    // Rating (min of selected list)
    if (Array.isArray(f.rating) && f.rating.length) {
      const minRating = Math.max(...f.rating.map(r => Number(r)).filter(n => !Number.isNaN(n)));
      if (minRating) {
        result = result.filter(p => (Number(p.rating) || 0) >= minRating);
      }
    }

    // Features (AND semantics for known features)
    if (Array.isArray(f.features) && f.features.length) {
      const need = new Set(f.features);
      result = result.filter(p => {
        for (const feat of need) {
          if (feat === 'free-shipping' && !p.isFreeShipping) return false;
          if (feat === 'new-arrivals' && !p.isNew) return false;
          if (feat === 'on-sale' && !(Number(p.discount) > 0)) return false;
          if (feat === 'best-seller' && !((p.sales_count || 0) > 100)) return false;
          // 'eco-friendly', 'premium' not derivable from current data; ignore (do not filter out)
        }
        return true;
      });
    }

    // Categories multi-select (if provided)
    if (Array.isArray(f.categories) && f.categories.length) {
      const setC = new Set(f.categories.map(c => c.toString().toLowerCase()));
      result = result.filter(p => setC.has((p.category || '').toString().toLowerCase()));
    }

    return result;
  }, [products, filters]);

  const sortedVisibleProducts = useMemo(() => {
    const arr = [...visibleProducts];
    switch (sortBy) {
      case 'price-low':
        return arr.sort((a, b) => a.price - b.price);
      case 'price-high':
        return arr.sort((a, b) => b.price - a.price);
      case 'rating':
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'popular':
        return arr.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
      case 'relevance':
      default:
        return arr; // original order
    }
  }, [visibleProducts, sortBy]);

  // Keep results count in sync with visible products
  useEffect(() => {
    setResultsCount(sortedVisibleProducts.length);
  }, [sortedVisibleProducts]);

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
      const response = await api.getAllProducts(
        skip,
        20,
        true,
        searchQuery,
        selectedCategory !== 'all' ? selectedCategory : null,
        filters
      );
      
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
  }, [currentPage, hasMore, loading, searchParams, selectedCategory, filters]);

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
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={(category) => {
          setSelectedCategory(category.id);
          const newParams = new URLSearchParams(searchParams);
          if (category.id === 'all') {
            newParams.delete('category');
          } else {
            newParams.set('category', category.id);
          }
          setSearchParams(newParams);
        }}
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
                    {t('filter.filters')}
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
                <FilterChips 
                  filters={filters}
                  onRemoveFilter={(type, value) => handleRemoveFilter(type, value)}
                  onClearAll={handleClearAllFilters}
                  className="mt-4 flex flex-wrap gap-2"
                  chipClassName="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full transition-all duration-300 hover:scale-105 hover:bg-teal-200 animate-fadeIn"
                  clearClassName="text-sm text-gray-500 hover:text-gray-700 underline transition-all duration-200 hover:scale-105"
                  showPriceChip={false}
                  showHeader={false}
                />
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
              products={sortedVisibleProducts}
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
