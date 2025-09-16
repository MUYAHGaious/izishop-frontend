import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { useAuth } from '../../../contexts/AuthContext';
import { showToast } from '../../../components/ui/Toast';

const ReviewsSection = ({ product, reviews = [] }) => {
  const [selectedRating, setSelectedRating] = useState('all');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '' });
  const { isAuthenticated } = useAuth();

  // Calculate rating distribution from real reviews
  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : product?.rating || 0;

  const filteredReviews = selectedRating === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(selectedRating));

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

  const handleSubmitReview = async () => {
    if (!isAuthenticated()) {
      showToast('Please log in to submit a review', 'info', 3000);
      return;
    }

    if (!newReview.title.trim() || !newReview.content.trim()) {
      showToast('Please fill in all required fields', 'warning', 3000);
      return;
    }

    try {
      // TODO: Submit review to backend API
      // const response = await api.post(`/api/products/${product.id}/reviews`, newReview);
      
      showToast('Review submitted successfully!', 'success', 3000);
      setNewReview({ rating: 5, title: '', content: '' });
      setShowReviewForm(false);
      
      // Refresh reviews (this would typically be handled by the parent component)
      // window.location.reload();
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Failed to submit review', 'error', 3000);
    }
  };

  const handleHelpfulClick = (reviewId) => {
    // TODO: Implement helpful vote functionality
    console.log('Marked review as helpful:', reviewId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-teal-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-teal-200/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
        
        {/* Rating Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-600">{averageRating}</div>
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={16}
                      className={`${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-current' :'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500">{totalReviews} reviews</div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 w-8">{rating}</span>
                <Icon name="Star" size={14} className="text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full h-2 transition-all duration-300"
                    style={{
                      width: `${(ratingDistribution[rating] / totalReviews) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">
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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedRating === 'all' 
                  ? 'bg-teal-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600'
              }`}
            >
              All Reviews
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating.toString())}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedRating === rating.toString()
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600'
                }`}
              >
                {rating} Stars ({ratingDistribution[rating]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-teal-200/30">
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
                      <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                      {review.user.isVerified && (
                        <Icon name="BadgeCheck" size={16} className="text-teal-600" />
                      )}
                      {review.isVerifiedPurchase && (
                        <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-medium">
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
                                ? 'text-yellow-400 fill-current' :'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    
                    {review.title && (
                      <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {displayContent}
                  </p>
                  
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpandReview(review.id)}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors duration-300"
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
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity duration-300"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Seller Response */}
                {review.sellerResponse && (
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 ml-8">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Store" size={16} className="text-teal-600" />
                      <span className="text-sm font-medium text-gray-900">Seller Response</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.sellerResponse.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.sellerResponse.content}</p>
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center space-x-4 text-sm">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-teal-600 transition-colors duration-300">
                    <Icon name="ThumbsUp" size={14} />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                  
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors duration-300">
                    <Icon name="Flag" size={14} />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageSquare" size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500">Be the first to review this product</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filteredReviews.length > 3 && (
        <div className="p-6 border-t border-teal-200/50 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400"
          >
            {showAllReviews ? 'Show Less Reviews' : `Show All ${filteredReviews.length} Reviews`}
          </Button>
        </div>
      )}

      {/* Write Review Button */}
      <div className="p-6 border-t border-teal-200/50">
        <Button 
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white w-full py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          fullWidth
        >
          <Icon name="Edit3" size={16} className="mr-2" />
          Write a Review
        </Button>
      </div>
    </div>
  );
};

export default ReviewsSection;