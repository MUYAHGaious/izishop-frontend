import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Tag Component for displaying product tags
 * Supports different variants and sizes
 */
const Tag = ({ 
  tag, 
  variant = 'default',
  size = 'default',
  className = '',
  onClick,
  removable = false,
  onRemove,
  ...props 
}) => {
  if (!tag) return null;

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200';
  
  const variants = {
    default: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
    success: 'bg-success/10 text-success border border-success/20 hover:bg-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20',
    danger: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20',
    info: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-sm',
    default: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-5 py-2.5 text-lg'
  };

  const tagClasses = cn(
    baseClasses,
    variants[variant] || variants.default,
    sizes[size] || sizes.default,
    onClick && 'cursor-pointer',
    className
  );

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick(tag);
    }
  };

  const handleRemove = (e) => {
    if (onRemove && removable) {
      e.preventDefault();
      e.stopPropagation();
      onRemove(tag);
    }
  };

  return (
    <span
      className={tagClasses}
      onClick={handleClick}
      {...props}
    >
      {tag.label}
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-2 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-current hover:bg-current hover:bg-opacity-20 transition-colors"
          aria-label={`Remove ${tag.label} tag`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

/**
 * TagList Component for displaying multiple tags
 */
export const TagList = ({ 
  tags = [], 
  variant = 'default',
  size = 'default',
  className = '',
  maxTags,
  showCount = false,
  onTagClick,
  removable = false,
  onTagRemove,
  ...props 
}) => {
  if (!tags || tags.length === 0) return null;

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const hiddenCount = maxTags ? tags.length - maxTags : 0;

  return (
    <div className={cn('flex flex-wrap gap-2', className)} {...props}>
      {displayTags.map((tag, index) => (
        <Tag
          key={`${tag.id}-${index}`}
          tag={tag}
          variant={variant}
          size={size}
          onClick={onTagClick}
          removable={removable}
          onRemove={onTagRemove}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="text-xs text-text-secondary px-2 py-1">
          +{hiddenCount} more
        </span>
      )}
      {showCount && tags.length > 0 && (
        <span className="text-xs text-text-secondary px-2 py-1">
          {tags.length} tag{tags.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default Tag;
