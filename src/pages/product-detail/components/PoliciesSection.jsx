import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PoliciesSection = ({ product }) => {
  const [activeTab, setActiveTab] = useState('returns');

  const policies = {
    returns: {
      title: 'Return Policy',
      icon: 'RotateCcw',
      content: [
        {
          heading: '30-Day Return Window',
          text: 'Returns accepted within 30 days of delivery for unused items in original packaging.'
        },
        {
          heading: 'Return Process',
          text: 'Contact seller to initiate return. Provide order number and reason for return.'
        },
        {
          heading: 'Refund Method',
          text: 'Refunds processed within 5-7 business days after receiving returned item.'
        },
        {
          heading: 'Return Shipping',
          text: 'Buyer responsible for return shipping unless item is defective or incorrect.'
        }
      ]
    },
    warranty: {
      title: 'Warranty Information',
      icon: 'Shield',
      content: [
        {
          heading: 'Manufacturer Warranty',
          text: product.warranty || '1-year manufacturer warranty included with purchase.'
        },
        {
          heading: 'What\'s Covered',
          text: 'Manufacturing defects, malfunctions under normal use, and material failures.'
        },
        {
          heading: 'What\'s Not Covered',
          text: 'Physical damage, liquid damage, unauthorized repairs, or misuse of product.'
        },
        {
          heading: 'Claim Process',
          text: 'Contact seller with proof of purchase and defect details to initiate warranty claim.'
        }
      ]
    },
    guarantee: {
      title: 'Buyer Protection',
      icon: 'CheckCircle',
      content: [
        {
          heading: 'Authenticity Guarantee',
          text: 'All products are 100% authentic. We verify sellers and products before listing.'
        },
        {
          heading: 'Money-Back Guarantee',
          text: 'Full refund if item is not as described, counterfeit, or damaged upon arrival.'
        },
        {
          heading: 'Secure Payments',
          text: 'Your payment information is encrypted and secure. We never share your details.'
        },
        {
          heading: 'Dispute Resolution',
          text: 'Our team mediates disputes between buyers and sellers to ensure fair outcomes.'
        }
      ]
    },
    safety: {
      title: 'Safety & Compliance',
      icon: 'AlertTriangle',
      content: [
        {
          heading: 'Product Safety',
          text: 'All products meet applicable safety standards and regulations for Cameroon.'
        },
        {
          heading: 'Age Restrictions',
          text: product.age_restriction || 'No age restrictions apply to this product.'
        },
        {
          heading: 'Usage Guidelines',
          text: 'Please read all product documentation and follow manufacturer guidelines.'
        },
        {
          heading: 'Report Concerns',
          text: 'Contact us immediately if you have safety concerns about this product.'
        }
      ]
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center">
        <Icon name="FileText" size={24} className="mr-2 text-teal-600" />
        Policies & Guarantees
      </h3>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {Object.keys(policies).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === key
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon name={policies[key].icon} size={16} className="mr-2" />
            {policies[key].title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
        <div className="space-y-4">
          {policies[activeTab].content.map((item, index) => (
            <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-200 last:border-0">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Icon name="Check" size={16} className="text-teal-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{item.heading}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 flex items-start space-x-3">
        <Icon name="HelpCircle" size={20} className="text-teal-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-gray-900 font-medium mb-1">Have questions about our policies?</p>
          <p className="text-gray-600">
            Contact our customer support team or the seller directly for clarification on any policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoliciesSection;
