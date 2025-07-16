import React, { useState } from 'react';
import Input from '../../../components/ui/Input';

import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PaymentForm = ({ onNext, onBack, orderTotal }) => {
  const [paymentMethod, setPaymentMethod] = useState('mtn-momo');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [momoData, setMomoData] = useState({
    phoneNumber: '',
    pin: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    {
      id: 'mtn-momo',
      name: 'MTN Mobile Money',
      description: 'Pay with your MTN MoMo account',
      icon: 'Smartphone',
      popular: true
    },
    {
      id: 'orange-money',
      name: 'Orange Money',
      description: 'Pay with your Orange Money account',
      icon: 'Smartphone'
    },
    {
      id: 'visa',
      name: 'Visa Card',
      description: 'Pay with your Visa credit/debit card',
      icon: 'CreditCard'
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      description: 'Pay with your Mastercard credit/debit card',
      icon: 'CreditCard'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('XAF', 'FCFA');
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMomoInputChange = (e) => {
    const { name, value } = e.target;
    setMomoData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePayment = () => {
    const newErrors = {};

    if (paymentMethod === 'mtn-momo' || paymentMethod === 'orange-money') {
      if (!momoData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      }
      if (!momoData.pin.trim()) {
        newErrors.pin = 'PIN is required';
      }
    } else if (paymentMethod === 'visa' || paymentMethod === 'mastercard') {
      if (!cardData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      }
      if (!cardData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      }
      if (!cardData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      }
      if (!cardData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePayment()) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      onNext({ paymentMethod, paymentData: paymentMethod.includes('momo') ? momoData : cardData });
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Methods */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Payment Method
          </h3>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  paymentMethod === method.id
                    ? 'border-primary bg-primary/5' :'border-border hover:bg-muted'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${
                  paymentMethod === method.id
                    ? 'border-primary bg-primary' :'border-border'
                }`}>
                  {paymentMethod === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                
                <Icon name={method.icon} size={20} className="text-text-secondary mr-3" />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-text-primary">{method.name}</span>
                    {method.popular && (
                      <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-text-secondary">{method.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Payment Details
          </h3>

          {(paymentMethod === 'mtn-momo' || paymentMethod === 'orange-money') && (
            <div className="space-y-4">
              <Input
                label="Phone Number"
                type="tel"
                name="phoneNumber"
                placeholder="+237 6 12 34 56 78"
                value={momoData.phoneNumber}
                onChange={handleMomoInputChange}
                error={errors.phoneNumber}
                required
              />
              
              <Input
                label="PIN"
                type="password"
                name="pin"
                placeholder="Enter your PIN"
                value={momoData.pin}
                onChange={handleMomoInputChange}
                error={errors.pin}
                required
                description="Your PIN will be encrypted and processed securely"
              />

              <div className="bg-accent/10 border border-accent/20 rounded-md p-4">
                <div className="flex items-start space-x-3">
                  <Icon name="Info" size={16} className="text-accent mt-0.5" />
                  <div className="text-sm text-accent-foreground">
                    <p className="font-medium mb-1">How it works:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>You'll receive a USSD prompt on your phone</li>
                      <li>Enter your PIN to authorize the payment</li>
                      <li>Payment will be processed instantly</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(paymentMethod === 'visa' || paymentMethod === 'mastercard') && (
            <div className="space-y-4">
              <Input
                label="Card Number"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={handleCardInputChange}
                error={errors.cardNumber}
                maxLength={19}
                required
              />
              
              <Input
                label="Cardholder Name"
                name="cardholderName"
                placeholder="John Doe"
                value={cardData.cardholderName}
                onChange={handleCardInputChange}
                error={errors.cardholderName}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Date"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={cardData.expiryDate}
                  onChange={handleCardInputChange}
                  error={errors.expiryDate}
                  maxLength={5}
                  required
                />
                
                <Input
                  label="CVV"
                  name="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={handleCardInputChange}
                  error={errors.cvv}
                  maxLength={3}
                  required
                />
              </div>

              <div className="bg-muted rounded-md p-4">
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                  <Icon name="Shield" size={16} className="text-success" />
                  <span>Your card information is encrypted and secure</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Total */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex justify-between items-center text-lg font-semibold text-text-primary">
            <span>Total Amount</span>
            <span>{formatPrice(orderTotal)}</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-success/10 border border-success/20 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Shield" size={16} className="text-success mt-0.5" />
            <div className="text-sm text-success-foreground">
              <p className="font-medium mb-1">Secure Payment</p>
              <p className="text-xs">
                Your payment is protected by 256-bit SSL encryption and processed through Tranzak's secure payment gateway.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            iconName="ArrowLeft"
            iconPosition="left"
            disabled={isProcessing}
            className="sm:w-auto"
          >
            Back to Shipping
          </Button>
          
          <Button
            type="submit"
            variant="default"
            loading={isProcessing}
            iconName="Lock"
            iconPosition="left"
            className="sm:flex-1"
          >
            {isProcessing ? 'Processing Payment...' : `Pay ${formatPrice(orderTotal)}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;