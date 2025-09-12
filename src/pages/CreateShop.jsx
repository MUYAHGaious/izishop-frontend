import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { showToast } from '../components/ui/Toast';
import api from '../services/api';
import Header from '../components/ui/Header';

const CreateShop = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    business_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false }
    },
    social_media: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    policies: {
      return_policy: '',
      shipping_policy: '',
      privacy_policy: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Fashion & Clothing',
    'Electronics & Gadgets',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Fitness',
    'Books & Media',
    'Food & Beverages',
    'Automotive',
    'Toys & Games',
    'Jewelry & Accessories',
    'Art & Crafts',
    'Pet Supplies',
    'Office Supplies',
    'Travel & Luggage',
    'Other'
  ];

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Tell us about your shop' },
    { number: 2, title: 'Contact Details', description: 'How customers can reach you' },
    { number: 3, title: 'Business Hours', description: 'When you\'re open for business' },
    { number: 4, title: 'Social Media', description: 'Connect your social accounts' },
    { number: 5, title: 'Policies', description: 'Set your shop policies' },
    { number: 6, title: 'Review & Create', description: 'Review and launch your shop' }
  ];

  useEffect(() => {
    // Check if user is shop owner
    if (user?.role !== 'SHOP_OWNER') {
      showToast('You need to be a shop owner to create a shop', 'error');
      navigate('/settings?tab=subscription');
      return;
    }

    // Pre-fill with user data
    setFormData(prev => ({
      ...prev,
      email: user?.email || '',
      phone: user?.phone || ''
    }));
  }, [user, navigate]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Shop name is required';
        if (!formData.description.trim()) newErrors.description = 'Shop description is required';
        if (!formData.category) newErrors.category = 'Please select a category';
        break;
      case 2:
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        break;
      case 3:
        // Business hours validation is optional
        break;
      case 4:
        // Social media is optional
        break;
      case 5:
        // Policies are optional but recommended
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/shops', {
        ...formData,
        owner_id: user.id
      });

      showToast('Shop created successfully! Welcome to your new shop!', 'success');
      await refreshUserData();
      navigate('/shop-owner-dashboard');
    } catch (error) {
      console.error('Error creating shop:', error);
      showToast(error.message || 'Failed to create shop. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Let's create your shop!</h3>
              <p className="text-gray-600">Start by telling us the basics about your business.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  label="Shop Name *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your shop name"
                  error={errors.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your shop sells and what makes it special..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={4}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h3>
              <p className="text-gray-600">How can customers reach you?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  error={errors.phone}
                />
              </div>

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="shop@example.com"
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Address *"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address, building, etc."
                  error={errors.address}
                />
              </div>

              <div>
                <Input
                  label="City *"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Douala, Yaoundé, etc."
                  error={errors.city}
                />
              </div>

              <div>
                <Input
                  label="Website (Optional)"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-600">When are you open for business?</p>
            </div>

            <div className="space-y-4">
              {Object.entries(formData.business_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-24">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-medium capitalize">{day}</span>
                    </label>
                  </div>
                  
                  {!hours.closed && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  )}
                  
                  {hours.closed && (
                    <span className="text-gray-500">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Social Media</h3>
              <p className="text-gray-600">Connect your social media accounts (optional)</p>
            </div>

            <div className="space-y-4">
              {Object.entries(formData.social_media).map(([platform, url]) => (
                <div key={platform}>
                  <Input
                    label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                    value={url}
                    onChange={(e) => handleNestedInputChange('social_media', platform, e.target.value)}
                    placeholder={`https://${platform}.com/yourusername`}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Shop Policies</h3>
              <p className="text-gray-600">Set your shop policies to build trust with customers</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Policy
                </label>
                <textarea
                  value={formData.policies.return_policy}
                  onChange={(e) => handleNestedInputChange('policies', 'return_policy', e.target.value)}
                  placeholder="Describe your return and refund policy..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Policy
                </label>
                <textarea
                  value={formData.policies.shipping_policy}
                  onChange={(e) => handleNestedInputChange('policies', 'shipping_policy', e.target.value)}
                  placeholder="Describe your shipping methods and delivery times..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy Policy
                </label>
                <textarea
                  value={formData.policies.privacy_policy}
                  onChange={(e) => handleNestedInputChange('policies', 'privacy_policy', e.target.value)}
                  placeholder="Describe how you handle customer data and privacy..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Shop</h3>
              <p className="text-gray-600">Everything looks good? Let's create your shop!</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Shop Name</h4>
                <p className="text-gray-600">{formData.name}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Category</h4>
                <p className="text-gray-600">{formData.category}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Description</h4>
                <p className="text-gray-600">{formData.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Contact</h4>
                <p className="text-gray-600">{formData.phone} • {formData.email}</p>
                <p className="text-gray-600">{formData.address}, {formData.city}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (user?.role !== 'SHOP_OWNER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="XCircle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be a shop owner to create a shop.</p>
          <Button onClick={() => navigate('/settings?tab=subscription')}>
            Upgrade to Shop Owner
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.number ? 'bg-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="px-6 py-3"
          >
            <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white"
            >
              Next
              <Icon name="ArrowRight" className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating Shop...
                </>
              ) : (
                <>
                  <Icon name="CheckCircle" className="w-4 h-4 mr-2" />
                  Create Shop
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateShop;
