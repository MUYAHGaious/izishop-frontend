import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
  products = [], 
  columns = 4,
  gap = 4,
  variant = 'default',
  showWishlist = true,
  showBadges = true,
  showQuickActions = false,
  showDescription = false,
  showShopInfo = true,
  showRating = true,
  showStock = true,
  onAddToCart,
  onToggleWishlist,
  className = "",
  ...props 
}) => {
  // Responsive grid columns
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
  };

  // Gap sizes
  const gapSizes = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  const gridClasses = `grid ${gridCols[columns] || gridCols[4]} ${gapSizes[gap] || gapSizes[4]}`;

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-secondary text-lg">No products found</div>
        <div className="text-text-secondary text-sm mt-2">Try adjusting your search or filters</div>
      </div>
    );
  }

  return (
    <div className={`${gridClasses} ${className}`} {...props}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          showWishlist={showWishlist}
          showBadges={showBadges}
          showQuickActions={showQuickActions}
          showDescription={showDescription}
          showShopInfo={showShopInfo}
          showRating={showRating}
          showStock={showStock}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
