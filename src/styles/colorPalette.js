// IziShopin Color Palette - Based on ScrollStack Design System
// This file contains all colors used throughout the site for consistent branding

export const colorPalette = {
  // Primary Brand Colors (from ScrollStack cards)
  primary: {
    teal: {
      400: '#2dd4bf', // from-teal-400
      500: '#14b8a6', // from-teal-500
      600: '#0d9488', // to-teal-600
      gradient: 'linear-gradient(135deg, #2dd4bf, #0d9488)', // ScrollStack teal gradient
    },
    blue: {
      500: '#3b82f6', // from-blue-500
      600: '#2563eb', // to-blue-600
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', // ScrollStack blue gradient
    }
  },

  // Neutral Colors (from ScrollStack cards)
  neutral: {
    gray: {
      100: '#f3f4f6', // from-gray-100
      200: '#e5e7eb', // to-gray-200
      400: '#9ca3af', // from-gray-400
      500: '#6b7280', // to-gray-500
      600: '#4b5563', // via-gray-600
      900: '#111827', // bg-gray-900
      lightGradient: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', // ScrollStack light gray
      darkGradient: 'linear-gradient(135deg, #9ca3af, #6b7280)', // ScrollStack dark gray
    }
  },

  // Background Colors
  background: {
    white: '#ffffff',
    light: '#f9fafb',
    dark: '#111827',
  },

  // Text Colors
  text: {
    primary: '#111827', // gray-900
    secondary: '#6b7280', // gray-500
    white: '#ffffff',
    light: '#f3f4f6', // gray-100
  },

  // Border Colors
  border: {
    light: '#e5e7eb', // gray-200
    medium: '#d1d5db', // gray-300
    dark: '#9ca3af', // gray-400
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)', // Used in ScrollStack cards
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
  }
};

// Tailwind CSS class mappings for easy use
export const tailwindColors = {
  // Primary gradients (matching ScrollStack)
  'bg-gradient-teal': 'bg-gradient-to-br from-teal-400 to-teal-600',
  'bg-gradient-blue': 'bg-gradient-to-r from-blue-500 to-blue-600',
  'bg-gradient-gray-light': 'bg-gradient-to-br from-gray-100 to-gray-200',
  'bg-gradient-gray-dark': 'bg-gradient-to-r from-gray-400 to-gray-500',
  
  // Solid colors
  'bg-teal-400': 'bg-teal-400',
  'bg-teal-500': 'bg-teal-500',
  'bg-teal-600': 'bg-teal-600',
  'bg-gray-900': 'bg-gray-900',
  'bg-gray-100': 'bg-gray-100',
  'bg-gray-200': 'bg-gray-200',
  
  // Text colors
  'text-white': 'text-white',
  'text-gray-900': 'text-gray-900',
  'text-gray-500': 'text-gray-500',
};

// CSS Custom Properties for use in CSS files
export const cssVariables = {
  '--color-teal-400': '#2dd4bf',
  '--color-teal-500': '#14b8a6',
  '--color-teal-600': '#0d9488',
  '--color-blue-500': '#3b82f6',
  '--color-blue-600': '#2563eb',
  '--color-gray-100': '#f3f4f6',
  '--color-gray-200': '#e5e7eb',
  '--color-gray-400': '#9ca3af',
  '--color-gray-500': '#6b7280',
  '--color-gray-600': '#4b5563',
  '--color-gray-900': '#111827',
  '--gradient-teal': 'linear-gradient(135deg, #2dd4bf, #0d9488)',
  '--gradient-blue': 'linear-gradient(135deg, #3b82f6, #2563eb)',
  '--gradient-gray-light': 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
  '--gradient-gray-dark': 'linear-gradient(135deg, #9ca3af, #6b7280)',
};

// Helper function to get gradient by name
export const getGradient = (name) => {
  const gradients = {
    teal: colorPalette.primary.teal.gradient,
    blue: colorPalette.primary.blue.gradient,
    grayLight: colorPalette.neutral.gray.lightGradient,
    grayDark: colorPalette.neutral.gray.darkGradient,
  };
  return gradients[name] || gradients.teal;
};

// Helper function to get color by path (e.g., 'primary.teal.400')
export const getColor = (path) => {
  return path.split('.').reduce((obj, key) => obj[key], colorPalette);
};

export default colorPalette;
