import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const CartItem = ({ 
  item, 
  onQuantityChange, 
  onRemove, 
  onSaveForLater,
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price).replace('XAF', 'XAF ');
  };

  const handleQuantityDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (item.quantity < item.maxStock) {
      onQuantityChange(item.id, item.quantity + 1);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(item.id);
    setIsRemoving(false);
  };

  const handleSaveForLater = () => {
    onSaveForLater(item.id);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getStockStatus = () => {
    if (item.stock <= 0) return { text: 'Out of Stock', color: 'text-error', urgent: true };
    if (item.stock <= 5) return { text: `Only ${item.stock} left`, color: 'text-warning', urgent: true };
    if (item.stock <= 10) return { text: `${item.stock} available`, color: 'text-warning', urgent: false };
    return { text: 'In Stock', color: 'text-success', urgent: false };
  };

  const stockStatus = getStockStatus();

  return (
    <div className={`bg-card border border-border rounded-lg marketplace-shadow-card ${className}`}>
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <Link to={`/product-detail?id=${item.productId}`}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden">
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
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/product-detail?id=${item.productId}`}
                  className="text-sm sm:text-base font-semibold text-foreground hover:text-primary marketplace-transition line-clamp-2"
                >
                  {item.name}
                </Link>
                
                <Link 
                  to={`/shop-profile?id=${item.shopId}`}
                  className="text-xs sm:text-sm text-text-secondary hover:text-primary marketplace-transition mt-1 block"
                >
                  <Icon name="Store" size={12} className="inline mr-1" />
                  {item.shopName}
                </Link>

                {item.variant && (
                  <p className="text-xs text-text-secondary mt-1">
                    {item.variant}
                  </p>
                )}

                {/* Stock Status */}
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                  {stockStatus.urgent && (
                    <Icon name="AlertTriangle" size={12} className={`ml-1 ${stockStatus.color}`} />
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right ml-4">
                <p className="text-sm sm:text-base font-bold text-primary font-mono">
                  {formatPrice(item.price)}
                </p>
                {item.originalPrice && item.originalPrice > item.price && (
                  <p className="text-xs text-text-secondary line-through font-mono">
                    {formatPrice(item.originalPrice)}
                  </p>
                )}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-border rounded-md">
                  <button
                    onClick={handleQuantityDecrease}
                    disabled={item.quantity <= 1}
                    className="p-2 text-text-secondary hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed marketplace-transition"
                  >
                    <Icon name="Minus" size={14} />
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-foreground min-w-[40px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={handleQuantityIncrease}
                    disabled={item.quantity >= item.maxStock || item.stock <= 0}
                    className="p-2 text-text-secondary hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed marketplace-transition"
                  >
                    <Icon name="Plus" size={14} />
                  </button>
                </div>

                <span className="text-sm font-semibold text-foreground font-mono">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>

              {/* Mobile Expand Button */}
              <button
                onClick={toggleExpanded}
                className="sm:hidden p-2 text-text-secondary hover:text-foreground hover:bg-muted rounded-md marketplace-transition"
              >
                <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
              </button>
            </div>

            {/* Delivery Info & Actions - Desktop Always Visible, Mobile Expandable */}
            <div className={`mt-4 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
              {/* Delivery Estimate */}
              <div className="flex items-center text-xs text-text-secondary mb-3">
                <Icon name="Truck" size={12} className="mr-1" />
                <span>Delivery: {item.deliveryEstimate}</span>
                {item.freeDelivery && (
                  <span className="ml-2 text-success font-medium">Free Delivery</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSaveForLater}
                  className="flex items-center text-xs text-text-secondary hover:text-primary marketplace-transition"
                >
                  <Icon name="Heart" size={12} className="mr-1" />
                  Save for later
                </button>
                
                <button
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="flex items-center text-xs text-text-secondary hover:text-error marketplace-transition disabled:opacity-50"
                >
                  <Icon name="Trash2" size={12} className="mr-1" />
                  {isRemoving ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning */}
      {item.stock <= 5 && item.stock > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
            <div className="flex items-center">
              <Icon name="AlertTriangle" size={16} className="text-warning mr-2" />
              <span className="text-sm text-warning font-medium">
                Hurry! Only {item.stock} left in stock
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItem;