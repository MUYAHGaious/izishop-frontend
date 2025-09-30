import React, { createContext, useContext, useState, useEffect } from 'react';
import { showToast } from '../components/ui/Toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.error('useCart must be used within a CartProvider. Current component tree:', 
      new Error().stack);
    throw new Error('useCart must be used within a CartProvider');
  }
  

  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);



  // Helper function to schedule toasts for next tick to avoid render phase issues
  const scheduleToast = (options) => {
    setTimeout(() => {
      showToast(options);
    }, 0);
  };

  // Initialize cart from localStorage
  useEffect(() => {
    try {
      const savedCartItems = localStorage.getItem('cartItems');
      const savedForLaterItems = localStorage.getItem('savedForLaterItems');
      
      if (savedCartItems) {
        const parsedCartItems = JSON.parse(savedCartItems);
        setCartItems(Array.isArray(parsedCartItems) ? parsedCartItems : []);
      }
      
      if (savedForLaterItems) {
        const parsedSavedItems = JSON.parse(savedForLaterItems);
        setSavedItems(Array.isArray(parsedSavedItems) ? parsedSavedItems : []);
      }
      
      // Mark as initialized
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('cartItems');
      localStorage.removeItem('savedForLaterItems');
      // Still mark as initialized even if there's an error
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Update cart item count
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem('cartItemCount', totalItems.toString());
    
    // Dispatch cart update event for components that need to listen
    // Use setTimeout to avoid potential render phase issues
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { 
          itemCount: totalItems,
          cartItems: cartItems
        }
      }));
    }, 0);
  }, [cartItems]);

  // Save saved items to localStorage
  useEffect(() => {
    localStorage.setItem('savedForLaterItems', JSON.stringify(savedItems));
  }, [savedItems]);

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    setIsLoading(true);
    try {
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.productId === product.id);
        
        if (existingItem) {
          // If item exists, increase quantity
          const newQuantity = existingItem.quantity + quantity;
          const maxStock = product.stock || product.maxStock || 999;
          
          if (newQuantity > maxStock) {
            scheduleToast({
              type: 'warning',
              message: `Cannot add more items. Maximum stock is ${maxStock}`,
              duration: 3000
            });
            return prevItems;
          }
          
          scheduleToast({
            type: 'success',
            message: `Updated ${product.name} quantity to ${newQuantity}`,
            duration: 2000
          });
          
          return prevItems.map(item =>
            item.productId === product.id
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          // Add new item to cart
          const cartItem = {
            id: Date.now(), // Unique cart item ID
            productId: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            quantity: quantity,
            maxStock: product.stock || product.maxStock || 999,
            stock: product.stock || 999,
            image: product.image,
            shopId: product.shopId,
            shopName: product.shopName,
            variant: product.variant || null,
            deliveryEstimate: product.deliveryEstimate || '2-3 days',
            freeDelivery: product.freeDelivery || false
          };
          
          scheduleToast({
            type: 'success',
            message: `${product.name} added to cart`,
            duration: 2000
          });
          
          return [...prevItems, cartItem];
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      scheduleToast({
        type: 'error',
        message: 'Failed to add item to cart',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item.id === itemId);
      if (item) {
        scheduleToast({
          type: 'info',
          message: `${item.name} removed from cart`,
          duration: 2000
        });
      }
      return prevItems.filter(item => item.id !== itemId);
    });
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const maxStock = item.maxStock || 999;
          if (newQuantity > maxStock) {
            scheduleToast({
              type: 'warning',
              message: `Maximum stock is ${maxStock}`,
              duration: 3000
            });
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    scheduleToast({
      type: 'info',
      message: 'Cart cleared',
      duration: 2000
    });
  };

  // Save item for later
  const saveForLater = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      const savedItem = {
        ...item,
        savedDate: new Date().toISOString()
      };
      
      setSavedItems(prevItems => [...prevItems, savedItem]);
      removeFromCart(itemId);
      
      scheduleToast({
        type: 'info',
        message: `${item.name} saved for later`,
        duration: 2000
      });
    }
  };

  // Move item back to cart from saved
  const moveToCart = (savedItemId) => {
    const savedItem = savedItems.find(item => item.id === savedItemId);
    if (savedItem) {
      // Remove from saved items
      setSavedItems(prevItems => prevItems.filter(item => item.id !== savedItemId));
      
      // Add to cart
      const { savedDate, ...cartItem } = savedItem;
      setCartItems(prevItems => [...prevItems, cartItem]);
      
      scheduleToast({
        type: 'success',
        message: `${savedItem.name} moved to cart`,
        duration: 2000
      });
    }
  };

  // Remove from saved items
  const removeFromSaved = (savedItemId) => {
    const item = savedItems.find(item => item.id === savedItemId);
    if (item) {
      setSavedItems(prevItems => prevItems.filter(item => item.id !== savedItemId));
      scheduleToast({
        type: 'info',
        message: `${item.name} removed from saved items`,
        duration: 2000
      });
    }
  };

  // Get cart totals
  const getCartTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      subtotal,
      itemCount,
      items: cartItems
    };
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.productId === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  // Group cart items by vendor/shop
  const groupItemsByVendor = () => {
    const vendorGroups = {};
    
    cartItems.forEach(item => {
      const vendorId = item.shopId || 'unknown';
      const vendorName = item.shopName || 'Unknown Shop';
      
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          vendorId,
          vendorName,
          items: [],
          subtotal: 0,
          itemCount: 0,
          shippingOptions: [],
          estimatedDelivery: item.deliveryEstimate || '2-3 days',
          freeDelivery: item.freeDelivery || false
        };
      }
      
      vendorGroups[vendorId].items.push(item);
      vendorGroups[vendorId].subtotal += item.price * item.quantity;
      vendorGroups[vendorId].itemCount += item.quantity;
    });
    
    return Object.values(vendorGroups);
  };

  // Check if cart has items from multiple vendors
  const hasMultipleVendors = () => {
    const uniqueVendors = new Set(cartItems.map(item => item.shopId));
    return uniqueVendors.size > 1;
  };

  // Get shipping options for vendor
  const getVendorShippingOptions = (vendorId) => {
    const vendorItems = cartItems.filter(item => item.shopId === vendorId);
    if (vendorItems.length === 0) return [];
    
    // Default shipping options (can be enhanced with real vendor data)
    const baseOptions = [
      {
        id: 'standard',
        name: 'Standard Delivery',
        price: 2500,
        estimatedDays: '2-3 days',
        description: 'Regular delivery service'
      },
      {
        id: 'express',
        name: 'Express Delivery',
        price: 5000,
        estimatedDays: '1-2 days',
        description: 'Faster delivery service'
      },
      {
        id: 'same-day',
        name: 'Same Day Delivery',
        price: 8000,
        estimatedDays: 'Same day',
        description: 'Same day delivery (if available)'
      }
    ];
    
    // Check if vendor offers free delivery
    const hasFreeDelivery = vendorItems.some(item => item.freeDelivery);
    
    if (hasFreeDelivery) {
      return [
        {
          id: 'free',
          name: 'Free Delivery',
          price: 0,
          estimatedDays: '2-3 days',
          description: 'Free delivery on this order'
        },
        ...baseOptions
      ];
    }
    
    return baseOptions;
  };

  const value = {
    // State
    cartItems,
    savedItems,
    isLoading,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    saveForLater,
    moveToCart,
    removeFromSaved,
    
    // Utilities
    getCartTotals,
    isInCart,
    getItemQuantity,
    
    // Multi-vendor functionality
    groupItemsByVendor,
    hasMultipleVendors,
    getVendorShippingOptions
  };

  // Don't render children until initialized to prevent context errors
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Initializing cart...</p>
        </div>
      </div>
    );
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;