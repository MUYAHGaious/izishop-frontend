import React from 'react';
import Icon from '../../../components/AppIcon';

const CheckoutProgress = ({ currentStep, totalSteps }) => {
  const steps = [
    { id: 1, label: 'Delivery Address', icon: 'MapPin' },
    { id: 2, label: 'Delivery Options', icon: 'Truck' },
    { id: 3, label: 'Order Review', icon: 'ShoppingCart' },
    { id: 4, label: 'Payment', icon: 'CreditCard', showPaymentMethods: true }
  ];

  return (
    <div className="bg-gradient-to-r from-teal-50 via-white to-blue-50 border-b border-teal-200/30 p-8 mb-8 shadow-lg">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Background Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full z-0">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>
          </div>

          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center relative z-10">
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-3 transition-all duration-500 shadow-lg ${
                  step.id < currentStep 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white transform scale-110' 
                    : step.id === currentStep 
                    ? 'bg-gradient-to-br from-teal-500 to-teal-600 border-teal-500 text-white transform scale-110 shadow-xl ring-4 ring-teal-200' 
                    : 'bg-white border-gray-300 text-gray-400 hover:border-teal-300 hover:text-teal-500'
                }`}>
                  {step.id < currentStep ? (
                    <Icon name="Check" size={20} className="animate-pulse" />
                  ) : step.id === currentStep && step.showPaymentMethods ? (
                    <div className="flex items-center space-x-1">
                      <img 
                        src="/assets/brands/69-691715_mtn-mm-logo-generic-mtn-mobile-money-logo.svg" 
                        alt="MTN" 
                        className="h-4 w-auto"
                      />
                      <img 
                        src="/assets/brands/Orange_Money-Logo.wine.svg" 
                        alt="Orange" 
                        className="h-4 w-auto"
                      />
                    </div>
                  ) : (
                    <Icon name={step.icon} size={20} />
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-4 text-center">
                  <span className={`text-sm font-bold block ${
                    step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  <span className={`text-xs mt-1 block ${
                    step.id <= currentStep ? 'text-teal-600' : 'text-gray-400'
                  }`}>
                    Step {step.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile step indicator */}
        <div className="sm:hidden mt-6 text-center">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                {steps[currentStep - 1]?.showPaymentMethods ? (
                  <div className="flex items-center space-x-1">
                    <img 
                      src="/assets/brands/69-691715_mtn-mm-logo-generic-mtn-mobile-money-logo.svg" 
                      alt="MTN" 
                      className="h-3 w-auto"
                    />
                    <img 
                      src="/assets/brands/Orange_Money-Logo.wine.svg" 
                      alt="Orange" 
                      className="h-3 w-auto"
                    />
                  </div>
                ) : (
                  <Icon name={steps[currentStep - 1]?.icon} size={16} />
                )}
              </div>
              <span className="text-lg font-bold">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <p className="text-teal-100 font-medium">
              {steps[currentStep - 1]?.label}
            </p>
            {steps[currentStep - 1]?.showPaymentMethods && (
              <div className="mt-3 flex items-center justify-center space-x-2">
                <span className="text-xs text-teal-200">Payment Methods:</span>
                <div className="flex items-center space-x-2">
                  <img 
                    src="/assets/brands/69-691715_mtn-mm-logo-generic-mtn-mobile-money-logo.svg" 
                    alt="MTN Mobile Money" 
                    className="h-4 w-auto"
                  />
                  <img 
                    src="/assets/brands/Orange_Money-Logo.wine.svg" 
                    alt="Orange Money" 
                    className="h-4 w-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-teal-200">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-teal-700">
              {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}% Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutProgress;