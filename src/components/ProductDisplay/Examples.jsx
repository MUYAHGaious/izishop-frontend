import React from 'react';
import { ProductCard, ProductGrid, ProductList, ProductCarousel } from './index';

// Example data - replace with your actual product data
const sampleProducts = [
  {
    id: '1',
    name: 'Samsung Galaxy S24',
    price: 450000,
    image_urls: ['/assets/images/samsung-s24.jpg'],
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
    image_urls: ['/assets/images/iphone-15-pro.jpg'],
    rating: 4.8,
    reviewCount: 256,
    stock: 8,
    shopName: 'Apple Store',
    shopId: 'shop2',
    isNew: true,
    discount: 0,
    description: 'Premium iPhone with titanium design'
  },
  {
    id: '3',
    name: 'MacBook Air M2',
    price: 850000,
    image_urls: ['/assets/images/macbook-air-m2.jpg'],
    rating: 4.7,
    reviewCount: 89,
    stock: 5,
    shopName: 'TechHub Store',
    shopId: 'shop1',
    isNew: false,
    discount: 15,
    description: 'Ultra-thin laptop with M2 chip'
  }
];

const ProductDisplayExamples = () => {
  const handleAddToCart = (product) => {
    console.log('Adding to cart:', product.name);
    // Your add to cart logic here
  };

  const handleToggleWishlist = (productId, isWishlisted) => {
    console.log('Toggling wishlist for:', productId, isWishlisted);
    // Your wishlist logic here
  };

  return (
    <div className="space-y-12 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Product Display Examples</h1>
      
      {/* Example 1: Standard Product Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">1. Standard Product Grid (4 columns)</h2>
        <ProductGrid 
          products={sampleProducts}
          columns={4}
          gap={4}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
      </section>

      {/* Example 2: Compact Product Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">2. Compact Product Grid (6 columns)</h2>
        <ProductGrid 
          products={sampleProducts}
          columns={6}
          gap={3}
          variant="compact"
          showRating={false}
          showStock={false}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
      </section>

      {/* Example 3: Horizontal Product List */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">3. Horizontal Product List</h2>
        <ProductList 
          products={sampleProducts}
          variant="horizontal"
          showRating={false}
          showStock={false}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
      </section>

      {/* Example 4: Product Carousel */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">4. Product Carousel with Auto-play</h2>
        <ProductCarousel 
          products={sampleProducts}
          variant="compact"
          autoPlay={true}
          autoPlayInterval={4000}
          showNavigation={true}
          showDots={true}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
      </section>

      {/* Example 5: Individual Product Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">5. Individual Product Card Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Default variant */}
          <div>
            <h3 className="text-lg font-medium mb-3">Default Variant</h3>
            <ProductCard 
              product={sampleProducts[0]}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>

          {/* Compact variant */}
          <div>
            <h3 className="text-lg font-medium mb-3">Compact Variant</h3>
            <ProductCard 
              product={sampleProducts[1]}
              variant="compact"
              showRating={false}
              showStock={false}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>

          {/* Detailed variant */}
          <div>
            <h3 className="text-lg font-medium mb-3">Detailed Variant</h3>
            <ProductCard 
              product={sampleProducts[2]}
              variant="detailed"
              showDescription={true}
              showQuickActions={true}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>
        </div>
      </section>

      {/* Example 6: Customized Display Options */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">6. Customized Display Options</h2>
        <ProductGrid 
          products={sampleProducts}
          columns={3}
          gap={6}
          variant="detailed"
          showWishlist={false}
          showBadges={true}
          showQuickActions={true}
          showDescription={true}
          showShopInfo={false}
          showRating={true}
          showStock={true}
          onAddToCart={handleAddToCart}
          className="custom-product-grid"
        />
      </section>

      {/* Example 7: Responsive Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Responsive Grid (Mobile: 2, Tablet: 3, Desktop: 5)</h2>
        <ProductGrid 
          products={sampleProducts}
          columns={5}
          gap={4}
          variant="default"
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
        />
      </section>
    </div>
  );
};

export default ProductDisplayExamples;
