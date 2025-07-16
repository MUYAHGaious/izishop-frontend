import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import Icon from '../../../components/AppIcon';

const ProductGrid = ({ products, loading, onLoadMore, hasMore, onAddToCart, onToggleWishlist }) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loading || isLoadingMore || !hasMore) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      setIsLoadingMore(true);
      onLoadMore().finally(() => setIsLoadingMore(false));
    }
  }, [loading, isLoadingMore, hasMore, onLoadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Skeleton loader component
  const ProductSkeleton = () => (
    <div className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="flex items-center gap-1">
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-8" />
        </div>
        <div className="h-5 bg-muted rounded w-1/3" />
        <div className="h-8 bg-muted rounded w-full" />
      </div>
    </div>
  );

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon name="Search" size={32} className="text-text-secondary" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No products found
        </h3>
        <p className="text-text-secondary text-center max-w-md">
          We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
        
        {/* Loading skeletons */}
        {(loading || isLoadingMore) && (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>

      {/* Load More Button (fallback for infinite scroll) */}
      {!loading && hasMore && !isLoadingMore && (
        <div className="flex justify-center p-8">
          <button
            onClick={() => {
              setIsLoadingMore(true);
              onLoadMore().finally(() => setIsLoadingMore(false));
            }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Load More Products
          </button>
        </div>
      )}

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-3 text-text-secondary">Loading more products...</span>
        </div>
      )}

      {/* End of results */}
      {!loading && !hasMore && products.length > 0 && (
        <div className="text-center py-8 text-text-secondary">
          <Icon name="CheckCircle" size={24} className="mx-auto mb-2" />
          <p>You've seen all products</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;