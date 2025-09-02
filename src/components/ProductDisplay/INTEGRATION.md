# Integration Guide: Replacing Existing Product Displays

This guide shows you how to replace your existing product display code with the new reusable components.

## Before (Old Way)

```jsx
// Old way - hardcoded product display
<div className="grid grid-cols-4 gap-4">
  {products.map((product) => (
    <div key={product.id} className="bg-card rounded-lg border p-4">
      <img src={product.image || '/default.jpg'} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  ))}
</div>
```

## After (New Way)

```jsx
// New way - using reusable components
import { ProductGrid } from '../../components/ProductDisplay';

<ProductGrid 
  products={products}
  columns={4}
  gap={4}
  onAddToCart={addToCart}
  onToggleWishlist={toggleWishlist}
/>
```

## Common Replacement Patterns

### 1. Product Catalog Page
**Replace:** Custom product grid with hardcoded styling
**With:** `<ProductGrid>` component

```jsx
// OLD
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// NEW
import { ProductGrid } from '../../components/ProductDisplay';

<ProductGrid 
  products={products}
  columns={4}
  gap={4}
  onAddToCart={handleAddToCart}
  onToggleWishlist={handleToggleWishlist}
/>
```

### 2. Shopping Cart Items
**Replace:** Custom cart item layout
**With:** `<ProductList>` component with horizontal variant

```jsx
// OLD
<div className="space-y-4">
  {cartItems.map(item => (
    <div key={item.id} className="flex gap-4 p-4 border rounded">
      <img src={item.image} className="w-20 h-20 object-cover" />
      <div className="flex-1">
        <h3>{item.name}</h3>
        <p>{item.price}</p>
      </div>
    </div>
  ))}
</div>

// NEW
import { ProductList } from '../../components/ProductDisplay';

<ProductList 
  products={cartItems}
  variant="horizontal"
  showRating={false}
  showStock={false}
  onAddToCart={handleAddToCart}
/>
```

### 3. Featured Products Section
**Replace:** Static product grid
**With:** `<ProductCarousel>` component

```jsx
// OLD
<div className="grid grid-cols-4 gap-4">
  {featuredProducts.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// NEW
import { ProductCarousel } from '../../components/ProductDisplay';

<ProductCarousel 
  products={featuredProducts}
  variant="compact"
  autoPlay={true}
  showNavigation={true}
  onAddToCart={handleAddToCart}
/>
```

### 4. Search Results
**Replace:** Custom search results layout
**With:** `<ProductGrid>` with compact variant

```jsx
// OLD
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
  {searchResults.map(product => (
    <div key={product.id} className="bg-white rounded shadow p-2">
      <img src={product.image} className="w-full h-32 object-cover" />
      <h4 className="text-sm font-medium">{product.name}</h4>
      <p className="text-sm">{product.price}</p>
    </div>
  ))}
</div>

// NEW
import { ProductGrid } from '../../components/ProductDisplay';

<ProductGrid 
  products={searchResults}
  columns={4}
  gap={3}
  variant="compact"
  showRating={false}
  showStock={false}
  onAddToCart={handleAddToCart}
/>
```

### 5. Related Products
**Replace:** Static related products section
**With:** `<ProductGrid>` with detailed variant

```jsx
// OLD
<div className="grid grid-cols-3 gap-6">
  {relatedProducts.map(product => (
    <div key={product.id} className="bg-card rounded-lg border p-4">
      <img src={product.image} className="w-full h-48 object-cover rounded" />
      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
      <p className="text-xl font-bold mt-2">{product.price}</p>
    </div>
  ))}
</div>

// NEW
import { ProductGrid } from '../../components/ProductDisplay';

<ProductGrid 
  products={relatedProducts}
  columns={3}
  gap={6}
  variant="detailed"
  showDescription={true}
  showQuickActions={true}
  onAddToCart={handleAddToCart}
/>
```

## Migration Steps

1. **Import the components** you need
2. **Replace the JSX structure** with the component
3. **Pass your data** through the `products` prop
4. **Configure display options** using the available props
5. **Test the responsive behavior** on different screen sizes

## Benefits of Migration

- ✅ **Consistent styling** across all product displays
- ✅ **Responsive design** that works on all devices
- ✅ **Easy maintenance** - update one component, update everywhere
- ✅ **Built-in features** like wishlist, badges, quick actions
- ✅ **Professional appearance** with smooth animations
- ✅ **Accessibility** built-in with proper ARIA labels

## Testing Your Integration

After replacing your existing code:

1. **Check responsive behavior** on mobile, tablet, and desktop
2. **Verify all interactions** work (add to cart, wishlist, etc.)
3. **Test with different data** (empty products, single product, many products)
4. **Ensure styling consistency** with your design system
5. **Verify accessibility** with screen readers if possible

## Need Help?

If you encounter issues during integration:
1. Check the component props in the README.md
2. Look at the Examples.jsx file for working examples
3. Ensure your product data structure matches the expected format
4. Verify all required dependencies are imported correctly
