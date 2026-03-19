"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDaysIcon, UsersIcon, VideoIcon, ClockIcon, MapPinIcon2, PhoneIcon, MailIcon, UserIcon, CheckCircleIcon, EuroSignIcon } from "@/lib/icons";
import { format, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { useConfirmFinalPayment } from "@/features/orders/api/use-confirm-final-payment";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate?: string;
}

interface Stage {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  price: number;
  type: string;
  moniteurs: Array<{
    moniteur: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface Bapteme {
  id: string;
  date: string;
  duration: number;
  places: number;
  categories: string[];
  moniteurs: Array<{
    moniteur: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface StageBooking {
  id: string;
  type: string;
  customer: Customer;
  stage: Stage;
  orderItem: {
    id: string;
    depositAmount: number | null;
    remainingAmount: number | null;
    isFullyPaid: boolean;
    totalPrice: number;
    order: {
      orderNumber: string;
      status: string;
      totalAmount: number;
    };
  };
}

interface BaptemeBooking {
  id: string;
  category: string;
  hasVideo: boolean;
  customer: Customer;
  bapteme: Bapteme;
  orderItem: {
    order: {
      orderNumber: string;
      status: string;
      totalAmount: number;
    };
  };
}

interface ReservationsData {
  stageBookings: StageBooking[];
  baptemeBookings: BaptemeBooking[];
  videoStats: {
    totalVideos: number;
    videosByDate: Record<string, number>;
  };
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
}

interface TodayData {
  stageBookings: StageBooking[];
  baptemeBookings: BaptemeBooking[];
  videoCount: number;
  date: string;
}

export function ReservationsView() {
  const [reservationsData, setReservationsData] = useState<ReservationsData | null>(null);
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null);
  const [paymentNote, setPaymentNote] = useState("");

  const confirmFinalPayment = useConfirmFinalPayment();

  const handleConfirmPayment = async (orderItemId: string) => {
    try {
      await confirmFinalPayment.mutateAsync({
        orderItemId,
        note: paymentNote || undefined,
      });
      setConfirmingPayment(null);
      setPaymentNote("");
      // Rafraîchir les données
      fetchTodayReservations();
      fetchReservations(currentDate);
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };

  const fetchReservations = async (date: Date) => {
    try {
      setLoading(true);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const response = await fetch(`/api/reservations?month=${month}&year=${year}`);
      const result = await response.json();
      
      if (result.success) {
        setReservationsData(result.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayReservations = async () => {
    try {
      const response = await fetch("/api/reservations/today");
      const result = await response.json();
      
      if (result.success) {
        setTodayData(result.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réservations du jour:", error);
    }
  };

  useEffect(() => {
    fetchTodayReservations();
    fetchReservations(currentDate);
  }, [currentDate]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'default';
      case 'PARTIALLY_PAID':
        return 'secondary';
      case 'FULLY_PAID':
        return 'default';
      case 'CONFIRMED':
        return 'secondary';
      case 'PENDING':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Payé';
      case 'PARTIALLY_PAID':
        return 'Acompte payé';
      case 'FULLY_PAID':
        return 'Entièrement payé';
      case 'CONFIRMED':
        return 'Confirmé';
      case 'PENDING':
        return 'En attente';
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'AVENTURE':
        return 'Aventure';
      case 'DUREE':
        return 'Durée';
      case 'LONGUE_DUREE':
        return 'Longue Durée';
      case 'ENFANT':
        return 'Enfant';
      case 'HIVER':
        return 'Hiver';
      default:
        return category;
    }
  };

  if (loading && !reservationsData && !todayData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Réservations</h1>
          <p className="text-muted-foreground">
            Gestion des réservations de stages et baptêmes
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Aujourd&apos;hui</TabsTrigger>
          <TabsTrigger value="monthly">Vue mensuelle</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayData && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Stages aujourd&apos;hui</CardTitle>
                    <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todayData.stageBookings.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Baptêmes aujourd&apos;hui</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todayData.baptemeBookings.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vidéos à prévoir</CardTitle>
                    <VideoIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todayData.videoCount}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Stages du jour */}
                <Card>
                  <CardHeader>
                    <CardTitle>Stages du jour</CardTitle>
                    <CardDescription>
                      {format(new Date(todayData.date), "EEEE d MMMM yyyy", { locale: fr })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {todayData.stageBookings.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Aucun stage prévu aujourd&apos;hui
                      </p>
                    ) : (
                      todayData.stageBookings.map((booking) => {
                        const hasRemainingAmount = booking.orderItem.remainingAmount && booking.orderItem.remainingAmount > 0;
                        const depositPaid = booking.orderItem.depositAmount || 0;
                        const remaining = booking.orderItem.remainingAmount || 0;
                        
                        return (
                        <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={getBadgeVariant(booking.orderItem.order.status)}>
                                {getStatusLabel(booking.orderItem.order.status)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                #{booking.orderItem.order.orderNumber}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatCurrency(booking.orderItem.totalPrice)}
                              </div>
                              {hasRemainingAmount && (
                                <div className="text-xs text-muted-foreground">
                                  Acompte: {formatCurrency(depositPaid)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {hasRemainingAmount && !booking.orderItem.isFullyPaid && (
                            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <EuroSignIcon className="h-4 w-4 text-orange-600" />
                                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                    Reste à payer
                                  </span>
                                </div>
                                <span className="text-lg font-bold text-orange-600">
                                  {formatCurrency(remaining)}
                                </span>
                              </div>
                              <Dialog open={confirmingPayment === booking.orderItem.id} onOpenChange={(open) => !open && setConfirmingPayment(null)}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setConfirmingPayment(booking.orderItem.id)}
                                  >
                                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                                    Confirmer le paiement final
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirmer le paiement final</DialogTitle>
                                    <DialogDescription>
                                      Confirmez que le client a payé le solde de {formatCurrency(remaining)} en physique.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="note">Note (optionnel)</Label>
                                      <Input
                                        id="note"
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                        placeholder="Ex: Payé en espèces"
                                        disabled={confirmFinalPayment.isPending}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setConfirmingPayment(null);
                                          setPaymentNote("");
                                        }}
                                        disabled={confirmFinalPayment.isPending}
                                        className="flex-1"
                                      >
                                        Annuler
                                      </Button>
                                      <Button
                                        onClick={() => handleConfirmPayment(booking.orderItem.id)}
                                        disabled={confirmFinalPayment.isPending}
                                        className="flex-1"
                                      >
                                        {confirmFinalPayment.isPending ? "Confirmation..." : "Confirmer"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {booking.customer.firstName} {booking.customer.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MailIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.customer.phone}</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Durée: {booking.stage.duration} jours
                              </span>
                            </div>
                            <div className="text-sm">
                              <strong>Type:</strong> {booking.stage.type}
                            </div>
                            {booking.stage.moniteurs.length > 0 && (
                              <div className="text-sm">
                                <strong>Moniteurs:</strong>{" "}
                                {booking.stage.moniteurs.map(m => m.moniteur.name).join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                      })
                    )}
                  </CardContent>
                </Card>

                {/* Baptêmes du jour */}
                <Card>
                  <CardHeader>
                    <CardTitle>Baptêmes du jour</CardTitle>
                    <CardDescription>
                      {format(new Date(todayData.date), "EEEE d MMMM yyyy", { locale: fr })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {todayData.baptemeBookings.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Aucun baptême prévu aujourd&apos;hui
                      </p>
                    ) : (
                      todayData.baptemeBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={getBadgeVariant(booking.orderItem.order.status)}>
                                {getStatusLabel(booking.orderItem.order.status)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                #{booking.orderItem.order.orderNumber}
                              </span>
                              {booking.hasVideo && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <VideoIcon className="h-3 w-3" />
                                  Vidéo
                                </Badge>
                              )}
                            </div>
                            <span className="font-medium">
                              {formatCurrency(booking.orderItem.order.totalAmount)}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {booking.customer.firstName} {booking.customer.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MailIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.customer.phone}</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Durée: {booking.bapteme.duration} minutes
                              </span>
                            </div>
                            <div className="text-sm">
                              <strong>Catégorie:</strong> {getCategoryLabel(booking.category)}
                            </div>
                            <div className="text-sm">
                              <strong>Poids:</strong> {booking.customer.weight}kg - 
                              <strong> Taille:</strong> {booking.customer.height}cm
                            </div>
                            {booking.bapteme.moniteurs.length > 0 && (
                              <div className="text-sm">
                                <strong>Moniteurs:</strong>{" "}
                                {booking.bapteme.moniteurs.map(m => m.moniteur.name).join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handlePreviousMonth}>
                Mois précédent
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, "MMMM yyyy", { locale: fr })}
              </h2>
              <Button variant="outline" onClick={handleNextMonth}>
                Mois suivant
              </Button>
            </div>
          </div>

          {reservationsData && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stages</CardTitle>
                    <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reservationsData.stageBookings.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Baptêmes</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reservationsData.baptemeBookings.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vidéos totales</CardTitle>
                    <VideoIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reservationsData.videoStats.totalVideos}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clients uniques</CardTitle>
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Set([
                        ...reservationsData.stageBookings.map(b => b.customer.id),
                        ...reservationsData.baptemeBookings.map(b => b.customer.id)
                      ]).size}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Stages du mois */}
                <Card>
                  <CardHeader>
                    <CardTitle>Stages du mois</CardTitle>
                    <CardDescription>
                      {reservationsData.stageBookings.length} réservation(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {reservationsData.stageBookings.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Aucun stage ce mois-ci
                      </p>
                    ) : (
                      reservationsData.stageBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={getBadgeVariant(booking.orderItem.order.status)}>
                                {getStatusLabel(booking.orderItem.order.status)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                #{booking.orderItem.order.orderNumber}
                              </span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(booking.orderItem.order.totalAmount)}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {format(new Date(booking.stage.startDate), "dd/MM/yyyy", { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {booking.customer.firstName} {booking.customer.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MailIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.customer.phone}</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="text-sm">
                              <strong>Type:</strong> {booking.stage.type} - {booking.stage.duration} jours
                            </div>
                            {booking.stage.moniteurs.length > 0 && (
                              <div className="text-sm">
                                <strong>Moniteurs:</strong>{" "}
                                {booking.stage.moniteurs.map(m => m.moniteur.name).join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Baptêmes du mois */}
                <Card>
                  <CardHeader>
                    <CardTitle>Baptêmes du mois</CardTitle>
                    <CardDescription>
                      {reservationsData.baptemeBookings.length} réservation(s) - {reservationsData.videoStats.totalVideos} vidéo(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {reservationsData.baptemeBookings.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Aucun baptême ce mois-ci
                      </p>
                    ) : (
                      reservationsData.baptemeBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={getBadgeVariant(booking.orderItem.order.status)}>
                                {getStatusLabel(booking.orderItem.order.status)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                #{booking.orderItem.order.orderNumber}
                              </span>
                              {booking.hasVideo && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <VideoIcon className="h-3 w-3" />
                                  Vidéo
                                </Badge>
                              )}
                            </div>
                            <span className="font-medium">
                              {formatCurrency(booking.orderItem.order.totalAmount)}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {format(new Date(booking.bapteme.date), "dd/MM/yyyy à HH:mm", { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {booking.customer.firstName} {booking.customer.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MailIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.customer.phone}</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="text-sm">
                              <strong>Catégorie:</strong> {getCategoryLabel(booking.category)} - {booking.bapteme.duration}min
                            </div>
                            <div className="text-sm">
                              <strong>Poids:</strong> {booking.customer.weight}kg - 
                              <strong> Taille:</strong> {booking.customer.height}cm
                            </div>
                            {booking.bapteme.moniteurs.length > 0 && (
                              <div className="text-sm">
                                <strong>Moniteurs:</strong>{" "}
                                {booking.bapteme.moniteurs.map(m => m.moniteur.name).join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Statistiques vidéo par jour */}
              {Object.keys(reservationsData.videoStats.videosByDate).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vidéos par jour</CardTitle>
                    <CardDescription>
                      Nombre de vidéos à prévoir par jour
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-7">
                      {Object.entries(reservationsData.videoStats.videosByDate).map(([date, count]) => (
                        <div key={date} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">
                            {format(new Date(date), "dd/MM", { locale: fr })}
                          </span>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <VideoIcon className="h-3 w-3" />
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}