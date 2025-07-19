# Database Schema Requirements for Shop Profile Feature

## Overview
This document outlines the database schema requirements to support the comprehensive shop profile functionality with customer interactions, product catalog, reviews, and cart operations.

## Required Tables and Schema

### 1. **shops** Table (Enhanced)
```sql
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE, -- For SEO-friendly URLs
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    banner_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_sales DECIMAL(15,2) DEFAULT 0.0,
    response_time_hours INTEGER DEFAULT 24,
    shipping_time_days INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- SEO and marketing fields
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT,
    
    -- Location and delivery
    city VARCHAR(100),
    region VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Business info
    business_license VARCHAR(255),
    tax_id VARCHAR(255),
    opening_hours JSONB, -- Store hours
    delivery_options JSONB -- Delivery methods and costs
);

-- Indexes for performance
CREATE INDEX idx_shops_owner_id ON shops(owner_id);
CREATE INDEX idx_shops_slug ON shops(slug);
CREATE INDEX idx_shops_active ON shops(is_active);
CREATE INDEX idx_shops_location ON shops(city, region);
CREATE INDEX idx_shops_rating ON shops(rating DESC);
```

### 2. **shop_products** Table (New)
```sql
CREATE TABLE shop_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2), -- For discount calculations
    cost_price DECIMAL(10,2), -- For profit calculations
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    max_order_quantity INTEGER,
    weight DECIMAL(8,2), -- For shipping calculations
    dimensions JSONB, -- {length, width, height}
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_digital BOOLEAN DEFAULT false,
    requires_shipping BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- SEO fields
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT,
    
    -- Product attributes (JSON for flexibility)
    attributes JSONB, -- Color, size, material, etc.
    variants JSONB, -- Product variations
    specifications JSONB -- Technical specs
);

-- Indexes
CREATE INDEX idx_shop_products_shop_id ON shop_products(shop_id);
CREATE INDEX idx_shop_products_category ON shop_products(category);
CREATE INDEX idx_shop_products_active ON shop_products(is_active);
CREATE INDEX idx_shop_products_stock ON shop_products(stock_quantity);
CREATE INDEX idx_shop_products_price ON shop_products(price);
CREATE INDEX idx_shop_products_rating ON shop_products(rating DESC);
CREATE INDEX idx_shop_products_sales ON shop_products(sales_count DESC);
```

### 3. **product_images** Table (New)
```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(is_primary);
```

### 4. **shop_reviews** Table (New)
```sql
CREATE TABLE shop_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false, -- Verified purchase
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(shop_id, customer_id, order_id) -- One review per order per customer
);

-- Indexes
CREATE INDEX idx_shop_reviews_shop_id ON shop_reviews(shop_id);
CREATE INDEX idx_shop_reviews_customer_id ON shop_reviews(customer_id);
CREATE INDEX idx_shop_reviews_rating ON shop_reviews(rating DESC);
CREATE INDEX idx_shop_reviews_created ON shop_reviews(created_at DESC);
```

### 5. **product_reviews** Table (New)
```sql
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    pros TEXT,
    cons TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    images JSONB, -- Array of review image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, customer_id, order_item_id)
);

-- Indexes
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating DESC);
```

### 6. **shop_followers** Table (New)
```sql
CREATE TABLE shop_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(shop_id, customer_id)
);

-- Indexes
CREATE INDEX idx_shop_followers_shop_id ON shop_followers(shop_id);
CREATE INDEX idx_shop_followers_customer_id ON shop_followers(customer_id);
```

### 7. **shopping_cart** Table (Enhanced)
```sql
CREATE TABLE shopping_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_attributes JSONB, -- Selected variant/attributes
    price_snapshot DECIMAL(10,2), -- Price when added to cart
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(customer_id, product_id, selected_attributes)
);

-- Indexes
CREATE INDEX idx_shopping_cart_customer_id ON shopping_cart(customer_id);
CREATE INDEX idx_shopping_cart_product_id ON shopping_cart(product_id);
```

### 8. **wishlists** Table (New)
```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(customer_id, product_id)
);

-- Indexes
CREATE INDEX idx_wishlists_customer_id ON wishlists(customer_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);
```

### 9. **orders** Table (Enhanced)
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable order number
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_id VARCHAR(255), -- External payment reference
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Shipping info
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT
);

-- Indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
```

### 10. **order_items** Table (Enhanced)
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL, -- Snapshot for history
    product_sku VARCHAR(100),
    selected_attributes JSONB,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

## Required API Endpoints

### Shop Endpoints
- `GET /api/shops/` - List all shops with filtering and pagination
- `GET /api/shops/featured` - Get featured shops
- `GET /api/shops/{shop_id}` - Get shop details
- `GET /api/shops/{shop_id}/products` - Get shop products
- `GET /api/shops/{shop_id}/reviews` - Get shop reviews
- `POST /api/shops/{shop_id}/follow` - Follow a shop
- `DELETE /api/shops/{shop_id}/unfollow` - Unfollow a shop
- `POST /api/shops/{shop_id}/reviews` - Add shop review

### Product Endpoints
- `GET /api/products/{product_id}` - Get product details
- `POST /api/products/{product_id}/reviews` - Add product review
- `GET /api/products/{product_id}/reviews` - Get product reviews

### Cart & Wishlist Endpoints
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/{item_id}` - Update cart item
- `DELETE /api/cart/{item_id}` - Remove from cart
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/{product_id}` - Remove from wishlist

### Order Endpoints
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/{order_id}` - Get order details

## Database Migrations Required

1. **Migration 001: Create base shop tables**
   - Create `shops` table with enhanced fields
   - Create `shop_followers` table
   - Add indexes

2. **Migration 002: Create product tables**
   - Create `shop_products` table
   - Create `product_images` table
   - Add indexes

3. **Migration 003: Create review tables**
   - Create `shop_reviews` table
   - Create `product_reviews` table
   - Add indexes

4. **Migration 004: Enhance cart and orders**
   - Enhance `shopping_cart` table
   - Create `wishlists` table
   - Enhance `orders` and `order_items` tables

5. **Migration 005: Add triggers for rating calculations**
   - Create triggers to update shop/product ratings when reviews are added
   - Create triggers to update stock quantities when orders are placed

## Performance Considerations

1. **Indexing Strategy**
   - Composite indexes for common query patterns
   - Partial indexes for filtered queries
   - Text search indexes for product search

2. **Caching Strategy**
   - Cache shop data with 15-minute TTL
   - Cache product data with 10-minute TTL
   - Cache reviews with 5-minute TTL
   - Cache featured shops with 1-hour TTL

3. **Database Optimization**
   - Use JSONB for flexible attributes
   - Implement proper foreign key constraints
   - Add database-level validation where appropriate
   - Use UUIDs for distributed system compatibility

This schema supports all the shop profile features including product catalog, reviews, cart operations, order management, and customer interactions while maintaining performance and scalability.