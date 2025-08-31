# IziShopin Color Palette System

This directory contains the centralized color system for IziShopin, based on the colors used in the ScrollStack component.

## Files

- `colorPalette.js` - JavaScript color palette with helper functions
- `globalColors.css` - CSS custom properties and utility classes
- `README.md` - This documentation file

## Color Palette

### Primary Colors (from ScrollStack)
- **Teal**: `#2dd4bf` → `#0d9488` (teal-400 to teal-600)
- **Blue**: `#3b82f6` → `#2563eb` (blue-500 to blue-600)

### Neutral Colors (from ScrollStack)
- **Gray Scale**: 100, 200, 300, 400, 500, 600, 900
- **Light Gray Gradient**: `#f3f4f6` → `#e5e7eb`
- **Dark Gray Gradient**: `#9ca3af` → `#6b7280`

## Usage

### 1. JavaScript/React Components

```javascript
import { colorPalette, getGradient, getColor } from '../styles/colorPalette';

// Get specific colors
const tealGradient = colorPalette.primary.teal.gradient;
const gray900 = colorPalette.neutral.gray[900];

// Use helper functions
const gradient = getGradient('teal');
const color = getColor('primary.teal.400');

// Apply to inline styles
<div style={{ background: tealGradient }}>
  Content
</div>
```

### 2. CSS Classes

```html
<!-- Use utility classes -->
<div class="bg-brand-teal text-white">
  Teal gradient background
</div>

<div class="bg-brand-gray-light text-brand-primary">
  Light gray gradient with primary text
</div>
```

### 3. CSS Custom Properties

```css
.my-component {
  background: var(--gradient-teal);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-light);
  box-shadow: 0 4px 6px -1px var(--color-shadow-light);
}
```

### 4. Tailwind CSS Classes

```html
<!-- Use Tailwind classes that match the palette -->
<div class="bg-gradient-to-br from-teal-400 to-teal-600 text-white">
  Teal gradient
</div>

<div class="bg-gray-900 text-white">
  Dark background
</div>
```

## Color Combinations

### Primary Brand Combinations
- **Primary Action**: Teal gradient (`bg-brand-teal`)
- **Secondary Action**: Blue gradient (`bg-brand-blue`)
- **Text on Teal**: White text
- **Text on Blue**: White text

### Neutral Combinations
- **Light Background**: Light gray gradient (`bg-brand-gray-light`)
- **Dark Background**: Dark gray (`bg-gray-900`)
- **Text on Light**: Primary text (`text-brand-primary`)
- **Text on Dark**: White text (`text-white`)

## Best Practices

1. **Always use the palette colors** - Don't hardcode colors
2. **Use gradients for primary elements** - Creates visual hierarchy
3. **Maintain contrast ratios** - Ensure accessibility
4. **Be consistent** - Use the same colors for similar elements
5. **Test in different contexts** - Light/dark modes, different screen sizes

## Adding New Colors

To add new colors to the palette:

1. Add to `colorPalette.js`
2. Add CSS custom properties to `globalColors.css`
3. Create utility classes if needed
4. Update this documentation

## Examples

### Buttons
```html
<button class="bg-brand-teal text-white px-6 py-3 rounded-lg hover:shadow-brand-medium">
  Primary Button
</button>
```

### Cards
```html
<div class="bg-brand-gray-light text-brand-primary p-6 rounded-xl shadow-brand-light">
  Card Content
</div>
```

### Headers
```html
<h1 class="text-brand-primary text-3xl font-bold">
  Page Title
</h1>
```

This color system ensures consistent branding across the entire IziShopin platform!
