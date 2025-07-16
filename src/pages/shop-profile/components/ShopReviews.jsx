import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ShopReviews = ({ reviews, shopRating, totalReviews }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
    { value: 'helpful', label: 'Most Helpful' }
  ];

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  const ratingDistribution = [
    { stars: 5, count: 245, percentage: 65 },
    { stars: 4, count: 89, percentage: 24 },
    { stars: 3, count: 28, percentage: 7 },
    { stars: 2, count: 11, percentage: 3 },
    { stars: 1, count: 4, percentage: 1 }
  ];

  const filteredReviews = reviews.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpfulCount - a.helpfulCount;
      default:
        return 0;
    }
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={14}
        className={`${
          index < rating
            ? 'text-warning fill-current' :'text-border'
        }`}
      />
    ));
  };

  const ReviewCard = ({ review }) => (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Image
            src={review.userAvatar}
            alt={review.userName}
            className="w-10 h-10 rounded-full"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-medium text-foreground">{review.userName}</div>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <div className="flex items-center space-x-1">
                  {renderStars(review.rating)}
                </div>
                <span>•</span>
                <span>{formatDate(review.date)}</span>
                {review.isVerifiedPurchase && (
                  <>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-success">
                      <Icon name="ShieldCheck" size={12} />
                      <span>Verified Purchase</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-foreground mb-3 leading-relaxed">
            {review.comment}
          </p>
          
          {review.images && review.images.length > 0 && (
            <div className="flex space-x-2 mb-3">
              {review.images.map((image, index) => (
                <div key={index} className="w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-sm text-text-secondary hover:text-primary marketplace-transition">
                <Icon name="ThumbsUp" size={14} />
                <span>Helpful ({review.helpfulCount})</span>
              </button>
              <button className="text-sm text-text-secondary hover:text-primary marketplace-transition">
                Reply
              </button>
            </div>
            
            {review.productName && (
              <div className="text-sm text-text-secondary">
                Product: {review.productName}
              </div>
            )}
          </div>
          
          {review.shopResponse && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Store" size={14} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Shop Response</span>
                <span className="text-xs text-text-secondary">
                  {formatDate(review.shopResponse.date)}
                </span>
              </div>
              <p className="text-sm text-foreground">
                {review.shopResponse.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold text-foreground mb-2">
              {shopRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-1 mb-2">
              {renderStars(Math.round(shopRating))}
            </div>
            <div className="text-text-secondary">
              Based on {totalReviews} reviews
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-12">
                  <span className="text-sm text-foreground">{item.stars}</span>
                  <Icon name="Star" size={12} className="text-warning fill-current" />
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-warning h-2 rounded-full marketplace-transition"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="text-sm text-text-secondary w-8">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
          <div className="text-lg font-semibold text-foreground">
            Customer Reviews ({filteredReviews.length})
          </div>
          
          <div className="flex items-center space-x-3">
            <Select
              options={ratingOptions}
              value={filterRating}
              onChange={setFilterRating}
              placeholder="Filter by rating"
              className="w-40"
            />
            
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
              className="w-40"
            />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {sortedReviews.length > 0 ? (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          
          {/* Load More Button */}
          <div className="text-center pt-4">
            <Button variant="outline">
              Load More Reviews
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-text-secondary" />
          <h3 className="text-lg font-medium text-foreground mb-2">No reviews found</h3>
          <p className="text-text-secondary">
            {filterRating !== 'all' ?'Try adjusting your rating filter' :'This shop hasn\'t received any reviews yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ShopReviews;