import React, { useState, useRef } from 'react';
import { CameraIcon, ArrowLeftIcon, CheckIcon, GalleryIcon } from './icons';

interface StaffPageProps {
  onPhotoUpload: (photoUrl: string) => boolean;
  onBack: () => void;
}

const StaffPage: React.FC<StaffPageProps> = ({ onPhotoUpload, onBack }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const photoUrl = URL.createObjectURL(file);
      const success = onPhotoUpload(photoUrl);
      if (success) {
        setIsSubmitted(true);
      }
      // Reset the input value to allow uploading the same file again
      e.target.value = '';
    }
  };

  const handleTakePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };
  
  const handleNextPhoto = () => {
    setIsSubmitted(false);
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4">
      <button onClick={onBack} className="absolute top-6 left-6 z-20 p-3 bg-amber-700/10 backdrop-blur-md rounded-full text-amber-800 hover:bg-amber-700/20 transition-colors">
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
      <div className="text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-stone-800">Staff Camera</h1>
        <p className="mt-2 text-lg text-stone-500 max-w-md">
          Take a photo or upload from the gallery to send to the signing tablet.
        </p>
        <div className="mt-12">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          
          {isSubmitted ? (
            <div className="mx-auto flex flex-col items-center justify-center w-72 h-64 border-2 border-dashed rounded-2xl bg-amber-700 border-amber-700 text-white">
                <CheckIcon className="w-12 h-12 mb-4" />
                <span className="text-xl font-semibold">Sent to Tablet!</span>
                <button 
                  onClick={handleNextPhoto}
                  className="mt-4 px-6 py-2 bg-white text-amber-700 font-bold rounded-full hover:bg-amber-50 transition-colors"
                >
                  Take Next Photo
                </button>
            </div>
          ) : (
            <div
                className="inline-flex flex-col items-center justify-center w-72 h-64 p-6 border-2 border-dashed rounded-2xl transition-all duration-300 border-amber-500"
            >
                <button
                    onClick={handleTakePhotoClick}
                    className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-amber-600 text-white rounded-full font-bold text-lg hover:bg-amber-500 transition-all shadow-md hover:shadow-lg"
                >
                    <CameraIcon className="w-6 h-6" />
                    Take Photo
                </button>
                <div className="text-sm text-stone-400 my-4">or</div>
                 <button
                    onClick={handleUploadClick}
                    className="group w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-amber-600 rounded-full font-bold text-md hover:bg-amber-50 border border-amber-500 transition-all"
                >
                    <GalleryIcon className="w-5 h-5" />
                    Upload from Gallery
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffPage;