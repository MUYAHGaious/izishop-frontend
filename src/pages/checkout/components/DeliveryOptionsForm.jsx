import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DeliveryOptionsForm = ({ formData, setFormData }) => {
  const [selectedOption, setSelectedOption] = useState(formData.deliveryOption || '');

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      carrier: 'IziShop Express',
      timeframe: '3-5 business days',
      cost: 2500,
      estimatedDate: 'July 20-22, 2025',
      icon: 'Package',
      description: 'Economical delivery with tracking'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      carrier: 'IziShop Express',
      timeframe: '1-2 business days',
      cost: 5000,
      estimatedDate: 'July 17-18, 2025',
      icon: 'Zap',
      description: 'Fast delivery with priority',
      popular: true
    },
    {
      id: 'same-day',
      name: 'Same Day Delivery',
      carrier: 'IziShop Express',
      timeframe: '2-6 hours',
      cost: 8000,
      estimatedDate: 'July 16, 2025',
      icon: 'Clock',
      description: 'Available for Yaoundé and Douala only',
      limited: true
    },
    {
      id: 'pickup',
      name: 'Pickup Point Collection',
      carrier: 'IziShop Pickup Points',
      timeframe: '2-4 business days',
      cost: 0,
      estimatedDate: 'July 18-20, 2025',
      icon: 'MapPin',
      description: 'Free - Collect at a pickup point near you'
    }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    const option = deliveryOptions.find(opt => opt.id === optionId);
    setFormData(prev => ({
      ...prev,
      deliveryOption: optionId,
      deliveryOptionDetails: option,
      deliveryCost: option.cost
    }));
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
        <h2 className="text-xl font-semibold text-foreground mb-6">Delivery Options</h2>
        
        <div className="space-y-4">
          {deliveryOptions.map((option) => (
            <div
              key={option.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-micro hover-scale ${
                selectedOption === option.id
                  ? 'border-primary bg-primary/5' :'border-border bg-surface hover:border-primary/20'
              }`}
              onClick={() => handleOptionSelect(option.id)}
            >
              {/* Popular badge */}
              {option.popular && (
                <div className="absolute -top-2 left-4 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                  Popular
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedOption === option.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon name={option.icon} size={20} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{option.name}</h3>
                    <span className={`font-semibold ${
                      option.cost === 0 ? 'text-success' : 'text-foreground'
                    }`}>
                      {option.cost === 0 ? 'Free' : formatCurrency(option.cost)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center space-x-1">
                      <Icon name="Truck" size={14} />
                      <span>{option.carrier}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="Clock" size={14} />
                      <span>{option.timeframe}</span>
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                  
                  <div className="flex items-center space-x-1 text-sm">
                    <Icon name="Calendar" size={14} className="text-primary" />
                    <span className="text-foreground font-medium">
                      Estimated delivery: {option.estimatedDate}
                    </span>
                  </div>
                  
                  {option.limited && (
                    <div className="flex items-center space-x-1 text-sm text-warning mt-1">
                      <Icon name="AlertTriangle" size={14} />
                      <span>Limited availability</span>
                    </div>
                  )}
                </div>
                
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === option.id
                    ? 'border-primary bg-primary' :'border-border bg-surface'
                }`}>
                  {selectedOption === option.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery address summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="MapPin" size={16} className="text-primary" />
            <span className="font-medium text-foreground">Delivery address</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formData.fullName} • {formData.phone}
          </p>
          <p className="text-sm text-muted-foreground">
            {formData.address}, {formData.city}, {formData.region}
          </p>
        </div>

      </div>
    </div>
  );
};

export default DeliveryOptionsForm;