import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import recommendationService from '../../../services/recommendations';

const ProductRecommendations = React.memo(({ 
  cartItems = [], 
  type = 'cart', // 'cart', 'empty', or 'frequently-bought'
  title,
  subtitle,
  limit = 4,
  className = ""
}) => {
  const { addToCart, isInCart } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      let recs = [];
      
      switch (type) {
        case 'empty':
          recs = await recommendationService.getEmptyCartRecommendations(limit);
          break;
        case 'frequently-bought':
          recs = await recommendationService.getFrequentlyBoughtTogether(cartItems, limit);
          break;
        case 'cart':
        default:
          recs = await recommendationService.getCartRecommendations(cartItems, limit);
          break;
      }
      
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [type, limit]);

  useEffect(() => {
    if (!hasLoaded.current) {
      loadRecommendations();
      hasLoaded.current = true;
    }
  }, [loadRecommendations]);

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Transform product to match expected format (handle both old and new API format)
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price) || 0,
        originalPrice: product.original_price ? parseFloat(product.original_price) : null,
        image: product.image_url || 
               (product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null) ||
               '/api/placeholder/300/300',
        stock: product.stock_quantity || 999,
        maxStock: product.stock_quantity || 999,
        category: product.category,
        seller_id: product.seller_id,
        shopName: 'IziShop Store', // Default shop name
        deliveryEstimate: '2-3 days',
        freeDelivery: false
      };
      
      await addToCart(cartProduct, 1);
      
      // Track view for recommendations
      recommendationService.saveProductView(product.id, product.category);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(numPrice).replace('XAF', 'XAF ');
  };

  // Don't render if no recommendations and not loading
  if (!loading && recommendations.length === 0) {
    return null;
  }

  const defaultTitle = type === 'empty' ? 'You might like these' :
                     type === 'frequently-bought' ? 'Frequently bought together' :
                     'You might also like';

  const defaultSubtitle = type === 'empty' ? 'Popular products from our marketplace' :
                         type === 'frequently-bought' ? 'Products often bought with items in your cart' :
                         'Recommended based on your cart';

  return (
    <div className={`${className}`}>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse shadow-sm">
              <div className="aspect-square bg-muted"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {recommendations.map((product) => {
            const isProductInCart = isInCart(product.id);
            // Handle both old and new API format
            const productImage = product.image_url || 
              (product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null) ||
              '/api/placeholder/300/300';
            
            return (
              <div 
                key={product.id} 
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1"
              >
                <Link 
                  to={`/product-detail?id=${product.id}`}
                  onClick={() => recommendationService.saveProductView(product.id, product.category)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      fallback="/api/placeholder/300/300"
                    />
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                    >
                      <Icon 
                        name="Heart" 
                        size={14} 
                        className="text-gray-400"
                      />
                    </button>
                    
                    {/* Category Badge */}
                    {product.category && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                          {product.category}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-3">
                  {/* Product Name */}
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-tight group-hover:text-teal-600 transition-colors duration-200">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="flex items-center space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Icon 
                          key={i}
                          name="Star" 
                          size={10} 
                          className={i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 hidden sm:inline">(24)</span>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col space-y-1 mb-2">
                    <span className="text-sm sm:text-base font-bold text-teal-600">
                      {formatPrice(product.price)} XAF
                    </span>
                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                      <span className="text-xs text-gray-500 line-through">
                        {formatPrice(product.original_price)} XAF
                      </span>
                    )}
                  </div>

                  {/* Shop Info - Hidden on mobile */}
                  <div className="hidden sm:flex items-center space-x-1 mb-2">
                    <Icon name="Store" size={10} className="text-gray-400" />
                    <span className="text-xs text-gray-600 truncate">IziShop Store</span>
                  </div>

                  {/* Features - Hidden on small cards */}
                  <div className="hidden lg:flex flex-wrap gap-1 mb-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Free Shipping
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white h-8 text-xs font-medium"
                  >
                    {isProductInCart ? (
                      <>
                        <Icon name="Check" size={12} className="mr-1" />
                        <span className="hidden sm:inline">In Cart</span>
                        <span className="sm:hidden">✓</span>
                      </>
                    ) : (
                      <>
                        <Icon name="ShoppingCart" size={12} className="mr-1" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="sm:hidden">Add</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
});

ProductRecommendations.displayName = 'ProductRecommendations';

export default ProductRecommendations;