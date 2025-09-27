import React, { useState, useEffect } from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  fallback = null,
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    console.log('🖼️ Image component mounted with src:', src);
  }, [src]);

  const handleError = () => {
    console.log('🚨 Image error for src:', imgSrc);
    if (!hasError) {
      setHasError(true);
      console.log('🚨 Setting hasError to true for:', imgSrc);
      // Call parent's onError handler if provided
      if (props.onError) {
        props.onError();
      }
    }
  };

  const handleLoad = () => {
    console.log('✅ Image loaded successfully:', imgSrc);
    if (props.onLoad) {
      props.onLoad();
    }
  };

  // If there's an error and a fallback is provided, show the fallback
  if (hasError && fallback) {
    return fallback;
  }

  // If there's an error but no fallback, show default no-image placeholder
  if (hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}>
        <div className="text-gray-400 text-center">
          <div className="w-8 h-8 mx-auto mb-1 opacity-40">
            📷
          </div>
          <div className="text-xs opacity-60">No Image</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}

export default Image;
