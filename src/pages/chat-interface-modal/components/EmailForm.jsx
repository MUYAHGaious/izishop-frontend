import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const EmailForm = ({ shop, currentProduct, onEmailSent }) => {
  const [formData, setFormData] = useState({
    subject: currentProduct ? `Inquiry about ${currentProduct.name}` : 'Product Inquiry',
    message: '',
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messageTemplates = [
    "I\'m interested in learning more about this product.",
    "What\'s the current availability and pricing?",
    "Do you offer bulk discounts for large orders?",
    "Can you provide more details about warranty and support?",
    "I\'d like to schedule a visit to your store."
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateClick = (template) => {
    setFormData(prev => ({ ...prev, message: template }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Email sent:', {
      to: shop?.email,
      ...formData,
      productContext: currentProduct
    });

    setIsSubmitting(false);
    onEmailSent();
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary">Your Information</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          <Input
            type="tel"
            placeholder="Phone number (optional)"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Subject
          </label>
          <Input
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            required
          />
        </div>

        {/* Message Templates */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Quick Templates
          </label>
          <div className="flex flex-wrap gap-2">
            {messageTemplates.map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTemplateClick(template)}
                className="px-3 py-1 bg-muted hover:bg-muted-hover text-text-primary rounded-full text-xs transition-colors"
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            className="w-full p-3 border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            required
          />
          <div className="flex justify-between items-center text-xs text-text-secondary">
            <span>{formData.message.length}/500</span>
            <div className="flex items-center gap-1">
              <Icon name="Info" size={12} />
              <span>Include specific details for better assistance</span>
            </div>
          </div>
        </div>

        {/* Product Context */}
        {currentProduct && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background rounded overflow-hidden">
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {currentProduct.name}
                </p>
                <p className="text-xs text-text-secondary">
                  This product will be referenced in your email
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
          iconName={isSubmitting ? "Loader" : "Send"}
          iconPosition="left"
        >
          {isSubmitting ? 'Sending...' : 'Send Email'}
        </Button>
      </form>
    </div>
  );
};

export default EmailForm;