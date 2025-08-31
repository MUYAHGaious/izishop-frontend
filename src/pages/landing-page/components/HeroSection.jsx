import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5, active: false }); // normalized (0-1), active if mouse is present

  // IMPORTANT: If you add or remove images from /public/slideshow/,
  // you MUST update this 'heroSlides' array with the correct image paths.
  const heroSlides = [
    {
      title: "Discover Cameroon’s Top B2B Marketplace",
      subtitle: "Seamlessly connect with trusted suppliers and buyers nationwide.",
      cta: "Browse Marketplace",
      ctaLink: "/product-catalog",
      searchPlaceholder: "What do you want to source today?",
      image: "/slideshow/FARO_upscayl_4x_upscayl-standard-4x.png"
    },
    {
      title: "Endless Products. Real Opportunities.",
      subtitle: "Explore millions of products from verified sellers.",
      cta: "Shop Now",
      ctaLink: "/product-catalog",
      searchPlaceholder: "Search electronics, fashion, and more...",
      image: "/slideshow/pexels-jonathankwuka-19661361.jpg"
    },
    {
      title: "Upgrade Your Business Instantly",
      subtitle: "Find innovative solutions and bulk deals for every industry.",
      cta: "Get Started",
      ctaLink: "/product-catalog",
      searchPlaceholder: "Type a product, brand, or supplier...",
      image: "/slideshow/pexels-mikhail-nilov-9301901.jpg"
    },
    {
      title: "Join Cameroon’s Digital Trade Revolution",
      subtitle: "Empowering local businesses with global reach.",
      cta: "Sign Up Free",
      ctaLink: "/authentication-login-register",
      searchPlaceholder: "Ready to grow your business?",
      image: "/slideshow/pexels-ninthgrid-2149521550-30688912.jpg"
    },
    {
      title: "Trade Securely, Trade Smart",
      subtitle: "Enjoy safe payments, verified partners, and reliable delivery.",
      cta: "How It Works",
      ctaLink: "/product-catalog",
      searchPlaceholder: "Find secure deals...",
      image: "/slideshow/pexels-overly-olu-264845430-12714976.jpg"
    },
    {
      title: "Nationwide Delivery, Zero Hassle",
      subtitle: "Fast, trackable shipping to every region in Cameroon.",
      cta: "Track My Order",
      ctaLink: "/order-management",
      searchPlaceholder: "Track your delivery...",
      image: "/slideshow/pexels-planeteelevene-30019690.jpg"
    },
    {
      title: "Source Sustainably, Grow Responsibly",
      subtitle: "Eco-friendly products and ethical suppliers at your fingertips.",
      cta: "Go Green",
      ctaLink: "/product-catalog",
      searchPlaceholder: "Search sustainable options...",
      image: "/slideshow/pexels-quang-nguyen-vinh-222549-6871018.jpg"
    },
    {
      title: "Expand Your Network, Expand Your Business",
      subtitle: "Connect with new partners and unlock fresh opportunities.",
      cta: "Find Partners",
      ctaLink: "/product-catalog",
      searchPlaceholder: "Search for partners or services...",
      image: "/slideshow/pexels-rdne-10375901.jpg"
    },
    {
      title: "Expert Support, Every Step",
      subtitle: "Our team is here to help you succeed online.",
      cta: "Contact Support",
      ctaLink: "/chat-interface-modal",
      searchPlaceholder: "How can we help you today?",
      image: "/slideshow/pexels-tima-miroshnichenko-5453848.jpg"
    },
    {
      title: "Tradition Meets Innovation",
      subtitle: "Modern tech, local expertise—Cameroon’s business future.",
      cta: "See Success Stories",
      ctaLink: "/product-catalog",
      searchPlaceholder: "Explore inspiring businesses...",
      image: "/slideshow/pexels-tonywuphotography-5573441.jpg"
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

  const bokehCircles = [
    { baseX: 0.2, baseY: 0.3, r: 80, opacity: 0.12, idleRadius: 0.04, idleSpeed: 0.18, idlePhase: 0 },
    { baseX: 0.7, baseY: 0.6, r: 100, opacity: 0.10, idleRadius: 0.05, idleSpeed: 0.13, idlePhase: 1 },
    { baseX: 0.5, baseY: 0.8, r: 60, opacity: 0.08, idleRadius: 0.03, idleSpeed: 0.22, idlePhase: 2 },
    { baseX: 0.8, baseY: 0.25, r: 50, opacity: 0.09, idleRadius: 0.06, idleSpeed: 0.16, idlePhase: 3 },
    { baseX: 0.35, baseY: 0.6, r: 40, opacity: 0.07, idleRadius: 0.04, idleSpeed: 0.19, idlePhase: 4 },
    { baseX: 0.15, baseY: 0.7, r: 55, opacity: 0.09, idleRadius: 0.05, idleSpeed: 0.15, idlePhase: 5 },
    { baseX: 0.6, baseY: 0.2, r: 70, opacity: 0.10, idleRadius: 0.03, idleSpeed: 0.21, idlePhase: 6 },
    { baseX: 0.85, baseY: 0.8, r: 45, opacity: 0.08, idleRadius: 0.04, idleSpeed: 0.17, idlePhase: 7 },
    { baseX: 0.4, baseY: 0.15, r: 35, opacity: 0.07, idleRadius: 0.06, idleSpeed: 0.14, idlePhase: 8 },
    { baseX: 0.9, baseY: 0.5, r: 60, opacity: 0.09, idleRadius: 0.05, idleSpeed: 0.18, idlePhase: 9 },
  ];

  const [bokehAnim, setBokehAnim] = useState(bokehCircles.map(c => ({ x: c.baseX, y: c.baseY })));
  const animRef = useRef();
  const timeRef = useRef(0);

  // Mouse move handler for scattering effect
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMouse({ x, y, active: true });
  };
  const handleMouseLeave = () => setMouse({ x: 0.5, y: 0.5, active: false });

  // Spring animation loop with idle movement
  useEffect(() => {
    function animate() {
      timeRef.current += 1/60; // ~60fps
      setBokehAnim(prev => prev.map((pos, i) => {
        const circle = bokehCircles[i];
        // Idle orbit
        const t = timeRef.current * circle.idleSpeed + circle.idlePhase;
        const idleX = circle.baseX + Math.cos(t * 2 * Math.PI) * circle.idleRadius;
        const idleY = circle.baseY + Math.sin(t * 2 * Math.PI) * circle.idleRadius;
        // Mouse repulsion
        let targetX = idleX, targetY = idleY;
        if (mouse.active) {
          const dx = idleX - mouse.x;
          const dy = idleY - mouse.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const repel = 0.18 / (dist + 0.15);
          const angle = Math.atan2(dy, dx);
          targetX = Math.max(0, Math.min(1, idleX + Math.cos(angle) * repel));
          targetY = Math.max(0, Math.min(1, idleY + Math.sin(angle) * repel));
        }
        // Spring interpolation (lerp)
        const spring = 0.08;
        return {
          x: pos.x + (targetX - pos.x) * spring,
          y: pos.y + (targetY - pos.y) * spring,
        };
      }));
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [mouse.x, mouse.y, mouse.active]);

  return (
    <section className="relative min-h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Circular Design Elements - Similar to Customer Card */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 pointer-events-none z-10"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 pointer-events-none z-10"></div>
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
            {/* Bokeh overlay with mouse interaction */}
            <div 
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)'
              }}
            >
              <svg width="100%" height="100%" className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                {bokehCircles.map((circle, i) => {
                  const cx = bokehAnim[i]?.x * 100;
                  const cy = bokehAnim[i]?.y * 100;
                  return (
                    <circle
                      key={i}
                      cx={`${cx}%`}
                      cy={`${cy}%`}
                      r={circle.r}
                      fill="white"
                      fillOpacity={circle.opacity}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center min-h-[80vh] flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-10 md:mb-14 flex justify-center">
            <img 
              src="/izishopin_logo_transparent.png" 
              alt="IziShopin" 
              className="h-28 md:h-40 lg:h-48 w-auto rounded-xl shadow-xl drop-shadow-lg transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-lg px-4">
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

