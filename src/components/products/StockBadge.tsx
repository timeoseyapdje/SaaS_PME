interface StockBadgeProps {
  stock: number;
  threshold: number;
  trackStock: boolean;
}

export function StockBadge({ stock, threshold, trackStock }: StockBadgeProps) {
  if (!trackStock) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Non géré</span>;
  }
  if (stock === 0) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Rupture</span>;
  }
  if (stock <= threshold) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Stock faible ({stock})</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">En stock ({stock})</span>;
}
