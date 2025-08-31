import React from 'react';
import { ProductGrid } from './index';
import { useWishlist } from '../../contexts/WishlistContext';

const WishlistDemo = () => {
  const { wishlistItems, getWishlistCount } = useWishlist();

  // Sample products for testing
  const sampleProducts = [
    {
      id: '1',
      name: 'Samsung Galaxy S24',
      price: 450000,
      image_urls: ['/assets/images/no_image.png'],
      rating: 4.5,
      reviewCount: 128,
      stock: 15,
      shopName: 'TechHub Store',
      shopId: 'shop1',
      isNew: true,
      discount: 10,
      description: 'Latest Samsung flagship with AI features'
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      price: 650000,
      image_urls: ['/assets/images/no_image.png'],
      rating: 4.8,
      reviewCount: 256,
      stock: 8,
      shopName: 'Apple Store',
      shopId: 'shop2',
      isNew: true,
      discount: 0,
      description: 'Premium iPhone with titanium design'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Wishlist Demo</h1>
        <p className="text-lg text-text-secondary mb-6">
          Test the wishlist functionality by clicking the heart icons on products
        </p>
        
        <div className="bg-card p-4 rounded-lg border mb-6">
          <h2 className="text-xl font-semibold mb-2">Wishlist Status</h2>
          <p className="text-text-secondary">
            Items in wishlist: <span className="font-bold text-primary">{getWishlistCount()}</span>
          </p>
          {wishlistItems.length > 0 && (
            <div className="mt-2 text-sm text-text-secondary">
              <p>Wishlist items:</p>
              <ul className="list-disc list-inside mt-1">
                {wishlistItems.map(item => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Sample Products</h2>
        <p className="text-text-secondary mb-4">
          Click the heart icon on any product to add/remove it from your wishlist
        </p>
        <ProductGrid 
          products={sampleProducts}
          columns={2}
          gap={6}
          showWishlist={true}
          showBadges={true}
          showQuickActions={true}
        />
      </div>

      <div className="text-center">
        <a 
          href="/wishlist" 
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          View Full Wishlist
        </a>
      </div>
    </div>
  );
};

export default WishlistDemo;
