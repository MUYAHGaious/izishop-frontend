import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';


const PaymentForm = ({ onBack, formData, setFormData }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    {
      id: 'mtn-momo',
      name: 'MTN Mobile Money',
      icon: 'Smartphone',
      description: 'Payez avec votre compte MTN MoMo',
      logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100',
      popular: true
    },
    {
      id: 'orange-money',
      name: 'Orange Money',
      icon: 'Smartphone',
      description: 'Payez avec votre compte Orange Money',
      logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100'
    },
    {
      id: 'visa-card',
      name: 'Carte Visa',
      icon: 'CreditCard',
      description: 'Cartes de crédit/débit internationales',
      logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100'
    }
  ];

  const total = 1430000; // From previous calculation

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
    setPaymentDetails({});
    setErrors({});
  };

  const validatePaymentDetails = () => {
    const newErrors = {};

    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = "Veuillez sélectionner un mode de paiement";
    }

    if (selectedPaymentMethod === 'mtn-momo' || selectedPaymentMethod === 'orange-money') {
      if (!paymentDetails.phoneNumber) {
        newErrors.phoneNumber = "Numéro de téléphone requis";
      } else {
        const phoneRegex = /^(\+237|237)?[67]\d{8}$/;
        if (!phoneRegex.test(paymentDetails.phoneNumber.replace(/\s/g, ''))) {
          newErrors.phoneNumber = "Format de téléphone invalide";
        }
      }
    }

    if (selectedPaymentMethod === 'visa-card') {
      if (!paymentDetails.cardNumber) newErrors.cardNumber = "Numéro de carte requis";
      if (!paymentDetails.expiryDate) newErrors.expiryDate = "Date d'expiration requise";
      if (!paymentDetails.cvv) newErrors.cvv = "CVV requis";
      if (!paymentDetails.cardName) newErrors.cardName = "Nom sur la carte requis";
    }

    if (!termsAccepted) {
      newErrors.terms = "Vous devez accepter les conditions générales";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validatePaymentDetails()) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, this would integrate with Tranzak API
      console.log('Processing payment with:', {
        method: selectedPaymentMethod,
        details: paymentDetails,
        amount: total,
        orderNotes
      });
      
      // Redirect to success page
      window.location.href = '/order-success';
    } catch (error) {
      console.error('Payment failed:', error);
      setErrors({ payment: 'Erreur de paiement. Veuillez réessayer.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedPaymentMethod) {
      case 'mtn-momo': case'orange-money':
        return (
          <div className="space-y-4">
            <Input
              label="Numéro de Téléphone"
              type="tel"
              placeholder="+237 6XX XXX XXX"
              value={paymentDetails.phoneNumber || ''}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
              error={errors.phoneNumber}
              required
            />
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Info" size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">Instructions de Paiement</span>
              </div>
              <p className="text-xs text-primary">
                Vous recevrez un message de confirmation sur votre téléphone pour autoriser le paiement de {formatCurrency(total)}.
              </p>
            </div>
          </div>
        );

      case 'visa-card':
        return (
          <div className="space-y-4">
            <Input
              label="Numéro de Carte"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={paymentDetails.cardNumber || ''}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
              error={errors.cardNumber}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date d'Expiration"
                type="text"
                placeholder="MM/AA"
                value={paymentDetails.expiryDate || ''}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                error={errors.expiryDate}
                required
              />
              <Input
                label="CVV"
                type="text"
                placeholder="123"
                value={paymentDetails.cvv || ''}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                error={errors.cvv}
                required
              />
            </div>
            <Input
              label="Nom sur la Carte"
              type="text"
              placeholder="JEAN BAPTISTE MBALLA"
              value={paymentDetails.cardName || ''}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardName: e.target.value }))}
              error={errors.cardName}
              required
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
        <h2 className="text-xl font-semibold text-foreground mb-6">Paiement</h2>

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Choisissez votre mode de paiement</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-micro hover-scale ${
                  selectedPaymentMethod === method.id
                    ? 'border-primary bg-primary/5' :'border-border bg-surface hover:border-primary/20'
                }`}
                onClick={() => handlePaymentMethodSelect(method.id)}
              >
                {method.popular && (
                  <div className="absolute -top-2 left-4 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                    Populaire
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedPaymentMethod === method.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon name={method.icon} size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{method.name}</h4>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPaymentMethod === method.id
                      ? 'border-primary bg-primary' :'border-border bg-surface'
                  }`}>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.paymentMethod && (
            <p className="text-error text-sm mt-2">{errors.paymentMethod}</p>
          )}
        </div>

        {/* Payment Form */}
        {selectedPaymentMethod && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="font-medium text-foreground mb-4">Détails de Paiement</h4>
            {renderPaymentForm()}
          </div>
        )}

        {/* Order Notes */}
        <div className="mb-6">
          <Input
            label="Notes de Commande (Optionnel)"
            type="text"
            placeholder="Instructions spéciales pour votre commande"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>

        {/* Escrow Information */}
        <div className="mb-6 p-4 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Shield" size={20} className="text-success" />
            <span className="font-medium text-success">Protection Escrow</span>
          </div>
          <p className="text-sm text-success">
            Votre paiement est sécurisé par notre système d'escrow. Les fonds ne seront libérés au vendeur qu'après confirmation de la livraison.
          </p>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-6">
          <Checkbox
            label="J'accepte les conditions générales et la politique de confidentialité"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            error={errors.terms}
            required
          />
        </div>

        {/* Order Total */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">Total à Payer</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="Lock" size={14} />
            <span>SSL Sécurisé</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="Shield" size={14} />
            <span>Tranzak Certifié</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="CheckCircle" size={14} />
            <span>Paiement Sécurisé</span>
          </div>
        </div>

        {errors.payment && (
          <div className="mb-4 p-3 bg-error/10 rounded-lg border border-error/20">
            <p className="text-error text-sm">{errors.payment}</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Retour
          </Button>
          
          <Button
            variant="default"
            onClick={handlePlaceOrder}
            disabled={!selectedPaymentMethod || !termsAccepted}
            loading={isProcessing}
            iconName="CreditCard"
            iconPosition="left"
            className="min-w-40"
          >
            {isProcessing ? 'Traitement...' : 'Finaliser la Commande'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;