interface StockBadgeProps {
  stock: number;
  threshold: number;
  trackStock: boolean;
}

export function StockBadge({ stock, threshold, trackStock }: StockBadgeProps) {
  if (!trackStock) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Non géré</span>;
  }
  if (stock === 0) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Rupture</span>;
  }
  if (stock <= threshold) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Stock faible ({stock})</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">En stock ({stock})</span>;
}
