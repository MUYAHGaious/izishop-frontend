import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const FeaturedShopsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);

  const featuredShops = [
    {
      id: 1,
      name: "TechHub Store",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      rating: 4.8,
      reviewCount: 1247,
      category: "Electronics",
      description: "Premium electronics and gadgets",
      productsCount: 156,
      location: "Douala, Cameroon",
      verified: true,
      badge: "Top Seller"
    },
    {
      id: 2,
      name: "Fashion Central",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      rating: 4.6,
      reviewCount: 892,
      category: "Fashion",
      description: "Trendy clothing and accessories",
      productsCount: 234,
      location: "Yaoundé, Cameroon",
      verified: true,
      badge: "Featured"
    },
    {
      id: 3,
      name: "Home & Garden Plus",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      rating: 4.7,
      reviewCount: 634,
      category: "Home & Garden",
      description: "Everything for your home",
      productsCount: 189,
      location: "Bamenda, Cameroon",
      verified: true,
      badge: "New"
    },
    {
      id: 4,
      name: "Sports Arena",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      rating: 4.5,
      reviewCount: 456,
      category: "Sports",
      description: "Sports equipment and gear",
      productsCount: 98,
      location: "Garoua, Cameroon",
      verified: true,
      badge: "Popular"
    },
    {
      id: 5,
      name: "Beauty Boutique",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
      rating: 4.9,
      reviewCount: 1089,
      category: "Beauty",
      description: "Cosmetics and skincare",
      productsCount: 267,
      location: "Douala, Cameroon",
      verified: true,
      badge: "Best Rated"
    },
    {
      id: 6,
      name: "Book Haven",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      rating: 4.4,
      reviewCount: 321,
      category: "Books",
      description: "Books and educational materials",
      productsCount: 445,
      location: "Yaoundé, Cameroon",
      verified: true,
      badge: "Educational"
    }
  ];

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 4
  };

  const [currentItemsPerView, setCurrentItemsPerView] = useState(itemsPerView.mobile);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setCurrentItemsPerView(itemsPerView.desktop);
      } else if (width >= 768) {
        setCurrentItemsPerView(itemsPerView.tablet);
      } else {
        setCurrentItemsPerView(itemsPerView.mobile);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, featuredShops.length - currentItemsPerView);
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentItemsPerView, featuredShops.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, featuredShops.length - currentItemsPerView);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, featuredShops.length - currentItemsPerView);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const handleDotClick = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="Star" size={14} className="text-accent fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="Star" size={14} className="text-accent fill-current opacity-50" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="Star" size={14} className="text-muted-foreground" />
      );
    }

    return stars;
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Top Seller':
        return 'bg-accent text-accent-foreground';
      case 'Featured':
        return 'bg-primary text-primary-foreground';
      case 'New':
        return 'bg-success text-success-foreground';
      case 'Popular':
        return 'bg-secondary text-secondary-foreground';
      case 'Best Rated':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const maxIndex = Math.max(0, featuredShops.length - currentItemsPerView);
  const totalDots = maxIndex + 1;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Shops
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover amazing products from our top-rated sellers across Cameroon
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-muted marketplace-transition shadow-card"
            style={{ marginLeft: '-24px' }}
          >
            <Icon name="ChevronLeft" size={20} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-muted marketplace-transition shadow-card"
            style={{ marginRight: '-24px' }}
          >
            <Icon name="ChevronRight" size={20} />
          </button>

          {/* Carousel Track */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div
              className="flex marketplace-transition-page"
              style={{
                transform: `translateX(-${currentIndex * (100 / currentItemsPerView)}%)`,
                width: `${(featuredShops.length / currentItemsPerView) * 100}%`
              }}
            >
              {featuredShops.map((shop) => (
                <div
                  key={shop.id}
                  className="px-3"
                  style={{ width: `${100 / featuredShops.length}%` }}
                >
                  <div className="bg-card border border-border rounded-lg shadow-card hover:shadow-modal marketplace-transition overflow-hidden group">
                    {/* Shop Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 marketplace-transition"
                      />
                      
                      {/* Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(shop.badge)}`}>
                          {shop.badge}
                        </span>
                      </div>

                      {/* Verified Badge */}
                      {shop.verified && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                            <Icon name="Check" size={14} className="text-success-foreground" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shop Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground truncate flex-1">
                          {shop.name}
                        </h3>
                      </div>

                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {shop.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex items-center mr-2">
                          {renderStars(shop.rating)}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {shop.rating}
                        </span>
                        <span className="text-sm text-text-secondary ml-1">
                          ({shop.reviewCount.toLocaleString()})
                        </span>
                      </div>

                      {/* Shop Stats */}
                      <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                        <div className="flex items-center">
                          <Icon name="Package" size={14} className="mr-1" />
                          {shop.productsCount} products
                        </div>
                        <div className="flex items-center">
                          <Icon name="MapPin" size={14} className="mr-1" />
                          {shop.location.split(',')[0]}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          <Icon name="Tag" size={12} className="mr-1" />
                          {shop.category}
                        </span>
                      </div>

                      {/* Visit Shop Button */}
                      <Link to={`/shop-profile?id=${shop.id}`}>
                        <Button variant="outline" size="sm" fullWidth iconName="Store" iconPosition="left">
                          Visit Shop
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalDots }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full marketplace-transition ${
                index === currentIndex ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>

        {/* View All Shops Link */}
        <div className="text-center mt-8">
          <Link to="/product-catalog">
            <Button variant="outline" size="lg" iconName="ArrowRight" iconPosition="right">
              View All Shops
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedShopsCarousel;