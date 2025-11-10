import React, { useState, useRef } from 'react';
import { CameraIcon, ArrowLeftIcon, CheckIcon, GalleryIcon } from './icons';
import { supabase } from '../supabaseClient';
import { BACKEND_BASE_URL } from '../config';

interface StaffPageProps {
  onBack: () => void;
}

const StaffPage: React.FC<StaffPageProps> = ({ onBack }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      const response = await fetch(`${BACKEND_BASE_URL}/photos/pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: publicUrl }),
      });
      
      if (!response.ok) throw new Error('Failed to notify backend.');

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsUploading(false);
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
    setError(null);
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
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isUploading} />
          
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
              {isUploading ? (
                 <div className="flex flex-col items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="mt-4 text-lg text-stone-600">Uploading...</span>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default StaffPage;