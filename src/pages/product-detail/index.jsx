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
        const productResponse = await api.get(`/api/products/${productId}`);
        const productData = productResponse.data;
        setProduct(productData);
        
        // Set default variant if available
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
        
        // Load product reviews
        try {
          const reviewsResponse = await api.get(`/api/products/${productId}/reviews`);
          setReviews(reviewsResponse.data || []);
        } catch (error) {
          console.log('No reviews available for this product');
          setReviews([]);
        }
        
        // Load related products
        try {
          const relatedResponse = await api.get(`/api/products/${productId}/related`);
          setRelatedProducts(relatedResponse.data || []);
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
                  isInWishlist(productId)
                    ? 'text-error bg-error/10 hover:bg-error/20' :'text-text-secondary hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="Heart" size={20} className={isInWishlist(productId) ? 'fill-current' : ''} />
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
            <ReviewsSection product={product} reviews={reviews} />

            {/* Related Products */}
            <RelatedProducts 
              currentProductId={product.id} 
              category={product.category} 
              relatedProducts={relatedProducts}
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
        onAddToCart={() => addToCart({
          id: product.id,
          name: product.name,
          price: selectedVariant?.price || product.price,
          image: product.images?.[0],
          shopId: product.shop?.id,
          shopName: product.shop?.name,
          variant: selectedVariant
        })}
      />
    </div>
  );
};

export default ProductDetail;