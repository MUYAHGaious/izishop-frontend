import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FlashSaleSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset timer when it reaches 0
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Flash sale products
  const flashSaleProducts = [
    {
      id: 1,
      name: "Wireless Bluetooth Earbuds",
      originalPrice: 85000,
      salePrice: 42500,
      discount: 50,
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop",
      stock: 15,
      sold: 234
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      originalPrice: 150000,
      salePrice: 90000,
      discount: 40,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      stock: 8,
      sold: 156
    },
    {
      id: 3,
      name: "Portable Power Bank",
      originalPrice: 45000,
      salePrice: 22500,
      discount: 50,
      image: "https://images.unsplash.com/photo-1609592806787-3d9c5b5b7e5e?w=300&h=300&fit=crop",
      stock: 25,
      sold: 89
    },
    {
      id: 4,
      name: "LED Desk Lamp",
      originalPrice: 35000,
      salePrice: 17500,
      discount: 50,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
      stock: 12,
      sold: 67
    },
    {
      id: 5,
      name: "Wireless Phone Charger",
      originalPrice: 25000,
      salePrice: 15000,
      discount: 40,
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop",
      stock: 30,
      sold: 123
    }
  ];

  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  return (
    <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-12 right-8 w-8 h-8 bg-yellow-300 rounded-full animate-bounce"></div>
        <div className="absolute bottom-8 left-12 w-12 h-12 bg-orange-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 right-16 w-6 h-6 bg-red-300 rounded-full animate-bounce"></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-pulse">
                <Icon name="Zap" size={20} className="text-orange-500" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                ⚡ FLASH SALE
              </h2>
            </div>
            
            {/* Countdown Timer */}
            <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Icon name="Clock" size={16} className="text-white" />
              <span className="text-white text-sm font-medium">Ends in:</span>
              <div className="flex items-center space-x-1">
                <div className="bg-white text-red-500 font-bold text-sm px-2 py-1 rounded min-w-[32px] text-center">
                  {formatNumber(timeLeft.hours)}
                </div>
                <span className="text-white font-bold">:</span>
                <div className="bg-white text-red-500 font-bold text-sm px-2 py-1 rounded min-w-[32px] text-center">
                  {formatNumber(timeLeft.minutes)}
                </div>
                <span className="text-white font-bold">:</span>
                <div className="bg-white text-red-500 font-bold text-sm px-2 py-1 rounded min-w-[32px] text-center">
                  {formatNumber(timeLeft.seconds)}
                </div>
              </div>
            </div>
          </div>

          <Button 
            variant="secondary" 
            className="bg-white text-orange-500 hover:bg-gray-100 font-semibold"
          >
            View All Flash Deals
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>

        {/* Flash Sale Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {flashSaleProducts.map((product, index) => (
            <div 
              key={product.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  -{product.discount}%
                </div>
                
                {/* Stock indicator */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    <div className="flex justify-between text-white text-xs mb-1">
                      <span>Sold: {product.sold}</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-1">
                      <div 
                        className="bg-orange-400 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${(product.sold / (product.sold + product.stock)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {product.name}
                </h3>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-red-500">
                      {formatPrice(product.salePrice)} XAF
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 line-through">
                      {formatPrice(product.originalPrice)} XAF
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      Save {formatPrice(product.originalPrice - product.salePrice)} XAF
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button 
                  size="sm" 
                  fullWidth 
                  className="mt-3 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  <Icon name="ShoppingCart" size={14} className="mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-6 py-3">
            <Icon name="Gift" size={20} className="text-white" />
            <span className="text-white font-medium">
              🔥 Limited Time Offers - Don't Miss Out!
            </span>
            <Icon name="TrendingUp" size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 opacity-30">
        <div className="text-white text-6xl font-bold animate-pulse">%</div>
      </div>
      <div className="absolute top-1/4 right-8 transform -translate-y-1/2 opacity-30">
        <div className="text-white text-4xl font-bold animate-bounce">💥</div>
      </div>
    </div>
  );
};

export default FlashSaleSection;

