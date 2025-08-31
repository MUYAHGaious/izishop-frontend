import React, { useState } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { ProductList } from '../../components/ProductDisplay';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const Wishlist = () => {
  const { 
    wishlistItems, 
    isLoading, 
    clearWishlist, 
    moveToCart 
  } = useWishlist();
  
  const { addToCart } = useCart();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      setIsClearing(true);
      try {
        const result = await clearWishlist();
        if (result.success) {
          console.log('Wishlist cleared successfully');
        }
      } catch (error) {
        console.error('Error clearing wishlist:', error);
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      const result = await moveToCart(productId);
      if (result.success) {
        console.log('Moved to cart successfully');
      }
    } catch (error) {
      console.error('Error moving to cart:', error);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      console.log('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading wishlist...</p>
          </div>
        </div>
        <MobileBottomTab />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              My Wishlist
            </h1>
            <p className="text-text-secondary">
              {wishlistItems.length === 0 
                ? 'No items in your wishlist yet' 
                : `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} in your wishlist`
              }
            </p>
          </div>
          
          {wishlistItems.length > 0 && (
            <div className="flex gap-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                disabled={isClearing}
                iconName="Trash2"
                iconPosition="left"
              >
                {isClearing ? 'Clearing...' : 'Clear All'}
              </Button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Heart" size={48} className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Start building your wishlist by browsing our products and clicking the heart icon on items you love.
            </p>
            <a 
              href="/product-catalog"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </a>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length > 0 && (
          <div className="space-y-6">
            {/* Sort and Filter Options */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-secondary">
                  Sort by:
                </span>
                <select className="text-sm border rounded px-3 py-1 bg-background">
                  <option value="addedAt">Recently Added</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                </select>
              </div>
              
              <div className="text-sm text-text-secondary">
                Total: {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Products List */}
            {wishlistItems && wishlistItems.length > 0 && (
              <ProductList
                products={wishlistItems}
                variant="horizontal"
                showRating={true}
                showStock={true}
                showShopInfo={true}
                onAddToCart={handleAddToCart}
                onToggleWishlist={() => {}} // No need for this in wishlist view
              />
            )}

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center p-6 bg-card rounded-lg border">
              <p className="text-text-secondary text-center">
                Love something in your wishlist? Add it to your cart to purchase!
              </p>
              <div className="flex gap-3">
                <a 
                  href="/product-catalog"
                  className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </a>
                <a 
                  href="/shopping-cart"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Cart
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <MobileBottomTab />
    </div>
  );
};

export default Wishlist;