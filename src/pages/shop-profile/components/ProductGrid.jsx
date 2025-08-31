import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import useCartAuth from '../../../hooks/useCartAuth';
import { showToast } from '../../../components/ui/Toast';

const ProductGrid = ({ products, shopId }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const { handleAddToCart, handleAddToWishlist } = useCartAuth();

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Books' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const onAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    await handleAddToCart(product, 1, {}, async () => {
      // Success callback - this runs if user is authenticated
      console.log('Product added to cart:', product);
      showToast(`${product.name} added to cart!`, 'success');
    });
  };

  const onAddToWishlist = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    await handleAddToWishlist(product, async () => {
      // Success callback
      console.log('Product added to wishlist:', product);
      showToast(`${product.name} added to wishlist!`, 'success');
    });
  };

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    return filtered;
  }, [products, filterCategory, sortBy]);

  return (
    <div className="space-y-8">
      {/* Modern Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Sort Products</label>
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Category</label>
            <Select
              options={categoryOptions}
              value={filterCategory}
              onChange={setFilterCategory}
              className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl"
            />
          </div>
          <div className="flex items-end">
            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold">
              {filteredAndSortedProducts.length} Products
            </div>
          </div>
        </div>
      </div>

      {/* More Products Section Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">More Products</h2>
            <p className="text-slate-600">Discover our complete collection</p>
          </div>
          <div className="text-sm text-slate-500">
            {filteredAndSortedProducts.length} products
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map((product, index) => (
          <Link
            key={product.id}
            to={`/product-detail-modal?id=${product.id}`}
            className="group bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/50 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {(product.isNew || index < 3) && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    New
                  </div>
                )}
                {product.discount > 0 && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    -{product.discount}%
                  </div>
                )}
                {(product.rating >= 4.8 || (!product.rating && index % 3 === 0)) && (
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Popular
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={(e) => onAddToWishlist(product, e)}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
                >
                  <Icon name="Heart" size={18} className="text-slate-600" />
                </button>
              </div>

              {/* Add to Cart - Hidden until hover */}
              <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <button
                  onClick={(e) => onAddToCart(product, e)}
                  className="w-full bg-slate-900 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-2xl"
                >
                  <Icon name="ShoppingCart" size={18} />
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="mb-3">
                <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 group-hover:text-slate-900 transition-colors leading-tight">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Icon name="Star" size={16} className="text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-slate-700">{product.rating || "5.0"}</span>
                  </div>
                  <span className="text-sm text-slate-500">({product.reviewCount || "48"} reviews)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {formatPrice(product.price)}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-sm text-slate-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                  <Icon name="Package" size={14} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{product.stock || "24"}</span>
                </div>
              </div>
            </div>
          </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="Package" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No products found</h3>
          <p className="text-text-secondary">
            {filterCategory !== 'all' ? 'Try changing the category filter' : 'This shop has no products yet'}
          </p>
        </div>
      )}

      {/* Load More */}
      {filteredAndSortedProducts.length >= 12 && (
        <div className="text-center pt-6">
          <Button variant="outline" iconName="ChevronDown" iconPosition="right">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;