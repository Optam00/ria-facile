import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface BurgerMenuProps {
  buttonClassName?: string;
  className?: string;
  menuClassName?: string;
  position?: 'left' | 'right';
  children?: React.ReactNode;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ 
  buttonClassName = "ml-4", 
  className = '', 
  menuClassName = 'w-[calc(100vw-2rem)] max-w-sm',
  position = 'left',
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Gérer les clics en dehors du menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.burger-menu-content') && !target.closest('.burger-menu-button')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleMenu}
        className={`burger-menu-button p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none ${buttonClassName}`}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div 
          className={`burger-menu-content absolute ${position}-0 mt-2 bg-white rounded-md shadow-lg py-1 z-50 ${menuClassName}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children || (
            <>
              <Link
                to="/consulter"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Consulter le RIA
              </Link>
              <Link
                to="/documentation"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Documentation utile
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}; 