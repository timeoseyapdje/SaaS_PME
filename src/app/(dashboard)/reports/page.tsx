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
import { formatCurrency } from "@/lib/currency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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

export default function ReportsPage() {
  const [year, setYear] = useState(String(currentYear));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultatData, setResultatData] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bilanData, setBilanData] = useState<Record<string, any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fiscaliteData, setFiscaliteData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch(`/api/reports?type=resultat&year=${year}`).then((r) => r.json()),
        fetch(`/api/reports?type=bilan&year=${year}`).then((r) => r.json()),
        fetch(`/api/reports?type=fiscalite&year=${year}`).then((r) => r.json()),
      ]);
      setResultatData(r1);
      setBilanData(r2);
      setFiscaliteData(r3);
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
          <TabsList>
            <TabsTrigger value="resultat">Compte de Résultat</TabsTrigger>
            <TabsTrigger value="bilan">Bilan Simplifié</TabsTrigger>
            <TabsTrigger value="fiscalite">Fiscalité</TabsTrigger>
          </TabsList>

          {/* Compte de Résultat */}
          <TabsContent value="resultat">
            {loading ? (
              <div className="h-64 bg-muted/50 animate-pulse rounded-lg mt-4" />
            ) : resultatData ? (
              <div className="space-y-6 mt-4">
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-emerald-500/20 bg-emerald-500/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Revenus</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(
                          (resultatData.totalRevenue as number) || 0
                        )}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-rose-500/20 bg-rose-500/10">
                    <CardContent className="p-4">
                      <p className="text-sm text-rose-600 dark:text-rose-400">Total Dépenses</p>
                      <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(
                          (resultatData.totalExpenses as number) || 0
                        )}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={(resultatData.netProfit as number) >= 0 ? "border-blue-500/20 bg-blue-500/10" : "border-amber-500/20 bg-amber-500/10"}>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Résultat net</p>
                      <p
                        className={`text-2xl font-bold ${
                          (resultatData.netProfit as number) >= 0
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {formatCurrency(
                          (resultatData.netProfit as number) || 0
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly chart */}
                {resultatData.monthlyData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Évolution mensuelle {year}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                          data={
                            resultatData.monthlyData as Array<{
                              month: string;
                              revenus: number;
                              depenses: number;
                            }>
                          }
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) =>
                              v.substring(0, 3).toUpperCase()
                            }
                          />
                          <YAxis
                            tickFormatter={(v) =>
                              `${(v / 1000000).toFixed(1)}M`
                            }
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(v: number) => formatCurrency(v)}
                          />
                          <Bar
                            dataKey="revenus"
                            name="Revenus"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="depenses"
                            name="Dépenses"
                            fill="#f87171"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Expenses breakdown */}
                {resultatData.expensesByCategory && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Dépenses par catégorie
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(
                          resultatData.expensesByCategory as Record<
                            string,
                            number
                          >
                        )
                          .sort(([, a], [, b]) => b - a)
                          .map(([cat, amount]) => {
                            const pct =
                              (resultatData.totalExpenses as number) > 0
                                ? (amount /
                                    (resultatData.totalExpenses as number)) *
                                  100
                                : 0;
                            return (
                              <div key={cat}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-foreground">
                                    {categoryLabels[cat] || cat}
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(amount)} ({pct.toFixed(1)}
                                    %)
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-rose-400 h-2 rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
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

          {/* Bilan */}
          <TabsContent value="bilan">
            {loading ? (
              <div className="h-64 bg-muted/50 animate-pulse rounded-lg mt-4" />
            ) : bilanData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-blue-600 dark:text-blue-400">
                      Actif
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trésorerie</span>
                      <span className="font-medium">
                        {formatCurrency(
                          ((bilanData.assets as Record<string, number>)
                            ?.cash as number) || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Créances clients</span>
                      <span className="font-medium">
                        {formatCurrency(
                          ((bilanData.assets as Record<string, number>)
                            ?.receivables as number) || 0
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total Actif</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {formatCurrency(
                          ((bilanData.assets as Record<string, number>)
                            ?.total as number) || 0
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-rose-600 dark:text-rose-400">
                      Passif
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Dettes fournisseurs
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          ((bilanData.liabilities as Record<string, number>)
                            ?.payables as number) || 0
                        )}
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
                          (((bilanData.liabilities as Record<string, number>)
                            ?.total as number) || 0) +
                            ((bilanData.equity as number) || 0)
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          {/* Fiscalité */}
          <TabsContent value="fiscalite">
            {loading ? (
              <div className="h-64 bg-muted/50 animate-pulse rounded-lg mt-4" />
            ) : fiscaliteData ? (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TVA */}
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
                          {formatCurrency(
                            ((fiscaliteData.tva as Record<string, number>)
                              ?.collectee as number) || 0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">TVA déductible</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(
                            ((fiscaliteData.tva as Record<string, number>)
                              ?.deductible as number) || 0
                          )}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>TVA nette à payer</span>
                        <span
                          className={
                            ((fiscaliteData.tva as Record<string, number>)
                              ?.nette as number) > 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {formatCurrency(
                            ((fiscaliteData.tva as Record<string, number>)
                              ?.nette as number) || 0
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Prochaine échéance:{" "}
                        {new Date(
                          fiscaliteData.prochainEcheanceTVA as string
                        ).toLocaleDateString("fr-FR")}
                      </p>
                    </CardContent>
                  </Card>

                  {/* IS */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        IS - Impôt sur les Sociétés (
                        {(fiscaliteData.is as Record<string, number>)?.taux}%)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base imposable</span>
                        <span className="font-medium">
                          {formatCurrency(
                            ((fiscaliteData.is as Record<string, number>)
                              ?.baseImposable as number) || 0
                          )}
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
                          {formatCurrency(
                            ((fiscaliteData.is as Record<string, number>)
                              ?.estimee as number) || 0
                          )}
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
        </Tabs>
      </div>
    </div>
  );
}
