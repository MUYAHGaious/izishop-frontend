import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
import Icon from '../../components/AppIcon';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import api from '../../services/api';

import Footer from './components/Footer';
import ProductCard from '../product-catalog/components/ProductCard';


const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async (productId, isInWishlist) => {
    try {
      await toggleWishlist({ id: productId });
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);

    // Fetch latest products for New Arrivals section
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        // Fetch latest 4 products
        const response = await api.getAllProducts(0, 4, true);

        let products = [];
        if (response && Array.isArray(response)) {
          products = response;
        } else if (response && response.products) {
          products = response.products;
        }

        // Transform snake_case to camelCase for ProductCard compatibility
        const transformedProducts = products.map(product => ({
          ...product,
          shopName: product.shop_name || 'IziShopin Store',
          shopId: product.shop_id,
          shopVerified: product.shop_verified || false,
          shopRating: product.shop_rating || 0,
          shopReviews: product.shop_reviews || 0,
          shopLocation: product.shop_location || 'Cameroon',
          shopOwnerId: product.shop_owner_id,
          imageUrl: product.image_url,
          stockQuantity: product.stock_quantity,
          isActive: product.is_active,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        }));

        setNewArrivals(transformedProducts);
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
        // Keep empty array on error
        setNewArrivals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
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


  const brandLogos = [
    { node: <img src="/assets/brands/nike.svg" alt="Nike" style={{ height: '34px' }} />, title: "Nike" },
    { node: <img src="/assets/brands/adidas.svg" alt="Adidas" style={{ height: '34px' }} />, title: "Adidas" },
    { node: <img src="/assets/brands/puma.svg" alt="Puma" style={{ height: '34px' }} />, title: "Puma" },
    { node: <img src="/assets/brands/zara.svg" alt="Zara" style={{ height: '30px' }} />, title: "Zara" },
    { node: <img src="/assets/brands/hm.svg" alt="H&M" style={{ height: '34px' }} />, title: "H&M" }
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
        <main className="pt-20">
          {/* Hero Section - Exact Reference Match */}
          <ErrorBoundary>
            <section className="relative h-[500px] bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl mx-6 mb-12 overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600">
                <div className="absolute inset-0 bg-black/20"></div>
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

                      <h1
                        className="text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight tracking-wide"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Simple is More
                      </h1>
                    </div>

                    {/* Right Content intentionally left minimal */}
                    <div className="hidden lg:block" aria-hidden="true"></div>
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

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="flex flex-col items-center gap-2 w-20 group"
                    >
                      <span className="w-16 h-16 rounded-full bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                        <Icon name={category.icon} size={24} className="text-teal-600" />
                      </span>
                      <span className="text-sm text-gray-700 text-center leading-tight">{category.name}</span>
                    </button>
                  ))}
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
                  <button
                    onClick={() => navigate('/product-catalog')}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    See all
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                  </div>
                ) : newArrivals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {newArrivals.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product,
                          isNew: true
                        }}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="Package" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">No new arrivals available at the moment</p>
                    <button
                      onClick={() => navigate('/product-catalog')}
                      className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Browse all products
                    </button>
                  </div>
                )}
              </div>
            </section>
          </ErrorBoundary>

          {/* Featured collections — static row (scroll-stack animation removed) */}
          <ErrorBoundary>
            <section className="px-6 my-10">
              <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                <div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="Package" size={20} />
                      <span className="text-lg font-medium">Siriia</span>
                    </div>
                    <h3 className="text-xl font-bold leading-snug">
                      {t('landing.yourStyleDelivered')} {t('landing.exclusivelyOnline')}
                    </h3>
                  </div>
                  <button className="self-start mt-4 bg-white text-teal-600 px-6 py-2.5 rounded-full font-semibold hover:bg-gray-50 transition-colors">
                    {t('landing.shopNow')}
                  </button>
                </div>

                <div className="bg-gray-900 text-white rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
                  <div>
                    <span className="text-teal-400 mb-2 block text-sm">{t('landing.exploreCollection')}</span>
                    <h3 className="text-xl font-bold leading-snug">
                      {t('landing.discoverOur')} {t('landing.accessoriesCollection')}
                    </h3>
                  </div>
                  <button className="self-start mt-4 bg-teal-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-teal-600 transition-colors">
                    {t('landing.shopNow')}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
                  <div>
                    <span className="text-gray-600 mb-2 block text-sm">{t('landing.findPerfectPair')}</span>
                    <h3 className="text-xl font-bold leading-snug">
                      {t('landing.exploreOurShoes')} {t('landing.shoesCollection')}
                    </h3>
                  </div>
                  <button className="self-start mt-4 bg-teal-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-teal-600 transition-colors">
                    {t('landing.shopNow')}
                  </button>
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

                <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 py-4">
                  {brandLogos.map((logo, i) => (
                    <span key={i} className="opacity-70 hover:opacity-100 transition-opacity" title={logo.title}>
                      {logo.node}
                    </span>
                  ))}
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

          {/* Why Choose IziShopin */}
          <ErrorBoundary>
            <section className="px-6 mb-8 bg-gray-50 py-8 relative overflow-hidden">
              {/* Blur Circle Effects */}
              <div className="absolute top-0 left-0 w-80 h-80 bg-white/15 rounded-full -translate-y-40 -translate-x-40 pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 translate-x-32 pointer-events-none"></div>
              
              <div className="container mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {t('landing.whyChoose')}
                  </h2>
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
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold" aria-label="Marie Kamga">MK</div>
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
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold" aria-label="Jean Nkomo">JN</div>
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
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold" aria-label="Amina Tchoua">AT</div>
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