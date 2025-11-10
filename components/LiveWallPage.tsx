import React, { useState, useCallback, KeyboardEvent } from 'react';
import { GuestCard } from '../types';
import { ArrowLeftIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface LiveWallPageProps {
  cards: GuestCard[];
  onExit: () => void;
}

const LiveWallPage: React.FC<LiveWallPageProps> = ({ cards, onExit }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const openModal = (index: number) => {
        setSelectedImageIndex(index);
    };

    const closeModal = () => {
        setSelectedImageIndex(null);
    };

    const showNextImage = useCallback(() => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prevIndex) => (prevIndex! + 1) % cards.length);
        }
    }, [selectedImageIndex, cards.length]);

    const showPrevImage = useCallback(() => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prevIndex) => (prevIndex! - 1 + cards.length) % cards.length);
        }
    }, [selectedImageIndex, cards.length]);
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') {
            showNextImage();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    }, [showNextImage, showPrevImage]);

    return (
        <div className="w-full min-h-screen bg-[#F8F5F2] p-4 sm:p-6 md:p-8">
            <header className="flex items-center justify-between mb-8">
                 <button onClick={onExit} className="z-20 p-3 bg-white/50 backdrop-blur-md rounded-full text-amber-800 hover:bg-white transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="font-serif text-3xl md:text-4xl text-stone-800 text-center flex-grow">
                    Jonathan &amp; Grace's Guestbook
                </h1>
                <div className="w-12 h-12"></div> {/* Spacer to balance the back button */}
            </header>
            
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                {cards.map((card, index) => (
                    <div key={card.id} className="mb-4 break-inside-avoid" onClick={() => openModal(index)}>
                        <img 
                            src={card.imageUrl} 
                            alt={`Guest signature ${index + 1}`}
                            className="w-full h-auto rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
                        />
                    </div>
                ))}
            </div>

            {selectedImageIndex !== null && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
                    onClick={closeModal}
                    onKeyDown={handleKeyDown}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    ref={node => node?.focus()}
                >
                    <div className="relative w-full h-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={cards[selectedImageIndex].imageUrl}
                            alt={`Guest signature ${selectedImageIndex + 1}`}
                            className="w-full h-full object-contain"
                        />

                        <button onClick={closeModal} className="absolute top-2 right-2 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors">
                            <XIcon className="w-6 h-6" />
                        </button>

                        {cards.length > 1 && (
                            <>
                                <button onClick={showPrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors">
                                    <ChevronLeftIcon className="w-8 h-8" />
                                </button>
                                <button onClick={showNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors">
                                    <ChevronRightIcon className="w-8 h-8" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveWallPage;