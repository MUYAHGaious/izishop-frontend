import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const StatisticsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    shops: 0,
    products: 0,
    users: 0,
    orders: 0
  });
  const sectionRef = useRef(null);

  const targetStats = {
    shops: 2847,
    products: 45632,
    users: 18945,
    orders: 127834
  };

  const statsData = [
    {
      key: 'shops',
      label: 'Active Shops',
      icon: 'Store',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      suffix: '+'
    },
    {
      key: 'products',
      label: 'Products Listed',
      icon: 'Package',
      color: 'text-success',
      bgColor: 'bg-success/10',
      suffix: '+'
    },
    {
      key: 'users',
      label: 'Happy Customers',
      icon: 'Users',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      suffix: '+'
    },
    {
      key: 'orders',
      label: 'Orders Completed',
      icon: 'ShoppingBag',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      suffix: '+'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        shops: Math.floor(targetStats.shops * easeOutQuart),
        products: Math.floor(targetStats.products * easeOutQuart),
        users: Math.floor(targetStats.users * easeOutQuart),
        orders: Math.floor(targetStats.orders * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Join the growing community of buyers and sellers across Cameroon
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {statsData.map((stat) => (
            <div
              key={stat.key}
              className="text-center group"
            >
              <div className="relative">
                {/* Icon Background */}
                <div className={`w-16 h-16 md:w-20 md:h-20 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 marketplace-transition`}>
                  <Icon 
                    name={stat.icon} 
                    size={32} 
                    className={`${stat.color} group-hover:scale-110 marketplace-transition`} 
                  />
                </div>

                {/* Animated Ring */}
                <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted opacity-20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="283"
                      strokeDashoffset={isVisible ? "70" : "283"}
                      className={`${stat.color} marketplace-transition`}
                      style={{ transitionDuration: '2s' }}
                    />
                  </svg>
                </div>
              </div>

              {/* Number */}
              <div className="mb-2">
                <span className="text-3xl md:text-4xl font-bold text-foreground font-mono">
                  {formatNumber(animatedStats[stat.key])}
                </span>
                <span className="text-2xl md:text-3xl font-bold text-foreground">
                  {stat.suffix}
                </span>
              </div>

              {/* Label */}
              <p className="text-sm md:text-base font-medium text-text-secondary">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mr-3">
                <Icon name="TrendingUp" size={24} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">98.5%</p>
                <p className="text-sm text-text-secondary">Customer Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mr-3">
                <Icon name="Clock" size={24} className="text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24/7</p>
                <p className="text-sm text-text-secondary">Customer Support</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">100%</p>
                <p className="text-sm text-text-secondary">Secure Payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-text-secondary mb-6">Trusted by leading businesses in Cameroon</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <Icon name="Check" size={16} className="text-success-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Shield" size={16} className="text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Verified Sellers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Icon name="Award" size={16} className="text-accent-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;