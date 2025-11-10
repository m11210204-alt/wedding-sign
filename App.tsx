import React, { useState, useCallback } from 'react';
import { GuestCard, Page } from './types';
import HomePage from './components/HomePage';
import StaffPage from './components/StaffPage';
import SignaturePage from './components/SignaturePage';
import LiveWallPage from './components/LiveWallPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [guestCards, setGuestCards] = useState<GuestCard[]>([]);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [queuedPhotoUrl, setQueuedPhotoUrl] = useState<string | null>(null);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const handlePhotoUpload = useCallback((photoUrl: string) => {
    if (pendingPhotoUrl) {
      setQueuedPhotoUrl(photoUrl);
    } else {
      setPendingPhotoUrl(photoUrl);
    }
    return true; // Always confirm upload to staff, queue handles logic
  }, [pendingPhotoUrl]);

  const handleSignatureComplete = useCallback((signedCardUrl: string) => {
    const newCard: GuestCard = {
      id: new Date().toISOString(),
      imageUrl: signedCardUrl,
    };
    setGuestCards(prevCards => [newCard, ...prevCards]);
    
    if (queuedPhotoUrl) {
      setPendingPhotoUrl(queuedPhotoUrl);
      setQueuedPhotoUrl(null);
    } else {
      setPendingPhotoUrl(null);
    }
  }, [queuedPhotoUrl]);

  const renderPage = () => {
    switch (currentPage) {
      case 'staff':
        return <StaffPage 
                  onPhotoUpload={handlePhotoUpload} 
                  onBack={() => navigateTo('home')} 
                />;
      case 'guest-tablet':
        return <SignaturePage 
                  photoUrl={pendingPhotoUrl} 
                  onSignatureComplete={handleSignatureComplete} 
                  onExit={() => navigateTo('home')} 
                />;
      case 'wall':
        return <LiveWallPage cards={guestCards} onExit={() => navigateTo('home')} />;
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