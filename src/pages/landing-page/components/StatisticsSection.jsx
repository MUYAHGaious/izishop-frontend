import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const StatisticsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    products: 0,
    suppliers: 0,
    categories: 0,
    regions: 0
  });
  const sectionRef = useRef(null);

  const targetStats = {
    products: 200000000, // 200M+
    suppliers: 200000,   // 200K+
    categories: 5900,    // 5,900
    regions: 200         // 200+
  };

  const statsData = [
    {
      key: 'products',
      label: 'Products',
      icon: 'Package',
      color: '#0A73B7',
      suffix: 'M+',
      displayValue: '200'
    },
    {
      key: 'suppliers',
      label: 'Suppliers',
      icon: 'Store',
      color: '#F56522',
      suffix: 'K+',
      displayValue: '200'
    },
    {
      key: 'categories',
      label: 'Product Categories',
      icon: 'Grid3X3',
      color: '#0A73B7',
      suffix: '',
      displayValue: '5,900'
    },
    {
      key: 'regions',
      label: 'Countries and Regions',
      icon: 'Globe',
      color: '#F56522',
      suffix: '+',
      displayValue: '200'
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
        products: Math.floor(targetStats.products * easeOutQuart),
        suppliers: Math.floor(targetStats.suppliers * easeOutQuart),
        categories: Math.floor(targetStats.categories * easeOutQuart),
        regions: Math.floor(targetStats.regions * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible]);

  const formatNumber = (num, key) => {
    if (key === 'products') {
      return Math.floor(num / 1000000);
    } else if (key === 'suppliers') {
      return Math.floor(num / 1000);
    } else if (key === 'categories') {
      return num.toLocaleString();
    } else {
      return num;
    }
  };

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#111827' }}>
            Discover your next business opportunity
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: '#6B7280' }}>
            Connect with millions of products and thousands of verified suppliers across diverse categories
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {statsData.map((stat) => (
            <div
              key={stat.key}
              className="text-center group"
            >
              <div className="relative mb-6">
                {/* Icon Background */}
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon 
                    name={stat.icon} 
                    size={32} 
                    style={{ color: stat.color }}
                  />
                </div>
              </div>

              {/* Number */}
              <div className="mb-2">
                <span className="text-4xl md:text-5xl font-bold font-mono" style={{ color: '#111827' }}>
                  {stat.displayValue}
                </span>
                <span className="text-3xl md:text-4xl font-bold" style={{ color: '#111827' }}>
                  {stat.suffix}
                </span>
              </div>

              {/* Label */}
              <p className="text-base font-medium" style={{ color: '#6B7280' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Trust and Quality Section */}
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#111827' }}>
              Streamline ordering from search to fulfillment, all in one place
            </h3>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#6B7280' }}>
              Our comprehensive platform ensures quality, security, and efficiency at every step of your business journey
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { icon: 'Search', title: 'Search for matches', desc: 'Find products and suppliers' },
              { icon: 'CheckCircle', title: 'Identify the right one', desc: 'Verify credentials and quality' },
              { icon: 'CreditCard', title: 'Pay with confidence', desc: 'Secure payment options' },
              { icon: 'Truck', title: 'Fulfill with transparency', desc: 'Track your orders' },
              { icon: 'Settings', title: 'Manage with ease', desc: 'Complete order management' }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: index % 2 === 0 ? '#0A73B7' : '#F56522' }}
                >
                  <Icon name={step.icon} size={24} color="white" />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: '#111827' }}>
                  {step.title}
                </h4>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {step.desc}
                </p>
                {index < 4 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <div className="w-full h-0.5" style={{ backgroundColor: '#D1D5DB' }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#10B981' }}
            >
              <Icon name="Shield" size={24} color="white" />
            </div>
            <h4 className="font-bold text-lg mb-2" style={{ color: '#111827' }}>
              Trade Assurance
            </h4>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Protection against product or shipping issues with secure payment options
            </p>
          </div>

          <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#0A73B7' }}
            >
              <Icon name="Award" size={24} color="white" />
            </div>
            <h4 className="font-bold text-lg mb-2" style={{ color: '#111827' }}>
              Verified Suppliers
            </h4>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Connect with suppliers with third-party-verified credentials and capabilities
            </p>
          </div>

          <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#F3F4F6' }}>
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#F56522' }}
            >
              <Icon name="Headphones" size={24} color="white" />
            </div>
            <h4 className="font-bold text-lg mb-2" style={{ color: '#111827' }}>
              24/7 Support
            </h4>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Get assistance and mediation support for any purchase-related concerns
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;

