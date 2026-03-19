"use client";

import { useState } from "react";
import { useGetDashboardStats } from "@/features/dashboard/api/use-get-dashboard-stats";
import { useGetMonitorSchedule } from "@/features/dashboard/api/use-get-monitor-schedule";
import { useGetToday } from "@/features/dashboard/api/use-get-today";
import { useCurrent } from "@/features/auth/api/use-current";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  EuroSignIcon,
  CreditCardIcon2,
  TrendingUpIcon,
  MountainIcon2,
  AirplaneIcon,
  CalendarIcon,
  UsersIcon,
  ExternalLinkIcon,
  UserCheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@/lib/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

function ComparisonArrow({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0) return null;
  const diff = current - previous;
  const pct = ((diff / previous) * 100).toFixed(1);
  const isUp = diff >= 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-xs font-medium ${
        isUp ? "text-green-600" : "text-red-500"
      }`}
    >
      {isUp ? (
        <ChevronUpIcon className="h-3 w-3" />
      ) : (
        <ChevronDownIcon className="h-3 w-3" />
      )}
      {Math.abs(Number(pct))}% vs mois préc.
    </span>
  );
}

type Period = 1 | 3 | 6 | 12;

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardStats();
  const { data: scheduleData, isLoading: isLoadingSchedule } =
    useGetMonitorSchedule();
  const { data: todayData } = useGetToday();
  const { data: user } = useCurrent();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>(1);

  const isAdmin = user?.role === "ADMIN";

  const periodData = data?.chart?.byMonth?.slice(-period) ?? [];
  const periodTotal = periodData.reduce((s: number, m: { total: number }) => s + m.total, 0);
  const periodOnline = periodData.reduce((s: number, m: { online: number }) => s + m.online, 0);
  const periodManual = periodData.reduce((s: number, m: { manual: number }) => s + m.manual, 0);

  const kpis = data?.kpis;
  const thisMonth = data?.thisMonth;
  const prevMonth = data?.prevMonth;
  const reservations = data?.reservations;

  const todayStagesCount = todayData?.stages?.length ?? 0;
  const todayBaptemesCount = todayData?.baptemes?.length ?? 0;
  const todayParticipants =
    (todayData?.stages?.reduce((s: number, st: { participants: unknown[] }) => s + st.participants.length, 0) ?? 0) +
    (todayData?.baptemes?.reduce((s: number, b: { participants: unknown[] }) => s + b.participants.length, 0) ?? 0);
  const hasTodayActivities = todayStagesCount > 0 || todayBaptemesCount > 0;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Bienvenue{user?.name ? `, ${user.name}` : ""} — vue d&apos;ensemble de votre école
        </p>
      </div>

      {/* Today Card */}
      {hasTodayActivities && (
        <Card className="border-blue-300 bg-gradient-to-r from-blue-50 to-sky-50">
          <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">
                  {todayStagesCount + todayBaptemesCount} activité
                  {todayStagesCount + todayBaptemesCount !== 1 ? "s" : ""} aujourd&apos;hui
                </p>
                <p className="text-sm text-blue-700">
                  {todayStagesCount} stage{todayStagesCount !== 1 ? "s" : ""} ·{" "}
                  {todayBaptemesCount} baptême{todayBaptemesCount !== 1 ? "s" : ""} ·{" "}
                  {todayParticipants} participant{todayParticipants !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => router.push("/dashboard/today")}
            >
              Voir le détail
              <ExternalLinkIcon className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Grid — Admin only */}
      {kpis && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/dashboard/stages")}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <MountainIcon2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Stages à venir (30j)</p>
                <p className="text-2xl font-bold">{kpis.upcomingStages}</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/dashboard/biplaces")}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <AirplaneIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Baptêmes à venir (30j)</p>
                <p className="text-2xl font-bold">{kpis.upcomingBaptemes}</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/dashboard/reservations")}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Réservations actives</p>
                <p className="text-2xl font-bold">{kpis.activeReservations}</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/dashboard/stagiaires")}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <UserCheckIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total stagiaires</p>
                <p className="text-2xl font-bold">{kpis.totalStagiaires}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <EuroSignIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Soldes en attente</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis.pendingBalance)}</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/dashboard/reservations")}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Nouvelles réservations (24h)</p>
                <p className="text-2xl font-bold">{kpis.recentReservations}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section: Chiffre d'affaires (Admin only) */}
      {isAdmin && data?.chart?.byMonth && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-semibold">Chiffre d&apos;affaires</h3>
            <div className="flex gap-1">
              {([1, 3, 6, 12] as Period[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setPeriod(p)}
                >
                  {p === 1 ? "1M" : p === 3 ? "3M" : p === 6 ? "6M" : "12M"}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Évolution du chiffre d&apos;affaires — {period === 1 ? "ce mois" : `${period} derniers mois`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={periodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="monthLabel"
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `${Number(value).toLocaleString("fr-FR")}€`
                    }
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${Number(value ?? 0).toLocaleString("fr-FR")}€`,
                      name,
                    ]}
                    labelStyle={{ color: "#111" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="stages"
                    stackId="a"
                    fill="#2563eb"
                    name="Stages"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="baptemes"
                    stackId="a"
                    fill="#0ea5e9"
                    name="Baptêmes"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="giftVouchers"
                    stackId="a"
                    fill="#10b981"
                    name="Bons cadeaux"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Period KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">CA Encaissé</p>
                <p className="text-xl font-bold">{formatCurrency(periodTotal)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {period === 1 ? "Ce mois-ci" : `Sur ${period} mois`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">CA en ligne</p>
                <p className="text-xl font-bold">{formatCurrency(periodOnline)}</p>
                <p className="text-xs text-muted-foreground mt-1">Stripe uniquement</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Solde en attente</p>
                <p className="text-xl font-bold">
                  {period === 1 && thisMonth
                    ? formatCurrency(thisMonth.pendingBalance)
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {period === 1 ? "Ce mois-ci" : "Donnée mensuelle uniquement"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Part manuelle</p>
                <p className="text-xl font-bold">{formatCurrency(periodManual)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {periodTotal > 0
                    ? `${((periodManual / periodTotal) * 100).toFixed(0)}% du total`
                    : "0% du total"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Section: Ce mois-ci (Admin only) */}
      {isAdmin && thisMonth && prevMonth && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ce mois-ci</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  CA Vendu
                </CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xl font-bold">
                  {formatCurrency(thisMonth.totalSold)}
                </p>
                <ComparisonArrow
                  current={thisMonth.totalSold}
                  previous={prevMonth.totalSold}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  CA Encaissé
                </CardTitle>
                <EuroSignIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xl font-bold">
                  {formatCurrency(thisMonth.totalCollected)}
                </p>
                <ComparisonArrow
                  current={thisMonth.totalCollected}
                  previous={prevMonth.totalCollected}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  CA en ligne
                </CardTitle>
                <CreditCardIcon2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xl font-bold">
                  {formatCurrency(thisMonth.onlineCollected)}
                </p>
                <ComparisonArrow
                  current={thisMonth.onlineCollected}
                  previous={prevMonth.onlineCollected}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Solde en attente
                </CardTitle>
                <EuroSignIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xl font-bold">
                  {formatCurrency(thisMonth.pendingBalance)}
                </p>
                <ComparisonArrow
                  current={thisMonth.pendingBalance}
                  previous={prevMonth.pendingBalance}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Section: Réservations & Stagiaires (Admin only) */}
      {isAdmin && reservations && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Réservations &amp; Stagiaires</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <MountainIcon2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Réservations stages ce mois</p>
                  <p className="text-2xl font-bold">{reservations.stageBookingsThisMonth}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <AirplaneIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Baptêmes ce mois</p>
                  <p className="text-2xl font-bold">{reservations.baptemeBookingsThisMonth}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <UserCheckIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nouveaux stagiaires</p>
                  <p className="text-2xl font-bold">{reservations.newStagiairesThisMonth}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nouvelles réservations</p>
                  <p className="text-2xl font-bold">{reservations.newReservationsThisMonth}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <UsersIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Places disponibles (30j)</p>
                  <p className="text-2xl font-bold">
                    {reservations.upcomingTotalPlaces - reservations.upcomingReservedPlaces}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      / {reservations.upcomingTotalPlaces}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <TrendingUpIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taux de remplissage</p>
                  <p className="text-2xl font-bold">{reservations.fillRate}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Monitor view — schedule */}
      {!isAdmin && (
        <>
          {/* Daily schedule for monitors */}
          {scheduleData &&
            (scheduleData.stages.length > 0 ||
              scheduleData.baptemes.length > 0) && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <CardTitle>Mes activités du jour</CardTitle>
                    </div>
                    <Badge variant="default" className="text-sm">
                      {format(new Date(), "d MMMM yyyy", { locale: fr })}
                    </Badge>
                  </div>
                  <CardDescription>
                    Vos stages et baptêmes programmés aujourd&apos;hui
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scheduleData.stages.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <MountainIcon2 className="h-4 w-4" />
                        <span>Stages ({scheduleData.stages.length})</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {scheduleData.stages.map((stage) => (
                          <Card key={stage.id} className="bg-background">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">
                                  Stage {stage.type}
                                </CardTitle>
                                <Badge variant="secondary">
                                  <UsersIcon className="h-3 w-3 mr-1" />
                                  {stage.bookingsCount}
                                </Badge>
                              </div>
                              <CardDescription className="text-xs">
                                {stage.duration} jours • Début:{" "}
                                {format(new Date(stage.startDate), "HH:mm", {
                                  locale: fr,
                                })}
                              </CardDescription>
                            </CardHeader>
                            {stage.participants.length > 0 && (
                              <CardContent className="pt-0">
                                <div className="text-xs space-y-1">
                                  <p className="font-medium">Participants:</p>
                                  {stage.participants.map((participant, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between gap-2"
                                    >
                                      <p className="text-muted-foreground truncate">
                                        • {participant.name}
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          router.push(
                                            `/dashboard/reservations/${participant.id}`
                                          )
                                        }
                                      >
                                        <ExternalLinkIcon className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {scheduleData.baptemes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <AirplaneIcon className="h-4 w-4" />
                        <span>Baptêmes ({scheduleData.baptemes.length})</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {scheduleData.baptemes.map((bapteme) => (
                          <Card key={bapteme.id} className="bg-background">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">Baptême</CardTitle>
                                <Badge variant="secondary">
                                  <UsersIcon className="h-3 w-3 mr-1" />
                                  {bapteme.bookingsCount}
                                </Badge>
                              </div>
                              <CardDescription className="text-xs">
                                {bapteme.duration} min • Heure:{" "}
                                {format(new Date(bapteme.date), "HH:mm", {
                                  locale: fr,
                                })}
                              </CardDescription>
                            </CardHeader>
                            {bapteme.participants.length > 0 && (
                              <CardContent className="pt-0">
                                <div className="text-xs space-y-1">
                                  <p className="font-medium">Participants:</p>
                                  {bapteme.participants.map((participant, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between gap-2"
                                    >
                                      <p className="text-muted-foreground truncate">
                                        • {participant.name} ({participant.category})
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          router.push(
                                            `/dashboard/reservations/${participant.id}`
                                          )
                                        }
                                      >
                                        <ExternalLinkIcon className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Empty schedule for monitors */}
          {!isLoadingSchedule &&
            scheduleData &&
            scheduleData.stages.length === 0 &&
            scheduleData.baptemes.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mb-4" />
                  <CardTitle className="text-lg">
                    Pas de stage/baptême aujourd&apos;hui !
                  </CardTitle>
                  <CardDescription>Profitez de votre journée libre</CardDescription>
                </CardContent>
              </Card>
            )}

          {/* Upcoming activities */}
          {scheduleData?.upcoming &&
            (scheduleData.upcoming.nextStage ||
              scheduleData.upcoming.nextBapteme) && (
              <Card className="border-blue-500/50 bg-blue-50/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    <CardTitle>À venir</CardTitle>
                  </div>
                  <CardDescription>
                    Vos prochaines activités programmées
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scheduleData.upcoming.nextStage && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <MountainIcon2 className="h-4 w-4" />
                        <span>Prochain stage</span>
                      </div>
                      <Card className="bg-background">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">
                              Stage {scheduleData.upcoming.nextStage.type}
                            </CardTitle>
                            <Badge variant="secondary">
                              <UsersIcon className="h-3 w-3 mr-1" />
                              {scheduleData.upcoming.nextStage.bookingsCount}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {scheduleData.upcoming.nextStage.duration} jours •
                            Début:{" "}
                            {format(
                              new Date(scheduleData.upcoming.nextStage.startDate),
                              "d MMMM yyyy 'à' HH:mm",
                              { locale: fr }
                            )}
                          </CardDescription>
                        </CardHeader>
                        {scheduleData.upcoming.nextStage.participants.length > 0 && (
                          <CardContent className="pt-0">
                            <div className="text-xs space-y-1">
                              <p className="font-medium">Participants:</p>
                              {scheduleData.upcoming.nextStage.participants.map(
                                (participant, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between gap-2"
                                  >
                                    <p className="text-muted-foreground truncate">
                                      • {participant.name}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/reservations/${participant.id}`
                                        )
                                      }
                                    >
                                      <ExternalLinkIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </div>
                  )}

                  {scheduleData.upcoming.nextBapteme && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <AirplaneIcon className="h-4 w-4" />
                        <span>Prochain baptême</span>
                      </div>
                      <Card className="bg-background">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Baptême</CardTitle>
                            <Badge variant="secondary">
                              <UsersIcon className="h-3 w-3 mr-1" />
                              {scheduleData.upcoming.nextBapteme.bookingsCount}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {scheduleData.upcoming.nextBapteme.duration} min •
                            Heure:{" "}
                            {format(
                              new Date(scheduleData.upcoming.nextBapteme.date),
                              "d MMMM yyyy 'à' HH:mm",
                              { locale: fr }
                            )}
                          </CardDescription>
                        </CardHeader>
                        {scheduleData.upcoming.nextBapteme.participants.length > 0 && (
                          <CardContent className="pt-0">
                            <div className="text-xs space-y-1">
                              <p className="font-medium">Participants:</p>
                              {scheduleData.upcoming.nextBapteme.participants.map(
                                (participant, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between gap-2"
                                  >
                                    <p className="text-muted-foreground truncate">
                                      • {participant.name} ({participant.category})
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/reservations/${participant.id}`
                                        )
                                      }
                                    >
                                      <ExternalLinkIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
        </>
      )}
    </div>
  );
}
