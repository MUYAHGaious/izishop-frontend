import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ImageGallery from './components/ImageGallery';
import ProductInfo from './components/ProductInfo';
import SellerCard from './components/SellerCard';
import ProductDescription from './components/ProductDescription';
import ReviewsSection from './components/ReviewsSection';
import RelatedProducts from './components/RelatedProducts';
import StickyPurchaseBar from './components/StickyPurchaseBar';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../../components/ui/Toast';

const ProductDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const productId = searchParams.get('id') || '1';

  // Mock product data
  const mockProduct = {
    id: 1,
    name: 'iPhone 14 Pro Max 256GB',
    price: 899000,
    originalPrice: 999000,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'
    ],
    rating: 4.8,
    reviewCount: 1247,
    sku: 'IPH14PM256',
    isVerified: true,
    inStock: true,
    stock: 15,
    isSecondHand: false,
    category: 'Electronics',
    subcategory: 'Smartphones',
    description: `The iPhone 14 Pro Max delivers our most advanced Pro camera system ever, with a 48MP Main camera that captures incredible detail and color. The Always-On display keeps your Lock Screen glanceable, so you don't have to tap it to stay in the know.\n\nThe A16 Bionic chip powers advanced features like Cinematic mode and delivers exceptional performance and efficiency. With up to 29 hours of video playback, iPhone 14 Pro Max has the longest battery life ever in an iPhone.\n\nBuilt with aerospace-grade titanium and featuring the Action button, iPhone 14 Pro Max is designed to handle whatever life throws your way.`,
    highlights: [
      '48MP Main camera with 2x Telephoto','Always-On display with ProMotion','A16 Bionic chip with 6-core GPU','Up to 29 hours video playback','Aerospace-grade titanium design','Action button for quick shortcuts'
    ],
    features: [
      'Face ID for secure authentication','Water resistant to 6 meters for up to 30 minutes','MagSafe and Qi wireless charging','5G connectivity for superfast downloads','iOS 17 with advanced privacy features'
    ],
    specifications: [
      { name: 'Display', value: '6.7-inch Super Retina XDR OLED' },
      { name: 'Processor', value: 'A16 Bionic chip' },
      { name: 'Storage', value: '256GB' },
      { name: 'Camera', value: '48MP + 12MP + 12MP Triple camera' },
      { name: 'Front Camera', value: '12MP TrueDepth' },
      { name: 'Battery', value: 'Up to 29 hours video playback' },
      { name: 'Operating System', value: 'iOS 17' },
      { name: 'Connectivity', value: '5G, Wi-Fi 6, Bluetooth 5.3' },
      { name: 'Water Resistance', value: 'IP68' },
      { name: 'Weight', value: '240 grams' }
    ],
    variants: [
      {
        id: 1,
        type: 'storage',name: '128GB',
        price: 799000,
        stock: 8,
        available: true
      },
      {
        id: 2,
        type: 'storage',name: '256GB',
        price: 899000,
        stock: 15,
        available: true
      },
      {
        id: 3,
        type: 'storage',name: '512GB',
        price: 1099000,
        stock: 3,
        available: true
      }
    ],
    variantTypes: [
      {
        name: 'Storage',
        options: [
          { value: '128gb', label: '128GB', price: 799000, available: true },
          { value: '256gb', label: '256GB', price: 899000, available: true },
          { value: '512gb', label: '512GB', price: 1099000, available: true }
        ]
      },
      {
        name: 'Color',
        options: [
          { value: 'space-black', label: 'Space Black', available: true },
          { value: 'silver', label: 'Silver', available: true },
          { value: 'gold', label: 'Gold', available: false },
          { value: 'deep-purple', label: 'Deep Purple', available: true }
        ]
      }
    ],
    deliveryTime: '2-3 business days',deliveryFee: 0,expressDelivery: true,expressDeliveryTime: '1 business day',
    expressDeliveryFee: 2000,
    returnPolicy: '7-day return policy',
    returnWindow: '7 days from delivery',warranty: '1 Year Apple Warranty',warrantyDetails: 'Comprehensive warranty covering manufacturing defects and hardware issues. Does not cover accidental damage or liquid damage.',shipFrom: 'Douala, Cameroon',dimensions: '30cm x 20cm x 5cm, 0.5kg',
    shop: {
      id: 1,
      name: 'TechHub Store',type: 'shop',avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
      isVerified: true,
      isOnline: true,
      rating: 4.9,
      reviewCount: 2847,
      productCount: 1250,
      responseRate: 98,
      responseTime: 15,
      location: 'Douala, Cameroon',joinedDate: 'March 2020',lastSeen: '2 hours ago',
      hasBusinessLicense: true,
      hasReturnPolicy: true,
      badges: [
        { name: 'Top Seller', icon: 'Award' },
        { name: 'Fast Shipping', icon: 'Truck' },
        { name: 'Quality Assured', icon: 'Shield' }
      ]
    }
  };

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProduct(mockProduct);
        setSelectedVariant(mockProduct.variants?.[1] || null);
        
        // Check if product is in wishlist
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(wishlist.includes(productId));
        
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleWishlistToggle = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (isWishlisted) {
      const updatedWishlist = wishlist.filter(id => id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsWishlisted(false);
    } else {
      wishlist.push(productId);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsWishlisted(true);
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = product?.name || 'Check out this product';
    const text = `${title} - Available on IziShop`;

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          // Show success toast
        } catch (error) {
          console.error('Failed to copy:', error);
        }
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
    }
    
    setShareMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="aspect-square bg-muted rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-12 bg-muted rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <Icon name="Package" size={64} className="mx-auto mb-4 text-text-secondary" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
              <p className="text-text-secondary mb-6">The product you're looking for doesn't exist or has been removed.</p>
              <Button onClick={handleBack}>
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Actions */}
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBack}
                className="p-2 rounded-md text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
              
              <nav className="flex items-center space-x-2 text-sm">
                <span className="text-text-secondary">Home</span>
                <Icon name="ChevronRight" size={14} className="text-text-secondary" />
                <span className="text-text-secondary">{product.category}</span>
                <Icon name="ChevronRight" size={14} className="text-text-secondary" />
                <span className="text-foreground font-medium truncate max-w-[200px]">
                  {product.name}
                </span>
              </nav>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-md marketplace-transition ${
                  isWishlisted
                    ? 'text-error bg-error/10 hover:bg-error/20' :'text-text-secondary hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="Heart" size={20} className={isWishlisted ? 'fill-current' : ''} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className="p-2 rounded-md text-text-secondary hover:text-foreground hover:bg-muted marketplace-transition"
                >
                  <Icon name="Share2" size={20} />
                </button>
                
                {shareMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-1000"
                      onClick={() => setShareMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-modal z-1010">
                      <div className="py-1">
                        <button
                          onClick={() => handleShare('copy')}
                          className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted marketplace-transition"
                        >
                          <Icon name="Copy" size={16} className="mr-3" />
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted marketplace-transition"
                        >
                          <Icon name="MessageCircle" size={16} className="mr-3" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted marketplace-transition"
                        >
                          <Icon name="Facebook" size={16} className="mr-3" />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted marketplace-transition"
                        >
                          <Icon name="Twitter" size={16} className="mr-3" />
                          Twitter
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Product Content */}
          <div className="py-8 space-y-8">
            {/* Product Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Image Gallery */}
              <div className="lg:col-span-3">
                <ImageGallery images={product.images} productName={product.name} />
              </div>

              {/* Product Info & Seller */}
              <div className="lg:col-span-2 space-y-6">
                <ProductInfo product={product} />
                <SellerCard seller={product.shop} />
              </div>
            </div>

            {/* Product Description */}
            <ProductDescription product={product} />

            {/* Reviews Section */}
            <ReviewsSection product={product} />

            {/* Related Products */}
            <RelatedProducts 
              currentProductId={product.id} 
              category={product.category} 
            />
          </div>
        </div>
      </div>

      {/* Sticky Purchase Bar */}
      <StickyPurchaseBar
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />
    </div>
  );
};

export default ProductDetail;