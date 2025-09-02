# Dynamic Product Tagging System

A comprehensive, scalable tagging system for React applications that automatically assigns tags to products based on their data.

## 🚀 Features

- **Automatic Tag Assignment**: Tags are dynamically assigned based on product criteria
- **Scalable Architecture**: Easy to add new tags and modify existing logic
- **Priority System**: Tags are displayed in order of importance
- **Interactive Components**: Clickable tags with filtering capabilities
- **Responsive Design**: Works on all device sizes
- **Type Safety**: Built with modern JavaScript practices

## 📋 Tag Types

### Current Tags

| Tag | Condition | Priority | Description |
|-----|-----------|----------|-------------|
| **New** | `dateAdded` < 30 days | 1 | Products added recently |
| **Best Seller** | `salesCount` > 100 | 2 | High-performing products |
| **Low Stock** | `stock` < 10 | 3 | Products running low |
| **Out of Stock** | `stock` === 0 | 4 | Products unavailable |
| **High Demand** | `salesCount` > 50 && `stock` < 20 | 5 | Popular with low inventory |
| **Trending** | `salesCount` > 200 | 6 | Very popular products |

### Adding New Tags

To add a new tag, simply update the `TAG_CONFIG` object in `productTags.js`:

```javascript
export const TAG_CONFIG = {
  // ... existing tags ...
  CUSTOM_TAG: {
    id: 'custom-tag',
    label: 'Custom Tag',
    className: 'tag-custom-tag',
    priority: 7,
    condition: (product) => {
      // Your custom logic here
      return product.someField > someValue;
    }
  }
};
```

## 🛠️ Usage

### Basic Tag Retrieval

```javascript
import { getProductTags } from '../../utils/productTags';

// Get all tags for a product
const tags = getProductTags(product);

// Check if product has a specific tag
const hasNewTag = hasTag(product, 'new');

// Get tag count
const tagCount = getTagCount(product);
```

### Tag Filtering

```javascript
import { filterProductsByTag } from '../../utils/productTags';

// Filter products by tag
const bestSellers = filterProductsByTag(products, 'best-seller');

// Get all unique tags from a product list
const allTags = getAllUniqueTags(products);
```

### Component Integration

```javascript
import TagList from '../ui/Tag';
import { getProductTags } from '../../utils/productTags';

// In your component
const MyComponent = ({ product }) => {
  const tags = getProductTags(product);
  
  return (
    <div>
      <TagList
        tags={tags}
        size="sm"
        maxTags={3}
        onTagClick={(tag) => console.log('Tag clicked:', tag)}
      />
    </div>
  );
};
```

## 🎨 Styling

### CSS Classes

The system uses CSS classes for styling:

- `.tag` - Base tag styles
- `.tag-{size}` - Size variants (xs, sm, default, lg, xl)
- `.tag-{variant}` - Color variants (new, best-seller, low-stock, etc.)
- `.tag-list` - Container for multiple tags
- `.tag-removable` - Tags with remove buttons

### Custom Styling

Add custom styles by extending the CSS:

```css
.tag-custom-tag {
  background-color: rgb(255 0 0 / 0.1);
  color: rgb(255 0 0);
  border: 1px solid rgb(255 0 0 / 0.2);
}

.tag-custom-tag:hover {
  background-color: rgb(255 0 0 / 0.2);
}
```

## 🔧 Configuration

### Tag Priority

Tags are displayed in order of priority (lower numbers = higher priority):

```javascript
priority: 1, // Highest priority - appears first
priority: 2, // Second priority
priority: 3, // Third priority
// ... etc
```

### Tag Conditions

Each tag has a condition function that determines when it should be applied:

```javascript
condition: (product) => {
  // Return true if tag should be applied
  // Return false if tag should not be applied
  return product.salesCount > 100;
}
```

## 📱 Components

### Tag Component

Individual tag display with variants and sizes:

```javascript
<Tag
  tag={tagObject}
  variant="default"
  size="sm"
  onClick={handleClick}
  removable={true}
  onRemove={handleRemove}
/>
```

### TagList Component

Container for multiple tags with filtering and pagination:

```javascript
<TagList
  tags={tagsArray}
  variant="default"
  size="sm"
  maxTags={5}
  showCount={true}
  onTagClick={handleTagClick}
  removable={false}
  onTagRemove={handleTagRemove}
/>
```

## 🧪 Testing

### Demo Page

Visit `/tag-demo` to see the tagging system in action:

- View sample products with automatic tags
- Click tags to filter products
- See tag statistics and counts
- Test different tag combinations

### Sample Data

The demo includes sample products with various tag combinations:

```javascript
const sampleProducts = [
  {
    id: '1',
    name: 'Samsung Galaxy S24 Ultra',
    stock: 5,        // Gets "Low Stock" tag
    salesCount: 150, // Gets "Best Seller" tag
    dateAdded: new Date().toISOString(), // Gets "New" tag
  }
  // ... more products
];
```

## 🔄 API Integration

### Data Transformation

When fetching from your API, ensure the data includes required fields:

```javascript
const transformProductData = (apiProduct) => ({
  ...apiProduct,
  // Map API fields to expected fields
  dateAdded: apiProduct.created_at || apiProduct.date_added,
  salesCount: apiProduct.sales_count || apiProduct.sold_count || 0,
  stock: apiProduct.quantity || apiProduct.inventory || 0
});
```

### Backend Considerations

For optimal performance, consider:

- Adding database indexes on fields used for tagging
- Implementing server-side tag calculation
- Caching tag results for frequently accessed products

## 🚀 Performance

### Optimization Tips

1. **Memoization**: Cache tag results for products that don't change frequently
2. **Lazy Loading**: Only calculate tags when products are displayed
3. **Batch Processing**: Process multiple products at once when possible
4. **Virtual Scrolling**: For large product lists, only render visible items

### Memory Management

- Tags are lightweight objects (few bytes each)
- Product references are maintained efficiently
- No unnecessary re-renders when tags don't change

## 🔮 Future Enhancements

### Planned Features

- **Tag Analytics**: Track tag performance and usage
- **Custom Tag Rules**: User-defined tagging criteria
- **Tag Templates**: Predefined tag sets for different product types
- **A/B Testing**: Test different tag strategies
- **Machine Learning**: AI-powered tag suggestions

### Extension Points

The system is designed to be easily extensible:

- Add new tag types without modifying existing code
- Customize tag display logic per component
- Integrate with external data sources
- Support for dynamic tag rules

## 📚 Examples

### E-commerce Product

```javascript
const product = {
  id: '123',
  name: 'Wireless Headphones',
  price: 99.99,
  stock: 3,           // Gets "Low Stock" tag
  salesCount: 250,    // Gets "Best Seller" + "Trending" tags
  dateAdded: '2024-01-15T10:00:00Z' // Gets "New" tag
};

const tags = getProductTags(product);
// Returns: [New, Best Seller, Low Stock, Trending]
```

### Inventory Management

```javascript
// Filter products that need restocking
const lowStockProducts = filterProductsByTag(products, 'low-stock');
const outOfStockProducts = filterProductsByTag(products, 'out-of-stock');

// Get all products that need attention
const needsAttention = [...lowStockProducts, ...outOfStockProducts];
```

## 🤝 Contributing

### Adding New Tags

1. Update `TAG_CONFIG` in `productTags.js`
2. Add corresponding CSS styles in `tags.css`
3. Update documentation
4. Add tests if applicable

### Code Style

- Use descriptive tag IDs and labels
- Keep condition functions simple and readable
- Follow existing naming conventions
- Add JSDoc comments for complex logic

## 📄 License

This tagging system is part of the IziShop project and follows the same licensing terms.

---

**Need Help?** Check the demo page at `/tag-demo` or review the source code in `frontend/src/utils/productTags.js`
