import React from 'react';
import './GlassIcons.css';
import { colorPalette } from '../../styles/colorPalette';

const gradientMapping = {
  teal: colorPalette.primary.teal.gradient,
  blue: colorPalette.primary.blue.gradient,
  cyan: "linear-gradient(135deg, #0891b2, #0e7490)",
  indigo: "linear-gradient(135deg, #4f46e5, #4338ca)",
  purple: "linear-gradient(135deg, #7c3aed, #6d28d9)",
  emerald: "linear-gradient(135deg, #059669, #047857)",
  sky: "linear-gradient(135deg, #0284c7, #0369a1)",
  ocean: "linear-gradient(135deg, #0e7490, #155e75)",
};

const GlassIcons = ({ items, className }) => {
  const getBackgroundStyle = (color) => {
    if (gradientMapping[color]) {
      return { background: gradientMapping[color] };
    }
    return { background: color };
  };

  return (
    <div className={`icon-btns ${className || ""}`}>
      {items.map((item, index) => (
        <button
          key={index}
          className={`icon-btn ${item.customClass || ""}`}
          aria-label={item.label}
          type="button"
          onClick={item.onClick}
        >
          <span
            className="icon-btn__back"
            style={getBackgroundStyle(item.color)}
          ></span>
          <span className="icon-btn__front">
            <span className="icon-btn__icon" aria-hidden="true">{item.icon}</span>
          </span>
          <span className="icon-btn__label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default GlassIcons;
