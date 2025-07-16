import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import MobileBottomTab from '../../components/ui/MobileBottomTab';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ImageGallery from './components/ImageGallery';
import ProductInfo from './components/ProductInfo';
import VariantSelector from './components/VariantSelector';
import ReviewsSection from './components/ReviewsSection';
import ShopInfo from './components/ShopInfo';
import RelatedProducts from './components/RelatedProducts';
import ActionButtons from './components/ActionButtons';

const ProductDetailModal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  // Mock product data
  const product = {
    id: "prod_001",
    name: "Premium Wireless Bluetooth Headphones with Active Noise Cancellation",
    price: 89500,
    originalPrice: 125000,
    rating: 4.6,
    reviewCount: 1247,
    soldCount: 3420,
    inStock: true,
    stockCount: 47,
    brand: "AudioTech Pro",
    model: "AT-WH1000XM5",
    color: "Midnight Black",
    material: "Premium Plastic & Metal",
    weight: "250g",
    dimensions: "17.8 x 15.2 x 7.8 cm",
    description: `Experience premium audio quality with these state-of-the-art wireless headphones featuring industry-leading active noise cancellation technology. Perfect for music lovers, professionals, and travelers who demand exceptional sound quality and comfort.

Key features include 30-hour battery life, quick charge capability, premium build quality with comfortable ear cushions, and advanced Bluetooth 5.2 connectivity for seamless pairing with all your devices.`,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=500&h=500&fit=crop"
    ]
  };

  // Mock variants data
  const variants = {
    colors: [
      { value: 'black', label: 'Midnight Black', hex: '#1a1a1a', available: true },
      { value: 'white', label: 'Pearl White', hex: '#f8f8f8', available: true },
      { value: 'blue', label: 'Ocean Blue', hex: '#1e40af', available: true },
      { value: 'red', label: 'Crimson Red', hex: '#dc2626', available: false }
    ],
    styles: [
      { 
        value: 'standard', 
        label: 'Standard Edition', 
        description: 'Basic features with great sound quality',
        available: true 
      },
      { 
        value: 'pro', 
        label: 'Pro Edition', 
        description: 'Enhanced features with premium materials',
        available: true 
      }
    ]
  };

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      userName: "Sarah Johnson",
      userAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
      rating: 5,
      date: "2025-01-10",
      comment: "Absolutely amazing headphones! The noise cancellation is incredible and the sound quality is top-notch. Perfect for my daily commute and work from home setup.",
      verified: true,
      helpfulCount: 23,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop"
      ]
    },
    {
      id: 2,
      userName: "Michael Chen",
      userAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
      rating: 4,
      date: "2025-01-08",
      comment: "Great build quality and comfortable to wear for long periods. Battery life is excellent. Only minor complaint is the touch controls can be a bit sensitive.",
      verified: true,
      helpfulCount: 18,
      images: []
    },
    {
      id: 3,
      userName: "Emma Wilson",
      userAvatar: "https://randomuser.me/api/portraits/women/3.jpg",
      rating: 5,
      date: "2025-01-05",
      comment: "Best purchase I\'ve made this year! The active noise cancellation works perfectly on flights. Highly recommend for anyone who travels frequently.",
      verified: true,
      helpfulCount: 31,
      images: []
    },
    {
      id: 4,
      userName: "David Rodriguez",
      userAvatar: "https://randomuser.me/api/portraits/men/4.jpg",
      rating: 4,
      date: "2025-01-03",
      comment: "Solid headphones with great features. The app integration is smooth and the equalizer settings are very customizable. Worth the investment.",
      verified: false,
      helpfulCount: 12,
      images: []
    },
    {
      id: 5,
      userName: "Lisa Thompson",
      userAvatar: "https://randomuser.me/api/portraits/women/5.jpg",
      rating: 5,
      date: "2024-12-28",
      comment: "Exceptional audio quality and the quick charge feature is a lifesaver. Customer service was also very helpful when I had questions about setup.",
      verified: true,
      helpfulCount: 27,
      images: []
    }
  ];

  // Mock shop data
  const shop = {
    id: "shop_001",
    name: "AudioTech Pro Store",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
    rating: 4.8,
    reviewCount: 5420,
    productCount: 156,
    responseRate: 98,
    responseTime: "< 1 hour",
    followers: "12.5K",
    joinDate: "2020-03-15",
    badges: ["Verified Seller", "Top Rated", "Fast Shipping"]
  };

  // Mock related products
  const relatedProducts = [
    {
      id: "prod_002",
      name: "Wireless Earbuds Pro",
      price: 45000,
      originalPrice: 65000,
      rating: 4.4,
      reviewCount: 892,
      soldCount: 2150,
      location: "Douala",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop"
    },
    {
      id: "prod_003",
      name: "Gaming Headset RGB",
      price: 67500,
      originalPrice: null,
      rating: 4.7,
      reviewCount: 445,
      soldCount: 1230,
      location: "Yaoundé",
      image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=300&h=300&fit=crop"
    },
    {
      id: "prod_004",
      name: "Studio Monitor Speakers",
      price: 125000,
      originalPrice: 150000,
      rating: 4.5,
      reviewCount: 234,
      soldCount: 567,
      location: "Bamenda",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&h=300&fit=crop"
    },
    {
      id: "prod_005",
      name: "Portable Bluetooth Speaker",
      price: 32500,
      originalPrice: null,
      rating: 4.3,
      reviewCount: 678,
      soldCount: 1890,
      location: "Douala",
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop"
    }
  ];

  useEffect(() => {
    // Animate modal entrance
    setIsVisible(true);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate('/product-catalog');
    }, 300);
  };

  const handleVariantChange = (variants, qty) => {
    setSelectedVariants(variants);
    setQuantity(qty);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Modal Overlay */}
      <div 
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      >
        {/* Modal Content */}
        <div 
          className={`fixed inset-x-0 bottom-0 lg:inset-4 lg:max-w-6xl lg:mx-auto bg-surface rounded-t-2xl lg:rounded-2xl shadow-elevated transition-transform duration-300 ${
            isVisible ? 'translate-y-0' : 'translate-y-full lg:translate-y-0 lg:scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
            <h2 className="text-lg font-semibold text-text-primary">Product Details</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Desktop Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="hidden lg:flex absolute top-4 right-4 z-10"
          >
            <Icon name="X" size={20} />
          </Button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-120px)]">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:p-6">
              {/* Left Column - Images */}
              <div className="p-4 lg:p-0">
                <ImageGallery images={product.images} productName={product.name} />
              </div>

              {/* Right Column - Product Info */}
              <div className="p-4 lg:p-0 space-y-6">
                <ProductInfo product={product} />
                
                <VariantSelector 
                  variants={variants} 
                  onVariantChange={handleVariantChange}
                />
              </div>
            </div>

            {/* Full Width Sections */}
            <div className="px-4 lg:px-6">
              <ShopInfo shop={shop} />
              
              <ReviewsSection 
                reviews={reviews}
                averageRating={averageRating}
                totalReviews={reviews.length}
              />
              
              <RelatedProducts products={relatedProducts} />
            </div>

            {/* Bottom Spacing for Action Buttons */}
            <div className="h-32 lg:h-20"></div>
          </div>

          {/* Action Buttons */}
          <ActionButtons
            product={product}
            selectedVariants={selectedVariants}
            quantity={quantity}
            onClose={handleClose}
          />
        </div>
      </div>

      <MobileBottomTab />
    </div>
  );
};

export default ProductDetailModal;