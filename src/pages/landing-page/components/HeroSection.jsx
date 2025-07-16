import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEarthAnimating, setIsEarthAnimating] = useState(true);

  const heroSlides = [
    {
      title: "Discover Amazing Products",
      subtitle: "Shop from thousands of verified sellers across Cameroon",
      cta: "Shop Now",
      ctaLink: "/product-catalog"
    },
    {
      title: "Start Your Business Today",
      subtitle: "Join our marketplace and reach customers nationwide",
      cta: "Start Selling",
      ctaLink: "/authentication-login-register"
    },
    {
      title: "Secure & Fast Delivery",
      subtitle: "Safe payments with MTN MoMo, Orange Money & Visa",
      cta: "Learn More",
      ctaLink: "/product-catalog"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
      {/* Animated 3D Earth Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className={`w-96 h-96 md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-br from-primary to-secondary ${isEarthAnimating ? 'animate-spin' : ''}`} 
             style={{ animationDuration: '20s' }}>
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80">
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40">
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20"></div>
              </div>
            </div>
          </div>
          {/* Continent shapes */}
          <div className="absolute top-1/4 left-1/3 w-8 h-6 bg-success/30 rounded-full transform rotate-12"></div>
          <div className="absolute top-1/2 right-1/4 w-6 h-8 bg-success/30 rounded-full transform -rotate-12"></div>
          <div className="absolute bottom-1/3 left-1/4 w-10 h-4 bg-success/30 rounded-full transform rotate-45"></div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center min-h-[80vh]">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left mb-12 lg:mb-0">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent/10 text-accent border border-accent/20">
                <Icon name="Sparkles" size={16} className="mr-2" />
                Welcome to IziShop Marketplace
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {heroSlides[currentSlide].title}
            </h1>

            <p className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto lg:mx-0">
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link to={heroSlides[currentSlide].ctaLink}>
                <Button variant="default" size="lg" iconName="ShoppingBag" iconPosition="left" className="w-full sm:w-auto">
                  {heroSlides[currentSlide].cta}
                </Button>
              </Link>
              <Link to="/authentication-login-register">
                <Button variant="outline" size="lg" iconName="Store" iconPosition="left" className="w-full sm:w-auto">
                  Start Selling
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-text-secondary">
              <div className="flex items-center">
                <Icon name="Shield" size={16} className="mr-2 text-success" />
                Secure Payments
              </div>
              <div className="flex items-center">
                <Icon name="Truck" size={16} className="mr-2 text-success" />
                Fast Delivery
              </div>
              <div className="flex items-center">
                <Icon name="Users" size={16} className="mr-2 text-success" />
                Verified Sellers
              </div>
            </div>
          </div>

          {/* Hero Image/Animation Area */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Floating Cards Animation */}
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                <div className="absolute top-0 left-0 w-24 h-32 bg-card border border-border rounded-lg shadow-card p-3 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
                  <div className="w-full h-16 bg-muted rounded mb-2"></div>
                  <div className="h-2 bg-muted rounded mb-1"></div>
                  <div className="h-2 bg-muted rounded w-3/4"></div>
                </div>
                
                <div className="absolute top-16 right-0 w-28 h-36 bg-card border border-border rounded-lg shadow-card p-3 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
                  <div className="w-full h-20 bg-muted rounded mb-2"></div>
                  <div className="h-2 bg-muted rounded mb-1"></div>
                  <div className="h-2 bg-muted rounded w-2/3"></div>
                </div>
                
                <div className="absolute bottom-16 left-8 w-32 h-40 bg-card border border-border rounded-lg shadow-card p-3 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}>
                  <div className="w-full h-24 bg-muted rounded mb-2"></div>
                  <div className="h-2 bg-muted rounded mb-1"></div>
                  <div className="h-2 bg-muted rounded w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`w-3 h-3 rounded-full marketplace-transition ${
                index === currentSlide ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-6 text-xs text-text-secondary">
          <span>Accepted Payments:</span>
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-card border border-border rounded text-accent font-medium">MTN MoMo</div>
            <div className="px-3 py-1 bg-card border border-border rounded text-warning font-medium">Orange Money</div>
            <div className="px-3 py-1 bg-card border border-border rounded text-primary font-medium">Visa</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;