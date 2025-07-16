import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ReviewsSection = ({ reviews, overallRating, ratingDistribution }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const renderStars = (rating, size = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={size}
        className={`${
          index < rating ? 'text-accent fill-current' : 'text-border'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold text-text-primary mb-2">{overallRating}</div>
            <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
              {renderStars(Math.floor(overallRating), 20)}
            </div>
            <div className="text-text-secondary">Based on {reviews.length} reviews</div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars] || 0;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-text-secondary">{stars}</span>
                  <Icon name="Star" size={14} className="text-accent fill-current" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-text-secondary text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
        
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-start gap-4">
              {/* Reviewer Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                <Image
                  src={review.avatar}
                  alt={review.customerName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-text-primary">{review.customerName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating, 14)}
                      </div>
                      <span className="text-sm text-text-secondary">{formatDate(review.date)}</span>
                    </div>
                  </div>
                  
                  {review.isVerified && (
                    <div className="flex items-center gap-1 text-xs text-success">
                      <Icon name="ShieldCheck" size={14} />
                      <span>Verified Purchase</span>
                    </div>
                  )}
                </div>

                <p className="text-text-secondary mb-3 leading-relaxed">{review.comment}</p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {review.images.map((image, index) => (
                      <div key={index} className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                        <Image
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Product Info */}
                {review.productName && (
                  <div className="text-sm text-text-secondary mb-3">
                    Product: {review.productName}
                  </div>
                )}

                {/* Helpful Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors">
                    <Icon name="ThumbsUp" size={14} />
                    <span>Helpful ({review.helpfulCount})</span>
                  </button>
                  
                  <button className="text-text-secondary hover:text-text-primary transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Reviews */}
      {reviews.length >= 10 && (
        <div className="text-center">
          <Button variant="outline" iconName="ChevronDown" iconPosition="right">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;