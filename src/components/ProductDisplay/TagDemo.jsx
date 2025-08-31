import React, { useState } from 'react';
import { getProductTags, getAllUniqueTags, filterProductsByTag } from '../../utils/productTags';
import TagList from '../ui/Tag';
import Button from '../ui/Button';

/**
 * Simple Tag Demo Component
 * Shows how the tagging system works
 */
const TagDemo = () => {
  const [selectedTag, setSelectedTag] = useState(null);

  // Sample products for demonstration
  const sampleProducts = [
    {
      id: '1',
      name: 'Samsung Galaxy S24 Ultra',
      price: 450000,
      stock: 5,
      salesCount: 150,
      dateAdded: new Date().toISOString(),
      description: 'Latest Samsung flagship with AI features'
    },
    {
      id: '2',
      name: 'iPhone 15 Pro Max',
      price: 650000,
      stock: 0,
      salesCount: 280,
      dateAdded: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Premium iPhone with titanium design'
    },
    {
      id: '3',
      name: 'MacBook Pro M3',
      price: 1200000,
      stock: 15,
      salesCount: 75,
      dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Powerful laptop for professionals'
    }
  ];

  const availableTags = getAllUniqueTags(sampleProducts);
  const filteredProducts = selectedTag 
    ? filterProductsByTag(sampleProducts, selectedTag.id)
    : sampleProducts;

  const handleTagClick = (tag) => {
    setSelectedTag(selectedTag?.id === tag.id ? null : tag);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Product Tagging System Demo</h1>
        <p className="text-text-secondary">
          Click on tags to filter products. Each product gets tags based on its data.
        </p>
      </div>

      {/* Tag Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedTag?.id === tag.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            {tag.label} ({filterProductsByTag(sampleProducts, tag.id).length})
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-text-secondary mb-3">{product.description}</p>
            
            {/* Product Tags */}
            <div className="mb-3">
              <TagList
                tags={getProductTags(product)}
                size="xs"
                maxTags={3}
                className="flex-col gap-1"
              />
            </div>
            
            <div className="text-sm text-text-secondary">
              <div>Stock: {product.stock}</div>
              <div>Sales: {product.salesCount}</div>
              <div>Added: {new Date(product.dateAdded).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedTag && (
        <div className="text-center">
          <Button onClick={() => setSelectedTag(null)} variant="outline">
            Clear Filter
          </Button>
        </div>
      )}
    </div>
  );
};

export default TagDemo;
