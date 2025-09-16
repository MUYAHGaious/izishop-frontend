import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { showToast } from '../../components/ui/Toast';
import CategorySelector from '../../components/CategorySelector';
import SpecificationsBuilder from '../../components/SpecificationsBuilder';
import api from '../../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    sku: '',
    brand: '',
    condition: 'new',
    category: '',
    category_id: '',
    images: [],
    videos: []
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [specifications, setSpecifications] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasShop, setHasShop] = useState(false);
  const [checkingShop, setCheckingShop] = useState(true);

  // Check if user has a shop
  useEffect(() => {
    const checkUserShop = async () => {
      try {
        setCheckingShop(true);
        
        // Check if user is a shop owner
        if (user?.role !== 'SHOP_OWNER' && user?.role !== 'shop_owner') {
          setHasShop(false);
          setCheckingShop(false);
          return;
        }

        // Try to get user's shop data
        const shopData = await api.getMyShop();
        if (shopData && shopData.id) {
          setHasShop(true);
        } else {
          setHasShop(false);
        }
      } catch (error) {
        console.log('No shop found for user:', error);
        setHasShop(false);
      } finally {
        setCheckingShop(false);
      }
    };

    if (user) {
      checkUserShop();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e, fileType) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: event.target.result
        };
        
        setFormData(prev => ({
          ...prev,
          [fileType]: [...prev[fileType], fileData]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileType, fileId) => {
    setFormData(prev => ({
      ...prev,
      [fileType]: prev[fileType].filter(file => file.id !== fileId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.stock_quantity) {
      newErrors.stock_quantity = 'Stock quantity is required';
    } else if (isNaN(formData.stock_quantity) || parseInt(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Stock quantity must be a non-negative number';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        sku: formData.sku.trim() || null,
        brand: formData.brand.trim() || null,
        condition: formData.condition,
        category: formData.category.trim() || null,
        // Product specifications
        weight: specifications.weight || null,
        dimensions: specifications.dimensions || null,
        specifications: specifications.specifications || null,
        materials: specifications.materials || null,
        manufacturing_location: specifications.manufacturing_location || null,
        is_active: true,
        image_urls: formData.images.map(img => img.url),
        video_urls: formData.videos.map(vid => vid.url)
      };

      const response = await api.createProduct(productData);
      
      showToast({
        type: 'success',
        message: 'Product created successfully!',
        duration: 3000
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        sku: '',
        brand: '',
        condition: 'new',
        category: '',
        category_id: '',
        images: [],
        videos: []
      });
      setSelectedCategory(null);
      setSpecifications({});
      setErrors({});

      // Navigate based on user role immediately after success
      if (user?.role === 'SHOP_OWNER') {
        navigate('/shop-owner-dashboard?tab=products');
      } else {
        navigate('/product-catalog');
      }

    } catch (error) {
      console.error('Product creation error:', error);
      
      // Handle validation errors
      if (error.message.includes('Validation error')) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: error.message || 'Failed to create product. Please try again.' });
      }

      showToast({
        type: 'error',
        message: error.message || 'Failed to create product',
        duration: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-600 mt-1">
                  {user?.role === 'SHOP_OWNER' 
                    ? 'Create a new product for your shop' 
                    : 'Create a new product to sell'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (user?.role === 'SHOP_OWNER') {
                    navigate('/shop-owner-dashboard?tab=products');
                  } else {
                    navigate('/product-catalog');
                  }
                }}
                className="flex items-center gap-2"
              >
                <Icon name="ArrowLeft" size={16} />
                {user?.role === 'SHOP_OWNER' ? 'Back to Dashboard' : 'Back to Products'}
              </Button>
            </div>
          </div>

          {/* Shop Creation Prompt */}
          {!checkingShop && !hasShop && (
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Icon name="Store" size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-teal-900 mb-2">
                    Create Your Shop First
                  </h3>
                  <p className="text-teal-700 mb-4">
                    You need to create a shop before you can add products. Setting up your shop is quick and easy!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => navigate('/create-shop')}
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white border-0 shadow-lg"
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Create Shop Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/shop-owner-dashboard')}
                      className="border-teal-200 text-teal-700 hover:bg-teal-50"
                    >
                      <Icon name="ArrowLeft" size={16} className="mr-2" />
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {checkingShop && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-t-transparent"></div>
                <span className="text-teal-700 font-medium">Checking your shop status...</span>
              </div>
            </div>
          )}

          {/* Form */}
          {!checkingShop && hasShop && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Product Name"
                    type="text"
                    name="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe your product..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    required
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/2000 characters
                  </p>
                </div>

                <Input
                  label="Price (XAF)"
                  type="number"
                  name="price"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={errors.price}
                  min="0"
                  step="0.01"
                  required
                />

                <Input
                  label="Stock Quantity"
                  type="number"
                  name="stock_quantity"
                  placeholder="0"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  error={errors.stock_quantity}
                  min="0"
                  required
                />
              </div>

              {/* Enhanced Product Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="SKU (Optional)"
                  type="text"
                  name="sku"
                  placeholder="Product SKU"
                  value={formData.sku}
                  onChange={handleInputChange}
                  error={errors.sku}
                />

                <Input
                  label="Brand"
                  type="text"
                  name="brand"
                  placeholder="Product brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  error={errors.brand}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                  {errors.condition && (
                    <p className="text-sm text-red-500 mt-1">{errors.condition}</p>
                  )}
                </div>

                <CategorySelector
                  value={formData.category_id}
                  onChange={(categoryId, categoryData) => {
                    setFormData(prev => ({
                      ...prev,
                      category_id: categoryId,
                      category: categoryData ? categoryData.name : ''
                    }));
                    setSelectedCategory(categoryData);

                    // Clear category error when user selects
                    if (errors.category) {
                      setErrors(prev => ({ ...prev, category: '' }));
                    }
                  }}
                  error={errors.category}
                  className="flex-1"
                />
              </div>

              {/* Product Specifications */}
              <div className="md:col-span-2">
                <SpecificationsBuilder
                  specifications={specifications.specifications || {}}
                  dimensions={specifications.dimensions || {}}
                  weight={specifications.weight || ''}
                  materials={specifications.materials || ''}
                  manufacturingLocation={specifications.manufacturing_location || ''}
                  selectedCategory={selectedCategory}
                  onChange={setSpecifications}
                />
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'images')}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Icon name="Upload" size={20} />
                    <span>Choose Images</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG, GIF up to 10MB each. You can upload multiple images.
                  </p>
                </div>
                {errors.images && (
                  <p className="text-sm text-red-500 mt-1">{errors.images}</p>
                )}
                
                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('images', image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Videos <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'videos')}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Icon name="Video" size={20} />
                    <span>Choose Videos</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    MP4, MOV, AVI up to 50MB each. You can upload multiple videos.
                  </p>
                </div>
                
                {/* Video Preview */}
                {formData.videos.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.videos.map((video) => (
                      <div key={video.id} className="relative">
                        <video
                          src={video.url}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('videos', video.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Preview */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Product Preview</h3>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {formData.images.length > 0 ? (
                      <img
                        src={formData.images[0].url}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name="Package" size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {formData.name || 'Product Name'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.description || 'Product description will appear here...'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-lg font-bold text-primary">
                        XAF {formData.price || '0.00'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {formData.stock_quantity || '0'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {formData.brand && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {formData.brand}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        formData.condition === 'new' ? 'bg-green-100 text-green-700' :
                        formData.condition === 'used' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {formData.condition.charAt(0).toUpperCase() + formData.condition.slice(1)}
                      </span>
                      {formData.category && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {formData.category}
                        </span>
                      )}
                    </div>
                    {formData.images.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.images.length} image(s) • {formData.videos.length} video(s)
                        {formData.sku && ` • SKU: ${formData.sku}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <Icon name="AlertCircle" size={16} className="text-red-600 mt-0.5 mr-2" />
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (user?.role === 'SHOP_OWNER') {
                      navigate('/shop-owner-dashboard?tab=products');
                    } else {
                      navigate('/product-catalog');
                    }
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white border-0 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;