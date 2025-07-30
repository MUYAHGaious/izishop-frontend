import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ShopSuspensionModal = ({ isOpen, onClose, shop, onConfirm, loading }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [notifyOwner, setNotifyOwner] = useState(true);

  const suspensionReasons = [
    { value: 'policy_violation', label: 'Policy Violation', description: 'Violation of platform policies and terms of service' },
    { value: 'suspicious_activity', label: 'Suspicious Activity', description: 'Suspicious activities detected requiring investigation' },
    { value: 'quality_concerns', label: 'Quality Concerns', description: 'Multiple customer complaints regarding product quality' },
    { value: 'fraudulent_behavior', label: 'Fraudulent Behavior', description: 'Fraudulent activities or misleading product descriptions' },
    { value: 'under_review', label: 'Under Review', description: 'Account under administrative review for compliance verification' },
    { value: 'customer_safety', label: 'Customer Safety', description: 'Potential customer safety concerns with listed products' },
    { value: 'payment_issues', label: 'Payment Issues', description: 'Payment processing irregularities detected' },
    { value: 'content_violation', label: 'Content Violation', description: 'Inappropriate content or imagery in shop listings' },
    { value: 'spam_activities', label: 'Spam Activities', description: 'Spam activities or excessive promotional content' },
    { value: 'security_breach', label: 'Security Breach', description: 'Security concerns requiring immediate investigation' },
    { value: 'custom', label: 'Custom Reason', description: 'Specify a custom reason for suspension' }
  ];

  const handleSubmit = () => {
    const reason = selectedReason === 'custom' ? customReason : selectedReason;
    if (!reason.trim()) return;
    
    onConfirm(reason, notifyOwner);
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setNotifyOwner(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="AlertTriangle" size={24} />
              <div>
                <h2 className="text-xl font-bold">Suspend Shop</h2>
                <p className="text-red-100 text-sm">
                  {shop ? `Suspending: ${shop.name}` : 'Shop Suspension'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="AlertTriangle" size={20} className="text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900">Important Notice</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Suspending this shop will immediately hide it from customers and prevent new orders. 
                    The shop owner will be notified and can contact support for clarification.
                  </p>
                </div>
              </div>
            </div>

            {/* Suspension Reasons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Suspension Reason
              </label>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {suspensionReasons.map((reason) => (
                  <div key={reason.value} className="relative">
                    <label className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReason === reason.value 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-25'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="suspensionReason"
                          value={reason.value}
                          checked={selectedReason === reason.value}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="mt-1 text-red-600 focus:ring-red-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{reason.label}</div>
                          <div className="text-sm text-gray-600">{reason.description}</div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            {selectedReason === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Suspension Reason
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please provide a detailed reason for the suspension..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Notification Option */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notifyOwner}
                  onChange={(e) => setNotifyOwner(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Notify Shop Owner</div>
                  <div className="text-sm text-gray-600">
                    Send a detailed notification to the shop owner about the suspension
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
          <Button 
            onClick={handleClose} 
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !selectedReason || (selectedReason === 'custom' && !customReason.trim())}
            className="bg-red-600 hover:bg-red-700 text-white"
            iconName={loading ? undefined : "Ban"}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Suspending...</span>
              </div>
            ) : (
              'Suspend Shop'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShopSuspensionModal;