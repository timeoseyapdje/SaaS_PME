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
  iconColor = "text-indigo-600",
  iconBg = "bg-indigo-50",
  loading,
  description,
}: KPICardProps) {
  const trend =
    previousValue !== undefined && previousValue !== 0
      ? ((value - previousValue) / Math.abs(previousValue)) * 100
      : undefined;

  if (loading) {
    return (
      <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-background/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-0.5">
      {/* Subtle top gradient line on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/50 transition-colors duration-500" />
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground tracking-tight">{title}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight truncate">
              {formatCompact(value, currency)}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground/80">{description}</p>
            )}
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 shadow-sm group-hover:scale-105 transition-transform duration-300",
              iconBg
            )}
          >
            <Icon className={cn("w-6 h-6", iconColor)} />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <div className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full",
              trend > 0 ? "bg-emerald-500/10" : trend < 0 ? "bg-rose-500/10" : "bg-zinc-500/10"
            )}>
              {trend > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </div>
            <span
              className={cn(
                "text-xs font-semibold tracking-wide",
                trend > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-zinc-500"
              )}
            >
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}% <span className="font-normal text-muted-foreground">vs mois dernier</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
