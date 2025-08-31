import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FeaturedShops = ({ shops, onVisitShop, onFollowShop }) => {
  if (!shops?.length) return null;

  return (
    <div className="bg-surface border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Featured Shops</h2>
          <Button variant="ghost" iconName="ArrowRight" iconPosition="right">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-elevated transition-all duration-150 group"
            >
              {/* Shop Banner */}
              <div className="relative h-24 bg-gradient-to-r from-primary/20 to-secondary/20">
                <img
                  src={shop.banner}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                
                {/* Premium Badge */}
                {shop.isPremium && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  </div>
                )}

                {/* Shop Logo */}
                <div className="absolute -bottom-4 left-4">
                  <div className="w-8 h-8 bg-surface border-2 border-background rounded-lg overflow-hidden">
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Shop Info */}
              <div className="p-4 pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                      {shop.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Icon name="Star" size={12} className="text-accent" />
                        <span className="text-sm font-medium text-text-primary">
                          {shop.rating}
                        </span>
                      </div>
                      {shop.isVerified && (
                        <Icon name="CheckCircle" size={12} className="text-success" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {shop.productCount} products
                  </span>
                  
                  <Button
                    onClick={() => onVisitShop(shop.id)}
                    variant="outline"
                    size="sm"
                  >
                    Visit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedShops;