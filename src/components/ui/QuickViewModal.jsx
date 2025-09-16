import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Icon from '../AppIcon';
import { useWishlist } from '../../contexts/WishlistContext';

const QuickViewModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    handleClose();
  };

  const handleWishlistToggle = async () => {
    try {
      await toggleWishlist(product);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleViewFullProduct = () => {
    handleClose();
    navigate(`/product-detail?id=${product.id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  if (!isOpen || !product) return null;

  // Use product images or fallback to single image
  const images = product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : [product.image];

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-200 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick View</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWishlistToggle}
              className="hover:bg-gray-100"
            >
              <Icon
                name="Heart"
                size={18}
                className={`transition-colors ${
                  isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="hover:bg-gray-100"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={images[selectedImageIndex] || '/assets/images/no_image.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index
                          ? 'border-teal-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-4">
              {/* Product Name & Shop */}
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Icon name="Store" size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{product.shopName}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={14}
                      className={i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.reviewCount || 0})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-teal-600">
                  {formatPrice(product.price)} XAF
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.originalPrice)} XAF
                  </span>
                )}
              </div>

              {/* Badges */}
              {product.badges && product.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.badges.slice(0, 2).map((badge, index) => {
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
              )}

              {/* Stock Info */}
              <div className="flex items-center space-x-2">
                <Icon name="Package" size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Qty:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Icon name="Minus" size={12} />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                    disabled={quantity >= (product.stock || 999)}
                  >
                    <Icon name="Plus" size={12} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={handleViewFullProduct}
            >
              <Icon name="Eye" size={16} className="mr-2" />
              Full Details
            </Button>
            <Button
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
              onClick={handleAddToCart}
              disabled={!product.stock || product.stock === 0}
            >
              <Icon name="ShoppingCart" size={16} className="mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;