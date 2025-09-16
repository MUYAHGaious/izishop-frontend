import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import api from '../services/api';

const CategorySelector = ({
  value = '',
  onChange,
  error = null,
  required = false,
  className = ''
}) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadRootCategories();
  }, []);

  useEffect(() => {
    if (value) {
      // If a category is pre-selected, determine parent and subcategories
      const category = findCategoryById(value);
      if (category && category.parent_category_id) {
        setSelectedParent(category.parent_category_id);
        loadSubcategories(category.parent_category_id);
      }
    }
  }, [value, categories]);

  const loadRootCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/categories?active_only=true', {}, false);

      // Filter root categories (level 0)
      const rootCategories = response.filter(cat => cat.category_level === 0);
      setCategories(rootCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (parentId) => {
    try {
      const response = await api.get('/api/categories?active_only=true', {}, false);

      // Filter subcategories for selected parent
      const subs = response.filter(cat => cat.parent_category_id === parentId);
      setSubcategories(subs);
    } catch (error) {
      console.error('Failed to load subcategories:', error);
    }
  };

  const findCategoryById = (categoryId) => {
    return [...categories, ...subcategories].find(cat => cat.id === categoryId);
  };

  const handleParentChange = (parentId) => {
    setSelectedParent(parentId);

    if (parentId) {
      loadSubcategories(parentId);
      // If user selects a parent category, use it as the value
      const parentCategory = categories.find(cat => cat.id === parentId);
      onChange(parentId, parentCategory);
    } else {
      setSubcategories([]);
      onChange('', null);
    }
  };

  const handleSubcategoryChange = (subcategoryId) => {
    const subcategory = subcategories.find(cat => cat.id === subcategoryId);
    onChange(subcategoryId, subcategory);
    setIsOpen(false);
  };

  const getSelectedCategoryPath = () => {
    if (value) {
      const category = findCategoryById(value);
      if (category) {
        if (category.parent_category_id) {
          const parent = categories.find(cat => cat.id === category.parent_category_id);
          return parent ? `${parent.name} > ${category.name}` : category.name;
        }
        return category.name;
      }
    }
    return 'Select a category';
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Category {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selected Category Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-3 border rounded-xl cursor-pointer transition-colors ${
          error
            ? 'border-red-300 bg-red-50'
            : isOpen
              ? 'border-teal-500 ring-2 ring-teal-200'
              : 'border-gray-300 hover:border-gray-400'
        } ${loading ? 'bg-gray-50' : 'bg-white'}`}
      >
        <div className="flex items-center justify-between">
          <span className={`${value ? 'text-gray-900' : 'text-gray-500'}`}>
            {loading ? 'Loading categories...' : getSelectedCategoryPath()}
          </span>
          <Icon
            name={isOpen ? "ChevronUp" : "ChevronDown"}
            size={20}
            className="text-gray-400"
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {/* Clear Selection */}
          <div
            onClick={() => {
              setSelectedParent('');
              setSubcategories([]);
              onChange('', null);
              setIsOpen(false);
            }}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
          >
            <span className="text-gray-500 text-sm">Clear selection</span>
          </div>

          {/* Root Categories */}
          <div className="p-2">
            <div className="text-xs font-medium text-gray-400 px-2 py-1 uppercase tracking-wider">
              Main Categories
            </div>
            {categories.map((category) => (
              <div key={category.id}>
                <div
                  onClick={() => handleParentChange(category.id)}
                  className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedParent === category.id
                      ? 'bg-teal-100 text-teal-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {category.icon && (
                    <Icon name={category.icon} size={16} className="mr-2 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">{category.name}</span>
                  {selectedParent === category.id && subcategories.length > 0 && (
                    <Icon name="ChevronRight" size={16} className="ml-auto" />
                  )}
                </div>

                {/* Subcategories */}
                {selectedParent === category.id && subcategories.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    <div className="text-xs font-medium text-gray-400 px-2 py-1">
                      Subcategories
                    </div>
                    {subcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        onClick={() => handleSubcategoryChange(subcategory.id)}
                        className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          value === subcategory.id
                            ? 'bg-teal-200 text-teal-800'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {subcategory.icon && (
                          <Icon name={subcategory.icon} size={14} className="mr-2 flex-shrink-0" />
                        )}
                        <span className="text-sm">{subcategory.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-1">
        Select a main category, then optionally choose a subcategory
      </p>
    </div>
  );
};

export default CategorySelector;