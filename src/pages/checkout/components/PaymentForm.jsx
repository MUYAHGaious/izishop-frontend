import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import tranzakService from '../../../services/tranzakService';
import { showToast } from '../../../components/ui/Toast';


const PaymentForm = ({ formData, setFormData }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);

  // Calculate totals from real cart data
  const subtotal = cartTotal || 0;
  const deliveryFee = formData.deliveryCost || 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setIsLoadingMethods(true);
    try {
      const methods = await tranzakService.getPaymentMethods();

      // Map Tranzak methods to our format
      const formattedMethods = [
        {
          id: 'mtn_momo',
          name: 'MTN Mobile Money',
          icon: 'Smartphone',
          description: t('payment.mtnDescription'),
          popular: true
        },
        {
          id: 'orange_money',
          name: 'Orange Money',
          icon: 'Smartphone',
          description: t('payment.orangeDescription')
        },
        {
          id: 'card',
          name: 'Credit/Debit Card',
          icon: 'CreditCard',
          description: t('payment.cardDescription')
        }
      ];

      setPaymentMethods(formattedMethods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      showToast('Failed to load payment methods', 'error');
    } finally {
      setIsLoadingMethods(false);
    }
  };

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
      newErrors.paymentMethod = "Please select a payment method";
    }

    if (selectedPaymentMethod === 'mtn-momo' || selectedPaymentMethod === 'orange-money') {
      if (!paymentDetails.phoneNumber) {
        newErrors.phoneNumber = "Phone number required";
      } else {
        const phoneRegex = /^(\+237|237)?[67]\d{8}$/;
        if (!phoneRegex.test(paymentDetails.phoneNumber.replace(/\s/g, ''))) {
          newErrors.phoneNumber = "Invalid phone format";
        }
      }
    }

    if (selectedPaymentMethod === 'visa-card') {
      if (!paymentDetails.cardNumber) newErrors.cardNumber = "Card number required";
      if (!paymentDetails.expiryDate) newErrors.expiryDate = "Expiry date required";
      if (!paymentDetails.cvv) newErrors.cvv = "CVV required";
      if (!paymentDetails.cardName) newErrors.cardName = "Name on card required";
    }

    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validatePaymentDetails()) return;

    setIsProcessing(true);

    try {
      // Prepare payment data
      const paymentData = {
        amount: total,
        currency: 'XAF',
        description: `IziShopin Order - ${cart.length} items`,
        customerEmail: user?.email || formData.email,
        customerPhone: formData.phone,
        customerName: formData.fullName,
        reference: `ORDER_${Date.now()}_${user?.id || 'guest'}`,
        orderId: `ORDER_${Date.now()}`,
        customerId: user?.id,
        metadata: {
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          deliveryAddress: {
            address: formData.address,
            city: formData.city,
            region: formData.region
          },
          deliveryInstructions: formData.deliveryInstructions,
          orderNotes: orderNotes
        }
      };

      let paymentResult;

      if (selectedPaymentMethod === 'mtn_momo' || selectedPaymentMethod === 'orange_money') {
        // Process direct mobile money charge
        const chargeData = {
          ...paymentData,
          phone: paymentDetails.phone,
          network: selectedPaymentMethod === 'mtn_momo' ? 'mtn' : 'orange'
        };

        paymentResult = await tranzakService.processDirectCharge(chargeData);
      } else {
        // Create payment request for cards and other methods
        paymentResult = await tranzakService.createPaymentRequest(paymentData);

        // For card payments, redirect to payment page
        if (paymentResult.payment_url) {
          window.location.href = paymentResult.payment_url;
          return;
        }
      }

      // Handle successful payment
      if (paymentResult.status === 'success' || paymentResult.status === 'pending') {
        showToast(t('payment.success'), 'success');

        // Save order to backend (TODO: implement actual API call)
        // TODO: Save order to backend
        // await api.post('/orders', orderData);

        // Clear cart and checkout data after successful payment
        clearCart();
        localStorage.removeItem('checkoutData');
        localStorage.removeItem('checkoutFormData');

        // Redirect to success page
        window.location.href = `/order-success?ref=${paymentResult.reference || paymentResult.transaction_id}`;
      } else {
        throw new Error(paymentResult.message || t('payment.failed'));
      }
    } catch (error) {
      console.error('Payment processing error:', error);

      let errorMessage = t('payment.generalError');
      if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ payment: errorMessage });
      showToast(errorMessage, 'error');
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
              label="Phone Number"
              type="tel"
              placeholder="+237 6XX XXX XXX or 6XX XXX XXX"
              value={paymentDetails.phoneNumber || ''}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
              error={errors.phoneNumber}
              required
            />
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Info" size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">Payment Instructions</span>
              </div>
              <p className="text-xs text-primary">
                You will receive a confirmation message on your phone to authorize the payment of {formatCurrency(total)}.
              </p>
            </div>
          </div>
        );

      case 'visa-card':
        return (
          <div className="space-y-4">
            <Input
              label="Card Number"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={paymentDetails.cardNumber || ''}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
              error={errors.cardNumber}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
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
              label="Name on Card"
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
        <h2 className="text-xl font-semibold text-foreground mb-6">Payment</h2>

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Choose your payment method</h3>
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
                    Popular
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
            <h4 className="font-medium text-foreground mb-4">Payment Details</h4>
            {renderPaymentForm()}
          </div>
        )}

        {/* Order Notes */}
        <div className="mb-6">
          <Input
            label="Order Notes (Optional)"
            type="text"
            placeholder="Special instructions for your order"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>

        {/* Escrow Information */}
        <div className="mb-6 p-4 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Shield" size={20} className="text-success" />
            <span className="font-medium text-success">Escrow Protection</span>
          </div>
          <p className="text-sm text-success">
            Your payment is secured by our escrow system. Funds will only be released to the seller after delivery confirmation.
          </p>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-6">
          <Checkbox
            label="I accept the terms and conditions and privacy policy"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            error={errors.terms}
            required
          />
        </div>

        {/* Order Total */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">Total to Pay</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="Lock" size={14} />
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="Shield" size={14} />
            <span>Tranzak Certified</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="CheckCircle" size={14} />
            <span>Secure Payment</span>
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
            Back
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
            {isProcessing ? 'Processing...' : 'Complete Order'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;