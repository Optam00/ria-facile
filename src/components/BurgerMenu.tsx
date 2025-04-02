import React, { useState, useEffect, cloneElement } from 'react';

interface BurgerMenuProps {
  children: React.ReactElement<{ defaultOpen?: boolean; forceOpen?: boolean }>;
  buttonClassName?: string;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ children, buttonClassName = "ml-4" }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Gérer les clics en dehors du menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Si le menu est ouvert et que le clic n'est pas sur un élément du menu
      if (isOpen && !target.closest('.burger-menu-content') && !target.closest('.burger-menu-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Cloner l'élément enfant avec isOpen comme prop supplémentaire
  const childrenWithProps = cloneElement(children, {
    defaultOpen: true,
    forceOpen: isOpen
  });

  return (
    <div className="lg:hidden">
      {/* Bouton burger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`burger-menu-button p-3 rounded-lg bg-white shadow-lg hover:bg-gray-50 flex items-center gap-2 ${buttonClassName}`}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
        <span className="text-sm text-gray-600 font-medium">Sommaire</span>
      </button>

      {/* Menu overlay */}
      {isOpen && (
        <>
          {/* Contenu du menu */}
          <div 
            className="burger-menu-content fixed left-0 top-0 h-full w-80 max-w-sm bg-white shadow-xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                <h2 className="font-medium text-gray-800">Sommaire</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Fermer le menu"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                {childrenWithProps}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 