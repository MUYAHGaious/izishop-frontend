import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CheckoutProgress from './components/CheckoutProgress';
import DeliveryAddressForm from './components/DeliveryAddressForm';
import DeliveryOptionsForm from './components/DeliveryOptionsForm';
import OrderReviewForm from './components/OrderReviewForm';
import PaymentForm from './components/PaymentForm';
import Icon from '../../components/AppIcon';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const totalSteps = 4;

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

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DeliveryAddressForm
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 2:
        return (
          <DeliveryOptionsForm
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return (
          <OrderReviewForm
            onNext={handleNext}
            onBack={handleBack}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 4:
        return (
          <PaymentForm
            onBack={handleBack}
            formData={formData}
            setFormData={setFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout - IziShop</title>
        <meta name="description" content="Finalisez votre commande en toute sécurité avec IziShop. Paiement sécurisé avec escrow et livraison rapide au Cameroun." />
        <meta name="keywords" content="checkout, paiement, livraison, Cameroun, MTN MoMo, Orange Money" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Custom Header for Checkout */}
        <header className="bg-surface border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingBag" size={20} color="white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">IziShop</h1>
                  <p className="text-xs text-muted-foreground">Checkout Sécurisé</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Shield" size={16} className="text-success" />
                  <span>Paiement Sécurisé</span>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Lock" size={16} className="text-success" />
                  <span>SSL Crypté</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Indicator */}
        <CheckoutProgress currentStep={currentStep} totalSteps={totalSteps} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderCurrentStep()}
        </main>

        {/* Security Footer */}
        <footer className="bg-surface border-t border-border mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Shield" size={16} className="text-success" />
                  <span>Protection Escrow</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Truck" size={16} className="text-primary" />
                  <span>Livraison Rapide</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Headphones" size={16} className="text-secondary" />
                  <span>Support 24/7</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-xs text-muted-foreground">Partenaires de Paiement:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-5 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">MTN</span>
                  </div>
                  <div className="w-8 h-5 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">OM</span>
                  </div>
                  <div className="w-8 h-5 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">VISA</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} IziShop. Tous droits réservés. Paiements sécurisés par Tranzak.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Checkout;