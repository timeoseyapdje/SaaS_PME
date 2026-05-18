"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { UserPlus, Check, X, Loader2, Mail, MessageSquare, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";

interface AdmissionRequest {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  position: { id: string; name: string } | null;
}

interface Position {
  id: string;
  name: string;
  isOwner: boolean;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    try {
      const [reqRes, posRes] = await Promise.all([
        fetch("/api/admission-requests"),
        fetch("/api/positions"),
      ]);
      if (reqRes.ok) setRequests(await reqRes.json());
      if (posRes.ok) {
        const pos = await posRes.json();
        setPositions(pos);
        const defaultPos = pos.find((p: Position) => !p.isOwner);
        if (defaultPos) {
          const defaults: Record<string, string> = {};
          const reqs = await reqRes.json().catch(() => []);
          (reqs.length ? reqs : requests).forEach((r: AdmissionRequest) => {
            defaults[r.id] = defaultPos.id;
          });
          setSelectedPositions(defaults);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDecision(requestId: string, status: "APPROVED" | "REJECTED") {
    setProcessing(requestId);
    try {
      const body: Record<string, string> = { status };
      if (status === "APPROVED") {
        body.positionId = selectedPositions[requestId];
        if (!body.positionId) {
          alert("Sélectionnez un poste avant d'approuver");
          setProcessing(null);
          return;
        }
      }
      const res = await fetch(`/api/admission-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)));
      } else {
        const err = await res.json();
        alert(err.error || "Erreur");
      }
    } finally {
      setProcessing(null);
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const processedRequests = requests.filter((r) => r.status !== "PENDING");

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Demandes d'adhésion" subtitle={`${pendingRequests.length} en attente`} />
      <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full space-y-6">
        {pendingRequests.length === 0 && processedRequests.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Aucune demande d&apos;adhésion pour le moment
          </div>
        )}

        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              En attente ({pendingRequests.length})
            </h2>
            {pendingRequests.map((req, idx) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <UserPlus className="w-4 h-4 text-blue-400" />
                      <p className="text-sm font-medium text-foreground">{req.user.name || "Sans nom"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Mail className="w-3 h-3" />{req.user.email}
                    </p>
                    {req.message && (
                      <p className="text-xs text-muted-foreground flex items-start gap-1 mt-2 p-2 bg-muted rounded-lg">
                        <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                        {req.message}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(req.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <select
                      value={selectedPositions[req.id] || ""}
                      onChange={(e) => setSelectedPositions((prev) => ({ ...prev, [req.id]: e.target.value }))}
                      className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 text-foreground outline-none focus:border-emerald-500/50"
                    >
                      <option value="" disabled>Poste à attribuer</option>
                      {positions.filter((p) => !p.isOwner).map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      {processing === req.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleDecision(req.id, "APPROVED")}
                            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                          >
                            <Check className="w-3 h-3" />Approuver
                          </button>
                          <button
                            onClick={() => handleDecision(req.id, "REJECTED")}
                            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                          >
                            <X className="w-3 h-3" />Refuser
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {processedRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Historique</h2>
            {processedRequests.map((req) => (
              <div key={req.id} className="bg-card border border-border rounded-xl p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{req.user.name || req.user.email}</p>
                    <p className="text-xs text-muted-foreground">{req.user.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                    req.status === "APPROVED"
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                  }`}>
                    {req.status === "APPROVED" ? "Approuvée" : "Refusée"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
