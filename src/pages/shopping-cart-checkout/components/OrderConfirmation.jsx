import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const OrderConfirmation = ({ orderData }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="CheckCircle" size={40} color="white" />
      </div>

      {/* Success Message */}
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        Order Confirmed!
      </h2>
      <p className="text-text-secondary mb-8">
        Thank you for your purchase. Your order has been successfully placed and is being processed.
      </p>

      {/* Order Details */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6 text-left">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Order Details
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-text-secondary">Order Number:</span>
            <span className="font-medium text-text-primary">#IZI-{Date.now().toString().slice(-6)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary">Order Date:</span>
            <span className="font-medium text-text-primary">{formatDate(new Date())}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary">Payment Method:</span>
            <span className="font-medium text-text-primary">
              {orderData?.paymentMethod === 'mtn-momo' ? 'MTN Mobile Money' :
               orderData?.paymentMethod === 'orange-money' ? 'Orange Money' :
               orderData?.paymentMethod === 'visa' ? 'Visa Card' :
               orderData?.paymentMethod === 'mastercard' ? 'Mastercard' : 'Card Payment'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Amount:</span>
            <span className="font-semibold text-text-primary">{formatPrice(orderData?.total || 125750)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6 text-left">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Delivery Information
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-text-secondary">Estimated Delivery:</span>
            <span className="font-medium text-text-primary">
              {formatDate(estimatedDelivery).split(',')[0]}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary">Delivery Address:</span>
            <span className="font-medium text-text-primary text-right max-w-[200px]">
              {orderData?.shippingData?.address || '123 Rue de la Paix'}<br />
              {orderData?.shippingData?.city || 'Yaoundé'}, {orderData?.shippingData?.region || 'Centre'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary">Tracking Number:</span>
            <span className="font-medium text-primary">TRK-{Date.now().toString().slice(-8)}</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-8 text-left">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          What's Next?
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-text-primary">Order Processing</p>
              <p className="text-sm text-text-secondary">We're preparing your items for shipment</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-muted border-2 border-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-accent text-xs font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-text-primary">Shipment Notification</p>
              <p className="text-sm text-text-secondary">You'll receive tracking details via email and SMS</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-muted border-2 border-border rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-text-secondary text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-text-primary">Delivery</p>
              <p className="text-sm text-text-secondary">Your order will be delivered to your address</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/product-catalog" className="sm:flex-1">
          <Button variant="outline" fullWidth iconName="ArrowLeft" iconPosition="left">
            Continue Shopping
          </Button>
        </Link>
        
        <Button
          variant="default"
          fullWidth
          iconName="Package"
          iconPosition="left"
          onClick={() => {
            // Track order functionality
            console.log('Track order clicked');
          }}
          className="sm:flex-1"
        >
          Track Your Order
        </Button>
      </div>

      {/* Support */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-text-secondary mb-2">
          Need help with your order?
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <a href="mailto:support@izishop.com" className="text-primary hover:underline flex items-center space-x-1">
            <Icon name="Mail" size={14} />
            <span>Email Support</span>
          </a>
          <span className="text-border">|</span>
          <a href="tel:+237123456789" className="text-primary hover:underline flex items-center space-x-1">
            <Icon name="Phone" size={14} />
            <span>Call Us</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;