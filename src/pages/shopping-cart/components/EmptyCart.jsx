import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const EmptyCart = ({ className = "" }) => {
  const suggestedProducts = [
    {
      id: 1,
      name: 'iPhone 14 Pro',
      price: 850000,
      originalPrice: 950000,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      rating: 4.8,
      shop: 'TechHub Store'
    },
    {
      id: 2,
      name: 'Samsung Galaxy Buds Pro',
      price: 125000,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop',
      rating: 4.6,
      shop: 'Audio World'
    },
    {
      id: 3,
      name: 'MacBook Air M2',
      price: 1200000,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop',
      rating: 4.9,
      shop: 'Apple Store'
    },
    {
      id: 4,
      name: 'Nike Air Max 270',
      price: 85000,
      originalPrice: 95000,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      rating: 4.5,
      shop: 'SportZone'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price).replace('XAF', 'XAF ');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="Star" size={12} className="text-accent fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="Star" size={12} className="text-accent fill-current opacity-50" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="Star" size={12} className="text-border" />
      );
    }

    return stars;
  };

  return (
    <div className={`${className}`}>
      {/* Empty State */}
      <div className="text-center py-12">
        <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
          <Icon name="ShoppingCart" size={64} className="text-text-secondary" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Your cart is empty
        </h2>
        
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/product-catalog">
            <Button variant="default" size="lg" iconName="Search" iconPosition="left">
              Browse Products
            </Button>
          </Link>
          
          <Link to="/landing-page">
            <Button variant="outline" size="lg" iconName="Home" iconPosition="left">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Suggested Products */}
      <div className="mt-12">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            You might like these
          </h3>
          <p className="text-text-secondary">
            Popular products from our marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {suggestedProducts.map((product) => (
            <div key={product.id} className="bg-card border border-border rounded-lg marketplace-shadow-card overflow-hidden group">
              <Link to={`/product-detail?id=${product.id}`}>
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 marketplace-transition"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link 
                  to={`/product-detail?id=${product.id}`}
                  className="text-sm font-semibold text-foreground hover:text-primary marketplace-transition line-clamp-2 mb-2"
                >
                  {product.name}
                </Link>

                <div className="flex items-center mb-2">
                  <div className="flex items-center space-x-1 mr-2">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-xs text-text-secondary">
                    ({product.rating})
                  </span>
                </div>

                <p className="text-xs text-text-secondary mb-3">
                  <Icon name="Store" size={10} className="inline mr-1" />
                  {product.shop}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-primary font-mono">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-text-secondary line-through font-mono ml-2">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    className="text-xs"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-card border border-border rounded-lg">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Shield" size={24} className="text-primary" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Secure Shopping</h4>
          <p className="text-sm text-text-secondary">
            Your payments and personal information are always protected
          </p>
        </div>

        <div className="text-center p-6 bg-card border border-border rounded-lg">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Truck" size={24} className="text-success" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Fast Delivery</h4>
          <p className="text-sm text-text-secondary">
            Quick and reliable delivery to your doorstep across Cameroon
          </p>
        </div>

        <div className="text-center p-6 bg-card border border-border rounded-lg">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="RotateCcw" size={24} className="text-accent" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Easy Returns</h4>
          <p className="text-sm text-text-secondary">
            Not satisfied? Return your items within 30 days for a full refund
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;