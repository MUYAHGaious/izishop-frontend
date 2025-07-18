import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import api from '../../services/api';

const MyShopProfile = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchShopData();
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let shopData;
      if (shopId) {
        // Load specific shop by ID
        shopData = await api.getShop(shopId);
      } else {
        // Load user's own shop
        shopData = await api.getMyShop();
      }
      
      setShop(shopData);
      setEditData({
        name: shopData.name,
        description: shopData.description || '',
        address: shopData.address || '',
        phone: shopData.phone || '',
        email: shopData.email || ''
      });
    } catch (err) {
      setError(err.message || 'Failed to load shop data');
      console.error('Shop data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      name: shop.name,
      description: shop.description || '',
      address: shop.address || '',
      phone: shop.phone || '',
      email: shop.email || ''
    });
  };

  const handleSave = async () => {
    try {
      const updatedShop = await api.updateMyShop(editData);
      setShop(updatedShop);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update shop');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shop profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Icon name="AlertCircle" size={48} className="text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Shop</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={fetchShopData} className="bg-red-600 hover:bg-red-700">
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/shop-owner-dashboard')}>
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Shop Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Banner Area */}
          <div className="h-48 bg-gradient-to-r from-primary to-blue-600 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Shop Logo */}
                <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="Store" size={32} className="text-primary" />
                </div>
                
                {/* Shop Info */}
                <div className="flex-1 text-white">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{shop.name}</h1>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={16} />
                      <span>Created {new Date(shop.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="CheckCircle" size={16} />
                      <span>{shop.is_verified ? 'Verified' : 'Pending Verification'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  {user?.id === shop.owner_id && !isEditing && (
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      className="bg-white text-primary hover:bg-gray-100"
                    >
                      <Icon name="Edit2" size={16} className="mr-2" />
                      Edit Shop
                    </Button>
                  )}
                  {isEditing && (
                    <>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="bg-white text-gray-600 hover:bg-gray-100"
                      >
                        <Icon name="X" size={16} className="mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-white text-primary hover:bg-gray-100"
                      >
                        <Icon name="Save" size={16} className="mr-2" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">About Our Shop</h2>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Describe your shop and what you sell..."
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {shop.description || 'No description provided yet.'}
                </p>
              )}
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Products</h2>
                <Button onClick={() => navigate('/add-product')}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Add Product
                </Button>
              </div>
              <div className="text-center py-12">
                <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Products Yet</h3>
                <p className="text-gray-500 mb-4">Start adding products to showcase your inventory</p>
                <Button onClick={() => navigate('/add-product')}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Add Your First Product
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shop Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Shop Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Products</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-semibold">XAF 0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shop Rating</span>
                  <div className="flex items-center gap-1">
                    <Icon name="Star" size={16} className="text-yellow-400 fill-current" />
                    <span className="font-semibold">5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <input
                      name="address"
                      value={editData.address}
                      onChange={handleInputChange}
                      placeholder="Shop address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      placeholder="Email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </>
                ) : (
                  <>
                    {shop.address && (
                      <div className="flex items-start gap-3">
                        <Icon name="MapPin" size={16} className="text-gray-400 mt-0.5" />
                        <span className="text-gray-600">{shop.address}</span>
                      </div>
                    )}
                    {shop.phone && (
                      <div className="flex items-center gap-3">
                        <Icon name="Phone" size={16} className="text-gray-400" />
                        <span className="text-gray-600">{shop.phone}</span>
                      </div>
                    )}
                    {shop.email && (
                      <div className="flex items-center gap-3">
                        <Icon name="Mail" size={16} className="text-gray-400" />
                        <span className="text-gray-600">{shop.email}</span>
                      </div>
                    )}
                    {!shop.address && !shop.phone && !shop.email && (
                      <p className="text-gray-500 text-sm">No contact information provided</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/add-product')}
                >
                  <Icon name="Package" size={16} className="mr-3" />
                  Add Products
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/shop-owner-dashboard')}
                >
                  <Icon name="BarChart3" size={16} className="mr-3" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/order-management')}
                >
                  <Icon name="ShoppingBag" size={16} className="mr-3" />
                  View Orders
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyShopProfile;