import React from 'react';
import { Star, ThumbsUp, ThumbsDown, Calendar, User } from 'lucide-react';

const ModernReviewsSection = ({ reviews, shopRating, totalReviews }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Recently';
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < Math.floor(rating || 0)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = Math.floor(review.rating || 0);
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const totalReviewCount = reviews.length;

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Star size={40} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No reviews yet
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Be the first to review this shop and help other customers make informed decisions.
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
            <Star size={18} />
            Write a Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {shopRating ? parseFloat(shopRating).toFixed(1) : '0.0'}
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-1 mb-2">
              {renderStars(shopRating)}
            </div>
            <div className="text-gray-600">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating];
              const percentage = totalReviewCount > 0 ? (count / totalReviewCount) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-8">
                    <span className="text-sm font-medium text-gray-600">{rating}</span>
                    <Star size={12} className="text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">
          Customer Reviews ({totalReviews})
        </h3>
        
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {review.user?.profile_photo ? (
                    <img
                      src={review.user.profile_photo}
                      alt={review.user.first_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-teal-600" />
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {review.user?.first_name} {review.user?.last_name}
                    </h4>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {review.comment}
                    </p>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors">
                      <ThumbsUp size={16} />
                      <span className="text-sm">Helpful ({review.helpful_count || 0})</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors">
                      <ThumbsDown size={16} />
                      <span className="text-sm">Not helpful ({review.not_helpful_count || 0})</span>
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
            <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200">
              Load More Reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernReviewsSection;
