import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
import Icon from '../../components/AppIcon';
import BlurText from '../../components/ui/BlurText';
import ShinyText from '../../components/ui/ShinyText';
import LogoLoop from '../../components/ui/LogoLoop';

import CardSwap, { Card } from '../../components/ui/CardSwap';
import GlassIcons from '../../components/ui/GlassIcons';
import ScrollStack, { ScrollStackItem } from '../../components/ui/ScrollStack';


const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  // Sample data - replace with real API data
  const categories = [
    { name: 'Personal Care', icon: 'User', color: 'teal', iconColor: 'text-gray-600' },
    { name: 'Accessories', icon: 'Watch', color: 'teal', iconColor: 'text-gray-600' },
    { name: 'Coats', icon: 'Shirt', color: 'teal', iconColor: 'text-gray-600' },
    { name: 'Sweet Pants', icon: 'Package', color: 'teal', iconColor: 'text-gray-600' },
    { name: 'Bag/Purse', icon: 'Briefcase', color: 'teal', iconColor: 'text-gray-600' },
    { name: 'T-Shirt', icon: 'Shirt', color: 'teal', iconColor: 'text-gray-600' },
    { name: 'Sneakers', icon: 'Zap', color: 'teal', iconColor: 'text-gray-600' },
    { name: 'Bags', icon: 'ShoppingBag', color: 'teal', iconColor: 'text-gray-600' }
  ];

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
        <main className="pt-24">
          {/* Hero Section - Exact Reference Match */}
          <ErrorBoundary>
            <section className="relative h-96 bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl mx-6 mb-12 overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600">
                <div className="absolute inset-0 bg-black/20"></div>
              </div>

              {/* Image positioned directly on hero section */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 sm:w-104 sm:h-96 lg:w-112 lg:h-96 rounded-2xl overflow-hidden z-10">
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
                      <div style={{ height: '400px', position: 'relative', marginTop: '-50px' }}>
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
                            <h3 className="text-xl font-bold mb-1">Free Delivery</h3>
                            <p className="text-sm text-teal-100">Orders 50K+ FCFA</p>
                          </Card>

                          {/* Card 2: Secure Payments - EXACT ScrollStack gray-900 */}
                          <Card customClass="bg-gray-900 text-white flex flex-col justify-center items-center text-center p-4">
                            <Icon name="Shield" size={32} className="text-white mb-3" />
                            <h3 className="text-xl font-bold mb-1">Secure Payments</h3>
                            <p className="text-sm text-gray-300">MTN MoMo & Visa</p>
                          </Card>

                          {/* Card 3: Local Sellers - EXACT ScrollStack gray gradient */}
                          <Card customClass="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 flex flex-col justify-center items-center text-center p-4">
                            <Icon name="Store" size={32} className="text-teal-600 mb-3" />
                            <h3 className="text-xl font-bold mb-1">Local Sellers</h3>
                            <p className="text-sm text-gray-600">Across Cameroon</p>
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
            <section className="px-6 mb-12">
              <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                  <button className="text-teal-600 hover:text-teal-700 font-medium">
                    See all
                  </button>
                </div>

                <div className="flex justify-center">
                  <GlassIcons 
                    items={categories.map((category, index) => ({
                      icon: <Icon name={category.icon} size={24} className="text-white" />,
                      color: category.color,
                      label: category.name,
                      customClass: "cursor-pointer"
                    }))} 
                    className="custom-class"
                  />
                </div>
              </div>
            </section>
          </ErrorBoundary>

          {/* New Arrivals */}
          <ErrorBoundary>
            <section className="px-6 mb-12">
              <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
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
              <ScrollStackItem itemClassName="bg-gradient-to-br from-teal-400 to-teal-600 text-white mx-6">
                <div className="flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <Icon name="Package" size={24} />
                      <span className="font-medium text-xl">Siriia</span>
                    </div>
                    <h3 className="text-4xl font-bold mb-6 leading-tight">
                      Your Style,<br />
                      Delivered.<br />
                      Exclusively<br />
                      Online.
                    </h3>
                    <button className="bg-white text-teal-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors text-lg">
                      Shop now
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

              <ScrollStackItem itemClassName="bg-gray-900 text-white mx-6">
                <div className="flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-teal-400 mb-4 block text-lg">Explore Collection</span>
                    <h3 className="text-4xl font-bold mb-6 leading-tight">
                      Discover our<br />
                      accessories collection
                    </h3>
                    <button className="bg-teal-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-teal-600 transition-colors text-lg">
                      Shop Now
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

              <ScrollStackItem itemClassName="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 mx-6">
                <div className="flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-gray-600 mb-4 block text-lg">Find your perfect pair</span>
                    <h3 className="text-4xl font-bold mb-6 leading-tight">
                      Explore our shoes<br />
                      collection
                    </h3>
                    <button className="bg-teal-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-teal-600 transition-colors text-lg">
                      Shop Now
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
            <section className="px-6 mb-12">
              <div className="container mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Deals</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Exclusive Deals */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <Icon name="Package" size={20} />
                        <span className="font-medium">Siriia</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">
                        Indulge in<br />
                        exclusive deals
                      </h3>
                      <p className="text-blue-100 mb-6">
                        Shop now and enjoy<br />
                        fantastic discounts on<br />
                        premium items.
                      </p>
                      <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-colors">
                        Shop Now
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
                <div className="bg-gray-50 rounded-3xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">We're always here to help</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon name="Headphones" size={24} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Real-time support</h3>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon name="Users" size={24} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Buying concierge</h3>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon name="Shield" size={24} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Selling protection</h3>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <ErrorBoundary>
          <footer className="bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-6 py-16">
              {/* Main Footer Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
                {/* Brand Section */}
                <div className="md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-6">
                    <Icon name="Package" size={28} className="text-teal-600" />
                    <span className="font-bold text-2xl text-gray-900">IziShopin</span>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed max-w-sm">
                    Cameroon's leading marketplace connecting buyers and sellers across the country. Shop with confidence using secure payments via MTN MoMo, Orange Money & Visa.
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="p-3 hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md">
                      <Icon name="Instagram" size={20} className="text-gray-600 hover:text-pink-600" />
                    </button>
                    <button className="p-3 hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md">
                      <Icon name="Twitter" size={20} className="text-gray-600 hover:text-blue-500" />
                    </button>
                    <button className="p-3 hover:bg-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md">
                      <Icon name="Facebook" size={20} className="text-gray-600 hover:text-blue-600" />
                    </button>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-6 text-lg">Menu</h4>
                  <ul className="space-y-3">
                    <li><button className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-left">Live Page</button></li>
                    <li><button className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-left">Shop</button></li>
                    <li><button className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-left">New Arrivals</button></li>
                    <li><button className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-left">Featured Deals</button></li>
                    <li><button className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-left">Categories</button></li>
                  </ul>
                </div>

                {/* Policy Links */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-6 text-lg">Policy</h4>
                  <ul className="space-y-3">
                    <li><button className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-left">Terms of Service</button></li>
                    <li><button className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-left">Privacy Policy</button></li>
                    <li><button className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-left">Cookie Policy</button></li>
                    <li><button className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-left">Return Policy</button></li>
                    <li><button className="text-gray-600 hover:text-teal-600 transition-colors duration-200 text-left">Shipping Info</button></li>
                  </ul>
                </div>

                {/* App Download & Newsletter */}
                <div className="md:col-span-2 lg:col-span-1">
                  <h4 className="font-semibold text-gray-900 mb-6 text-lg">Stay Connected</h4>
                  
                  {/* Newsletter Signup */}
                  <div className="mb-8">
                    <p className="text-gray-600 mb-4">Get updates on new arrivals and exclusive deals</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      />
                      <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 whitespace-nowrap">
                        Subscribe
                      </button>
                    </div>
                  </div>

                  {/* App Download */}
                  <div>
                    <p className="text-gray-600 mb-4">Download our app</p>
                    <div className="flex flex-col gap-3">
                      <button className="bg-black text-white px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md">
                        <Icon name="Smartphone" size={24} />
                        <div className="text-left">
                          <div className="text-xs opacity-80">Download on the</div>
                          <div className="font-semibold">App Store</div>
                        </div>
                      </button>
                      <button className="bg-black text-white px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md">
                        <Icon name="Play" size={24} />
                        <div className="text-left">
                          <div className="text-xs opacity-80">Get it on</div>
                          <div className="font-semibold">Google Play</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Bottom */}
              <div className="pt-8 border-t border-gray-300">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-gray-500 text-center md:text-left">
                    © 2024 IziShopin. All rights reserved.
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <button className="text-gray-500 hover:text-teal-600 transition-colors duration-200">Help Center</button>
                    <button className="text-gray-500 hover:text-teal-600 transition-colors duration-200">Contact Us</button>
                    <button className="text-gray-500 hover:text-teal-600 transition-colors duration-200">Accessibility</button>
                </div>
                </div>
              </div>
            </div>
          </footer>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default LandingPage;