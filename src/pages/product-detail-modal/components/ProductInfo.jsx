import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductInfo = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={16}
        className={index < Math.floor(rating) ? 'text-accent fill-current' : 'text-border'}
      />
    ));
  };

  const specifications = [
    { label: 'Brand', value: product.brand },
    { label: 'Model', value: product.model },
    { label: 'Color', value: product.color },
    { label: 'Material', value: product.material },
    { label: 'Weight', value: product.weight },
    { label: 'Dimensions', value: product.dimensions },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-text-primary mb-2">
            {product.name}
          </h1>
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-1">
              {renderStars(product.rating)}
              <span className="text-sm text-text-secondary ml-1">
                ({product.reviewCount} reviews)
              </span>
            </div>
            <span className="text-sm text-text-secondary">
              {product.soldCount} sold
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleWishlist}
          className="flex-shrink-0"
        >
          <Icon
            name="Heart"
            size={20}
            className={isWishlisted ? 'text-destructive fill-current' : 'text-text-secondary'}
          />
        </Button>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline space-x-3">
          <span className="text-2xl lg:text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-lg text-text-secondary line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="inline-flex items-center px-2 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded">
            <Icon name="Tag" size={14} className="mr-1" />
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="flex items-center space-x-2">
        <Icon
          name={product.inStock ? "CheckCircle" : "XCircle"}
          size={16}
          className={product.inStock ? 'text-success' : 'text-destructive'}
        />
        <span className={`text-sm font-medium ${
          product.inStock ? 'text-success' : 'text-destructive'
        }`}>
          {product.inStock ? `In Stock (${product.stockCount} available)` : 'Out of Stock'}
        </span>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Description</h3>
        <p className="text-text-secondary leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Specifications */}
      <div>
        <button
          onClick={() => toggleSection('specifications')}
          className="flex items-center justify-between w-full py-3 text-left"
        >
          <h3 className="text-lg font-semibold text-text-primary">Specifications</h3>
          <Icon
            name="ChevronDown"
            size={20}
            className={`text-text-secondary transition-transform ${
              expandedSection === 'specifications' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSection === 'specifications' && (
          <div className="space-y-3 pb-4">
            {specifications.map((spec, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-border last:border-b-0">
                <span className="text-text-secondary">{spec.label}</span>
                <span className="text-text-primary font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shipping Info */}
      <div>
        <button
          onClick={() => toggleSection('shipping')}
          className="flex items-center justify-between w-full py-3 text-left"
        >
          <h3 className="text-lg font-semibold text-text-primary">Shipping & Returns</h3>
          <Icon
            name="ChevronDown"
            size={20}
            className={`text-text-secondary transition-transform ${
              expandedSection === 'shipping' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSection === 'shipping' && (
          <div className="space-y-3 pb-4">
            <div className="flex items-center space-x-3">
              <Icon name="Truck" size={16} className="text-primary" />
              <div>
                <p className="text-text-primary font-medium">Free shipping</p>
                <p className="text-sm text-text-secondary">On orders over 50,000 XAF</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Icon name="RotateCcw" size={16} className="text-primary" />
              <div>
                <p className="text-text-primary font-medium">30-day returns</p>
                <p className="text-sm text-text-secondary">Easy returns and exchanges</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Icon name="Shield" size={16} className="text-primary" />
              <div>
                <p className="text-text-primary font-medium">Buyer protection</p>
                <p className="text-sm text-text-secondary">Secure payment and delivery</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;