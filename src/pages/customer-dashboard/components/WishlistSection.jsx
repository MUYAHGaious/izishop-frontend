import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const WishlistSection = ({ wishlistItems, onRemoveFromWishlist, onAddToCart }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPriceChangeIcon = (change) => {
    if (change > 0) return { icon: 'TrendingUp', color: 'text-error' };
    if (change < 0) return { icon: 'TrendingDown', color: 'text-success' };
    return { icon: 'Minus', color: 'text-muted-foreground' };
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Wishlist</h2>
        <div className="flex items-center space-x-2">
          <Icon name="Heart" size={20} className="text-error" />
          <span className="text-sm text-muted-foreground">{wishlistItems.length} items</span>
        </div>
      </div>

      <div className="space-y-4">
        {wishlistItems.map((item) => {
          const priceChange = getPriceChangeIcon(item.priceChange);
          
          return (
            <div
              key={item.id}
              className="flex items-center space-x-4 p-3 border border-border rounded-lg hover:border-primary/20 transition-micro"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{item.shop}</p>
                
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(item.currentPrice)}
                  </span>
                  {item.priceChange !== 0 && (
                    <div className="flex items-center space-x-1">
                      <Icon name={priceChange.icon} size={12} className={priceChange.color} />
                      <span className={`text-xs ${priceChange.color}`}>
                        {Math.abs(item.priceChange)}%
                      </span>
                    </div>
                  )}
                </div>

                {!item.inStock && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Icon name="AlertCircle" size={12} className="text-warning" />
                    <span className="text-xs text-warning">Out of stock</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="ShoppingCart"
                  disabled={!item.inStock}
                  onClick={() => onAddToCart(item.id)}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => onRemoveFromWishlist(item.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {wishlistItems.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Heart" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-4">Save items you love for later</p>
          <Button
            variant="default"
            iconName="Search"
            iconPosition="left"
            onClick={() => console.log('Browse products')}
          >
            Discover Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default WishlistSection;