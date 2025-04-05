import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface BurgerMenuProps {
  buttonClassName?: string;
  className?: string;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ buttonClassName = "ml-4", className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Gérer les clics en dehors du menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.burger-menu-content') && !target.closest('.burger-menu-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const toggleMenu = () => {
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
        <div className="burger-menu-content absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <Link
            to="/consulter"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={toggleMenu}
          >
            Consulter le RIA
          </Link>
          <Link
            to="/documentation"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={toggleMenu}
          >
            Documentation utile
          </Link>
        </div>
      )}
    </div>
  );
}; 