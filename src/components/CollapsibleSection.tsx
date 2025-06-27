import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  resultCount: number;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = true,
  resultCount
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="mb-4 bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 md:px-6 py-3 md:py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left focus:outline-none"
        aria-expanded={isOpen}
        aria-controls={`section-content-${title}`}
      >
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
            <span className="font-semibold text-base md:text-lg text-gray-800 w-full md:w-auto">
              {title}
            </span>
            <span
              className={`mt-1 md:mt-0 ml-0 md:ml-2 inline-block rounded-full px-2 py-0.5 text-xs md:text-sm font-medium whitespace-nowrap
                ${resultCount === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-600'}
              `}
              style={{ minWidth: '56px', textAlign: 'center', alignSelf: 'flex-start' }}
            >
              {resultCount} résultat{resultCount > 1 || resultCount === 0 ? 's' : ''}
            </span>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      <div
        id={`section-content-${title}`}
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-3 md:p-6 overflow-y-auto" style={{ maxHeight: '400px', minHeight: 0 }}>
          {children}
        </div>
      </div>
    </section>
  );
}; 