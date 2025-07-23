import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../../components/layouts/AppLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading products
    const timer = setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Sample Product 1',
          price: 25000,
          status: 'active',
          stock: 15,
          views: 124,
          sales: 8,
          image: null
        },
        {
          id: 2,
          name: 'Sample Product 2',
          price: 45000,
          status: 'inactive',
          stock: 0,
          views: 89,
          sales: 3,
          image: null
        }
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  const filteredProducts = products.filter(product => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'out_of_stock') return product.stock === 0;
    return product.status === filterStatus;
  });

  const getStatusColor = (status, stock) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status, stock) => {
    if (stock === 0) return 'Out of Stock';
    if (status === 'active') return 'Active';
    return 'Inactive';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>My Products - IziShopin</title>
        <meta name="description" content="Manage your product listings" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Products</h1>
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                variant="default"
                onClick={() => window.location.href = '/add-product'}
                className="inline-flex items-center"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Status Filter */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Icon name="Grid3X3" size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <Icon name="List" size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Icon name="Package" size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                {products.length === 0 
                  ? 'Start by adding your first product'
                  : 'Try adjusting your filters'
                }
              </p>
              {products.length === 0 && (
                <Button
                  variant="default"
                  onClick={() => window.location.href = '/add-product'}
                  className="inline-flex items-center"
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
                viewMode === 'grid' ? (
                  /* Grid View */
                  <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <Icon name="Package" size={48} className="text-gray-400" />
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status, product.stock)}`}>
                          {getStatusText(product.status, product.stock)}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="text-lg font-bold text-primary mb-2">
                        XAF {product.price.toLocaleString()}
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500 mb-3">
                        <span>Stock: {product.stock}</span>
                        <span>Views: {product.views}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="flex-1">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div key={product.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Icon name="Package" size={24} className="text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status, product.stock)}`}>
                            {getStatusText(product.status, product.stock)}
                          </span>
                        </div>
                        
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-lg font-bold text-primary">
                            XAF {product.price.toLocaleString()}
                          </div>
                          <div className="flex space-x-4 text-sm text-gray-500">
                            <span>Stock: {product.stock}</span>
                            <span>Views: {product.views}</span>
                            <span>Sales: {product.sales}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 flex-shrink-0">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MyProducts;