import React from 'react';
import Icon from '../../../components/AppIcon';

const AuthModal = ({ children, onClose, showClose = false }) => {
  return (
    <div className="w-full max-w-sm mx-auto sm:max-w-md lg:max-w-lg">
      {/* Mobile-first glass morphism modal */}
      <div className="relative w-full bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Enhanced gradient overlay for mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/20 to-white/10 pointer-events-none" />
        
        {/* Close Button - Mobile optimized */}
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 sm:p-2.5 rounded-full bg-white/30 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-text-secondary hover:text-foreground transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Icon name="X" size={16} className="sm:w-5 sm:h-5" />
          </button>
        )}
        
        {/* Content with mobile-first padding */}
        <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>

        {/* Mobile-optimized decorative elements */}
        <div className="absolute -top-16 -right-16 sm:-top-20 sm:-right-20 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-primary/25 to-primary/10 rounded-full blur-2xl sm:blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 sm:-bottom-20 sm:-left-20 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-full blur-2xl sm:blur-3xl pointer-events-none" />
        
        {/* Additional mobile accent */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
      </div>
    </div>
  );
};

export default AuthModal;

