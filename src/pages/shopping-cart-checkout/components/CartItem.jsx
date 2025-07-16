import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    onUpdateQuantity(item.id, newQuantity);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XAF', 'FCFA');
  };

  return (
    <div className="flex items-start space-x-4 p-4 bg-card rounded-lg border border-border">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted">
        <Image
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-text-primary truncate">
              {item.name}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              {item.shop}
            </p>
            {item.variant && (
              <p className="text-xs text-text-secondary mt-1">
                {item.variant}
              </p>
            )}
          </div>
          
          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id)}
            className="text-text-secondary hover:text-destructive ml-2"
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-3">
            {/* Quantity Controls */}
            <div className="flex items-center border border-border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="h-8 w-8 rounded-none"
              >
                <Icon name="Minus" size={14} />
              </Button>
              <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="h-8 w-8 rounded-none"
              >
                <Icon name="Plus" size={14} />
              </Button>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-sm font-semibold text-text-primary">
              {formatPrice(item.price * item.quantity)}
            </div>
            {item.quantity > 1 && (
              <div className="text-xs text-text-secondary">
                {formatPrice(item.price)} each
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;