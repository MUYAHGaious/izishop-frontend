import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FlashSaleHero = ({ products }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

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
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.min(products.length, 5));
    }, 4000);

    return () => clearInterval(slideTimer);
  }, [products.length]);

  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % Math.min(products.length, 5));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + Math.min(products.length, 5)) % Math.min(products.length, 5));
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Flash Sale Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Icon name="Zap" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Flash Sale</h2>
              <p className="text-sm text-gray-600">Limited time offers</p>
            </div>
          </div>
          
          {/* Countdown Timer - Compact */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Ends in:</span>
            <div className="flex items-center space-x-1">
              <div className="bg-red-500 text-white font-bold text-sm px-2 py-1 rounded min-w-[30px] text-center">
                {formatNumber(timeLeft.hours)}
              </div>
              <span className="text-gray-600 font-bold">:</span>
              <div className="bg-red-500 text-white font-bold text-sm px-2 py-1 rounded min-w-[30px] text-center">
                {formatNumber(timeLeft.minutes)}
              </div>
              <span className="text-gray-600 font-bold">:</span>
              <div className="bg-red-500 text-white font-bold text-sm px-2 py-1 rounded min-w-[30px] text-center">
                {formatNumber(timeLeft.seconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Products Horizontal Scroll */}
        <div className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {products.slice(0, 8).map((product) => (
              <div key={product.id} className="flex-shrink-0 w-48">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* Discount Badge */}
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{product.discount}%
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg font-bold text-teal-600">
                        {formatPrice(product.price)} XAF
                      </span>
                      <span className="text-xs text-gray-500 line-through">
                        {formatPrice(product.originalPrice)} XAF
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white h-8 text-xs"
                    >
                      <Icon name="ShoppingCart" size={12} className="mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View All Card */}
            <div className="flex-shrink-0 w-48">
              <div className="h-full bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex flex-col items-center justify-center text-white p-6">
                <Icon name="ArrowRight" size={32} className="mb-4" />
                <h3 className="text-lg font-bold mb-2">View All</h3>
                <p className="text-sm text-center opacity-90">See more flash deals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleHero;

