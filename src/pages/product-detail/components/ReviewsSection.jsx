import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ReviewsSection = ({ product }) => {
  const [selectedRating, setSelectedRating] = useState('all');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const mockReviews = [
    {
      id: 1,
      user: {
        name: 'Marie Dubois',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        isVerified: true
      },
      rating: 5,
      date: '2025-01-10',
      title: 'Excellent product quality!',
      content: `I'm really impressed with this product. The quality is outstanding and it arrived exactly as described. The packaging was secure and the delivery was fast. Would definitely recommend to others and will buy again.`,
      isVerifiedPurchase: true,
      helpful: 12,
      images: [
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400','https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'
      ],
      sellerResponse: {
        date: '2025-01-11',content: 'Thank you so much for your wonderful review! We really appreciate your feedback and are glad you love the product.'
      }
    },
    {
      id: 2,
      user: {
        name: 'Jean-Paul Kamga',avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        isVerified: true
      },
      rating: 4,
      date: '2025-01-08',title: 'Good value for money',
      content: `Overall satisfied with the purchase. The product works as expected and the price is reasonable. Delivery took a bit longer than expected but the seller kept me updated throughout the process.`,
      isVerifiedPurchase: true,
      helpful: 8,
      images: []
    },
    {
      id: 3,
      user: {
        name: 'Fatima Nkomo',avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
        isVerified: false
      },
      rating: 3,
      date: '2025-01-05',title: 'Average quality',
      content: `The product is okay but not exceptional. It does what it's supposed to do but I expected better quality for the price. The seller was responsive to my questions though.`,
      isVerifiedPurchase: true,
      helpful: 3,
      images: []
    },
    {
      id: 4,
      user: {
        name: 'Emmanuel Tabi',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        isVerified: true
      },
      rating: 5,
      date: '2025-01-03',
      title: 'Highly recommended!',
      content: `Fantastic product! Exceeded my expectations in every way. The build quality is solid, features work perfectly, and customer service was excellent. Will definitely shop here again.`,
      isVerifiedPurchase: true,
      helpful: 15,
      images: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'
      ]
    }
  ];

  const ratingDistribution = {
    5: 45,
    4: 25,
    3: 15,
    2: 10,
    1: 5
  };

  const totalReviews = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);
  const averageRating = product?.rating || 4.2;

  const filteredReviews = selectedRating === 'all' 
    ? mockReviews 
    : mockReviews.filter(review => review.rating === parseInt(selectedRating));

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3);

  const toggleExpandReview = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">Customer Reviews</h2>
        
        {/* Rating Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">{averageRating}</div>
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={16}
                      className={`${
                        i < Math.floor(averageRating)
                          ? 'text-warning fill-current' :'text-border'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-text-secondary">{totalReviews} reviews</div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground w-8">{rating}</span>
                <Icon name="Star" size={14} className="text-warning fill-current" />
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-warning rounded-full h-2 marketplace-transition"
                    style={{
                      width: `${(ratingDistribution[rating] / totalReviews) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-text-secondary w-8">
                  {ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRating('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium marketplace-transition ${
                selectedRating === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-text-secondary hover:bg-muted/80'
              }`}
            >
              All Reviews
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating.toString())}
                className={`px-3 py-1 rounded-full text-sm font-medium marketplace-transition ${
                  selectedRating === rating.toString()
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-text-secondary hover:bg-muted/80'
                }`}
              >
                {rating} Stars ({ratingDistribution[rating]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-border">
        {displayedReviews.length > 0 ? (
          displayedReviews.map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const shouldTruncate = review.content.length > 200;
            const displayContent = shouldTruncate && !isExpanded
              ? review.content.substring(0, 200) + '...'
              : review.content;

            return (
              <div key={review.id} className="p-6 space-y-4">
                {/* Review Header */}
                <div className="flex items-start space-x-3">
                  <Image
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-foreground">{review.user.name}</h4>
                      {review.user.isVerified && (
                        <Icon name="BadgeCheck" size={16} className="text-primary" />
                      )}
                      {review.isVerifiedPurchase && (
                        <span className="bg-success/10 text-success px-2 py-0.5 rounded-full text-xs font-medium">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            name="Star"
                            size={14}
                            className={`${
                              i < review.rating
                                ? 'text-warning fill-current' :'text-border'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-text-secondary">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    
                    {review.title && (
                      <h5 className="font-medium text-foreground mb-2">{review.title}</h5>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                <div className="space-y-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    {displayContent}
                  </p>
                  
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpandReview(review.id)}
                      className="text-primary hover:text-primary/80 text-sm font-medium marketplace-transition"
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {review.images.map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 rounded-md object-cover flex-shrink-0 cursor-pointer hover:opacity-80 marketplace-transition"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Seller Response */}
                {review.sellerResponse && (
                  <div className="bg-muted/50 rounded-lg p-4 ml-8">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Store" size={16} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">Seller Response</span>
                      <span className="text-xs text-text-secondary">
                        {formatDate(review.sellerResponse.date)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{review.sellerResponse.content}</p>
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center space-x-4 text-sm">
                  <button className="flex items-center space-x-1 text-text-secondary hover:text-foreground marketplace-transition">
                    <Icon name="ThumbsUp" size={14} />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                  
                  <button className="flex items-center space-x-1 text-text-secondary hover:text-foreground marketplace-transition">
                    <Icon name="Flag" size={14} />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-text-secondary" />
            <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet</h3>
            <p className="text-text-secondary">Be the first to review this product</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filteredReviews.length > 3 && (
        <div className="p-6 border-t border-border text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews ? 'Show Less Reviews' : `Show All ${filteredReviews.length} Reviews`}
          </Button>
        </div>
      )}

      {/* Write Review Button */}
      <div className="p-6 border-t border-border">
        <Button variant="default" fullWidth>
          <Icon name="Edit3" size={16} className="mr-2" />
          Write a Review
        </Button>
      </div>
    </div>
  );
};

export default ReviewsSection;