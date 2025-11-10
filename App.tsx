import React, { useState } from 'react';
import { Page } from './types';
import HomePage from './components/HomePage';
import StaffPage from './components/StaffPage';
import SignaturePage from './components/SignaturePage';
import LiveWallPage from './components/LiveWallPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'staff':
        return <StaffPage 
                  onBack={() => navigateTo('home')} 
                />;
      case 'guest-tablet':
        return <SignaturePage 
                  onExit={() => navigateTo('home')} 
                />;
      case 'wall':
        return <LiveWallPage onExit={() => navigateTo('home')} />;
      case 'home':
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#F8F5F2]">
      {renderPage()}
    </main>
  );
}