/**
 * Simple toast notification system
 * Shows temporary notifications to users
 */

let toastContainer = null;

const createToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

const getToastStyles = (type) => {
  const baseStyles = `
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.3s ease;
    pointer-events: auto;
    cursor: pointer;
  `;

  const typeStyles = {
    success: 'background-color: #10B981;',
    error: 'background-color: #EF4444;',
    info: 'background-color: #3B82F6;',
    warning: 'background-color: #F59E0B;',
  };

  return baseStyles + (typeStyles[type] || typeStyles.info);
};

export const showToast = (message, type = 'info', duration = 4000) => {
  const container = createToastContainer();
  
  // Create toast element
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = getToastStyles(type);
  
  // Add click to dismiss
  toast.addEventListener('click', () => {
    hideToast(toast);
  });
  
  // Add to container
  container.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });
  
  // Auto hide
  if (duration > 0) {
    setTimeout(() => {
      hideToast(toast);
    }, duration);
  }
  
  return toast;
};

const hideToast = (toast) => {
  if (toast && toast.parentNode) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
};

// Convenience methods
export const showSuccessToast = (message, duration) => showToast(message, 'success', duration);
export const showErrorToast = (message, duration) => showToast(message, 'error', duration);
export const showInfoToast = (message, duration) => showToast(message, 'info', duration);
export const showWarningToast = (message, duration) => showToast(message, 'warning', duration);

export default {
  show: showToast,
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast
};