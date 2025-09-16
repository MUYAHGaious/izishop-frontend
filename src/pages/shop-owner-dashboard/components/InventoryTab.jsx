import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const InventoryTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Load products from API
  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      const products = await api.getMyProducts(0, 200, false); // Get all products including inactive

      // Transform API response to match inventory structure
      const transformedInventory = products.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.id.slice(-8), // Use last 8 chars of ID as SKU for now
        category: product.category || 'Uncategorized',
        currentStock: product.stock_quantity || 0,
        minStock: 10, // Default reorder point - this should come from product model later
        maxStock: 100, // Default max stock - this should be configurable later
        unitCost: 0, // Cost price - not available in current model, will be 0 for now
        sellingPrice: parseFloat(product.price || 0),
        supplier: 'N/A', // Supplier info not in current model
        lastRestocked: product.updated_at || product.created_at,
        image: (product.image_urls && product.image_urls.length > 0)
               ? product.image_urls[0]
               : '/assets/images/no_image.png',
        status: product.stock_quantity === 0
                ? 'out_of_stock'
                : product.stock_quantity <= 10
                ? 'low_stock'
                : 'in_stock',
        isActive: product.is_active
      }));

      setInventory(transformedInventory);
    } catch (error) {
      console.error('Error loading inventory:', error);
      showToast({
        type: 'error',
        message: 'Failed to load inventory.',
        duration: 3000
      });

      // Set empty state
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load inventory on component mount
  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Handle stock updates
  const handleStockUpdate = async (productId, newQuantity) => {
    try {
      setUpdating(true);
      const currentProduct = inventory.find(item => item.id === productId);
      const quantityChange = newQuantity - currentProduct.currentStock;

      await api.updateProductStock(productId, quantityChange);

      // Update local state
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.id === productId
            ? {
                ...item,
                currentStock: newQuantity,
                status: newQuantity === 0
                        ? 'out_of_stock'
                        : newQuantity <= item.minStock
                        ? 'low_stock'
                        : 'in_stock'
              }
            : item
        )
      );

      showToast({
        type: 'success',
        message: 'Stock updated successfully',
        duration: 2000
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      showToast({
        type: 'error',
        message: 'Failed to update stock',
        duration: 3000
      });
    } finally {
      setUpdating(false);
    }
  };

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
      {/* Alerts - Only show when not loading and there are items */}
      {!loading && (lowStockItems.length > 0 || outOfStockItems.length > 0) && (
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
        {loading ? (
          // Loading skeleton
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-muted rounded"></div>
                    <div className="w-24 h-3 bg-muted rounded"></div>
                  </div>
                  <div className="w-16 h-4 bg-muted rounded"></div>
                  <div className="w-20 h-6 bg-muted rounded-full"></div>
                  <div className="w-24 h-4 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredInventory.length === 0 ? (
          // Empty state
          <div className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Icon name="Package" size={48} className="text-muted" />
              <h3 className="text-lg font-medium text-text-primary">No inventory found</h3>
              <p className="text-text-secondary">
                {searchQuery || stockFilter
                  ? "Try adjusting your search or filter criteria"
                  : "Add products to see your inventory here"
                }
              </p>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Pagination - Only show when there are items */}
      {!loading && filteredInventory.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-text-secondary">
            Showing {filteredInventory.length} of {inventory.length} items
            {searchQuery && ` matching "${searchQuery}"`}
            {stockFilter && ` with status "${stockFilterOptions.find(opt => opt.value === stockFilter)?.label}"`}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="RefreshCw"
              iconPosition="left"
              onClick={loadInventory}
              disabled={updating}
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;