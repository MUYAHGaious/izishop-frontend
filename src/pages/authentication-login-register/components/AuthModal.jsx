import React from 'react';
import Icon from '../../../components/AppIcon';

const AuthModal = ({ children, onClose, showClose = false }) => {
  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto">
      {/* Modal */}
      <div className="relative w-full bg-card border border-border rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl overflow-hidden marketplace-spring">
        {/* Close Button */}
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-muted/80 hover:bg-muted text-text-secondary hover:text-foreground marketplace-transition"
          >
            <Icon name="X" size={18} />
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