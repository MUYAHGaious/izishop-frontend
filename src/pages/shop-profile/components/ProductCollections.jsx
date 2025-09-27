import React, { useState, useMemo } from 'react';
import { ChevronRight, Package, Grid, ArrowRight, Star, ShoppingCart, Eye, Heart } from 'lucide-react';

const ProductCollections = ({ products, onProductClick, onAddToCart, onAddToWishlist }) => {
  const [selectedCollection, setSelectedCollection] = useState(null);

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

  // Group products by category and create collections
  const collections = useMemo(() => {
    if (!products || products.length === 0) return [];

    const grouped = products.reduce((acc, product) => {
      const category = product.category || product.category_name || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});

    return Object.entries(grouped).map(([category, categoryProducts]) => {
      const avgPrice = categoryProducts.reduce((sum, p) => sum + (p.price || p.unit_price || 0), 0) / categoryProducts.length;
      const avgRating = categoryProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / categoryProducts.length;

      return {
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category,
        description: `${categoryProducts.length} products in ${category}`,
        products: categoryProducts,
        productCount: categoryProducts.length,
        averagePrice: avgPrice,
        averageRating: avgRating,
        featuredProduct: categoryProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0],
        // Get top 4 products for preview
        previewProducts: categoryProducts.slice(0, 4)
      };
    }).sort((a, b) => b.productCount - a.productCount); // Sort by product count
  }, [products]);

  const getCollectionIcon = (categoryName) => {
    const iconMap = {
      'electronics': '💻',
      'fashion': '👕',
      'home': '🏠',
      'sports': '⚽',
      'books': '📚',
      'toys': '🧸',
      'beauty': '💄',
      'automotive': '🚗',
      'garden': '🌱',
      'food': '🍎',
      'health': '💊',
      'art': '🎨',
      'music': '🎵',
      'travel': '✈️',
      'pets': '🐕',
      'office': '🖊️',
      'jewelry': '💎',
      'collectibles': '🏆'
    };

    return iconMap[categoryName.toLowerCase()] || '📦';
  };

  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No collections yet
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            This shop hasn't organized products into collections yet.
          </p>
        </div>
      </div>
    );
  }

  // Show individual collection view
  if (selectedCollection) {
    const collection = collections.find(c => c.id === selectedCollection);
    if (!collection) return null;

    return (
      <div className="space-y-6">
        {/* Collection Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedCollection(null)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={20} className="rotate-180 mr-2" />
              Back to Collections
            </button>
            <div className="text-sm text-gray-500">
              {collection.productCount} products
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">{getCollectionIcon(collection.name)}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{collection.name}</h2>
              <p className="text-gray-600">{collection.description}</p>
            </div>
          </div>

          {/* Collection Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{collection.productCount}</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{formatPrice(collection.averagePrice)}</div>
              <div className="text-sm text-gray-600">Avg. Price</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1">
                {renderStars(collection.averageRating)}
              </div>
              <div className="text-sm text-gray-600">Avg. Rating</div>
            </div>
          </div>
        </div>

        {/* Collection Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collection.products.map((product) => (
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
                {(product.stock_quantity || product.quantity) <= 5 && (product.stock_quantity || product.quantity) > 0 && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Low Stock
                  </div>
                )}

                {(product.stock_quantity || product.quantity) === 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
                  {product.name || product.product_name}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {product.description || product.product_description || 'No description available'}
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
                      {formatPrice(product.price || product.unit_price)}
                    </span>
                    {product.original_price && product.original_price > (product.price || product.unit_price) && (
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
      </div>
    );
  }

  // Show collections overview
  return (
    <div className="space-y-6">
      {/* Collections Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Product Collections</h2>
            <p className="text-gray-600">Explore our curated product categories</p>
          </div>
          <Grid size={24} className="text-gray-400" />
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => setSelectedCollection(collection.id)}
          >
            {/* Collection Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">{getCollectionIcon(collection.name)}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-gray-600">{collection.productCount} products</p>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
              </div>

              {/* Collection Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="font-bold text-gray-900">{formatPrice(collection.averagePrice)}</div>
                  <div className="text-xs text-gray-600">Avg. Price</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span className="font-bold text-gray-900">{collection.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-gray-600">Avg. Rating</div>
                </div>
              </div>
            </div>

            {/* Collection Preview */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {collection.previewProducts.map((product, index) => (
                  <div key={product.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
                {/* Show more indicator if there are more products */}
                {collection.productCount > 4 && (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-600">+{collection.productCount - 4}</div>
                      <div className="text-xs text-gray-500">more</div>
                    </div>
                  </div>
                )}
              </div>

              {/* View Collection Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCollection(collection.id);
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all duration-200"
              >
                View Collection
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCollections;