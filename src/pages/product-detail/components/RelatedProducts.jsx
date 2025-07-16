import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const RelatedProducts = ({ currentProductId, category }) => {
  const scrollRef = useRef(null);

  const mockRelatedProducts = [
    {
      id: 2,
      name: 'Samsung Galaxy S23 Ultra',
      price: 850000,
      originalPrice: 950000,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
      rating: 4.6,
      reviewCount: 234,
      shop: {
        name: 'TechHub Store',
        isVerified: true
      },
      isSecondHand: false,
      discount: 11,
      inStock: true
    },
    {
      id: 3,
      name: 'iPhone 13 Pro Max',
      price: 750000,
      originalPrice: 850000,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      rating: 4.8,
      reviewCount: 456,
      shop: {
        name: 'Apple Store',
        isVerified: true
      },
      isSecondHand: false,
      discount: 12,
      inStock: true
    },
    {
      id: 4,
      name: 'Google Pixel 7 Pro',
      price: 650000,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      rating: 4.4,
      reviewCount: 189,
      shop: {
        name: 'Mobile World',
        isVerified: false
      },
      isSecondHand: false,
      discount: null,
      inStock: true
    },
    {
      id: 5,
      name: 'OnePlus 11 5G',
      price: 550000,
      originalPrice: 600000,
      image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400',
      rating: 4.3,
      reviewCount: 167,
      shop: {
        name: 'OnePlus Official',
        isVerified: true
      },
      isSecondHand: false,
      discount: 8,
      inStock: false
    },
    {
      id: 6,
      name: 'Xiaomi Mi 13 Pro',
      price: 480000,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400',
      rating: 4.2,
      reviewCount: 203,
      shop: {
        name: 'Xiaomi Store',
        isVerified: true
      },
      isSecondHand: false,
      discount: null,
      inStock: true
    },
    {
      id: 7,
      name: 'Huawei P50 Pro',
      price: 420000,
      originalPrice: 500000,
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400',
      rating: 4.1,
      reviewCount: 145,
      shop: {
        name: 'Huawei Official',
        isVerified: true
      },
      isSecondHand: true,
      condition: 'Excellent',
      discount: 16,
      inStock: true
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to cart logic here
    console.log('Adding to cart:', product);
    
    // Show success feedback
    const button = e.target.closest('button');
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-border text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-border text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Carousel */}
      <div className="p-6">
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockRelatedProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product-detail?id=${product.id}`}
              className="flex-shrink-0 w-64 bg-surface border border-border rounded-lg overflow-hidden hover:shadow-modal marketplace-transition group"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 marketplace-transition"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 space-y-1">
                  {product.discount && (
                    <span className="bg-error text-error-foreground px-2 py-1 rounded-full text-xs font-medium">
                      -{product.discount}%
                    </span>
                  )}
                  {product.isSecondHand && (
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
                      Second-hand
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 marketplace-transition">
                  <button className="p-2 bg-surface/80 backdrop-blur-sm rounded-full text-text-secondary hover:text-foreground hover:bg-surface marketplace-transition">
                    <Icon name="Heart" size={16} />
                  </button>
                </div>

                {/* Stock Status */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="bg-error text-error-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Product Name */}
                <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary marketplace-transition">
                  {product.name}
                </h3>

                {/* Shop Info */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-secondary truncate">
                    {product.shop.name}
                  </span>
                  {product.shop.isVerified && (
                    <Icon name="BadgeCheck" size={14} className="text-primary flex-shrink-0" />
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-warning fill-current" />
                    <span className="text-sm font-medium text-foreground">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-sm text-text-secondary">
                    ({product.reviewCount})
                  </span>
                </div>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary font-mono">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-text-secondary line-through font-mono">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  {product.isSecondHand && product.condition && (
                    <div className="flex items-center space-x-1">
                      <Icon name="RefreshCw" size={12} className="text-secondary" />
                      <span className="text-xs text-secondary">
                        Condition: {product.condition}
                      </span>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  disabled={!product.inStock}
                  onClick={(e) => handleAddToCart(product, e)}
                  className="mt-3"
                >
                  <Icon name="ShoppingCart" size={14} className="mr-2" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="p-6 border-t border-border text-center">
        <Link to={`/product-catalog?category=${category}`}>
          <Button variant="outline">
            View All {category} Products
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RelatedProducts;