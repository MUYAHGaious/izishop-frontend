import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ 
  products = [], 
  variant = 'horizontal',
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
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-secondary text-lg">No products found</div>
        <div className="text-text-secondary text-sm mt-2">Try adjusting your search or filters</div>
      </div>
    );
  }

  // Ensure all products have valid IDs
  const validProducts = products.filter(product => product && product.id);
  
  if (validProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-secondary text-lg">No valid products found</div>
        <div className="text-text-secondary text-sm mt-2">Some products may be missing required information</div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {validProducts.map((product) => (
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

export default ProductList;
