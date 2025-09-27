import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { useWishlist } from '../../../contexts/WishlistContext';

const ProductCard = ({ product, onAddToCart, onToggleWishlist, viewMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isInWishlist, toggleWishlist, isLoading: wishlistLoading } = useWishlist();
  const navigate = useNavigate();

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
    try {
      // Use the WishlistContext which has batch system integration
      const result = await toggleWishlist(product);
      console.log('🔄 Wishlist toggle result:', result);

      // Also call the parent callback if provided (for backward compatibility)
      if (onToggleWishlist) {
        await onToggleWishlist(product.id, !isInWishlist(product.id));
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleViewDetails = () => {
    navigate(`/product-detail?id=${product.id}`);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="flex p-4 gap-4">
          {/* Product Image */}
          <div className="relative w-32 h-32 flex-shrink-0">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>
            )}
            <Image
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              onLoad={() => {
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageLoaded(false);
                setImageError(true);
              }}
              fallback={
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <Icon name="Image" size={48} className="text-gray-400" />
                </div>
              }
            />

            

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
            >
              <Icon
                name="Heart"
                size={16}
                className={`transition-colors duration-200 ${
                  isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                } ${wishlistLoading ? 'animate-pulse' : ''}`}
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
              <span className="text-xl font-bold text-teal-600">
                {formatPrice(product.price)} XAF
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)} XAF
                </span>
              )}
            </div>

            {/* Enhanced Shop Info */}
            <div className="mb-3 p-2 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Store" size={12} className="text-teal-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]" title={product.shopName || 'IziShopin Store'}>
                    {product.shopName || 'IziShopin Store'}
                  </span>
                  {product.shopVerified && (
                    <div className="flex items-center space-x-1 bg-green-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      <Icon name="CheckCircle" size={8} className="text-green-600" />
                      <span className="text-xs font-medium text-green-700">Verified</span>
                    </div>
                  )}
                </div>
                {product.shopRating >= 4.5 && (
                  <div className="flex items-center space-x-1 bg-yellow-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    <Icon name="Star" size={8} className="text-yellow-600 fill-current" />
                    <span className="text-xs font-medium text-yellow-700">Top Seller</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                {product.shopRating && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={10} className="text-amber-400 fill-current" />
                    <span>{product.shopRating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Icon name="MapPin" size={8} />
                  <span className="truncate max-w-[120px]" title={product.shopLocation || 'Cameroon'}>
                    {product.shopLocation || 'Cameroon'}
                  </span>
                </div>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white h-10"
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
                className="px-4 h-10 border-gray-300 hover:border-teal-500 hover:text-teal-500"
                onClick={handleViewDetails}
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
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
          }}
          onError={() => {
            setImageLoaded(false);
            setImageError(true);
          }}
          fallback={
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Icon name="Image" size={64} className="text-gray-400" />
            </div>
          }
        />

        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            variant="outline"
            className="bg-white/90 backdrop-blur-sm border-white text-gray-900 hover:bg-white"
            onClick={handleViewDetails}
          >
            <Icon name="Eye" size={16} className="mr-2" />
            Preview
          </Button>
        </div>


        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm transform hover:scale-110"
        >
          <Icon
            name="Heart"
            size={18}
            className={`transition-all duration-200 ${
              isInWishlist(product.id) ? 'text-red-500 fill-current scale-110' : 'text-gray-400'
            } ${wishlistLoading ? 'animate-pulse' : ''}`}
          />
        </button>

      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-tight group-hover:text-teal-600 transition-colors duration-200 min-h-[2.5rem]" title={product.name}>
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
          <span className="text-lg font-bold text-teal-600">
            {formatPrice(product.price)} XAF
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(product.originalPrice)} XAF
            </span>
          )}
        </div>

        {/* Enhanced Shop Info */}
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5 min-w-0 flex-1">
              <div className="w-4 h-4 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="Store" size={10} className="text-teal-600" />
              </div>
              <span className="text-xs font-medium text-gray-800 truncate max-w-[120px]" title={product.shopName || 'IziShopin Store'}>
                {product.shopName || 'IziShopin Store'}
              </span>
              {product.shopVerified && (
                <div className="flex items-center space-x-1 bg-green-100 px-1 py-0.5 rounded-full flex-shrink-0">
                  <Icon name="CheckCircle" size={6} className="text-green-600" />
                  <span className="text-xs font-medium text-green-700">✓</span>
                </div>
              )}
            </div>
            {product.shopRating >= 4.5 && (
              <div className="flex items-center space-x-1 bg-yellow-100 px-1 py-0.5 rounded-full flex-shrink-0">
                <Icon name="Star" size={6} className="text-yellow-600 fill-current" />
                <span className="text-xs font-medium text-yellow-700">Top</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {product.shopRating && (
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={8} className="text-amber-400 fill-current" />
                <span>{product.shopRating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={6} />
              <span className="truncate max-w-[80px]" title={product.shopLocation || 'CM'}>
                {product.shopLocation || 'CM'}
              </span>
            </div>
          </div>
        </div>

        {/* Clean Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.badges?.slice(0, 3).map((badge, index) => {
            const lightColorClasses = {
              red: 'bg-red-100 text-red-700',
              green: 'bg-green-100 text-green-700',
              blue: 'bg-blue-100 text-blue-700',
              orange: 'bg-orange-100 text-orange-700',
              purple: 'bg-purple-100 text-purple-700',
              yellow: 'bg-yellow-100 text-yellow-700'
            };

            return (
              <span
                key={index}
                className={`text-xs font-medium ${lightColorClasses[badge.color] || 'bg-gray-100 text-gray-700'} px-2 py-1 rounded-full`}
              >
                {badge.label}
              </span>
            );
          })}
        </div>


        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white h-9 text-sm font-medium"
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
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'
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
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'
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
            className="px-8 py-3 border-teal-500 text-teal-500 hover:bg-teal-50"
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
            className="mt-4 border-teal-500 text-teal-500 hover:bg-teal-50"
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

