import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DeliveryOptionsForm = ({ onNext, onBack, formData, setFormData }) => {
  const [selectedOption, setSelectedOption] = useState(formData.deliveryOption || '');

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Livraison Standard',
      carrier: 'IziShop Express',
      timeframe: '3-5 jours ouvrables',
      cost: 2500,
      estimatedDate: '20-22 Juillet 2025',
      icon: 'Package',
      description: 'Livraison économique avec suivi'
    },
    {
      id: 'express',
      name: 'Livraison Express',
      carrier: 'IziShop Express',
      timeframe: '1-2 jours ouvrables',
      cost: 5000,
      estimatedDate: '17-18 Juillet 2025',
      icon: 'Zap',
      description: 'Livraison rapide avec priorité',
      popular: true
    },
    {
      id: 'same-day',
      name: 'Livraison Même Jour',
      carrier: 'IziShop Express',
      timeframe: '2-6 heures',
      cost: 8000,
      estimatedDate: '16 Juillet 2025',
      icon: 'Clock',
      description: 'Disponible pour Yaoundé et Douala uniquement',
      limited: true
    },
    {
      id: 'pickup',
      name: 'Retrait en Point Relais',
      carrier: 'Points Relais IziShop',
      timeframe: '2-4 jours ouvrables',
      cost: 0,
      estimatedDate: '18-20 Juillet 2025',
      icon: 'MapPin',
      description: 'Gratuit - Retirez dans un point relais près de chez vous'
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

  const handleNext = () => {
    if (selectedOption) {
      onNext();
    }
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
        <h2 className="text-xl font-semibold text-foreground mb-6">Options de Livraison</h2>
        
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
                  Populaire
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
                      {option.cost === 0 ? 'Gratuit' : formatCurrency(option.cost)}
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
                      Livraison estimée: {option.estimatedDate}
                    </span>
                  </div>
                  
                  {option.limited && (
                    <div className="flex items-center space-x-1 text-sm text-warning mt-1">
                      <Icon name="AlertTriangle" size={14} />
                      <span>Disponibilité limitée</span>
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
            <span className="font-medium text-foreground">Adresse de livraison</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formData.fullName} • {formData.phone}
          </p>
          <p className="text-sm text-muted-foreground">
            {formData.address}, {formData.city}, {formData.region}
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={onBack}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Retour
          </Button>
          
          <Button
            variant="default"
            onClick={handleNext}
            disabled={!selectedOption}
            iconName="ArrowRight"
            iconPosition="right"
            className="min-w-32"
          >
            Continuer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOptionsForm;