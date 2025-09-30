import React from 'react';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import { useCart } from '../../../contexts/CartContext';

const OrderReviewForm = ({ formData, setFormData }) => {
  const { cartItems, updateQuantity, removeFromCart, hasMultipleVendors } = useCart();
  

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCost = formData.deliveryCost || 0;
  const taxRate = 0.1925; // 19.25% TVA Cameroun
  const taxes = subtotal * taxRate;
  const total = subtotal + deliveryCost + taxes;
  const isMultiVendor = hasMultipleVendors();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  

  return (
    <div className="w-full max-w-none">
      <div className="text-center mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
            <Icon name="ShoppingCart" size={20} md:size={24} className="text-blue-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left">Review Your Order</h2>
        </div>
        <p className="text-sm md:text-base text-gray-600 px-4 sm:px-0">Please review your items and delivery details before proceeding to payment</p>
      </div>

      {/* Multi-vendor notice */}
      {isMultiVendor && (
        <div className="mb-6 p-3 bg-teal-50 border border-teal-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Icon name="Info" size={16} className="text-teal-600" />
            <p className="text-sm text-teal-700">
              <strong>Multi-vendor order:</strong> Your order contains items from different vendors. Each vendor will ship their items separately.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 md:space-y-6">
        {/* Cart Items Section */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Icon name="Package" size={16} md:size={20} className="text-gray-600" />
              <span>Your Items ({cartItems.length})</span>
            </h3>
          </div>

          <div className="p-4 md:p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <Icon name="ShoppingCart" size={40} md:size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm md:text-base">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex-shrink-0 overflow-hidden rounded-lg bg-white border border-gray-200">
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base truncate">{item.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
                        {item.shopName && (
                          <span className="flex items-center space-x-1 bg-teal-50 px-2 py-1 rounded-md border border-teal-200">
                            <Icon name="Store" size={12} md:size={14} className="text-teal-600" />
                            <span className="truncate text-teal-700 font-medium">{item.shopName}</span>
                          </span>
                        )}
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.price)} each
                        </span>
                      </div>

                      <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <span className="text-xs md:text-sm text-gray-600">Qty:</span>
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              iconName="Minus"
                              className="w-6 h-6 md:w-8 md:h-8 border-gray-300 text-xs"
                            />
                            <span className="w-6 md:w-8 text-center text-xs md:text-sm font-medium bg-white rounded border border-gray-300 py-1">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              iconName="Plus"
                              className="w-6 h-6 md:w-8 md:h-8 border-gray-300 text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between lg:justify-end space-x-2 md:space-x-3">
                          <span className="font-semibold text-base md:text-lg text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => removeFromCart(item.id)}
                            iconName="Trash2"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 w-6 h-6 md:w-8 md:h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 to-teal-100 px-4 md:px-6 py-3 md:py-4 border-b border-teal-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Icon name="MapPin" size={16} md:size={20} className="text-teal-600" />
              <span>Delivery Details</span>
            </h3>
          </div>

          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Delivery Address */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2 text-sm md:text-base">
                  <Icon name="MapPin" size={14} md:size={16} className="text-gray-600" />
                  <span>Delivery Address</span>
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm md:text-base">{formData.fullName}</p>
                  <p className="text-gray-600 text-sm md:text-base">{formData.phone}</p>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">{formData.address}</p>
                  <p className="text-gray-600 text-sm md:text-base">{formData.city}, {formData.region}</p>
                  {formData.postalCode && <p className="text-gray-600 text-sm md:text-base">{formData.postalCode}</p>}
                </div>
              </div>

              {/* Default Delivery Option (since we removed the step) */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2 text-sm md:text-base">
                  <Icon name="Truck" size={14} md:size={16} className="text-gray-600" />
                  <span>Delivery Method</span>
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm md:text-base">Standard Delivery</p>
                  <p className="text-gray-600 text-sm md:text-base">3-5 business days</p>
                  <p className="text-gray-600 text-sm md:text-base">Free delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 md:px-6 py-3 md:py-4 border-b border-green-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Icon name="Calculator" size={16} md:size={20} className="text-green-600" />
              <span>Order Summary</span>
            </h3>
          </div>

          <div className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm md:text-base">Subtotal ({cartItems.length} items)</span>
                <span className="font-medium text-gray-900 text-sm md:text-base">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm md:text-base">Delivery Fee</span>
                <span className="font-medium text-green-600 text-sm md:text-base">Free</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 text-sm md:text-base">TVA (19.25%)</span>
                <span className="font-medium text-gray-900 text-sm md:text-base">{formatCurrency(taxes)}</span>
              </div>

              <div className="border-t border-gray-200 pt-3 md:pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-xl font-semibold text-gray-900">Total</span>
                  <span className="text-xl md:text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-4 md:mt-6 flex items-center justify-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <Icon name="Shield" size={16} md:size={20} className="text-green-600" />
              <span className="text-xs md:text-sm text-green-700 font-medium text-center">Secure payment with escrow protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReviewForm;