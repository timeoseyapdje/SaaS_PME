"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Mail, Shield, Loader2, UserMinus, Crown, X, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { usePermissions } from "@/hooks/usePermissions";

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: string;
  positionId: string | null;
  position: { id: string; name: string; isOwner: boolean } | null;
  createdAt: string;
}

interface Position {
  id: string;
  name: string;
  isOwner: boolean;
}

export default function TeamPage() {
  const { data: session } = useSession();
  const { can } = usePermissions();
  const [members, setMembers] = useState<Member[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [changingPosition, setChangingPosition] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  // Transfer ownership state
  const [transferTarget, setTransferTarget] = useState<Member | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState("");

  const currentUserId = (session?.user as { id?: string })?.id;
  const isOwner = members.find((m) => m.id === currentUserId)?.position?.isOwner ?? false;

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, positionsRes] = await Promise.all([
        fetch("/api/team"),
        fetch("/api/positions"),
      ]);
      if (membersRes.ok) setMembers(await membersRes.json());
      if (positionsRes.ok) setPositions(await positionsRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handlePositionChange(userId: string, positionId: string) {
    setChangingPosition(userId);
    try {
      const res = await fetch(`/api/team/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, positionId: updated.positionId, position: updated.position } : m))
        );
      } else {
        const err = await res.json();
        alert(err.error || "Erreur");
      }
    } finally {
      setChangingPosition(null);
    }
  }

  async function handleRemoveMember(userId: string, name: string) {
    if (!confirm(`Retirer "${name}" de l'entreprise ? L'utilisateur perdra l'accès.`)) return;
    setRemovingMember(userId);
    try {
      const res = await fetch(`/api/team/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== userId));
      } else {
        const err = await res.json();
        alert(err.error || "Erreur");
      }
    } finally {
      setRemovingMember(null);
    }
  }

  async function handleTransferOwnership() {
    if (!transferTarget) return;
    setTransferring(true);
    setTransferError("");
    try {
      const res = await fetch("/api/team/transfer-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: transferTarget.id }),
      });
      if (res.ok) {
        await fetchData();
        setTransferTarget(null);
      } else {
        const err = await res.json();
        setTransferError(err.error || "Erreur lors du transfert");
      }
    } finally {
      setTransferring(false);
    }
  }

  const filtered = members.filter(
    (m) =>
      (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.position?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Équipe" subtitle={`${members.length} membre${members.length > 1 ? "s" : ""}`} />
      <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-48"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Membre</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Poste</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Depuis</th>
                  {(can("team", "manage_positions") || isOwner) && (
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, idx) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name || "Sans nom"}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />{member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border flex items-center gap-1 w-fit ${
                        member.position?.isOwner
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : "border-border bg-muted text-foreground"
                      }`}>
                        {member.position?.isOwner ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {member.position?.name || "Aucun poste"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </td>
                    {(can("team", "manage_positions") || isOwner) && (
                      <td className="px-4 py-3">
                        {member.position?.isOwner ? (
                          <span className="text-[10px] text-amber-400/70">Propriétaire</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {can("team", "manage_positions") && (
                              changingPosition === member.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                              ) : (
                                <select
                                  value={member.positionId || ""}
                                  onChange={(e) => handlePositionChange(member.id, e.target.value)}
                                  className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 text-foreground outline-none focus:border-primary/50"
                                >
                                  <option value="" disabled>Choisir un poste</option>
                                  {positions
                                    .filter((p) => !p.isOwner)
                                    .map((p) => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                              )
                            )}

                            {/* Transférer la propriété — visible uniquement au propriétaire actuel */}
                            {isOwner && member.id !== currentUserId && (
                              <button
                                onClick={() => { setTransferTarget(member); setTransferError(""); }}
                                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors"
                                title="Transférer la propriété"
                              >
                                <Crown className="w-3.5 h-3.5" />
                                Transférer
                              </button>
                            )}

                            {can("team", "remove_members") && (
                              <button
                                onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                                disabled={removingMember === member.id}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                                title="Retirer de l'entreprise"
                              >
                                {removingMember === member.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <UserMinus className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">Aucun membre trouvé</div>
          )}
        </div>
      </div>

      {/* Modale de transfert de propriété */}
      <AnimatePresence>
        {transferTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setTransferTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-amber-500/30 rounded-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Transférer la propriété</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Action irréversible sans nouveau transfert</p>
                  </div>
                </div>
                <button onClick={() => setTransferTarget(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{transferTarget.name || transferTarget.email}</span> deviendra le nouveau propriétaire avec accès total. Vous serez rétrogradé au premier poste disponible.
                  </p>
                </div>

                {transferError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {transferError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setTransferTarget(null)}
                    className="flex-1 py-2.5 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleTransferOwnership}
                    disabled={transferring}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-amber-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {transferring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                    {transferring ? "Transfert..." : "Confirmer le transfert"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
