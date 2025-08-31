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
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-xl p-6 text-center ${className}`}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Icon name="Store" size={32} className="text-blue-500" />
          </div>
          <div className="mb-4">
            <p className="text-lg font-bold text-blue-900 mb-2">No shops yet</p>
            <p className="text-sm text-blue-700">Create your first shop and start your entrepreneurial journey!</p>
          </div>
          {showCreateOption && (
            <button
              onClick={handleCreateNewShop}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <Icon name="Plus" size={16} />
              Create Your First Shop
            </button>
          )}
        </div>
      </div>
    );
  }

  if (shops.length === 1) {
    const shop = shops[0];
    return (
      <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
            {shop.profile_photo ? (
              <img src={shop.profile_photo} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Icon name="Store" size={20} className="text-green-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-base font-bold text-green-900 truncate">{shop.name}</p>
              <div className="flex items-center gap-1">
                {shop.is_verified && (
                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                    <Icon name="CheckCircle" size={10} />
                    Verified
                  </span>
                )}
                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Active
                </span>
              </div>
            </div>
            <p className="text-xs text-green-700 truncate">{shop.description || 'Your shop'}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-green-600">
              {shop.address && (
                <div className="flex items-center gap-1">
                  <Icon name="MapPin" size={10} />
                  <span className="truncate max-w-24">{shop.address}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Icon name="Calendar" size={10} />
                <span>Est. {new Date(shop.created_at).getFullYear()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate(`/my-shop-profile/${shop.id}`)}
              className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors group"
              title="View shop"
            >
              <Icon name="ExternalLink" size={16} className="text-green-600 group-hover:text-green-700" />
            </button>
            <button
              onClick={() => navigate('/my-shop-profile')}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors group"
              title="Edit shop"
            >
              <Icon name="Edit" size={16} className="text-blue-600 group-hover:text-blue-700" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
            {selectedShop?.profile_photo ? (
              <img src={selectedShop.profile_photo} alt={selectedShop.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Icon name="Store" size={20} className="text-blue-600" />
            )}
          </div>
          <div className="text-left">
            <p className="text-base font-bold text-blue-900">
              {selectedShop ? selectedShop.name : 'Select a shop'}
            </p>
            <p className="text-sm text-blue-700">
              {selectedShop ? (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Active shop
                </span>
              ) : (
                `${shops.length} shops available`
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedShop && (
            <div className="flex items-center gap-1">
              {selectedShop.is_verified && (
                <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                  <Icon name="CheckCircle" size={10} className="inline" />
                </span>
              )}
            </div>
          )}
          <Icon 
            name={isOpen ? "ChevronUp" : "ChevronDown"} 
            size={18} 
            className="text-blue-500" 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto backdrop-blur-sm">
          <div className="p-3">
            <div className="text-sm text-blue-600 font-bold px-3 py-2 mb-3 bg-blue-50 rounded-lg flex items-center gap-2">
              <Icon name="Store" size={14} />
              Your Shops ({shops.length})
            </div>
            
            {shops.map((shop) => (
              <div
                key={shop.id}
                className={`mb-3 rounded-xl border-2 transition-all duration-200 ${
                  selectedShop?.id === shop.id 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => handleShopSelect(shop)}
                  className="w-full flex items-center p-4 text-left"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                    {shop.profile_photo ? (
                      <img src={shop.profile_photo} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Icon name="Store" size={20} className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-bold text-gray-900 truncate">{shop.name}</p>
                      <div className="flex items-center gap-1">
                        {shop.is_verified && (
                          <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                            <Icon name="CheckCircle" size={10} />
                            Verified
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                          shop.is_active 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full bg-white ${
                            shop.is_active ? 'animate-pulse' : ''
                          }`} />
                          {shop.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-2">{shop.description || 'No description'}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {shop.address && (
                        <div className="flex items-center gap-1">
                          <Icon name="MapPin" size={10} className="text-blue-500" />
                          <span className="truncate max-w-32">{shop.address}</span>
                        </div>
                      )}
                      {shop.phone && (
                        <div className="flex items-center gap-1">
                          <Icon name="Phone" size={10} className="text-green-500" />
                          <span>{shop.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Icon name="Calendar" size={10} className="text-purple-500" />
                        <span>Est. {new Date(shop.created_at).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 ml-3">
                    {selectedShop?.id === shop.id && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Icon name="Check" size={14} className="text-white" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/my-shop-profile/${shop.id}`);
                      }}
                      className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                      title="View shop"
                    >
                      <Icon name="ExternalLink" size={12} className="text-blue-600" />
                    </button>
                  </div>
                </button>
              </div>
            ))}

            {showCreateOption && (
              <div className="border-t-2 border-gray-100 mt-3 pt-3">
                <button
                  onClick={handleCreateNewShop}
                  className="w-full flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-dashed border-green-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                    <Icon name="Plus" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-green-900">Create New Shop</p>
                    <p className="text-sm text-green-700">Expand your business with another shop</p>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-green-600 ml-auto" />
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