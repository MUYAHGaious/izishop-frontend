import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Icon from '../AppIcon';
import Button from './Button';
import Image from '../AppImage';

const CartIndicator = ({ 
  showPreview = true,
  className = "" 
}) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotals } = useCart();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { subtotal, itemCount } = getCartTotals();

  const handlePreviewToggle = () => {
    if (showPreview && itemCount > 0) {
      setIsPreviewOpen(!isPreviewOpen);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XAF', 'XAF');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Cart Button */}
      <button
        onClick={handlePreviewToggle}
        className="relative p-2 rounded-md text-text-secondary hover:text-primary hover:bg-muted marketplace-transition"
      >
        <Icon name="ShoppingCart" size={20} />
        
        {/* Item Count Badge */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center marketplace-spring">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Cart Preview Dropdown */}
      {isPreviewOpen && showPreview && itemCount > 0 && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-1000"
            onClick={() => setIsPreviewOpen(false)}
          />
          
          {/* Preview Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-md shadow-modal z-1010 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Shopping Cart ({itemCount} items)
                </h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1 rounded-md text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="max-h-64 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="px-4 py-3 border-b border-border last:border-b-0">
                  <div className="flex items-start space-x-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-text-secondary truncate">
                        {item.shopName}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-text-secondary truncate">
                          {item.variant}
                        </p>
                      )}
                      
                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-primary font-mono">
                          {formatPrice(item.price)}
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 rounded-md text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
                          >
                            <Icon name="Minus" size={12} />
                          </button>
                          <span className="text-xs font-medium text-foreground min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 rounded-md text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
                          >
                            <Icon name="Plus" size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 rounded-md text-text-secondary hover:text-error hover:bg-error/10 marketplace-transition"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Total:</span>
                <span className="text-lg font-bold text-primary font-mono">
                  {formatPrice(subtotal)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Link to="/shopping-cart" onClick={() => setIsPreviewOpen(false)}>
                  <Button variant="outline" size="sm" fullWidth>
                    View Cart
                  </Button>
                </Link>
                <Link to="/checkout" onClick={() => setIsPreviewOpen(false)}>
                  <Button variant="default" size="sm" fullWidth>
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty Cart State */}
      {isPreviewOpen && showPreview && itemCount === 0 && (
        <>
          <div 
            className="fixed inset-0 z-1000"
            onClick={() => setIsPreviewOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-md shadow-modal z-1010">
            <div className="px-4 py-8 text-center">
              <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 text-text-secondary" />
              <h3 className="text-sm font-medium text-foreground mb-2">Your cart is empty</h3>
              <p className="text-xs text-text-secondary mb-4">
                Add some products to get started
              </p>
              <Link to="/product-catalog" onClick={() => setIsPreviewOpen(false)}>
                <Button variant="default" size="sm">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartIndicator;