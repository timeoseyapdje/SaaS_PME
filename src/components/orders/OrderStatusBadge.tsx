import { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING:    { label: "En attente",    className: "bg-muted text-muted-foreground border border-border" },
  CONFIRMED:  { label: "Confirmée",    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" },
  PROCESSING: { label: "En traitement", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" },
  SHIPPED:    { label: "Expédiée",     className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" },
  DELIVERED:  { label: "Livrée",       className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
  CANCELLED:  { label: "Annulée",      className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" },
  RETURNED:   { label: "Retournée",    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
