import React, { useState } from 'react';

interface SearchFilters {
  reglement: boolean;
  documentation: boolean;
  doctrine: boolean;
  actualites: boolean;
  considerants: boolean;
  annexes: boolean;
  fichesPratiques: boolean;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading?: boolean;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    reglement: true,
    documentation: true,
    doctrine: true,
    actualites: true,
    considerants: true,
    annexes: true,
    fichesPratiques: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), filters);
    }
  };

  const toggleFilter = (key: keyof SearchFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allFiltersDisabled = !Object.values(filters).some(Boolean);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ de recherche principal */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher sur le site..."
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim() || allFiltersDisabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Filtres de recherche */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Rechercher dans :</h3>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {/* Règlement IA */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.reglement}
                onChange={() => toggleFilter('reglement')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Règlement IA</span>
            </label>
            {/* Considérants */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.considerants}
                onChange={() => toggleFilter('considerants')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Considérants</span>
            </label>
            {/* Annexes */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.annexes}
                onChange={() => toggleFilter('annexes')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Annexes</span>
            </label>
            {/* Documentation */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.documentation}
                onChange={() => toggleFilter('documentation')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Documentation</span>
            </label>
            {/* Doctrine */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.doctrine}
                onChange={() => toggleFilter('doctrine')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Doctrine</span>
            </label>
            {/* Actualités */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.actualites}
                onChange={() => toggleFilter('actualites')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Actualités</span>
            </label>
            {/* Fiches pratiques */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.fichesPratiques}
                onChange={() => toggleFilter('fichesPratiques')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Fiches pratiques</span>
            </label>
          </div>
        </div>

        {allFiltersDisabled && (
          <p className="text-sm text-red-600">Veuillez sélectionner au moins une source de recherche.</p>
        )}
      </form>
    </div>
  );
}; 