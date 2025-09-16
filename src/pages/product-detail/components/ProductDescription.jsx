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
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="FileText" size={32} className="text-white" />
          </div>
          <p className="text-gray-500">No description available</p>
        </div>
      );
    }

    const shouldTruncate = product.description.length > 500;
    const displayText = shouldTruncate && !isExpanded 
      ? product.description.substring(0, 500) + '...'
      : product.description;

    return (
      <div className="space-y-4">
        <div className="prose prose-sm max-w-none text-gray-700">
          <div dangerouslySetInnerHTML={{ __html: displayText.replace(/\n/g, '<br>') }} />
        </div>
        
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors duration-300"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </button>
        )}

        {/* Key Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Highlights</h4>
            <ul className="space-y-2">
              {product.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Icon name="Check" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Condition Details for Used/Refurbished Items */}
        {(product.condition === 'used' || product.condition === 'refurbished') && (
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Icon name={product.condition === 'refurbished' ? 'RefreshCcw' : 'RefreshCw'} size={20} className="mr-2 text-teal-600" />
              Condition Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Overall Condition</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{product.condition}</span>
              </div>
              {product.conditionDetails ? (
                <p className="text-sm text-gray-700">{product.conditionDetails}</p>
              ) : (
                <p className="text-sm text-gray-700">
                  {product.condition === 'refurbished'
                    ? 'This item has been professionally refurbished and tested to ensure proper functionality.'
                    : 'This is a pre-owned item in good working condition.'}
                </p>
              )}

              {product.conditionImages && product.conditionImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">Condition Photos</p>
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.conditionImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Condition photo ${index + 1}`}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
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
    // Check if we have specifications object (our enhanced format) or empty
    const hasSpecs = product?.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0;
    const hasPhysicalAttributes = product?.weight || product?.materials || product?.manufacturing_location;
    const hasDimensions = product?.dimensions && typeof product.dimensions === 'object' && Object.keys(product.dimensions).length > 0;

    if (!hasSpecs && !hasPhysicalAttributes && !hasDimensions) {
      // Show basic product info when enhanced specs aren't available
      return (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="List" size={32} className="text-white" />
            </div>
            <p className="text-gray-600 mb-4">Detailed specifications not available</p>
            <p className="text-sm text-gray-500">Contact the seller for more product details</p>
          </div>

          {/* Basic Product Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 text-sm font-medium text-gray-600 w-1/3">
                      Product Name
                    </td>
                    <td className="py-3 text-sm text-gray-900">
                      {product?.name || 'N/A'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 text-sm font-medium text-gray-600 w-1/3">
                      Category
                    </td>
                    <td className="py-3 text-sm text-gray-900">
                      {product?.category || 'Not specified'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 text-sm font-medium text-gray-600 w-1/3">
                      Stock Status
                    </td>
                    <td className="py-3 text-sm text-gray-900">
                      {product?.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Product Specifications */}
        {hasSpecs && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Product Specifications</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-sm font-medium text-gray-600 w-1/3 capitalize">
                        {key}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Physical Attributes */}
        {hasPhysicalAttributes && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Physical Attributes</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {product.weight && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-sm font-medium text-gray-600 w-1/3">
                        Weight
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {product.weight} kg
                      </td>
                    </tr>
                  )}
                  {product.materials && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-sm font-medium text-gray-600 w-1/3">
                        Materials
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {product.materials}
                      </td>
                    </tr>
                  )}
                  {product.manufacturing_location && (
                    <tr className="border-b border-gray-200">
                      <td className="py-3 pr-4 text-sm font-medium text-gray-600 w-1/3">
                        Made in
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {product.manufacturing_location}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dimensions */}
        {hasDimensions && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Dimensions</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {Object.entries(product.dimensions).map(([key, value], index) => (
                    value && (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 pr-4 text-sm font-medium text-gray-600 w-1/3 capitalize">
                          {key}
                        </td>
                        <td className="py-3 text-sm text-gray-900">
                          {value} cm
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
                  {product.expressDeliveryFee ? `${product.expressDeliveryFee} XAF` : 'Contact seller'}
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
                <p className="text-text-secondary">{product?.shipFrom || 'Location not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Icon name="Globe" size={16} className="text-text-secondary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Ships to</p>
                <p className="text-text-secondary">{product?.shipsTo || 'Shipping regions not specified'}</p>
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
          <h4 className="text-lg font-semibold text-gray-900">Warranty Information</h4>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={20} className="text-green-600" />
              <span className="font-medium text-gray-900">
                {product?.warranty_months
                  ? `${product.warranty_months} Month${product.warranty_months > 1 ? 's' : ''} Warranty`
                  : product?.warranty_type
                  ? `${product.warranty_type.charAt(0).toUpperCase() + product.warranty_type.slice(1)} Warranty`
                  : 'Standard Warranty'
                }
              </span>
            </div>

            <p className="text-sm text-gray-600">
              {product?.warranty_details || `This product comes with a standard warranty covering manufacturing defects and normal wear and tear. Warranty period starts from the date of purchase.`}
            </p>

            {/* Warranty Details Table */}
            {(product?.warranty_months || product?.warranty_type) && (
              <div className="mt-4">
                <table className="w-full text-sm">
                  <tbody className="space-y-2">
                    {product.warranty_months && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 pr-4 font-medium text-gray-600">Duration</td>
                        <td className="py-2 text-gray-900">{product.warranty_months} months</td>
                      </tr>
                    )}
                    {product.warranty_type && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 pr-4 font-medium text-gray-600">Type</td>
                        <td className="py-2 text-gray-900 capitalize">{product.warranty_type}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Return Policy</h4>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Icon name="RotateCcw" size={16} className="text-teal-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Return Window</p>
                <p className="text-sm text-gray-600">
                  {product?.return_policy
                    ? product.return_policy.replace('_', ' ') + ' from delivery'
                    : '7 days from delivery'
                  }
                </p>
              </div>
            </div>

            {product?.return_details && (
              <div className="flex items-start space-x-2">
                <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Return Details</p>
                  <p className="text-sm text-gray-600">{product.return_details}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-2">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Return Conditions</p>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Item must be in original condition</li>
                  <li>• Original packaging required</li>
                  <li>• All accessories included</li>
                  <li>• No signs of damage or wear</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Icon name="CreditCard" size={16} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Refund Process</p>
                <p className="text-sm text-gray-600">
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
    <div className="bg-white border border-teal-200 rounded-2xl overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-teal-200/50">
        <nav className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50' :'text-gray-500 hover:text-teal-600 hover:bg-teal-50'
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