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
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { showToast } from '../../components/ui/Toast';
import api from '../../services/api';

const ProductDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const productId = searchParams.get('id') || '1';

  // Load real product data
  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      
      try {
        // Load product details
        const productData = await api.getProduct(productId);

        // Map backend response to frontend expected format
        const mappedProduct = {
          ...productData,
          images: productData.image_urls || [],
          videos: productData.video_urls || [],
          stock: productData.stock_quantity,
          // Use actual data only, no defaults
          rating: productData.rating || null,
          reviewCount: productData.review_count || 0
        };

        // Try to fetch shop data using seller_id
        try {
          const shopsResponse = await api.get(`/api/shops/?limit=100`, {}, false);
          const shops = shopsResponse.data || [];
          const sellerShop = shops.find(shop => shop.owner_id === productData.seller_id);

          if (sellerShop) {
            mappedProduct.shop = {
              id: sellerShop.id,
              name: sellerShop.name,
              avatar: sellerShop.profile_photo,
              rating: sellerShop.rating || null,
              reviewCount: sellerShop.review_count || 0,
              productCount: sellerShop.product_count || 0,
              responseRate: sellerShop.response_rate || null,
              responseTime: sellerShop.response_time || null,
              isVerified: sellerShop.is_verified || false,
              isOnline: sellerShop.is_online || false,
              type: 'shop',
              location: sellerShop.address,
              joinedDate: new Date(sellerShop.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              lastSeen: sellerShop.last_seen || null,
              email: sellerShop.email,
              phone: sellerShop.phone
            };
          } else {
            // Fallback if no shop found - use minimal real data
            mappedProduct.shop = {
              id: productData.seller_id,
              name: 'Individual Seller',
              avatar: null,
              rating: null,
              reviewCount: 0,
              productCount: 0,
              responseRate: null,
              responseTime: null,
              isVerified: false,
              isOnline: false,
              type: 'individual',
              location: null
            };
          }
        } catch (error) {
          console.log('Could not fetch shop data, using fallback');
          mappedProduct.shop = {
            id: productData.seller_id,
            name: 'Seller',
            avatar: null,
            rating: null,
            reviewCount: 0,
            productCount: 0,
            responseRate: null,
            responseTime: null,
            isVerified: false,
            isOnline: false,
            type: 'individual'
          };
        }

        setProduct(mappedProduct);
        
        // Set default variant if available
        if (mappedProduct.variants && mappedProduct.variants.length > 0) {
          setSelectedVariant(mappedProduct.variants[0]);
        }
        
        // Load product reviews
        try {
          const reviewsData = await api.get(`/api/products/${productId}/reviews`, {}, false);
          setReviews(reviewsData || []);
        } catch (error) {
          console.log('No reviews available for this product');
          setReviews([]);
        }

        // Load related products
        try {
          const relatedData = await api.get(`/api/products/${productId}/related`, {}, false);
          setRelatedProducts(relatedData || []);
        } catch (error) {
          console.log('No related products available');
          setRelatedProducts([]);
        }
        
      } catch (error) {
        console.error('Error loading product:', error);
        showToast('Failed to load product details', 'error', 3000);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated()) {
      showToast('Please log in to manage your wishlist', 'info', 3000);
      navigate('/authentication-login-register');
      return;
    }

    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
        showToast('Removed from wishlist', 'success', 2000);
      } else {
        await addToWishlist({
          id: productId,
          name: product.name,
          price: selectedVariant?.price || product.price,
          image: product.images?.[0],
          shopId: product.shop?.id,
          shopName: product.shop?.name
        });
        showToast('Added to wishlist', 'success', 2000);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showToast('Failed to update wishlist', 'error', 3000);
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
          showToast('Link copied to clipboard!', 'success', 2000);
        } catch (error) {
          console.error('Failed to copy:', error);
          showToast('Failed to copy link', 'error', 2000);
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
      default:
        break;
    }
    
    setShareMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="aspect-square bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl w-3/4"></div>
                  <div className="h-6 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl w-1/2"></div>
                  <div className="h-12 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl w-full"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Package" size={48} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-8 text-lg">The product you're looking for doesn't exist or has been removed.</p>
              <Button 
                onClick={handleBack}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Actions */}
          <div className="flex items-center justify-between py-6 border-b border-teal-200/50 bg-white/80 backdrop-blur-sm rounded-2xl px-6 mb-8 shadow-sm">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBack}
                className="p-3 rounded-xl text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
              
              <nav className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500 hover:text-teal-600 transition-colors">Home</span>
                <Icon name="ChevronRight" size={14} className="text-gray-400" />
                <span className="text-gray-500 hover:text-teal-600 transition-colors">{product.category}</span>
                <Icon name="ChevronRight" size={14} className="text-gray-400" />
                <span className="text-gray-900 font-medium truncate max-w-[200px]">
                  {product.name}
                </span>
              </nav>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                  isInWishlist(productId)
                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <Icon name="Heart" size={20} className={isInWishlist(productId) ? 'fill-current' : ''} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className="p-3 rounded-xl text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Icon name="Share2" size={20} />
                </button>
                
                {shareMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-1000"
                      onClick={() => setShareMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-teal-200 rounded-xl shadow-lg z-1010">
                      <div className="py-2">
                        <button
                          onClick={() => handleShare('copy')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors rounded-lg mx-2"
                        >
                          <Icon name="Copy" size={16} className="mr-3" />
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors rounded-lg mx-2"
                        >
                          <Icon name="MessageCircle" size={16} className="mr-3" />
                          WhatsApp
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors rounded-lg mx-2"
                        >
                          <Icon name="Facebook" size={16} className="mr-3" />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors rounded-lg mx-2"
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
          <div className="py-8 space-y-12">
            {/* Product Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Image Gallery */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-2xl overflow-hidden">
                    <ImageGallery images={product.images} productName={product.name} />
                  </div>
                </div>

                {/* Product Info & Seller */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl p-6">
                    <ProductInfo
                      product={product}
                      onAddToCart={async (cartItem) => {
                        try {
                          await addToCart(cartItem);
                        } catch (error) {
                          console.error('Error adding to cart:', error);
                        }
                      }}
                      onBuyNow={() => {
                        // Buy now handled within ProductInfo component
                      }}
                    />
                  </div>
                  <div className="bg-white rounded-2xl p-6">
                    <SellerCard seller={product.shop} />
                  </div>
                </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-2xl p-6">
              <ProductDescription product={product} />
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-6">
              <ReviewsSection product={product} reviews={reviews} />
            </div>

            {/* Related Products */}
            <div className="bg-white rounded-2xl p-6">
              <RelatedProducts 
                currentProductId={product.id} 
                category={product.category} 
                relatedProducts={relatedProducts}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Purchase Bar */}
      <StickyPurchaseBar
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={async () => {
          if (!isAuthenticated()) {
            showToast('Please log in to add items to cart', 'info', 3000);
            navigate('/authentication-login-register');
            return;
          }

          const cartItem = {
            id: product.id,
            name: product.name,
            price: selectedVariant?.price || product.price,
            image: product.images?.[0],
            shopId: product.shop?.id,
            shopName: product.shop?.name,
            variant: selectedVariant,
            quantity: quantity
          };

          try {
            await addToCart(cartItem);
            showToast(`${product.name} added to cart!`, 'success', 3000);
          } catch (error) {
            console.error('Error adding to cart:', error);
            showToast('Failed to add item to cart', 'error', 3000);
          }
        }}
      />
    </div>
  );
};

export default ProductDetail;