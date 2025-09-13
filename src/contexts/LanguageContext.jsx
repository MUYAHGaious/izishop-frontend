import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Simple translations for EN (UK) and French
const translations = {
  'en-GB': {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.shops': 'Shops',
    'nav.wishlist': 'Wishlist',
    'nav.cart': 'Shopping Basket',
    'nav.notifications': 'Notifications',
    'nav.profile': 'My Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Sign Out',
    'nav.getStarted': 'Get Started',

    // Search
    'search.placeholder': 'Search products...',

    // Common actions
    'action.addToCart': 'Add to Basket',
    'action.addToWishlist': 'Add to Wishlist',
    'action.removeFromWishlist': 'Remove from Wishlist',
    'action.viewDetails': 'View Details',
    'action.buyNow': 'Buy Now',

    // Language switcher
    'language.current': 'English (UK)',
    'language.switch': 'Switch Language',

    // Currency
    'currency.symbol': '£',
    'currency.code': 'GBP',

    // Navigation links
    'nav.myOrders': 'My Orders',
    'nav.support': 'Support',
    'nav.marketplace': 'Marketplace',
    'nav.sell': 'Sell',

    // Greetings
    'greeting.morning': 'Good Morning',
    'greeting.afternoon': 'Good Afternoon',
    'greeting.evening': 'Good Evening',

    // Landing page
    'landing.freeDelivery': 'Free Delivery',
    'landing.ordersOver': 'Orders 50K+ XAF',
    'landing.securePayments': 'Secure Payments',
    'landing.paymentMethods': 'MTN MoMo & Visa',
    'landing.localSellers': 'Local Sellers',
    'landing.acrossCameroon': 'Across Cameroon',
    'landing.shopByCategory': 'Shop by Category',
    'landing.viewAll': 'View All',
    'landing.newArrivals': 'New Arrivals',

    // Categories
    'category.electronics': 'Electronics',
    'category.fashion': 'Fashion',
    'category.sports': 'Sports',
    'category.home': 'Home & Living',
    'category.beauty': 'Health & Beauty',
    'category.food': 'Food & Agriculture',
    'category.automotive': 'Automotive',
    'category.books': 'Books'
  },
  'fr': {
    // Navigation
    'nav.home': 'Accueil',
    'nav.products': 'Produits',
    'nav.categories': 'Catégories',
    'nav.shops': 'Boutiques',
    'nav.wishlist': 'Liste de souhaits',
    'nav.cart': 'Panier',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Mon Profil',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Se déconnecter',
    'nav.getStarted': 'Commencer',

    // Search
    'search.placeholder': 'Rechercher des produits...',

    // Common actions
    'action.addToCart': 'Ajouter au panier',
    'action.addToWishlist': 'Ajouter aux favoris',
    'action.removeFromWishlist': 'Retirer des favoris',
    'action.viewDetails': 'Voir les détails',
    'action.buyNow': 'Acheter maintenant',

    // Language switcher
    'language.current': 'Français',
    'language.switch': 'Changer de langue',

    // Currency
    'currency.symbol': '€',
    'currency.code': 'EUR',

    // Navigation links
    'nav.myOrders': 'Mes Commandes',
    'nav.support': 'Support',
    'nav.marketplace': 'Marché',
    'nav.sell': 'Vendre',

    // Greetings
    'greeting.morning': 'Bonjour',
    'greeting.afternoon': 'Bon Après-midi',
    'greeting.evening': 'Bonsoir'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en-GB');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('izishop_language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language || navigator.languages[0];
      if (browserLang.startsWith('fr')) {
        setCurrentLanguage('fr');
      } else {
        setCurrentLanguage('en-GB');
      }
    }
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('izishop_language', currentLanguage);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: currentLanguage }
    }));

    console.log(`🌐 Language switched to: ${currentLanguage === 'en-GB' ? 'English (UK)' : 'Français'}`);
  }, [currentLanguage]);

  // Translation function
  const t = (key, fallback = key) => {
    return translations[currentLanguage]?.[key] || translations['en-GB']?.[key] || fallback;
  };

  // Change language function
  const changeLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  // Toggle between EN and FR
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en-GB' ? 'fr' : 'en-GB';
    changeLanguage(newLanguage);
  };

  // Get available languages
  const getAvailableLanguages = () => [
    { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)' },
    { code: 'fr', name: 'French', nativeName: 'Français' }
  ];

  const value = {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    t,
    getAvailableLanguages,
    isRTL: false, // Neither English nor French are RTL
    currency: {
      symbol: t('currency.symbol'),
      code: t('currency.code')
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};