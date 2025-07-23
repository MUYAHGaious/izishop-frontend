import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import ValidatedInput from './ValidatedInput';
import { showToast } from './Toast';
import api from '../../services/api';

const CreateShopModal = ({ isOpen, onClose, onShopCreated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);

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

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Shop name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Shop name must be at least 2 characters';
      } else if (formData.name.trim().length > 100) {
        newErrors.name = 'Shop name must be less than 100 characters';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      } else if (formData.description.trim().length > 500) {
        newErrors.description = 'Description must be less than 500 characters';
      }
    }

    if (step === 2) {
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (formData.phone && !/^\d{9,15}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number (9-15 digits)';
      }

      if (formData.address && formData.address.trim().length > 200) {
        newErrors.address = 'Address must be less than 200 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Create shop via API
      const response = await api.createShop(formData);
      
      setSuccess(true);
      setErrors({});
      
      // Show success message
      showToast({
        type: 'success',
        message: 'Shop created successfully!',
        duration: 3000
      });

      // Call callback if provided
      if (onShopCreated) {
        onShopCreated(response);
      }

      // Navigate to shops listing after a short delay
      setTimeout(() => {
        navigate('/shops-listing');
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Shop creation error:', error);
      
      // Handle different error types
      if (error.message.includes('Validation error')) {
        setErrors({ submit: error.message });
      } else if (error.message.includes('already taken')) {
        setErrors({ name: error.message });
      } else if (error.message.includes('already has a shop')) {
        setErrors({ submit: 'You already have a shop' });
      } else {
        setErrors({ submit: error.message || 'Failed to create shop. Please try again.' });
      }

      showToast({
        type: 'error',
        message: error.message || 'Failed to create shop',
        duration: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: ''
    });
    setErrors({});
    setCurrentStep(1);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Your Shop</h2>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep} of 2 - {success ? 'Success!' : currentStep === 1 ? 'Basic Info' : 'Contact Details'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon name="X" size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: success ? '100%' : `${(currentStep / 2) * 100}%` }}
                />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-600">
                {success ? '100%' : `${Math.round((currentStep / 2) * 100)}%`}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {success ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Shop Created Successfully!
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Your shop has been created. You'll be redirected to your shop profile shortly.
                </p>
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-gray-600">Redirecting...</span>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon name="Store" size={24} className="text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Tell us about your shop
                      </p>
                    </div>

                    <ValidatedInput
                      label="Shop Name"
                      type="text"
                      name="name"
                      placeholder="Enter your shop name"
                      value={formData.name}
                      onChange={handleInputChange}
                      validationType="shopName"
                      debounceDelay={500}
                      minLength={2}
                      required
                      className="text-base"
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        placeholder="Describe your shop and what you sell..."
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        required
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length}/500 characters
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon name="MapPin" size={24} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Optional information to help customers reach you
                      </p>
                    </div>

                    <Input
                      label="Shop Address"
                      type="text"
                      name="address"
                      placeholder="Enter your shop address (optional)"
                      value={formData.address}
                      onChange={handleInputChange}
                      error={errors.address}
                      className="text-base"
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number (optional)"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={errors.phone}
                      className="text-base"
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      placeholder="Enter email address (optional)"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      className="text-base"
                    />

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                      <div className="flex items-start">
                        <Icon name="Info" size={16} className="text-blue-600 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm text-blue-800">
                            <strong>Optional fields:</strong> You can skip these and add them later from your shop settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="flex-1 py-3 text-base"
                    >
                      <Icon name="ArrowLeft" size={16} className="mr-2" />
                      Previous
                    </Button>
                  )}

                  {currentStep < 2 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 py-3 text-base"
                    >
                      Next
                      <Icon name="ArrowRight" size={16} className="ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Creating Shop...
                        </>
                      ) : (
                        <>
                          <Icon name="Store" size={16} className="mr-2" />
                          Create Shop
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShopModal;