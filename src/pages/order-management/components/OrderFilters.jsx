import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const OrderFilters = ({ onFilterChange, activeFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    paymentMethod: '',
    deliveryLocation: '',
    search: '',
    ...activeFilters
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' }
  ];

  const paymentMethodOptions = [
    { value: '', label: 'All Payment Methods' },
    { value: 'mtn_momo', label: 'MTN MoMo' },
    { value: 'orange_money', label: 'Orange Money' },
    { value: 'visa', label: 'Visa Card' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery' }
  ];

  const deliveryLocationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'douala', label: 'Douala' },
    { value: 'yaounde', label: 'Yaoundé' },
    { value: 'bamenda', label: 'Bamenda' },
    { value: 'bafoussam', label: 'Bafoussam' },
    { value: 'garoua', label: 'Garoua' },
    { value: 'maroua', label: 'Maroua' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: '',
      dateRange: '',
      paymentMethod: '',
      deliveryLocation: '',
      search: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              iconName="X"
              iconPosition="left"
              iconSize={14}
            >
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            iconSize={16}
            className="lg:hidden"
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search orders by number, customer name, or email..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filter Controls */}
      <div className={`space-y-4 lg:space-y-0 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          />
          
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={filters.dateRange}
            onChange={(value) => handleFilterChange('dateRange', value)}
          />
          
          <Select
            label="Payment Method"
            options={paymentMethodOptions}
            value={filters.paymentMethod}
            onChange={(value) => handleFilterChange('paymentMethod', value)}
          />
          
          <Select
            label="Delivery Location"
            options={deliveryLocationOptions}
            value={filters.deliveryLocation}
            onChange={(value) => handleFilterChange('deliveryLocation', value)}
          />
        </div>

        {/* Mobile Stack Layout */}
        <div className="lg:hidden space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            />
            
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={filters.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Payment Method"
              options={paymentMethodOptions}
              value={filters.paymentMethod}
              onChange={(value) => handleFilterChange('paymentMethod', value)}
            />
            
            <Select
              label="Delivery Location"
              options={deliveryLocationOptions}
              value={filters.deliveryLocation}
              onChange={(value) => handleFilterChange('deliveryLocation', value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant={filters.status === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('status', filters.status === 'pending' ? '' : 'pending')}
          iconName="Clock"
          iconPosition="left"
          iconSize={14}
        >
          Pending
        </Button>
        
        <Button
          variant={filters.status === 'processing' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('status', filters.status === 'processing' ? '' : 'processing')}
          iconName="Package"
          iconPosition="left"
          iconSize={14}
        >
          Processing
        </Button>
        
        <Button
          variant={filters.status === 'shipped' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('status', filters.status === 'shipped' ? '' : 'shipped')}
          iconName="Truck"
          iconPosition="left"
          iconSize={14}
        >
          Shipped
        </Button>
        
        <Button
          variant={filters.dateRange === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('dateRange', filters.dateRange === 'today' ? '' : 'today')}
          iconName="Calendar"
          iconPosition="left"
          iconSize={14}
        >
          Today
        </Button>
      </div>
    </div>
  );
};

export default OrderFilters;