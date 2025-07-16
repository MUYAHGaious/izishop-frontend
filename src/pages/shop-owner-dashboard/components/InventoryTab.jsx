import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';

const InventoryTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  const inventory = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      sku: "PWH-001",
      category: "Electronics",
      currentStock: 25,
      minStock: 10,
      maxStock: 100,
      unitCost: 35000,
      sellingPrice: 45000,
      supplier: "TechSupply Co.",
      lastRestocked: "2025-01-10",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
      status: "in_stock"
    },
    {
      id: 2,
      name: "Organic Cotton T-Shirt",
      sku: "OCT-002",
      category: "Fashion",
      currentStock: 0,
      minStock: 20,
      maxStock: 200,
      unitCost: 6000,
      sellingPrice: 8500,
      supplier: "Fashion Hub",
      lastRestocked: "2025-01-05",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
      status: "out_of_stock"
    },
    {
      id: 3,
      name: "Artisan Coffee Beans",
      sku: "ACB-003",
      category: "Food & Beverage",
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      unitCost: 9000,
      sellingPrice: 12000,
      supplier: "Coffee Masters",
      lastRestocked: "2025-01-12",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop",
      status: "low_stock"
    },
    {
      id: 4,
      name: "Handmade Leather Wallet",
      sku: "HLW-004",
      category: "Accessories",
      currentStock: 15,
      minStock: 5,
      maxStock: 30,
      unitCost: 14000,
      sellingPrice: 18500,
      supplier: "Artisan Crafts",
      lastRestocked: "2025-01-08",
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=100&h=100&fit=crop",
      status: "in_stock"
    },
    {
      id: 5,
      name: "Smart Fitness Tracker",
      sku: "SFT-005",
      category: "Electronics",
      currentStock: 42,
      minStock: 20,
      maxStock: 80,
      unitCost: 25000,
      sellingPrice: 32000,
      supplier: "FitTech Solutions",
      lastRestocked: "2025-01-14",
      image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=100&h=100&fit=crop",
      status: "in_stock"
    },
    {
      id: 6,
      name: "Wireless Bluetooth Speaker",
      sku: "WBS-006",
      category: "Electronics",
      currentStock: 3,
      minStock: 8,
      maxStock: 40,
      unitCost: 18000,
      sellingPrice: 24000,
      supplier: "Audio Pro",
      lastRestocked: "2025-01-06",
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop",
      status: "low_stock"
    }
  ];

  const stockFilterOptions = [
    { value: '', label: 'All Items' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  const getStatusBadge = (status, currentStock, minStock) => {
    let statusConfig;
    
    if (currentStock === 0) {
      statusConfig = { label: 'Out of Stock', color: 'text-destructive bg-destructive/10' };
    } else if (currentStock <= minStock) {
      statusConfig = { label: 'Low Stock', color: 'text-warning bg-warning/10' };
    } else {
      statusConfig = { label: 'In Stock', color: 'text-success bg-success/10' };
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  const getStockLevel = (current, min, max) => {
    const percentage = (current / max) * 100;
    let colorClass = 'bg-success';
    
    if (current === 0) {
      colorClass = 'bg-destructive';
    } else if (current <= min) {
      colorClass = 'bg-warning';
    }

    return (
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (stockFilter === 'out_of_stock') {
      matchesFilter = item.currentStock === 0;
    } else if (stockFilter === 'low_stock') {
      matchesFilter = item.currentStock > 0 && item.currentStock <= item.minStock;
    } else if (stockFilter === 'in_stock') {
      matchesFilter = item.currentStock > item.minStock;
    }
    
    return matchesSearch && matchesFilter;
  });

  const lowStockItems = inventory.filter(item => item.currentStock > 0 && item.currentStock <= item.minStock);
  const outOfStockItems = inventory.filter(item => item.currentStock === 0);

  return (
    <div className="p-6">
      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="space-y-3 mb-6">
          {outOfStockItems.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="AlertTriangle" size={20} className="text-destructive" />
                <h3 className="font-medium text-destructive">Out of Stock Alert</h3>
              </div>
              <p className="text-sm text-destructive/80">
                {outOfStockItems.length} item{outOfStockItems.length > 1 ? 's are' : ' is'} out of stock and need immediate restocking.
              </p>
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="AlertCircle" size={20} className="text-warning" />
                <h3 className="font-medium text-warning">Low Stock Warning</h3>
              </div>
              <p className="text-sm text-warning/80">
                {lowStockItems.length} item{lowStockItems.length > 1 ? 's are' : ' is'} running low on stock.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={stockFilterOptions}
            value={stockFilter}
            onChange={setStockFilter}
            placeholder="Filter by stock status"
            className="w-full sm:w-48"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export
          </Button>
          <Button variant="outline" iconName="Package" iconPosition="left">
            Bulk Restock
          </Button>
          <Button variant="default" iconName="Plus" iconPosition="left">
            Add Item
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Product</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">SKU</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Stock Level</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Unit Cost</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Selling Price</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Supplier</th>
                <th className="text-left p-4 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{item.name}</div>
                        <div className="text-sm text-text-secondary">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary font-mono text-sm">{item.sku}</td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">
                          {item.currentStock} / {item.maxStock}
                        </span>
                        <span className="text-xs text-text-secondary">
                          Min: {item.minStock}
                        </span>
                      </div>
                      {getStockLevel(item.currentStock, item.minStock, item.maxStock)}
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(item.status, item.currentStock, item.minStock)}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {item.unitCost.toLocaleString()} XAF
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    {item.sellingPrice.toLocaleString()} XAF
                  </td>
                  <td className="p-4 text-text-secondary">{item.supplier}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" iconName="Package" iconPosition="left">
                        Restock
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon name="MoreHorizontal" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {filteredInventory.map((item) => (
            <div key={item.id} className="p-4 border-b border-border last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-text-primary truncate">{item.name}</h3>
                      <p className="text-sm text-text-secondary">{item.sku}</p>
                    </div>
                    {getStatusBadge(item.status, item.currentStock, item.minStock)}
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Stock:</span>
                      <span className="font-medium">
                        {item.currentStock} / {item.maxStock}
                      </span>
                    </div>
                    {getStockLevel(item.currentStock, item.minStock, item.maxStock)}
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-text-secondary">Price:</span>
                    <span className="font-medium text-text-primary">
                      {item.sellingPrice.toLocaleString()} XAF
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" iconName="Package" iconPosition="left">
                      Restock
                    </Button>
                    <Button variant="ghost" size="sm" iconName="Edit" iconPosition="left">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-text-secondary">
          Showing {filteredInventory.length} of {inventory.length} items
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="ChevronLeft" iconPosition="left">
            Previous
          </Button>
          <Button variant="default" size="sm">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm" iconName="ChevronRight" iconPosition="right">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;