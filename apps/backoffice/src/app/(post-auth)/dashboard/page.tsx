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
  MountainIcon2,
  AirplaneIcon,
  CalendarIcon,
  UsersIcon,
  ExternalLinkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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

const formatPct = (value: number, total: number) =>
  total > 0 ? `${((value / total) * 100).toFixed(0)}%` : "0%";

function FillRateBar({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-amber-400" : "bg-slate-300";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums w-8 text-right">{rate}%</span>
    </div>
  );
}

type Period = 1 | 3 | 6 | 12;

function getMonthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

function navigateMonth(ym: string, direction: -1 | 1): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + direction, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);
  const [period, setPeriod] = useState<Period>(12);

  const { data, isLoading } = useGetDashboardStats(selectedMonth);
  const { data: scheduleData, isLoading: isLoadingSchedule } = useGetMonitorSchedule();
  const { data: todayData } = useGetToday();
  const { data: user } = useCurrent();
  const router = useRouter();

  const isAdmin = user?.role === "ADMIN";

  const annualStats = data?.annualStats;
  const smStats = data?.selectedMonthStats;
  const smActivities = data?.selectedMonthActivities;

  const periodData = data?.chart?.byMonth?.slice(-period) ?? [];

  const todayStagesCount = todayData?.stages?.length ?? 0;
  const todayBaptemesCount = todayData?.baptemes?.length ?? 0;
  const todayParticipants =
    (todayData?.stages?.reduce(
      (s: number, st: { participants: unknown[] }) => s + st.participants.length,
      0
    ) ?? 0) +
    (todayData?.baptemes?.reduce(
      (s: number, b: { participants: unknown[] }) => s + b.participants.length,
      0
    ) ?? 0);
  const hasTodayActivities = todayStagesCount > 0 || todayBaptemesCount > 0;

  const [smYear, smMonth] = selectedMonth.split("-").map(Number);
  const smLabel = getMonthLabel(smYear, smMonth);
  const isCurrentMonth = selectedMonth === currentYearMonth();

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
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

      {/* ── Saison + Graphique côte à côte (Admin only) ─────────────────────── */}
      {isAdmin && annualStats && data?.chart?.byMonth && (
        <div className="grid gap-5 xl:grid-cols-[380px_1fr]">

          {/* ── Carte Saison ── */}
          <Card className="bg-sidebar text-sidebar-foreground flex flex-col">
            <CardHeader className="pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white">
                  Saison {annualStats.year}
                </CardTitle>
                <Badge className="bg-white/15 text-white/90 text-xs border-0">
                  {annualStats.totalReservations} résa
                  <span className="opacity-60 ml-1">
                    · {annualStats.uniqueStagiaires} stagiaires
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4 flex-1">

              {/* CA hero */}
              <div>
                <p className="text-xs text-white/50 font-medium uppercase tracking-wide mb-0.5">
                  Chiffre d&apos;affaires total
                </p>
                <p className="text-4xl font-extrabold text-white tabular-nums">
                  {formatCurrency(annualStats.totalCA)}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  encaissé + soldes en attente
                </p>
              </div>

              {/* Barre encaissé / en attente */}
              {annualStats.totalCA > 0 && (
                <div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
                    <div
                      className="bg-blue-400"
                      style={{
                        width: formatPct(annualStats.totalCollected, annualStats.totalCA),
                      }}
                    />
                    <div
                      className="bg-amber-400"
                      style={{
                        width: formatPct(annualStats.totalPending, annualStats.totalCA),
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/50 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                      Encaissé {formatCurrency(annualStats.totalCollected)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                      En attente {formatCurrency(annualStats.totalPending)}
                    </span>
                  </div>
                </div>
              )}

              {/* Répartition par produit */}
              <div className="space-y-2.5">
                {(
                  [
                    {
                      key: "stages" as const,
                      label: "Stages",
                      icon: <MountainIcon2 className="h-3.5 w-3.5" />,
                      barColor: "bg-blue-400",
                      pendingColor: "bg-blue-900",
                    },
                    {
                      key: "baptemes" as const,
                      label: "Baptêmes",
                      icon: <AirplaneIcon className="h-3.5 w-3.5" />,
                      barColor: "bg-sky-400",
                      pendingColor: "bg-sky-900",
                    },
                    {
                      key: "giftVouchers" as const,
                      label: "Bons cadeaux",
                      icon: <EuroSignIcon className="h-3.5 w-3.5" />,
                      barColor: "bg-emerald-400",
                      pendingColor: "bg-emerald-900",
                    },
                  ] as const
                ).map(({ key, label, icon, barColor, pendingColor }) => {
                  const p = annualStats.byProduct[key];
                  if (p.totalCA === 0) return null;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-white/60">
                          {icon} {label}
                        </span>
                        <span className="font-semibold tabular-nums text-white">
                          {formatCurrency(p.totalCA)}{" "}
                          <span className="font-normal text-white/40">
                            ({formatPct(p.totalCA, annualStats.totalCA)})
                          </span>
                        </span>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
                        <div
                          className={barColor}
                          style={{ width: formatPct(p.collected, p.totalCA) }}
                        />
                        {p.pending > 0 && (
                          <div
                            className={pendingColor}
                            style={{ width: formatPct(p.pending, p.totalCA) }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Acomptes / soldes versés / en attente */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-white/50 leading-tight">Acomptes</p>
                  <p className="text-sm font-bold tabular-nums text-white mt-0.5">
                    {formatCurrency(annualStats.depositsPaid)}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {formatPct(annualStats.depositsPaid, annualStats.totalCollected)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 leading-tight">Soldes versés</p>
                  <p className="text-sm font-bold tabular-nums text-white mt-0.5">
                    {formatCurrency(Math.max(0, annualStats.balancesPaid))}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {formatPct(Math.max(0, annualStats.balancesPaid), annualStats.totalCollected)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 leading-tight">En attente</p>
                  <p className="text-sm font-bold tabular-nums text-amber-400 mt-0.5">
                    {formatCurrency(annualStats.totalPending)}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {formatPct(annualStats.totalPending, annualStats.totalCA)}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* ── Graphique ── */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base font-semibold">Évolution du CA</CardTitle>
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
              <CardDescription className="text-xs">
                Encaissé par produit + soldes en attente
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
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
                    tickFormatter={(value) => `${Number(value).toLocaleString("fr-FR")}€`}
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
                  <Bar dataKey="stages" stackId="a" fill="#2563eb" name="Stages" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="baptemes" stackId="a" fill="#0ea5e9" name="Baptêmes" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="giftVouchers" stackId="a" fill="#10b981" name="Bons cadeaux" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pendingBalance" stackId="a" fill="#f59e0b" name="Soldes en attente" radius={[4, 4, 0, 0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      )}

      {/* ── Section mensuelle CA (Admin only) ───────────────────────────────── */}
      {isAdmin && smStats && (
        <div className="space-y-3">
          {/* Header avec navigation */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-lg font-semibold capitalize">{smLabel}</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSelectedMonth((m) => navigateMonth(m, -1))}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              {!isCurrentMonth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setSelectedMonth(currentYearMonth())}
                >
                  Aujourd&apos;hui
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSelectedMonth((m) => navigateMonth(m, 1))}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-200 bg-blue-50/40">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">CA total du mois</p>
                <p className="text-2xl font-bold">{formatCurrency(smStats.totalCA)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  encaissé + soldes en attente
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Encaissé</p>
                <p className="text-2xl font-bold">{formatCurrency(smStats.totalCollected)}</p>
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                  <span>En ligne : {formatCurrency(smStats.onlineCollected)}</span>
                  <span>·</span>
                  <span>Manuel : {formatCurrency(smStats.manualCollected)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Soldes en attente</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(smStats.totalPending)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPct(smStats.totalPending, smStats.totalCA)} du CA du mois
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Réservations</p>
                <p className="text-2xl font-bold">{smStats.totalReservations}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {smStats.uniqueStagiaires} stagiaires uniques
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Répartition par produit du mois */}
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                {
                  key: "stages" as const,
                  label: "Stages",
                  icon: <MountainIcon2 className="h-4 w-4" />,
                  color: "text-blue-600",
                  bg: "bg-blue-100",
                },
                {
                  key: "baptemes" as const,
                  label: "Baptêmes",
                  icon: <AirplaneIcon className="h-4 w-4" />,
                  color: "text-sky-600",
                  bg: "bg-sky-100",
                },
                {
                  key: "giftVouchers" as const,
                  label: "Bons cadeaux",
                  icon: <EuroSignIcon className="h-4 w-4" />,
                  color: "text-emerald-600",
                  bg: "bg-emerald-100",
                },
              ] as const
            ).map(({ key, label, icon, color, bg }) => {
              const p = smStats.byProduct[key];
              if (p.totalCA === 0) return null;
              return (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} ${color}`}
                      >
                        {icon}
                      </div>
                      <p className="text-sm font-medium">{label}</p>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(p.totalCA)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPct(p.totalCA, smStats.totalCA)} du total mensuel
                    </p>
                    {p.pending > 0 && (
                      <p className="text-xs text-amber-600 mt-0.5">
                        {formatCurrency(p.pending)} en attente
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section remplissage mensuel (Admin only) ──────────────────────── */}
      {isAdmin && smActivities && (() => {
        const mStages = smActivities.stages as { places: number; bookingsCount: number }[];
        const mBaptemes = smActivities.baptemes as { places: number; bookingsCount: number }[];
        const mStagesTotalPlaces = mStages.reduce((s, st) => s + st.places, 0);
        const mStagesReserved = mStages.reduce((s, st) => s + st.bookingsCount, 0);
        const mStagesRate = mStagesTotalPlaces > 0 ? Math.round((mStagesReserved / mStagesTotalPlaces) * 100) : 0;
        const mBaptTotalPlaces = mBaptemes.reduce((s, b) => s + b.places, 0);
        const mBaptReserved = mBaptemes.reduce((s, b) => s + b.bookingsCount, 0);
        const mBaptRate = mBaptTotalPlaces > 0 ? Math.round((mBaptReserved / mBaptTotalPlaces) * 100) : 0;
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-lg font-semibold">
                Remplissage —{" "}
                <span className="capitalize">
                  {getMonthLabel(smActivities.year, smActivities.month)}
                </span>
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Stages du mois */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <MountainIcon2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">Stages — mois</p>
                  </div>
                  <p className="text-2xl font-bold">{mStagesRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mStagesReserved}/{mStagesTotalPlaces} places · {mStages.length} créneau{mStages.length !== 1 ? "x" : ""}
                  </p>
                  <div className="mt-2">
                    <FillRateBar rate={mStagesRate} />
                  </div>
                </CardContent>
              </Card>

              {/* Baptêmes du mois */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                      <AirplaneIcon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">Baptêmes — mois</p>
                  </div>
                  <p className="text-2xl font-bold">{mBaptRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mBaptReserved}/{mBaptTotalPlaces} places · {mBaptemes.length} créneau{mBaptemes.length !== 1 ? "x" : ""}
                  </p>
                  <div className="mt-2">
                    <FillRateBar rate={mBaptRate} />
                  </div>
                </CardContent>
              </Card>

              {/* Stages saison */}
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-400">
                      <MountainIcon2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Stages — saison</p>
                  </div>
                  <p className="text-2xl font-bold">{smActivities.seasonFillRate.stages.rate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {smActivities.seasonFillRate.stages.reservedPlaces}/
                    {smActivities.seasonFillRate.stages.totalPlaces} places
                  </p>
                  <div className="mt-2">
                    <FillRateBar rate={smActivities.seasonFillRate.stages.rate} />
                  </div>
                </CardContent>
              </Card>

              {/* Baptêmes saison */}
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-400">
                      <AirplaneIcon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Baptêmes — saison</p>
                  </div>
                  <p className="text-2xl font-bold">{smActivities.seasonFillRate.baptemes.rate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {smActivities.seasonFillRate.baptemes.reservedPlaces}/
                    {smActivities.seasonFillRate.baptemes.totalPlaces} places
                  </p>
                  <div className="mt-2">
                    <FillRateBar rate={smActivities.seasonFillRate.baptemes.rate} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })()}

      {/* ── Vue moniteur ──────────────────────────────────────────────────── */}
      {!isAdmin && (
        <>
          {scheduleData &&
            (scheduleData.stages.length > 0 || scheduleData.baptemes.length > 0) && (
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
                                <CardTitle className="text-sm">Stage {stage.type}</CardTitle>
                                <Badge variant="secondary">
                                  <UsersIcon className="h-3 w-3 mr-1" />
                                  {stage.bookingsCount}
                                </Badge>
                              </div>
                              <CardDescription className="text-xs">
                                {stage.duration} jours • Début :{" "}
                                {format(new Date(stage.startDate), "HH:mm", { locale: fr })}
                              </CardDescription>
                            </CardHeader>
                            {stage.participants.length > 0 && (
                              <CardContent className="pt-0">
                                <div className="text-xs space-y-1">
                                  <p className="font-medium">Participants :</p>
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
                                {bapteme.duration} min • Heure :{" "}
                                {format(new Date(bapteme.date), "HH:mm", { locale: fr })}
                              </CardDescription>
                            </CardHeader>
                            {bapteme.participants.length > 0 && (
                              <CardContent className="pt-0">
                                <div className="text-xs space-y-1">
                                  <p className="font-medium">Participants :</p>
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

          {scheduleData?.upcoming &&
            (scheduleData.upcoming.nextStage || scheduleData.upcoming.nextBapteme) && (
              <Card className="border-blue-500/50 bg-blue-50/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    <CardTitle>À venir</CardTitle>
                  </div>
                  <CardDescription>Vos prochaines activités programmées</CardDescription>
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
                            {scheduleData.upcoming.nextStage.duration} jours •{" "}
                            {format(
                              new Date(scheduleData.upcoming.nextStage.startDate),
                              "d MMMM yyyy",
                              { locale: fr }
                            )}
                          </CardDescription>
                        </CardHeader>
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
                            {format(
                              new Date(scheduleData.upcoming.nextBapteme.date),
                              "d MMMM yyyy",
                              { locale: fr }
                            )}
                          </CardDescription>
                        </CardHeader>
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
