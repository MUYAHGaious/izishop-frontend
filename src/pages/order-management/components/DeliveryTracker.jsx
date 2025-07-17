import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const DeliveryTracker = ({ deliveries, onUpdateDelivery, onAssignAgent }) => {
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [photoProof, setPhotoProof] = useState(null);

  const deliveryStatuses = [
    { value: 'assigned', label: 'Assigned', icon: 'UserCheck', color: 'text-primary' },
    { value: 'picked_up', label: 'Picked Up', icon: 'Package', color: 'text-secondary' },
    { value: 'in_transit', label: 'In Transit', icon: 'Truck', color: 'text-accent' },
    { value: 'delivered', label: 'Delivered', icon: 'CheckCircle', color: 'text-success' },
    { value: 'failed', label: 'Failed', icon: 'XCircle', color: 'text-error' }
  ];

  const deliveryAgents = [
    { value: 'agent1', label: 'Jean Mballa - Available', status: 'available' },
    { value: 'agent2', label: 'Marie Fouda - On Route', status: 'busy' },
    { value: 'agent3', label: 'Paul Nkomo - Available', status: 'available' },
    { value: 'agent4', label: 'Grace Tabi - Offline', status: 'offline' }
  ];

  const getStatusBadge = (status) => {
    const statusInfo = deliveryStatuses.find(s => s.value === status);
    if (!statusInfo) return null;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted/30 ${statusInfo.color}`}>
        <Icon name={statusInfo.icon} size={12} className="mr-1" />
        {statusInfo.label}
      </span>
    );
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

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhotoProof(file);
    }
  };

  const handleDeliveryConfirmation = (deliveryId) => {
    if (photoProof) {
      onUpdateDelivery(deliveryId, 'delivered', { photoProof });
      setPhotoProof(null);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Delivery Tracking</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Real-time updates</span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Agent
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ETA
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-muted/30 transition-micro">
                <td className="px-4 py-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">#{delivery.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">{delivery.destination}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-foreground">{delivery.customerName}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-foreground">{delivery.agentName || 'Unassigned'}</div>
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(delivery.status)}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-foreground">{delivery.eta}</div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDelivery(delivery)}
                      iconName="Eye"
                      iconSize={14}
                    >
                      Track
                    </Button>
                    {!delivery.agentName && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAssignAgent(delivery.id)}
                        iconName="UserPlus"
                        iconSize={14}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="p-4 border border-border rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-foreground">#{delivery.orderNumber}</div>
                <div className="text-xs text-muted-foreground">{delivery.customerName}</div>
              </div>
              {getStatusBadge(delivery.status)}
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Destination:</span>
                <span className="text-sm text-foreground">{delivery.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Agent:</span>
                <span className="text-sm text-foreground">{delivery.agentName || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">ETA:</span>
                <span className="text-sm text-foreground">{delivery.eta}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDelivery(delivery)}
                iconName="Eye"
                iconPosition="left"
                iconSize={14}
                fullWidth
              >
                Track Delivery
              </Button>
              {!delivery.agentName && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAssignAgent(delivery.id)}
                  iconName="UserPlus"
                  iconSize={14}
                >
                  Assign
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1200 p-4">
          <div className="bg-surface rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Delivery Tracking - #{selectedDelivery.orderNumber}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDelivery(null)}
                iconName="X"
                iconSize={20}
              />
            </div>
            
            <div className="p-6 space-y-6">
              {/* Delivery Map */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Live Location</h4>
                <div className="h-64 bg-muted/30 rounded-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    loading="lazy"
                    title="Delivery Route"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=4.0511,9.7679&z=14&output=embed"
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* Status Updates */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Status Updates</h4>
                <div className="space-y-3">
                  {selectedDelivery.statusHistory?.map((status, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{status.message}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(status.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-sm">No status updates available</p>
                  )}
                </div>
              </div>

              {/* Delivery Confirmation */}
              {selectedDelivery.status === 'in_transit' && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Delivery Confirmation</h4>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      label="Upload Photo Proof"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                    
                    <Button
                      variant="success"
                      fullWidth
                      onClick={() => handleDeliveryConfirmation(selectedDelivery.id)}
                      disabled={!photoProof}
                      iconName="CheckCircle"
                      iconPosition="left"
                    >
                      Confirm Delivery
                    </Button>
                  </div>
                </div>
              )}

              {/* Agent Assignment */}
              {!selectedDelivery.agentName && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Assign Delivery Agent</h4>
                  <div className="space-y-4">
                    <Select
                      placeholder="Select delivery agent"
                      options={deliveryAgents.map(agent => ({
                        ...agent,
                        disabled: agent.status === 'offline'
                      }))}
                      onChange={(value) => onAssignAgent(selectedDelivery.id, value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;