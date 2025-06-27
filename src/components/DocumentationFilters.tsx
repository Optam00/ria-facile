import React from 'react';
import Select from 'react-select';

interface FilterOption {
  value: string;
  label: string;
}

interface DocumentationFiltersProps {
  langues: FilterOption[];
  themes: FilterOption[];
  auteurs: FilterOption[];
  selectedLangues: FilterOption[];
  selectedThemes: FilterOption[];
  selectedAuteurs: FilterOption[];
  onLanguesChange: (selected: FilterOption[]) => void;
  onThemesChange: (selected: FilterOption[]) => void;
  onAuteursChange: (selected: FilterOption[]) => void;
}

export const DocumentationFilters: React.FC<DocumentationFiltersProps> = ({
  langues,
  themes,
  auteurs,
  selectedLangues,
  selectedThemes,
  selectedAuteurs,
  onLanguesChange,
  onThemesChange,
  onAuteursChange,
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Langues
          </label>
          <Select
            isMulti
            options={langues}
            value={selectedLangues}
            onChange={(selected) => onLanguesChange(selected as FilterOption[])}
            placeholder="Sélectionner les langues"
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thèmes
          </label>
          <Select
            isMulti
            options={themes}
            value={selectedThemes}
            onChange={(selected) => onThemesChange(selected as FilterOption[])}
            placeholder="Sélectionner les thèmes"
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auteurs
          </label>
          <Select
            isMulti
            options={auteurs}
            value={selectedAuteurs}
            onChange={(selected) => onAuteursChange(selected as FilterOption[])}
            placeholder="Sélectionner les auteurs"
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
      </div>
    </div>
  );
}; 