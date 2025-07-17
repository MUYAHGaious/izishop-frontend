import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // IMPORTANT: If you add or remove images from /public/slideshow/,
  // you MUST update this 'heroSlides' array with the correct image paths.
  const heroSlides = [
    {
      title: "The Leading B2B Marketplace for Cameroon",
      subtitle: "Connect with verified suppliers and buyers across the nation",
      cta: "Start Sourcing",
      ctaLink: "/product-catalog",
      searchPlaceholder: "Search for products, suppliers, or categories...",
      image: "/slideshow/499A7189-Edit-2.jpg"
    },
    {
      title: "Millions of Products, Thousands of Suppliers",
      subtitle: "Discover quality products from trusted sellers nationwide",
      cta: "Explore Products",
      ctaLink: "/product-catalog",
      searchPlaceholder: "What are you looking for today?",
      image: "/slideshow/FARO.webp"
    },
    {
      title: "Trade with Confidence",
      subtitle: "Secure payments, verified suppliers, and reliable delivery",
      cta: "Learn More",
      ctaLink: "/product-catalog",
      searchPlaceholder: "Find your next business opportunity...",
      image: "/slideshow/ged_20180112_africa_tech001.webp"
    },
    {
      title: "Empowering African Commerce",
      subtitle: "Supporting local businesses and entrepreneurs across Cameroon",
      cta: "Join Now",
      ctaLink: "/authentication-login-register",
      searchPlaceholder: "Start your business journey...",
      image: "/slideshow/man-fixing-second-hand-computers-in-ivory-coast-west-africa-BXH7NK.jpg"
    },
    {
      title: "Innovation Meets Tradition",
      subtitle: "Bridging modern technology with local market needs",
      cta: "Discover More",
      ctaLink: "/product-catalog",
      searchPlaceholder: "Explore innovative solutions...",
      image: "/slideshow/pexels-ninthgrid-2149521550-30688912.jpg"
    }
  ];

  const popularSearches = [
    "Electronics", "Fashion", "Home & Garden", "Automotive", "Industrial Equipment", "Food & Beverages"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/product-catalog?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Vignetting overlay */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center min-h-[80vh] flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-6 md:mb-8 flex justify-center">
            <img 
              src="/izishopin_logo_transparent.png" 
              alt="IziShopin" 
              className="h-12 md:h-16 lg:h-20 w-auto drop-shadow-lg"
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-lg px-4">
            {heroSlides[currentSlide].title}
          </h1>

          <p className="text-base sm:text-lg md:text-xl mb-8 md:mb-12 max-w-3xl mx-auto text-white drop-shadow-md px-4">
            {heroSlides[currentSlide].subtitle}
          </p>

          {/* Search Bar - Alibaba Style - Mobile First */}
          <div className="max-w-4xl mx-auto mb-6 md:mb-8 px-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex flex-col sm:flex-row rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 focus-within:border-blue-500 transition-colors bg-white">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={heroSlides[currentSlide].searchPlaceholder}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-0 focus:outline-none focus:ring-0 bg-gray-50"
                />
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold text-base sm:text-lg rounded-lg hover:opacity-90 transition-opacity w-full sm:w-auto bg-orange-500"
                >
                  <Icon name="Search" size={20} className="mr-2 inline" />
                  <span className="hidden sm:inline">Search</span>
                  <span className="sm:hidden">Go</span>
                </button>
              </div>
            </form>

            {/* Popular Searches - Mobile Responsive */}
            <div className="mt-3 md:mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-xs sm:text-sm text-white drop-shadow-md">Popular:</span>
              {popularSearches.slice(0, 4).map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full border hover:shadow-md transition-shadow text-blue-600 border-blue-600 bg-white bg-opacity-90"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons - Mobile First */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 md:mb-12 px-4">
            <Link to={heroSlides[currentSlide].ctaLink}>
              <button 
                className="px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold text-base sm:text-lg rounded-lg hover:opacity-90 transition-opacity w-full sm:w-auto bg-blue-600"
              >
                <Icon name="ShoppingBag" size={18} className="mr-2 inline" />
                {heroSlides[currentSlide].cta}
              </button>
            </Link>
            <Link to="/authentication-login-register">
              <button 
                className="px-6 sm:px-8 py-3 sm:py-4 font-semibold text-base sm:text-lg rounded-lg border-2 hover:shadow-md transition-shadow w-full sm:w-auto text-white border-white bg-white bg-opacity-20 backdrop-blur-sm"
              >
                <Icon name="Store" size={18} className="mr-2 inline" />
                Start Selling
              </button>
            </Link>
          </div>

          {/* Statistics - Mobile Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-3xl mx-auto px-4">
            <div className="text-center bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-md">200M+</div>
              <div className="text-xs sm:text-sm text-white drop-shadow-sm">Products</div>
            </div>
            <div className="text-center bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-md">200K+</div>
              <div className="text-xs sm:text-sm text-white drop-shadow-sm">Suppliers</div>
            </div>
            <div className="text-center bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-md">5,900</div>
              <div className="text-xs sm:text-sm text-white drop-shadow-sm">Categories</div>
            </div>
            <div className="text-center bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-md">200+</div>
              <div className="text-xs sm:text-sm text-white drop-shadow-sm">Regions</div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2 mt-6 md:mt-8">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trust Indicators - Mobile Responsive */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 md:space-x-8 text-xs sm:text-sm text-white drop-shadow-md">
          <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1">
            <Icon name="Shield" size={14} className="mr-2 text-green-400" />
            Trade Assurance
          </div>
          <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1">
            <Icon name="Award" size={14} className="mr-2 text-green-400" />
            Verified Suppliers
          </div>
          <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1">
            <Icon name="Truck" size={14} className="mr-2 text-green-400" />
            Secure Logistics
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

