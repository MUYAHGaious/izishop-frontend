import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import apiService from '../../../services/api';

const RegisterForm = ({ onRegister, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessLicense: '',
    idDocument: '',
    vehicleType: '',
    licenseNumber: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const roleOptions = [
    { value: 'customer', label: 'Customer', description: 'Shop and buy products' },
    { value: 'shop_owner', label: 'Shop Owner', description: 'Sell products through your shop' },
    { value: 'casual_seller', label: 'Casual Seller', description: 'Sell second-hand items' },
    { value: 'delivery_agent', label: 'Delivery Agent', description: 'Deliver orders to customers' }
  ];

  const businessTypeOptions = [
    { value: 'electronics', label: 'Electronics & Technology' },
    { value: 'fashion', label: 'Fashion & Clothing' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'health', label: 'Health & Beauty' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Recreation' },
    { value: 'books', label: 'Books & Media' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'other', label: 'Other' }
  ];

  const vehicleTypeOptions = [
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'car', label: 'Car' },
    { value: 'van', label: 'Van/Truck' }
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.role) {
        newErrors.role = 'Please select a role';
      }
    }

    if (step === 2) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 3) {
      if (formData.role === 'shop_owner') {
        if (!formData.businessName) {
          newErrors.businessName = 'Business name is required';
        }
        if (!formData.businessType) {
          newErrors.businessType = 'Business type is required';
        }
        if (!formData.businessAddress) {
          newErrors.businessAddress = 'Business address is required';
        }
      }

      if (formData.role === 'delivery_agent') {
        if (!formData.vehicleType) {
          newErrors.vehicleType = 'Vehicle type is required';
        }
        if (!formData.licenseNumber) {
          newErrors.licenseNumber = 'License number is required';
        }
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
      if (!formData.agreeToPrivacy) {
        newErrors.agreeToPrivacy = 'You must agree to the privacy policy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
    
    if (!validateStep(currentStep)) return;

    try {
      // Map frontend role values to backend enum values
      const roleMapping = {
        'customer': 'CUSTOMER',
        'shop_owner': 'SHOP_OWNER',
        'casual_seller': 'CASUAL_SELLER',
        'delivery_agent': 'DELIVERY_AGENT'
      };

      // Prepare user data for API
      const userData = {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: roleMapping[formData.role] || formData.role,
        phone: formData.phone
      };

      // Call real API
      const response = await apiService.register(userData);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.access_token);
      
      if (onRegister) {
        onRegister(response.user);
      }
    } catch (error) {
      // Handle registration errors
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setErrors({
        email: errorMessage,
        password: errorMessage
      });
    }
  };

  const getTotalSteps = () => {
    if (formData.role === 'customer') return 3;
    if (formData.role === 'shop_owner' || formData.role === 'delivery_agent') return 3;
    return 3;
  };

  const renderProgressIndicator = () => {
    const totalSteps = getTotalSteps();
    
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium marketplace-transition ${
                index + 1 < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index + 1 === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary'
              }`}>
                {index + 1 < currentStep ? (
                  <Icon name="Check" size={16} />
                ) : (
                  index + 1
                )}
              </div>
              {index < totalSteps - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  index + 1 < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-sm text-text-secondary">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Join IziShop</h2>
        <p className="text-text-secondary">Choose your role to get started</p>
      </div>

      <Select
        label="I want to join as"
        description="Select the role that best describes how you plan to use IziShop"
        options={roleOptions}
        value={formData.role}
        onChange={(value) => handleSelectChange('role', value)}
        error={errors.role}
        required
        placeholder="Select your role"
      />

      {formData.role && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium text-foreground mb-2">
            {roleOptions.find(r => r.value === formData.role)?.label} Benefits:
          </h3>
          <ul className="text-sm text-text-secondary space-y-1">
            {formData.role === 'customer' && (
              <>
                <li>• Browse thousands of products</li>
                <li>• Secure payment options</li>
                <li>• Order tracking and delivery</li>
                <li>• Customer support</li>
              </>
            )}
            {formData.role === 'shop_owner' && (
              <>
                <li>• Create your online shop</li>
                <li>• Manage inventory and orders</li>
                <li>• Access to analytics dashboard</li>
                <li>• Marketing tools and promotions</li>
              </>
            )}
            {formData.role === 'casual_seller' && (
              <>
                <li>• Sell second-hand items easily</li>
                <li>• No monthly fees</li>
                <li>• Simple listing process</li>
                <li>• Secure transactions</li>
              </>
            )}
            {formData.role === 'delivery_agent' && (
              <>
                <li>• Flexible working hours</li>
                <li>• Competitive delivery rates</li>
                <li>• Route optimization</li>
                <li>• Weekly payouts</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
        <p className="text-text-secondary">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          type="text"
          name="firstName"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={handleInputChange}
          error={errors.firstName}
          required
        />

        <Input
          label="Last Name"
          type="text"
          name="lastName"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={handleInputChange}
          error={errors.lastName}
          required
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        required
      />

      <Input
        label="Phone Number"
        type="tel"
        name="phone"
        placeholder="+237 6XX XXX XXX"
        value={formData.phone}
        onChange={handleInputChange}
        error={errors.phone}
        required
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-text-secondary hover:text-foreground marketplace-transition"
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
        </button>
      </div>

      {formData.password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Password strength:</span>
            <span className={`font-medium ${
              passwordStrength < 50 ? 'text-red-500' : 
              passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {getPasswordStrengthText(passwordStrength)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full marketplace-transition ${getPasswordStrengthColor(passwordStrength)}`}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>
          <div className="text-xs text-text-secondary">
            Use 8+ characters with uppercase, lowercase, numbers, and symbols
          </div>
        </div>
      )}

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-9 text-text-secondary hover:text-foreground marketplace-transition"
        >
          <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {formData.role === 'shop_owner' ? 'Business Information' : 
           formData.role === 'delivery_agent' ? 'Delivery Information' : 
           'Almost Done!'}
        </h2>
        <p className="text-text-secondary">
          {formData.role === 'shop_owner' ? 'Tell us about your business' : 
           formData.role === 'delivery_agent'? 'Delivery details required' : 'Complete your registration'}
        </p>
      </div>

      {formData.role === 'shop_owner' && (
        <>
          <Input
            label="Business Name"
            type="text"
            name="businessName"
            placeholder="Enter your business name"
            value={formData.businessName}
            onChange={handleInputChange}
            error={errors.businessName}
            required
          />

          <Select
            label="Business Type"
            options={businessTypeOptions}
            value={formData.businessType}
            onChange={(value) => handleSelectChange('businessType', value)}
            error={errors.businessType}
            required
            placeholder="Select business category"
          />

          <Input
            label="Business Address"
            type="text"
            name="businessAddress"
            placeholder="Enter your business address"
            value={formData.businessAddress}
            onChange={handleInputChange}
            error={errors.businessAddress}
            required
          />

          <Input
            label="Business License (Optional)"
            type="text"
            name="businessLicense"
            placeholder="Business license number"
            value={formData.businessLicense}
            onChange={handleInputChange}
          />
        </>
      )}

      {formData.role === 'delivery_agent' && (
        <>
          <Select
            label="Vehicle Type"
            options={vehicleTypeOptions}
            value={formData.vehicleType}
            onChange={(value) => handleSelectChange('vehicleType', value)}
            error={errors.vehicleType}
            required
            placeholder="Select your vehicle type"
          />

          <Input
            label="Driver's License Number"
            type="text"
            name="licenseNumber"
            placeholder="Enter your license number"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            error={errors.licenseNumber}
            required
          />

          <Input
            label="ID Document Number"
            type="text"
            name="idDocument"
            placeholder="National ID or passport number"
            value={formData.idDocument}
            onChange={handleInputChange}
          />
        </>
      )}

      <div className="space-y-3 pt-4 border-t border-border">
        <Checkbox
          label="I agree to the Terms and Conditions"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleInputChange}
          error={errors.agreeToTerms}
          required
        />

        <Checkbox
          label="I agree to the Privacy Policy"
          name="agreeToPrivacy"
          checked={formData.agreeToPrivacy}
          onChange={handleInputChange}
          error={errors.agreeToPrivacy}
          required
        />

        <Checkbox
          label="I want to receive marketing emails and updates"
          name="agreeToMarketing"
          checked={formData.agreeToMarketing}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderProgressIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      <div className="flex justify-between pt-4">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Previous
          </Button>
        )}

        <div className="ml-auto">
          {currentStep < getTotalSteps() ? (
            <Button
              type="button"
              variant="default"
              onClick={handleNext}
              iconName="ArrowRight"
              iconPosition="right"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              variant="default"
              loading={isLoading}
              iconName="UserPlus"
              iconPosition="right"
            >
              Create Account
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;