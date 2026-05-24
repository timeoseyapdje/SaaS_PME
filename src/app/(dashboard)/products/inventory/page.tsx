"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StockBadge } from "@/components/products/StockBadge";
import { EmptyState } from "@/components/ui/empty-state";
import { Boxes, Plus, Minus, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Product } from "@/types";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, string>>({});
  const [reason, setReason] = useState<Record<string, string>>({});

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products?isActive=true");
      if (res.ok) setProducts(await res.json());
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchProducts(); }, []);

  async function adjust(productId: string, type: "IN" | "OUT" | "ADJUSTMENT") {
    const q = Number(qty[productId]);
    if (!q || q <= 0) return;
    setAdjusting(productId);
    try {
      await fetch(`/api/products/${productId}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, quantity: q, reason: reason[productId] || undefined }),
      });
      setQty(prev => ({ ...prev, [productId]: "" }));
      fetchProducts();
    } finally { setAdjusting(null); }
  }

  const stockProducts = products.filter(p => p.trackStock);
  const lowStockProducts = stockProducts.filter(p => p.stock <= p.lowStockThreshold);

  return (
    <div className="flex flex-col gap-6">
      <Header title="Inventaire" subtitle="Gérez les niveaux de stock de vos produits" />

      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Alertes stock</p>
          <p className="text-sm text-amber-700 dark:text-amber-400">{lowStockProducts.length} produit{lowStockProducts.length > 1 ? "s" : ""} nécessite{lowStockProducts.length > 1 ? "nt" : ""} un réapprovisionnement.</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />)}</div>
      ) : stockProducts.length === 0 ? (
        <EmptyState icon={Boxes} title="Aucun produit suivi" description="Activez le suivi du stock sur vos produits pour les voir ici." />
      ) : (
        <Card className="border-border overflow-hidden">
          <div className="divide-y divide-border">
            {stockProducts.map(product => (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(product.price, product.currency)} / {product.unit}</p>
                  </div>
                  <StockBadge stock={product.stock} threshold={product.lowStockThreshold} trackStock={product.trackStock} />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Quantité"
                      value={qty[product.id] || ""}
                      onChange={e => setQty(prev => ({ ...prev, [product.id]: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Motif (optionnel)"
                      value={reason[product.id] || ""}
                      onChange={e => setReason(prev => ({ ...prev, [product.id]: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => adjust(product.id, "IN")} disabled={adjusting === product.id} className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    {adjusting === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => adjust(product.id, "OUT")} disabled={adjusting === product.id} className="text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">
                    {adjusting === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => adjust(product.id, "ADJUSTMENT")} disabled={adjusting === product.id}>
                    {adjusting === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
