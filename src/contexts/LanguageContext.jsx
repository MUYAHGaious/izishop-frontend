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
    'landing.whyChoose': 'Why Choose IziShopin?',
    'landing.whyChooseSubtext': 'Experience the best online marketplace in Cameroon with unmatched convenience, security, and local expertise.',
    'landing.fastDelivery': 'Fast Delivery',
    'landing.fastDeliveryDesc': 'Quick shipping nationwide',
    'landing.realtimeSupport': 'Real-time Support',
    'landing.realtimeSupportDesc': '24/7 customer assistance',
    'landing.buyingConcierge': 'Buying Concierge',
    'landing.buyingConciergeDesc': 'Personal shopping guidance',
    'landing.sellingProtection': 'Selling Protection',
    'landing.sellingProtectionDesc': 'Secure seller guarantees',
    'landing.exploreCollection': 'Explore Collection',
    'landing.findPerfectPair': 'Find your perfect pair',
    'landing.support247': '24/7 Support',
    'landing.quickDeliveryDesc': 'Receive your orders quickly with our reliable delivery network nationwide.',

    // Landing page cards
    'landing.yourStyleDelivered': 'Your Style, Delivered.',
    'landing.exclusivelyOnline': 'Exclusively Online.',
    'landing.shopNow': 'Shop Now',
    'landing.discoverOur': 'Discover our',
    'landing.accessoriesCollection': 'accessories collection',
    'landing.exploreOurShoes': 'Explore our shoes',
    'landing.shoesCollection': 'collection',
    'landing.shopNowAndEnjoy': 'Shop now and enjoy',
    'landing.freeShipping': 'free shipping',
    'landing.indulgeIn': 'Indulge in',
    'landing.exclusiveDeals': 'exclusive deals',
    'landing.shopNowAndEnjoyDesc': 'Shop now and enjoy fantastic discounts on premium items.',

    // Categories
    'category.electronics': 'Electronics',
    'category.fashion': 'Fashion',
    'category.sports': 'Sports',
    'category.home': 'Home & Living',
    'category.beauty': 'Health & Beauty',
    'category.food': 'Food & Agriculture',
    'category.automotive': 'Automotive',
    'category.books': 'Books',

    // Product catalog
    'sort.mostRelevant': 'Most Relevant',
    'sort.priceLowHigh': 'Price: Low to High',
    'sort.priceHighLow': 'Price: High to Low',
    'sort.highestRated': 'Highest Rated',
    'filter.filters': 'Filters',
    'product.noResults': 'No products found',
    'product.loading': 'Loading products...',
    'product.showingResults': 'Showing {count} results',

    // Common buttons and actions
    'button.addToCart': 'Add to Basket',
    'button.addToWishlist': 'Add to Wishlist',
    'button.removeFromWishlist': 'Remove from Wishlist',
    'button.viewDetails': 'View Details',
    'button.buyNow': 'Buy Now',
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    'button.edit': 'Edit',
    'button.delete': 'Delete',
    'button.update': 'Update',
    'button.confirm': 'Confirm',
    'button.loadMore': 'Load More',

    // Shopping cart
    'cart.title': 'Shopping Basket',
    'cart.empty': 'Your basket is empty',
    'cart.subtotal': 'Subtotal',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.quantity': 'Quantity',
    'cart.remove': 'Remove',

    // User interface
    'ui.search': 'Search',
    'ui.price': 'Price',
    'ui.rating': 'Rating',
    'ui.brand': 'Brand',
    'ui.category': 'Category',
    'ui.inStock': 'In Stock',
    'ui.outOfStock': 'Out of Stock',
    'ui.onlyLeftInStock': 'Only {count} left',
    'ui.reviews': 'Reviews',
    'ui.description': 'Description',

    // Wishlist
    'wishlist.title': 'My Wishlist',
    'wishlist.loading': 'Loading wishlist...',
    'wishlist.empty': 'Your wishlist is empty',
    'wishlist.cleared': 'Wishlist cleared successfully',
    'wishlist.clear': 'Clear All',
    'wishlist.removed': 'Removed from wishlist',

    // Reviews
    'reviews.customerReviews': 'Customer Reviews',
    'reviews.writeReview': 'Write Review',
    'reviews.basedOn': 'Based on {count} reviews',
    'reviews.verifiedPurchase': 'Verified Purchase',
    'reviews.reviewImage': 'Review image {index}',
    'reviews.helpful': 'Helpful',
    'reviews.reply': 'Reply',
    'reviews.previous': 'Previous',
    'reviews.next': 'Next',
    'reviews.writeAReview': 'Write a Review',
    'reviews.newestFirst': 'Newest First',
    'reviews.oldestFirst': 'Oldest First',
    'reviews.highestRating': 'Highest Rating',
    'reviews.lowestRating': 'Lowest Rating',
    'reviews.mostHelpful': 'Most Helpful',
    'reviews.allRatings': 'All Ratings',
    'reviews.stars': '{count} Stars',
    'reviews.star': '{count} Star',

    // Footer
    'footer.marketplace': 'Marketplace',
    'footer.browseProducts': 'Browse Products',
    'footer.featuredShops': 'Featured Shops',
    'footer.categories': 'Categories',
    'footer.secondhandMarket': 'Second-hand Market',
    'footer.newArrivals': 'New Arrivals',
    'footer.forSellers': 'For Sellers',
    'footer.startSelling': 'Start Selling',
    'footer.sellerDashboard': 'Seller Dashboard',
    'footer.sellerGuidelines': 'Seller Guidelines',
    'footer.commissionRates': 'Commission Rates',
    'footer.sellerSupport': 'Seller Support',
    'footer.customerCare': 'Customer Care',
    'footer.helpCenter': 'Help Center',
    'footer.contactUs': 'Contact Us',
    'footer.orderTracking': 'Order Tracking',
    'footer.returnsRefunds': 'Returns & Refunds',
    'footer.shippingInfo': 'Shipping Info',
    'footer.company': 'Company',
    'footer.aboutIziShopin': 'About IziShopin',
    'footer.careers': 'Careers',
    'footer.pressMedia': 'Press & Media',
    'footer.investorRelations': 'Investor Relations',
    'footer.sustainability': 'Sustainability',
    'footer.followUs': 'Follow us on social media',
    'footer.allRightsReserved': 'All rights reserved.',
    'footer.connectWithUs': 'Connect with us',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.secureCheckout': 'Secure Checkout',
    'checkout.completeOrder': 'Complete your order securely and quickly',
    'checkout.securePayment': 'Secure Payment',
    'checkout.escrowProtection': 'Escrow Protection',
    'checkout.fastDelivery': 'Fast Delivery',
    'checkout.support247': '24/7 Support',
    'checkout.poweredByTranzak': 'Powered by Tranzak',
    'checkout.deliveryAddress': 'Delivery Address',
    'checkout.deliveryAddressDesc': 'Where should we deliver your order?',
    'checkout.addressBook': 'Address Book',

    // Payment
    'payment.mtnDescription': 'Pay securely with MTN Mobile Money',
    'payment.orangeDescription': 'Pay securely with Orange Money',
    'payment.cardDescription': 'International credit/debit cards',
    'payment.success': 'Payment processed successfully!',
    'payment.failed': 'Payment failed',
    'payment.generalError': 'Payment processing error. Please try again.',

    // Common
    'common.previous': 'Previous',
    'common.next': 'Next'
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
    'greeting.evening': 'Bonsoir',

    // Landing page
    'landing.freeDelivery': 'Livraison Gratuite',
    'landing.ordersOver': 'Commandes 50K+ XAF',
    'landing.securePayments': 'Paiements Sécurisés',
    'landing.paymentMethods': 'MTN MoMo & Visa',
    'landing.localSellers': 'Vendeurs Locaux',
    'landing.acrossCameroon': 'À travers le Cameroun',
    'landing.shopByCategory': 'Acheter par Catégorie',
    'landing.viewAll': 'Voir Tout',
    'landing.newArrivals': 'Nouveautés',
    'landing.whyChoose': 'Pourquoi Choisir IziShopin?',
    'landing.whyChooseSubtext': 'Découvrez la meilleure marketplace en ligne du Cameroun avec une commodité, sécurité et expertise locale inégalées.',
    'landing.fastDelivery': 'Livraison Rapide',
    'landing.fastDeliveryDesc': 'Expédition rapide nationale',
    'landing.realtimeSupport': 'Support en Temps Réel',
    'landing.realtimeSupportDesc': 'Assistance client 24h/7j',
    'landing.buyingConcierge': 'Service Achat Personnalisé',
    'landing.buyingConciergeDesc': 'Conseils d\'achat personnel',
    'landing.sellingProtection': 'Protection Vendeur',
    'landing.sellingProtectionDesc': 'Garanties sécurisées vendeur',
    'landing.exploreCollection': 'Explorer la Collection',
    'landing.findPerfectPair': 'Trouvez votre paire parfaite',
    'landing.support247': 'Support 24h/7j',
    'landing.quickDeliveryDesc': 'Recevez vos commandes rapidement avec notre réseau de livraison fiable à l\'échelle nationale.',

    // Landing page cards
    'landing.yourStyleDelivered': 'Votre Style, Livré.',
    'landing.exclusivelyOnline': 'Exclusivement en Ligne.',
    'landing.shopNow': 'Acheter Maintenant',
    'landing.discoverOur': 'Découvrez notre',
    'landing.accessoriesCollection': 'collection d\'accessoires',
    'landing.exploreOurShoes': 'Explorez notre collection',
    'landing.shoesCollection': 'de chaussures',
    'landing.shopNowAndEnjoy': 'Achetez maintenant et profitez',
    'landing.freeShipping': 'de la livraison gratuite',
    'landing.indulgeIn': 'Profitez',
    'landing.exclusiveDeals': 'des offres exclusives',
    'landing.shopNowAndEnjoyDesc': 'Achetez maintenant et profitez de remises fantastiques sur des articles premium.',

    // Categories
    'category.electronics': 'Électronique',
    'category.fashion': 'Mode',
    'category.sports': 'Sports',
    'category.home': 'Maison & Vie',
    'category.beauty': 'Santé & Beauté',
    'category.food': 'Alimentation & Agriculture',
    'category.automotive': 'Automobile',
    'category.books': 'Livres',

    // Product catalog
    'sort.mostRelevant': 'Plus Pertinent',
    'sort.priceLowHigh': 'Prix: Croissant',
    'sort.priceHighLow': 'Prix: Décroissant',
    'sort.highestRated': 'Mieux Noté',
    'filter.filters': 'Filtres',
    'product.noResults': 'Aucun produit trouvé',
    'product.loading': 'Chargement des produits...',
    'product.showingResults': 'Affichage de {count} résultats',

    // Common buttons and actions
    'button.addToCart': 'Ajouter au Panier',
    'button.addToWishlist': 'Ajouter aux Favoris',
    'button.removeFromWishlist': 'Retirer des Favoris',
    'button.viewDetails': 'Voir les Détails',
    'button.buyNow': 'Acheter Maintenant',
    'button.save': 'Enregistrer',
    'button.cancel': 'Annuler',
    'button.edit': 'Modifier',
    'button.delete': 'Supprimer',
    'button.update': 'Mettre à jour',
    'button.confirm': 'Confirmer',
    'button.loadMore': 'Charger Plus',

    // Shopping cart
    'cart.title': 'Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.subtotal': 'Sous-total',
    'cart.total': 'Total',
    'cart.checkout': 'Passer la Commande',
    'cart.quantity': 'Quantité',
    'cart.remove': 'Retirer',

    // User interface
    'ui.search': 'Rechercher',
    'ui.price': 'Prix',
    'ui.rating': 'Note',
    'ui.brand': 'Marque',
    'ui.category': 'Catégorie',
    'ui.inStock': 'En Stock',
    'ui.outOfStock': 'Rupture de Stock',
    'ui.onlyLeftInStock': 'Plus que {count} en stock',
    'ui.reviews': 'Avis',
    'ui.description': 'Description',

    // Wishlist
    'wishlist.title': 'Ma Liste de Souhaits',
    'wishlist.loading': 'Chargement de la liste...',
    'wishlist.empty': 'Votre liste de souhaits est vide',
    'wishlist.cleared': 'Liste de souhaits vidée avec succès',
    'wishlist.clear': 'Tout Effacer',
    'wishlist.removed': 'Retiré de la liste de souhaits',

    // Reviews
    'reviews.customerReviews': 'Avis Clients',
    'reviews.writeReview': 'Écrire un Avis',
    'reviews.basedOn': 'Basé sur {count} avis',
    'reviews.verifiedPurchase': 'Achat Vérifié',
    'reviews.reviewImage': 'Image d\'avis {index}',
    'reviews.helpful': 'Utile',
    'reviews.reply': 'Répondre',
    'reviews.previous': 'Précédent',
    'reviews.next': 'Suivant',
    'reviews.writeAReview': 'Écrire un Avis',
    'reviews.newestFirst': 'Plus Récents',
    'reviews.oldestFirst': 'Plus Anciens',
    'reviews.highestRating': 'Meilleure Note',
    'reviews.lowestRating': 'Note Faible',
    'reviews.mostHelpful': 'Plus Utiles',
    'reviews.allRatings': 'Toutes les Notes',
    'reviews.stars': '{count} Étoiles',
    'reviews.star': '{count} Étoile',

    // Footer
    'footer.marketplace': 'Marketplace',
    'footer.browseProducts': 'Parcourir les Produits',
    'footer.featuredShops': 'Boutiques à la Une',
    'footer.categories': 'Catégories',
    'footer.secondhandMarket': 'Marché d\'Occasion',
    'footer.newArrivals': 'Nouveautés',
    'footer.forSellers': 'Pour les Vendeurs',
    'footer.startSelling': 'Commencer à Vendre',
    'footer.sellerDashboard': 'Tableau de Bord Vendeur',
    'footer.sellerGuidelines': 'Guide du Vendeur',
    'footer.commissionRates': 'Taux de Commission',
    'footer.sellerSupport': 'Support Vendeur',
    'footer.customerCare': 'Service Client',
    'footer.helpCenter': 'Centre d\'Aide',
    'footer.contactUs': 'Nous Contacter',
    'footer.orderTracking': 'Suivi de Commande',
    'footer.returnsRefunds': 'Retours et Remboursements',
    'footer.shippingInfo': 'Info Livraison',
    'footer.company': 'Entreprise',
    'footer.aboutIziShopin': 'À Propos d\'IziShopin',
    'footer.careers': 'Carrières',
    'footer.pressMedia': 'Presse & Médias',
    'footer.investorRelations': 'Relations Investisseurs',
    'footer.sustainability': 'Développement Durable',
    'footer.followUs': 'Suivez-nous sur les réseaux sociaux',
    'footer.allRightsReserved': 'Tous droits réservés.',
    'footer.connectWithUs': 'Connectez-vous avec nous',

    // Checkout
    'checkout.title': 'Commande',
    'checkout.secureCheckout': 'Commande Sécurisée',
    'checkout.completeOrder': 'Complétez votre commande de manière sécurisée et rapide',
    'checkout.securePayment': 'Paiement Sécurisé',
    'checkout.escrowProtection': 'Protection Séquestre',
    'checkout.fastDelivery': 'Livraison Rapide',
    'checkout.support247': 'Support 24/7',
    'checkout.poweredByTranzak': 'Propulsé par Tranzak',
    'checkout.deliveryAddress': 'Adresse de Livraison',
    'checkout.deliveryAddressDesc': 'Où devons-nous livrer votre commande?',
    'checkout.addressBook': 'Carnet d\'Adresses',

    // Payment
    'payment.mtnDescription': 'Payez en toute sécurité avec MTN Mobile Money',
    'payment.orangeDescription': 'Payez en toute sécurité avec Orange Money',
    'payment.cardDescription': 'Cartes de crédit/débit internationales',
    'payment.success': 'Paiement traité avec succès!',
    'payment.failed': 'Paiement échoué',
    'payment.generalError': 'Erreur de traitement du paiement. Veuillez réessayer.',

    // Common
    'common.previous': 'Précédent',
    'common.next': 'Suivant'
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