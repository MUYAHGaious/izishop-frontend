import React from 'react';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import { useCart } from '../../../contexts/CartContext';

const OrderReviewForm = ({ onNext, onBack, formData, setFormData }) => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCost = formData.deliveryCost || 0;
  const taxRate = 0.1925; // 19.25% TVA Cameroun
  const taxes = subtotal * taxRate;
  const total = subtotal + deliveryCost + taxes;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
            <h2 className="text-xl font-semibold text-foreground mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                  <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1">{item.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center space-x-1">
                        <Icon name="Store" size={14} />
                        <span>{item.seller}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Icon name="Package" size={14} />
                        <span>{item.condition}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            iconName="Minus"
                            className="w-8 h-8"
                          />
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            iconName="Plus"
                            className="w-8 h-8"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => removeFromCart(item.id)}
                          iconName="Trash2"
                          className="text-error hover:text-error"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-lg border border-border p-6 elevation-1 sticky top-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
            
            {/* Delivery Info */}
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Truck" size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {formData.deliveryOptionDetails?.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.deliveryOptionDetails?.timeframe}
              </p>
              <p className="text-xs text-muted-foreground">
                Estimated delivery: {formData.deliveryOptionDetails?.estimatedDate}
              </p>
            </div>

            {/* Address Info */}
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="MapPin" size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Deliver to</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.fullName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formData.address}, {formData.city}
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                <span className="text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className={deliveryCost === 0 ? 'text-success' : 'text-foreground'}>
                  {deliveryCost === 0 ? 'Free' : formatCurrency(deliveryCost)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA (19,25%)</span>
                <span className="text-foreground">{formatCurrency(taxes)}</span>
              </div>
              
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-lg text-foreground">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center space-x-2 mb-4 p-2 bg-success/10 rounded-lg border border-success/20">
              <Icon name="Shield" size={16} className="text-success" />
              <span className="text-xs text-success font-medium">Secure payment with escrow</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={onBack}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back
        </Button>
        
        <Button
          variant="default"
          onClick={onNext}
          iconName="ArrowRight"
          iconPosition="right"
          className="min-w-32"
        >
          Payment
        </Button>
      </div>
    </div>
  );
};

export default OrderReviewForm;