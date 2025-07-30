import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';
import useDashboardData from '../../hooks/useDashboardData';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import NotificationBell from '../../components/ui/NotificationBell';
import ShopOverview from './components/ShopOverview';
import OrderManagement from './components/OrderManagement';
import CustomerManagement from './components/CustomerManagement';
import ShopAnalytics from './components/ShopAnalytics';
import ShopSettings from './components/ShopSettings';
import ProductsTab from './components/ProductsTab';
import ShopSelector from '../../components/ui/ShopSelector';
import CreateShopModal from '../../components/ui/CreateShopModal';
import api from '../../services/api';
import { showToast } from '../../components/ui/Toast';
import notificationService from '../../services/notificationService';
import { ReportGenerator } from '../../utils/reportGenerator';

const ShopOwnerDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [shopData, setShopData] = useState({
    name: 'Loading...',
    owner: 'Loading...',
    status: 'active',
    rating: 0,
    totalProducts: 0,
    totalOrders: 0,
    monthlyRevenue: 0
  });
  const [productStats, setProductStats] = useState({
    total_products: 0,
    active_products: 0,
    inactive_products: 0,
    low_stock_products: 0,
    out_of_stock_products: 0
  });
  
  // Product Management States
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  
  // Export functionality states
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [noShopFound, setNoShopFound] = useState(false);
  const [showCreateShopModal, setShowCreateShopModal] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { selectedShop, userShops, hasMultipleShops, selectShop } = useShop();
  const navigate = useNavigate();
  
  // Initialize the optimized dashboard data hook
  const {
    fetchData,
    fetchMultipleData,
    setupRealTimeUpdates,
    getConnectionStatus,
    isDataLoading,
    error: dashboardError,
    clearError
  } = useDashboardData('shop-owner');

  // Search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      
      // Search in products and orders simultaneously
      const [productsResponse, ordersResponse] = await Promise.all([
        api.searchMyProducts(query),
        api.searchMyOrders(query)
      ]);

      const results = {
        products: productsResponse.products || [],
        orders: ordersResponse.orders || [],
        total: (productsResponse.products?.length || 0) + (ordersResponse.orders?.length || 0)
      };

      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      showToast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle URL tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'products', 'orders', 'customers', 'analytics', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Check shop owner authentication
  useEffect(() => {
    const checkAuth = async () => {
      // Don't redirect immediately if still loading or initializing
      if (loading || !user) {
        console.log('Dashboard: Waiting for auth to load...');
        return;
      }
      
      const validShopOwnerRoles = ['SHOP_OWNER', 'shop_owner'];
      const isAuth = isAuthenticated();
      const hasValidRole = validShopOwnerRoles.includes(user?.role);
      
      console.log('Dashboard auth check:', {
        isAuthenticated: isAuth,
        userRole: user?.role,
        hasValidRole,
        shouldRedirect: !isAuth || !hasValidRole
      });
      
      if (!isAuth || !hasValidRole) {
        console.log('Dashboard: Authentication failed, redirecting to login');
        navigate('/authentication-login-register');
      }
    };
    
    checkAuth();
  }, [isAuthenticated, user, navigate, loading]);

  // Setup real notifications
  useEffect(() => {
    if (user && (user.role === 'SHOP_OWNER' || user.role === 'shop_owner')) {
      const unsubscribe = notificationService.subscribe((data) => {
        setNotifications(data.notifications);
        setNotificationCount(data.count);
      });

      notificationService.startRealTimeNotifications();

      return () => {
        unsubscribe();
        notificationService.stopNotifications();
      };
    }
  }, [user]);

  // Load products from API
  const loadProducts = async () => {
    try {
      const response = await api.getMyProducts(0, 100, false);
      
      const transformedProducts = response.map(product => ({
        id: product.id,
        name: product.name,
        category: 'General',
        price: parseFloat(product.price),
        stock: product.stock_quantity,
        status: product.is_active ? 
          (product.stock_quantity === 0 ? 'out_of_stock' : 
           product.stock_quantity <= 5 ? 'low_stock' : 'active') : 'inactive',
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        sku: product.id.substring(0, 8).toUpperCase(),
        sales: 0,
        rating: 4.5,
        createdAt: new Date(product.created_at).toLocaleDateString(),
        description: product.description
      }));
      
      setProducts(transformedProducts);
      setFilteredProducts(transformedProducts);
      
    } catch (error) {
      console.error('Error loading products:', error);
      showToast({
        type: 'error',
        message: 'Failed to load products',
        duration: 3000
      });
    }
  };

  // Optimized data fetching with WebSocket and caching
  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'SHOP_OWNER') {
      return;
    }

    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        clearError();
        setNoShopFound(false);
        
        // Fetch initial data using cached approach
        const data = await fetchMultipleData(['shopData', 'productStats', 'products']);
        
        if (!isMounted) return; // Prevent state updates if component unmounted
        
        // Update shop data
        if (data.shopData) {
          // Fetch real rating data
          let ratingStats = { average_rating: 0, total_reviews: 0 };
          try {
            ratingStats = await api.getMyShopRatingStats();
          } catch (error) {
            console.warn('Failed to fetch rating stats:', error);
          }
          
          setShopData(prev => ({
            ...prev,
            name: data.shopData.name,
            owner: user?.first_name || user?.email?.split('@')[0] || 'Shop Owner',
            status: data.shopData.is_active ? 'active' : 'inactive',
            rating: parseFloat(ratingStats.average_rating || 0).toFixed(1),
            totalProducts: data.productStats?.total_products || 0,
            totalOrders: 0,
            monthlyRevenue: 0,
            totalReviews: ratingStats.total_reviews || 0
          }));
        }

        // Update product statistics
        if (data.productStats) {
          setProductStats(data.productStats);
          
          // Create dynamic notifications
          const notificationTime = new Date().toLocaleTimeString();
          const mockNotifications = [
            { id: 1, type: 'product', message: `${data.productStats.low_stock_products} products are low in stock`, time: notificationTime },
            { id: 2, type: 'info', message: `You have ${data.productStats.active_products} active products`, time: notificationTime }
          ];
          setNotifications(mockNotifications);
        }

        // Update products if available
        if (data.products) {
          setProducts(data.products);
        }

      } catch (error) {
        if (isMounted) {
          console.error('Error loading dashboard data:', error);
          
          // Check if error is due to shop not found
          if (error?.message?.includes('Shop not found')) {
            setNoShopFound(true);
            setShowCreateShopModal(true);
          } else {
            showToast('Failed to load dashboard data', 'error');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up real-time updates
    const setupUpdates = () => {
      return setupRealTimeUpdates((updateType, updateData) => {
        if (!isMounted) return;
        
        console.log(`Real-time update received: ${updateType}`, updateData);
        
        // Handle different types of updates
        switch (updateType) {
          case 'dashboard':
            if (updateData.shop_stats) {
              setShopData(prev => ({ ...prev, ...updateData.shop_stats }));
            }
            if (updateData.product_stats) {
              setProductStats(prev => ({ ...prev, ...updateData.product_stats }));
            }
            break;
          case 'products':
            if (updateData.action === 'created' || updateData.action === 'updated') {
              // Just invalidate cache, don't reload immediately to prevent loops
              console.log('Product updated, cache will be refreshed on next request');
            }
            break;
          case 'orders':
            // Update order counts
            setShopData(prev => ({ 
              ...prev, 
              totalOrders: updateData.total_orders || prev.totalOrders,
              monthlyRevenue: updateData.monthly_revenue || prev.monthlyRevenue
            }));
            break;
        }
      });
    };

    // Initial data load
    loadDashboardData();
    
    // Set up real-time updates
    const cleanupUpdates = setupUpdates();
    
    return () => {
      isMounted = false;
      if (cleanupUpdates) cleanupUpdates();
    };
  }, [isAuthenticated, user?.role, user?.id]);

  // Real-time clock with better formatting
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Filter products
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, products]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/authentication-login-register');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      navigate('/authentication-login-register');
    }
  };

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const handleViewProducts = () => {
    setActiveTab('products');
  };

  const handleViewShop = () => {
    navigate('/my-shop-profile');
  };

  const handleGoToCatalog = () => {
    navigate('/product-catalog');
  };

  // Product Management Functions
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Fashion', label: 'Fashion' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Books', label: 'Books' },
    { value: 'Sports', label: 'Sports' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleProductAction = async (action, productId) => {
    try {
      switch (action) {
        case 'edit':
          navigate(`/add-product?edit=${productId}`);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this product?')) {
            await api.deleteProduct(productId);
            showToast({
              type: 'success',
              message: 'Product deleted successfully',
              duration: 3000
            });
            loadProducts();
          }
          break;
        case 'duplicate':
          const product = products.find(p => p.id === productId);
          if (product) {
            const duplicateData = {
              name: `${product.name} (Copy)`,
              description: product.description,
              price: product.price,
              stock_quantity: product.stock
            };
            await api.createProduct(duplicateData);
            showToast({
              type: 'success',
              message: 'Product duplicated successfully',
              duration: 3000
            });
            loadProducts();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Product action error:', error);
      showToast({
        type: 'error',
        message: error.message || 'Failed to perform action',
        duration: 3000
      });
    }
  };

  const handleBulkAction = async (action) => {
    try {
      if (selectedProducts.length === 0) return;
      
      const confirmMessage = `Are you sure you want to ${action} ${selectedProducts.length} product(s)?`;
      if (!window.confirm(confirmMessage)) return;
      
      const promises = selectedProducts.map(productId => {
        switch (action) {
          case 'activate':
            return api.updateProduct(productId, { is_active: true });
          case 'deactivate':
            return api.updateProduct(productId, { is_active: false });
          case 'delete':
            return api.deleteProduct(productId);
          default:
            return Promise.resolve();
        }
      });
      
      await Promise.all(promises);
      
      showToast({
        type: 'success',
        message: `Products ${action}d successfully`,
        duration: 3000
      });
      
      setSelectedProducts([]);
      loadProducts();
      
    } catch (error) {
      console.error('Bulk action error:', error);
      showToast({
        type: 'error',
        message: error.message || 'Failed to perform bulk action',
        duration: 3000
      });
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Unified export functionality for all tabs
  const handleUnifiedExport = async (format = 'json') => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      
      // Collect data from all tabs
      const exportData = {
        shopInfo: {
          name: shopData.name,
          owner: shopData.owner,
          rating: shopData.rating,
          totalProducts: shopData.totalProducts,
          totalOrders: shopData.totalOrders,
          monthlyRevenue: shopData.monthlyRevenue,
          status: shopData.status,
          exportedBy: 'Shop Owner',
          generatedAt: new Date().toLocaleString()
        },
        overview: {
          productStats,
          shopData
        },
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          status: product.status,
          category: product.category,
          sku: product.sku,
          sales: product.sales,
          rating: product.rating,
          createdAt: product.createdAt
        })),
        analytics: {
          timeRange: '30d',
          note: 'Analytics data would be fetched from current analytics tab state'
        },
        orders: {
          note: 'Orders data would be fetched from orders tab'
        },
        customers: {
          note: 'Customer data would be fetched from customers tab'
        },
        exportDate: new Date().toISOString()
      };

      switch (format) {
        case 'pdf':
          const generator = new ReportGenerator();
          generator
            .initializePDF(`${shopData.name} - Complete Shop Report`)
            .addSectionHeader('Shop Overview')
            .addMetricsSummary({
              'Total Products': { current: shopData.totalProducts, change: 0 },
              'Total Orders': { current: shopData.totalOrders, change: 0 },
              'Monthly Revenue': { current: shopData.monthlyRevenue, change: 0 },
              'Shop Rating': { current: parseFloat(shopData.rating), change: 0 }
            });
            
          if (products.length > 0) {
            const productsForPDF = products.map(product => ({
              name: product.name,
              sales: product.sales || 0,
              revenue: product.price * (product.sales || 0),
              growth: 0
            }));
            generator.addTopProducts(productsForPDF, 'Products Catalog');
          }
          
          generator.downloadPDF(`${shopData.name.replace(/\s+/g, '-').toLowerCase()}-shop-report`);
          
          showToast({
            type: 'success',
            message: 'PDF report downloaded successfully',
            duration: 3000
          });
          break;

        case 'excel':
          const excelGenerator = new ReportGenerator();
          excelGenerator.downloadExcel(exportData, `${shopData.name.replace(/\s+/g, '-').toLowerCase()}-shop-data`);
          
          showToast({
            type: 'success',
            message: 'Excel report downloaded successfully',
            duration: 3000
          });
          break;

        case 'json':
        default:
          const jsonString = JSON.stringify(exportData, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${shopData.name.replace(/\s+/g, '-').toLowerCase()}-complete-data-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          showToast({
            type: 'success',
            message: 'JSON data downloaded successfully',
            duration: 3000
          });
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast({
        type: 'error',
        message: `Failed to export ${format.toUpperCase()} report: ${error.message}`,
        duration: 4000
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getCurrentPageProducts = () => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3', color: 'text-blue-600' },
    { id: 'products', label: 'Products', icon: 'Package', color: 'text-green-600' },
    { id: 'orders', label: 'Orders', icon: 'ShoppingBag', color: 'text-orange-600' },
    { id: 'customers', label: 'Customers', icon: 'Users', color: 'text-purple-600' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp', color: 'text-indigo-600' },
    { id: 'settings', label: 'Settings', icon: 'Settings', color: 'text-gray-600' }
  ];

  const renderTabContent = () => {
    try {
      switch (activeTab) {
        case 'overview':
          return <ShopOverview shopData={shopData} productStats={productStats} onTabChange={setActiveTab} />;
        case 'products':
          return <ProductsTab />;
        case 'orders':
          return <OrderManagement />;
        case 'customers':
          return <CustomerManagement />;
        case 'analytics':
          return <ShopAnalytics />;
        case 'settings':
          return <ShopSettings shopData={shopData} setShopData={setShopData} />;
        default:
          return <ShopOverview shopData={shopData} productStats={productStats} onTabChange={setActiveTab} />;
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return (
        <div className="p-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
            <p className="text-sm text-red-600 mb-4">We encountered an unexpected error while loading this section.</p>
            <button 
              onClick={() => setActiveTab('overview')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Back to Overview
            </button>
          </div>
        </div>
      );
    }
  };

  const renderProductManagement = () => (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage your product inventory and listings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleGoToCatalog}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Icon name="ExternalLink" size={16} />
            <span>View Catalog</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Icon name="Upload" size={16} />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="Package" size={20} className="text-blue-600" />
            <span className="text-sm text-gray-600">Total Products</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{productStats.total_products}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
            <span className="text-sm text-gray-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{productStats.active_products}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={20} className="text-yellow-600" />
            <span className="text-sm text-gray-600">Low Stock</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{productStats.low_stock_products}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2">
            <Icon name="XCircle" size={20} className="text-red-600" />
            <span className="text-sm text-gray-600">Out of Stock</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{productStats.out_of_stock_products}</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            >
              <Icon name="Grid3X3" size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            >
              <Icon name="List" size={20} />
            </button>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">{selectedProducts.length} selected</span>
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors"
            >
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Your product catalog will appear here once you start selling.</p>
        </div>
      )}

      {/* Products Display */}
      {!loading && products.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getCurrentPageProducts().map((product) => (
                <div key={product.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <Icon name="Package" size={48} className="text-gray-400" />
                    </div>
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{formatCurrency(product.price)}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Icon name="Star" size={12} className="text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{product.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500">{product.sales} sold</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => handleProductAction('edit', product.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Icon name="Edit" size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleProductAction('duplicate', product.id)}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                      >
                        <Icon name="Copy" size={14} />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => handleProductAction('delete', product.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                      >
                        <Icon name="Trash2" size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === getCurrentPageProducts().length && getCurrentPageProducts().length > 0}
                          onChange={() => {
                            const currentPageProductIds = getCurrentPageProducts().map(product => product.id);
                            setSelectedProducts(prev => 
                              prev.length === currentPageProductIds.length 
                                ? []
                                : currentPageProductIds
                            );
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getCurrentPageProducts().map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Icon name="Package" size={16} className="text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                            {product.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleProductAction('edit', product.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Icon name="Edit" size={16} />
                            </button>
                            <button
                              onClick={() => handleProductAction('duplicate', product.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Icon name="Copy" size={16} />
                            </button>
                            <button
                              onClick={() => handleProductAction('delete', product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Icon name="Trash2" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {noShopFound ? 'Setting up your shop...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // No shop found state
  if (noShopFound && !showCreateShopModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Store" size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to IziShopin!</h2>
          <p className="text-gray-600 mb-6">
            To get started, you'll need to create your shop. This will only take a few minutes.
          </p>
          <Button 
            onClick={() => setShowCreateShopModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create Your Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/landing-page')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon name="ArrowLeft" size={20} />
              <span className="text-sm font-medium hidden sm:block">Back to Site</span>
            </button>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Icon name="Store" size={16} color="white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Shop Dashboard</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {selectedShop?.name || shopData.name}
                  {hasMultipleShops && userShops.length > 0 && ` (${userShops.length} shops)`}
                </p>
              </div>
            </div>
          </div>

          {/* Center - Quick Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {tabs.slice(0, 4).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-3">
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon name="Menu" size={20} />
            </button>
            
            <button 
              onClick={handleLogout}
              className="hidden lg:flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Icon name="LogOut" size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-16 z-40" style={{display: 'none'}}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon name="Menu" size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{shopData.name}</h1>
              <p className="text-xs text-gray-500">Shop Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className="hidden sm:flex items-center space-x-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${getConnectionStatus().isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-gray-500">
                {getConnectionStatus().isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            
            {/* Real-time Clock */}
            <div className="hidden sm:block text-xs text-gray-500">
              {currentTime.toLocaleTimeString()}
            </div>
            
            
            {/* Profile */}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <Icon name="LogOut" size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {dashboardError && (
        <div className="lg:ml-64 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <Icon name="AlertCircle" size={20} className="text-red-500 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-red-700">
                Dashboard Error: {dashboardError}
              </p>
            </div>
            <button 
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:top-16 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Shop Info - Clickable to open shop profile */}
          <button 
            onClick={handleViewShop}
            className="flex flex-col p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left w-full"
          >
            {hasMultipleShops ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="Store" size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-gray-900">Shop Owner Dashboard</h1>
                    <p className="text-sm text-gray-500">Select a shop to manage</p>
                  </div>
                </div>
                <ShopSelector onShopSelect={selectShop} showCreateOption={true} />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Store" size={24} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 truncate">{selectedShop?.name || shopData.name}</h1>
                  <p className="text-sm text-gray-500">Click to view shop profile</p>
                </div>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={16} className="text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">{shopData.rating}</span>
                <span className="text-xs text-gray-500">({shopData.totalReviews || 0} reviews)</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                shopData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {shopData.status}
              </span>
            </div>
          </button>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon name={tab.icon} size={20} className={activeTab === tab.id ? 'text-blue-700' : tab.color} />
                <span className="ml-3">{tab.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <button 
                onClick={handleAddProduct}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="Plus" size={16} />
                <span>Add Product</span>
              </button>
              
              <button 
                onClick={handleViewProducts}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="Package" size={16} />
                <span>View Products</span>
              </button>
              
              <button 
                onClick={handleViewShop}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="Store" size={16} />
                <span>View Shop</span>
              </button>
            </div>
            
            {/* Real-time Clock */}
            <div className="mt-4 text-center">
              <div className="text-xs text-gray-500">Current Time</div>
              <div className="text-sm font-medium text-gray-900">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-xs text-gray-500">
                {currentTime.toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Icon name="User" size={20} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{shopData.owner}</p>
                <p className="text-xs text-gray-500 truncate">Shop Owner</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon name="LogOut" size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => {
                handleViewShop();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between h-16 px-6 border-b border-gray-200 hover:bg-gray-50 transition-colors w-full text-left"
            >
              <div>
                <h1 className="text-lg font-bold text-gray-900">{shopData.name}</h1>
                <p className="text-xs text-gray-500">Tap to view shop profile</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon name="X" size={20} className="text-gray-600" />
              </button>
            </button>
            
            <nav className="px-4 py-6 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon name={tab.icon} size={20} className={activeTab === tab.id ? 'text-blue-700' : tab.color} />
                  <span className="ml-3">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">Manage your shop and track performance</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Shop Selector (Multiple Shops) or Search */}
              {hasMultipleShops ? (
                <div className="w-64">
                  <ShopSelector onShopSelect={selectShop} showCreateOption={false} />
                </div>
              ) : (
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Export Button */}
              <div className="relative export-menu-container">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Download" size={16} />
                      <span>Export Data</span>
                      <Icon name="ChevronDown" size={16} />
                    </>
                  )}
                </button>
                
                {showExportMenu && !isExporting && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleUnifiedExport('pdf')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Icon name="FileText" size={16} className="text-red-600" />
                        <span>Download as PDF</span>
                      </button>
                      <button
                        onClick={() => handleUnifiedExport('excel')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Icon name="Table" size={16} className="text-green-600" />
                        <span>Download as Excel</span>
                      </button>
                      <button
                        onClick={() => handleUnifiedExport('json')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Icon name="Code" size={16} className="text-blue-600" />
                        <span>Download as JSON</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <NotificationBell variant="header" size={20} />
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-600">{shopData.name}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Notification Bell for Mobile */}
              <NotificationBell variant="mobile" size={20} />
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-6 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-1 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon name={tab.icon} size={20} />
              <span className="text-xs mt-1 truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="lg:hidden fixed bottom-20 right-4 z-30">
        <button 
          onClick={handleAddProduct}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Icon name="Plus" size={24} />
        </button>
      </div>

      {/* Create Shop Modal */}
      <CreateShopModal
        isOpen={showCreateShopModal}
        onClose={() => {
          setShowCreateShopModal(false);
          // If user closes modal without creating shop, redirect to profile
          if (noShopFound) {
            navigate('/user-profile');
          }
        }}
        onShopCreated={(newShop) => {
          setShowCreateShopModal(false);
          setNoShopFound(false);
          showToast(`Shop "${newShop.name}" created successfully!`, 'success');
          // Reload dashboard data
          window.location.reload();
        }}
      />
    </div>
  );
};

export default ShopOwnerDashboard;

