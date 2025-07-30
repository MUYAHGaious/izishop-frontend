import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DeliveryAddressForm = ({ onNext, formData, setFormData }) => {
  const [errors, setErrors] = useState({});
  const [showAddressBook, setShowAddressBook] = useState(false);

  const savedAddresses = [
    {
      id: 1,
      label: "Home",
      fullName: "Jean Baptiste Mballa",
      phone: "+237 677 123 456",
      address: "Rue de la Paix, Quartier Bastos",
      city: "Yaoundé",
      region: "Centre",
      postalCode: "999"
    },
    {
      id: 2,
      label: "Office",
      fullName: "Jean Baptiste Mballa",
      phone: "+237 677 123 456",
      address: "Avenue Kennedy, Bonanjo",
      city: "Douala",
      region: "Littoral",
      postalCode: "1234"
    }
  ];

  const regions = [
    { value: 'centre', label: 'Centre' },
    { value: 'littoral', label: 'Littoral' },
    { value: 'ouest', label: 'Ouest' },
    { value: 'nord-ouest', label: 'Nord-Ouest' },
    { value: 'sud-ouest', label: 'Sud-Ouest' },
    { value: 'adamaoua', label: 'Adamaoua' },
    { value: 'est', label: 'Est' },
    { value: 'extreme-nord', label: 'Extrême-Nord' },
    { value: 'nord', label: 'Nord' },
    { value: 'sud', label: 'Sud' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName?.trim()) newErrors.fullName = "Full name required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number required";
    if (!formData.address?.trim()) newErrors.address = "Address required";
    if (!formData.city?.trim()) newErrors.city = "City required";
    if (!formData.region) newErrors.region = "Region required";
    if (!formData.postalCode?.trim()) newErrors.postalCode = "Postal code required";
    
    // Phone validation for Cameroon - more flexible
    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/[\s-]/g, '');
      const phoneRegex = /^(\+?237)?[67]\d{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = "Invalid phone format. Use: +237 6XX XXX XXX or 6XX XXX XXX";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectSavedAddress = (address) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode
    });
    setShowAddressBook(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface rounded-lg border border-border p-6 elevation-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Delivery Address</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddressBook(!showAddressBook)}
            iconName="BookOpen"
            iconPosition="left"
          >
            Address Book
          </Button>
        </div>

        {/* Address Book */}
        {showAddressBook && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Saved Addresses</h3>
            <div className="space-y-2">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className="p-3 bg-surface rounded-lg border border-border cursor-pointer hover:border-primary/20 transition-micro"
                  onClick={() => selectSavedAddress(address)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Icon name="MapPin" size={16} className="text-primary" />
                        <span className="font-medium text-foreground">{address.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.fullName} • {address.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.address}, {address.city}, {address.region}
                      </p>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              error={errors.fullName}
              required
            />
            
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+237 6XX XXX XXX or 6XX XXX XXX"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={errors.phone}
              required
            />
          </div>

          <Input
            label="Complete Address"
            type="text"
            placeholder="Street, neighborhood, landmark"
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={errors.address}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              type="text"
              placeholder="Yaoundé, Douala..."
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              error={errors.city}
              required
            />
            
            <Select
              label="Region"
              placeholder="Select a region"
              options={regions}
              value={formData.region || ''}
              onChange={(value) => handleInputChange('region', value)}
              error={errors.region}
              required
            />
            
            <Input
              label="Postal Code"
              type="text"
              placeholder="999"
              value={formData.postalCode || ''}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              error={errors.postalCode}
              required
            />
          </div>

          <Input
            label="Delivery Instructions (Optional)"
            type="text"
            placeholder="Additional information for the delivery person"
            value={formData.deliveryInstructions || ''}
            onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
          />

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="default"
              iconName="ArrowRight"
              iconPosition="right"
              className="min-w-32"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryAddressForm;