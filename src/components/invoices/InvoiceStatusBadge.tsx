import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InvoiceStatus } from "@/types";

const statusConfig: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Brouillon",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  SENT: {
    label: "Envoyée",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  PAID: {
    label: "Payée",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  OVERDUE: {
    label: "En retard",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-gray-100 text-gray-400 border-gray-200 line-through",
  },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status] || statusConfig.DRAFT;
  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-xs", config.className)}
    >
      {config.label}
    </Badge>
  );
}
