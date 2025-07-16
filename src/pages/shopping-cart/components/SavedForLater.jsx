import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const SavedForLater = ({ 
  savedItems, 
  onMoveToCart, 
  onRemove,
  className = "" 
}) => {
  const [movingItems, setMovingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price).replace('XAF', 'XAF ');
  };

  const handleMoveToCart = async (itemId) => {
    setMovingItems(prev => new Set([...prev, itemId]));
    try {
      await onMoveToCart(itemId);
    } finally {
      setMovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemove = async (itemId) => {
    setRemovingItems(prev => new Set([...prev, itemId]));
    try {
      await onRemove(itemId);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const getStockStatus = (item) => {
    if (item.stock <= 0) return { text: 'Out of Stock', color: 'text-error', available: false };
    if (item.stock <= 5) return { text: `Only ${item.stock} left`, color: 'text-warning', available: true };
    return { text: 'In Stock', color: 'text-success', available: true };
  };

  if (!savedItems || savedItems.length === 0) {
    return null;
  }

  return (
    <div className={`bg-card border border-border rounded-lg marketplace-shadow-card ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Saved for Later ({savedItems.length})
          </h3>
          <Icon name="Heart" size={20} className="text-accent" />
        </div>

        <div className="space-y-4">
          {savedItems.map((item) => {
            const stockStatus = getStockStatus(item);
            const isMoving = movingItems.has(item.id);
            const isRemoving = removingItems.has(item.id);

            return (
              <div key={item.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <Link to={`/product-detail?id=${item.productId}`}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 marketplace-transition"
                      />
                    </div>
                  </Link>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/product-detail?id=${item.productId}`}
                    className="text-sm font-semibold text-foreground hover:text-primary marketplace-transition line-clamp-2 mb-1"
                  >
                    {item.name}
                  </Link>
                  
                  <Link 
                    to={`/shop-profile?id=${item.shopId}`}
                    className="text-xs text-text-secondary hover:text-primary marketplace-transition mb-1 block"
                  >
                    <Icon name="Store" size={10} className="inline mr-1" />
                    {item.shopName}
                  </Link>

                  {item.variant && (
                    <p className="text-xs text-text-secondary mb-2">
                      {item.variant}
                    </p>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center mb-2">
                    <span className={`text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                    {!stockStatus.available && (
                      <Icon name="AlertTriangle" size={12} className={`ml-1 ${stockStatus.color}`} />
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-bold text-primary font-mono">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-text-secondary line-through font-mono">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveToCart(item.id)}
                      disabled={!stockStatus.available || isMoving}
                      loading={isMoving}
                      iconName="ShoppingCart"
                      iconPosition="left"
                      className="text-xs"
                    >
                      {isMoving ? 'Moving...' : 'Move to Cart'}
                    </Button>
                    
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isRemoving}
                      className="flex items-center text-xs text-text-secondary hover:text-error marketplace-transition disabled:opacity-50"
                    >
                      <Icon name="Trash2" size={12} className="mr-1" />
                      {isRemoving ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>

                {/* Saved Date */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-text-secondary">
                    Saved {item.savedDate}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bulk Actions */}
        {savedItems.length > 1 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                Bulk actions:
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    savedItems.forEach(item => {
                      if (getStockStatus(item).available) {
                        handleMoveToCart(item.id);
                      }
                    });
                  }}
                  iconName="ShoppingCart"
                  iconPosition="left"
                  className="text-xs"
                >
                  Move All to Cart
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    savedItems.forEach(item => handleRemove(item.id));
                  }}
                  iconName="Trash2"
                  iconPosition="left"
                  className="text-xs text-error hover:text-error"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedForLater;