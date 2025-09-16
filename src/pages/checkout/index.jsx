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
    console.log('Validating step:', step, 'Form data:', formData);
    switch (step) {
      case 1:
        const step1Valid = formData.fullName && formData.phone && formData.address && formData.city;
        console.log('Step 1 validation:', step1Valid, {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city
        });
        return step1Valid;
      case 2:
        const step2Valid = formData.deliveryOption;
        console.log('Step 2 validation:', step2Valid, { deliveryOption: formData.deliveryOption });
        return step2Valid;
      case 3:
        console.log('Step 3 validation: true (review step)');
        return true; // Review step doesn't need validation
      case 4:
        const step4Valid = formData.paymentMethod;
        console.log('Step 4 validation:', step4Valid, { paymentMethod: formData.paymentMethod });
        return step4Valid;
      default:
        console.log('Default validation: true');
        return true;
    }
  };

  const handleStepChange = (newStep) => {
    console.log('handleStepChange called with newStep:', newStep);
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

      <div className="min-h-screen bg-gradient-to-r from-teal-50 to-cyan-50">
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

        {/* Payment Partners Section */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Payment Partners</h2>
              <p className="text-gray-600">We accept payments through trusted mobile money services</p>
            </div>
            
            <div className="flex items-center justify-center space-x-16">
              {/* Visa */}
              <div className="flex flex-col items-center space-y-3">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-4">
                  <svg width="60" height="36" viewBox="0 0 50 30" fill="none">
                    <rect width="50" height="30" rx="6" fill="#1A1F71"/>
                    <text x="25" y="20" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="bold">VISA</text>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Visa</span>
              </div>

              {/* Mastercard */}
              <div className="flex flex-col items-center space-y-3">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-4">
                  <svg width="60" height="36" viewBox="0 0 50 30" fill="none">
                    <rect width="50" height="30" rx="6" fill="#EB001B"/>
                    <circle cx="18" cy="15" r="9" fill="#EB001B"/>
                    <circle cx="32" cy="15" r="9" fill="#F79E1B"/>
                    <path d="M25 6c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9z" fill="#FF5F00"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Mastercard</span>
              </div>

              {/* MTN Mobile Money */}
              <div className="flex flex-col items-center space-y-3">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-4">
                  <img 
                    src="/assets/brands/69-691715_mtn-mm-logo-generic-mtn-mobile-money-logo.svg" 
                    alt="MTN Mobile Money" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">MTN Mobile Money</span>
              </div>

              {/* Orange Money */}
              <div className="flex flex-col items-center space-y-3">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-4">
                  <img 
                    src="/assets/brands/Orange_Money-Logo.wine.svg" 
                    alt="Orange Money" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">Orange Money</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
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