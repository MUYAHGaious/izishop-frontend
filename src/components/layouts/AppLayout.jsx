import React from 'react';
import DynamicNavigation from '../ui/DynamicNavigation';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic Navigation */}
      <DynamicNavigation />
      
      {/* Main Content */}
      <main className="pt-14 sm:pt-16">
        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

export default AppLayout;