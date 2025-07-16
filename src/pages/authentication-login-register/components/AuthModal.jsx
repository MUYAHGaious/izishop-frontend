import React from 'react';
import Icon from '../../../components/AppIcon';

const AuthModal = ({ children, onClose, showClose = false }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden marketplace-spring">
        {/* Close Button */}
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/80 hover:bg-muted text-text-secondary hover:text-foreground marketplace-transition"
          >
            <Icon name="X" size={20} />
          </button>
        )}
        
        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;