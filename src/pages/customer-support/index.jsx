import React, { useState } from 'react';
import AppLayout from '../../components/layouts/AppLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const CustomerSupport = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
    email: '',
    orderNumber: ''
  });

  const categories = [
    { value: 'order', label: 'Order Issues' },
    { value: 'payment', label: 'Payment Problems' },
    { value: 'shipping', label: 'Shipping & Delivery' },
    { value: 'product', label: 'Product Questions' },
    { value: 'account', label: 'Account Management' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const faqItems = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by going to 'My Orders' in your account and clicking on the tracking number provided."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 30 days of delivery. Items must be in original condition with tags attached."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-7 business days. Express shipping takes 1-3 business days."
    },
    {
      question: "How can I change my order?",
      answer: "You can modify your order within 30 minutes of placing it. After that, please contact support."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and mobile money payments."
    }
  ];

  const contactMethods = [
    {
      icon: 'MessageCircle',
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Start Chat',
      available: true,
      response: 'Usually responds in 2-5 minutes'
    },
    {
      icon: 'Mail',
      title: 'Email Support',
      description: 'Send us a detailed message',
      action: 'Send Email',
      available: true,
      response: 'Usually responds within 24 hours'
    },
    {
      icon: 'Phone',
      title: 'Phone Support',
      description: 'Call our support hotline',
      action: 'Call Now',
      available: false,
      response: 'Available Mon-Fri 9AM-6PM'
    },
    {
      icon: 'HelpCircle',
      title: 'Help Center',
      description: 'Browse our knowledge base',
      action: 'Browse FAQs',
      available: true,
      response: 'Self-service 24/7'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Support request:', formData);
    // TODO: Submit to backend
    alert('Your support request has been submitted. We\'ll get back to you soon!');
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-3">
              <Icon name="HelpCircle" size={32} className="text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customer Support</h1>
                <p className="text-muted-foreground mt-1">We're here to help you with any questions or issues</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Mobile-first Tab Navigation */}
          <div className="flex flex-col sm:flex-row gap-2 mb-8">
            <div className="flex overflow-x-auto sm:overflow-visible">
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'contact'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="MessageCircle" size={16} className="inline mr-2" />
                Contact Us
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'faq'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="HelpCircle" size={16} className="inline mr-2" />
                FAQ
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'status'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="Clock" size={16} className="inline mr-2" />
                Support Status
              </button>
            </div>
          </div>

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Contact Methods Grid - Mobile First */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-surface border border-border rounded-lg p-4 sm:p-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon 
                          name={method.icon} 
                          size={24} 
                          className={method.available ? 'text-primary' : 'text-muted-foreground'} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                        <p className="text-xs text-muted-foreground mb-3">{method.response}</p>
                        <Button
                          variant={method.available ? "default" : "outline"}
                          size="sm"
                          fullWidth
                          disabled={!method.available}
                          className="text-xs"
                        >
                          {method.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Form */}
              <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Subject *
                      </label>
                      <Input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Category *
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                        placeholder="Select a category"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Priority
                      </label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => handleInputChange('priority', value)}
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Order Number (Optional)
                      </label>
                      <Input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                        placeholder="e.g., ORD-123456"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please describe your issue in detail..."
                      rows={6}
                      required
                      className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="submit" className="sm:w-auto">
                      <Icon name="Send" size={16} className="mr-2" />
                      Send Message
                    </Button>
                    <Button type="button" variant="outline" className="sm:w-auto">
                      <Icon name="Paperclip" size={16} className="mr-2" />
                      Attach File
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                      <h3 className="font-medium text-foreground mb-2 flex items-center">
                        <Icon name="HelpCircle" size={16} className="mr-2 text-primary" />
                        {item.question}
                      </h3>
                      <p className="text-muted-foreground text-sm pl-6">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Support Status Tab */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-lg p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Support System Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="CheckCircle" size={20} className="text-success" />
                      <span className="font-medium text-foreground">Live Chat</span>
                    </div>
                    <span className="text-sm text-success">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="CheckCircle" size={20} className="text-success" />
                      <span className="font-medium text-foreground">Email Support</span>
                    </div>
                    <span className="text-sm text-success">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="AlertCircle" size={20} className="text-warning" />
                      <span className="font-medium text-foreground">Phone Support</span>
                    </div>
                    <span className="text-sm text-warning">Limited Hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CustomerSupport;