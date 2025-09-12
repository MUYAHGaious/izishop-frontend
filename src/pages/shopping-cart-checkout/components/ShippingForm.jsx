import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ShippingForm = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    postalCode: ''
  });
  const [selectedAddress, setSelectedAddress] = useState('');
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [errors, setErrors] = useState({});

  const savedAddresses = [
    { value: '', label: 'Enter new address' },
    { value: 'home', label: 'Home - 123 Rue de la Paix, Yaoundé' },
    { value: 'work', label: 'Work - 456 Avenue Kennedy, Douala' }
  ];

  const regions = [
    { value: '', label: 'Select region' },
    { value: 'centre', label: 'Centre' },
    { value: 'littoral', label: 'Littoral' },
    { value: 'ouest', label: 'Ouest' },
    { value: 'nord-ouest', label: 'Nord-Ouest' },
    { value: 'sud-ouest', label: 'Sud-Ouest' },
    { value: 'adamaoua', label: 'Adamaoua' },
    { value: 'est', label: 'Est' },
    { value: 'nord', label: 'Nord' },
    { value: 'extreme-nord', label: 'Extrême-Nord' },
    { value: 'sud', label: 'Sud' }
  ];

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '5-7 business days',
      price: 2500,
      icon: 'Truck'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '2-3 business days',
      price: 5000,
      icon: 'Zap'
    },
    {
      id: 'same-day',
      name: 'Same Day Delivery',
      description: 'Within 24 hours',
      price: 10000,
      icon: 'Clock'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddressSelect = (value) => {
    setSelectedAddress(value);
    if (value === 'home') {
      setFormData(prev => ({
        ...prev,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+237 6 12 34 56 78',
        address: '123 Rue de la Paix',
        city: 'Yaoundé',
        region: 'centre',
        postalCode: '1234'
      }));
    } else if (value === 'work') {
      setFormData(prev => ({
        ...prev,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+237 6 12 34 56 78',
        address: '456 Avenue Kennedy',
        city: 'Douala',
        region: 'littoral',
        postalCode: '5678'
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.region) newErrors.region = 'Region is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext({ shippingData: formData, deliveryOption });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Saved Addresses */}
        <div>
          <Select
            label="Saved Addresses"
            description="Choose from your saved addresses or enter a new one"
            options={savedAddresses}
            value={selectedAddress}
            onChange={handleAddressSelect}
            className="mb-6"
          />
        </div>

        {/* Contact Information */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              required
            />
            
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
            />
            
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="+237 6 12 34 56 78"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              required
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Shipping Address
          </h3>
          
          <div className="space-y-4">
            <Input
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              error={errors.address}
              required
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                error={errors.city}
                required
              />
              
              <Select
                label="Region"
                options={regions}
                value={formData.region}
                onChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                error={errors.region}
                required
              />
              
              <Input
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Delivery Options
          </h3>
          
          <div className="space-y-3">
            {deliveryOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  deliveryOption === option.id
                    ? 'border-primary bg-primary/5' :'border-border hover:bg-muted'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={option.id}
                  checked={deliveryOption === option.id}
                  onChange={(e) => setDeliveryOption(e.target.value)}
                  className="sr-only"
                />
                
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${
                  deliveryOption === option.id
                    ? 'border-primary bg-primary' :'border-border'
                }`}>
                  {deliveryOption === option.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                
                <Icon name={option.icon} size={20} className="text-text-secondary mr-3" />
                
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{option.name}</div>
                  <div className="text-sm text-text-secondary">{option.description}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-text-primary">
                    {option.price === 0 ? 'Free' : formatPrice(option.price)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            iconName="ArrowLeft"
            iconPosition="left"
            className="sm:w-auto"
          >
            Back to Cart
          </Button>
          
          <Button
            type="submit"
            variant="default"
            iconName="ArrowRight"
            iconPosition="right"
            className="sm:flex-1"
          >
            Continue to Payment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShippingForm;