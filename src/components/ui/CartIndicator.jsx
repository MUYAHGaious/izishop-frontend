import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Image from '../AppImage';

const CartIndicator = ({ 
  cartItems = [], 
  onUpdateCart, 
  showPreview = true,
  className = "" 
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [mockCartItems, setMockCartItems] = useState([]);

  // Mock cart data
  const mockItems = [
    {
      id: 1,
      name: 'iPhone 14 Pro',
      price: 999.99,
      quantity: 1,
      image: '/assets/images/products/iphone-14-pro.jpg',
      shop: 'TechHub Store',
      variant: '128GB, Space Black'
    },
    {
      id: 2,
      name: 'Samsung Galaxy Buds Pro',
      price: 199.99,
      quantity: 2,
      image: '/assets/images/products/galaxy-buds.jpg',
      shop: 'Audio World',
      variant: 'Phantom Black'
    },
    {
      id: 3,
      name: 'MacBook Air M2',
      price: 1299.99,
      quantity: 1,
      image: '/assets/images/products/macbook-air.jpg',
      shop: 'Apple Store',
      variant: '13-inch, 256GB'
    }
  ];

  useEffect(() => {
    // Use provided cart items or mock data
    const items = cartItems.length > 0 ? cartItems : mockItems;
    setMockCartItems(items);
    
    // Calculate totals
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setCartItemCount(count);
    setCartTotal(total);

    // Save to localStorage
    localStorage.setItem('cartItemCount', count.toString());
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [cartItems]);

  const handlePreviewToggle = () => {
    if (showPreview && cartItemCount > 0) {
      setIsPreviewOpen(!isPreviewOpen);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    const updatedItems = mockCartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setMockCartItems(updatedItems);
    if (onUpdateCart) {
      onUpdateCart(updatedItems);
    }
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = mockCartItems.filter(item => item.id !== itemId);
    setMockCartItems(updatedItems);
    if (onUpdateCart) {
      onUpdateCart(updatedItems);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center marketplace-spring">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </button>

      {/* Cart Preview Dropdown */}
      {isPreviewOpen && showPreview && cartItemCount > 0 && (
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
                  Shopping Cart ({cartItemCount} items)
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
              {mockCartItems.map((item) => (
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
                        {item.shop}
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
                  {formatPrice(cartTotal)}
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
      {isPreviewOpen && showPreview && cartItemCount === 0 && (
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