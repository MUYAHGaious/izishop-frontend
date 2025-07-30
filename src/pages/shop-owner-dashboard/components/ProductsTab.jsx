import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const ProductsTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await api.getMyProductsWithTrends(0, 100, false);
        
        const transformedProducts = response.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category || 'General',
          price: parseFloat(product.price),
          stock: product.stock_quantity,
          status: product.is_active ? 
            (product.stock_quantity === 0 ? 'out_of_stock' : 
             product.stock_quantity <= 5 ? 'low_stock' : 'active') : 'inactive',
          image: product.image_url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
          sales: product.total_sales || 0,
          rating: product.average_rating || 0,
          lastUpdated: new Date(product.updated_at || product.created_at).toLocaleDateString(),
          description: product.description,
          salesTrend: product.salesTrend || { growth: 0, trend: 'stable', confidence: 60 }
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
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesStatus = !selectedStatus || product.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, products]);

  // Get unique categories from products
  const categories = [
    { value: '', label: 'All Categories' },
    ...Array.from(new Set(products.map(p => p.category)))
      .map(category => ({ value: category, label: category }))
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active', color: 'text-success bg-success/10' },
    { value: 'out_of_stock', label: 'Out of Stock', color: 'text-destructive bg-destructive/10' },
    { value: 'low_stock', label: 'Low Stock', color: 'text-warning bg-warning/10' },
    { value: 'inactive', label: 'Inactive', color: 'text-text-secondary bg-muted' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color || 'text-text-secondary bg-muted'}`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    const currentPageProducts = getCurrentPageProducts();
    const allCurrentSelected = currentPageProducts.every(product => selectedProducts.includes(product.id));
    
    if (allCurrentSelected) {
      // Deselect all products on current page
      setSelectedProducts(prev => prev.filter(id => !currentPageProducts.map(p => p.id).includes(id)));
    } else {
      // Select all products on current page
      const newSelections = currentPageProducts.map(p => p.id).filter(id => !selectedProducts.includes(id));
      setSelectedProducts(prev => [...prev, ...newSelections]);
    }
  };

  // Get products for current page
  const getCurrentPageProducts = () => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getTrendColor = (growth) => {
    if (growth > 10) return 'text-green-600';
    if (growth < -10) return 'text-red-600';
    return 'text-gray-500';
  };

  const formatGrowthPercentage = (growth) => {
    return `${growth > 0 ? '+' : ''}${growth}%`;
  };

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Filter by category"
            className="w-full sm:w-48"
          />
          <Select
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Filter by status"
            className="w-full sm:w-48"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export
          </Button>
          <Button variant="default" iconName="Plus" iconPosition="left">
            Add Product
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="Edit" iconPosition="left">
                Edit
              </Button>
              <Button variant="outline" size="sm" iconName="Copy" iconPosition="left">
                Duplicate
              </Button>
              <Button variant="destructive" size="sm" iconName="Trash2" iconPosition="left">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={getCurrentPageProducts().length > 0 && getCurrentPageProducts().every(product => selectedProducts.includes(product.id))}
                    onChange={handleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Product</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Category</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Price</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Stock</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Sales</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: productsPerPage }).map((_, index) => (
                  <tr key={index} className="border-b border-border animate-pulse">
                    <td className="p-4">
                      <div className="w-4 h-4 bg-muted rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        <div>
                          <div className="w-24 h-4 bg-muted rounded mb-2"></div>
                          <div className="w-16 h-3 bg-muted rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="w-16 h-4 bg-muted rounded"></div></td>
                    <td className="p-4"><div className="w-20 h-4 bg-muted rounded"></div></td>
                    <td className="p-4"><div className="w-12 h-4 bg-muted rounded"></div></td>
                    <td className="p-4"><div className="w-16 h-6 bg-muted rounded-full"></div></td>
                    <td className="p-4"><div className="w-12 h-4 bg-muted rounded"></div></td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-muted rounded"></div>
                        <div className="w-8 h-8 bg-muted rounded"></div>
                        <div className="w-8 h-8 bg-muted rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : getCurrentPageProducts().length > 0 ? (
                getCurrentPageProducts().map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{product.name}</div>
                        <div className="text-sm text-text-secondary">
                          Rating: {product.rating} ⭐
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary">{product.category}</td>
                  <td className="p-4 font-medium text-text-primary">
                    {product.price.toLocaleString()} XAF
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${
                      product.stock === 0 ? 'text-destructive' :
                      product.stock < 10 ? 'text-warning' : 'text-text-primary'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">{getStatusBadge(product.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-text-secondary">{product.sales}</span>
                      <div className="flex items-center space-x-1">
                        <Icon 
                          name={getTrendIcon(product.salesTrend.trend)} 
                          size={14} 
                          className={getTrendColor(product.salesTrend.growth)} 
                        />
                        <span className={`text-xs font-medium ${getTrendColor(product.salesTrend.growth)}`}>
                          {formatGrowthPercentage(product.salesTrend.growth)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon name="MoreHorizontal" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-text-secondary">
                    <div className="flex flex-col items-center space-y-2">
                      <Icon name="Package" size={48} className="text-muted" />
                      <p>No products found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {loading ? (
            // Mobile loading skeleton
            Array.from({ length: productsPerPage }).map((_, index) => (
              <div key={index} className="p-4 border-b border-border last:border-b-0 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-muted rounded mt-1"></div>
                  <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-muted rounded"></div>
                    <div className="w-20 h-3 bg-muted rounded"></div>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-4 bg-muted rounded"></div>
                      <div className="w-16 h-3 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-muted rounded"></div>
                </div>
              </div>
            ))
          ) : getCurrentPageProducts().length > 0 ? (
            getCurrentPageProducts().map((product) => (
            <div key={product.id} className="p-4 border-b border-border last:border-b-0">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="mt-1 rounded border-border"
                />
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary truncate">{product.name}</h3>
                      <p className="text-sm text-text-secondary">{product.category}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="font-medium text-text-primary">
                          {product.price.toLocaleString()} XAF
                        </span>
                        <span className={`text-sm ${
                          product.stock === 0 ? 'text-destructive' :
                          product.stock < 10 ? 'text-warning' : 'text-text-secondary'
                        }`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Icon name="MoreVertical" size={16} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {getStatusBadge(product.status)}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-text-secondary">{product.sales} sales</span>
                      <div className="flex items-center space-x-1">
                        <Icon 
                          name={getTrendIcon(product.salesTrend.trend)} 
                          size={12} 
                          className={getTrendColor(product.salesTrend.growth)} 
                        />
                        <span className={`text-xs font-medium ${getTrendColor(product.salesTrend.growth)}`}>
                          {formatGrowthPercentage(product.salesTrend.growth)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ))
          ) : (
            <div className="p-8 text-center text-text-secondary">
              <div className="flex flex-col items-center space-y-2">
                <Icon name="Package" size={48} className="text-muted" />
                <p>No products found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
          <div className="text-sm text-text-secondary">
            Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </div>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                iconName="ChevronLeft" 
                iconPosition="left"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button 
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="sm" 
                iconName="ChevronRight" 
                iconPosition="right"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsTab;