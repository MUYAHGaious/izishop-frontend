import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Footer from '../landing-page/components/Footer';
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <Header />
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <Icon name="HelpCircle" size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Customer Support</h1>
                <p className="text-teal-100 mt-1">We're here to help you with any questions or issues</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-navigation">
          {/* Mobile-first Tab Navigation */}
          <div className="flex flex-col sm:flex-row gap-2 mb-8">
            <div className="flex overflow-x-auto sm:overflow-visible bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/20">
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'contact'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <Icon name="MessageCircle" size={16} className="inline mr-2" />
                Contact Us
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'faq'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <Icon name="HelpCircle" size={16} className="inline mr-2" />
                FAQ
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'status'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <Icon name="Clock" size={16} className="inline mr-2" />
                Support Status
              </button>
            </div>
          </div>

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-8">
              {/* Contact Methods Grid - Mobile First */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-xl ${method.available ? 'bg-gradient-to-br from-teal-100 to-teal-200' : 'bg-gray-100'}`}>
                          <Icon 
                            name={method.icon} 
                            size={24} 
                            className={method.available ? 'text-teal-600' : 'text-gray-400'} 
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                        <p className="text-xs text-teal-600 mb-4 font-medium">{method.response}</p>
                        <Button
                          variant={method.available ? "default" : "outline"}
                          size="sm"
                          fullWidth
                          disabled={!method.available}
                          className={`text-xs ${method.available ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white' : 'border-gray-300 text-gray-500'}`}
                        >
                          {method.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Form */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-3 rounded-xl">
                    <Icon name="Mail" size={24} className="text-teal-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Send us a message</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Subject *
                      </label>
                      <Input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief description of your issue"
                        required
                        className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Category *
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                        placeholder="Select a category"
                        className="focus:ring-2 focus:ring-teal-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Priority
                      </label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => handleInputChange('priority', value)}
                        className="focus:ring-2 focus:ring-teal-500"
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Order Number (Optional)
                      </label>
                      <Input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                        placeholder="e.g., ORD-123456"
                        className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please describe your issue in detail..."
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button type="submit" className="sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      <Icon name="Send" size={16} className="mr-2" />
                      Send Message
                    </Button>
                    <Button type="button" variant="outline" className="sm:w-auto border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400">
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
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-3 rounded-xl">
                    <Icon name="HelpCircle" size={24} className="text-teal-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-6">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-2 rounded-lg mr-3">
                          <Icon name="HelpCircle" size={16} className="text-teal-600" />
                        </div>
                        {item.question}
                      </h3>
                      <p className="text-gray-600 text-sm pl-12">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Support Status Tab */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-3 rounded-xl">
                    <Icon name="Clock" size={24} className="text-teal-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Support System Status</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Icon name="CheckCircle" size={20} className="text-green-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Live Chat</span>
                    </div>
                    <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Icon name="CheckCircle" size={20} className="text-green-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Email Support</span>
                    </div>
                    <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <Icon name="AlertCircle" size={20} className="text-yellow-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Phone Support</span>
                    </div>
                    <span className="text-sm font-medium text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">Limited Hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      
      {/* Footer */}
      <Footer />
      
      <MobileBottomTab />
    </div>
  );
};

export default CustomerSupport;