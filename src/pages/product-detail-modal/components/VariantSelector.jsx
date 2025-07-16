import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const VariantSelector = ({ variants, onVariantChange }) => {
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);

  const handleVariantSelect = (type, value) => {
    const newVariants = { ...selectedVariants, [type]: value };
    setSelectedVariants(newVariants);
    onVariantChange(newVariants, quantity);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
      onVariantChange(selectedVariants, newQuantity);
    }
  };

  const increaseQuantity = () => {
    handleQuantityChange(quantity + 1);
  };

  const decreaseQuantity = () => {
    handleQuantityChange(quantity - 1);
  };

  return (
    <div className="space-y-6 py-6 border-t border-border">
      {/* Size Selection */}
      {variants.sizes && variants.sizes.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Size</h4>
          <div className="flex flex-wrap gap-2">
            {variants.sizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleVariantSelect('size', size.value)}
                disabled={!size.available}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  selectedVariants.size === size.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : size.available
                    ? 'border-border text-text-primary hover:border-primary hover:text-primary' :'border-border text-text-secondary bg-muted cursor-not-allowed'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {variants.colors && variants.colors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Color</h4>
          <div className="flex flex-wrap gap-3">
            {variants.colors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleVariantSelect('color', color.value)}
                disabled={!color.available}
                className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                  selectedVariants.color === color.value
                    ? 'border-primary scale-110'
                    : color.available
                    ? 'border-border hover:border-primary hover:scale-105' :'border-border opacity-50 cursor-not-allowed'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
              >
                {selectedVariants.color === color.value && (
                  <Icon
                    name="Check"
                    size={16}
                    className="absolute inset-0 m-auto text-white"
                    style={{ 
                      color: color.hex === '#FFFFFF' || color.hex === '#ffffff' ? '#000000' : '#FFFFFF' 
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Style/Material Selection */}
      {variants.styles && variants.styles.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Style</h4>
          <div className="grid grid-cols-2 gap-2">
            {variants.styles.map((style) => (
              <button
                key={style.value}
                onClick={() => handleVariantSelect('style', style.value)}
                disabled={!style.available}
                className={`p-3 border rounded-md text-sm font-medium transition-colors text-left ${
                  selectedVariants.style === style.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : style.available
                    ? 'border-border text-text-primary hover:border-primary hover:bg-muted' :'border-border text-text-secondary bg-muted cursor-not-allowed'
                }`}
              >
                <div className="font-medium">{style.label}</div>
                {style.description && (
                  <div className="text-xs text-text-secondary mt-1">
                    {style.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selection */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3">Quantity</h4>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-none border-r border-border"
            >
              <Icon name="Minus" size={16} />
            </Button>
            <div className="w-16 h-10 flex items-center justify-center text-sm font-medium">
              {quantity}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={increaseQuantity}
              disabled={quantity >= 99}
              className="w-10 h-10 rounded-none border-l border-border"
            >
              <Icon name="Plus" size={16} />
            </Button>
          </div>
          <span className="text-sm text-text-secondary">
            Maximum 99 items
          </span>
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;