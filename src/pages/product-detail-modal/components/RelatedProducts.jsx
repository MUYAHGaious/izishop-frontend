import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const RelatedProducts = ({ products }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={12}
        className={index < Math.floor(rating) ? 'text-accent fill-current' : 'text-border'}
      />
    ));
  };

  return (
    <div className="space-y-4 py-6 border-t border-border">
      <h3 className="text-lg font-semibold text-text-primary">You May Also Like</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            to="/product-detail-modal"
            className="group bg-surface border border-border rounded-lg overflow-hidden hover:shadow-moderate transition-all duration-200"
          >
            <div className="aspect-square overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            
            <div className="p-3 space-y-2">
              <h4 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h4>
              
              <div className="flex items-center space-x-1">
                {renderStars(product.rating)}
                <span className="text-xs text-text-secondary">
                  ({product.reviewCount})
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-primary">
                    {formatPrice(product.price)}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-xs text-text-secondary line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                </div>
                
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-xs bg-destructive/10 text-destructive px-1 py-0.5 rounded">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{product.soldCount} sold</span>
                <div className="flex items-center space-x-1">
                  <Icon name="MapPin" size={10} />
                  <span>{product.location}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;