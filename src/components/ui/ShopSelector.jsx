import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import { showToast } from './Toast';
import api from '../../services/api';

const ShopSelector = ({ onShopSelect, showCreateOption = true, className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'SHOP_OWNER') {
      fetchUserShops();
    }
  }, [user]);

  const fetchUserShops = async () => {
    try {
      setLoading(true);
      const userShops = await api.getMyShops();
      setShops(userShops || []);
      
      // Auto-select first shop if only one exists
      if (userShops.length === 1) {
        setSelectedShop(userShops[0]);
        if (onShopSelect) {
          onShopSelect(userShops[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user shops:', error);
      showToast({
        type: 'error',
        message: 'Failed to load your shops',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    setIsOpen(false);
    if (onShopSelect) {
      onShopSelect(shop);
    }
  };

  const handleCreateNewShop = () => {
    setIsOpen(false);
    navigate('/shops-listing');
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-gray-500">Loading shops...</span>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <Icon name="AlertCircle" size={16} className="text-yellow-600 mr-2" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">No shops found</p>
            <p className="text-xs text-yellow-700 mt-1">Create your first shop to get started</p>
          </div>
          {showCreateOption && (
            <button
              onClick={handleCreateNewShop}
              className="ml-3 px-3 py-1 bg-yellow-600 text-white rounded-md text-xs hover:bg-yellow-700 transition-colors"
            >
              Create Shop
            </button>
          )}
        </div>
      </div>
    );
  }

  if (shops.length === 1) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <Icon name="Store" size={16} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">{shops[0].name}</p>
            <p className="text-xs text-green-700">Your active shop</p>
          </div>
          <button
            onClick={() => navigate(`/shop-profile/${shops[0].id}`)}
            className="ml-2 p-1 hover:bg-green-100 rounded transition-colors"
            title="View shop"
          >
            <Icon name="ExternalLink" size={14} className="text-green-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-primary/50 transition-colors"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Icon name="Store" size={16} className="text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              {selectedShop ? selectedShop.name : 'Select a shop'}
            </p>
            <p className="text-xs text-gray-500">
              {selectedShop ? 'Active shop' : `${shops.length} shops available`}
            </p>
          </div>
        </div>
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-gray-400" 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 font-medium px-2 py-1 mb-2">
              Your Shops ({shops.length})
            </div>
            
            {shops.map((shop) => (
              <button
                key={shop.id}
                onClick={() => handleShopSelect(shop)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors text-left ${
                  selectedShop?.id === shop.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <Icon name="Store" size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{shop.name}</p>
                  <p className="text-xs text-gray-500 truncate">{shop.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      shop.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {shop.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                {selectedShop?.id === shop.id && (
                  <Icon name="Check" size={16} className="text-primary" />
                )}
              </button>
            ))}

            {showCreateOption && (
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleCreateNewShop}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Icon name="Plus" size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create New Shop</p>
                    <p className="text-xs text-gray-500">Set up another shop</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopSelector;