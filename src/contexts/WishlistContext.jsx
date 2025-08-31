import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('izishop_wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        // Ensure the parsed data is an array
        if (Array.isArray(parsedWishlist)) {
          setWishlistItems(parsedWishlist);
        } else {
          console.warn('Saved wishlist is not an array, resetting to empty array');
          setWishlistItems([]);
          localStorage.removeItem('izishop_wishlist');
        }
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
        setWishlistItems([]);
        localStorage.removeItem('izishop_wishlist');
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (Array.isArray(wishlistItems)) {
      localStorage.setItem('izishop_wishlist', JSON.stringify(wishlistItems));
    } else {
      console.warn('Attempting to save invalid wishlist data to localStorage', wishlistItems);
    }
  }, [wishlistItems]);

  // Add product to wishlist
  const addToWishlist = async (product) => {
    try {
      setIsLoading(true);
      
      // Safety check for product
      if (!product || !product.id) {
        console.warn('addToWishlist: Invalid product data received', product);
        return { success: false, message: 'Invalid product data' };
      }
      
      // Check if product is already in wishlist
      const existingItem = wishlistItems.find(item => item.id === product.id);
      if (existingItem) {
        console.log('Product already in wishlist');
        return { success: false, message: 'Product already in wishlist' };
      }

      // Add product to wishlist with timestamp
      const wishlistItem = {
        ...product,
        addedAt: new Date().toISOString(),
        isWishlisted: true
      };

      setWishlistItems(prev => [...prev, wishlistItem]);

      // Here you would typically make an API call to save to backend
      // await api.addToWishlist(product.id);

      return { success: true, message: 'Added to wishlist' };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: 'Failed to add to wishlist' };
    } finally {
      setIsLoading(false);
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      setIsLoading(true);
      
      setWishlistItems(prev => prev.filter(item => item.id !== productId));

      // Here you would typically make an API call to remove from backend
      // await api.removeFromWishlist(productId);

      return { success: true, message: 'Removed from wishlist' };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, message: 'Failed to remove from wishlist' };
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle wishlist status
  const toggleWishlist = async (product) => {
    // Safety check for product
    if (!product || !product.id) {
      console.warn('toggleWishlist: Invalid product data received', product);
      return { success: false, message: 'Invalid product data' };
    }
    
    const existingItem = wishlistItems.find(item => item.id === product.id);
    
    if (existingItem) {
      return await removeFromWishlist(product.id);
    } else {
      return await addToWishlist(product);
    }
  };

  // Check if a product is in wishlist
  const isInWishlist = (productId) => {
    if (!productId) {
      console.warn('isInWishlist: Invalid product ID received', productId);
      return false;
    }
    return wishlistItems.some(item => item.id === productId);
  };

  // Get wishlist count
  const getWishlistCount = () => {
    if (!Array.isArray(wishlistItems)) {
      console.warn('getWishlistCount: wishlistItems is not an array', wishlistItems);
      return 0;
    }
    return wishlistItems.length;
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    try {
      setIsLoading(true);
      
      setWishlistItems([]);

      // Here you would typically make an API call to clear backend wishlist
      // await api.clearWishlist();

      return { success: true, message: 'Wishlist cleared' };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { success: false, message: 'Failed to clear wishlist' };
    } finally {
      setIsLoading(false);
    }
  };

  // Move wishlist item to cart (if you have cart functionality)
  const moveToCart = async (productId) => {
    try {
      // Here you would implement the logic to move item to cart
      // await api.moveToCart(productId);
      
      // Remove from wishlist after moving to cart
      await removeFromWishlist(productId);
      
      return { success: true, message: 'Moved to cart' };
    } catch (error) {
      console.error('Error moving to cart:', error);
      return { success: false, message: 'Failed to move to cart' };
    }
  };

  const value = {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
    moveToCart
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
