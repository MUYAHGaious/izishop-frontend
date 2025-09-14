import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Stepper, { Step } from '../../components/ui/Stepper';
import DeliveryAddressForm from './components/DeliveryAddressForm';
import DeliveryOptionsForm from './components/DeliveryOptionsForm';
import OrderReviewForm from './components/OrderReviewForm';
import PaymentForm from './components/PaymentForm';
import Icon from '../../components/AppIcon';
import { useLanguage } from '../../contexts/LanguageContext';

const Checkout = () => {
  // Safe language hook usage with fallback
  let t;
  try {
    const languageContext = useLanguage();
    t = languageContext.t;
  } catch (error) {
    console.warn('Language context not available, using fallback translations');
    // Fallback translation function
    t = (key) => {
      const fallbacks = {
        'checkout.title': 'Secure Checkout',
        'checkout.securePayment': 'Secure Payment',
        'checkout.secureCheckout': 'Secure Checkout',
        'checkout.completeOrder': 'Complete your order securely',
        'checkout.escrowProtection': 'Escrow Protection',
        'checkout.fastDelivery': 'Fast Delivery',
        'checkout.support247': '24/7 Support',
        'checkout.poweredByTranzak': 'Powered by Tranzak',
        'common.previous': 'Previous',
        'common.next': 'Next',
        'footer.allRightsReserved': 'All rights reserved'
      };
      return fallbacks[key] || key;
    };
  }
  
  const [formData, setFormData] = useState({
    // Address data
    fullName: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    deliveryInstructions: '',

    // Delivery data
    deliveryOption: '',
    deliveryOptionDetails: null,
    deliveryCost: 0,

    // Payment data
    paymentMethod: '',
    paymentDetails: {}
  });

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('checkoutFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error loading saved checkout data:', error);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
  }, [formData]);

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.fullName && formData.phone && formData.address && formData.city;
      case 2:
        return formData.deliveryOption;
      case 3:
        return true; // Review step doesn't need validation
      case 4:
        return formData.paymentMethod;
      default:
        return true;
    }
  };

  const handleStepChange = (newStep) => {
    // Validate current step before allowing progression
    if (newStep > 1 && !validateStep(newStep - 1)) {
      console.log('Step validation failed, preventing progression');
      return false;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  };

  const handleCheckoutComplete = () => {
    // Handle final checkout completion with Tranzak API
    console.log('Checkout completed with data:', formData);
    // TODO: Implement Tranzak payment processing
  };

  return (
    <>
      <Helmet>
        <title>{t('checkout.title')} - IziShop</title>
        <meta name="description" content="Complete your order securely with IziShop. Secure escrow payment and fast delivery in Cameroon." />
        <meta name="keywords" content="checkout, payment, delivery, Cameroon, MTN MoMo, Orange Money" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
        {/* Clean Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Go back"
                >
                  <Icon name="ArrowLeft" size={20} className="text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <Icon name="Package" size={24} className="text-teal-600" />
                  <span className="text-xl font-bold text-gray-900">IziShopin</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  <Icon name="Shield" size={16} className="text-green-500" />
                  <span>{t('checkout.securePayment')}</span>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  <Icon name="Lock" size={16} className="text-green-500" />
                  <span>SSL</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('checkout.secureCheckout')}
                </h1>
                <p className="text-gray-600">
                  {t('checkout.completeOrder')}
                </p>
              </div>

              <Stepper
                initialStep={1}
                onStepChange={handleStepChange}
                onFinalStepCompleted={handleCheckoutComplete}
                backButtonText={t('common.previous')}
                nextButtonText={t('common.next')}
                validateStep={validateStep}
              >
                <Step>
                  <DeliveryAddressForm
                    formData={formData}
                    setFormData={setFormData}
                  />
                </Step>
                <Step>
                  <DeliveryOptionsForm
                    formData={formData}
                    setFormData={setFormData}
                  />
                </Step>
                <Step>
                  <OrderReviewForm
                    formData={formData}
                    setFormData={setFormData}
                  />
                </Step>
                <Step>
                  <PaymentForm
                    formData={formData}
                    setFormData={setFormData}
                  />
                </Step>
              </Stepper>
            </div>
          </div>
        </main>

        {/* Trust Indicators Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Icon name="Shield" size={16} className="text-green-500" />
                <span>{t('checkout.escrowProtection')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Icon name="Truck" size={16} className="text-blue-500" />
                <span>{t('checkout.fastDelivery')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Icon name="Headphones" size={16} className="text-purple-500" />
                <span>{t('checkout.support247')}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} IziShopin. {t('footer.allRightsReserved')}. {t('checkout.poweredByTranzak')}.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Checkout;