import React from 'react';
import Icon from '../../../components/AppIcon';

const CheckoutSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Cart', icon: 'ShoppingCart' },
    { id: 2, name: 'Shipping', icon: 'Truck' },
    { id: 3, name: 'Payment', icon: 'CreditCard' },
    { id: 4, name: 'Confirmation', icon: 'CheckCircle' }
  ];

  return (
    <div className="bg-card border-b border-border p-4 mb-6">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                currentStep >= step.id
                  ? 'bg-primary border-primary text-white'
                  : currentStep === step.id - 1
                  ? 'border-primary text-primary bg-primary/10' :'border-border text-text-secondary bg-muted'
              }`}>
                <Icon name={step.icon} size={16} />
              </div>
              <span className={`text-xs mt-2 font-medium ${
                currentStep >= step.id ? 'text-primary' : 'text-text-secondary'
              }`}>
                {step.name}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutSteps;