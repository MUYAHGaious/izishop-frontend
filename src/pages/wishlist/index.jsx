import React, { useState, useEffect } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { ProductList } from '../../components/ProductDisplay';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { showToast } from '../../components/ui/Toast';

const Wishlist = () => {
  const { 
    wishlistItems, 
    isLoading, 
    clearWishlist, 
    moveToCart,
    removeFromWishlist
  } = useWishlist();
  
  const { addToCart } = useCart();
  const [isClearing, setIsClearing] = useState(false);
  const [sortBy, setSortBy] = useState('addedAt');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedItems, setSelectedItems] = useState([]);

  // Update wishlist count in header
  useEffect(() => {
    const count = wishlistItems.length;
    localStorage.setItem('wishlistCount', count.toString());
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { count } }));
  }, [wishlistItems]);

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      setIsClearing(true);
      try {
        const result = await clearWishlist();
        if (result.success) {
          showToast('Wishlist cleared successfully', 'success');
        }
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        showToast('Failed to clear wishlist', 'error');
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      const result = await moveToCart(productId);
      if (result.success) {
        showToast('Moved to cart successfully', 'success');
      }
    } catch (error) {
      console.error('Error moving to cart:', error);
      showToast('Failed to move to cart', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      showToast('Added to cart successfully', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const result = await removeFromWishlist(productId);
      if (result.success) {
        showToast('Removed from wishlist', 'success');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleBulkAddToCart = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      for (const productId of selectedItems) {
        const product = wishlistItems.find(item => item.id === productId);
        if (product) {
          await addToCart(product);
        }
      }
      showToast(`Added ${selectedItems.length} items to cart`, 'success');
      setSelectedItems([]);
    } catch (error) {
      console.error('Error bulk adding to cart:', error);
      showToast('Failed to add some items to cart', 'error');
    }
  };

  const handleBulkRemove = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Remove ${selectedItems.length} items from wishlist?`)) {
      try {
        for (const productId of selectedItems) {
          await removeFromWishlist(productId);
        }
        showToast(`Removed ${selectedItems.length} items from wishlist`, 'success');
        setSelectedItems([]);
      } catch (error) {
        console.error('Error bulk removing:', error);
        showToast('Failed to remove some items', 'error');
      }
    }
  };

  // Sort and filter items
  const sortedAndFilteredItems = React.useMemo(() => {
    let items = [...wishlistItems];

    // Filter
    if (filterBy !== 'all') {
      items = items.filter(item => {
        switch (filterBy) {
          case 'inStock':
            return item.stock > 0;
          case 'outOfStock':
            return item.stock === 0;
          case 'onSale':
            return item.originalPrice && item.originalPrice > item.price;
          default:
            return true;
        }
      });
    }

    // Sort
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'addedAt':
        default:
          return new Date(b.addedAt) - new Date(a.addedAt);
      }
    });

    return items;
  }, [wishlistItems, sortBy, filterBy]);

  const filteredItems = sortedAndFilteredItems;

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
            <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Icon name="Heart" size={20} className="text-white" />
              </div>
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
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {isClearing ? 'Clearing...' : 'Clear All'}
              </Button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Heart" size={48} className="text-teal-600" />
            </div>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Start building your wishlist by browsing our products and clicking the heart icon on items you love.
            </p>
            <a 
              href="/product-catalog"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Icon name="ShoppingBag" size={16} className="mr-2" />
              Browse Products
            </a>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length > 0 && (
          <div className="space-y-6">
            {/* Enhanced Sort and Filter Options */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="addedAt">Recently Added</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="price">Price (Low to High)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                    <select 
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">All Items</option>
                      <option value="inStock">In Stock</option>
                      <option value="outOfStock">Out of Stock</option>
                      <option value="onSale">On Sale</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing: {filteredItems.length} of {wishlistItems.length} items
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-teal-100 text-teal-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Icon name="Grid" size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-teal-100 text-teal-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Icon name="List" size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                      </span>
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkAddToCart}
                        iconName="ShoppingCart"
                        iconPosition="left"
                        className="border-teal-200 text-teal-600 hover:bg-teal-50"
                      >
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkRemove}
                        iconName="Trash2"
                        iconPosition="left"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Products List */}
            {filteredItems && filteredItems.length > 0 ? (
              <ProductList
                products={filteredItems}
                variant={viewMode === 'list' ? 'horizontal' : 'default'}
                showRating={true}
                showStock={true}
                showShopInfo={true}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleRemoveFromWishlist}
                showWishlist={false} // Hide wishlist button since we're already in wishlist
                className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Search" size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items match your filters</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filter or sort options</p>
                <button
                  onClick={() => {
                    setFilterBy('all');
                    setSortBy('addedAt');
                  }}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Actions Footer */}
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="text-center">
                  <p className="text-gray-700 font-medium mb-2">
                    Love something in your wishlist? Add it to your cart to purchase!
                  </p>
                  <p className="text-sm text-gray-600">
                    Total estimated value: {filteredItems.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString()} XAF
                  </p>
                </div>
                <div className="flex gap-3">
                  <a 
                    href="/product-catalog"
                    className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Icon name="ShoppingBag" size={16} className="mr-2" />
                    Continue Shopping
                  </a>
                  <a 
                    href="/shopping-cart"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    View Cart
                  </a>
                </div>
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