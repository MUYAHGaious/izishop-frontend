import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../../components/layouts/AppLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Load wishlist from localStorage or API
    const loadWishlist = () => {
      try {
        const saved = localStorage.getItem(`wishlist_${user?.id}`);
        setWishlistItems(saved ? JSON.parse(saved) : []);
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const removeFromWishlist = (productId) => {
    const updated = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updated);
    localStorage.setItem(`wishlist_${user?.id}`, JSON.stringify(updated));
  };

  const moveToCart = (item) => {
    // Add to cart logic here
    console.log('Moving to cart:', item);
    removeFromWishlist(item.id);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>My Wishlist - IziShopin</title>
        <meta name="description" content="View and manage your saved products" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {/* Empty State */}
          {wishlistItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Icon name="Heart" size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">
                Save products you love to buy them later
              </p>
              <Button
                variant="default"
                onClick={() => window.location.href = '/product-catalog'}
                className="inline-flex items-center"
              >
                <Icon name="Search" size={16} className="mr-2" />
                Browse Products
              </Button>
            </div>
          ) : (
            /* Wishlist Items */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <Icon name="Package" size={48} className="text-gray-400" />
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {item.name || 'Product Name'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.shop_name || 'Shop Name'}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary">
                        XAF {item.price?.toLocaleString() || '0'}
                      </span>
                      {item.original_price && item.original_price > item.price && (
                        <span className="text-sm text-gray-400 line-through">
                          XAF {item.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => moveToCart(item)}
                        className="flex-1"
                      >
                        <Icon name="ShoppingCart" size={14} className="mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2"
                      >
                        <Icon name="Trash2" size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Wishlist;