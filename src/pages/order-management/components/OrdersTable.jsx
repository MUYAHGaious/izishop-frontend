import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const OrdersTable = ({ orders, onOrderSelect, onStatusUpdate, onBulkAction, selectedOrders, onOrderSelection }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-warning/10 text-warning border-warning/20', icon: 'Clock' },
      confirmed: { color: 'bg-primary/10 text-primary border-primary/20', icon: 'CheckCircle' },
      processing: { color: 'bg-secondary/10 text-secondary border-secondary/20', icon: 'Package' },
      shipped: { color: 'bg-accent/10 text-accent border-accent/20', icon: 'Truck' },
      delivered: { color: 'bg-success/10 text-success border-success/20', icon: 'CheckCircle2' },
      cancelled: { color: 'bg-error/10 text-error border-error/20', icon: 'X' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onOrderSelection(orders.map(order => order.id));
    } else {
      onOrderSelection([]);
    }
  };

  const handleOrderSelection = (orderId, checked) => {
    if (checked) {
      onOrderSelection([...selectedOrders, orderId]);
    } else {
      onOrderSelection(selectedOrders.filter(id => id !== orderId));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-CM', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={selectedOrders.length === orders.length && orders.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className="text-sm font-medium text-foreground">
              {selectedOrders.length > 0 ? `${selectedOrders.length} selected` : 'Select all'}
            </span>
          </div>
          
          {selectedOrders.length > 0 && (
            <div className="flex items-center space-x-2">
              <Select
                placeholder="Bulk actions"
                options={[
                  { value: 'confirm', label: 'Confirm Orders' },
                  { value: 'process', label: 'Mark as Processing' },
                  { value: 'ship', label: 'Mark as Shipped' },
                  { value: 'cancel', label: 'Cancel Orders' }
                ]}
                onChange={(value) => onBulkAction(value, selectedOrders)}
                className="w-48"
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('customer')}
                  iconName={sortConfig.key === 'customer' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
                  iconPosition="right"
                  iconSize={14}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Customer
                </Button>
              </th>
              <th className="px-6 py-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('date')}
                  iconName={sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
                  iconPosition="right"
                  iconSize={14}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Date
                </Button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
              </th>
              <th className="px-6 py-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('total')}
                  iconName={sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
                  iconPosition="right"
                  iconSize={14}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Total
                </Button>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30 transition-micro">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                    />
                    <div>
                      <div className="text-sm font-medium text-foreground">#{order.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">{order.items.length} items</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">{order.customer.name}</div>
                    <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-foreground">{formatDate(order.date)}</div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">{formatCurrency(order.total)}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOrderSelect(order)}
                      iconName="Eye"
                      iconSize={16}
                    >
                      View
                    </Button>
                    <Select
                      placeholder="Update"
                      options={statusOptions}
                      value={order.status}
                      onChange={(value) => onStatusUpdate(order.id, value)}
                      className="w-32"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-border">
        {orders.map((order) => (
          <div key={order.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                />
                <div>
                  <div className="text-sm font-medium text-foreground">#{order.orderNumber}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(order.date)}</div>
                </div>
              </div>
              {getStatusBadge(order.status)}
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Customer:</span>
                <span className="text-sm text-foreground">{order.customer.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Items:</span>
                <span className="text-sm text-foreground">{order.items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total:</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(order.total)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOrderSelect(order)}
                iconName="Eye"
                iconPosition="left"
                iconSize={14}
                fullWidth
              >
                View Details
              </Button>
              <Select
                placeholder="Status"
                options={statusOptions}
                value={order.status}
                onChange={(value) => onStatusUpdate(order.id, value)}
                className="flex-1"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersTable;