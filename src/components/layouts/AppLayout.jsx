import React from 'react';
import SimpleHeader from '../ui/SimpleHeader';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header Navigation */}
      <SimpleHeader />
      
      {/* Main Content */}
      <main className="pt-14 sm:pt-16">
        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

export default AppLayout;