import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Stepper, { Step } from '../../components/ui/Stepper';
import DeliveryAddressForm from './components/DeliveryAddressForm';
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

  const [validationErrors, setValidationErrors] = useState({});

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('checkoutFormData');
    const checkoutData = localStorage.getItem('checkoutData');

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error loading saved checkout data:', error);
      }
    }

    // Load cart data from shopping cart
    if (checkoutData) {
      try {
        const parsedCheckoutData = JSON.parse(checkoutData);
        console.log('Loaded checkout data from cart:', parsedCheckoutData);

        // Update form data with delivery option and promo code if available
        setFormData(prev => ({
          ...prev,
          deliveryOption: parsedCheckoutData.deliveryOption || prev.deliveryOption,
          promoCode: parsedCheckoutData.promoCode || prev.promoCode,
          cartItems: parsedCheckoutData.items || []
        }));
      } catch (error) {
        console.error('Error loading cart checkout data:', error);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
  }, [formData]);

  // Clear validation errors when form data changes (user is filling the form)
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      // Check if the current step is now valid
      const currentStep = 1; // We'll determine this based on the current step
      if (validateStep(currentStep)) {
        setValidationErrors({});
      }
    }
  }, [formData, validationErrors]);

  const validateStep = (step) => {
    console.log('Validating step:', step, 'Form data:', formData);
    switch (step) {
      case 1:
        // Include all required fields from DeliveryAddressForm
        const step1Valid = formData.fullName && formData.phone && formData.address && formData.city && formData.region && formData.postalCode;
        console.log('Step 1 validation:', step1Valid, {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          region: formData.region,
          postalCode: formData.postalCode
        });
        return step1Valid;
      case 2:
        // Review step - validate that step 1 is still valid
        const step2Valid = formData.fullName && formData.phone && formData.address && formData.city && formData.region && formData.postalCode;
        console.log('Step 2 validation:', step2Valid, '(review step - checking step 1 data)');
        return step2Valid;
      case 3:
        // Validate payment step - check if payment method is selected and terms are accepted
        const hasPaymentMethod = formData.selectedPaymentMethod;
        const hasTermsAccepted = formData.termsAccepted;
        
        // Additional validation for mobile money payments
        let hasRequiredPaymentDetails = true;
        if (formData.selectedPaymentMethod === 'mtn_momo' || formData.selectedPaymentMethod === 'orange_money') {
          hasRequiredPaymentDetails = formData.paymentDetails?.phoneNumber && formData.paymentDetails.phoneNumber.trim().length > 0;
        }
        
        const paymentValid = Boolean(hasPaymentMethod) && Boolean(hasTermsAccepted) && Boolean(hasRequiredPaymentDetails);
        console.log('Step 3 validation:', paymentValid, {
          selectedPaymentMethod: formData.selectedPaymentMethod,
          termsAccepted: formData.termsAccepted,
          paymentDetails: formData.paymentDetails,
          hasRequiredPaymentDetails,
          hasPaymentMethod: Boolean(hasPaymentMethod),
          hasTermsAccepted: Boolean(hasTermsAccepted),
          hasRequiredPaymentDetailsBool: Boolean(hasRequiredPaymentDetails)
        });
        return paymentValid;
      default:
        console.log('Default validation: true');
        return true;
    }
  };

  const getValidationErrors = (step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!formData.fullName) errors.fullName = 'Full name is required';
        if (!formData.phone) errors.phone = 'Phone number is required';
        if (!formData.address) errors.address = 'Address is required';
        if (!formData.city) errors.city = 'City is required';
        if (!formData.region) errors.region = 'Region is required';
        if (!formData.postalCode) errors.postalCode = 'Postal code is required';
        break;
      case 2:
        // Review step - check step 1 data
        if (!formData.fullName) errors.fullName = 'Full name is required';
        if (!formData.phone) errors.phone = 'Phone number is required';
        if (!formData.address) errors.address = 'Address is required';
        if (!formData.city) errors.city = 'City is required';
        if (!formData.region) errors.region = 'Region is required';
        if (!formData.postalCode) errors.postalCode = 'Postal code is required';
        break;
      case 3:
        if (!formData.selectedPaymentMethod) errors.paymentMethod = 'Please select a payment method';
        if (!formData.termsAccepted) errors.terms = 'You must accept the terms and conditions';
        if ((formData.selectedPaymentMethod === 'mtn_momo' || formData.selectedPaymentMethod === 'orange_money') && 
            (!formData.paymentDetails?.phoneNumber || formData.paymentDetails.phoneNumber.trim().length === 0)) {
          errors.phoneNumber = 'Phone number is required for mobile money payments';
        }
        break;
    }
    
    return errors;
  };

  const handleStepChange = (newStep) => {
    console.log('handleStepChange called with newStep:', newStep);
    
    // Validate current step before allowing progression
    if (newStep > 1 && !validateStep(newStep - 1)) {
      console.log('Step validation failed, preventing progression');
      
      // Set validation errors to show user what's missing
      const currentStep = newStep - 1;
      const errors = getValidationErrors(currentStep);
      setValidationErrors(errors);
      
      // Show error message
      alert(`Please complete all required fields before proceeding:\n\n${Object.values(errors).join('\n')}`);
      
      return false;
    }
    
    // Clear validation errors if step is valid
    setValidationErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  };

  const paymentFormRef = useRef(null);

  const handleCheckoutComplete = () => {
    console.log('🎯 handleCheckoutComplete called');
    console.log('Payment form ref:', paymentFormRef.current);
    
    // Trigger payment processing when Complete button is clicked
    if (paymentFormRef.current && paymentFormRef.current.handlePlaceOrder) {
      console.log('✅ Calling handlePlaceOrder');
      paymentFormRef.current.handlePlaceOrder();
    } else {
      console.log('❌ Payment form ref or handlePlaceOrder not available');
    }
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

              {/* Validation Error Display */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="AlertCircle" size={20} className="text-red-600" />
                    <h3 className="text-lg font-semibold text-red-800">Please complete the following:</h3>
                  </div>
                  <ul className="space-y-1">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field} className="text-sm text-red-700 flex items-center space-x-2">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                  <OrderReviewForm
                    formData={formData}
                    setFormData={setFormData}
                  />
                </Step>
                <Step>
                  <PaymentForm
                    ref={paymentFormRef}
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