"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Tag, Trash2, Loader2 } from "lucide-react";

interface Category { id: string; name: string; description?: string; _count?: { products: number } }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchCategories(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) { setName(""); setDescription(""); setShowForm(false); fetchCategories(); }
    } finally { setCreating(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette catégorie ? Les produits associés ne seront pas supprimés.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  }

  return (
    <div className="flex flex-col gap-6">
      <Header title="Catégories" subtitle="Organisez vos produits par catégories" />

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Nouvelle catégorie
        </Button>
      </div>

      {showForm && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Créer une catégorie</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Vêtements" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description optionnelle" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating} size="sm">
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Créer
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />)}</div>
      ) : categories.length === 0 ? (
        <EmptyState icon={Tag} title="Aucune catégorie" description="Créez des catégories pour mieux organiser vos produits." actionLabel="Créer une catégorie" onAction={() => setShowForm(true)} />
      ) : (
        <Card className="border-border overflow-hidden">
          <div className="divide-y divide-border">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                  {cat.description && <p className="text-xs text-muted-foreground truncate">{cat.description}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{cat._count?.products || 0} produit{(cat._count?.products || 0) > 1 ? "s" : ""}</span>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
