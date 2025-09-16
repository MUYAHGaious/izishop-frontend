import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { showToast } from '../../../components/ui/Toast';


const ProductInfo = ({ product, onAddToCart, onBuyNow }) => {
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stock || product?.stock_quantity || 99)) {
      setQuantity(newQuantity);
    }
  };

  // Handler functions
  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      showToast('Please log in to add items to cart', 'info', 3000);
      navigate('/authentication-login-register');
      return;
    }

    if ((selectedVariant?.stock || product?.stock_quantity || 0) <= 0) {
      showToast('This item is currently out of stock', 'error', 3000);
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: selectedVariant?.price || product.price,
        image: product.images?.[0],
        shopId: product.shop?.id,
        shopName: product.shop?.name,
        variant: selectedVariant,
        quantity: quantity
      };

      await addToCart(cartItem);
      showToast(`${product.name} added to cart!`, 'success', 3000);

      // Call parent handler if provided
      if (onAddToCart) {
        onAddToCart(cartItem);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart', 'error', 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated()) {
      showToast('Please log in to purchase items', 'info', 3000);
      navigate('/authentication-login-register');
      return;
    }

    if ((selectedVariant?.stock || product?.stock_quantity || 0) <= 0) {
      showToast('This item is currently out of stock', 'error', 3000);
      return;
    }

    // Add to cart first
    await handleAddToCart();

    // Navigate to checkout
    navigate('/checkout');

    // Call parent handler if provided
    if (onBuyNow) {
      onBuyNow({
        id: product.id,
        name: product.name,
        price: selectedVariant?.price || product.price,
        image: product.images?.[0],
        shopId: product.shop?.id,
        shopName: product.shop?.name,
        variant: selectedVariant,
        quantity: quantity
      });
    }
  };

  if (!product) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-3/4"></div>
        <div className="h-6 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Title and Rating */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
          {product.name}
        </h1>
        
        <div className="flex items-center space-x-4 mb-2">
          {product.rating ? (
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={16}
                    className={`${
                      i < Math.floor(product.rating)
                        ? 'text-warning fill-current' :'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {product.rating}
              </span>
              <span className="text-sm text-gray-500">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-500">
                No reviews yet
              </span>
            </div>
          )}
          
          {product.isVerified && (
            <div className="flex items-center space-x-1 text-teal-600">
              <Icon name="ShieldCheck" size={16} />
              <span className="text-sm font-medium">Verified</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1 text-sm text-gray-500">
          {product.sku && (
            <p>Product Code: <span className="font-medium text-gray-700">{product.sku}</span></p>
          )}
          {product.brand && (
            <p>Brand: <span className="font-medium text-gray-700">{product.brand}</span></p>
          )}
          {product.condition && (
            <p>Condition: <span className="font-medium text-gray-700 capitalize">{product.condition}</span></p>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <span className="text-3xl font-bold text-teal-600 font-mono">
            {formatPrice(selectedVariant?.price || product.price)}
          </span>
          
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-lg text-gray-500 line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                -{calculateDiscount(product.originalPrice, product.price)}%
              </span>
            </>
          )}
        </div>
        
        {product.condition === 'used' && (
          <div className="flex items-center space-x-2">
            <Icon name="RefreshCw" size={16} className="text-teal-600" />
            <span className="text-sm font-medium text-teal-600">Used item</span>
            <span className="text-sm text-gray-500">
              Condition: {product.condition || 'Used'}
            </span>
          </div>
        )}
        {product.condition === 'refurbished' && (
          <div className="flex items-center space-x-2">
            <Icon name="RefreshCcw" size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Refurbished item</span>
            <span className="text-sm text-gray-500">
              Condition: Professionally refurbished
            </span>
          </div>
        )}
      </div>

      {/* Variants Selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Options</h3>
          
          {/* Size/Color/Type variants */}
          <div className="space-y-3">
            {product.variantTypes?.map((type) => (
              <div key={type.name}>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {type.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {type.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleVariantSelect(option)}
                      disabled={!option.available}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-300 ${
                        selectedVariant?.value === option.value
                          ? 'border-teal-500 bg-teal-500 text-white shadow-md'
                          : option.available
                          ? 'border-gray-300 bg-white text-gray-700 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {option.label}
                      {!option.available && (
                        <span className="ml-1 text-xs">(Out of stock)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Status */}
      <div className="flex items-center space-x-2">
        <Icon
          name="Package"
          size={16}
          className={selectedVariant?.stock > 0 || product.stock_quantity > 0 ? 'text-teal-600' : 'text-red-500'}
        />
        <span className={`text-sm font-medium ${
          selectedVariant?.stock > 0 || product.stock_quantity > 0 ? 'text-teal-600' : 'text-red-500'
        }`}>
          {selectedVariant?.stock > 0 || product.stock_quantity > 0
            ? `In Stock (${selectedVariant?.stock || product.stock_quantity} available)`
            : 'Out of Stock'
          }
        </span>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Quantity
        </label>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-sm">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-3 text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl"
            >
              <Icon name="Minus" size={16} />
            </button>
            <span className="px-4 py-3 text-gray-900 font-medium min-w-[60px] text-center border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= (selectedVariant?.stock || product.stock_quantity || 99)}
              className="p-3 text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-xl"
            >
              <Icon name="Plus" size={16} />
            </button>
          </div>
          
          <span className="text-sm text-gray-500">
            Max: {selectedVariant?.stock || product.stock_quantity || 99}
          </span>
        </div>
      </div>

      {/* Key Features */}
      {product.features && product.features.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
          <ul className="space-y-2">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Icon name="Check" size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delivery Information */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Icon name="Truck" size={20} className="mr-2 text-teal-600" />
          Delivery Information
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Standard Delivery</span>
            <span className="text-sm font-medium text-gray-900">
              {product.deliveryTime || '2-5 business days'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Delivery Fee</span>
            <span className="text-sm font-medium text-gray-900">
              {product.deliveryFee ? formatPrice(product.deliveryFee) : 'Free'}
            </span>
          </div>
          
          {product.expressDelivery && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Express Delivery</span>
              <span className="text-sm font-medium text-gray-900">
                {product.expressDeliveryTime || '1-2 business days'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Physical Attributes */}
      {(product.weight || product.materials || product.manufacturing_location) && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <h3 className="text-md font-semibold text-gray-900">Physical Details</h3>
          {product.weight && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Weight</span>
              <span className="text-sm font-medium text-gray-900">{product.weight} kg</span>
            </div>
          )}
          {product.materials && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Materials</span>
              <span className="text-sm font-medium text-gray-900">{product.materials}</span>
            </div>
          )}
          {product.manufacturing_location && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Made in</span>
              <span className="text-sm font-medium text-gray-900">{product.manufacturing_location}</span>
            </div>
          )}
        </div>
      )}

      {/* Warranty Information */}
      {(product.warranty_months || product.warranty_type) && (
        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
          <h3 className="text-md font-semibold text-blue-900 flex items-center">
            <Icon name="Shield" size={16} className="mr-2 text-blue-600" />
            Warranty
          </h3>
          {product.warranty_months && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600">Duration</span>
              <span className="text-sm font-medium text-blue-900">{product.warranty_months} months</span>
            </div>
          )}
          {product.warranty_type && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600">Type</span>
              <span className="text-sm font-medium text-blue-900 capitalize">{product.warranty_type}</span>
            </div>
          )}
          {product.warranty_details && (
            <p className="text-sm text-blue-700">{product.warranty_details}</p>
          )}
        </div>
      )}

      {/* Return Policy */}
      {(product.return_policy || product.return_details) && (
        <div className="flex flex-col space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Icon name="RotateCcw" size={16} className="text-teal-600" />
            <span className="font-medium">
              {product.return_policy ? product.return_policy.replace('_', ' ') + ' return policy' : 'Return available'}
            </span>
          </div>
          {product.return_details && (
            <p className="text-xs text-gray-500 ml-6">{product.return_details}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        {/* Add to Cart & Buy Now Buttons */}
        <div className="space-y-2">
          <Button
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleBuyNow}
            disabled={(selectedVariant?.stock || product?.stock_quantity || 0) <= 0 || isAddingToCart}
          >
            <Icon name="Zap" size={16} className="mr-2" />
            Buy Now
          </Button>

          <Button
            className="w-full border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400 py-3 rounded-xl font-medium transition-all duration-300"
            variant="outline"
            onClick={handleAddToCart}
            disabled={(selectedVariant?.stock || product?.stock_quantity || 0) <= 0 || isAddingToCart}
            loading={isAddingToCart}
          >
            <Icon name="ShoppingCart" size={16} className="mr-2" />
            Add to Cart
          </Button>
        </div>

        {/* Stock Status Display */}
        <div className="text-center">
          {(selectedVariant?.stock || product?.stock_quantity || 0) > 0 ? (
            <p className="text-sm text-green-600">
              ✓ {selectedVariant?.stock || product.stock_quantity} in stock
            </p>
          ) : (
            <p className="text-sm text-red-500">
              ✗ Currently out of stock
            </p>
          )}
        </div>
      </div>
    </div>
  );

};

export default ProductInfo;