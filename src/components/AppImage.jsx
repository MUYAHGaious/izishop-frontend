import React, { useState, useEffect, useRef } from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  fallback = null,
  retryCount = 3,
  retryDelay = 1000,
  cacheBypass = false,
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [attempts, setAttempts] = useState(0);
  const retryTimeoutRef = useRef(null);
  const imgRef = useRef(null);

  // Enhanced logging with more context
  useEffect(() => {
    console.log('🖼️ AppImage mounted:', {
      src,
      alt,
      className,
      hasError,
      isLoading,
      attempts,
      currentSrc
    });

    // Reset state when src changes
    if (src !== currentSrc) {
      console.log('🔄 Image src changed, resetting state');
      setHasError(false);
      setIsLoading(true);
      setAttempts(0);
      setCurrentSrc(src);

      // Clear any pending retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    }
  }, [src, currentSrc, hasError, isLoading, attempts, alt, className]);

  // Advanced error handling with retry logic
  const handleError = (e) => {
    const errorDetails = {
      src: currentSrc,
      naturalWidth: e.target?.naturalWidth || 0,
      naturalHeight: e.target?.naturalHeight || 0,
      complete: e.target?.complete || false,
      attempt: attempts + 1,
      errorType: e.type,
      timestamp: new Date().toISOString()
    };

    console.log('🚨 Image error detected:', errorDetails);

    // Check if we should retry
    if (attempts < retryCount && currentSrc && !hasError) {
      setAttempts(prev => prev + 1);
      setIsLoading(true);

      console.log(`🔄 Retrying image load (attempt ${attempts + 1}/${retryCount}) in ${retryDelay}ms`);

      retryTimeoutRef.current = setTimeout(() => {
        // Force reload with cache bypass if enabled
        const newSrc = cacheBypass ?
          `${currentSrc}${currentSrc.includes('?') ? '&' : '?'}_t=${Date.now()}` :
          currentSrc;

        console.log('🔄 Attempting reload with src:', newSrc);

        if (imgRef.current) {
          imgRef.current.src = newSrc;
        }
      }, retryDelay);

      return; // Don't set error state yet
    }

    // All retries exhausted or immediate error
    console.log('❌ Image load failed permanently:', errorDetails);
    setHasError(true);
    setIsLoading(false);

    // Call parent's onError handler if provided
    if (props.onError) {
      props.onError(errorDetails);
    }
  };

  const handleLoad = (e) => {
    const loadDetails = {
      src: currentSrc,
      naturalWidth: e.target?.naturalWidth || 0,
      naturalHeight: e.target?.naturalHeight || 0,
      attempts: attempts + 1,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Image loaded successfully:', loadDetails);
    setIsLoading(false);
    setHasError(false);

    if (props.onLoad) {
      props.onLoad(loadDetails);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // If there's an error and a fallback is provided, show the fallback
  if (hasError && fallback) {
    return fallback;
  }

  // If there's an error but no fallback, show enhanced error placeholder
  if (hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-300 rounded`}>
        <div className="text-gray-400 text-center p-2">
          <div className="w-8 h-8 mx-auto mb-2 opacity-40">
            📷
          </div>
          <div className="text-xs opacity-60 font-medium">Image Unavailable</div>
          <div className="text-xs opacity-40 mt-1">
            Failed after {attempts} attempts
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center`}>
        <div className="text-gray-400 text-center">
          <div className="animate-spin w-6 h-6 mx-auto mb-2">
            ⟳
          </div>
          <div className="text-xs opacity-60">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      // CORS and cache control headers
      crossOrigin="anonymous"
      {...props}
    />
  );
}

export default Image;
