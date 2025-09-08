/**
 * Simple Product Recommendation Service
 * 
 * Implements content-based and collaborative filtering recommendations
 * without requiring external libraries - uses simple JavaScript algorithms
 */

import api from './api';

class RecommendationService {
  constructor() {
    this.cachedProducts = null;
    this.cachedCategories = null;
    this.viewHistory = this.loadViewHistory();
    this.purchaseHistory = this.loadPurchaseHistory();
  }

  // Load user's browsing/view history
  loadViewHistory() {
    try {
      const history = localStorage.getItem('productViewHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading view history:', error);
      return [];
    }
  }

  // Save product view to history
  saveProductView(productId, category = null) {
    try {
      const viewHistory = this.loadViewHistory();
      const timestamp = Date.now();
      
      // Remove existing view of same product
      const filteredHistory = viewHistory.filter(view => view.productId !== productId);
      
      // Add new view at the beginning
      filteredHistory.unshift({
        productId,
        category,
        timestamp,
        viewCount: (viewHistory.find(v => v.productId === productId)?.viewCount || 0) + 1
      });
      
      // Keep only last 50 views
      const recentHistory = filteredHistory.slice(0, 50);
      
      localStorage.setItem('productViewHistory', JSON.stringify(recentHistory));
      this.viewHistory = recentHistory;
    } catch (error) {
      console.error('Error saving product view:', error);
    }
  }

  // Load purchase history (cart additions as proxy for purchases)
  loadPurchaseHistory() {
    try {
      const history = localStorage.getItem('purchaseHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading purchase history:', error);
      return [];
    }
  }

  // Get all products (cached) - now uses lightweight format
  async getAllProducts() {
    if (!this.cachedProducts) {
      try {
        const response = await api.getAllProducts(0, 50, false); // Use full API for proper images
        // Transform lightweight response to expected format
        this.cachedProducts = Array.isArray(response) ? response.map(product => ({
          ...product,
          // Ensure compatibility with existing code
          image_urls: product.image_url ? [product.image_url] : [],
          price: parseFloat(product.price) || 0
        })) : [];
      } catch (error) {
        console.error('Error fetching products for recommendations:', error);
        this.cachedProducts = [];
      }
    }
    return this.cachedProducts;
  }

  // Content-based recommendations: "You might also like"
  async getContentBasedRecommendations(productId, limit = 4) {
    try {
      const products = await this.getAllProducts();
      const targetProduct = products.find(p => p.id === productId);
      
      if (!targetProduct) {
        return this.getPopularProducts(limit);
      }

      // Calculate similarity scores
      const recommendations = products
        .filter(p => p.id !== productId && p.is_active)
        .map(product => ({
          ...product,
          similarity: this.calculateContentSimilarity(targetProduct, product)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Error generating content-based recommendations:', error);
      return [];
    }
  }

  // Calculate content similarity between two products
  calculateContentSimilarity(product1, product2) {
    let similarity = 0;
    
    // Category match (highest weight)
    if (product1.category === product2.category) {
      similarity += 0.5;
    }
    
    // Price similarity (closer prices get higher scores)
    const price1 = parseFloat(product1.price) || 0;
    const price2 = parseFloat(product2.price) || 0;
    const priceDiff = Math.abs(price1 - price2);
    const avgPrice = (price1 + price2) / 2;
    
    if (avgPrice > 0) {
      const priceSimScore = Math.max(0, 1 - (priceDiff / avgPrice));
      similarity += priceSimScore * 0.2;
    }
    
    // Seller similarity
    if (product1.seller_id === product2.seller_id) {
      similarity += 0.15;
    }
    
    // Name similarity (simple word matching)
    const words1 = product1.name.toLowerCase().split(/\s+/);
    const words2 = product2.name.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    const nameSimScore = commonWords.length / Math.max(words1.length, words2.length);
    similarity += nameSimScore * 0.15;
    
    return similarity;
  }

  // Collaborative filtering: "Customers who viewed this also liked"
  async getCollaborativeRecommendations(productIds, limit = 4) {
    try {
      const products = await this.getAllProducts();
      const viewHistory = this.loadViewHistory();
      
      // Get categories of target products
      const targetCategories = new Set();
      products.forEach(p => {
        if (productIds.includes(p.id) && p.category) {
          targetCategories.add(p.category);
        }
      });
      
      // Find products in same categories that have been viewed frequently
      const categoryProducts = products
        .filter(p => !productIds.includes(p.id) && p.is_active)
        .filter(p => targetCategories.has(p.category))
        .map(product => {
          const viewCount = viewHistory.filter(v => v.productId === product.id).length;
          return { ...product, collaborativeScore: viewCount };
        })
        .sort((a, b) => b.collaborativeScore - a.collaborativeScore)
        .slice(0, limit);
      
      return categoryProducts;
    } catch (error) {
      console.error('Error generating collaborative recommendations:', error);
      return [];
    }
  }

  // Get recommendations for cart page: "You might also like"
  async getCartRecommendations(cartItems, limit = 4) {
    try {
      if (!cartItems || cartItems.length === 0) {
        return this.getPopularProducts(limit);
      }

      const cartProductIds = cartItems.map(item => item.productId || item.id);
      const cartCategories = new Set();
      const products = await this.getAllProducts();
      
      // Extract categories from cart items
      cartItems.forEach(item => {
        const product = products.find(p => p.id === (item.productId || item.id));
        if (product && product.category) {
          cartCategories.add(product.category);
        }
      });
      
      // Get content-based recommendations
      const contentRecs = await this.getCollaborativeRecommendations(cartProductIds, Math.ceil(limit / 2));
      
      // Get popular products from same categories
      const categoryRecs = products
        .filter(p => !cartProductIds.includes(p.id) && p.is_active)
        .filter(p => cartCategories.has(p.category))
        .sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)) // Sort by price as popularity proxy
        .slice(0, Math.floor(limit / 2));
      
      // Combine and remove duplicates
      const combined = [...contentRecs, ...categoryRecs];
      const unique = combined.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      
      return unique.slice(0, limit);
    } catch (error) {
      console.error('Error generating cart recommendations:', error);
      return [];
    }
  }

  // Get popular products as fallback
  async getPopularProducts(limit = 4) {
    try {
      const products = await this.getAllProducts();
      
      // Sort by price (using price as popularity proxy)
      // In a real system, you'd use view counts, sales, ratings, etc.
      return products
        .filter(p => p.is_active)
        .sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting popular products:', error);
      return [];
    }
  }

  // Get recommendations for empty cart
  async getEmptyCartRecommendations(limit = 4) {
    try {
      const viewHistory = this.loadViewHistory();
      const products = await this.getAllProducts();
      
      if (viewHistory.length === 0) {
        return this.getPopularProducts(limit);
      }
      
      // Get recently viewed categories
      const recentCategories = new Set();
      viewHistory.slice(0, 10).forEach(view => {
        if (view.category) {
          recentCategories.add(view.category);
        }
      });
      
      // Get products from recently viewed categories
      const categoryProducts = products
        .filter(p => p.is_active && recentCategories.has(p.category))
        .sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
        .slice(0, Math.ceil(limit / 2));
      
      // Fill remaining slots with popular products
      const remainingSlots = limit - categoryProducts.length;
      const popularProducts = await this.getPopularProducts(remainingSlots + 2);
      const filteredPopular = popularProducts
        .filter(p => !categoryProducts.some(cp => cp.id === p.id))
        .slice(0, remainingSlots);
      
      return [...categoryProducts, ...filteredPopular];
    } catch (error) {
      console.error('Error generating empty cart recommendations:', error);
      return this.getPopularProducts(limit);
    }
  }

  // Get "Frequently Bought Together" recommendations
  async getFrequentlyBoughtTogether(cartItems, limit = 3) {
    try {
      if (!cartItems || cartItems.length === 0) {
        return [];
      }

      // For now, return products from same categories as a simple implementation
      // In production, you'd analyze actual purchase patterns
      return this.getCartRecommendations(cartItems, limit);
    } catch (error) {
      console.error('Error generating frequently bought together:', error);
      return [];
    }
  }

  // Clear cache (useful when products are updated)
  clearCache() {
    this.cachedProducts = null;
    this.cachedCategories = null;
  }
}

// Export singleton instance
const recommendationService = new RecommendationService();
export default recommendationService;