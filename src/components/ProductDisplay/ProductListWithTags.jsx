import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import TagList from '../ui/Tag';
import { getProductTags, getAllUniqueTags, filterProductsByTag } from '../../utils/productTags';
import Button from '../ui/Button';
import Icon from '../AppIcon';

/**
 * ProductList Component with Dynamic Tagging System
 * Fetches products from API and displays them with dynamic tags
 */
const ProductListWithTags = ({ 
  className = "",
  variant = 'default',
  showWishlist = true,
  showBadges = true,
  showQuickActions = false,
  showDescription = false,
  showShopInfo = true,
  showRating = true,
  showStock = true,
  onAddToCart,
  onToggleWishlist,
  ...props 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call - replace with actual API endpoint
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the data to include required fields for tagging
        const transformedProducts = data.map(product => ({
          ...product,
          // Ensure required fields exist for tagging system
          dateAdded: product.dateAdded || product.created_at || product.date_added,
          salesCount: product.salesCount || product.sales_count || product.sold_count || 0,
          stock: product.stock || product.quantity || product.inventory || 0
        }));
        
        setProducts(transformedProducts);
        
        // Extract all unique tags from products
        const tags = getAllUniqueTags(transformedProducts);
        setAvailableTags(tags);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        
        // Fallback to sample data for demonstration
        const sampleProducts = generateSampleProducts();
        setProducts(sampleProducts);
        setAvailableTags(getAllUniqueTags(sampleProducts));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Generate sample products for demonstration when API is not available
  const generateSampleProducts = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    return [
      {
        id: '1',
        name: 'Samsung Galaxy S24 Ultra',
        price: 450000,
        image_urls: ['/assets/images/no_image.png'],
        rating: 4.8,
        reviewCount: 256,
        stock: 5, // Low stock
        salesCount: 150, // Best seller
        dateAdded: now.toISOString(), // New product
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
        dateAdded: thirtyDaysAgo.toISOString(), // Not new
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
        dateAdded: new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)).toISOString(), // New
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
        dateAdded: new Date(now.getTime() - (45 * 24 * 60 * 60 * 1000)).toISOString(), // Not new
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
        dateAdded: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(), // New
        shopName: 'Tablet Store',
        shopId: 'shop5',
        description: 'Versatile tablet for work and play'
      }
    ];
  };

  // Filter products by selected tag
  const filteredProducts = selectedTag 
    ? filterProductsByTag(products, selectedTag.id)
    : products;

  // Handle tag selection
  const handleTagClick = (tag) => {
    setSelectedTag(selectedTag?.id === tag.id ? null : tag);
  };

  // Clear tag filter
  const clearTagFilter = () => {
    setSelectedTag(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-lg mb-2">Error loading products</div>
        <div className="text-text-secondary text-sm mb-4">{error}</div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-secondary text-lg">No products found</div>
        <div className="text-text-secondary text-sm mt-2">Try adjusting your search or filters</div>
      </div>
    );
  }

  return (
    <div className={className} {...props}>
      {/* Tag Filter Section */}
      <div className="mb-6">
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
        
        <div className="flex flex-wrap gap-2">
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
                ({filterProductsByTag(products, tag.id).length})
              </span>
            </button>
          ))}
        </div>
        
        {selectedTag && (
          <div className="mt-3 text-sm text-text-secondary">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} with "{selectedTag.label}" tag
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={variant}
            showWishlist={showWishlist}
            showBadges={showBadges}
            showQuickActions={showQuickActions}
            showDescription={showDescription}
            showShopInfo={showShopInfo}
            showRating={showRating}
            showStock={showStock}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
          />
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
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h4 className="text-sm font-medium text-text-primary mb-3">Tag Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {availableTags.map((tag) => {
            const productCount = filterProductsByTag(products, tag.id).length;
            return (
              <div key={tag.id} className="text-center">
                <div className="text-lg font-semibold text-primary">{productCount}</div>
                <div className="text-xs text-text-secondary">{tag.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductListWithTags;
