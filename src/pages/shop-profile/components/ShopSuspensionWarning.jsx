import React from 'react';
import Icon from '../../../components/AppIcon';

const ShopSuspensionWarning = ({ shop, isOwner = false }) => {
  if (!shop || shop.status === 'active') return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="AlertTriangle" size={24} className="text-red-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Ban" size={20} className="text-red-600" />
            <h3 className="text-lg font-bold text-red-900">
              {isOwner ? 'Your Shop Has Been Suspended' : 'Shop Currently Suspended'}
            </h3>
          </div>
          
          {isOwner ? (
            // Message for shop owner
            <div className="space-y-4">
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">🚨 IMMEDIATE ATTENTION REQUIRED</h4>
                <p className="text-red-800 mb-3">
                  Your shop has been temporarily suspended and is not visible to customers. 
                  This action was taken to ensure platform safety and compliance.
                </p>
                
                <div className="space-y-2 text-sm text-red-700">
                  <div className="flex items-start space-x-2">
                    <Icon name="XCircle" size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Your shop is hidden from customers</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="XCircle" size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span>You cannot receive new orders</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Existing orders remain active</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">📞 WHAT TO DO NEXT</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Check your notifications for specific suspension reasons</li>
                  <li>• Review our Terms of Service and Community Guidelines</li>
                  <li>• Contact our support team for clarification</li>
                  <li>• Address any outstanding policy violations</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:support@izishopin.com"
                  className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Icon name="Mail" size={16} />
                  <span>Contact Support</span>
                </a>
                <button
                  onClick={() => window.location.href = '/notifications'}
                  className="flex items-center justify-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Icon name="Bell" size={16} />
                  <span>View Notifications</span>
                </button>
              </div>
            </div>
          ) : (
            // Message for visitors/customers
            <div className="space-y-4">
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ SHOP TEMPORARILY UNAVAILABLE</h4>
                <p className="text-red-800 mb-3">
                  This shop is currently under review and temporarily unavailable. 
                  The shop owner has been notified and is working to resolve any issues.
                </p>
                
                <div className="space-y-2 text-sm text-red-700">
                  <div className="flex items-start space-x-2">
                    <Icon name="Clock" size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Shop is temporarily hidden</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="XCircle" size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span>New orders cannot be placed</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icon name="Shield" size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Action taken for platform safety</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🛍️ CONTINUE SHOPPING</h4>
                <p className="text-blue-800 text-sm mb-3">
                  Explore thousands of other amazing shops and products on our platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.location.href = '/shops'}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Icon name="Store" size={16} />
                    <span>Browse Other Shops</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Icon name="Home" size={16} />
                    <span>Go to Homepage</span>
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Questions about this suspension? Contact us at{' '}
                  <a href="mailto:support@izishopin.com" className="text-blue-600 hover:text-blue-700 font-medium">
                    support@izishopin.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopSuspensionWarning;