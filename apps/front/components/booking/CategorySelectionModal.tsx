'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useBaptemePrices } from '@/hooks/useBaptemePrices';

interface BaptemeCategory {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface CategorySelectionModalProps {
  type: 'stage' | 'bapteme';
  stageType?: 'INITIATION' | 'PROGRESSION' | 'AUTONOMIE';
  preselectedCategory?: 'AVENTURE' | 'DUREE' | 'LONGUE_DUREE' | 'ENFANT' | 'HIVER';
  onClose: () => void;
  onContinue: (selection: {
    category?: string;
    year: number;
    month: number;
  }) => void;
}

const BAPTEME_CATEGORIES: BaptemeCategory[] = [
  {
    id: 'AVENTURE',
    name: 'Baptême Aventure',
    price: 110,
    description: 'Vivez votre baptême aérien : liberté, frissons et vue imprenable. 15 minutes de vol.'
  },
  {
    id: 'DUREE',
    name: 'Baptême Durée',
    price: 150,
    description: 'Plus long, plus haut, plus fort. Adrénaline garantie. 30 minutes de vol.'
  },
  {
    id: 'LONGUE_DUREE',
    name: 'Baptême Longue Durée',
    price: 185,
    description: 'Plus on reste dans le ciel, plus le plaisir grandit. 45 minutes de vol.'
  },
  {
    id: 'ENFANT',
    name: 'Baptême Enfant',
    price: 90,
    description: 'Pour les p\'tits loups dans l\'aventure et la montagne. 10 minutes de vol.'
  },
  {
    id: 'HIVER',
    name: 'Baptême Hiver',
    price: 130,
    description: 'Les sommets enneigés à perte de vue, en toute liberté.'
  }
];

const MONTHS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' }
];

export function CategorySelectionModal({
  type,
  stageType,
  preselectedCategory,
  onClose,
  onContinue
}: CategorySelectionModalProps) {
  const { getPrice: getBaptemePrice, videoOptionPrice, loading: pricesLoading } = useBaptemePrices();
  const [selectedCategory, setSelectedCategory] = useState<string>(preselectedCategory || '');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<{ year: number; count: number }[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{ month: number; count: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les périodes disponibles quand la catégorie change
  useEffect(() => {
    if ((type === 'bapteme' && selectedCategory) || type === 'stage') {
      loadAvailablePeriods();
    } else if (type === 'bapteme' && !selectedCategory) {
      // Reset si pas de catégorie sélectionnée
      setAvailableYears([]);
      setAvailableMonths([]);
      setSelectedYear(null);
      setSelectedMonth(null);
    }
  }, [selectedCategory, type, stageType]);

  // Charger les mois disponibles quand l'année change
  useEffect(() => {
    if (selectedYear && availableYears.length > 0) {
      loadAvailableMonths();
    }
  }, [selectedYear]);

  const loadAvailablePeriods = async () => {
    try {
      setLoading(true);
      console.log('Loading periods for:', { type, category: selectedCategory, stageType });

      const params = new URLSearchParams({ type });
      if (selectedCategory) params.set('category', selectedCategory);
      if (stageType) params.set('stageType', stageType);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/availability/periods?${params}`,
        {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Periods response:', data);
        if (data.success) {
          setAvailableYears(data.data.years || []);
          
          // Si une seule année disponible, la sélectionner automatiquement
          if (data.data.years && data.data.years.length === 1) {
            setSelectedYear(data.data.years[0].year);
          } else {
            setSelectedYear(null);
            setSelectedMonth(null);
          }
        } else {
          console.error('API error:', data.message);
        }
      } else {
        console.error('HTTP error:', response.status);
      }
    } catch (error) {
      console.error('Erreur chargement périodes disponibles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMonths = async () => {
    if (!selectedYear) return;

    try {
      const params = new URLSearchParams({ type });
      if (selectedCategory) params.set('category', selectedCategory);
      if (stageType) params.set('stageType', stageType);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/availability/periods?${params}`,
        {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const monthsForYear = data.data.monthsByYear[selectedYear] || [];
          setAvailableMonths(monthsForYear);
          
          // Si un seul mois disponible, le sélectionner automatiquement
          if (monthsForYear.length === 1) {
            setSelectedMonth(monthsForYear[0].month);
          } else {
            setSelectedMonth(null);
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement mois disponibles:', error);
    }
  };

  const handleContinue = () => {
    if (!selectedYear || !selectedMonth) return;
    if (type === 'bapteme' && !selectedCategory) return;

    onContinue({
      category: selectedCategory,
      year: selectedYear,
      month: selectedMonth
    });
  };

  const getSelectedCategoryInfo = () => {
    if (type === 'stage') return null;
    return BAPTEME_CATEGORIES.find(cat => cat.id === selectedCategory);
  };

  const canContinue = () => {
    if (type === 'stage') return selectedYear && selectedMonth;
    return selectedCategory && selectedYear && selectedMonth;
  };

  const getMonthLabel = (month: number) => {
    return MONTHS.find(m => m.value === month)?.label || `Mois ${month}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {type === 'stage'
              ? `Réserver un stage ${stageType}`
              : 'Réserver un baptême'
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection de catégorie pour les baptêmes */}
          {type === 'bapteme' && (
            <div className="space-y-3">
              <Label className="font-semibold text-lg">Type de baptême</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedYear(null);
                  setSelectedMonth(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type de baptême" />
                </SelectTrigger>
                <SelectContent>
                  {BAPTEME_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} - {pricesLoading ? '…' : `${getBaptemePrice(category.id)}€`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Div de présentation de la catégorie sélectionnée */}
          {type === 'bapteme' && (
            <Card>
              <CardContent className="p-4">
                {selectedCategory ? (
                  <div>
                    <h3 className="font-semibold text-lg text-blue-600">
                      {getSelectedCategoryInfo()?.name}
                    </h3>
                    <div className="flex justify-between items-start mt-2">
                      <p className="text-sm text-gray-600 flex-1 mr-4">
                        {getSelectedCategoryInfo()?.description}
                      </p>
                      <div className="text-right">
                        <p className="font-bold text-xl text-blue-600">
                          {pricesLoading ? (
                            <span className="inline-block w-14 h-6 bg-slate-200 animate-pulse rounded" />
                          ) : `${getBaptemePrice(selectedCategory)}€`}
                        </p>
                        <p className="text-xs text-gray-500">
                          + Option vidéo : {pricesLoading ? (
                            <span className="inline-block w-8 h-3 bg-slate-200 animate-pulse rounded align-middle" />
                          ) : `${videoOptionPrice}€`}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Veuillez sélectionner un type de baptême</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Selects pour année et mois */}
          {((type === 'bapteme' && selectedCategory) || type === 'stage') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sélection d'année */}
              <div className="space-y-2">
                <Label className="font-semibold">Année</Label>
                {loading ? (
                  <div className="flex items-center justify-center py-2 border rounded">
                    <Clock className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">Chargement...</span>
                  </div>
                ) : (
                  <Select
                    value={selectedYear?.toString() || ''}
                    onValueChange={(value) => {
                      setSelectedYear(parseInt(value));
                      setSelectedMonth(null);
                    }}
                    disabled={availableYears.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une année" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((yearData) => (
                        <SelectItem key={yearData.year} value={yearData.year.toString()}>
                          {yearData.year} - {yearData.count} créneau{yearData.count > 1 ? 'x' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Sélection de mois */}
              <div className="space-y-2">
                <Label className="font-semibold">Mois</Label>
                <Select
                  value={selectedMonth?.toString() || ''}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  disabled={!selectedYear || availableMonths.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un mois" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((monthData) => (
                      <SelectItem key={monthData.month} value={monthData.month.toString()}>
                        {getMonthLabel(monthData.month)} - {monthData.count} créneau{monthData.count > 1 ? 'x' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Récapitulatif final */}
          {canContinue() && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold mb-2 text-green-800">Récapitulatif de votre sélection</h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {getSelectedCategoryInfo()?.name || `Stage ${stageType}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getMonthLabel(selectedMonth!)} {selectedYear}
                  </p>
                </div>
                {getSelectedCategoryInfo() && (
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      {pricesLoading ? (
                        <span className="inline-block w-14 h-5 bg-green-200 animate-pulse rounded" />
                      ) : `${getBaptemePrice(selectedCategory)}€`}
                    </p>
                    <p className="text-xs text-gray-500">
                      + Option vidéo : {pricesLoading ? (
                        <span className="inline-block w-8 h-3 bg-slate-200 animate-pulse rounded align-middle" />
                      ) : `${videoOptionPrice}€`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!canContinue() || loading}
              className="flex-1 gap-2"
            >
              Voir les créneaux disponibles
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}