import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import MainHeader from '../../components/ui/MainHeader';
import HeroSection from './components/HeroSection';
import FeaturedShopsCarousel from './components/FeaturedShopsCarousel';
import ProductCategoriesGrid from './components/ProductCategoriesGrid';
import StatisticsSection from './components/StatisticsSection';
import NewsletterSection from './components/NewsletterSection';
import Footer from './components/Footer';

const LandingPage = () => {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>IziShop - Cameroon's Leading Marketplace | Shop & Sell Online</title>
        <meta 
          name="description" 
          content="Discover amazing products from verified sellers across Cameroon. Shop electronics, fashion, home goods and more. Start selling today with secure payments via MTN MoMo, Orange Money & Visa." 
        />
        <meta name="keywords" content="Cameroon marketplace, online shopping, MTN MoMo, Orange Money, e-commerce, buy sell online, Douala, Yaoundé" />
        <meta property="og:title" content="IziShop - Cameroon's Leading Marketplace" />
        <meta property="og:description" content="Shop from thousands of verified sellers across Cameroon with secure payments and fast delivery." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://izishop.cm" />
        <link rel="canonical" href="https://izishop.cm/landing-page" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <MainHeader />

        {/* Main Content */}
        <main className="pt-16">
          {/* Hero Section */}
          <HeroSection />

          {/* Featured Shops Carousel */}
          <FeaturedShopsCarousel />

          {/* Product Categories Grid */}
          <ProductCategoriesGrid />

          {/* Statistics Section */}
          <StatisticsSection />

          {/* Newsletter Section */}
          <NewsletterSection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;