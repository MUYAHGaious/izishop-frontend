import React from 'react';
import Icon from '../../../components/AppIcon';

const CheckoutProgress = ({ currentStep, totalSteps }) => {
  const steps = [
    { id: 1, label: 'Delivery Address', icon: 'MapPin' },
    { id: 2, label: 'Delivery Options', icon: 'Truck' },
    { id: 3, label: 'Order Review', icon: 'ShoppingCart' },
    { id: 4, label: 'Payment', icon: 'CreditCard' }
  ];

  return (
    <div className="bg-surface border-b border-border p-4 mb-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-micro ${
                  step.id < currentStep 
                    ? 'bg-success border-success text-white' 
                    : step.id === currentStep 
                    ? 'bg-primary border-primary text-white' :'bg-muted border-border text-muted-foreground'
                }`}>
                  {step.id < currentStep ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    <Icon name={step.icon} size={16} />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium hidden sm:block ${
                  step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 ${
                  step.id < currentStep ? 'bg-success' : 'bg-border'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Mobile step indicator */}
        <div className="sm:hidden mt-3 text-center">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutProgress;