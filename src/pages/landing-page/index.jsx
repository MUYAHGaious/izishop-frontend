import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import ErrorBoundary from '../../components/ErrorBoundary';
import HeroSection from './components/HeroSection';
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

      <div className="min-h-screen bg-background">
        {/* Header */}
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>

        {/* Main Content */}
        <main className="pt-16">
          {/* Hero Section */}
          <ErrorBoundary>
            <HeroSection />
          </ErrorBoundary>

          {/* Product Categories Grid */}
          <ErrorBoundary>
            <ProductCategoriesGrid />
          </ErrorBoundary>

          {/* Statistics Section */}
          <ErrorBoundary>
            <StatisticsSection />
          </ErrorBoundary>

          {/* Newsletter Section */}
          <ErrorBoundary>
            <NewsletterSection />
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </>
  );
};

export default LandingPage;