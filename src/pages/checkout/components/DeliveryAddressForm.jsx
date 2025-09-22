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

      // Add some default sample addresses for demo if none exist
      if (storedAddresses.length === 0 && user) {
        const sampleAddresses = [
          {
            id: 1,
            label: "Home",
            fullName: `${user.first_name || 'John'} ${user.last_name || 'Doe'}`,
            phone: user.phone || "+237 655 123 456",
            address: "Bastos, Rue 1020",
            city: "Yaoundé",
            region: "centre",
            postalCode: "999",
            deliveryInstructions: "Ring the bell twice"
          },
          {
            id: 2,
            label: "Office",
            fullName: `${user.first_name || 'John'} ${user.last_name || 'Doe'}`,
            phone: user.phone || "+237 655 123 456",
            address: "Bonanjo, Boulevard de la Liberté",
            city: "Douala",
            region: "littoral",
            postalCode: "999",
            deliveryInstructions: "Reception desk, ask for Mr/Ms " + (user.last_name || 'Doe')
          }
        ];
        setSavedAddresses(sampleAddresses);
        localStorage.setItem(`userAddresses_${user.id}`, JSON.stringify(sampleAddresses));
      } else {
        setSavedAddresses(storedAddresses);
      }
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
    // Form validation is handled by the parent component through validateStep
    // This prevents form submission but allows the Stepper to handle navigation
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
      label: `Address ${savedAddresses.length + 1}`,
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      region: formData.region,
      postalCode: formData.postalCode,
      deliveryInstructions: formData.deliveryInstructions,
      isDefault: savedAddresses.length === 0 // Make first address default
    };

    try {
      // TODO: Replace with actual API call
      // await api.post(`/users/${user.id}/addresses`, addressToSave);

      // For now, save to localStorage
      const updatedAddresses = [...savedAddresses, addressToSave];
      setSavedAddresses(updatedAddresses);
      localStorage.setItem(`userAddresses_${user.id}`, JSON.stringify(updatedAddresses));

      // Show success message
      alert('Address saved successfully!');
      console.log('Address saved successfully');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  const deleteAddress = async (addressId) => {
    if (!user?.id) return;
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      // TODO: Replace with actual API call
      // await api.delete(`/users/${user.id}/addresses/${addressId}`);

      // For now, remove from localStorage
      const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
      setSavedAddresses(updatedAddresses);
      localStorage.setItem(`userAddresses_${user.id}`, JSON.stringify(updatedAddresses));

      console.log('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  return (
    <div>
      {/* Address Book Button */}
      <div className="text-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddressBook(!showAddressBook)}
          iconName="BookOpen"
          iconPosition="left"
          className="border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400 text-sm"
        >
          {t('checkout.addressBook')}
        </Button>
      </div>

      {/* Address Book */}
      {showAddressBook && (
        <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-teal-800">Saved Addresses</h3>
            <button
              onClick={saveCurrentAddress}
              className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Save Current
            </button>
          </div>

          {isLoadingAddresses ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-teal-600 text-sm">Loading addresses...</span>
            </div>
          ) : savedAddresses.length === 0 ? (
            <div className="text-center py-6">
              <Icon name="MapPin" size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No saved addresses yet</p>
              <p className="text-xs text-gray-400">Fill out the form below and click "Save Current" to add an address</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className="p-3 bg-white rounded-lg border border-teal-200 hover:border-teal-400 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => selectSavedAddress(address)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="bg-teal-100 p-1.5 rounded-lg">
                          <Icon name="MapPin" size={14} className="text-teal-600" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{address.label}</span>
                        {address.isDefault && (
                          <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-2 ml-8">
                        {address.fullName} • {address.phone}
                      </p>
                      <p className="text-xs text-gray-600 ml-8">
                        {address.address}, {address.city}, {address.region}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSavedAddress(address);
                        }}
                        className="p-1 text-teal-600 hover:bg-teal-100 rounded"
                        title="Use this address"
                      >
                        <Icon name="Check" size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAddress(address.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Delete address"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form */}
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
            placeholder="+237 6XX XXX XXX"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </form>
    </div>
  );
};

export default DeliveryAddressForm;