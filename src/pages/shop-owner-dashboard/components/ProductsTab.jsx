import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';

const ProductsTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  const products = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      category: "Electronics",
      price: 45000,
      stock: 25,
      status: "active",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
      sales: 156,
      rating: 4.8,
      lastUpdated: "2025-01-15"
    },
    {
      id: 2,
      name: "Organic Cotton T-Shirt",
      category: "Fashion",
      price: 8500,
      stock: 0,
      status: "out_of_stock",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
      sales: 89,
      rating: 4.6,
      lastUpdated: "2025-01-14"
    },
    {
      id: 3,
      name: "Artisan Coffee Beans",
      category: "Food & Beverage",
      price: 12000,
      stock: 8,
      status: "low_stock",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop",
      sales: 234,
      rating: 4.9,
      lastUpdated: "2025-01-16"
    },
    {
      id: 4,
      name: "Handmade Leather Wallet",
      category: "Accessories",
      price: 18500,
      stock: 15,
      status: "active",
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=100&h=100&fit=crop",
      sales: 67,
      rating: 4.7,
      lastUpdated: "2025-01-13"
    },
    {
      id: 5,
      name: "Smart Fitness Tracker",
      category: "Electronics",
      price: 32000,
      stock: 42,
      status: "active",
      image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=100&h=100&fit=crop",
      sales: 198,
      rating: 4.5,
      lastUpdated: "2025-01-16"
    }
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'text-success bg-success/10' },
    { value: 'out_of_stock', label: 'Out of Stock', color: 'text-destructive bg-destructive/10' },
    { value: 'low_stock', label: 'Low Stock', color: 'text-warning bg-warning/10' },
    { value: 'draft', label: 'Draft', color: 'text-text-secondary bg-muted' }
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
    setSelectedProducts(
      selectedProducts.length === products.length ? [] : products.map(p => p.id)
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                    checked={selectedProducts.length === products.length}
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
              {filteredProducts.map((product) => (
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
                  <td className="p-4 text-text-secondary">{product.sales}</td>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {filteredProducts.map((product) => (
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
                    <span className="text-sm text-text-secondary">{product.sales} sales</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-text-secondary">
          Showing {filteredProducts.length} of {products.length} products
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="ChevronLeft" iconPosition="left">
            Previous
          </Button>
          <Button variant="outline" size="sm">1</Button>
          <Button variant="default" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm" iconName="ChevronRight" iconPosition="right">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductsTab;