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
    <div className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-16 w-12 h-12 bg-yellow-300 rounded-full animate-bounce"></div>
        <div className="absolute bottom-16 left-20 w-16 h-16 bg-orange-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-24 w-8 h-8 bg-red-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-pink-300 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-white rounded-full animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 bg-black/20 backdrop-blur-sm rounded-full px-6 py-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center animate-pulse">
              <Icon name="Zap" size={24} className="text-orange-500" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              ⚡ FLASH SALE
            </h2>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center animate-pulse">
              <Icon name="Flame" size={24} className="text-red-500" />
            </div>
          </div>
          
          {/* Countdown Timer */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className="text-white text-lg font-medium">Ends in:</span>
            <div className="flex items-center space-x-2">
              <div className="bg-white text-red-500 font-bold text-xl px-4 py-2 rounded-lg min-w-[60px] text-center shadow-lg">
                {formatNumber(timeLeft.hours)}
              </div>
              <span className="text-white font-bold text-xl">:</span>
              <div className="bg-white text-red-500 font-bold text-xl px-4 py-2 rounded-lg min-w-[60px] text-center shadow-lg">
                {formatNumber(timeLeft.minutes)}
              </div>
              <span className="text-white font-bold text-xl">:</span>
              <div className="bg-white text-red-500 font-bold text-xl px-4 py-2 rounded-lg min-w-[60px] text-center shadow-lg">
                {formatNumber(timeLeft.seconds)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-white text-sm">
            <span>Hours</span>
            <span>Minutes</span>
            <span>Seconds</span>
          </div>
        </div>

        {/* Product Carousel */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
          >
            <Icon name="ChevronLeft" size={24} className="text-white" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
          >
            <Icon name="ChevronRight" size={24} className="text-white" />
          </button>

          {/* Carousel Container */}
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {products.slice(0, 5).map((product, index) => (
                <div key={product.id} className="w-full flex-shrink-0">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mx-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      {/* Product Image */}
                      <div className="relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-2xl"
                        />
                        
                        {/* Discount Badge */}
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-full animate-pulse shadow-lg">
                          -{product.discount}%
                        </div>
                        
                        {/* Flash Sale Badge */}
                        <div className="absolute top-4 right-4 bg-yellow-400 text-red-600 text-sm font-bold px-3 py-1 rounded-full animate-bounce">
                          FLASH SALE
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="text-white">
                        <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                          {product.name}
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center space-x-4">
                            <span className="text-3xl lg:text-4xl font-bold text-yellow-300">
                              {formatPrice(product.price)} XAF
                            </span>
                            <span className="text-xl text-white/70 line-through">
                              {formatPrice(product.originalPrice)} XAF
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Icon 
                                  key={i}
                                  name="Star" 
                                  size={16} 
                                  className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-white/30'} 
                                />
                              ))}
                              <span className="text-white/90 ml-2">({product.reviewCount})</span>
                            </div>
                          </div>
                          
                          <div className="text-green-300 font-medium">
                            💰 Save {formatPrice(product.originalPrice - product.price)} XAF
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button 
                            size="lg" 
                            className="bg-white text-orange-600 hover:bg-gray-100 font-bold flex-1 h-12"
                          >
                            <Icon name="ShoppingCart" size={20} className="mr-2" />
                            Add to Cart
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="lg"
                            className="border-white text-white hover:bg-white hover:text-orange-600 font-bold h-12"
                          >
                            <Icon name="Eye" size={20} className="mr-2" />
                            Quick View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {products.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <Button 
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-4 text-lg shadow-xl"
          >
            <Icon name="Zap" size={24} className="mr-2" />
            View All Flash Deals
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-8 transform -translate-y-1/2 opacity-20">
        <div className="text-white text-8xl font-bold animate-pulse">%</div>
      </div>
      <div className="absolute top-1/3 right-12 transform -translate-y-1/2 opacity-30">
        <div className="text-white text-6xl font-bold animate-bounce">🔥</div>
      </div>
    </div>
  );
};

export default FlashSaleHero;

