"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  unit: string;
}

interface ProductPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: { description: string; unitPrice: number }) => void;
}

export function ProductPickerDialog({ open, onClose, onSelect }: ProductPickerDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : (data.products ?? [])))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(product: Product) {
    onSelect({ description: product.name, unitPrice: product.price });
    onClose();
    setSearch("");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choisir du catalogue</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit ou service..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto space-y-1 mt-1">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Chargement...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {products.length === 0 ? "Aucun produit dans le catalogue" : "Aucun résultat"}
            </p>
          ) : (
            filtered.map((product) => (
              <button
                key={product.id}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted transition-colors flex items-center justify-between gap-3 group"
                onClick={() => handleSelect(product)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap shrink-0">
                  {formatCurrency(product.price, product.currency)}
                  <span className="text-xs text-muted-foreground font-normal">/{product.unit}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
