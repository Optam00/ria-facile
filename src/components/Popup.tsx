import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Popup = () => {
  const [isOpen, setIsOpen] = useState(true);

  const closePopup = () => {
    setIsOpen(false);
  };

  return (
    isOpen && (
      <div className="fixed bottom-24 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs border border-gray-300 z-50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Devenez contributeur</h2>
          <button onClick={closePopup} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Proposez vos analyses et suggestions pour enrichir notre contenu.<br />
          <Link to="/contact" className="text-blue-500 hover:underline" onClick={closePopup}>Contactez-nous</Link>.
        </p>
      </div>
    )
  );
};

export default Popup; 