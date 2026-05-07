import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
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

  if (loading) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-3 bg-muted rounded w-2/3" />
            <div className="h-7 bg-muted rounded w-1/2" />
            <div className="h-2.5 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <Card className="group relative overflow-hidden border-border bg-card shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-200 h-full">
      {/* Top accent bar on hover */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/50 transition-colors duration-300" />

      <CardContent className="p-4 flex flex-col gap-3 h-full">
        {/* Row: title + icon */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight flex-1 min-w-0">
            {title}
          </p>
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
              iconBg
            )}
          >
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
        </div>

        {/* Value */}
        <p className="text-[22px] font-bold text-foreground tracking-tight leading-none">
          {formatCompact(value, currency)}
        </p>

        {/* Bottom: trend OR description */}
        <div className="mt-auto">
          {trend !== undefined ? (
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex items-center justify-center w-4 h-4 rounded-full",
                  trendPositive
                    ? "bg-emerald-500/10"
                    : trendNegative
                    ? "bg-rose-500/10"
                    : "bg-muted"
                )}
              >
                {trendPositive ? (
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                ) : trendNegative ? (
                  <TrendingDown className="w-2.5 h-2.5 text-rose-500" />
                ) : (
                  <Minus className="w-2.5 h-2.5 text-muted-foreground" />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  trendPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : trendNegative
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground"
                )}
              >
                {trendPositive ? "+" : ""}
                {trend.toFixed(1)}%
              </span>
              <span className="text-[11px] text-muted-foreground">vs mois dernier</span>
            </div>
          ) : description ? (
            <p className="text-[11px] text-muted-foreground leading-tight">{description}</p>
          ) : (
            /* placeholder to keep consistent height */
            <div className="h-4" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
