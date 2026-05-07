import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InvoiceStatus } from "@/types";

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  DRAFT: {
    label: "Brouillon",
    className: "bg-muted text-muted-foreground border-border",
  },
  SENT: {
    label: "Envoyée",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  PAID: {
    label: "Payée",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  OVERDUE: {
    label: "En retard",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-muted text-muted-foreground border-border line-through",
  },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status] || statusConfig.DRAFT;
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
