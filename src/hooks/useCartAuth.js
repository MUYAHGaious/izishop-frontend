import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for handling cart operations that require authentication
 * Provides seamless authentication flow for cart actions
 */
export const useCartAuth = () => {
  const { isAuthenticated, setAuthReturnUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handle adding item to cart with authentication flow
   * @param {Object} product - Product to add to cart
   * @param {number} quantity - Quantity to add
   * @param {Object} options - Additional options (size, color, etc.)
   * @param {Function} onSuccess - Callback for successful add
   */
  const handleAddToCart = useCallback(async (product, quantity = 1, options = {}, onSuccess) => {
    if (!isAuthenticated()) {
      // Store the intent to add to cart after authentication
      const cartState = {
        action: 'addToCart',
        product,
        quantity,
        options,
        timestamp: Date.now()
      };

      // Set return URL with cart state
      setAuthReturnUrl(location.pathname + location.search, cartState);

      // Navigate to authentication
      navigate('/authentication-login-register');
      return;
    }

    // User is authenticated, proceed with add to cart
    if (onSuccess) {
      await onSuccess(product, quantity, options);
    }
  }, [isAuthenticated, setAuthReturnUrl, location, navigate]);

  /**
   * Handle checkout process with authentication flow
   * @param {Array} cartItems - Items in cart
   * @param {Function} onSuccess - Callback for successful checkout initiation
   */
  const handleCheckout = useCallback(async (cartItems, onSuccess) => {
    if (!isAuthenticated()) {
      // Store the intent to checkout after authentication
      const cartState = {
        action: 'checkout',
        cartItems,
        timestamp: Date.now()
      };

      // Set return URL with cart state
      setAuthReturnUrl('/checkout', cartState);

      // Navigate to authentication
      navigate('/authentication-login-register');
      return;
    }

    // User is authenticated, proceed with checkout
    if (onSuccess) {
      await onSuccess(cartItems);
    }
  }, [isAuthenticated, setAuthReturnUrl, navigate]);

  /**
   * Handle wishlist operations with authentication flow
   * @param {Object} product - Product to add/remove from wishlist
   * @param {string} action - 'add' or 'remove'
   * @param {Function} onSuccess - Callback for successful operation
   */
  const handleWishlistAction = useCallback(async (product, action = 'add', onSuccess) => {
    if (!isAuthenticated()) {
      // Store the intent to modify wishlist after authentication
      const cartState = {
        action: 'wishlist',
        product,
        wishlistAction: action,
        timestamp: Date.now()
      };

      // Set return URL with cart state
      setAuthReturnUrl(location.pathname + location.search, cartState);

      // Navigate to authentication
      navigate('/authentication-login-register');
      return;
    }

    // User is authenticated, proceed with wishlist action
    if (onSuccess) {
      await onSuccess(product, action);
    }
  }, [isAuthenticated, setAuthReturnUrl, location, navigate]);

  /**
   * Restore pending cart actions after authentication
   * This should be called on pages that can handle cart actions
   * @param {Object} pendingCartState - The cart state from auth context
   * @param {Object} handlers - Object containing handler functions
   */
  const restorePendingCartActions = useCallback(async (pendingCartState, handlers = {}) => {
    if (!pendingCartState || !isAuthenticated()) {
      return;
    }

    const { action, product, quantity, options, cartItems, wishlistAction } = pendingCartState;

    try {
      switch (action) {
        case 'addToCart':
          if (handlers.onAddToCart && product) {
            await handlers.onAddToCart(product, quantity || 1, options || {});
          }
          break;

        case 'checkout':
          if (handlers.onCheckout && cartItems) {
            await handlers.onCheckout(cartItems);
          }
          break;

        case 'wishlist':
          if (handlers.onWishlistAction && product) {
            await handlers.onWishlistAction(product, wishlistAction || 'add');
          }
          break;

        default:
          console.log('Unknown cart action:', action);
      }
    } catch (error) {
      console.error('Error restoring cart action:', error);
    }
  }, [isAuthenticated]);

  return {
    handleAddToCart,
    handleCheckout,
    handleWishlistAction,
    restorePendingCartActions,
    isAuthenticated: isAuthenticated()
  };
};

export default useCartAuth;