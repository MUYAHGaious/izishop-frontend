import React from 'react';
import { Star, Heart, ShoppingCart, Eye, Package } from 'lucide-react';

const ModernProductGrid = ({ products, onProductClick, onAddToCart, onAddToWishlist }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < Math.floor(rating || 0)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No products yet
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            This shop hasn't added any products yet. Check back later for amazing items!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* Product Image */}
          <div className="relative aspect-square bg-gray-100 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package size={48} className="text-gray-400" />
              </div>
            )}
            
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToWishlist?.(product.id);
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  title="Add to wishlist"
                >
                  <Heart size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductClick?.(product.id);
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  title="Quick view"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>

            {/* Stock Badge */}
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Low Stock
              </div>
            )}
            
            {product.stock_quantity === 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Out of Stock
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
              {product.name}
            </h3>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description || 'No description available'}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-gray-600">
                ({product.review_count || 0})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(product.id);
              }}
              disabled={product.stock_quantity === 0}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200 ${
                product.stock_quantity === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <ShoppingCart size={16} />
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModernProductGrid;
