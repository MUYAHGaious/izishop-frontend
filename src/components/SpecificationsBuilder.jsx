import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import Input from './ui/Input';

const SpecificationsBuilder = ({
  specifications = {},
  dimensions = {},
  weight = '',
  materials = '',
  manufacturingLocation = '',
  onChange,
  selectedCategory = null,
  className = ''
}) => {
  const [specs, setSpecs] = useState(specifications);
  const [dims, setDims] = useState({
    length: dimensions?.length || '',
    width: dimensions?.width || '',
    height: dimensions?.height || ''
  });
  const [physicalAttributes, setPhysicalAttributes] = useState({
    weight: weight,
    materials: materials,
    manufacturingLocation: manufacturingLocation
  });
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Category-specific specification templates
  const categoryTemplates = {
    'electronics': [
      'Brand', 'Model', 'Color', 'Screen Size', 'Battery Life', 'Operating System', 'Storage', 'RAM'
    ],
    'mobile-phones': [
      'Brand', 'Model', 'Color', 'Screen Size', 'Camera', 'Battery', 'Storage', 'RAM', 'Operating System'
    ],
    'computers': [
      'Brand', 'Model', 'Processor', 'RAM', 'Storage', 'Screen Size', 'Graphics Card', 'Operating System'
    ],
    'fashion': [
      'Brand', 'Size', 'Color', 'Material', 'Gender', 'Season', 'Care Instructions'
    ],
    'mens': [
      'Brand', 'Size', 'Color', 'Material', 'Fit', 'Collar Type', 'Sleeve Type'
    ],
    'womens': [
      'Brand', 'Size', 'Color', 'Material', 'Fit', 'Neckline', 'Sleeve Type'
    ],
    'shoes': [
      'Brand', 'Size', 'Color', 'Material', 'Sole Type', 'Heel Height', 'Gender'
    ],
    'home-garden': [
      'Brand', 'Material', 'Color', 'Dimensions', 'Assembly Required', 'Care Instructions'
    ],
    'furniture': [
      'Brand', 'Material', 'Color', 'Dimensions', 'Weight Capacity', 'Assembly Required'
    ]
  };

  useEffect(() => {
    // Emit changes to parent
    onChange({
      specifications: specs,
      dimensions: Object.keys(dims).some(key => dims[key]) ? dims : null,
      weight: physicalAttributes.weight ? parseFloat(physicalAttributes.weight) : null,
      materials: physicalAttributes.materials || null,
      manufacturing_location: physicalAttributes.manufacturingLocation || null
    });
  }, [specs, dims, physicalAttributes]);

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecs(prev => ({
        ...prev,
        [newSpecKey.trim()]: newSpecValue.trim()
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key) => {
    setSpecs(prev => {
      const newSpecs = { ...prev };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  const updateSpecification = (key, value) => {
    setSpecs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addTemplateSpec = (specName) => {
    if (!specs[specName]) {
      setSpecs(prev => ({
        ...prev,
        [specName]: ''
      }));
    }
  };

  const handleDimensionChange = (dimension, value) => {
    setDims(prev => ({
      ...prev,
      [dimension]: value
    }));
  };

  const handlePhysicalAttributeChange = (attribute, value) => {
    setPhysicalAttributes(prev => ({
      ...prev,
      [attribute]: value
    }));
  };

  const getTemplateSpecs = () => {
    if (!selectedCategory) return [];

    const categoryPath = selectedCategory.category_path || '';
    const categoryKeys = [
      categoryPath,
      categoryPath.split('/')[0], // parent category
      selectedCategory.name?.toLowerCase()
    ].filter(Boolean);

    for (const key of categoryKeys) {
      if (categoryTemplates[key]) {
        return categoryTemplates[key];
      }
    }

    return [];
  };

  const templateSpecs = getTemplateSpecs();

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Icon name="Settings" size={20} className="mr-2" />
        Product Specifications
      </h3>

      {/* Physical Attributes */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-md font-medium text-gray-800 mb-4">Physical Attributes</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.001"
              value={physicalAttributes.weight}
              onChange={(e) => handlePhysicalAttributeChange('weight', e.target.value)}
              placeholder="0.500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materials
            </label>
            <input
              type="text"
              value={physicalAttributes.materials}
              onChange={(e) => handlePhysicalAttributeChange('materials', e.target.value)}
              placeholder="Cotton, Polyester"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dimensions (cm)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              step="0.1"
              value={dims.length}
              onChange={(e) => handleDimensionChange('length', e.target.value)}
              placeholder="Length"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <input
              type="number"
              step="0.1"
              value={dims.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              placeholder="Width"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <input
              type="number"
              step="0.1"
              value={dims.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              placeholder="Height"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Manufacturing Location
          </label>
          <input
            type="text"
            value={physicalAttributes.manufacturingLocation}
            onChange={(e) => handlePhysicalAttributeChange('manufacturingLocation', e.target.value)}
            placeholder="Made in Cameroon"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category-specific Template */}
      {templateSpecs.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="text-md font-medium text-blue-800 mb-3 flex items-center">
            <Icon name="Lightbulb" size={16} className="mr-2" />
            Suggested for {selectedCategory?.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {templateSpecs.map((specName) => (
              <button
                key={specName}
                onClick={() => addTemplateSpec(specName)}
                disabled={specs[specName] !== undefined}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  specs[specName] !== undefined
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                }`}
              >
                {specName}
                {specs[specName] !== undefined && (
                  <Icon name="Check" size={12} className="ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Specifications */}
      {Object.keys(specs).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-800">Specifications</h4>
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-3">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    const newSpecs = { ...specs };
                    delete newSpecs[key];
                    newSpecs[newKey] = value;
                    setSpecs(newSpecs);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-100"
                  placeholder="Specification name"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateSpecification(key, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Value"
                />
              </div>
              <button
                onClick={() => removeSpecification(key)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Specification */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
        <h4 className="text-md font-medium text-gray-700 mb-3">Add Custom Specification</h4>
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Specification Name</label>
            <input
              type="text"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              placeholder="e.g., Color, Size, Model"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Value</label>
            <input
              type="text"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              placeholder="e.g., Blue, Large, XR-100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <Button
            type="button"
            onClick={addSpecification}
            disabled={!newSpecKey.trim() || !newSpecValue.trim()}
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 h-10"
          >
            <Icon name="Plus" size={16} />
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Specifications help customers understand your product better and improve searchability.
      </div>
    </div>
  );
};

export default SpecificationsBuilder;