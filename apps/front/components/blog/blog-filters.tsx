"use client"; // Ajout de ce mode car on utilise `useState` et `useEffect`

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/inputs/MultiSelect";
import { SearchIcon } from "lucide-react";

interface BlogFiltersProps {
  searchValue: string;
  selectedCategories: string[];
  selectedAuthors: string[];
  onFiltersUpdate: (filters: {
    search?: string;
    categories?: string[];
    authors?: string[];
  }) => void;
}

interface Author {
  name: string;
  publishedArticlesCount: number;
  imageURL: string;
}

const BlogFilters: React.FC<BlogFiltersProps> = ({
  searchValue,
  selectedCategories,
  selectedAuthors,
  onFiltersUpdate,
}) => {
  const [localSearchValue, setLocalSearchValue] = useState<string>(searchValue);
  const [savedSearchValue, setSavedSearchValue] = useState<string>(searchValue);
  const [categories, setCategories] = useState<string[]>([]); // État local pour les catégories
  const [authors, setAuthors] = useState<Author[]>([]); // État local pour les auteurs

  // Fetch des catégories au chargement du composant
  useEffect(() => {
    const fetchCategoriesAndAuthors = async () => {
      try {
        const [categoriesResponse, authorsResponse] = await Promise.all([
          fetch('/api/blog?action=categories'),
          fetch('/api/blog?action=authors')
        ]);

        if (!categoriesResponse.ok || !authorsResponse.ok) {
          throw new Error('Failed to fetch filters data');
        }

        const fetchedCategories = await categoriesResponse.json();
        const fetchedAuthors = await authorsResponse.json();

        setCategories(fetchedCategories); // Met à jour les catégories
        setAuthors(fetchedAuthors); // Récupère juste les noms des auteurs
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des catégories et auteurs:",
          error
        );
      }
    };

    fetchCategoriesAndAuthors();
  }, []);

  // Gestion du onchange pour la recherche locale
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchValue(e.target.value); // Met à jour uniquement l'état local
  };

  // Gestion de la soumission de la recherche (via le bouton)
  const handleSearchSubmit = () => {
    onFiltersUpdate({ search: localSearchValue });
    setSavedSearchValue(localSearchValue); // Met à jour la valeur sauvegardée
  };

  // Gestion du changement des catégories sélectionnées
  const handleCategoryChange = (newCategories: string[]) => {
    if (localSearchValue !== savedSearchValue) {
      onFiltersUpdate({ search: localSearchValue, categories: newCategories });
      setSavedSearchValue(localSearchValue);
    } else {
      onFiltersUpdate({ categories: newCategories });
    }
  };

  // Gestion du changement des auteurs sélectionnés
  const handleAuthorChange = (newAuthors: string[]) => {
    if (localSearchValue !== savedSearchValue) {
      onFiltersUpdate({ search: localSearchValue, authors: newAuthors });
      setSavedSearchValue(localSearchValue);
    } else {
      onFiltersUpdate({ authors: newAuthors });
    }
  };

  return (
    <div className="space-y-4 w-full mt-8 mb-16">
      {/* Champ de recherche avec bouton */}
      <div className="flex items-center gap-4 w-full">
        <Input
          type="text"
          placeholder="Rechercher..."
          value={localSearchValue}
          onChange={handleSearchInputChange}
          className="w-full"
        />
        <Button
          onClick={handleSearchSubmit}
          size={"icon"}
          disabled={localSearchValue === savedSearchValue}
          className="flex gap-2 items-center px-4 w-auto h-12 bg-blue-700 hover:bg-blue-800 text-white">
          <SearchIcon className="size-4" />
          Rechercher
        </Button>
      </div>
      <div className="space-y-4 lg:space-y-0 lg:flex items-center gap-4 w-full">
        {/* Filtre des catégories */}
        <MultiSelect
          options={categories} // Catégories récupérées localement
          selectedOptions={selectedCategories}
          menuLabel="Catégories"
          placeholder="Filtrer par catégories"
          onChange={handleCategoryChange}
          className="w-full"
        />

        {/* Filtre des auteurs */}
        <MultiSelect
          options={authors.map((author) => author.name)}
          selectedOptions={selectedAuthors}
          menuLabel="Auteurs"
          placeholder="Filtrer par auteurs"
          onChange={handleAuthorChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default BlogFilters;
