import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import tranzakService from '../../../services/tranzakService';
import { showToast } from '../../../components/ui/Toast';
import api from '../../../services/api';


const PaymentForm = forwardRef(({ formData, setFormData }, ref) => {
  const { cartItems, cartTotal, clearCart } = useCart();
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

  // Calculate totals from cart items (same as OrderReviewForm)
  const subtotal = cartItems && cartItems.length > 0 
    ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : 0;
  const deliveryFee = formData.deliveryCost || 0;
  const taxRate = 0.1925; // 19.25% TVA Cameroun
  const taxes = subtotal * taxRate;
  const total = subtotal + deliveryFee + taxes;
  
  // Debug logging
  console.log('PaymentForm totals:', {
    cartTotal,
    subtotal,
    deliveryFee,
    taxes,
    total,
    cartItems: cartItems,
    cartItemsLength: cartItems?.length
  });

  useEffect(() => {
    loadPaymentMethods();
    
    // Initialize form data for stepper validation
    setFormData(prev => ({
      ...prev,
      selectedPaymentMethod: prev.selectedPaymentMethod || '',
      termsAccepted: prev.termsAccepted || false,
      paymentDetails: prev.paymentDetails || {}
    }));
  }, []);

  // Expose handlePlaceOrder method to parent component
  useImperativeHandle(ref, () => ({
    handlePlaceOrder
  }));

  const loadPaymentMethods = async () => {
    setIsLoadingMethods(true);
    try {
      // For now, use static payment methods to ensure they always load
      // TODO: Replace with actual API call when tranzakService is stable
      // const methods = await tranzakService.getPaymentMethods();

      const formattedMethods = [
        {
          id: 'mtn_momo',
          name: 'MTN Mobile Money',
          icon: 'MTN',
          description: 'Pay securely with your MTN Mobile Money account',
          popular: true
        },
        {
          id: 'orange_money',
          name: 'Orange Money',
          icon: 'Orange',
          description: 'Pay securely with your Orange Money account'
        },
        {
          id: 'visa',
          name: 'Visa Card',
          icon: 'Visa',
          description: 'Pay with your Visa debit or credit card'
        },
        {
          id: 'mastercard',
          name: 'Mastercard',
          icon: 'Mastercard',
          description: 'Pay with your Mastercard debit or credit card'
        }
      ];

      console.log('Setting payment methods:', formattedMethods);
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
    console.log('Payment method selected:', methodId);
    setSelectedPaymentMethod(methodId);
    setPaymentDetails({});
    setErrors({});
    
    // Update parent form data for stepper validation
    setFormData(prev => ({
      ...prev,
      selectedPaymentMethod: methodId
    }));
    console.log('Updated formData.selectedPaymentMethod to:', methodId);
  };

  const validatePaymentDetails = () => {
    const newErrors = {};

    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    if (selectedPaymentMethod === 'mtn_momo' || selectedPaymentMethod === 'orange_money') {
      if (!paymentDetails.phoneNumber) {
        newErrors.phoneNumber = "Phone number required";
      } else {
        const phoneRegex = /^(\+237|237)?[67]\d{8}$/;
        if (!phoneRegex.test(paymentDetails.phoneNumber.replace(/\s/g, ''))) {
          newErrors.phoneNumber = "Invalid phone format";
        }
      }
    }

    if (selectedPaymentMethod === 'visa' || selectedPaymentMethod === 'mastercard') {
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
    console.log('🚀 handlePlaceOrder called');
    console.log('Selected payment method:', selectedPaymentMethod);
    console.log('Payment details:', paymentDetails);
    console.log('Terms accepted:', termsAccepted);
    
    if (!validatePaymentDetails()) {
      console.log('❌ Payment validation failed');
      return;
    }
    
    console.log('✅ Payment validation passed');

    setIsProcessing(true);

    try {
      // Prepare payment data
      const paymentData = {
        amount: total,
        currency: 'XAF',
        description: `IziShopin Order - ${cartItems?.length || 0} items (${formatCurrency(total)})`,
        customerEmail: user?.email || formData.email,
        customerPhone: formData.phone,
        customerName: formData.fullName,
        reference: `ORDER_${Date.now()}_${user?.id || 'guest'}`,
        orderId: `ORDER_${Date.now()}`,
        customerId: user?.id,
        metadata: {
          items: (cartItems || []).map(item => ({
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
          phone: paymentDetails.phoneNumber,
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
      if (paymentResult.status === 'success') {
        showToast(t('payment.success'), 'success');

        // Save order to backend
        try {
          const orderData = {
            items: (cartItems || []).map(item => ({
              product_id: item.productId || item.id,
              quantity: item.quantity
            })),
            shipping_address: `${formData.address}, ${formData.city}, ${formData.region} ${formData.postalCode}`,
            payment_method: selectedPaymentMethod,
            payment_reference: paymentResult.reference || paymentResult.transaction_id,
            total_amount: total,
            delivery_instructions: formData.deliveryInstructions || orderNotes
          };

          console.log('🔍 Creating order with data:', orderData);
          const orderResponse = await api.createOrder(orderData);
          console.log('✅ Order created successfully:', orderResponse);

        } catch (orderError) {
          console.error('❌ Failed to save order to backend:', orderError);
          // Still proceed with success flow, but log the error
          showToast('Payment successful, but order saving failed. Please contact support.', 'warning');
        }

        // Clear cart and checkout data after successful payment
        clearCart();
        localStorage.removeItem('checkoutData');
        localStorage.removeItem('checkoutFormData');

        // Redirect to success page with total amount
        window.location.href = `/order-success?ref=${paymentResult.reference || paymentResult.transaction_id}&status=completed&amount=${total}&transaction_id=${paymentResult.transaction_id || paymentResult.reference}`;
      } else if (paymentResult.status === 'pending') {
        showToast('Payment is being processed. Please wait for confirmation.', 'info');

        // Don't clear cart yet for pending payments
        // localStorage.removeItem('checkoutData');
        // localStorage.removeItem('checkoutFormData');

        // Redirect to pending page
        window.location.href = `/order-pending?ref=${paymentResult.reference || paymentResult.transaction_id}&status=pending`;
      } else {
        throw new Error(paymentResult.message || t('payment.failed'));
      }
    } catch (error) {
      console.error('Payment processing error:', error);

      let errorMessage = t('payment.generalError');
      
      // Handle specific Tranzak authentication errors
      if (error.message && error.message.includes('Failed to fetch')) {
        // Check if we're in development mode
        if (import.meta.env.MODE === 'development' || import.meta.env.DEV) {
          console.log('🚀 Development mode: Simulating successful payment');
          errorMessage = 'Development mode: Payment simulated successfully!';
          
        // Simulate successful payment in development
        setTimeout(() => {
          showToast('Payment completed successfully! (Development Mode)', 'success');
          clearCart();
          localStorage.removeItem('checkoutData');
          localStorage.removeItem('checkoutFormData');
          window.location.href = `/order-success?ref=DEV_${Date.now()}&status=completed`;
        }, 1000);
          
          return; // Don't show error, simulate success instead
        } else {
          errorMessage = 'Payment service is currently unavailable. Please try again later or contact support.';
        }
      } else if (error.message && error.message.includes('Authentication Error')) {
        errorMessage = 'Payment service authentication failed. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ payment: errorMessage });
      showToast(errorMessage, 'error');
      
      // Redirect to failed page for payment errors
      setTimeout(() => {
        window.location.href = `/order-failed?error=${encodeURIComponent(errorMessage)}&status=failed`;
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedPaymentMethod) {
      case 'mtn_momo':
      case 'orange_money':
        return (
          <div className="space-y-4">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+237 6XX XXX XXX or 6XX XXX XXX"
              value={paymentDetails.phoneNumber || ''}
              onChange={(e) => {
                setPaymentDetails(prev => ({ ...prev, phoneNumber: e.target.value }));
                // Update parent form data for stepper validation
                setFormData(prev => ({
                  ...prev,
                  paymentDetails: { ...prev.paymentDetails, phoneNumber: e.target.value }
                }));
              }}
              error={errors.phoneNumber}
              required
            />
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Info" size={16} className="text-teal-600" />
                <span className="text-sm font-medium text-teal-700">Payment Instructions</span>
              </div>
              <p className="text-xs text-teal-600">
                You will receive a confirmation message on your phone to authorize the payment of <strong>{formatCurrency(total)}</strong>.
              </p>
            </div>
          </div>
        );

      case 'visa':
      case 'mastercard':
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
    <div className="w-full">
      <div className="text-center mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-2 rounded-lg">
            <Icon name="CreditCard" size={20} className="text-green-600" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Secure Payment</h2>
        </div>
        <p className="text-sm text-gray-600">Choose your payment method to complete your order</p>
      </div>

      <div className="space-y-3 md:space-y-4">
        {/* Payment Methods Section */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-3 md:px-4 py-2 md:py-3 border-b border-green-200">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 flex items-center space-x-2">
              <Icon name="CreditCard" size={16} className="text-green-600" />
              <span>Payment Method</span>
            </h3>
          </div>

          <div className="p-3 md:p-4">
            <div className="space-y-3 md:space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`relative p-3 md:p-4 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedPaymentMethod === method.id
                      ? 'border-green-400 bg-green-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                  onClick={() => handlePaymentMethodSelect(method.id)}
                >
                  {method.popular && (
                    <div className="absolute -top-2 left-3 md:left-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 md:px-3 py-1 rounded-full font-medium shadow-md">
                      Popular Choice
                    </div>
                  )}

                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 ${
                      selectedPaymentMethod === method.id
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {(() => {
                        console.log('Rendering icon for method:', method.name, 'icon:', method.icon);

                        if (method.id === 'mtn_momo') {
                          return (
                            <img
                              src="/assets/brands/69-691715_mtn-mm-logo-generic-mtn-mobile-money-logo.svg"
                              alt="MTN Mobile Money"
                              className="w-8 h-8 md:w-10 md:h-10 object-contain"
                            />
                          );
                        } else if (method.id === 'orange_money') {
                          return (
                            <img
                              src="/assets/brands/Orange_Money-Logo.wine.svg"
                              alt="Orange Money"
                              className="w-8 h-8 md:w-10 md:h-10 object-contain"
                            />
                          );
                        } else if (method.id === 'visa') {
                          return (
                            <svg width="32" height="20" viewBox="0 0 50 30" fill="none" className="md:w-10 md:h-6">
                              <rect width="50" height="30" rx="6" fill="#1A1F71"/>
                              <text x="25" y="20" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="bold">VISA</text>
                            </svg>
                          );
                        } else if (method.id === 'mastercard') {
                          return (
                            <svg width="32" height="20" viewBox="0 0 50 30" fill="none" className="md:w-10 md:h-6">
                              <rect width="50" height="30" rx="6" fill="#EB001B"/>
                              <circle cx="18" cy="15" r="9" fill="#EB001B"/>
                              <circle cx="32" cy="15" r="9" fill="#F79E1B"/>
                              <path d="M25 6c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9z" fill="#FF5F00"/>
                            </svg>
                          );
                        } else {
                          return <Icon name={method.icon} size={24} />;
                        }
                      })()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">{method.name}</h4>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{method.description}</p>
                    </div>

                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      selectedPaymentMethod === method.id
                        ? 'border-green-500 bg-green-500 shadow-md'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {selectedPaymentMethod === method.id && (
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.paymentMethod && (
              <p className="text-red-500 text-xs md:text-sm mt-3 flex items-center space-x-1">
                <Icon name="AlertCircle" size={14} md:size={16} />
                <span>{errors.paymentMethod}</span>
              </p>
            )}
          </div>
        </div>

        {/* Payment Details Section */}
        {selectedPaymentMethod && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="bg-blue-50 px-3 py-2 border-b border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <Icon name="Edit" size={16} className="text-blue-600" />
                <span>Payment Details</span>
              </h3>
            </div>
            <div className="p-3">
              {renderPaymentForm()}
            </div>
          </div>
        )}

        {/* Order Notes Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="bg-purple-50 px-3 py-2 border-b border-purple-200">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <Icon name="MessageSquare" size={16} className="text-purple-600" />
              <span>Order Notes (Optional)</span>
            </h3>
          </div>
          <div className="p-3">
            <Input
              label=""
              type="text"
              placeholder="Special instructions for your order"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Order Total Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <Icon name="Calculator" size={16} className="text-gray-600" />
              <span>Total Amount</span>
            </h3>
          </div>
          <div className="p-3">
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subtotal ({cartItems?.length || 0} items)</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Delivery Fee</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tax (19.25%)</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(taxes)}</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-700">Total to Pay</span>
              <span className="text-xl font-bold text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>
            {/* Security Indicators */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center space-x-1 p-2 bg-green-50 rounded border border-green-200">
                <Icon name="Lock" size={12} className="text-green-600" />
                <span className="text-xs font-medium text-green-700">SSL</span>
              </div>
              <div className="flex items-center space-x-1 p-2 bg-blue-50 rounded border border-blue-200">
                <Icon name="Shield" size={12} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Tranzak</span>
              </div>
              <div className="flex items-center space-x-1 p-2 bg-purple-50 rounded border border-purple-200">
                <Icon name="CheckCircle" size={12} className="text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow Protection Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-200">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
              <Icon name="Shield" size={16} className="text-emerald-600" />
              <span>Escrow Protection</span>
            </h3>
          </div>
          <div className="p-3">
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Icon name="ShieldCheck" size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 mb-2 text-sm">
                  Your payment is fully protected by our secure escrow system.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center space-x-2">
                    <Icon name="Check" size={12} className="text-emerald-500 flex-shrink-0" />
                    <span>Funds held securely until delivery</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="Check" size={12} className="text-emerald-500 flex-shrink-0" />
                    <span>Full refund protection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="Check" size={12} className="text-emerald-500 flex-shrink-0" />
                    <span>Dispute resolution support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <Checkbox
            label="I accept the terms and conditions and privacy policy"
            checked={termsAccepted}
            onChange={(e) => {
              console.log('Terms checkbox changed:', e.target.checked);
              setTermsAccepted(e.target.checked);
              // Update parent form data for stepper validation
              setFormData(prev => ({
                ...prev,
                termsAccepted: e.target.checked
              }));
              console.log('Updated formData.termsAccepted to:', e.target.checked);
            }}
            error={errors.terms}
            required
          />
        </div>

        {errors.payment && (
          <div className="bg-white rounded-xl md:rounded-2xl border border-red-200 overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex items-center space-x-2 md:space-x-3 p-3 md:p-4 bg-red-50 rounded-lg md:rounded-xl border border-red-200">
                <Icon name="AlertCircle" size={16} md:size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-medium text-sm md:text-base">{errors.payment}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default PaymentForm;