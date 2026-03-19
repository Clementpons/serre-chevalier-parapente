"use client";

import CopyTextComponent from "@/components/copy-text-component";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetStageById } from "@/features/stages/api/use-get-stage";
// import { useGetStageById } from "@/features/stages/api/use-get-stage"
import { calculateAge, formatDate } from "@/lib/utils";
import {
  CalendarIcon,
  SadIcon,
  RefreshIcon,
  MailIcon,
  MapPinIcon2,
  PhoneIcon,
  RulerIcon2,
  UserIcon,
  WeightIcon2,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from "@/lib/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

const stageTypeLabels = {
  NONE: "Non défini",
  INITIATION: "Initiation",
  PROGRESSION: "Progression",
  AUTONOMIE: "Autonomie",
  DOUBLE: "Double",
};

const bookingTypeLabels = {
  INITIATION: "Initiation",
  PROGRESSION: "Progression",
  AUTONOMIE: "Autonomie",
};

export default function StageDetails({ id }: { id: string }) {
  const { data: stage, isLoading, error } = useGetStageById(id);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <RefreshIcon className="h-4 w-4 animate-spin" />
          <span>Chargement des détails du stage...</span>
        </div>
      </div>
    );
  }

  if (error || !stage) {
    return (
      <div className="bg-slate-50 text-slate-800 rounded-lg p-8 flex flex-col items-center justify-center border border-slate-200 gap-4">
        <SadIcon className="h-12 w-12 text-slate-400" />
        <div className="flex flex-col items-center text-center">
          <h3 className="font-semibold text-lg">Aucun stage trouvé</h3>
          <p className="text-slate-600 mb-2">
            Impossible de récupérer les informations du stage.
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Ceci peut être dû à une erreur de connexion avec la base de données.
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              router.refresh();
            }}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            Rafraîchir la page
          </Button>
        </div>
      </div>
    );
  }

  const availablePlaces = stage.places - stage.bookings.length;
  const isFullyBooked = availablePlaces <= 0;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <Link
        href="/dashboard/stages"
        className="mb-4 inline-block text-sm text-blue-600 hover:underline"
      >
        <Button variant="link" className="p-0">
          &larr; Retour à la liste des stages
        </Button>
      </Link>
      {/* En-tête du stage */}
      <Card className="bg-slate-950 text-white">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                Stage de Parapente
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant={"default"}
                  className="text-slate-950 bg-white hover:bg-white"
                >
                  {stageTypeLabels[stage.type]}
                </Badge>
                <Badge variant={"outline"} className="text-white">
                  {new Date(stage.startDate).getFullYear()}
                </Badge>
                <div className="flex items-center text-slate-50/50">
                  <span className="text-xs text-slate-50/50">
                    ID : {stage.id}
                  </span>
                  <CopyTextComponent text={stage.id} className="ml-2" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <UsersIcon className="h-4 w-4" />
                <span className="font-medium">
                  {stage.bookings.length}/{stage.places} places
                </span>
              </div>
              {isFullyBooked ? (
                <Badge variant="destructive">
                  <AlertTriangleIcon className="h-3 w-3 mr-1" />
                  Complet
                </Badge>
              ) : (
                <Badge variant="outline" className="text-white">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  {availablePlaces} place{availablePlaces > 1 ? "s" : ""}{" "}
                  disponible{availablePlaces > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Début:</span>
              <span>{formatDate(new Date(stage.startDate))}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Créé le:</span>
              <span>{formatDate(new Date(stage.createdAt))}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Fin:</span>
              <span>{(() => {
                const startDate = new Date(stage.startDate);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + stage.duration);
                return formatDate(endDate);
              })()}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Modifié le:</span>
              <span>{formatDate(new Date(stage.updatedAt))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des réservations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Réservations ({stage.bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stage.bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune réservation pour ce stage</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stage.bookings.map((booking, index) => (
                <div key={booking.id}>
                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {booking.stagiaire.firstName.charAt(0)}
                        {booking.stagiaire.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {booking.stagiaire.firstName}{" "}
                            {booking.stagiaire.lastName}
                          </h4>
                          <Badge
                            variant="default"
                            className="mt-1"
                          >
                            {bookingTypeLabels[booking.type]}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>
                            Réservé le {formatDate(new Date(booking.createdAt))}
                          </p>
                          {booking.updatedAt !== booking.createdAt && (
                            <p>
                              Modifié le{" "}
                              {formatDate(new Date(booking.updatedAt))}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MailIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.stagiaire.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.stagiaire.phone}</span>
                          </div>
                          {booking.stagiaire.birthDate && (
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {calculateAge(
                                  new Date(booking.stagiaire.birthDate)
                                )}{" "}
                                ans
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <WeightIcon2 className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.stagiaire.weight} kg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RulerIcon2 className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.stagiaire.height} cm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < stage.bookings.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
