import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { showToast } from '../../../components/ui/Toast';
import api from '../../../services/api';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState({
    total_products: 0,
    active_products: 0,
    low_stock_products: 0,
    out_of_stock_products: 0
  });

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch user's products
      const response = await api.getMyProducts(0, 100, false);
      
      // Transform API response to match expected format
      const transformedProducts = response.map(product => ({
        id: product.id,
        name: product.name,
        category: 'General', // Default category
        price: parseFloat(product.price),
        stock: product.stock_quantity,
        status: product.is_active ? 
          (product.stock_quantity === 0 ? 'out_of_stock' : 
           product.stock_quantity <= 5 ? 'low_stock' : 'active') : 'inactive',
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        sku: product.id.substring(0, 8).toUpperCase(),
        sales: 0, // Would come from orders API
        rating: 4.5, // Default rating
        createdAt: new Date(product.created_at).toLocaleDateString(),
        description: product.description
      }));
      
      setProducts(transformedProducts);
      setFilteredProducts(transformedProducts);
      
      // Also fetch product stats
      const stats = await api.getMyProductStats();
      setProductStats(stats);
      
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
            loadProducts(); // Refresh the list
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
            loadProducts(); // Refresh the list
          }
          break;
        case 'view':
          // Navigate to product detail or open modal
          console.log('View product:', productId);
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
      loadProducts(); // Refresh the list
      
    } catch (error) {
      console.error('Bulk action error:', error);
      showToast({
        type: 'error',
        message: error.message || 'Failed to perform bulk action',
        duration: 3000
      });
    }
  };

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getCurrentPageProducts = () => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage your product inventory and listings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Icon name="Upload" size={16} />
            <span>Import</span>
          </button>
          <button 
            onClick={handleAddProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Icon name="Plus" size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Filters and View Controls */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
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
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
          
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          {/* View Mode Toggle */}
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

        {/* Bulk Actions */}
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
          <p className="text-gray-500 mb-4">Start by adding your first product to get started.</p>
          <button 
            onClick={handleAddProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Icon name="Plus" size={16} />
            <span>Add Your First Product</span>
          </button>
        </div>
      )}

      {/* Products Display */}
      {!loading && products.length > 0 && (
        <>
          {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getCurrentPageProducts().map((product) => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              {/* Product Image */}
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

              {/* Product Info */}
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

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => handleProductAction('view', product.id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Icon name="Eye" size={14} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleProductAction('edit', product.id)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm"
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
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="hidden lg:block overflow-x-auto">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
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
                    <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.sales}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleProductAction('view', product.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Icon name="Eye" size={16} />
                        </button>
                        <button
                          onClick={() => handleProductAction('edit', product.id)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Icon name="Edit" size={16} />
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

          {/* Mobile List View */}
          <div className="lg:hidden divide-y divide-gray-200">
            {getCurrentPageProducts().map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Icon name="Package" size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleProductAction('view', product.id)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                        >
                          <Icon name="Eye" size={16} />
                        </button>
                        <button
                          onClick={() => handleProductAction('edit', product.id)}
                          className="p-1 text-gray-600 hover:text-gray-700"
                        >
                          <Icon name="Edit" size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{product.category} • SKU: {product.sku}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-medium text-gray-900">{formatCurrency(product.price)}</span>
                      <span className="text-sm text-gray-500">{product.sales} sold</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
};

export default ProductManagement;

