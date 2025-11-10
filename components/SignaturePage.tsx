import React, { useRef, useEffect, useState, MouseEvent, TouchEvent } from 'react';
import { BrushColor } from '../types';
import { EraserIcon, CheckIcon, ArrowLeftIcon, XIcon, RefreshCwIcon } from './icons';
import { supabase } from '../supabaseClient';
import { BACKEND_BASE_URL } from '../config';

interface SignaturePageProps {
  onExit?: () => void;
}

const SignaturePage: React.FC<SignaturePageProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState<BrushColor>('#292524');
  const [brushSize, setBrushSize] = useState(5);
  const [isErasing, setIsErasing] = useState(false);
  const [signedPreviewUrl, setSignedPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial pending photo
    const fetchPendingPhoto = async () => {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/photos/pending`);
            if (response.ok) {
                const data = await response.json();
                if(data.url) {
                    setPhotoUrl(data.url);
                }
            }
        } catch (error) {
            console.error("Error fetching initial photo:", error);
        }
    };
    fetchPendingPhoto();

    // Listen for real-time updates
    const channel = supabase
      .channel('pending_photo_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pending_photos' },
        (payload) => {
          setPhotoUrl(payload.new.url);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setSignedPreviewUrl(null);
    clearCanvas();
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      const resizeCanvas = () => {
        if (container.offsetWidth > 0) {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }
      };
      const timeoutId = setTimeout(resizeCanvas, 100);
      window.addEventListener('resize', resizeCanvas);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [photoUrl]);

  const getCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const touch = 'touches' in e ? e.touches[0] : null;
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    const coords = getCoords(e);
    if (!ctx || !coords) return;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    const coords = getCoords(e);
    if (!ctx || !coords) return;
    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    canvasRef.current?.getContext('2d')?.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid Data URL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
  }

  const handleDone = () => {
    const canvas = canvasRef.current;
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Important for cross-origin images
    if (!canvas || !photoUrl) return;
    
    image.src = photoUrl;
    image.onload = () => {
      const tempCanvas = document.createElement('canvas');
      const outputWidth = 1600;
      const outputHeight = 800;
      tempCanvas.width = outputWidth;
      tempCanvas.height = outputHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.fillStyle = '#F8F5F2';
        tempCtx.fillRect(0, 0, outputWidth, outputHeight);
        const photoSize = 800;
        const imgAspect = image.width / image.height;
        let sx = 0, sy = 0, sWidth = image.width, sHeight = image.height;
        if (imgAspect > 1) {
          sWidth = image.height;
          sx = (image.width - sWidth) / 2;
        } else {
          sHeight = image.width;
          sy = (image.height - sHeight) / 2;
        }
        tempCtx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, photoSize, photoSize);
        tempCtx.drawImage(canvas, photoSize, 0, photoSize, photoSize);
        const signedCardUrl = tempCanvas.toDataURL('image/jpeg', 0.9);
        setSignedPreviewUrl(signedCardUrl);
      }
    };
    image.onerror = () => {
        alert("Could not load the guest photo. Please try again. This may be a CORS issue if running locally.")
    }
  };

  const handleNextGuest = async () => {
    if (!signedPreviewUrl) return;

    try {
        const blob = dataUrlToBlob(signedPreviewUrl);
        const fileName = `signed-card-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
            .from('guest-cards')
            .upload(fileName, blob);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('guest-cards')
            .getPublicUrl(fileName);

        await fetch(`${BACKEND_BASE_URL}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: publicUrl })
        });

        // This also implicitly clears the pending photo on the backend
    } catch (error) {
        console.error("Failed to complete signature process:", error);
        alert("Failed to save signature. Please try again.");
    } finally {
        setSignedPreviewUrl(null);
        setPhotoUrl(null); // Clear photo for next guest
        clearCanvas();
    }
  };

  const selectBrush = (color: BrushColor) => {
    setIsErasing(false);
    setBrushColor(color);
    setBrushSize(5);
  };

  const selectEraser = () => {
    setIsErasing(true);
    setBrushSize(40);
  };

  if (!photoUrl) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-center p-8 bg-stone-100">
        <h1 className="font-serif text-4xl text-stone-800">Guest Signing Tablet</h1>
        <p className="mt-4 text-xl text-stone-500">Please wait for a staff member to send a photo.</p>
        {onExit && (
            <button onClick={onExit} className="mt-8 px-6 py-3 bg-amber-700 text-white rounded-lg font-semibold hover:bg-amber-800 transition-colors">
                Return to Home
            </button>
        )}
      </div>
    );
  }

  if (signedPreviewUrl) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-stone-900">
        <h1 className="font-serif text-3xl text-white mb-4">Thank You!</h1>
        <img src={signedPreviewUrl} alt="Signed guest card" className="max-w-4xl w-full rounded-lg shadow-2xl" />
        <button 
          onClick={handleNextGuest}
          className="mt-8 flex items-center gap-3 px-8 py-4 bg-amber-600 text-white rounded-full font-bold text-xl hover:bg-amber-500 transition-all shadow-lg hover:shadow-xl"
        >
          <RefreshCwIcon className="w-6 h-6" />
          Next Guest
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-2 sm:p-4 bg-stone-900 overflow-hidden">
        {onExit && (
            <div className="absolute top-4 left-4 z-20">
                <button onClick={onExit} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
            </div>
        )}

        <div className="flex-grow flex flex-col items-center justify-center w-full max-w-6xl">
            <h1 className="font-serif text-2xl md:text-3xl text-white text-center mb-4 px-12">Leave a message for Jonathan &amp; Grace!</h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
              <div className="w-full max-w-md md:w-1/2 aspect-square rounded-lg overflow-hidden bg-stone-800 shadow-xl">
                 <img src={photoUrl} alt="Guest" className="w-full h-full object-cover" crossOrigin="anonymous" />
              </div>

              <div ref={containerRef} className="w-full max-w-md md:w-1/2 aspect-square rounded-lg overflow-hidden shadow-xl bg-white relative">
                 <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
              </div>
            </div>
        </div>

        <div className="flex-shrink-0 w-full flex items-center justify-center gap-2 sm:gap-4 p-4">
             <div className="flex items-center gap-2 sm:gap-3 p-3 bg-white/10 backdrop-blur-md rounded-full">
                <button onClick={() => selectBrush('#292524')} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 ${!isErasing && brushColor === '#292524' ? 'border-amber-400' : 'border-transparent'} transition-all`} style={{ backgroundColor: '#292524' }} aria-label="Black Brush"></button>
                <button onClick={() => selectBrush('#b45309')} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 ${!isErasing && brushColor === '#b45309' ? 'border-amber-400' : 'border-transparent'} transition-all`} style={{ backgroundColor: '#b45309' }} aria-label="Gold Brush"></button>
                <button onClick={() => selectBrush('#F8F5F2')} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 ${!isErasing && brushColor === '#F8F5F2' ? 'border-amber-400' : 'border-transparent'} transition-all`} style={{ backgroundColor: '#F8F5F2' }} aria-label="White Brush"></button>
                <div className="w-px h-8 bg-white/20 mx-1 sm:mx-2"></div>
                <button onClick={selectEraser} className={`p-2 rounded-full ${isErasing ? 'bg-amber-400/30 text-amber-300' : 'text-white/70 hover:bg-white/20 hover:text-white'} transition-all`}>
                    <EraserIcon className="w-6 h-6" />
                </button>
                 <button onClick={clearCanvas} className="p-2 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-all" aria-label="Clear Canvas">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <button onClick={handleDone} className="ml-2 sm:ml-4 flex items-center gap-2 px-4 sm:px-6 py-3 bg-amber-600 text-white rounded-full font-bold text-lg hover:bg-amber-500 transition-all shadow-lg hover:shadow-xl">
                <CheckIcon className="w-6 h-6" />
                Done
            </button>
        </div>
    </div>
  );
};

export default SignaturePage;