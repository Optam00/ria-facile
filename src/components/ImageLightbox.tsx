import React, { useEffect } from 'react';

interface ImageLightboxProps {
  images: { src: string; alt?: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!images[currentIndex]) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-all animate-fade-in overflow-y-auto overflow-x-hidden" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
      {/* Overlay pour fermer */}
      <div className="absolute inset-0 cursor-zoom-out" onClick={onClose} />
      {/* Contenu lightbox */}
      <div className="relative z-10 max-w-full max-h-full flex flex-col items-center">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition"
          aria-label="Fermer"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Image */}
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt || ''}
          className="max-h-[80vh] max-w-[90vw] rounded-2xl shadow-lg object-contain bg-white"
        />
        {/* Navigation */}
        {images.length > 1 && (
          <div className="flex justify-between items-center w-full mt-4 px-8">
            <button
              onClick={onPrev}
              className="bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition"
              aria-label="Image précédente"
              disabled={currentIndex === 0}
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-white text-sm bg-black bg-opacity-40 rounded px-3 py-1">
              {currentIndex + 1} / {images.length}
            </span>
            <button
              onClick={onNext}
              className="bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition"
              aria-label="Image suivante"
              disabled={currentIndex === images.length - 1}
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox; 