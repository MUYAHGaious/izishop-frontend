import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';

const OrderDetailsModal = ({ order, isOpen, onClose, onStatusUpdate, onAssignDelivery, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [message, setMessage] = useState('');
  const [deliveryAgent, setDeliveryAgent] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  if (!isOpen || !order) return null;

  const deliveryAgents = [
    { value: 'agent1', label: 'Jean Mballa - Douala Zone' },
    { value: 'agent2', label: 'Marie Fouda - Yaoundé Centre' },
    { value: 'agent3', label: 'Paul Nkomo - Bamenda' },
    { value: 'agent4', label: 'Grace Tabi - Bafoussam' }
  ];

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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon name={config.icon} size={14} className="mr-2" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(order.id, message);
      setMessage('');
    }
  };

  const handleAssignDelivery = () => {
    if (deliveryAgent) {
      onAssignDelivery(order.id, deliveryAgent);
      setDeliveryAgent('');
    }
  };

  const tabs = [
    { id: 'details', label: 'Order Details', icon: 'FileText' },
    { id: 'customer', label: 'Customer Info', icon: 'User' },
    { id: 'delivery', label: 'Delivery', icon: 'Truck' },
    { id: 'payment', label: 'Payment', icon: 'CreditCard' },
    { id: 'communication', label: 'Messages', icon: 'MessageSquare' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1200 p-4">
      <div className="bg-surface rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-foreground">Order #{order.orderNumber}</h2>
            {getStatusBadge(order.status)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-micro ${
                  activeTab === tab.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Order Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date:</span>
                      <span className="text-foreground">{formatDate(order.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="text-foreground">{order.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="text-foreground">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee:</span>
                      <span className="text-foreground">{formatCurrency(order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">Total:</span>
                      <span className="text-foreground">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Status Management</h3>
                  <div className="space-y-4">
                    <Select
                      label="Update Status"
                      options={statusOptions}
                      value={order.status}
                      onChange={(value) => onStatusUpdate(order.id, value)}
                    />
                    
                    <Input
                      label="Tracking Number"
                      placeholder="Enter tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    
                    <Button
                      variant="outline"
                      fullWidth
                      iconName="Printer"
                      iconPosition="left"
                      onClick={() => console.log('Print shipping label')}
                    >
                      Print Shipping Label
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="text-sm font-medium text-foreground">{formatCurrency(item.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Customer Info Tab */}
          {activeTab === 'customer' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Customer Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-foreground">{order.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground">{order.customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-foreground">{order.customer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer Since:</span>
                      <span className="text-foreground">{formatDate(order.customer.joinDate)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Delivery Address</h3>
                  <div className="space-y-2">
                    <p className="text-foreground">{order.deliveryAddress.street}</p>
                    <p className="text-foreground">{order.deliveryAddress.city}, {order.deliveryAddress.region}</p>
                    <p className="text-foreground">{order.deliveryAddress.postalCode}</p>
                    <p className="text-muted-foreground">Phone: {order.deliveryAddress.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Tab */}
          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Delivery Assignment</h3>
                  <div className="space-y-4">
                    <Select
                      label="Assign Delivery Agent"
                      placeholder="Select delivery agent"
                      options={deliveryAgents}
                      value={deliveryAgent}
                      onChange={setDeliveryAgent}
                    />
                    
                    <Button
                      variant="default"
                      fullWidth
                      onClick={handleAssignDelivery}
                      disabled={!deliveryAgent}
                      iconName="UserPlus"
                      iconPosition="left"
                    >
                      Assign Agent
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Delivery Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Icon name="MapPin" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">Estimated delivery: 2-3 business days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Truck" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">Current agent: {order.assignedAgent || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Map Placeholder */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Delivery Route</h3>
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <iframe
                    width="100%"
                    height="100%"
                    loading="lazy"
                    title="Delivery Location"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=4.0511,9.7679&z=14&output=embed"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Payment Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="text-foreground">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="text-foreground font-mono text-sm">{order.transactionId}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Escrow Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Icon name="Shield" size={16} className="text-success" />
                      <span className="text-sm text-foreground">Funds secured in escrow</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Clock" size={16} className="text-warning" />
                      <span className="text-sm text-foreground">Release pending delivery confirmation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Send Message to Customer</h3>
                <div className="space-y-4">
                  <Input
                    type="textarea"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="default"
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      iconName="Send"
                      iconPosition="left"
                    >
                      Send Message
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => console.log('Send notification')}
                      iconName="Bell"
                      iconPosition="left"
                    >
                      Send Notification
                    </Button>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Message History</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {order.messages?.map((msg, index) => (
                    <div key={index} className={`p-3 rounded-lg ${msg.sender === 'shop' ? 'bg-primary/10 ml-8' : 'bg-muted/30 mr-8'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{msg.sender === 'shop' ? 'You' : order.customer.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(msg.timestamp)}</span>
                      </div>
                      <p className="text-sm text-foreground">{msg.content}</p>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-8">No messages yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last updated: {formatDate(order.lastUpdated)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            
            <Button
              variant="default"
              onClick={() => console.log('Save changes')}
              iconName="Save"
              iconPosition="left"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;