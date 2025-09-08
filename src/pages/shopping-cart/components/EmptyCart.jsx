import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ProductRecommendations from './ProductRecommendations';

const EmptyCart = ({ className = "" }) => {

  return (
    <div className={`${className}`}>
      {/* Empty State */}
      <div className="text-center py-12">
        <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
          <Icon name="ShoppingCart" size={64} className="text-text-secondary" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Your cart is empty
        </h2>
        
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/product-catalog">
            <Button variant="default" size="lg" iconName="Search" iconPosition="left" className="bg-teal-500 hover:bg-teal-600 text-white">
              Browse Products
            </Button>
          </Link>
          
          <Link to="/landing-page">
            <Button variant="outline" size="lg" iconName="Home" iconPosition="left" className="border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-500 transition-all duration-300">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Real Product Recommendations */}
      <div className="mt-12">
        <ProductRecommendations
          type="empty"
          limit={4}
        />
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-card border border-border rounded-lg">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Shield" size={24} className="text-primary" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Secure Shopping</h4>
          <p className="text-sm text-text-secondary">
            Your payments and personal information are always protected
          </p>
        </div>

        <div className="text-center p-6 bg-card border border-border rounded-lg">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Truck" size={24} className="text-success" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Fast Delivery</h4>
          <p className="text-sm text-text-secondary">
            Quick and reliable delivery to your doorstep across Cameroon
          </p>
        </div>

        <div className="text-center p-6 bg-card border border-border rounded-lg">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="RotateCcw" size={24} className="text-accent" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Easy Returns</h4>
          <p className="text-sm text-text-secondary">
            Not satisfied? Return your items within 30 days for a full refund
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;