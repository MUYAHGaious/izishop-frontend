import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const ProductInfo = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);

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
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stock || product?.stock || 99)) {
      setQuantity(newQuantity);
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
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          {product.name}
        </h1>
        
        <div className="flex items-center space-x-4 mb-2">
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
            <span className="text-sm font-medium text-foreground">
              {product.rating}
            </span>
            <span className="text-sm text-text-secondary">
              ({product.reviewCount} reviews)
            </span>
          </div>
          
          {product.isVerified && (
            <div className="flex items-center space-x-1 text-success">
              <Icon name="ShieldCheck" size={16} />
              <span className="text-sm font-medium">Verified</span>
            </div>
          )}
        </div>

        {/* Product Code */}
        <p className="text-sm text-text-secondary">
          Product Code: {product.sku || 'N/A'}
        </p>
      </div>

      {/* Pricing */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <span className="text-3xl font-bold text-primary font-mono">
            {formatPrice(selectedVariant?.price || product.price)}
          </span>
          
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-lg text-text-secondary line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="bg-error text-error-foreground px-2 py-1 rounded-full text-sm font-medium">
                -{calculateDiscount(product.originalPrice, product.price)}%
              </span>
            </>
          )}
        </div>
        
        {product.isSecondHand && (
          <div className="flex items-center space-x-2">
            <Icon name="RefreshCw" size={16} className="text-secondary" />
            <span className="text-sm font-medium text-secondary">Second-hand item</span>
            <span className="text-sm text-text-secondary">
              Condition: {product.condition || 'Good'}
            </span>
          </div>
        )}
      </div>

      {/* Variants Selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Options</h3>
          
          {/* Size/Color/Type variants */}
          <div className="space-y-3">
            {product.variantTypes?.map((type) => (
              <div key={type.name}>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {type.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {type.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleVariantSelect(option)}
                      disabled={!option.available}
                      className={`px-3 py-2 rounded-md border text-sm font-medium marketplace-transition ${
                        selectedVariant?.value === option.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : option.available
                          ? 'border-border bg-surface text-foreground hover:border-primary'
                          : 'border-border bg-muted text-text-secondary cursor-not-allowed'
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
          className={selectedVariant?.stock > 0 || product.stock > 0 ? 'text-success' : 'text-error'} 
        />
        <span className={`text-sm font-medium ${
          selectedVariant?.stock > 0 || product.stock > 0 ? 'text-success' : 'text-error'
        }`}>
          {selectedVariant?.stock > 0 || product.stock > 0 
            ? `In Stock (${selectedVariant?.stock || product.stock} available)`
            : 'Out of Stock'
          }
        </span>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Quantity
        </label>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-border rounded-md">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-2 text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="Minus" size={16} />
            </button>
            <span className="px-4 py-2 text-foreground font-medium min-w-[60px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= (selectedVariant?.stock || product.stock || 99)}
              className="p-2 text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="Plus" size={16} />
            </button>
          </div>
          
          <span className="text-sm text-text-secondary">
            Max: {selectedVariant?.stock || product.stock || 99}
          </span>
        </div>
      </div>

      {/* Key Features */}
      {product.features && product.features.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Key Features</h3>
          <ul className="space-y-2">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delivery Information */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Truck" size={20} className="mr-2" />
          Delivery Information
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Standard Delivery</span>
            <span className="text-sm font-medium text-foreground">
              {product.deliveryTime || '2-5 business days'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Delivery Fee</span>
            <span className="text-sm font-medium text-foreground">
              {product.deliveryFee ? formatPrice(product.deliveryFee) : 'Free'}
            </span>
          </div>
          
          {product.expressDelivery && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Express Delivery</span>
              <span className="text-sm font-medium text-foreground">
                {product.expressDeliveryTime || '1-2 business days'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Return Policy */}
      {product.returnPolicy && (
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Icon name="RotateCcw" size={16} />
          <span>{product.returnPolicy}</span>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;