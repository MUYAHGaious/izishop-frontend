import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductCard = ({ product, onAddToCart, onToggleWishlist, viewMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart(product);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    setIsWishlistLoading(true);
    try {
      await onToggleWishlist(product.id, !product.isWishlisted);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="flex p-4 gap-4">
          {/* Product Image */}
          <div className="relative w-32 h-32 flex-shrink-0">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>
            )}
            <img 
              src={product.image} 
              alt={product.name}
              className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.discount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{product.discount}%
                </span>
              )}
              {product.isNew && (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  NEW
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              disabled={isWishlistLoading}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
            >
              <Icon 
                name="Heart" 
                size={16} 
                className={`transition-colors duration-200 ${
                  product.isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'
                } ${isWishlistLoading ? 'animate-pulse' : ''}`}
              />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                {product.name}
              </h3>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Icon 
                    key={i}
                    name="Star" 
                    size={14} 
                    className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.reviewCount})</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl font-bold text-orange-600">
                {formatPrice(product.price)} XAF
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)} XAF
                </span>
              )}
            </div>

            {/* Shop Info */}
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Store" size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{product.shopName}</span>
              {product.isFreeShipping && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Free Shipping
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-10"
              >
                {isLoading ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <>
                    <Icon name="ShoppingCart" size={16} className="mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="px-4 h-10 border-gray-300 hover:border-orange-500 hover:text-orange-500"
              >
                <Icon name="Eye" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            variant="outline"
            className="bg-white/90 backdrop-blur-sm border-white text-gray-900 hover:bg-white"
          >
            <Icon name="Eye" size={16} className="mr-2" />
            Quick View
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm transform hover:scale-110"
        >
          <Icon 
            name="Heart" 
            size={18} 
            className={`transition-all duration-200 ${
              product.isWishlisted ? 'text-red-500 fill-current scale-110' : 'text-gray-400'
            } ${isWishlistLoading ? 'animate-pulse' : ''}`}
          />
        </button>

        {/* Stock indicator */}
        {product.stock <= 5 && (
          <div className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Only {product.stock} left!
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-tight group-hover:text-orange-600 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Icon 
                key={i}
                name="Star" 
                size={12} 
                className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-orange-600">
            {formatPrice(product.price)} XAF
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(product.originalPrice)} XAF
            </span>
          )}
        </div>

        {/* Shop Info */}
        <div className="flex items-center space-x-1 mb-3">
          <Icon name="Store" size={12} className="text-gray-400" />
          <span className="text-xs text-gray-600 truncate">{product.shopName}</span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.isFreeShipping && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Free Shipping
            </span>
          )}
          {product.badges?.slice(0, 1).map((badge, index) => (
            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {badge}
            </span>
          ))}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white h-9 text-sm font-medium"
        >
          {isLoading ? (
            <Icon name="Loader2" size={14} className="animate-spin" />
          ) : (
            <>
              <Icon name="ShoppingCart" size={14} className="mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const ProductGrid = ({ 
  products, 
  loading, 
  onLoadMore, 
  hasMore, 
  onAddToCart, 
  onToggleWishlist,
  viewMode = 'grid'
}) => {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={`${viewMode === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' 
      : 'space-y-4'
    }`}>
      {[...Array(viewMode === 'grid' ? 20 : 10)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {viewMode === 'grid' ? (
            <>
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </>
          ) : (
            <div className="flex p-4 gap-4">
              <div className="w-32 h-32 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading && products.length === 0) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Products Grid/List */}
      <div className={`${viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' 
        : 'space-y-4'
      }`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Load More Section */}
      {hasMore && (
        <div className="mt-12 text-center">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            size="lg"
            variant="outline"
            className="px-8 py-3 border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            {loadingMore ? (
              <>
                <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                Loading more products...
              </>
            ) : (
              <>
                <Icon name="Plus" size={20} className="mr-2" />
                Load More Products
              </>
            )}
          </Button>
        </div>
      )}

      {/* End of results */}
      {!hasMore && products.length > 0 && (
        <div className="mt-12 text-center py-8 border-t border-gray-200">
          <div className="text-gray-500 mb-2">
            <Icon name="CheckCircle" size={24} className="mx-auto mb-2 text-green-500" />
            You've seen all products!
          </div>
          <p className="text-sm text-gray-400">
            Showing {products.length} products total
          </p>
        </div>
      )}

      {/* No products found */}
      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Icon name="Search" size={48} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
          <Button
            variant="outline"
            className="mt-4 border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

