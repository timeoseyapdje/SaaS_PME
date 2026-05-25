"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Legend,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Download,
  TrendingUp,
  Calculator,
  BarChart3,
  Receipt,
  AlertCircle,
  CalendarClock,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { exportToExcel, exportToCSV } from "@/lib/export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear - 1, currentYear - 2];

const categoryLabels: Record<string, string> = {
  SALAIRES: "Salaires",
  LOYER: "Loyer",
  FOURNITURES: "Fournitures",
  TRANSPORT: "Transport",
  COMMUNICATION: "Communication",
  MARKETING: "Marketing",
  TAXES: "Taxes",
  ASSURANCE: "Assurance",
  MAINTENANCE: "Maintenance",
  FORMATION: "Formation",
  SOUS_TRAITANCE: "Sous-traitance",
  AUTRES: "Autres",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface MonthlyTVARow {
  period: string;
  tvaCollectee: number;
  tvaDeductible: number;
  solde: number;
}

interface TVADetailData {
  tvaRate: number;
  tvaCollectee: number;
  tvaDeductible: number;
  tvaSolde: number;
  monthlyBreakdown: MonthlyTVARow[];
}

interface ISDetailData {
  chiffreAffaires: number;
  chargesDeductibles: number;
  resultatNet: number;
  tauxIS: number;
  isEstime: number;
}

interface WeeklyForecast {
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  entrees: number;
  sorties: number;
  cumulatif: number;
  invoices: Array<{
    id: string;
    number: string;
    client: string;
    amount: number;
    dueDate: string;
  }>;
}

interface CashflowForecastData {
  monthlyExpenseAvg: number;
  weeklyExpenseAvg: number;
  totalExpectedInflows: number;
  rawInflows: Array<{
    id: string;
    number: string;
    client: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
  weeklyData: WeeklyForecast[];
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function SectionSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 bg-muted/50 animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
    </div>
  );
}

// ─── TVA Section ─────────────────────────────────────────────────────────────

function TVASection({ data }: { data: TVADetailData }) {
  const soldePositif = data.tvaSolde >= 0;

  return (
    <div className="space-y-6 mt-4">
      {/* Summary note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Taux TVA Cameroun : <strong>{data.tvaRate}%</strong> — La TVA déductible est estimée
          à {data.tvaRate}% des charges enregistrées. TVA collectée calculée sur les factures
          ENVOYÉES et PAYÉES de l&apos;exercice.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-500/20 bg-blue-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">TVA Collectée</p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(data.tvaCollectee)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sur factures envoyées/payées</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">TVA Déductible</p>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(data.tvaDeductible)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Estimation sur charges (19,25%)</p>
          </CardContent>
        </Card>

        <Card className={soldePositif ? "border-rose-500/20 bg-rose-500/10" : "border-emerald-500/20 bg-emerald-500/10"}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-foreground" />
              <p className="text-sm font-medium text-foreground">TVA à Déclarer</p>
            </div>
            <p className={`text-2xl font-bold ${soldePositif ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {formatCurrency(data.tvaSolde)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {soldePositif ? "Montant dû à l'État" : "Crédit de TVA"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Détail mensuel TVA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Période</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">TVA Collectée</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">TVA Déductible</th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Solde</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyBreakdown.map((row, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4 capitalize">{row.period}</td>
                    <td className="py-2.5 px-4 text-right text-blue-600 dark:text-blue-400 font-medium">
                      {formatCurrency(row.tvaCollectee)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(row.tvaDeductible)}
                    </td>
                    <td className={`py-2.5 pl-4 text-right font-semibold ${row.solde >= 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {formatCurrency(row.solde)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="py-2.5 pr-4">Total</td>
                  <td className="py-2.5 px-4 text-right text-blue-600 dark:text-blue-400">
                    {formatCurrency(data.tvaCollectee)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(data.tvaDeductible)}
                  </td>
                  <td className={`py-2.5 pl-4 text-right ${data.tvaSolde >= 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {formatCurrency(data.tvaSolde)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── IS Section ───────────────────────────────────────────────────────────────

function ISSection({ data }: { data: ISDetailData }) {
  const isPositif = data.resultatNet > 0;

  return (
    <div className="space-y-6 mt-4">
      {/* Formula card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Calcul de l&apos;Impôt sur les Sociétés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {/* CA */}
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Chiffre d&apos;affaires</p>
              <p className="text-xs text-muted-foreground">Factures payées + autres revenus</p>
            </div>
            <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              + {formatCurrency(data.chiffreAffaires)}
            </span>
          </div>

          {/* Charges */}
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Charges déductibles</p>
              <p className="text-xs text-muted-foreground">Total des dépenses enregistrées</p>
            </div>
            <span className="text-lg font-semibold text-rose-600 dark:text-rose-400">
              − {formatCurrency(data.chargesDeductibles)}
            </span>
          </div>

          {/* Résultat net */}
          <div className={`flex items-center justify-between py-3 border-b rounded-md px-3 my-1 ${isPositif ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
            <div>
              <p className="font-bold text-base">Résultat net</p>
              <p className="text-xs text-muted-foreground">CA − Charges</p>
            </div>
            <span className={`text-xl font-bold ${isPositif ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {isPositif ? "+" : ""}{formatCurrency(data.resultatNet)}
            </span>
          </div>

          {/* Taux IS */}
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Taux IS applicable</p>
              <p className="text-xs text-muted-foreground">Régime réel — Cameroun</p>
            </div>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {data.tauxIS}%
            </Badge>
          </div>

          {/* IS estimé */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-bold text-base">IS estimé</p>
              <p className="text-xs text-muted-foreground">
                {isPositif
                  ? `${formatCurrency(data.resultatNet)} × ${data.tauxIS}%`
                  : "Résultat négatif — pas d'IS dû"}
              </p>
            </div>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(data.isEstime)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong>Estimation indicative</strong> — Ce calcul est fourni à titre indicatif uniquement.
          Consultez un expert-comptable agréé pour votre déclaration IS officielle, qui peut
          inclure des abattements, amortissements et régimes spéciaux non pris en compte ici.
          Déclaration à déposer avant le 31 mars de l&apos;année suivante.
        </p>
      </div>
    </div>
  );
}

// ─── Cash Flow Forecast Section ───────────────────────────────────────────────

function CashflowSection({ data }: { data: CashflowForecastData }) {
  const hasInflows = data.totalExpectedInflows > 0;

  // Format week label short for chart axis
  const chartData = data.weeklyData.map((w) => ({
    name: w.weekLabel.replace("Sem. ", "S").split(" (")[0],
    fullLabel: w.weekLabel,
    entrees: Math.round(w.entrees),
    sorties: Math.round(w.sorties),
    cumulatif: Math.round(w.cumulatif),
  }));

  return (
    <div className="space-y-6 mt-4">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-500/20 bg-emerald-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Entrées prévues (90j)</p>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(data.totalExpectedInflows)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.rawInflows.length} facture{data.rawInflows.length !== 1 ? "s" : ""} à encaisser
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-500/20 bg-rose-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">Sorties prévues (90j)</p>
            </div>
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">
              {formatCurrency(data.weeklyExpenseAvg * data.weeklyData.length)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Moy. {formatCurrency(data.monthlyExpenseAvg)}/mois
            </p>
          </CardContent>
        </Card>

        <Card className={data.weeklyData.at(-1)?.cumulatif ?? 0 >= 0 ? "border-blue-500/20 bg-blue-500/10" : "border-amber-500/20 bg-amber-500/10"}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Solde prévisionnel</p>
            </div>
            <p className={`text-2xl font-bold ${(data.weeklyData.at(-1)?.cumulatif ?? 0) >= 0 ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"}`}>
              {formatCurrency(data.weeklyData.at(-1)?.cumulatif ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">À 90 jours (cumulé)</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Flux hebdomadaires — 90 prochains jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasInflows || data.weeklyData.some((w) => w.sorties > 0) ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis
                  yAxisId="bars"
                  tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  yAxisId="line"
                  orientation="right"
                  tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "entrees" ? "Entrées" : name === "sorties" ? "Sorties" : "Cumulatif",
                  ]}
                  labelFormatter={(label) => {
                    const row = chartData.find((d) => d.name === label);
                    return row?.fullLabel ?? label;
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === "entrees" ? "Entrées prévues" : value === "sorties" ? "Sorties estimées" : "Solde cumulatif"
                  }
                />
                <ReferenceLine yAxisId="line" y={0} stroke="#888" strokeDasharray="3 3" />
                <Bar yAxisId="bars" dataKey="entrees" name="entrees" fill="#34d399" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="bars" dataKey="sorties" name="sorties" fill="#f87171" radius={[3, 3, 0, 0]} />
                <Line
                  yAxisId="line"
                  type="monotone"
                  dataKey="cumulatif"
                  name="cumulatif"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
              Aucune donnée de flux disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            Détail semaine par semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Semaine</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Entrées</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Sorties est.</th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Cumulatif</th>
                </tr>
              </thead>
              <tbody>
                {data.weeklyData.map((row, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4 font-medium">{row.weekLabel}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(row.entrees)}
                      {row.invoices.length > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({row.invoices.length})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-600 dark:text-rose-400">
                      {formatCurrency(row.sorties)}
                    </td>
                    <td className={`py-2.5 pl-4 text-right font-semibold ${row.cumulatif >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {formatCurrency(row.cumulatif)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming invoices */}
      {data.rawInflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Factures à encaisser ({data.rawInflows.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">N° Facture</th>
                    <th className="text-left py-2 px-4 font-medium text-muted-foreground">Client</th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Montant</th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Échéance</th>
                    <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rawInflows.map((inv) => {
                    const daysUntil = Math.ceil(
                      (new Date(inv.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 pr-4 font-mono text-xs">{inv.number}</td>
                        <td className="py-2.5 px-4">{inv.client}</td>
                        <td className="py-2.5 px-4 text-right font-semibold">
                          {formatCurrency(inv.amount)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-muted-foreground">
                          {new Date(inv.dueDate).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-2.5 pl-4 text-right">
                          <Badge
                            variant={inv.status === "OVERDUE" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {inv.status === "OVERDUE"
                              ? `En retard`
                              : daysUntil <= 7
                              ? `Dans ${daysUntil}j`
                              : `Dans ${daysUntil}j`}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
        <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Les sorties estimées sont basées sur la moyenne mensuelle des 3 derniers mois de dépenses.
          Les entrées correspondent aux factures ENVOYÉES/EN RETARD dont l&apos;échéance est dans les 90 prochains jours.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [year, setYear] = useState(String(currentYear));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultatData, setResultatData] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bilanData, setBilanData] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fiscaliteData, setFiscaliteData] = useState<Record<string, any> | null>(null);
  const [tvaDetailData, setTvaDetailData] = useState<TVADetailData | null>(null);
  const [isDetailData, setIsDetailData] = useState<ISDetailData | null>(null);
  const [cashflowData, setCashflowData] = useState<CashflowForecastData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        fetch(`/api/reports?type=resultat&year=${year}`).then((r) => r.json()),
        fetch(`/api/reports?type=bilan&year=${year}`).then((r) => r.json()),
        fetch(`/api/reports?type=fiscalite&year=${year}`).then((r) => r.json()),
        fetch(`/api/reports?type=tva-detail&year=${year}`).then((r) => r.json()),
        fetch(`/api/reports?type=is-detail&year=${year}`).then((r) => r.json()),
        fetch(`/api/reports?type=cashflow-forecast&year=${year}`).then((r) => r.json()),
      ]);
      setResultatData(r1);
      setBilanData(r2);
      setFiscaliteData(r3);
      setTvaDetailData(r4 as TVADetailData);
      setIsDetailData(r5 as ISDetailData);
      setCashflowData(r6 as CashflowForecastData);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div>
      <Header title="Rapports financiers" subtitle="Analyse de votre activité" />
      <div className="flex flex-col gap-5">
        {/* Year selector + Export */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Exercice:</span>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {resultatData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter le rapport
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {
                  const data = [];
                  if (resultatData.monthlyData) {
                    for (const m of resultatData.monthlyData as Array<{ month: string; revenus: number; depenses: number }>) {
                      data.push({
                        "Mois": m.month,
                        "Revenus (FCFA)": m.revenus,
                        "Dépenses (FCFA)": m.depenses,
                        "Résultat (FCFA)": m.revenus - m.depenses,
                      });
                    }
                  }
                  if (data.length > 0) exportToExcel(data, `Rapport_${year}`, "Résultat");
                }}>
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const data = [];
                  if (resultatData.monthlyData) {
                    for (const m of resultatData.monthlyData as Array<{ month: string; revenus: number; depenses: number }>) {
                      data.push({
                        "Mois": m.month,
                        "Revenus (FCFA)": m.revenus,
                        "Dépenses (FCFA)": m.depenses,
                        "Résultat (FCFA)": m.revenus - m.depenses,
                      });
                    }
                  }
                  if (data.length > 0) exportToCSV(data, `Rapport_${year}`);
                }}>
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Tabs defaultValue="resultat">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="resultat">Compte de Résultat</TabsTrigger>
            <TabsTrigger value="bilan">Bilan Simplifié</TabsTrigger>
            <TabsTrigger value="fiscalite">Fiscalité</TabsTrigger>
            <TabsTrigger value="tva" className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" />
              Rapport TVA
            </TabsTrigger>
            <TabsTrigger value="is" className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Calcul IS
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Trésorerie 90j
            </TabsTrigger>
          </TabsList>

          {/* ── Compte de Résultat ─────────────────────────────────── */}
          <TabsContent value="resultat">
            {loading ? (
              <SectionSkeleton />
            ) : resultatData ? (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-emerald-500/20 bg-emerald-500/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Revenus</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency((resultatData.totalRevenue as number) || 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-rose-500/20 bg-rose-500/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-rose-600 dark:text-rose-400">Total Dépenses</p>
                      <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency((resultatData.totalExpenses as number) || 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={(resultatData.netProfit as number) >= 0 ? "border-blue-500/20 bg-blue-500/10" : "border-amber-500/20 bg-amber-500/10"}>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Résultat net</p>
                      <p className={`text-2xl font-bold ${(resultatData.netProfit as number) >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {formatCurrency((resultatData.netProfit as number) || 0)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {resultatData.monthlyData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Évolution mensuelle {year}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={resultatData.monthlyData as Array<{ month: string; revenus: number; depenses: number }>}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => v.substring(0, 3).toUpperCase()}
                          />
                          <YAxis
                            tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip formatter={(v: number) => formatCurrency(v)} />
                          <Bar dataKey="revenus" name="Revenus" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="depenses" name="Dépenses" fill="#f87171" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {resultatData.expensesByCategory && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dépenses par catégorie</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(resultatData.expensesByCategory as Record<string, number>)
                          .sort(([, a], [, b]) => b - a)
                          .map(([cat, amount]) => {
                            const pct = (resultatData.totalExpenses as number) > 0
                              ? (amount / (resultatData.totalExpenses as number)) * 100
                              : 0;
                            return (
                              <div key={cat}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-foreground">{categoryLabels[cat] || cat}</span>
                                  <span className="font-medium">
                                    {formatCurrency(amount)} ({pct.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div className="bg-rose-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </TabsContent>

          {/* ── Bilan ───────────────────────────────────────────────── */}
          <TabsContent value="bilan">
            {loading ? (
              <SectionSkeleton />
            ) : bilanData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-blue-600 dark:text-blue-400">Actif</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trésorerie</span>
                      <span className="font-medium">
                        {formatCurrency(((bilanData.assets as Record<string, number>)?.cash as number) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Créances clients</span>
                      <span className="font-medium">
                        {formatCurrency(((bilanData.assets as Record<string, number>)?.receivables as number) || 0)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total Actif</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {formatCurrency(((bilanData.assets as Record<string, number>)?.total as number) || 0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-rose-600 dark:text-rose-400">Passif</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dettes fournisseurs</span>
                      <span className="font-medium">
                        {formatCurrency(((bilanData.liabilities as Record<string, number>)?.payables as number) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capitaux propres</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency((bilanData.equity as number) || 0)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total Passif</span>
                      <span className="text-rose-600 dark:text-rose-400">
                        {formatCurrency(
                          (((bilanData.liabilities as Record<string, number>)?.total as number) || 0) +
                            ((bilanData.equity as number) || 0)
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          {/* ── Fiscalité ───────────────────────────────────────────── */}
          <TabsContent value="fiscalite">
            {loading ? (
              <SectionSkeleton />
            ) : fiscaliteData ? (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        TVA ({(fiscaliteData.tva as Record<string, number>)?.tauxTVA}%)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">TVA collectée</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {formatCurrency(((fiscaliteData.tva as Record<string, number>)?.collectee as number) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">TVA déductible</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(((fiscaliteData.tva as Record<string, number>)?.deductible as number) || 0)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>TVA nette à payer</span>
                        <span className={((fiscaliteData.tva as Record<string, number>)?.nette as number) > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                          {formatCurrency(((fiscaliteData.tva as Record<string, number>)?.nette as number) || 0)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Prochaine échéance:{" "}
                        {new Date(fiscaliteData.prochainEcheanceTVA as string).toLocaleDateString("fr-FR")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        IS - Impôt sur les Sociétés ({(fiscaliteData.is as Record<string, number>)?.taux}%)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base imposable</span>
                        <span className="font-medium">
                          {formatCurrency(((fiscaliteData.is as Record<string, number>)?.baseImposable as number) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taux IS</span>
                        <span className="font-medium">
                          {(fiscaliteData.is as Record<string, number>)?.taux}%
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>IS estimé</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {formatCurrency(((fiscaliteData.is as Record<string, number>)?.estimee as number) || 0)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Déclaration avant le 31 mars de l&apos;année suivante
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
          </TabsContent>

          {/* ── TVA Détaillée ────────────────────────────────────────── */}
          <TabsContent value="tva">
            {loading ? (
              <SectionSkeleton />
            ) : tvaDetailData ? (
              <TVASection data={tvaDetailData} />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm mt-4">
                Aucune donnée TVA disponible
              </div>
            )}
          </TabsContent>

          {/* ── IS Détaillé ──────────────────────────────────────────── */}
          <TabsContent value="is">
            {loading ? (
              <SectionSkeleton />
            ) : isDetailData ? (
              <ISSection data={isDetailData} />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm mt-4">
                Aucune donnée IS disponible
              </div>
            )}
          </TabsContent>

          {/* ── Prévisions Trésorerie ────────────────────────────────── */}
          <TabsContent value="cashflow">
            {loading ? (
              <SectionSkeleton />
            ) : cashflowData ? (
              <CashflowSection data={cashflowData} />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm mt-4">
                Aucune donnée de prévision disponible
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
