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
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl p-3 text-sm backdrop-blur-xl">
        <p className="font-semibold text-zinc-200 mb-2 capitalize">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 mt-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-zinc-400">{entry.name}:</span>
            <span className="font-medium text-white">{formatCompact(entry.value)}</span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="mt-2 pt-2 border-t border-zinc-700/50 flex items-center gap-2">
            <span className="text-zinc-400">Résultat:</span>
            <span
              className={`font-bold ${
                payload[0].value - payload[1].value >= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
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
  if (loading) {
    return (
      <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Revenus & Dépenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/30 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Revenus & Dépenses (6 derniers mois)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#a1a1aa" }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={{ stroke: "#3f3f46" }}
            />
            <YAxis
              tickFormatter={(v) => formatCompact(v)}
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={{ stroke: "#3f3f46" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
              formatter={(value) => <span style={{ color: "#a1a1aa" }}>{value}</span>}
            />
            <Bar
              dataKey="revenus"
              name="Revenus"
              fill="#34d399"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="depenses"
              name="Dépenses"
              fill="#fb7185"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
