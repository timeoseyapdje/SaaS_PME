"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, Mail, Shield, Loader2, UserMinus } from "lucide-react";
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
  const { can } = usePermissions();
  const [members, setMembers] = useState<Member[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [changingPosition, setChangingPosition] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

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
                  {can("team", "manage_positions") && (
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
                      <span className="text-xs font-medium px-2 py-1 rounded-full border border-border bg-muted text-foreground flex items-center gap-1 w-fit">
                        <Shield className="w-3 h-3" />
                        {member.position?.name || "Aucun poste"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </td>
                    {can("team", "manage_positions") && (
                      <td className="px-4 py-3">
                        {member.position?.isOwner ? (
                          <span className="text-[10px] text-muted-foreground">Propriétaire</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {changingPosition === member.id ? (
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
    </div>
  );
}
