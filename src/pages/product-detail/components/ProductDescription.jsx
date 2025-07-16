import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ProductDescription = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { id: 'description', label: 'Description', icon: 'FileText' },
    { id: 'specifications', label: 'Specifications', icon: 'List' },
    { id: 'shipping', label: 'Shipping', icon: 'Truck' },
    { id: 'warranty', label: 'Warranty', icon: 'Shield' }
  ];

  const renderDescription = () => {
    if (!product?.description) {
      return (
        <div className="text-center py-8">
          <Icon name="FileText" size={48} className="mx-auto mb-4 text-text-secondary" />
          <p className="text-text-secondary">No description available</p>
        </div>
      );
    }

    const shouldTruncate = product.description.length > 500;
    const displayText = shouldTruncate && !isExpanded 
      ? product.description.substring(0, 500) + '...'
      : product.description;

    return (
      <div className="space-y-4">
        <div className="prose prose-sm max-w-none text-foreground">
          <div dangerouslySetInnerHTML={{ __html: displayText.replace(/\n/g, '<br>') }} />
        </div>
        
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:text-primary/80 text-sm font-medium marketplace-transition"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </button>
        )}

        {/* Key Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-foreground mb-3">Key Highlights</h4>
            <ul className="space-y-2">
              {product.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Second-hand Condition Details */}
        {product.isSecondHand && product.conditionDetails && (
          <div className="mt-6 bg-secondary/10 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <Icon name="RefreshCw" size={20} className="mr-2 text-secondary" />
              Condition Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Overall Condition</span>
                <span className="text-sm font-medium text-foreground">{product.condition}</span>
              </div>
              <p className="text-sm text-foreground">{product.conditionDetails}</p>
              
              {product.conditionImages && product.conditionImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-foreground mb-2">Condition Photos</p>
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.conditionImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Condition photo ${index + 1}`}
                        className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSpecifications = () => {
    if (!product?.specifications || product.specifications.length === 0) {
      return (
        <div className="text-center py-8">
          <Icon name="List" size={48} className="mx-auto mb-4 text-text-secondary" />
          <p className="text-text-secondary">No specifications available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {product.specifications.map((spec, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-3 pr-4 text-sm font-medium text-text-secondary w-1/3">
                    {spec.name}
                  </td>
                  <td className="py-3 text-sm text-foreground">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderShipping = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">Shipping Options</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="Truck" size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-foreground">Standard Delivery</p>
                  <p className="text-sm text-text-secondary">2-5 business days</p>
                </div>
              </div>
              <span className="font-medium text-foreground">
                {product?.deliveryFee ? `${product.deliveryFee} XAF` : 'Free'}
              </span>
            </div>
            
            {product?.expressDelivery && (
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Zap" size={20} className="text-warning" />
                  <div>
                    <p className="font-medium text-foreground">Express Delivery</p>
                    <p className="text-sm text-text-secondary">1-2 business days</p>
                  </div>
                </div>
                <span className="font-medium text-foreground">
                  {product.expressDeliveryFee || '2,000'} XAF
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">Shipping Information</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <Icon name="MapPin" size={16} className="text-text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Ships from</p>
                <p className="text-text-secondary">{product?.shipFrom || 'Douala, Cameroon'}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Icon name="Globe" size={16} className="text-text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Ships to</p>
                <p className="text-text-secondary">All regions in Cameroon</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Icon name="Package" size={16} className="text-text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Package dimensions</p>
                <p className="text-text-secondary">{product?.dimensions || 'Standard packaging'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWarranty = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">Warranty Information</h4>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={20} className="text-success" />
              <span className="font-medium text-foreground">
                {product?.warranty || 'Standard Warranty'}
              </span>
            </div>
            
            <p className="text-sm text-text-secondary">
              {product?.warrantyDetails || `This product comes with a standard warranty covering manufacturing defects and normal wear and tear. Warranty period starts from the date of purchase.`}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">Return Policy</h4>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Icon name="RotateCcw" size={16} className="text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Return Window</p>
                <p className="text-sm text-text-secondary">
                  {product?.returnWindow || '7 days from delivery'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Return Conditions</p>
                <ul className="text-sm text-text-secondary space-y-1 mt-1">
                  <li>• Item must be in original condition</li>
                  <li>• Original packaging required</li>
                  <li>• All accessories included</li>
                  <li>• No signs of damage or wear</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Icon name="CreditCard" size={16} className="text-warning mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Refund Process</p>
                <p className="text-sm text-text-secondary">
                  Refunds processed within 3-5 business days after return approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return renderDescription();
      case 'specifications':
        return renderSpecifications();
      case 'shipping':
        return renderShipping();
      case 'warranty':
        return renderWarranty();
      default:
        return renderDescription();
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap marketplace-transition ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-text-secondary hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProductDescription;