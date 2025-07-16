import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import ShopHero from './components/ShopHero';
import ShopStats from './components/ShopStats';
import ShopOwnerInfo from './components/ShopOwnerInfo';
import ProductGrid from './components/ProductGrid';
import ReviewsSection from './components/ReviewsSection';
import AboutSection from './components/AboutSection';
import FloatingContact from './components/FloatingContact';

const ShopProfile = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('products');
  const [isLoading, setIsLoading] = useState(true);

  const shopId = searchParams.get('id') || '1';

  // Mock shop data
  const shopData = {
    id: shopId,
    name: "TechHub Electronics",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center",
    bannerImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop&crop=center",
    rating: 4.8,
    reviewCount: 1247,
    location: "Douala, Cameroon",
    productCount: 156,
    followerCount: 2834,
    yearsActive: 5,
    isVerified: true,
    isPremium: true,
    isOnline: true,
    description: `TechHub Electronics is your premier destination for cutting-edge technology and electronics in Cameroon. We specialize in providing high-quality smartphones, laptops, gaming equipment, and smart home devices from leading global brands.`,
    mission: `Our mission is to make advanced technology accessible to everyone in Cameroon while providing exceptional customer service and competitive prices.`,
    vision: `To become the leading electronics retailer in Central Africa, known for innovation, reliability, and customer satisfaction.`,
    address: "123 Commercial Avenue, Akwa, Douala, Cameroon",
    phone: "+237 6XX XXX XXX",
    email: "info@techhub.cm",
    website: "www.techhub.cm",
    coordinates: {
      lat: 4.0511,
      lng: 9.7679
    },
    certifications: [
      { name: "Authorized Apple Reseller", issuer: "Apple Inc." },
      { name: "Samsung Partner", issuer: "Samsung Electronics" },
      { name: "ISO 9001:2015", issuer: "International Organization for Standardization" }
    ]
  };

  const ownerData = {
    name: "Jean-Baptiste Kouam",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=center",
    bio: "Passionate technology entrepreneur with over 10 years of experience in the electronics industry. Committed to bringing the latest innovations to the Cameroonian market.",
    email: "jb.kouam@techhub.cm",
    phone: "+237 6XX XXX XXX",
    memberSince: "January 2019",
    isVerified: true,
    certifications: ["Electronics Engineering", "Business Management", "Apple Certified Technician"]
  };

  const statsData = {
    salesVolume: "2.5M XAF",
    salesChange: 15.3,
    responseTime: "< 2 hours",
    shippingTime: "1-3 days",
    satisfactionRate: 96
  };

  const productsData = [
    {
      id: 1,
      name: "iPhone 15 Pro Max 256GB",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center",
      price: 850000,
      originalPrice: 950000,
      rating: 4.9,
      reviewCount: 127,
      stock: 15,
      isNew: true,
      discount: 11,
      category: "electronics"
    },
    {
      id: 2,
      name: "MacBook Air M2 13-inch",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center",
      price: 1200000,
      originalPrice: null,
      rating: 4.8,
      reviewCount: 89,
      stock: 8,
      isNew: false,
      discount: 0,
      category: "electronics"
    },
    {
      id: 3,
      name: "Samsung Galaxy S24 Ultra",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop&crop=center",
      price: 750000,
      originalPrice: 800000,
      rating: 4.7,
      reviewCount: 203,
      stock: 22,
      isNew: false,
      discount: 6,
      category: "electronics"
    },
    {
      id: 4,
      name: "Sony WH-1000XM5 Headphones",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center",
      price: 180000,
      originalPrice: 220000,
      rating: 4.6,
      reviewCount: 156,
      stock: 35,
      isNew: false,
      discount: 18,
      category: "electronics"
    },
    {
      id: 5,
      name: "iPad Pro 12.9-inch M2",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&crop=center",
      price: 950000,
      originalPrice: null,
      rating: 4.8,
      reviewCount: 94,
      stock: 12,
      isNew: true,
      discount: 0,
      category: "electronics"
    },
    {
      id: 6,
      name: "Dell XPS 13 Laptop",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&crop=center",
      price: 680000,
      originalPrice: 750000,
      rating: 4.5,
      reviewCount: 67,
      stock: 18,
      isNew: false,
      discount: 9,
      category: "electronics"
    },
    {
      id: 7,
      name: "Nintendo Switch OLED",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop&crop=center",
      price: 280000,
      originalPrice: 320000,
      rating: 4.7,
      reviewCount: 189,
      stock: 25,
      isNew: false,
      discount: 13,
      category: "electronics"
    },
    {
      id: 8,
      name: "Apple Watch Series 9",
      image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop&crop=center",
      price: 320000,
      originalPrice: null,
      rating: 4.6,
      reviewCount: 112,
      stock: 30,
      isNew: true,
      discount: 0,
      category: "electronics"
    }
  ];

  const reviewsData = [
    {
      id: 1,
      customerName: "Marie Ngozi",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center",
      rating: 5,
      date: "2025-01-10",
      comment: "Excellent service! My iPhone arrived exactly as described and the customer support was outstanding. TechHub really knows their products.",
      productName: "iPhone 15 Pro Max 256GB",
      isVerified: true,
      helpfulCount: 12,
      images: [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop&crop=center"
      ]
    },
    {
      id: 2,
      customerName: "Paul Mbarga",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center",
      rating: 4,
      date: "2025-01-08",
      comment: "Great selection of products and competitive prices. Delivery was fast and packaging was secure. Will definitely shop here again.",
      productName: "MacBook Air M2 13-inch",
      isVerified: true,
      helpfulCount: 8,
      images: []
    },
    {
      id: 3,
      customerName: "Fatima Bello",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center",
      rating: 5,
      date: "2025-01-05",
      comment: "Amazing experience from start to finish. The staff is knowledgeable and helped me choose the perfect laptop for my needs. Highly recommended!",
      productName: "Dell XPS 13 Laptop",
      isVerified: true,
      helpfulCount: 15,
      images: []
    },
    {
      id: 4,
      customerName: "Emmanuel Tabi",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center",
      rating: 4,
      date: "2025-01-03",
      comment: "Good quality products and reasonable prices. The headphones I bought work perfectly and the sound quality is excellent.",
      productName: "Sony WH-1000XM5 Headphones",
      isVerified: true,
      helpfulCount: 6,
      images: []
    },
    {
      id: 5,
      customerName: "Grace Asong",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=center",
      rating: 5,
      date: "2024-12-28",
      comment: "TechHub is my go-to store for all electronics. They always have the latest products and their customer service is exceptional.",
      productName: "Samsung Galaxy S24 Ultra",
      isVerified: true,
      helpfulCount: 9,
      images: []
    }
  ];

  const ratingDistribution = {
    5: 847,
    4: 298,
    3: 78,
    2: 18,
    1: 6
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/product-catalog' },
    { label: 'Shops', path: '/product-catalog' },
    { label: shopData.name, path: `/shop-profile?id=${shopId}` }
  ];

  const tabs = [
    { id: 'products', label: 'Products', count: shopData.productCount },
    { id: 'reviews', label: 'Reviews', count: shopData.reviewCount },
    { id: 'about', label: 'About' }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFollow = (isFollowing) => {
    console.log('Follow status:', isFollowing);
  };

  const handleContact = (type) => {
    console.log('Contact type:', type);
    
    switch (type) {
      case 'chat':
        // Open chat modal or redirect to chat
        break;
      case 'call':
        window.open(`tel:${shopData.phone}`);
        break;
      case 'email':
        window.open(`mailto:${shopData.email}`);
        break;
      default:
        console.log('General contact');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-20">
          <div className="animate-pulse">
            <div className="h-48 md:h-64 lg:h-80 bg-muted" />
            <div className="container mx-auto px-4 py-8">
              <div className="space-y-6">
                <div className="h-8 bg-muted rounded w-1/3" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-muted rounded-xl" />
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-48 bg-muted rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <MobileBottomTab />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 lg:pt-20 pb-20 lg:pb-8">
        {/* Shop Hero Section */}
        <ShopHero 
          shop={shopData} 
          onFollow={handleFollow}
          onContact={() => handleContact('general')}
        />

        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="flex items-center border-b border-border mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary' :'bg-muted text-text-secondary'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in">
                {activeTab === 'products' && (
                  <ProductGrid products={productsData} shopId={shopId} />
                )}
                
                {activeTab === 'reviews' && (
                  <ReviewsSection 
                    reviews={reviewsData}
                    overallRating={shopData.rating}
                    ratingDistribution={ratingDistribution}
                  />
                )}
                
                {activeTab === 'about' && (
                  <AboutSection shop={shopData} />
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <ShopStats stats={statsData} />
              <ShopOwnerInfo owner={ownerData} />
            </div>
          </div>
        </div>
      </main>

      <FloatingContact shop={shopData} onContact={handleContact} />
      <MobileBottomTab />
    </div>
  );
};

export default ShopProfile;