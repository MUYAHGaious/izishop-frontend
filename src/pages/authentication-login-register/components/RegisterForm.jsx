import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ValidatedInput from '../../../components/ui/ValidatedInput';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { showToast } from '../../../components/ui/Toast';
import api from '../../../services/api';
import Stepper, { Step } from '../../../components/ui/Stepper';

const RegisterForm = ({ onRegister, isLoading }) => {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Shop creation fields
    shopName: '',
    shopDescription: '',
    shopAddress: '',
    shopCity: '',
    shopPhone: '',
    shopEmail: '',
    businessType: '',
    businessLicense: '',
    // Other role-specific fields
    vehicleType: '',
    licenseNumber: '',
    idDocument: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketing: false
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
        if (!formData.shopName) {
          newErrors.shopName = 'Shop name is required';
        } else if (formData.shopName.length < 2) {
          newErrors.shopName = 'Shop name must be at least 2 characters long';
        } else if (!/^[a-zA-Z0-9\s\-\'\&\.\(\)\[\]\_\,\!\@\#\%\+]+$/.test(formData.shopName.trim())) {
          newErrors.shopName = 'Shop name contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed';
        }
        if (!formData.shopDescription) {
          newErrors.shopDescription = 'Shop description is required';
        }
        if (!formData.shopAddress) {
          newErrors.shopAddress = 'Shop address is required';
        }
        if (!formData.shopCity) {
          newErrors.shopCity = 'Shop city is required';
        }
        if (!formData.businessType) {
          newErrors.businessType = 'Business type is required';
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

  // Validation logic for stepper
  const validateCurrentStep = () => {
    return validateStep(currentStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('handleSubmit called');
    console.log('Current step:', currentStep);
    console.log('Total steps:', getTotalSteps());
    console.log('Form data:', formData);
    
    // Skip validation if this is called from final step completion
    const isFromFinalStep = currentStep > getTotalSteps() || e.fromFinalStep;
    if (!isFromFinalStep && currentStep <= getTotalSteps() && !validateStep(currentStep)) {
      console.log('Validation failed, returning early');
      return;
    }
    
    console.log('Validation passed or skipped, proceeding with registration');

    try {
      // Validate that all required fields are present
      const requiredFields = ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'role'];
      const missingFields = requiredFields.filter(field => !formData[field] || !formData[field].trim());
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        setErrors({
          submit: `Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }
      
      // Map frontend roles to backend roles
      const roleMapping = {
        'customer': 'CUSTOMER',
        'shop_owner': 'SHOP_OWNER',
        'casual_seller': 'CASUAL_SELLER',
        'delivery_agent': 'DELIVERY_AGENT'
      };
      
      // Prepare user data for API (only the fields the backend expects)
      const userData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        role: roleMapping[formData.role] || formData.role.toUpperCase()
      };
      
      // Add phone if provided (clean it to digits only)
      if (formData.phone && formData.phone.trim()) {
        const cleanPhone = formData.phone.replace(/[^\d]/g, '');
        if (cleanPhone.length >= 9) {
          userData.phone = cleanPhone;
        }
      }

      console.log('Sending registration data:', { ...userData, password: '[REDACTED]', confirm_password: '[REDACTED]' });
      console.log('Full form data for debugging:', formData);

      // Pass the data to the parent component's handleRegister function
      // This will call the auth context register function and handle navigation
      if (onRegister) {
        console.log('Calling onRegister with userData...');
        
        // Include shop data if user is shop owner
        const registrationData = { ...userData };
        if (formData.role === 'shop_owner') {
          registrationData.shopData = {
            name: formData.shopName.trim(),
            description: formData.shopDescription.trim(),
            address: `${formData.shopAddress.trim()}, ${formData.shopCity.trim()}`,
            phone: formData.shopPhone ? formData.shopPhone.replace(/[^\d]/g, '') : userData.phone || '',
            email: formData.shopEmail ? formData.shopEmail.trim().toLowerCase() : userData.email
          };
          console.log('Including shop data for automatic creation:', registrationData.shopData);
        }
        
        await onRegister(registrationData);
        console.log('onRegister completed successfully');
      } else {
        console.error('No onRegister callback provided');
      }
    } catch (error) {
      // Handle registration errors
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setErrors({
        submit: errorMessage
      });
    }
  };

  const getTotalSteps = () => {
    if (formData.role === 'customer') return 3;
    if (formData.role === 'shop_owner' || formData.role === 'delivery_agent') return 3;
    return 3;
  };


  const renderStep1 = () => (
    <div className="space-y-5">
      <Select
        label="I want to join as"
        description="Choose how you'd like to use IziShopin"
        options={roleOptions}
        value={formData.role}
        onChange={(value) => handleSelectChange('role', value)}
        error={errors.role}
        required
        placeholder="Select your role"
      />

      {formData.role && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-3">
            {roleOptions.find(r => r.value === formData.role)?.label} Benefits
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            {formData.role === 'customer' && (
              <>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Browse thousands of products
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Secure payment options
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Order tracking and delivery
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  24/7 customer support
                </li>
              </>
            )}
            {formData.role === 'shop_owner' && (
              <>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Create your online shop instantly
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Advanced analytics dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Marketing tools and promotions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Custom branding options
                </li>
              </>
            )}
            {formData.role === 'casual_seller' && (
              <>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Sell items easily
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  No monthly fees
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Simple listing process
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Secure transactions
                </li>
              </>
            )}
            {formData.role === 'delivery_agent' && (
              <>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Flexible working hours
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Competitive delivery rates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Route optimization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                  Weekly payouts
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5 w-full max-w-full">
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

      <ValidatedInput
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email address"
        value={formData.email}
        onChange={handleInputChange}
        validationType="email"
        debounceDelay={600}
        minLength={3}
        required
      />

      <ValidatedInput
        label="Phone Number"
        type="tel"
        name="phone"
        placeholder="+237 6XX XXX XXX"
        value={formData.phone}
        onChange={handleInputChange}
        validationType="phone"
        debounceDelay={600}
        minLength={9}
        description="International format (e.g., +237 6XX XXX XXX)"
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
          className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
        </button>
      </div>

      {formData.password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Password strength:</span>
            <span className={`font-medium ${
              passwordStrength < 50 ? 'text-red-500' : 
              passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {getPasswordStrengthText(passwordStrength)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
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
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {formData.role === 'shop_owner' ? 'Create Your Shop' : 
           formData.role === 'delivery_agent' ? 'Delivery Information' : 
           'Almost Done!'}
        </h2>
        <p className="text-text-secondary">
          {formData.role === 'shop_owner' ? 'Set up your shop profile and start selling' : 
           formData.role === 'delivery_agent'? 'Delivery details required' : 'Complete your registration'}
        </p>
      </div>

      {formData.role === 'shop_owner' && (
        <>
          <ValidatedInput
            label="Shop Name"
            type="text"
            name="shopName"
            placeholder="Enter your shop name"
            value={formData.shopName}
            onChange={handleInputChange}
            validationType="shopName"
            debounceDelay={600}
            minLength={2}
            required
            description="This will be your shop's display name"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Shop Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shopDescription"
              placeholder="Describe your shop and what you sell..."
              value={formData.shopDescription}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            {errors.shopDescription && (
              <p className="text-sm text-red-500">{errors.shopDescription}</p>
            )}
          </div>

          <Select
            label="Business Category"
            options={businessTypeOptions}
            value={formData.businessType}
            onChange={(value) => handleSelectChange('businessType', value)}
            error={errors.businessType}
            required
            placeholder="Select your business category"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Shop Address"
              type="text"
              name="shopAddress"
              placeholder="Enter your shop address"
              value={formData.shopAddress}
              onChange={handleInputChange}
              error={errors.shopAddress}
              required
            />

            <Input
              label="City"
              type="text"
              name="shopCity"
              placeholder="Enter your city"
              value={formData.shopCity}
              onChange={handleInputChange}
              error={errors.shopCity}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ValidatedInput
              label="Shop Phone (Optional)"
              type="tel"
              name="shopPhone"
              placeholder="Shop phone number"
              value={formData.shopPhone}
              onChange={handleInputChange}
              validationType="shopPhone"
              debounceDelay={700}
              minLength={9}
              description="Leave blank to use your personal phone"
            />

            <ValidatedInput
              label="Shop Email (Optional)"
              type="email"
              name="shopEmail"
              placeholder="Shop email address"
              value={formData.shopEmail}
              onChange={handleInputChange}
              validationType="email"
              debounceDelay={700}
              minLength={5}
              description="Leave blank to use your personal email"
            />
          </div>

          <ValidatedInput
            label="Business License (Optional)"
            type="text"
            name="businessLicense"
            placeholder="Business license number"
            value={formData.businessLicense}
            onChange={handleInputChange}
            validationType="businessLicense"
            debounceDelay={800}
            minLength={3}
            description="Helps build trust with customers"
          />

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Shop Creation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your shop will be created automatically when you complete registration. 
                  You can customize it further from your dashboard.
                </p>
              </div>
            </div>
          </div>
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
            error={errors.idDocument}
            description="Optional: National ID or passport number for verification"
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

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}
      
      {errors.success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{errors.success}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      <Stepper
        initialStep={1}
        onStepChange={(step) => {
          console.log('Step change requested:', step, 'Current step:', currentStep);
          if (step > currentStep) {
            // Moving forward - validate current step
            if (validateStep(currentStep)) {
              console.log('Step validation passed, moving to step:', step);
              setCurrentStep(step);
              setErrors({});
            } else {
              console.log('Step validation failed, preventing step change');
              return false; // Prevent step change
            }
          } else {
            // Moving backward - always allow
            console.log('Moving backward to step:', step);
            setCurrentStep(step);
            setErrors({});
          }
        }}
        onFinalStepCompleted={() => {
          // When final step is completed, proceed with registration
          // All validation has already been done in previous steps
          console.log('Final step completed, calling handleSubmit');
          console.log('Current form data:', formData);
          console.log('Current step:', currentStep);
          console.log('Total steps:', getTotalSteps());
          
          // Temporarily set current step to indicate final completion
          setCurrentStep(getTotalSteps() + 1);
          
          // Call handleSubmit with a special flag
          const syntheticEvent = new Event('submit');
          syntheticEvent.fromFinalStep = true;
          handleSubmit(syntheticEvent);
        }}
        backButtonText="Previous"
        nextButtonText="Next"
        disableStepIndicators={false}
      >
        <Step>
          {renderStep1()}
        </Step>
        <Step>
          {renderStep2()}
        </Step>
        <Step>
          {renderStep3()}
        </Step>
      </Stepper>
    </div>
  );
};

export default RegisterForm;

