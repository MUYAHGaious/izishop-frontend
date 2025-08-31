import React, { useState, useRef } from 'react';
import ProductCard from './ProductCard';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const ProductCarousel = ({ 
  products = [], 
  variant = 'compact',
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
  autoPlay = false,
  autoPlayInterval = 5000,
  showNavigation = true,
  showDots = true,
  ...props 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-secondary text-lg">No products found</div>
        <div className="text-text-secondary text-sm mt-2">Try adjusting your search or filters</div>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, currentIndex]);

  const visibleProducts = products.slice(currentIndex, currentIndex + 4);

  return (
    <div className={`relative ${className}`} {...props}>
      {/* Navigation Arrows */}
      {showNavigation && products.length > 4 && (
        <>
          <Button
            variant="secondary"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-moderate"
            onClick={prevSlide}
            iconName="ChevronLeft"
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-moderate"
            onClick={nextSlide}
            iconName="ChevronRight"
          />
        </>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleProducts.map((product) => (
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

      {/* Dots Indicator */}
      {showDots && products.length > 4 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: Math.ceil(products.length / 4) }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === Math.floor(currentIndex / 4)
                  ? 'bg-primary'
                  : 'bg-muted hover:bg-muted-foreground'
              }`}
              onClick={() => goToSlide(index * 4)}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {autoPlay && (
        <div className="mt-4 bg-muted rounded-full h-1 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-1000 ease-linear"
            style={{ 
              width: `${((currentIndex + 1) / products.length) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
