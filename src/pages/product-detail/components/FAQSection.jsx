import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FAQSection = ({ product }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Default FAQs with product-specific customization
  const faqs = [
    {
      question: 'Is this product original/authentic?',
      answer: 'Yes, all products sold on IziShop are 100% authentic and sourced directly from authorized distributors or verified sellers. We have strict verification processes to ensure product authenticity.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Mobile Money (MTN, Orange), credit/debit cards, and cash on delivery for select locations. All payments are securely processed through our encrypted payment gateway.'
    },
    {
      question: 'Can I track my order?',
      answer: 'Yes! Once your order ships, you\'ll receive a tracking number via email and SMS. You can track your package in real-time through your account dashboard or using the tracking link provided.'
    },
    {
      question: 'What if the product arrives damaged?',
      answer: 'If your product arrives damaged or defective, contact us within 48 hours of delivery with photos. We\'ll arrange a free return and provide a full refund or replacement, whichever you prefer.'
    },
    {
      question: 'How long does delivery take?',
      answer: `Delivery typically takes ${product.delivery_time || '3-7 business days'} depending on your location. Express delivery options are available for faster shipping. Major cities usually receive orders within 2-3 days.`
    },
    {
      question: 'Can I cancel or modify my order?',
      answer: 'Orders can be cancelled or modified within 2 hours of placement. Once the seller begins processing, cancellations may incur a fee. Contact customer support immediately to request changes.'
    },
    {
      question: 'Is there a warranty on this product?',
      answer: `This product comes with ${product.warranty || 'a 1-year manufacturer warranty'}. The warranty covers manufacturing defects and malfunctions under normal use. Extended warranty options may be available at checkout.`
    },
    {
      question: 'Do you ship outside Cameroon?',
      answer: 'Currently, we only ship within Cameroon. We\'re working on expanding international shipping. Sign up for our newsletter to be notified when international shipping becomes available.'
    },
    {
      question: 'How do I contact the seller?',
      answer: 'You can contact the seller directly through the "Contact Seller" button on this page. You\'ll be able to message them through our secure messaging system. Sellers typically respond within 24 hours.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unused items in original packaging. Returns are free if the item is defective or not as described. For other returns, return shipping costs may apply. See our Returns Policy for full details.'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Icon name="HelpCircle" size={24} className="mr-2 text-teal-600" />
          Frequently Asked Questions
        </h3>
        <span className="text-sm text-gray-500">{faqs.length} Questions</span>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-teal-300 transition-all duration-300"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  openIndex === index
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <span className="font-medium text-gray-900 pt-1">{faq.question}</span>
              </div>
              <Icon
                name={openIndex === index ? 'ChevronUp' : 'ChevronDown'}
                size={20}
                className="text-gray-400 flex-shrink-0 ml-4 mt-1"
              />
            </button>

            {openIndex === index && (
              <div className="px-4 pb-4 pl-16">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border-l-4 border-teal-600">
                  <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Still Have Questions */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white text-center">
        <Icon name="MessageCircle" size={32} className="mx-auto mb-3 opacity-90" />
        <h4 className="font-bold text-lg mb-2">Still have questions?</h4>
        <p className="text-teal-50 mb-4 text-sm">
          Can't find the answer you're looking for? Our customer support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/messages"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-teal-600 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg"
          >
            <Icon name="MessageCircle" size={16} className="mr-2" />
            Contact Seller
          </a>
          <a
            href="/messages"
            className="inline-flex items-center justify-center px-6 py-3 bg-teal-700 text-white rounded-lg font-medium hover:bg-teal-800 transition-all duration-300"
          >
            <Icon name="Headphones" size={16} className="mr-2" />
            Customer Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
