import React from 'react';
import Icon from '../../../components/AppIcon';

const ShippingInfo = ({ product }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center">
        <Icon name="Truck" size={24} className="mr-2 text-teal-600" />
        Shipping & Delivery
      </h3>

      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 space-y-4">
        {/* Delivery Time */}
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Icon name="Clock" size={18} className="text-teal-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Estimated Delivery</h4>
            <p className="text-sm text-gray-600">
              {product.delivery_time || '3-7 business days'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Orders placed before 2PM are shipped the same day
            </p>
          </div>
        </div>

        {/* Shipping Cost */}
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Icon name="DollarSign" size={18} className="text-teal-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Shipping Cost</h4>
            <p className="text-sm text-gray-600">
              {product.shipping_cost
                ? `XAF ${product.shipping_cost.toLocaleString('fr-CM')}`
                : 'Calculated at checkout'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Free shipping on orders over XAF 50,000
            </p>
          </div>
        </div>

        {/* Shipping Locations */}
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Icon name="MapPin" size={18} className="text-teal-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Ships From</h4>
            <p className="text-sm text-gray-600">
              {product.shop?.location || product.shipping_from || 'Cameroon'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Delivery available nationwide
            </p>
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Icon name="Package" size={18} className="text-teal-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Shipping Methods</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Check" size={14} className="text-green-500" />
                <span className="text-gray-600">Standard Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Check" size={14} className="text-green-500" />
                <span className="text-gray-600">Express Delivery (Available)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Check" size={14} className="text-green-500" />
                <span className="text-gray-600">Pickup Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Icon name="Info" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-900 font-medium mb-1">Track Your Order</p>
          <p className="text-blue-700">
            You'll receive a tracking number via email once your order ships.
            Track your package in real-time through your account dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
