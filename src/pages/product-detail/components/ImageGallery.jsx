import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ImageGallery = ({ images = [], productName = '' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const imageRef = useRef(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === 'Escape') {
          setIsFullscreen(false);
          setIsZoomed(false);
        } else if (e.key === 'ArrowLeft') {
          handlePrevious();
        } else if (e.key === 'ArrowRight') {
          handleNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentImageIndex]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Icon name="Image" size={48} className="mx-auto mb-2 text-text-secondary" />
          <p className="text-text-secondary">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Image Container */}
      <div className="relative bg-surface rounded-lg overflow-hidden">
        <div
          className="relative aspect-square cursor-pointer"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={toggleFullscreen}
        >
          <Image
            ref={imageRef}
            src={images[currentImageIndex]}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover marketplace-transition"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                disabled={currentImageIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-surface marketplace-transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronLeft" size={20} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                disabled={currentImageIndex === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-surface marketplace-transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronRight" size={20} />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-surface/80 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-sm font-medium text-foreground">
              {currentImageIndex + 1} / {images.length}
            </span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="absolute top-2 right-2 w-10 h-10 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-surface marketplace-transition"
          >
            <Icon name="Maximize2" size={16} />
          </button>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="p-4">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 marketplace-transition ${
                    index === currentImageIndex
                      ? 'border-primary' :'border-border hover:border-primary/50'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-1050 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 w-12 h-12 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-surface marketplace-transition z-10"
            >
              <Icon name="X" size={20} />
            </button>

            {/* Zoom Button */}
            <button
              onClick={toggleZoom}
              className="absolute top-4 right-20 w-12 h-12 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-surface marketplace-transition z-10"
            >
              <Icon name={isZoomed ? "ZoomOut" : "ZoomIn"} size={20} />
            </button>

            {/* Main Image */}
            <div className="relative max-w-full max-h-full">
              <Image
                src={images[currentImageIndex]}
                alt={`${productName} - Fullscreen`}
                className={`max-w-full max-h-full object-contain marketplace-transition ${
                  isZoomed ? 'scale-150 cursor-move' : 'cursor-zoom-in'
                }`}
                onClick={toggleZoom}
              />
            </div>

            {/* Navigation in Fullscreen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-surface marketplace-transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="ChevronLeft" size={24} />
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={currentImageIndex === images.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:bg-surface marketplace-transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="ChevronRight" size={24} />
                </button>
              </>
            )}

            {/* Image Counter in Fullscreen */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-sm font-medium text-foreground">
                {currentImageIndex + 1} of {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;