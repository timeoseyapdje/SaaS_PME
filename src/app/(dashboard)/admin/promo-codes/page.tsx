"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Ticket,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
  Calendar,
  Infinity,
  Search,
  X,
  Percent,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  benefitMonths: number;
  maxUses: number | null;
  currentUses: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { usages: number };
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 10,
    benefitMonths: 1,
    maxUses: null as number | null,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isLifetime: true,
  });

  const benefitOptions = [
    { value: 1, label: "1 mois" },
    { value: 2, label: "2 mois" },
    { value: 3, label: "3 mois" },
    { value: 6, label: "6 mois" },
    { value: 12, label: "12 mois" },
  ];

  const fetchPromoCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promo-codes");
      if (res.ok) {
        const data = await res.json();
        setPromoCodes(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        code: form.code,
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: form.discountValue,
        benefitMonths: form.benefitMonths,
        maxUses: form.maxUses,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.isLifetime ? null : form.endDate ? new Date(form.endDate).toISOString() : null,
      };

      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setForm({
          code: "",
          description: "",
          discountType: "PERCENTAGE",
          discountValue: 10,
          benefitMonths: 1,
          maxUses: null,
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          isLifetime: true,
        });
        fetchPromoCodes();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la création");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const res = await fetch(`/api/admin/promo-codes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentState }),
    });
    if (res.ok) fetchPromoCodes();
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Supprimer ce code promo ?")) return;
    const res = await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
    if (res.ok) fetchPromoCodes();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCodes = promoCodes.filter(
    (p) =>
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (promo: PromoCode) => {
    if (!promo.isActive) return { label: "Désactivé", color: "bg-muted text-muted-foreground" };
    if (promo.endDate && new Date(promo.endDate) < new Date())
      return { label: "Expiré", color: "bg-red-500/10 text-red-400" };
    if (promo.maxUses && promo.currentUses >= promo.maxUses)
      return { label: "Limite atteinte", color: "bg-amber-500/10 text-amber-400" };
    return { label: "Actif", color: "bg-emerald-500/10 text-emerald-400" };
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Codes Promo" subtitle="Gérez vos codes promotionnels et leurs périodes de validité" />
      <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau code
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total codes", value: promoCodes.length, color: "text-indigo-400" },
          { label: "Actifs", value: promoCodes.filter((p) => p.isActive).length, color: "text-emerald-400" },
          { label: "Utilisations", value: promoCodes.reduce((sum, p) => sum + p.currentUses, 0), color: "text-violet-400" },
          { label: "Expirés", value: promoCodes.filter((p) => p.endDate && new Date(p.endDate) < new Date()).length, color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-xs font-medium">{stat.label}</p>
            <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un code promo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50"
        />
      </div>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Nouveau code promo</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Code</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="ex: PROMO2026"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Description optionnelle"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Type de réduction */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Type de réduction</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, discountType: "PERCENTAGE" })}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                        form.discountType === "PERCENTAGE"
                          ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400"
                          : "bg-muted border-border text-muted-foreground hover:border-border"
                      )}
                    >
                      <Percent className="w-4 h-4" />
                      Pourcentage
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, discountType: "FIXED_AMOUNT" })}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                        form.discountType === "FIXED_AMOUNT"
                          ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400"
                          : "bg-muted border-border text-muted-foreground hover:border-border"
                      )}
                    >
                      <Banknote className="w-4 h-4" />
                      Montant fixe
                    </button>
                  </div>
                </div>

                {/* Valeur */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Valeur {form.discountType === "PERCENTAGE" ? "(%)" : "(XAF)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Nombre d'utilisations max */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nombre d&apos;utilisations max
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={form.maxUses ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : null })
                      }
                      placeholder="Illimité"
                      className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, maxUses: null })}
                      className={cn(
                        "px-3 py-2.5 rounded-xl border text-sm transition-all",
                        form.maxUses === null
                          ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                          : "bg-muted border-border text-muted-foreground hover:border-border"
                      )}
                      title="Illimité"
                    >
                      <Infinity className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Période */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Date de début</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Durée de l'avantage */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Durée de l&apos;avantage
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Nombre de mois de réduction offerts à l&apos;utilisateur, peu importe quand il saisit le code.
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {benefitOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, benefitMonths: opt.value })}
                        className={cn(
                          "px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-center",
                          form.benefitMonths === opt.value
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                            : "bg-muted border-border text-muted-foreground hover:border-border"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Période de saisie */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Période de saisie du code
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Fenêtre pendant laquelle le code peut être utilisé. Après la date limite, le code expire.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isLifetime: true, endDate: "" })}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                        form.isLifetime
                          ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                          : "bg-muted border-border text-muted-foreground hover:border-border"
                      )}
                    >
                      <Infinity className="w-4 h-4" />
                      Sans limite
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isLifetime: false })}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                        !form.isLifetime
                          ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400"
                          : "bg-muted border-border text-muted-foreground hover:border-border"
                      )}
                    >
                      <Calendar className="w-4 h-4" />
                      Date limite
                    </button>
                  </div>
                </div>

                {!form.isLifetime && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Date limite de saisie
                    </label>
                    <input
                      type="date"
                      required
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      min={form.startDate}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  {submitting ? "Création..." : "Créer le code promo"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="text-center py-20">
          <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Aucun code promo</p>
          <p className="text-muted-foreground text-sm mt-1">
            Créez votre premier code promo pour commencer
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCodes.map((promo) => {
            const status = getStatus(promo);
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-500/10 p-2.5 rounded-xl">
                      <Ticket className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-foreground font-bold text-sm tracking-wider">
                          {promo.code}
                        </code>
                        <button
                          onClick={() => copyCode(promo.code)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedCode === promo.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", status.color)}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1">
                        {promo.description || "Pas de description"} &middot;{" "}
                        <span className="text-muted-foreground">
                          {promo.discountType === "PERCENTAGE"
                            ? `${promo.discountValue}%`
                            : `${promo.discountValue.toLocaleString()} XAF`}
                        </span>
                        {" "}&middot;{" "}
                        <span className="text-emerald-400">
                          {promo.benefitMonths} mois
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Utilisations</p>
                      <p className="text-sm font-medium text-foreground">
                        {promo.currentUses}
                        {promo.maxUses ? ` / ${promo.maxUses}` : " / ∞"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Validité</p>
                      {promo.endDate ? (() => {
                        const now = new Date();
                        const end = new Date(promo.endDate);
                        const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <>
                            <p className="text-sm font-medium text-foreground">
                              {new Date(promo.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} → {end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            <p className={cn("text-[10px] font-medium", daysLeft > 7 ? "text-emerald-400" : daysLeft > 0 ? "text-amber-400" : "text-red-400")}>
                              {daysLeft > 0 ? `${daysLeft}j restant${daysLeft > 1 ? "s" : ""}` : "Expiré"}
                            </p>
                          </>
                        );
                      })() : (
                        <p className="text-sm font-medium text-muted-foreground">Sans limite</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(promo.id, promo.isActive)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title={promo.isActive ? "Désactiver" : "Activer"}
                      >
                        {promo.isActive ? (
                          <ToggleRight className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                      <button
                        onClick={() => deletePromo(promo.id)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
