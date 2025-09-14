import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const DeliveryAddressForm = ({ formData, setFormData }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Load user's saved addresses on component mount
  useEffect(() => {
    loadUserAddresses();
    // Pre-fill with user data if form is empty
    if (user && !formData.fullName) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const loadUserAddresses = async () => {
    if (!user?.id) return;

    setIsLoadingAddresses(true);
    try {
      // TODO: Replace with actual API call to get user's saved addresses
      // const addresses = await api.get(`/users/${user.id}/addresses`);
      // setSavedAddresses(addresses.data);

      // For now, load from localStorage as fallback
      const storedAddresses = JSON.parse(localStorage.getItem(`userAddresses_${user.id}`) || '[]');
      setSavedAddresses(storedAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

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
    setFormData(prev => ({
      ...prev,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      deliveryInstructions: address.deliveryInstructions || prev.deliveryInstructions
    }));
    setShowAddressBook(false);
  };

  const saveCurrentAddress = async () => {
    if (!user?.id || !validateForm()) return;

    const addressToSave = {
      id: Date.now(), // Temporary ID
      label: "New Address",
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      region: formData.region,
      postalCode: formData.postalCode,
      deliveryInstructions: formData.deliveryInstructions
    };

    try {
      // TODO: Replace with actual API call
      // await api.post(`/users/${user.id}/addresses`, addressToSave);

      // For now, save to localStorage
      const updatedAddresses = [...savedAddresses, addressToSave];
      setSavedAddresses(updatedAddresses);
      localStorage.setItem(`userAddresses_${user.id}`, JSON.stringify(updatedAddresses));

      // Show success message or toast
      console.log('Address saved successfully');
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-3 rounded-xl">
              <Icon name="MapPin" size={24} className="text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('checkout.deliveryAddress')}</h2>
          </div>
          <p className="text-gray-600">{t('checkout.deliveryAddressDesc')}</p>
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddressBook(!showAddressBook)}
              iconName="BookOpen"
              iconPosition="left"
              className="border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400"
            >
              {t('checkout.addressBook')}
            </Button>
          </div>
        </div>

        {/* Address Book */}
        {showAddressBook && (
          <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border border-teal-200">
            <h3 className="text-lg font-semibold text-teal-800 mb-4">Saved Addresses</h3>
            <div className="space-y-3">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className="p-4 bg-white rounded-xl border border-teal-200 cursor-pointer hover:border-teal-400 hover:shadow-md transition-all duration-300"
                  onClick={() => selectSavedAddress(address)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-2 rounded-lg">
                          <Icon name="MapPin" size={16} className="text-teal-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{address.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 ml-11">
                        {address.fullName} • {address.phone}
                      </p>
                      <p className="text-sm text-gray-600 ml-11">
                        {address.address}, {address.city}, {address.region}
                      </p>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-teal-600" />
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

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              variant="default"
              iconName="ArrowRight"
              iconPosition="right"
              className="min-w-40 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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