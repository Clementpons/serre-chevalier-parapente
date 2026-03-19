import { User, Mail, Phone, Weight, Ruler, Calendar, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ParticipantDetailsProps {
  participantData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    weight: number;
    height: number;
    birthDate?: string;
    selectedCategory?: string;
    hasVideo?: boolean;
    selectedStageType?: string;
  };
  type: 'BAPTEME' | 'STAGE';
}

export function ParticipantDetails({ participantData, type }: ParticipantDetailsProps) {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'AVENTURE': 'Baptême Aventure',
      'DUREE': 'Baptême Durée',
      'LONGUE_DUREE': 'Baptême Longue Durée',
      'ENFANT': 'Baptême Enfant',
      'HIVER': 'Baptême Hiver',
      'INITIATION': 'Stage Initiation',
      'PROGRESSION': 'Stage Progression',
      'AUTONOMIE': 'Stage Autonomie',
    };
    return labels[category] || category;
  };

  const formatBirthDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardContent className="p-4 space-y-3">
        <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
          Informations du participant
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Identité */}
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Nom complet</p>
              <p className="font-medium text-slate-800">
                {participantData.firstName} {participantData.lastName}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium text-slate-800 break-all">
                {participantData.email}
              </p>
            </div>
          </div>

          {/* Téléphone */}
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Téléphone</p>
              <p className="font-medium text-slate-800">
                {participantData.phone}
              </p>
            </div>
          </div>

          {/* Poids */}
          <div className="flex items-start gap-2">
            <Weight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Poids</p>
              <p className="font-medium text-slate-800">
                {participantData.weight} kg
              </p>
            </div>
          </div>

          {/* Taille */}
          <div className="flex items-start gap-2">
            <Ruler className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Taille</p>
              <p className="font-medium text-slate-800">
                {participantData.height} cm
              </p>
            </div>
          </div>

          {/* Date de naissance */}
          {participantData.birthDate && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Date de naissance</p>
                <p className="font-medium text-slate-800">
                  {formatBirthDate(participantData.birthDate)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}