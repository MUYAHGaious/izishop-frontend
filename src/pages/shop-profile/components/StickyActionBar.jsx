import React from 'react';

import Button from '../../../components/ui/Button';

const StickyActionBar = ({ onContactShop, onViewAllProducts, onFollowToggle, isFollowing }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-between p-4 space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onContactShop}
          iconName="MessageCircle"
          iconPosition="left"
          iconSize={16}
          className="flex-1"
        >
          Contact
        </Button>
        
        <Button
          variant={isFollowing ? "outline" : "secondary"}
          size="sm"
          onClick={onFollowToggle}
          iconName={isFollowing ? "UserMinus" : "UserPlus"}
          iconPosition="left"
          iconSize={16}
          className="flex-1"
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={onViewAllProducts}
          iconName="Package"
          iconPosition="left"
          iconSize={16}
          className="flex-1"
        >
          Products
        </Button>
      </div>
    </div>
  );
};

export default StickyActionBar;