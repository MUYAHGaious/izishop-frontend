# Reusable Product Components

This directory contains flexible, reusable components for displaying products anywhere on the site. All components automatically adapt to different display contexts and can be customized through props.

## Components

### 1. ProductCard
The core product display component with multiple variants and customizable features.

**Variants:**
- `default` - Standard product card (default)
- `compact` - Minimal card for search results, sidebars
- `detailed` - Enhanced card for product pages, modals
- `horizontal` - Side-by-side layout for cart items, lists

**Features:**
- Responsive image handling with fallbacks
- Wishlist toggle functionality
- Badge display (New, Discount, Best Seller)
- Quick actions overlay
- Rating display
- Stock status
- Add to cart functionality

### 2. ProductGrid
Displays products in a responsive grid layout.

**Props:**
- `columns` - Number of columns (1-6, responsive)
- `gap` - Spacing between items (2, 3, 4, 6, 8)
- `variant` - ProductCard variant to use

### 3. ProductList
Displays products in a vertical list format.

**Props:**
- `variant` - Usually 'horizontal' for list items
- All ProductCard customization props

### 4. ProductCarousel
Displays products in a carousel/slider with navigation.

**Features:**
- Auto-play functionality
- Navigation arrows
- Dot indicators
- Progress bar
- Responsive grid within carousel

## Usage Examples

### Basic Product Grid
```jsx
import { ProductGrid } from '../../components/ProductDisplay';

<ProductGrid 
  products={products}
  columns={4}
  gap={4}
  onAddToCart={handleAddToCart}
  onToggleWishlist={handleToggleWishlist}
/>
```

### Compact Product List
```jsx
import { ProductList } from '../../components/ProductDisplay';

<ProductList 
  products={products}
  variant="horizontal"
  showRating={false}
  showStock={false}
  onAddToCart={handleAddToCart}
/>
```

### Featured Products Carousel
```jsx
import { ProductCarousel } from '../../components/ProductDisplay';

<ProductCarousel 
  products={featuredProducts}
  variant="compact"
  autoPlay={true}
  autoPlayInterval={4000}
  showNavigation={true}
  showDots={true}
/>
```

### Custom Product Card
```jsx
import { ProductCard } from '../../components/ProductDisplay';

<ProductCard 
  product={product}
  variant="detailed"
  showDescription={true}
  showQuickActions={true}
  showWishlist={false}
  className="custom-styling"
/>
```

## Customization Props

All components support these customization options:

### Display Controls
- `showWishlist` - Show/hide wishlist button
- `showBadges` - Show/hide product badges
- `showQuickActions` - Show/hide quick actions overlay
- `showDescription` - Show/hide product description
- `showShopInfo` - Show/hide shop name
- `showRating` - Show/hide rating and reviews
- `showStock` - Show/hide stock status

### Layout Variants
- `variant` - Changes the visual style and layout
- `columns` - Grid layout (ProductGrid only)
- `gap` - Spacing between items (ProductGrid only)

### Functionality
- `onAddToCart` - Add to cart callback
- `onToggleWishlist` - Wishlist toggle callback

### Styling
- `className` - Additional CSS classes
- All standard HTML div props

## Responsive Behavior

- **Mobile**: Automatically adjusts to 2 columns
- **Tablet**: 3 columns on medium screens
- **Desktop**: 4+ columns on large screens
- **Images**: Maintain aspect ratio across all screen sizes
- **Text**: Responsive typography with proper line clamping

## Best Practices

1. **Use appropriate variants** for different contexts
2. **Customize display options** based on the page purpose
3. **Maintain consistent spacing** with the gap prop
4. **Handle empty states** - components show helpful messages
5. **Optimize images** - components handle fallbacks gracefully

## Integration

These components are designed to work with your existing:
- Cart context
- Wishlist functionality
- Product data structure
- Routing system
- Styling system (Tailwind CSS)

## Data Structure

Components expect products with this structure:
```javascript
{
  id: string,
  name: string,
  price: number,
  image_urls: string[],
  rating: number,
  reviewCount: number,
  stock: number,
  shopName: string,
  shopId: string,
  isNew: boolean,
  discount: number,
  description: string
}
```
