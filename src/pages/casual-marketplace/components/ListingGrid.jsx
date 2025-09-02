import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ListingCard = ({ listing, onDeleteListing, showActions, viewMode }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteListing(listing.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="flex p-4 gap-4">
          {/* Listing Image */}
          <div className="relative w-32 h-32 flex-shrink-0">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>
            )}
            {listing.images && listing.images.length > 0 ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <Icon name="Package" size={32} className="text-gray-400" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {listing.is_negotiable && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Negotiable
                </span>
              )}
            </div>
          </div>

          {/* Listing Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                {listing.title}
              </h3>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {listing.description}
            </p>

            {/* Price */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl font-bold text-teal-600">
                {formatPrice(listing.price)}
              </span>
            </div>

            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Icon name="MapPin" size={14} />
                {listing.location}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Tag" size={14} />
                {listing.condition}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Eye" size={14} />
                {listing.views || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={14} />
                {getTimeAgo(listing.created_at)}
              </span>
            </div>

            {/* Action Buttons */}
            {showActions && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:border-blue-500 hover:text-blue-500"
                >
                  <Icon name="Edit" size={14} className="mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:border-red-500 hover:text-red-500"
                >
                  {isDeleting ? (
                    <Icon name="Loader2" size={14} className="animate-spin mr-2" />
                  ) : (
                    <Icon name="Trash2" size={14} className="mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
      {/* Listing Image */}
      <div className="relative aspect-square overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        {listing.images && listing.images.length > 0 ? (
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Icon name="Package" size={48} className="text-gray-400" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            variant="outline"
            className="bg-white/90 backdrop-blur-sm border-white text-gray-900 hover:bg-white"
          >
            <Icon name="Eye" size={16} className="mr-2" />
            Quick View
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {listing.is_negotiable && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              Negotiable
            </span>
          )}
        </div>

        {/* Time Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {getTimeAgo(listing.created_at)}
          </span>
        </div>
      </div>

      {/* Listing Info */}
      <div className="p-4">
        {/* Listing Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-tight group-hover:text-teal-600 transition-colors duration-200">
          {listing.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {listing.description}
        </p>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-teal-600">
            {formatPrice(listing.price)}
          </span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Icon name="MapPin" size={12} />
            {listing.location}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Eye" size={12} />
            {listing.views || 0}
          </span>
        </div>

        {/* Condition & Category */}
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {listing.condition}
          </span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {listing.category}
          </span>
        </div>

        {/* Action Buttons */}
        {showActions ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-gray-300 hover:border-blue-500 hover:text-blue-500"
            >
              <Icon name="Edit" size={12} className="mr-1" />
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-gray-300 hover:border-red-500 hover:text-red-500"
            >
              {isDeleting ? (
                <Icon name="Loader2" size={12} className="animate-spin mr-1" />
              ) : (
                <Icon name="Trash2" size={12} className="mr-1" />
              )}
              Delete
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-teal-500 hover:bg-teal-600 text-white h-9 text-sm font-medium"
          >
            <Icon name="MessageCircle" size={14} className="mr-2" />
            Contact Seller
          </Button>
        )}
      </div>
    </div>
  );
};

const ListingGrid = ({ 
  listings, 
  loading, 
  onLoadMore, 
  hasMore, 
  viewMode = 'grid',
  onDeleteListing,
  showActions = false
}) => {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={`${viewMode === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' 
      : 'space-y-4'
    }`}>
      {[...Array(viewMode === 'grid' ? 20 : 10)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {viewMode === 'grid' ? (
            <>
              <div className="aspect-square bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </>
          ) : (
            <div className="flex p-4 gap-4">
              <div className="w-32 h-32 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading && listings.length === 0) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Listings Grid/List */}
      <div className={`${viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' 
        : 'space-y-4'
      }`}>
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onDeleteListing={onDeleteListing}
            showActions={showActions}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Load More Section */}
      {hasMore && (
        <div className="mt-12 text-center">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            size="lg"
            variant="outline"
            className="px-8 py-3 border-teal-500 text-teal-500 hover:bg-teal-50"
          >
            {loadingMore ? (
              <>
                <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                Loading more items...
              </>
            ) : (
              <>
                <Icon name="Plus" size={20} className="mr-2" />
                Load More Items
              </>
            )}
          </Button>
        </div>
      )}

      {/* End of results */}
      {!hasMore && listings.length > 0 && (
        <div className="mt-12 text-center py-8 border-t border-gray-200">
          <div className="text-gray-500 mb-2">
            <Icon name="CheckCircle" size={24} className="mx-auto mb-2 text-green-500" />
            You've seen all items!
          </div>
          <p className="text-sm text-gray-400">
            Showing {listings.length} items total
          </p>
        </div>
      )}

      {/* No listings found */}
      {!loading && listings.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Icon name="Package" size={48} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
          <Button
            variant="outline"
            className="mt-4 border-teal-500 text-teal-500 hover:bg-teal-50"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ListingGrid;