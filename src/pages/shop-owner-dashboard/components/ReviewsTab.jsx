import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';
import { showToast } from '../../../components/ui/Toast';

const ReviewsTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  // Load reviews from API
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        
        // Get shop data first
        const shopData = await api.getMyShop();
        const response = await api.getShopReviews(shopData.id, currentPage, reviewsPerPage);
        
        const reviewsData = response.reviews || response || [];
        const transformedReviews = reviewsData.map(review => ({
          id: review.id || `REV-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
          customer: {
            name: review.user_name || review.customer_name || 'Anonymous',
            email: review.user_email || review.customer_email || '',
            avatar: review.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name || 'User')}&background=random`
          },
          rating: review.rating || 5,
          review: review.review || review.comment || '',
          product: {
            name: review.product_name || 'Product',
            id: review.product_id
          },
          date: review.created_at || new Date().toISOString(),
          verified: review.verified_purchase || false,
          helpful: review.helpful_count || 0,
          reply: review.reply || null
        }));
        
        setReviews(transformedReviews);
        
        // Calculate stats
        const total = transformedReviews.length;
        const avgRating = total > 0 ? transformedReviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        transformedReviews.forEach(r => {
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });
        
        setStats({
          totalReviews: total,
          averageRating: avgRating,
          ratingDistribution: distribution
        });
        
      } catch (error) {
        console.error('Error loading reviews:', error);
        showToast({
          type: 'error',
          message: 'Failed to load reviews',
          duration: 3000
        });
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [currentPage]);

  // Handle review reply
  const handleReply = async (reviewId, replyText) => {
    try {
      await api.replyToReview(reviewId, { reply: replyText });
      
      // Update local state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { ...review, reply: replyText }
            : review
        )
      );
      
      showToast({
        type: 'success',
        message: 'Reply sent successfully',
        duration: 3000
      });
    } catch (error) {
      console.error('Error replying to review:', error);
      showToast({
        type: 'error',
        message: 'Failed to send reply',
        duration: 3000
      });
    }
  };

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={14}
        className={`${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = !ratingFilter || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Reviews Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Icon name="Star" size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Rating</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <div className="flex">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Icon name="Award" size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">5 Star Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ratingDistribution[5]}</p>
              <p className="text-sm text-green-600">
                {stats.totalReviews > 0 ? Math.round((stats.ratingDistribution[5] / stats.totalReviews) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Recent Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => new Date(r.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-blue-600">This week</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={ratingOptions}
            value={ratingFilter}
            onChange={setRatingFilter}
            placeholder="Filter by rating"
            className="w-full sm:w-48"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" iconName="RefreshCw" iconPosition="left">
            Refresh
          </Button>
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: reviewsPerPage }).map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-gray-200 rounded"></div>
                      <div className="w-20 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onReply={handleReply}
              renderStars={renderStars}
              formatDate={formatDate}
            />
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Icon name="Star" size={48} className="text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">No reviews found</h3>
              <p className="text-gray-500 max-w-md">
                {searchQuery || ratingFilter 
                  ? "Try adjusting your search or filter criteria"
                  : "Reviews from customers will appear here when they rate your products"
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredReviews.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {filteredReviews.length} reviews
            {searchQuery && ` matching "${searchQuery}"`}
            {ratingFilter && ` with ${ratingFilter} stars`}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              iconName="ChevronLeft" 
              iconPosition="left"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {currentPage}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              iconName="ChevronRight" 
              iconPosition="right"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={filteredReviews.length < reviewsPerPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review, onReply, renderStars, formatDate }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(review.id, replyText.trim());
      setReplyText('');
      setShowReplyForm(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
      {/* Review Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img
              src={review.customer.avatar}
              alt={review.customer.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/assets/images/no_image.png';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="font-semibold text-gray-900">{review.customer.name}</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="text-sm text-gray-600">{formatDate(review.date)}</span>
                  {review.verified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Icon name="CheckCircle" size={12} className="mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Product: {review.product.name}</p>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="mt-4">
        {review.review && (
          <p className="text-gray-700 leading-relaxed">{review.review}</p>
        )}
      </div>

      {/* Review Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Icon name="ThumbsUp" size={14} />
            <span>{review.helpful} helpful</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!review.reply && (
            <Button 
              variant="outline" 
              size="sm" 
              iconName="MessageCircle" 
              iconPosition="left"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </Button>
          )}
          <Button variant="ghost" size="sm" iconName="MoreHorizontal">
            More
          </Button>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleSubmitReply} className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <div className="flex items-center space-x-2">
              <Button type="submit" size="sm" disabled={!replyText.trim()}>
                Send Reply
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Existing Reply */}
      {review.reply && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-start space-x-3">
            <Icon name="MessageCircle" size={16} className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900 text-sm">Your Reply:</p>
              <p className="text-blue-800 mt-1">{review.reply}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;