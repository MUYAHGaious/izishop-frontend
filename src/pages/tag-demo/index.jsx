import React, { useState } from 'react';
import { getProductTags, getAllUniqueTags, filterProductsByTag } from '../../utils/productTags';
import TagList from '../../components/ui/Tag';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';

/**
 * Tag Demo Page
 * Demonstrates the dynamic product tagging system
 */
const TagDemo = () => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [showTagDetails, setShowTagDetails] = useState(false);

  // Sample products with various tag combinations
  const sampleProducts = [
    {
      id: '1',
      name: 'Samsung Galaxy S24 Ultra',
      price: 450000,
      image_urls: ['/assets/images/no_image.png'],
      rating: 4.8,
      reviewCount: 256,
      stock: 5, // Low stock
      salesCount: 150, // Best seller
      dateAdded: new Date().toISOString(), // New product
      shopName: 'TechHub Store',
      shopId: 'shop1',
      description: 'Latest Samsung flagship with AI features'
    },
    {
      id: '2',
      name: 'iPhone 15 Pro Max',
      price: 650000,
      image_urls: ['/assets/images/no_image.png'],
      rating: 4.9,
      reviewCount: 312,
      stock: 0, // Out of stock
      salesCount: 280, // Best seller + trending
      dateAdded: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // Not new
      shopName: 'Apple Store',
      shopId: 'shop2',
      description: 'Premium iPhone with titanium design'
    },
    {
      id: '3',
      name: 'MacBook Pro M3',
      price: 1200000,
      image_urls: ['/assets/images/no_image.png'],
      rating: 4.7,
      reviewCount: 189,
      stock: 15,
      salesCount: 75, // High demand
      dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // New
      shopName: 'Mac Store',
      shopId: 'shop3',
      description: 'Powerful laptop for professionals'
    },
    {
      id: '4',
      name: 'AirPods Pro 3',
      price: 180000,
      image_urls: ['/assets/images/no_image.png'],
      rating: 4.6,
      reviewCount: 145,
      stock: 8, // Low stock
      salesCount: 120, // Best seller
      dateAdded: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // Not new
      shopName: 'Audio Store',
      shopId: 'shop4',
      description: 'Premium wireless earbuds'
    },
    {
      id: '5',
      name: 'iPad Air 5',
      price: 320000,
      image_urls: ['/assets/images/no_image.png'],
      rating: 4.5,
      reviewCount: 98,
      stock: 25,
      salesCount: 45,
      dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // New
      shopName: 'Tablet Store',
      shopId: 'shop5',
      description: 'Versatile tablet for work and play'
    },
    {
      id: '6',
      name: 'Sony WH-1000XM5',
      price: 280000,
      image_urls: ['/assets/images/no_image.png'],
      rating: 4.8,
      reviewCount: 203,
      stock: 3, // Low stock
      salesCount: 180, // Best seller
      dateAdded: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // New
      shopName: 'Audio Store',
      shopId: 'shop6',
      description: 'Industry-leading noise-canceling headphones'
    }
  ];

  // Get all available tags
  const availableTags = getAllUniqueTags(sampleProducts);

  // Filter products by selected tag
  const filteredProducts = selectedTag 
    ? filterProductsByTag(sampleProducts, selectedTag.id)
    : sampleProducts;

  // Handle tag selection
  const handleTagClick = (tag) => {
    setSelectedTag(selectedTag?.id === tag.id ? null : tag);
  };

  // Clear tag filter
  const clearTagFilter = () => {
    setSelectedTag(null);
  };

  // Handle tag details click
  const handleTagDetails = (tag) => {
    console.log('Tag details:', tag);
    setShowTagDetails(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pt-20">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Dynamic Product Tagging System</h1>
          <p className="text-lg text-text-secondary mb-6">
            See how products automatically get tagged based on their data
          </p>
          
          <div className="bg-card p-4 rounded-lg border mb-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">How It Works</h2>
            <p className="text-text-secondary text-sm">
              Products are automatically tagged based on:
            </p>
            <ul className="text-text-secondary text-sm mt-2 text-left max-w-md mx-auto">
              <li>• <strong>New:</strong> Added within last 30 days</li>
              <li>• <strong>Best Seller:</strong> Sales count > 100</li>
              <li>• <strong>Low Stock:</strong> Stock < 10</li>
              <li>• <strong>Out of Stock:</strong> Stock = 0</li>
              <li>• <strong>High Demand:</strong> Sales > 50 & Stock < 20</li>
              <li>• <strong>Trending:</strong> Sales > 200</li>
            </ul>
          </div>
        </div>

        {/* Tag Filter Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Filter by Tags</h3>
            {selectedTag && (
              <Button 
                onClick={clearTagFilter} 
                variant="outline" 
                size="sm"
                iconName="X"
              >
                Clear Filter
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTag?.id === tag.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-text-secondary hover:bg-muted/80'
                }`}
              >
                {tag.label}
                <span className="ml-2 text-xs opacity-75">
                  ({filterProductsByTag(sampleProducts, tag.id).length})
                </span>
              </button>
            ))}
          </div>
          
          {selectedTag && (
            <div className="mt-3 text-center text-sm text-text-secondary">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} with "{selectedTag.label}" tag
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-card rounded-lg border border-border p-4 hover:shadow-moderate transition-all duration-200">
              {/* Product Image Placeholder */}
              <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                <Icon name="Package" size={48} className="text-text-secondary" />
              </div>
              
              {/* Product Tags */}
              <div className="mb-3">
                <TagList
                  tags={getProductTags(product)}
                  size="xs"
                  maxTags={3}
                  className="flex-col gap-1"
                  onTagClick={handleTagDetails}
                />
              </div>
              
              {/* Product Info */}
              <h3 className="font-semibold text-text-primary mb-2">{product.name}</h3>
              <p className="text-text-secondary text-sm mb-3 line-clamp-2">{product.description}</p>
              
              {/* Product Stats */}
              <div className="grid grid-cols-2 gap-4 text-xs text-text-secondary mb-3">
                <div>
                  <span className="font-medium">Stock:</span> {product.stock}
                </div>
                <div>
                  <span className="font-medium">Sales:</span> {product.salesCount}
                </div>
                <div>
                  <span className="font-medium">Rating:</span> {product.rating}/5
                </div>
                <div>
                  <span className="font-medium">Added:</span> {new Date(product.dateAdded).toLocaleDateString()}
                </div>
              </div>
              
              {/* Price */}
              <div className="text-lg font-bold text-primary mb-3">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XAF',
                  minimumFractionDigits: 0
                }).format(product.price)}
              </div>
              
              {/* Shop Info */}
              <div className="text-xs text-text-secondary">
                Sold by: {product.shopName}
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredProducts.length === 0 && selectedTag && (
          <div className="text-center py-12">
            <div className="text-text-secondary text-lg mb-2">
              No products found with "{selectedTag.label}" tag
            </div>
            <Button onClick={clearTagFilter} variant="outline">
              Clear Filter
            </Button>
          </div>
        )}

        {/* Tag Statistics */}
        <div className="bg-card p-6 rounded-lg border">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Tag Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {availableTags.map((tag) => {
              const productCount = filterProductsByTag(sampleProducts, tag.id).length;
              return (
                <div key={tag.id} className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">{productCount}</div>
                  <div className="text-sm text-text-secondary">{tag.label}</div>
                  <div className="text-xs text-text-secondary mt-1">
                    {((productCount / sampleProducts.length) * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tag Details Modal */}
        {showTagDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Tag Information</h3>
              <p className="text-text-secondary mb-4">
                Click on any tag to see detailed information about how it's applied to products.
              </p>
              <Button onClick={() => setShowTagDetails(false)} fullWidth>
                Close
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <MobileBottomTab />
    </div>
  );
};

export default TagDemo;
