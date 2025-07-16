import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const InventoryAlerts = () => {
  const inventoryAlerts = [
    {
      id: 1,
      name: "Samsung Galaxy A54",
      image: "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?w=150",
      currentStock: 2,
      minStock: 5,
      status: "low_stock",
      category: "Electronics",
      price: "285,000 XAF"
    },
    {
      id: 2,
      name: "Nike Air Max 270",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150",
      currentStock: 0,
      minStock: 3,
      status: "out_of_stock",
      category: "Footwear",
      price: "95,000 XAF"
    },
    {
      id: 3,
      name: "MacBook Pro 13\"",
      image: "https://images.pexels.com/photos/18105/pexels-photo.jpg?w=150",
      currentStock: 1,
      minStock: 2,
      status: "low_stock",
      category: "Electronics",
      price: "1,250,000 XAF"
    },
    {
      id: 4,
      name: "Adidas Ultraboost 22",
      image: "https://images.pixabay.com/photo/2016/11/19/18/06/feet-1840619_1280.jpg?w=150",
      currentStock: 0,
      minStock: 4,
      status: "out_of_stock",
      category: "Footwear",
      price: "125,000 XAF"
    }
  ];

  const getAlertConfig = (status) => {
    switch (status) {
      case 'out_of_stock':
        return {
          color: 'text-error',
          bg: 'bg-error/10',
          border: 'border-error/20',
          label: 'Out of Stock',
          icon: 'AlertTriangle'
        };
      case 'low_stock':
        return {
          color: 'text-warning',
          bg: 'bg-warning/10',
          border: 'border-warning/20',
          label: 'Low Stock',
          icon: 'AlertCircle'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          border: 'border-border',
          label: 'Normal',
          icon: 'CheckCircle'
        };
    }
  };

  const handleRestockAction = (productId) => {
    console.log(`Restock product ${productId}`);
    window.location.href = '/product-management';
  };

  const handleViewProduct = (productId) => {
    console.log(`View product ${productId}`);
  };

  return (
    <div className="bg-surface rounded-lg border border-border elevation-1">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Package" size={20} className="text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Inventory Alerts</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/product-management'}
            iconName="Settings"
            iconPosition="right"
            iconSize={16}
          >
            Manage
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-error/10 rounded-lg border border-error/20">
            <div className="text-2xl font-bold text-error mb-1">
              {inventoryAlerts.filter(item => item.status === 'out_of_stock').length}
            </div>
            <div className="text-sm text-error">Out of Stock</div>
          </div>
          <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="text-2xl font-bold text-warning mb-1">
              {inventoryAlerts.filter(item => item.status === 'low_stock').length}
            </div>
            <div className="text-sm text-warning">Low Stock</div>
          </div>
        </div>

        {/* Alert Items */}
        <div className="space-y-4">
          {inventoryAlerts.map((item) => {
            const alertConfig = getAlertConfig(item.status);
            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-lg border transition-micro hover-scale ${alertConfig.bg} ${alertConfig.border}`}
              >
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{item.price}</p>
                      </div>
                      
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${alertConfig.bg}`}>
                        <Icon name={alertConfig.icon} size={14} className={alertConfig.color} />
                        <span className={`text-xs font-medium ${alertConfig.color}`}>
                          {alertConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Current: </span>
                          <span className={`font-medium ${item.currentStock === 0 ? 'text-error' : 'text-foreground'}`}>
                            {item.currentStock}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Min: </span>
                          <span className="font-medium text-foreground">{item.minStock}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProduct(item.id)}
                          iconName="Eye"
                          iconSize={16}
                        />
                        <Button
                          variant={item.status === 'out_of_stock' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleRestockAction(item.id)}
                          iconName="Plus"
                          iconPosition="left"
                          iconSize={16}
                        >
                          Restock
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => window.location.href = '/product-management'}
              iconName="Package2"
              iconPosition="left"
              iconSize={16}
            >
              Bulk Restock
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => console.log('Generate restock report')}
              iconName="FileText"
              iconPosition="left"
              iconSize={16}
            >
              Restock Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAlerts;