import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package } from 'lucide-react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DashboardHeader = ({ shopData, notifications }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-2xl relative overflow-hidden">
      {/* Blur circle effects like landing page */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 -translate-x-32 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 translate-x-24 pointer-events-none"></div>
      
      <div className="relative z-10 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Shop Info */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
              {shopData.profile_photo ? (
                <img
                  src={`https://izishop-backend.onrender.com${shopData.profile_photo}`}
                  alt={`${shopData.name} profile`}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <Package size={32} className="text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                {shopData.name}
              </h1>
              <p className="text-teal-100 text-lg mb-3">{shopData.category} • {shopData.location}</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <Icon name="Star" size={16} className="text-yellow-300 fill-current" />
                  <span className="text-sm font-semibold text-white">{shopData.rating}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <Icon name="Users" size={16} className="text-white" />
                  <span className="text-sm font-semibold text-white">{shopData.followers} followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/my-shop-profile')}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl px-6 py-3 font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Icon name="Settings" size={18} className="mr-2" />
              Shop Settings
            </Button>
            <Button 
              onClick={() => navigate('/add-product')}
              className="bg-white text-teal-600 rounded-xl px-6 py-3 font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;