// ============================================
// LAYOUT COMPONENT
// ============================================
// Wraps all pages with Navbar and consistent styling.
// ============================================

import type { ReactNode } from 'react';
import Navbar from './Navbar';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
