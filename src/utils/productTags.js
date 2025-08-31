/**
 * Product Tagging System
 * Dynamically assigns tags to products based on various criteria
 */

// Tag configuration object for easy management and future expansion
export const TAG_CONFIG = {
  NEW: {
    id: 'new',
    label: 'New',
    className: 'tag-new',
    priority: 1, // Higher priority tags appear first
    condition: (product) => {
      if (!product.dateAdded) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(product.dateAdded) > thirtyDaysAgo;
    }
  },
  BEST_SELLER: {
    id: 'best-seller',
    label: 'Best Seller',
    className: 'tag-best-seller',
    priority: 2,
    condition: (product) => product.salesCount > 100
  },
  LOW_STOCK: {
    id: 'low-stock',
    label: 'Low Stock',
    className: 'tag-low-stock',
    priority: 3,
    condition: (product) => product.stock < 10
  },
  OUT_OF_STOCK: {
    id: 'out-of-stock',
    label: 'Out of Stock',
    className: 'tag-out-of-stock',
    priority: 4,
    condition: (product) => product.stock === 0
  },
  HIGH_DEMAND: {
    id: 'high-demand',
    label: 'High Demand',
    className: 'tag-high-demand',
    priority: 5,
    condition: (product) => product.salesCount > 50 && product.stock < 20
  },
  TRENDING: {
    id: 'trending',
    label: 'Trending',
    className: 'tag-trending',
    priority: 6,
    condition: (product) => {
      // Trending if sales increased significantly in last 7 days
      // This is a placeholder - you can implement actual trending logic
      return product.salesCount > 200;
    }
  }
};

/**
 * Get applicable tags for a product
 * @param {Object} product - Product object
 * @returns {Array} Array of tag objects sorted by priority
 */
export const getProductTags = (product) => {
  if (!product) return [];

  const applicableTags = Object.values(TAG_CONFIG)
    .filter(tag => tag.condition(product))
    .sort((a, b) => a.priority - b.priority);

  return applicableTags;
};

/**
 * Get tags by specific criteria
 * @param {Object} product - Product object
 * @param {Array} tagIds - Array of tag IDs to check
 * @returns {Array} Array of matching tag objects
 */
export const getTagsByIds = (product, tagIds) => {
  const allTags = getProductTags(product);
  return allTags.filter(tag => tagIds.includes(tag.id));
};

/**
 * Check if product has a specific tag
 * @param {Object} product - Product object
 * @param {string} tagId - Tag ID to check
 * @returns {boolean} True if product has the tag
 */
export const hasTag = (product, tagId) => {
  return getProductTags(product).some(tag => tag.id === tagId);
};

/**
 * Get tag count for a product
 * @param {Object} product - Product object
 * @returns {number} Number of applicable tags
 */
export const getTagCount = (product) => {
  return getProductTags(product).length;
};

/**
 * Get primary tag (highest priority) for a product
 * @param {Object} product - Product object
 * @returns {Object|null} Primary tag object or null
 */
export const getPrimaryTag = (product) => {
  const tags = getProductTags(product);
  return tags.length > 0 ? tags[0] : null;
};

/**
 * Filter products by tag
 * @param {Array} products - Array of products
 * @param {string} tagId - Tag ID to filter by
 * @returns {Array} Filtered products
 */
export const filterProductsByTag = (products, tagId) => {
  return products.filter(product => hasTag(product, tagId));
};

/**
 * Get all unique tags from a product list
 * @param {Array} products - Array of products
 * @returns {Array} Array of unique tag objects
 */
export const getAllUniqueTags = (products) => {
  const allTags = new Map();
  
  products.forEach(product => {
    const productTags = getProductTags(product);
    productTags.forEach(tag => {
      if (!allTags.has(tag.id)) {
        allTags.set(tag.id, tag);
      }
    });
  });
  
  return Array.from(allTags.values()).sort((a, b) => a.priority - b.priority);
};
