"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatCompact } from "@/lib/currency";
import { useTheme } from "next-themes";

interface ChartData {
  month: string;
  revenus: number;
  depenses: number;
}

interface RevenueChartProps {
  data: ChartData[];
  loading?: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-foreground mb-2 capitalize">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name} :</span>
            <span className="font-medium text-foreground">{formatCompact(entry.value)}</span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
            <span className="text-muted-foreground">Résultat :</span>
            <span className={`font-bold ${payload[0].value - payload[1].value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatCompact(payload[0].value - payload[1].value)}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const axisColor = isDark ? "#71717a" : "#94a3b8";
  const axisLineColor = isDark ? "#3f3f46" : "#e2e8f0";
  const cursorFill = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  if (loading) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenus & Dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/40 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Revenus & Dépenses (6 derniers mois)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: axisColor }}
              axisLine={{ stroke: axisLineColor }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCompact(v)}
              tick={{ fontSize: 11, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value) => <span style={{ color: axisColor }}>{value}</span>}
            />
            <Bar dataKey="revenus" name="Revenus" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="depenses" name="Dépenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
