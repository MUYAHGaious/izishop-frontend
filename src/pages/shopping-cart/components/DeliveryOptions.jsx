import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DeliveryOptions = ({ 
  selectedOption, 
  onOptionChange, 
  className = "" 
}) => {
  const [expandedOption, setExpandedOption] = useState(null);

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      price: 2500,
      originalPrice: null,
      timeEstimate: '3-5 business days',
      description: 'Regular delivery to your doorstep',
      icon: 'Truck',
      features: ['Track your package', 'Delivery confirmation', 'Safe handling']
    },
    {
      id: 'express',
      name: 'Express Delivery',
      price: 5000,
      originalPrice: null,
      timeEstimate: '1-2 business days',
      description: 'Fast delivery for urgent orders',
      icon: 'Zap',
      features: ['Priority handling', 'Real-time tracking', 'SMS notifications'],
      popular: true
    },
    {
      id: 'same-day',
      name: 'Same Day Delivery',
      price: 8000,
      originalPrice: 10000,
      timeEstimate: 'Within 6 hours',
      description: 'Get your order today (available in select areas)',
      icon: 'Clock',
      features: ['Ultra-fast delivery', 'Live tracking', 'Photo confirmation'],
      limited: true
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price).replace('XAF', 'XAF ');
  };

  const handleOptionSelect = (optionId) => {
    onOptionChange(optionId);
  };

  const toggleExpanded = (optionId) => {
    setExpandedOption(expandedOption === optionId ? null : optionId);
  };

  return (
    <div className={`bg-card border border-border rounded-lg marketplace-shadow-card ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Delivery Options
        </h3>

        <div className="space-y-3">
          {deliveryOptions.map((option) => (
            <div key={option.id} className="border border-border rounded-lg overflow-hidden">
              <div
                className={`p-4 cursor-pointer marketplace-transition ${
                  selectedOption === option.id
                    ? 'bg-primary/5 border-primary' :'hover:bg-muted/50'
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="flex items-start space-x-3">
                  {/* Radio Button */}
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === option.id
                        ? 'border-primary bg-primary' :'border-border'
                    }`}>
                      {selectedOption === option.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>

                  {/* Option Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Icon name={option.icon} size={16} className="text-primary" />
                          <h4 className="text-sm font-semibold text-foreground">
                            {option.name}
                          </h4>
                          {option.popular && (
                            <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                              Popular
                            </span>
                          )}
                          {option.limited && (
                            <span className="bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                              Limited
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-text-secondary mt-1">
                          {option.description}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs font-medium text-success">
                            {option.timeEstimate}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(option.id);
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            Details
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right ml-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-foreground font-mono">
                            {option.price === 0 ? 'Free' : formatPrice(option.price)}
                          </span>
                          {option.originalPrice && (
                            <span className="text-xs text-text-secondary line-through font-mono">
                              {formatPrice(option.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOption === option.id && (
                <div className="px-4 pb-4 border-t border-border bg-muted/20">
                  <div className="pt-3">
                    <h5 className="text-xs font-semibold text-foreground mb-2">
                      What's included:
                    </h5>
                    <ul className="space-y-1">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-xs text-text-secondary">
                          <Icon name="Check" size={12} className="text-success mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Delivery Info */}
        <div className="mt-4 p-3 bg-muted/30 rounded-md">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={14} className="text-primary mt-0.5" />
            <div className="text-xs text-text-secondary">
              <p className="font-medium text-foreground mb-1">Delivery Information</p>
              <p>• Delivery times may vary based on location and weather conditions</p>
              <p>• Same-day delivery available only in Yaoundé and Douala</p>
              <p>• Free delivery on orders above XAF 50,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOptions;