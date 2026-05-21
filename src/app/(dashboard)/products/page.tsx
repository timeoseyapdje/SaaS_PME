"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StockBadge } from "@/components/products/StockBadge";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Search, Package, Grid3X3, List, Tag, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Product, Category } from "@/types";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory) params.set("categoryId", selectedCategory);
      const res = await fetch(`/api/products?${params}`);
      if (res.ok) setProducts(await res.json());
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  const lowStockCount = products.filter(p => p.trackStock && p.stock <= p.lowStockThreshold).length;

  return (
    <div className="flex flex-col gap-6">
      <Header title="Produits & Services" subtitle="Gérez vos produits, services et prestations" />

      {/* Stats bar */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
          <Package className="w-4 h-4 shrink-0" />
          <span><strong>{lowStockCount}</strong> produit{lowStockCount > 1 ? "s" : ""} en stock faible ou rupture</span>
          <Button variant="outline" size="sm" className="ml-auto text-xs" onClick={() => router.push("/products/inventory")}>
            Voir l&apos;inventaire
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit ou service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button onClick={() => setView("grid")} className={`p-2.5 ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={`p-2.5 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
        <Button onClick={() => router.push("/products/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Products */}
      {loading ? (
        <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-2"}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun produit ou service"
          description="Ajoutez vos produits, services ou prestations à votre catalogue."
          actionLabel="Ajouter"
          onAction={() => router.push("/products/new")}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <Card
              key={product.id}
              className="cursor-pointer hover:shadow-md transition-all border-border overflow-hidden group"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <div className="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <Package className="w-12 h-12 text-muted-foreground/30" />
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                {product.category && (
                  <p className="text-xs text-muted-foreground mt-0.5">{product.category.name}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(product.price, product.currency)}
                  </p>
                </div>
                <div className="mt-2">
                  <StockBadge stock={product.stock} threshold={product.lowStockThreshold} trackStock={product.trackStock} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border overflow-hidden">
          <div className="divide-y divide-border">
            {products.map(product => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku ? `SKU: ${product.sku}` : product.category?.name || "Sans catégorie"}</p>
                </div>
                <div className="hidden sm:block">
                  <StockBadge stock={product.stock} threshold={product.lowStockThreshold} trackStock={product.trackStock} />
                </div>
                <p className="text-sm font-bold text-foreground shrink-0">{formatCurrency(product.price, product.currency)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
