import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
import Icon from '../../components/AppIcon';
import BlurText from '../../components/ui/BlurText';
import ShinyText from '../../components/ui/ShinyText';
import LogoLoop from '../../components/ui/LogoLoop';
import { useLanguage } from '../../contexts/LanguageContext';

import CardSwap, { Card } from '../../components/ui/CardSwap';
import GlassIcons from '../../components/ui/GlassIcons';
import ScrollStack, { ScrollStackItem } from '../../components/ui/ScrollStack';
import Footer from './components/Footer';


const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  // Category mapping for landing page
  const categoryMapping = {
    'electronics': { name: t('category.electronics'), icon: 'Smartphone', color: 'teal' },
    'fashion': { name: t('category.fashion'), icon: 'Shirt', color: 'teal' },
    'sports': { name: t('category.sports'), icon: 'Dumbbell', color: 'teal' },
    'home': { name: t('category.home'), icon: 'Home', color: 'teal' },
    'beauty': { name: t('category.beauty'), icon: 'Heart', color: 'teal' },
    'food': { name: t('category.food'), icon: 'Apple', color: 'teal' },
    'automotive': { name: t('category.automotive'), icon: 'Car', color: 'teal' },
    'books': { name: t('category.books'), icon: 'Book', color: 'teal' }
  };

  // Default categories for landing page
  const categories = [
    { id: 'electronics', name: t('category.electronics'), icon: 'Smartphone', color: 'teal', iconColor: 'text-gray-600' },
    { id: 'fashion', name: t('category.fashion'), icon: 'Shirt', color: 'teal', iconColor: 'text-gray-600' },
    { id: 'sports', name: t('category.sports'), icon: 'Dumbbell', color: 'teal', iconColor: 'text-gray-600' },
    { id: 'home', name: t('category.home'), icon: 'Home', color: 'teal', iconColor: 'text-gray-600' },
    { id: 'beauty', name: t('category.beauty'), icon: 'Heart', color: 'teal', iconColor: 'text-gray-600' },
    { id: 'food', name: t('category.food'), icon: 'Apple', color: 'teal', iconColor: 'text-gray-600' },
    { id: 'automotive', name: t('category.automotive'), icon: 'Car', color: 'teal', iconColor: 'text-gray-600' },
    { id: 'books', name: t('category.books'), icon: 'Book', color: 'teal', iconColor: 'text-gray-600' }
  ];

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    navigate(`/product-catalog?category=${categoryId}`);
  };

  const newArrivals = [
    { 
      id: 1, 
      name: 'Classic Striped Shirt', 
      price: 45000, 
      image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80', 
      category: 'Clothing' 
    },
    { 
      id: 2, 
      name: 'Elegant White Dress', 
      price: 65000, 
      image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80', 
      category: 'Dress' 
    },
    { 
      id: 3, 
      name: 'Business Blazer', 
      price: 85000, 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80', 
      category: 'Blazer' 
    },
    { 
      id: 4, 
      name: 'Vintage Jacket', 
      price: 75000, 
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80', 
      category: 'Jacket' 
    }
  ];

  const brandLogos = [
    { node: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Hermes_logo.svg/1200px-Hermes_logo.svg.png" alt="Hermes" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "Hermes" },
    { node: <img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" alt="Nike" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "Nike" },
    { node: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/New_Balance_logo.svg/1280px-New_Balance_logo.svg.png" alt="New Balance" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "New Balance" },
    { node: <img src="/assets/brands/Puma.svg" alt="Puma" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "Puma" },
    { node: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Uniqlo_logo.svg/1280px-Uniqlo_logo.svg.png" alt="Uniqlo" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "Uniqlo" },
    { node: <img src="/assets/brands/Zara_Logo.svg" alt="Zara" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "Zara" },
    { node: <img src="https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" alt="Adidas" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "Adidas" },
    { node: <img src="/assets/brands/polo-ralph-lauren.jpg" alt="Polo Ralph Lauren" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "Polo Ralph Lauren" },
    { node: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1280px-H%26M-Logo.svg.png" alt="H&M" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "H&M" },
    { node: <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/45/Beverly_Hills_Polo_Club_logo.svg/1200px-Beverly_Hills_Polo_Club_logo.svg.png" alt="Beverly Hills Polo Club" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "Beverly Hills Polo Club" },
    { node: <img src="/assets/brands/champion-logo.svg" alt="Champion" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "Champion" },
    { node: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Sch_logo.svg/1200px-Sch_logo.svg.png" alt="Sch" style={{ height: '48px', filter: 'grayscale(100%)' }} />, title: "Sch" }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <Helmet>
        <title>IziShopin - Cameroon's Leading Marketplace | Shop & Sell Online</title>
        <meta 
          name="description" 
          content="Discover amazing products from verified sellers across Cameroon. Shop electronics, fashion, home goods and more. Start selling today with secure payments via MTN MoMo, Orange Money & Visa." 
        />
        <meta name="keywords" content="Cameroon marketplace, online shopping, MTN MoMo, Orange Money, e-commerce, buy sell online, Douala, Yaoundé" />
        <meta property="og:title" content="IziShopin - Cameroon's Leading Marketplace" />
        <meta property="og:description" content="Shop from thousands of verified sellers across Cameroon with secure payments and fast delivery." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://izishopin.cm" />
        <link rel="canonical" href="https://izishopin.cm/landing-page" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header - Keep unchanged */}
        <ErrorBoundary>
        <Header />
        </ErrorBoundary>
        
        {/* Main Content */}
        <main className="pt-0">
          {/* Hero Section - Exact Reference Match */}
          <ErrorBoundary>
            <section className="relative h-[500px] bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl mx-6 mb-12 overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600">
                <div className="absolute inset-0 bg-black/20"></div>
              </div>

              {/* Image positioned directly on hero section */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[480px] h-[480px] sm:w-[520px] sm:h-[480px] lg:w-[560px] lg:h-[480px] rounded-2xl overflow-hidden z-10">
                <img 
                  src="/2.png" 
                  alt="Fashion Model" 
                  className="w-full h-full object-contain object-center"
                  loading="eager"
                  decoding="sync"
                  style={{ 
                    imageRendering: 'auto',
                    imageRendering: '-webkit-optimize-contrast',
                    filter: 'contrast(1.05) brightness(1.02)',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    willChange: 'transform'
                  }}
                    />
                  </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-start">
                {/* Large Left Blur Circle - Positioned relative to entire hero section */}
                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-white/20 rounded-full -translate-y-10 -translate-x-48 pointer-events-none z-10"></div>
                
                <div className="container mx-auto px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 items-start">
                    {/* Left Content */}
                    <div className="relative">
                      {/* IziShopin Badge */}
                      <div className="inline-block mb-6 mt-16 sm:mt-20 lg:mt-24">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                          <span className="text-white text-sm font-medium">IZISHOPIN</span>
                    </div>
                      </div>

                      <BlurText
                        text="Simple is More"
                        delay={150}
                        animateBy="words"
                        direction="top"
                        className="text-7xl lg:text-8xl font-extrabold text-white mb-8 leading-tight tracking-wider"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        stepDuration={0.5}
                      />
                    </div>

                    {/* Right Content */}
                    <div className="flex justify-end">
                      <div style={{ height: '300px', position: 'relative', marginTop: '200px' }}>
                        {/* Circular Design Elements - Similar to Customer Card */}
                        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full -translate-y-40 -translate-x-40 pointer-events-none z-10"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 translate-x-32 pointer-events-none z-10"></div>
                        
                        <CardSwap
                          cardDistance={40}
                          verticalDistance={50}
                          delay={4000}
                          pauseOnHover={false}
                          width={350}
                          height={250}
                        >
                          {/* Card 1: Free Delivery - EXACT ScrollStack teal */}
                          <Card customClass="bg-gradient-to-br from-teal-400 to-teal-600 text-white flex flex-col justify-center items-center text-center p-4">
                            <Icon name="Truck" size={32} className="text-white mb-3" />
                            <h3 className="text-xl font-bold mb-1">{t('landing.freeDelivery')}</h3>
                            <p className="text-sm text-teal-100">{t('landing.ordersOver')}</p>
                          </Card>

                          {/* Card 2: Secure Payments - EXACT ScrollStack gray-900 */}
                          <Card customClass="bg-gray-900 text-white flex flex-col justify-center items-center text-center p-4">
                            <Icon name="Shield" size={32} className="text-white mb-3" />
                            <h3 className="text-xl font-bold mb-1">{t('landing.securePayments')}</h3>
                            <p className="text-sm text-gray-300">{t('landing.paymentMethods')}</p>
                          </Card>

                          {/* Card 3: Local Sellers - EXACT ScrollStack gray gradient */}
                          <Card customClass="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 flex flex-col justify-center items-center text-center p-4">
                            <Icon name="Store" size={32} className="text-teal-600 mb-3" />
                            <h3 className="text-xl font-bold mb-1">{t('landing.localSellers')}</h3>
                            <p className="text-sm text-gray-600">{t('landing.acrossCameroon')}</p>
                            </Card>
                        </CardSwap>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>
          {/* Shop by Category */}
          <ErrorBoundary>
            <section className="px-6 mb-4">
              <div className="container mx-auto">
                                  <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{t('landing.shopByCategory')}</h2>
                  <button className="text-teal-600 hover:text-teal-700 font-medium">
                    See all
                  </button>
                </div>

                <div className="flex justify-center -mt-2">
                  <GlassIcons 
                    items={categories.map((category, index) => ({
                      icon: <Icon name={category.icon} size={24} className="text-white" />,
                      color: category.color,
                      label: category.name,
                      customClass: "cursor-pointer",
                      onClick: () => handleCategoryClick(category.id)
                    }))} 
                    className="custom-class"
                  />
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* New Arrivals */}
          <ErrorBoundary>
            <section className="px-6 mb-2">
              <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">{t('landing.newArrivals')}</h2>
                  <button className="text-teal-600 hover:text-teal-700 font-medium">
                    See all
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {newArrivals.map((product) => (
                    <div
                      key={product.id}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/product-detail/${product.id}`)}
                    >
                      {/* Product Image - Exact match to reference */}
                      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="Package" size={48} className="text-gray-400" />
                        </div>
                        )}
                      </div>

                      {/* Product Info - Exact match to reference */}
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-gray-500 uppercase">{product.category}</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* Featured Stack */}
          <ErrorBoundary>
                        <ScrollStack
              itemDistance={150}
              itemScale={0.05}
              itemStackDistance={40}
              stackPosition="15%"
              scaleEndPosition="5%"
              baseScale={0.8}
              rotationAmount={2}
              blurAmount={1}
            >
              <ScrollStackItem itemClassName="bg-gradient-to-br from-teal-400 to-teal-600 text-white mx-6 relative overflow-hidden">
                {/* Blur Circle Effects for this card */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-white/15 rounded-full -translate-y-24 -translate-x-24 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 translate-x-16 pointer-events-none"></div>
                
                <div className="flex flex-col justify-between h-full relative z-10">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <Icon name="Package" size={24} />
                      <span className="text-xl font-medium">Siriia</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-4 leading-tight">
                      {t('landing.yourStyleDelivered')}<br />
                      {t('landing.exclusivelyOnline')}
                    </h3>
                    <button className="bg-white text-teal-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors text-lg shadow-lg">
                      {t('landing.shopNow')}
                    </button>
                  </div>
                  
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-40 h-48 bg-white/10 rounded-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" 
                      alt="Person with packages"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="bg-gray-900 text-white mx-6 relative overflow-hidden">
                {/* Blur Circle Effects for this card */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-white/15 rounded-full -translate-y-24 -translate-x-24 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 translate-x-16 pointer-events-none"></div>
                
                <div className="flex flex-col justify-between h-full relative z-10">
                  
                  <div className="relative z-10">
                    <span className="text-teal-400 mb-4 block text-lg">{t('landing.exploreCollection')}</span>
                    <h3 className="text-4xl font-bold mb-6 leading-tight">
                      {t('landing.discoverOur')}<br />
                      {t('landing.accessoriesCollection')}
                    </h3>
                    <button className="bg-teal-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-teal-600 transition-colors text-lg">
                      {t('landing.shopNow')}
                          </button>
                        </div>
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-32 h-32 bg-white/10 rounded-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=989&q=80" 
                      alt="Watch accessories"
                      className="w-full h-full object-cover"
                    />
                          </div>
                        </div>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 mx-6 relative overflow-hidden">
                {/* Blur Circle Effects for this card */}
                <div className="absolute top-0 left-0 w-48 h-48 bg-white/15 rounded-full -translate-y-24 -translate-x-24 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 translate-x-16 pointer-events-none"></div>
                
                <div className="flex flex-col justify-between h-full relative z-10">
                  
                  <div className="relative z-10">
                    <span className="text-gray-600 mb-4 block text-lg">{t('landing.findPerfectPair')}</span>
                    <h3 className="text-4xl font-bold mb-6 leading-tight">
                      {t('landing.exploreOurShoes')}<br />
                      {t('landing.shoesCollection')}
                    </h3>
                    <button className="bg-teal-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-teal-600 transition-colors text-lg">
                      {t('landing.shopNow')}
                        </button>
                      </div>
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-32 h-32 bg-white/50 rounded-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=812&q=80" 
                      alt="Sneakers collection"
                      className="w-full h-full object-cover"
                    />
                    </div>
                </div>
                                                              </ScrollStackItem>
                </ScrollStack>
              </ErrorBoundary>

          {/* Featured Deals */}
          <ErrorBoundary>
            <section className="px-6 mb-8">
              <div className="container mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Deals</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Exclusive Deals */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
                    {/* Blur Circle Effects */}
                    <div className="absolute top-0 left-0 w-48 h-48 bg-white/15 rounded-full -translate-y-24 -translate-x-24 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 translate-x-16 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <Icon name="Package" size={20} />
                        <span className="font-medium">Siriia</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">
                        {t('landing.indulgeIn')}<br />
                        {t('landing.exclusiveDeals')}
                      </h3>
                      <p className="text-blue-100 mb-6">
                        {t('landing.shopNowAndEnjoyDesc')}
                      </p>
                      <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-colors">
                        {t('landing.shopNow')}
                      </button>
                </div>
                    {/* Fashion person image */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-32 h-40 bg-white/10 rounded-2xl overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1506629905270-11674752ca4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" 
                        alt="Fashion person"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Welcome Offer */}
                  <div className="bg-gradient-to-r from-teal-400 to-teal-500 rounded-3xl p-8 text-white relative overflow-hidden">
                    {/* Blur Circle Effects */}
                    <div className="absolute top-0 left-0 w-48 h-48 bg-white/15 rounded-full -translate-y-24 -translate-x-24 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 translate-x-16 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-4">
                        Welcome offer just<br />
                        for you
                      </h3>
                      <p className="text-teal-100 mb-6">
                        Sign up and be first to know about<br />
                        our exclusive offers
                      </p>
                      <button className="bg-white text-teal-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-colors">
                        Get discount
                      </button>
                    </div>
                    {/* Placeholder for gift box */}
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-24 h-24 bg-orange-400 rounded-2xl flex items-center justify-center">
                      <Icon name="Gift" size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* Shop by Brands */}
          <ErrorBoundary>
            <section className="px-6 mb-12">
              <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Shop by Brands</h2>
                  <button className="text-teal-600 hover:text-teal-700 font-medium">
                    See all
                  </button>
                </div>

                <div className="h-20 relative overflow-hidden">
                  <LogoLoop
                    logos={brandLogos}
                    speed={80}
                    direction="left"
                    logoHeight={48}
                    gap={60}
                    pauseOnHover
                    scaleOnHover
                    fadeOut
                    fadeOutColor="#ffffff"
                    ariaLabel="Partner brands"
                  />
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* Recent Posts */}
          <ErrorBoundary>
            <section className="px-6 mb-12">
              <div className="container mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Posts</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Athletic Outfits */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl p-8 h-80 text-white relative overflow-hidden">
                      {/* Blur Circle Effects */}
                      <div className="absolute top-0 left-0 w-48 h-48 bg-white/15 rounded-full -translate-y-24 -translate-x-24 pointer-events-none"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 translate-x-16 pointer-events-none"></div>
                      
                      <div className="relative z-10">
                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Outfit</span>
                        <h3 className="text-3xl font-bold mt-4 mb-4 leading-tight">
                          Trendy athletic<br />
                          outfits for active<br />
                          lifestyles
                        </h3>
                </div>
                      {/* Athletic people image */}
                      <div className="absolute right-8 bottom-8 w-32 h-32 bg-white/10 rounded-2xl overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" 
                          alt="Athletic people"
                          className="w-full h-full object-cover"
                        />
                        </div>
                        </div>
                      </div>

                  {/* Modern Fashion */}
                  <div>
                    <div className="bg-gradient-to-r from-teal-400 to-teal-500 rounded-3xl p-6 h-80 text-white relative overflow-hidden">
                      {/* Blur Circle Effects */}
                      <div className="absolute top-0 left-0 w-48 h-48 bg-white/15 rounded-full -translate-y-24 -translate-x-24 pointer-events-none"></div>
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 translate-x-16 pointer-events-none"></div>
                      
                      <div className="relative z-10">
                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Style</span>
                        <h3 className="text-xl font-bold mt-4 leading-tight">
                          Modern fashion for<br />
                          the contemporary<br />
                          woman
                        </h3>
                      </div>
                      {/* Fashion woman image */}
                      <div className="absolute right-4 bottom-4 w-24 h-32 bg-white/10 rounded-2xl overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" 
                          alt="Fashion woman"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* Help Section */}
          <ErrorBoundary>
            <section className="px-6 mb-12">
              <div className="container mx-auto">
                <div className="bg-gray-50 rounded-3xl p-8 relative overflow-hidden">
                  {/* Blur Circle Effects */}
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full -translate-y-32 -translate-x-32 pointer-events-none"></div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/15 rounded-full translate-y-24 translate-x-24 pointer-events-none"></div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">We're always here to help</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon name="Headphones" size={24} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{t('landing.realtimeSupport')}</h3>
                          </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon name="Users" size={24} className="text-white" />
                        </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{t('landing.buyingConcierge')}</h3>
                        </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon name="Shield" size={24} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{t('landing.sellingProtection')}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* Why Choose IziShopin */}
          <ErrorBoundary>
            <section className="px-6 mb-8 bg-gray-50 py-8 relative overflow-hidden">
              {/* Blur Circle Effects */}
              <div className="absolute top-0 left-0 w-80 h-80 bg-white/15 rounded-full -translate-y-40 -translate-x-40 pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 translate-x-32 pointer-events-none"></div>
              
              <div className="container mx-auto">
                <div className="text-center mb-8">
                  <ShinyText
                    text={t('landing.whyChoose')}
                    className="text-3xl font-bold text-gray-900 mb-3"
                    shimmerWidth={100}
                  />
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {t('landing.whyChooseSubtext')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon name="Truck" size={28} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t('landing.fastDelivery')}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Get your orders delivered within 24-48 hours across major cities in Cameroon.
                    </p>
                  </div>

                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon name="Shield" size={28} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Payments</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Pay safely with MTN MoMo, Orange Money, or international cards with full buyer protection.
                    </p>
                  </div>

                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon name="Users" size={28} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Sellers</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Shop with confidence from thousands of verified local and international sellers.
                    </p>
                  </div>

                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon name="Headphones" size={28} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t('landing.support247')}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Get help whenever you need it with our dedicated customer support team.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* Success Stats */}
          <ErrorBoundary>
            <section className="px-6 mb-8">
              <div className="container mx-auto">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                  
                  <div className="relative z-10">
                    <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Join Thousands of Happy Customers</h2>
                      <p className="text-teal-100 text-lg">
                        Experience the difference with Cameroon's most trusted marketplace
                      </p>
                </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="text-center">
                    <div className="text-4xl font-bold mb-2">50K+</div>
                    <div className="text-teal-100">Active Users</div>
                  </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">15K+</div>
                        <div className="text-teal-100">Products Sold</div>
                  </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">2K+</div>
                    <div className="text-teal-100">Verified Sellers</div>
                  </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">98%</div>
                        <div className="text-teal-100">Satisfaction Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* Customer Testimonials */}
          <ErrorBoundary>
            <section className="px-6 mb-8 relative overflow-hidden">
              {/* Blur Circle Effects */}
              <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-y-36 -translate-x-36 pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/8 rounded-full translate-y-28 translate-x-28 pointer-events-none"></div>
              
              <div className="container mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Don't just take our word for it - hear from our satisfied customers across Cameroon.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Icon key={i} name="Star" size={16} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      "IziShopin has transformed how I shop online. Fast delivery, genuine products, 
                      and excellent customer service. Highly recommended!"
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80" 
                          alt="Marie Kamga"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold text-gray-900">Marie Kamga</div>
                        <div className="text-sm text-gray-500">Douala, Cameroon</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                                <Icon key={i} name="Star" size={16} className="text-yellow-400 fill-current" />
                              ))}
                            </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      "As a seller, IziShopin has helped me reach customers I never could before. 
                      The platform is user-friendly and payments are always on time."
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80" 
                          alt="Jean Nkomo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold text-gray-900">Jean Nkomo</div>
                        <div className="text-sm text-gray-500">Yaoundé, Cameroon</div>
                            </div>
                          </div>
                        </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Icon key={i} name="Star" size={16} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      "The variety of products is amazing! I found everything I needed for my home 
                      renovation project at competitive prices."
                    </p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80" 
                          alt="Amina Tchoua"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold text-gray-900">Amina Tchoua</div>
                        <div className="text-sm text-gray-500">Bamenda, Cameroon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* How It Works */}
          <ErrorBoundary>
            <section className="px-6 mb-8 bg-gray-50 py-8 relative overflow-hidden">
              {/* Blur Circle Effects */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/15 rounded-full -translate-y-40 translate-x-40 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32 pointer-events-none"></div>
              
              <div className="container mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">How IziShopin Works</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Getting started is simple. Follow these easy steps to begin your shopping journey.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="text-center relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Icon name="UserPlus" size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Create Account</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Sign up in minutes with your phone number or email. It's completely free!
                    </p>
                  </div>

                  <div className="text-center relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Icon name="Search" size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Browse Products</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Explore thousands of products from verified sellers across all categories.
                    </p>
                  </div>

                  <div className="text-center relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Icon name="Shield" size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payment</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Pay safely with MTN MoMo, Orange Money, or card with full buyer protection.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Icon name="Truck" size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('landing.quickDeliveryDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* Mobile App Download */}
          <ErrorBoundary>
            <section className="px-6 mb-8">
              <div className="container mx-auto">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full -translate-y-48 translate-x-48"></div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                    <div>
                      <h2 className="text-3xl font-bold mb-6">Shop Anytime, Anywhere</h2>
                      <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                        Download the IziShopin mobile app for the ultimate shopping experience. 
                        Get exclusive mobile-only deals, push notifications for your favorite items, 
                        and shop on the go.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex items-center space-x-3 bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                            <Icon name="Smartphone" size={16} className="text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs text-gray-600">Download on the</div>
                            <div className="text-sm font-semibold">App Store</div>
                          </div>
                  </button>

                        <button className="flex items-center space-x-3 bg-white text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                            <Icon name="Smartphone" size={16} className="text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs text-gray-600">Get it on</div>
                            <div className="text-sm font-semibold">Google Play</div>
                          </div>
                  </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <div className="w-64 h-64 bg-teal-500/20 rounded-full flex items-center justify-center">
                        <Icon name="Smartphone" size={80} className="text-teal-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* Final CTA */}
          <ErrorBoundary>
            <section className="px-6 mb-12">
              <div className="container mx-auto">
                <div className="text-center bg-gradient-to-br from-teal-50 to-blue-50 rounded-3xl p-8 md:p-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Ready to Start Shopping?
                  </h2>
                  <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Join thousands of satisfied customers and discover why IziShopin is 
                    Cameroon's favorite online marketplace.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => navigate('/product-catalog')}
                      className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      Start Shopping Now
                    </button>
                    <button 
                      onClick={() => navigate('/authentication-login-register')}
                      className="bg-white hover:bg-gray-50 text-teal-600 font-bold py-4 px-8 rounded-xl border-2 border-teal-500 transition-all duration-200 hover:shadow-lg"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;