import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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

  // Load wishlist from backend and localStorage on component mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        // Try to load from backend first
        const backendWishlist = await api.getCustomerWishlist();
        console.log('🔄 Loaded wishlist from backend:', backendWishlist.length, 'items');

        if (Array.isArray(backendWishlist)) {
          // Convert backend format to frontend format
          const formattedItems = backendWishlist.map(item => ({
            id: item.product?.id || item.product_id,
            name: item.product?.name || 'Unknown Product',
            price: item.product?.price || 0,
            image_urls: item.product?.image_urls || [],
            image: item.product?.image_urls?.[0] || '/assets/images/no_image.png',
            stock: item.product?.stock_quantity || 0,
            stock_quantity: item.product?.stock_quantity || 0,
            category: item.product?.category || '',
            is_active: item.product?.is_active !== false,
            addedAt: item.added_at,
            isWishlisted: true,
            priority: item.priority || 'normal',
            notes: item.notes || null
          })).filter(item => item.is_active); // Only include active products

          setWishlistItems(formattedItems);
          return;
        }
      } catch (error) {
        console.warn('Failed to load wishlist from backend, falling back to localStorage:', error);
      }

      // Fallback to localStorage
      const savedWishlist = localStorage.getItem('izishop_wishlist');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          // Ensure the parsed data is an array
          if (Array.isArray(parsedWishlist)) {
            setWishlistItems(parsedWishlist);
            console.log('🔄 Loaded wishlist from localStorage:', parsedWishlist.length, 'items');
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
    };

    loadWishlist();
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (Array.isArray(wishlistItems)) {
      localStorage.setItem('izishop_wishlist', JSON.stringify(wishlistItems));
    } else {
      console.warn('Attempting to save invalid wishlist data to localStorage', wishlistItems);
    }
  }, [wishlistItems]);

  // Add product to wishlist using batch system
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

      // Use batch system to add to wishlist
      const result = await api.batchAddToWishlist([product.id]);

      if (result.successful > 0) {
        // Add product to local state with timestamp
        const wishlistItem = {
          ...product,
          addedAt: new Date().toISOString(),
          isWishlisted: true
        };

        setWishlistItems(prev => [...prev, wishlistItem]);
        console.log('✅ Product added to wishlist via batch system:', product.name);
        return { success: true, message: 'Added to wishlist' };
      } else {
        console.error('❌ Batch add to wishlist failed:', result.errors);
        return { success: false, message: result.errors?.[0] || 'Failed to add to wishlist' };
      }

    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Fallback to local storage only
      const wishlistItem = {
        ...product,
        addedAt: new Date().toISOString(),
        isWishlisted: true
      };
      setWishlistItems(prev => [...prev, wishlistItem]);
      return { success: true, message: 'Added to wishlist (offline mode)' };
    } finally {
      setIsLoading(false);
    }
  };

  // Remove product from wishlist using batch system
  const removeFromWishlist = async (productId) => {
    try {
      setIsLoading(true);

      // Use batch system to remove from wishlist
      const result = await api.batchRemoveFromWishlist([productId]);

      if (result.successful > 0) {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
        console.log('✅ Product removed from wishlist via batch system:', productId);
        return { success: true, message: 'Removed from wishlist' };
      } else {
        console.error('❌ Batch remove from wishlist failed:', result.errors);
        return { success: false, message: result.errors?.[0] || 'Failed to remove from wishlist' };
      }

    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Fallback to local storage only
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      return { success: true, message: 'Removed from wishlist (offline mode)' };
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle wishlist status using batch system
  const toggleWishlist = async (product) => {
    try {
      setIsLoading(true);

      // Safety check for product
      if (!product || !product.id) {
        console.warn('toggleWishlist: Invalid product data received', product);
        return { success: false, message: 'Invalid product data' };
      }

      const existingItem = wishlistItems.find(item => item.id === product.id);

      // Use batch toggle operation (more efficient than separate add/remove)
      const result = await api.batchToggleWishlist([product.id]);

      if (result.successful > 0) {
        if (existingItem) {
          // Was in wishlist, now removed
          setWishlistItems(prev => prev.filter(item => item.id !== product.id));
          console.log('✅ Product removed from wishlist via batch toggle:', product.name);
          return { success: true, message: 'Removed from wishlist' };
        } else {
          // Was not in wishlist, now added
          const wishlistItem = {
            ...product,
            addedAt: new Date().toISOString(),
            isWishlisted: true
          };
          setWishlistItems(prev => [...prev, wishlistItem]);
          console.log('✅ Product added to wishlist via batch toggle:', product.name);
          return { success: true, message: 'Added to wishlist' };
        }
      } else {
        console.error('❌ Batch toggle wishlist failed:', result.errors);
        return { success: false, message: result.errors?.[0] || 'Failed to toggle wishlist' };
      }

    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Fallback to local operation
      const existingItem = wishlistItems.find(item => item.id === product.id);
      if (existingItem) {
        setWishlistItems(prev => prev.filter(item => item.id !== product.id));
        return { success: true, message: 'Removed from wishlist (offline mode)' };
      } else {
        const wishlistItem = {
          ...product,
          addedAt: new Date().toISOString(),
          isWishlisted: true
        };
        setWishlistItems(prev => [...prev, wishlistItem]);
        return { success: true, message: 'Added to wishlist (offline mode)' };
      }
    } finally {
      setIsLoading(false);
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

  // Clear entire wishlist using batch system
  const clearWishlist = async () => {
    try {
      setIsLoading(true);

      // Use batch system to clear wishlist
      const result = await api.batchClearWishlist();

      if (result.successful > 0 || result.total_items === 0) {
        setWishlistItems([]);
        console.log('✅ Wishlist cleared via batch system');
        return { success: true, message: 'Wishlist cleared' };
      } else {
        console.error('❌ Batch clear wishlist failed:', result.errors);
        return { success: false, message: result.errors?.[0] || 'Failed to clear wishlist' };
      }

    } catch (error) {
      console.error('Error clearing wishlist:', error);
      // Fallback to local storage only
      setWishlistItems([]);
      return { success: true, message: 'Wishlist cleared (offline mode)' };
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

  // Sync wishlist with backend using batch system
  const syncWishlist = async () => {
    try {
      setIsLoading(true);

      // Sync current wishlist items with backend
      const result = await api.batchSyncWishlist(wishlistItems);

      if (result.successful > 0 || result.total_items === 0) {
        console.log('✅ Wishlist synced with backend:', result);
        return { success: true, message: 'Wishlist synced successfully', result };
      } else {
        console.error('❌ Wishlist sync failed:', result.errors);
        return { success: false, message: result.errors?.[0] || 'Failed to sync wishlist' };
      }

    } catch (error) {
      console.error('Error syncing wishlist:', error);
      return { success: false, message: 'Failed to sync wishlist' };
    } finally {
      setIsLoading(false);
    }
  };

  // Batch operations for multiple items
  const batchAddToWishlist = async (products) => {
    try {
      setIsLoading(true);

      const productIds = products.map(p => p.id);
      const result = await api.batchAddToWishlist(productIds);

      if (result.successful > 0) {
        // Add successful products to local state
        const successfulProducts = products.slice(0, result.successful);
        const newWishlistItems = successfulProducts.map(product => ({
          ...product,
          addedAt: new Date().toISOString(),
          isWishlisted: true
        }));

        setWishlistItems(prev => [...prev, ...newWishlistItems]);
        console.log(`✅ ${result.successful} products added to wishlist via batch system`);

        return {
          success: true,
          message: `Added ${result.successful} products to wishlist`,
          successful: result.successful,
          failed: result.failed
        };
      } else {
        console.error('❌ Batch add to wishlist failed:', result.errors);
        return { success: false, message: result.errors?.[0] || 'Failed to add products to wishlist' };
      }

    } catch (error) {
      console.error('Error batch adding to wishlist:', error);
      return { success: false, message: 'Failed to add products to wishlist' };
    } finally {
      setIsLoading(false);
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
    moveToCart,
    syncWishlist,
    batchAddToWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
