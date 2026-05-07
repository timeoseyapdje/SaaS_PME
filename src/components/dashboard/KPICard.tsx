import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { formatCompact } from "@/lib/currency";

interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  currency?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  loading?: boolean;
  description?: string;
}

export function KPICard({
  title,
  value,
  previousValue,
  currency = "XAF",
  icon: Icon,
  iconColor = "text-emerald-600",
  iconBg = "bg-emerald-500/10",
  loading,
  description,
}: KPICardProps) {
  const trend =
    previousValue !== undefined && previousValue !== 0
      ? ((value - previousValue) / Math.abs(previousValue)) * 100
      : undefined;

  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  const footer = trend !== undefined
    ? `${trendPositive ? "+" : ""}${trend.toFixed(1)}% vs mois dernier`
    : description ?? null;

  if (loading) {
    return (
      <Card className="border-border bg-card shadow-sm h-[96px]">
        <CardContent className="p-3.5 h-full flex flex-col justify-between">
          <div className="animate-pulse space-y-2.5">
            <div className="h-2.5 bg-muted rounded w-2/3" />
            <div className="h-5 bg-muted rounded w-1/2" />
            <div className="h-2 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 h-[96px]">
      <CardContent className="p-3.5 h-full flex flex-col justify-between">

        {/* Top row: label + icon */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
            {title}
          </p>
          <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", iconBg)}>
            <Icon className={cn("w-3 h-3", iconColor)} />
          </div>
        </div>

        {/* Value */}
        <p className="text-[20px] font-bold text-foreground tracking-tight leading-none">
          {formatCompact(value, currency)}
        </p>

        {/* Footer: trend or description — always same height */}
        <p className={cn(
          "text-[10px] truncate leading-none",
          trendPositive
            ? "text-emerald-500 font-medium"
            : trendNegative
            ? "text-rose-500 font-medium"
            : "text-muted-foreground"
        )}>
          {footer ?? "—"}
        </p>

      </CardContent>
    </Card>
  );
}
