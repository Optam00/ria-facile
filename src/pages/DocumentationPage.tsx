import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DocCard } from '../components/DocCard';
import { DocumentationFilters } from '../components/DocumentationFilters';
import { Helmet } from 'react-helmet';

interface Doc {
  id: number;
  titre: string;
  auteur: string;
  lien: string;
  date: string;
  resume: string;
  themes: string;
  langue: string;
}

interface FilterOption {
  value: string;
  label: string;
}

export const DocumentationPage = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les options de filtres
  const [langues, setLangues] = useState<FilterOption[]>([]);
  const [themes, setThemes] = useState<FilterOption[]>([]);
  const [auteurs, setAuteurs] = useState<FilterOption[]>([]);
  
  // États pour les filtres sélectionnés
  const [selectedLangues, setSelectedLangues] = useState<FilterOption[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<FilterOption[]>([]);
  const [selectedAuteurs, setSelectedAuteurs] = useState<FilterOption[]>([]);

  // Fonction pour extraire les options uniques
  const extractUniqueOptions = (docs: Doc[], field: 'langue' | 'themes' | 'auteur'): FilterOption[] => {
    const uniqueValues = new Set<string>();
    
    docs.forEach(doc => {
      if (field === 'themes') {
        const themesList = doc[field].split(',').map(t => t.trim());
        themesList.forEach(theme => uniqueValues.add(theme));
      } else if (field === 'langue') {
        const languesList = doc[field].split(',').map(l => l.trim());
        languesList.forEach(langue => uniqueValues.add(langue));
      } else {
        uniqueValues.add(doc[field]);
      }
    });

    return Array.from(uniqueValues)
      .filter(value => value) // Filtrer les valeurs vides
      .map(value => ({
        value,
        label: value
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  // Effet pour charger les documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data, error } = await supabase
          .from('docs')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        const docsData = data || [];
        setDocs(docsData);
        setFilteredDocs(docsData);
        
        // Extraire les options pour les filtres
        setLangues(extractUniqueOptions(docsData, 'langue'));
        setThemes(extractUniqueOptions(docsData, 'themes'));
        setAuteurs(extractUniqueOptions(docsData, 'auteur'));
      } catch (err) {
        console.error('Erreur lors de la récupération des documents:', err);
        setError('Impossible de charger les documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  // Effet pour filtrer les documents
  useEffect(() => {
    let filtered = [...docs];

    if (selectedLangues.length > 0) {
      filtered = filtered.filter(doc => {
        const docLangues = doc.langue.split(',').map(l => l.trim());
        return selectedLangues.some(selected => docLangues.includes(selected.value));
      });
    }

    if (selectedThemes.length > 0) {
      filtered = filtered.filter(doc => {
        const docThemes = doc.themes.split(',').map(t => t.trim());
        return selectedThemes.some(selected => docThemes.includes(selected.value));
      });
    }

    if (selectedAuteurs.length > 0) {
      filtered = filtered.filter(doc =>
        selectedAuteurs.some(selected => selected.value === doc.auteur)
      );
    }

    setFilteredDocs(filtered);
  }, [docs, selectedLangues, selectedThemes, selectedAuteurs]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-600 text-lg">Chargement des documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md mb-4">
          <p className="font-bold">Erreur :</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300"
        >
          Rafraîchir la page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Documentation utile - RIA Facile</title>
      </Helmet>
      
      {/* En-tête de la page */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-3xl shadow-md p-8 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#774792' }}>
            Documentation utile
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Découvrez notre sélection de documents essentiels sur le Règlement Intelligence Artificielle (RIA, IA Act, AI Act) et sa réglementation pour mieux comprendre les enjeux et obligations.
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <DocumentationFilters
          langues={langues}
          themes={themes}
          auteurs={auteurs}
          selectedLangues={selectedLangues}
          selectedThemes={selectedThemes}
          selectedAuteurs={selectedAuteurs}
          onLanguesChange={setSelectedLangues}
          onThemesChange={setSelectedThemes}
          onAuteursChange={setSelectedAuteurs}
        />
      </div>
      
      {/* Grille de documents */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <DocCard
                key={doc.id}
                titre={doc.titre}
                auteur={doc.auteur}
                lien={doc.lien}
                date={doc.date}
                resume={doc.resume}
                themes={doc.themes}
                langue={doc.langue}
              />
            ))
          ) : (
            <div className="col-span-3 bg-white rounded-3xl shadow-lg p-8 text-center my-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl text-gray-600 font-medium">Aucun document ne correspond aux filtres sélectionnés</p>
              <p className="text-gray-500 mt-2">Essayez de modifier vos critères de filtrage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 