import React from 'react';
import { Page } from '../types';
import { GalleryIcon, PenLineIcon, CameraIcon } from './icons';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full h-screen overflow-hidden flex flex-col items-center justify-center p-8 text-center bg-amber-700 text-white">
      <div className="flex flex-col items-center">
        <h2 className="font-serif text-2xl md:text-4xl tracking-wider">Welcome to the wedding of</h2>
        <h1 className="font-serif text-6xl md:text-9xl my-4">Jonathan &amp; Grace</h1>
        <p className="text-xl md:text-2xl tracking-wide">Jan 24, 2026</p>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <button
              onClick={() => onNavigate('wall')}
              className="group flex flex-col items-center justify-center p-6 bg-white/10 rounded-2xl border border-white/30 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-xl hover:-translate-y-1"
            >
              <GalleryIcon className="w-10 h-10 mb-3 text-white/90 group-hover:text-white" />
              <span className="text-xl font-medium text-white">View Sign-in Wall</span>
              <span className="text-sm font-normal text-white/80 mt-1">Live gallery of guest messages</span>
            </button>
            <button
              onClick={() => onNavigate('staff')}
              className="group flex flex-col items-center justify-center p-6 bg-white/10 rounded-2xl border border-white/30 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-xl hover:-translate-y-1"
            >
              <CameraIcon className="w-10 h-10 mb-3 text-white/90 group-hover:text-white" />
              <span className="text-xl font-medium text-white">Staff Camera</span>
              <span className="text-sm font-normal text-white/80 mt-1">Take and upload guest photos</span>
            </button>
             <button
              onClick={() => onNavigate('guest-tablet')}
              className="group flex flex-col items-center justify-center p-6 bg-white/10 rounded-2xl border border-white/30 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-xl hover:-translate-y-1"
            >
              <PenLineIcon className="w-10 h-10 mb-3 text-white/90 group-hover:text-white" />
              <span className="text-xl font-medium text-white">Guest Signing</span>
              <span className="text-sm font-normal text-white/80 mt-1">Guests sign their photo here</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;