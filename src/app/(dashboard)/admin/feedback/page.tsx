"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { LifeBuoy, MessageSquare, Bug, Star, Loader2, Search, Mail, Inbox } from "lucide-react";
import { Header } from "@/components/layout/Header";

type FeedbackType = "SUPPORT" | "FEEDBACK" | "BUG";
type FeedbackStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  subject: string;
  message: string;
  rating: number | null;
  status: FeedbackStatus;
  createdAt: string;
  user: { name: string | null; email: string; company: { name: string } | null };
}

const TYPE_META: Record<FeedbackType, { label: string; icon: typeof LifeBuoy; color: string }> = {
  SUPPORT: { label: "Support", icon: LifeBuoy, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  FEEDBACK: { label: "Avis", icon: MessageSquare, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  BUG: { label: "Bug", icon: Bug, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
};

const STATUS_META: Record<FeedbackStatus, { label: string; color: string }> = {
  NEW: { label: "Nouveau", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  IN_PROGRESS: { label: "En cours", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  RESOLVED: { label: "Résolu", color: "text-muted-foreground bg-muted border-border" },
};

const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
    active
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      : "bg-muted text-muted-foreground border-border hover:text-foreground"
  }`;

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<FeedbackType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/feedback");
      if (res.ok) setFeedbacks((await res.json()).feedbacks || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  async function updateStatus(id: string, status: FeedbackStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return feedbacks.filter(
      (f) =>
        (typeFilter === "ALL" || f.type === typeFilter) &&
        (statusFilter === "ALL" || f.status === statusFilter) &&
        (!q ||
          f.subject.toLowerCase().includes(q) ||
          f.message.toLowerCase().includes(q) ||
          f.user.email.toLowerCase().includes(q) ||
          (f.user.name?.toLowerCase() || "").includes(q) ||
          (f.user.company?.name.toLowerCase() || "").includes(q))
    );
  }, [feedbacks, typeFilter, statusFilter, search]);

  const ratings = feedbacks.filter((f) => f.rating);
  const avgRating = ratings.length ? ratings.reduce((s, f) => s + (f.rating || 0), 0) / ratings.length : null;
  const newCount = feedbacks.filter((f) => f.status === "NEW").length;

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Feedback" subtitle="Avis, demandes de support et bugs envoyés par les clients" />
      <div className="p-4 lg:p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: feedbacks.length },
            { label: "Nouveaux", value: newCount },
            { label: "Support", value: feedbacks.filter((f) => f.type === "SUPPORT").length },
            { label: "Note moyenne", value: avgRating ? `${avgRating.toFixed(1)}/5` : "—" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-semibold text-foreground mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher (sujet, message, client, entreprise)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={chip(typeFilter === "ALL")} onClick={() => setTypeFilter("ALL")}>Tous types</button>
            {(Object.keys(TYPE_META) as FeedbackType[]).map((t) => (
              <button key={t} className={chip(typeFilter === t)} onClick={() => setTypeFilter(t)}>
                {TYPE_META[t].label}
              </button>
            ))}
            <span className="w-px bg-border mx-1" />
            <button className={chip(statusFilter === "ALL")} onClick={() => setStatusFilter("ALL")}>Tous statuts</button>
            {(Object.keys(STATUS_META) as FeedbackStatus[]).map((s) => (
              <button key={s} className={chip(statusFilter === s)} onClick={() => setStatusFilter(s)}>
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl py-16 text-center text-sm text-muted-foreground">
            <Inbox className="w-8 h-8 mx-auto mb-3 opacity-50" />
            Aucun message pour ces filtres
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((f) => {
              const meta = TYPE_META[f.type] || TYPE_META.FEEDBACK;
              const Icon = meta.icon;
              return (
                <div key={f.id} className="bg-card border border-border rounded-xl p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${meta.color}`}>
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${STATUS_META[f.status]?.color}`}>
                        {STATUS_META[f.status]?.label || f.status}
                      </span>
                      {f.rating && (
                        <span className="inline-flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < f.rating! ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"}`}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                    <select
                      value={f.status}
                      disabled={updatingId === f.id}
                      onChange={(e) => updateStatus(f.id, e.target.value as FeedbackStatus)}
                      className="bg-muted border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                    >
                      {(Object.keys(STATUS_META) as FeedbackStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground mt-3">{f.subject}</h3>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">{f.message}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                    <span>
                      <span className="text-foreground font-medium">{f.user.name || "Sans nom"}</span>
                      {f.user.company?.name && <> · {f.user.company.name}</>}
                      {" · "}
                      {new Date(f.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    <a
                      href={`mailto:${f.user.email}?subject=${encodeURIComponent(`Re: ${f.subject}`)}`}
                      className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Répondre ({f.user.email})
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
