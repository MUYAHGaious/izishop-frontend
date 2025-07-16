import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';

// Import components
import ProductTable from './components/ProductTable';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import ProductFormModal from './components/ProductFormModal';
import SearchAndFilters from './components/SearchAndFilters';
import InventoryStats from './components/InventoryStats';

const ProductManagement = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savedFilters, setSavedFilters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for products
  const mockProducts = [
    {
      id: 1,
      name: "Samsung Galaxy S23 Ultra",
      category: "electronics",
      description: "Latest flagship smartphone with advanced camera system and S Pen functionality.",
      price: 850000,
      stock: 15,
      sku: "SGS23U-001",
      status: "active",
      condition: "new",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
      images: [
        { id: 1, url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" },
        { id: 2, url: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400" }
      ],
      seoTitle: "Samsung Galaxy S23 Ultra - Premium Smartphone",
      seoDescription: "Experience the ultimate smartphone with Samsung Galaxy S23 Ultra featuring advanced camera technology."
    },
    {
      id: 2,
      name: "Nike Air Max 270",
      category: "clothing",
      description: "Comfortable running shoes with Air Max technology for superior cushioning.",
      price: 125000,
      stock: 3,
      sku: "NAM270-002",
      status: "active",
      condition: "new",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      images: [
        { id: 1, url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" }
      ],
      seoTitle: "Nike Air Max 270 - Premium Running Shoes",
      seoDescription: "Step up your game with Nike Air Max 270 featuring revolutionary Air Max technology."
    },
    {
      id: 3,
      name: "MacBook Pro 14-inch",
      category: "electronics",
      description: "Professional laptop with M2 Pro chip for creative professionals and developers.",
      price: 1200000,
      stock: 8,
      sku: "MBP14-003",
      status: "active",
      condition: "new",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      images: [
        { id: 1, url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400" }
      ],
      seoTitle: "MacBook Pro 14-inch - Professional Laptop",
      seoDescription: "Unleash your creativity with the powerful MacBook Pro 14-inch featuring M2 Pro chip."
    },
    {
      id: 4,
      name: "Vintage Leather Jacket",
      category: "clothing",
      description: "Authentic vintage leather jacket in excellent condition, perfect for casual wear.",
      price: 75000,
      stock: 1,
      sku: "VLJ-004",
      status: "active",
      condition: "good",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
      images: [
        { id: 1, url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" }
      ],
      seoTitle: "Vintage Leather Jacket - Second Hand Fashion",
      seoDescription: "Stylish vintage leather jacket in good condition, perfect for fashion enthusiasts."
    },
    {
      id: 5,
      name: "Coffee Table Set",
      category: "home",
      description: "Modern coffee table set with glass top and wooden base, perfect for living rooms.",
      price: 180000,
      stock: 0,
      sku: "CTS-005",
      status: "out-of-stock",
      condition: "new",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      images: [
        { id: 1, url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400" }
      ],
      seoTitle: "Modern Coffee Table Set - Home Furniture",
      seoDescription: "Elegant coffee table set with glass top, perfect for modern living spaces."
    },
    {
      id: 6,
      name: "Wireless Headphones",
      category: "electronics",
      description: "Premium wireless headphones with noise cancellation and long battery life.",
      price: 95000,
      stock: 12,
      sku: "WH-006",
      status: "draft",
      condition: "new",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      images: [
        { id: 1, url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" }
      ],
      seoTitle: "Wireless Headphones - Premium Audio",
      seoDescription: "Experience superior sound quality with our premium wireless headphones."
    }
  ];

  // Mock saved filters
  const mockSavedFilters = [
    {
      id: 1,
      name: "Active Electronics",
      filters: {
        category: "electronics",
        status: "active",
        condition: "",
        priceRange: "",
        stockLevel: ""
      }
    },
    {
      id: 2,
      name: "Low Stock Items",
      filters: {
        category: "",
        status: "",
        condition: "",
        priceRange: "",
        stockLevel: "low-stock"
      }
    }
  ];

  // Initialize data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setSavedFilters(mockSavedFilters);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate inventory stats
  const inventoryStats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    lowStockItems: products.filter(p => p.stock <= 5 && p.stock > 0).length,
    outOfStockItems: products.filter(p => p.stock === 0).length
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Handle filters
  const handleFilter = (filters) => {
    let filtered = [...products];

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.condition) {
      filtered = filtered.filter(p => p.condition === filters.condition);
    }
    if (filters.stockLevel) {
      if (filters.stockLevel === 'in-stock') {
        filtered = filtered.filter(p => p.stock > 5);
      } else if (filters.stockLevel === 'low-stock') {
        filtered = filtered.filter(p => p.stock <= 5 && p.stock > 0);
      } else if (filters.stockLevel === 'out-of-stock') {
        filtered = filtered.filter(p => p.stock === 0);
      }
    }

    setFilteredProducts(filtered);
  };

  // Handle sorting
  const handleSort = (sortOption) => {
    const [field, direction] = sortOption.split('-');
    const sorted = [...filteredProducts].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      if (field === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    setFilteredProducts(sorted);
  };

  // Handle product selection
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on products:`, selectedProducts);
    // In a real app, this would make API calls
    setSelectedProducts([]);
  };

  // Handle product actions
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setFilteredProducts(prev => prev.filter(p => p.id !== productId));
      console.log(`Deleted product: ${productId}`);
    }
  };

  const handleStatusChange = (productId, newStatus) => {
    setProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, status: newStatus } : p)
    );
    setFilteredProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, status: newStatus } : p)
    );
  };

  // Handle product save
  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map(p =>
        p.id === editingProduct.id ? { ...p, ...productData } : p
      );
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
    } else {
      // Add new product
      const newProduct = {
        ...productData,
        id: Date.now(),
        image: productData.images[0]?.url || '/assets/images/no_image.png'
      };
      setProducts(prev => [...prev, newProduct]);
      setFilteredProducts(prev => [...prev, newProduct]);
    }
    setEditingProduct(null);
  };

  // Handle save filter
  const handleSaveFilter = (name, filters) => {
    const newFilter = {
      id: Date.now(),
      name,
      filters
    };
    setSavedFilters(prev => [...prev, newFilter]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <RoleBasedNavigation />
          <main className="flex-1 lg:ml-64 pt-16">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <RoleBasedNavigation />
        
        <main className="flex-1 lg:ml-64 pt-16">
          <div className="p-6">
            <BreadcrumbNavigation />
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Product Management</h1>
                <p className="text-muted-foreground">
                  Manage your product inventory, pricing, and availability
                </p>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  iconSize={16}
                >
                  Export
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsModalOpen(true);
                  }}
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={16}
                >
                  Add Product
                </Button>
              </div>
            </div>

            {/* Inventory Stats */}
            <InventoryStats stats={inventoryStats} />

            {/* Search and Filters */}
            <SearchAndFilters
              onSearch={handleSearch}
              onFilter={handleFilter}
              onSort={handleSort}
              savedFilters={savedFilters}
              onSaveFilter={handleSaveFilter}
            />

            {/* Bulk Actions */}
            <BulkActionsToolbar
              selectedCount={selectedProducts.length}
              onBulkAction={handleBulkAction}
              onClearSelection={() => setSelectedProducts([])}
            />

            {/* Products Table */}
            <ProductTable
              products={filteredProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onStatusChange={handleStatusChange}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onSelectAll={handleSelectAll}
            />

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Package" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="default"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsModalOpen(true);
                  }}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Add Your First Product
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-1100">
        <Button
          variant="default"
          size="lg"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          iconName="Plus"
          className="rounded-full w-14 h-14 elevation-3 hover:elevation-4 transition-smooth"
        />
      </div>
    </div>
  );
};

export default ProductManagement;