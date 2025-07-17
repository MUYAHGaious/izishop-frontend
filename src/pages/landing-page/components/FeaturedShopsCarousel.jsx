import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const FeaturedShopsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);

  const featuredShops = [
    {
      id: 1,
      name: "TechHub Suppliers",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      rating: 4.8,
      reviewCount: 1247,
      category: "Electronics & Technology",
      description: "Leading supplier of premium electronics and tech accessories",
      productsCount: "2.5K+",
      location: "Douala, Cameroon",
      verified: true,
      badge: "Gold Supplier",
      yearsInBusiness: 8,
      responseRate: "98%"
    },
    {
      id: 2,
      name: "Fashion Forward Ltd",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      rating: 4.6,
      reviewCount: 892,
      category: "Fashion & Apparel",
      description: "Wholesale fashion and clothing manufacturer",
      productsCount: "1.8K+",
      location: "Yaoundé, Cameroon",
      verified: true,
      badge: "Verified Supplier",
      yearsInBusiness: 5,
      responseRate: "95%"
    },
    {
      id: 3,
      name: "Industrial Solutions Co",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      rating: 4.7,
      reviewCount: 634,
      category: "Industrial Equipment",
      description: "Heavy machinery and industrial equipment supplier",
      productsCount: "950+",
      location: "Bamenda, Cameroon",
      verified: true,
      badge: "Trade Assurance",
      yearsInBusiness: 12,
      responseRate: "99%"
    },
    {
      id: 4,
      name: "AgriCorp Cameroon",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
      rating: 4.9,
      reviewCount: 1156,
      category: "Food & Agriculture",
      description: "Premium agricultural products and food processing",
      productsCount: "750+",
      location: "Garoua, Cameroon",
      verified: true,
      badge: "Premium Supplier",
      yearsInBusiness: 15,
      responseRate: "97%"
    },
    {
      id: 5,
      name: "AutoParts Central",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop",
      rating: 4.5,
      reviewCount: 723,
      category: "Automotive",
      description: "Complete automotive parts and accessories",
      productsCount: "1.2K+",
      location: "Douala, Cameroon",
      verified: true,
      badge: "Verified Supplier",
      yearsInBusiness: 7,
      responseRate: "94%"
    }
  ];

  const itemsPerView = 3;
  const maxIndex = Math.max(0, featuredShops.length - itemsPerView);

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, maxIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  return (
    <section className="py-16" style={{ backgroundColor: '#F3F4F6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#111827' }}>
            Trade with confidence from production quality to purchase protection
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: '#6B7280' }}>
            Connect with verified suppliers who have proven track records and quality certifications
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
            style={{ backgroundColor: 'white', color: '#0A73B7' }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <Icon name="ChevronLeft" size={24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
            style={{ backgroundColor: 'white', color: '#0A73B7' }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <Icon name="ChevronRight" size={24} />
          </button>

          {/* Carousel Content */}
          <div className="overflow-hidden mx-12">
            <div
              ref={carouselRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {featuredShops.map((shop) => (
                <div
                  key={shop.id}
                  className="w-1/3 flex-shrink-0 px-3"
                >
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    {/* Shop Image */}
                    <div className="relative h-48">
                      <Image
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge */}
                      <div 
                        className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: shop.badge === 'Gold Supplier' ? '#F56522' : '#0A73B7' }}
                      >
                        {shop.badge}
                      </div>
                      {/* Verified Badge */}
                      {shop.verified && (
                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                          <Icon name="Check" size={16} color="white" />
                        </div>
                      )}
                    </div>

                    {/* Shop Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg mb-1" style={{ color: '#111827' }}>
                            {shop.name}
                          </h3>
                          <p className="text-sm" style={{ color: '#6B7280' }}>
                            {shop.category}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Icon name="Star" size={16} style={{ color: '#F59E0B' }} />
                          <span className="ml-1 text-sm font-medium" style={{ color: '#111827' }}>
                            {shop.rating}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                        {shop.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span style={{ color: '#6B7280' }}>Products: </span>
                          <span className="font-medium" style={{ color: '#111827' }}>{shop.productsCount}</span>
                        </div>
                        <div>
                          <span style={{ color: '#6B7280' }}>Response: </span>
                          <span className="font-medium" style={{ color: '#111827' }}>{shop.responseRate}</span>
                        </div>
                        <div>
                          <span style={{ color: '#6B7280' }}>Experience: </span>
                          <span className="font-medium" style={{ color: '#111827' }}>{shop.yearsInBusiness} years</span>
                        </div>
                        <div>
                          <span style={{ color: '#6B7280' }}>Reviews: </span>
                          <span className="font-medium" style={{ color: '#111827' }}>{shop.reviewCount}</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center mb-4">
                        <Icon name="MapPin" size={14} style={{ color: '#6B7280' }} />
                        <span className="ml-1 text-sm" style={{ color: '#6B7280' }}>
                          {shop.location}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link 
                          to={`/shop-profile/${shop.id}`}
                          className="flex-1"
                        >
                          <button 
                            className="w-full py-2 px-4 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: '#0A73B7' }}
                          >
                            View Supplier
                          </button>
                        </Link>
                        <button 
                          className="px-4 py-2 border-2 rounded-lg hover:shadow-md transition-shadow"
                          style={{ 
                            color: '#0A73B7', 
                            borderColor: '#0A73B7',
                            backgroundColor: 'white'
                          }}
                        >
                          <Icon name="MessageCircle" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                style={{ backgroundColor: index === currentIndex ? '#0A73B7' : '#D1D5DB' }}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Link to="/shops-listing">
            <button 
              className="px-8 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#F56522' }}
            >
              View All Suppliers
              <Icon name="ArrowRight" size={16} className="ml-2 inline" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedShopsCarousel;

