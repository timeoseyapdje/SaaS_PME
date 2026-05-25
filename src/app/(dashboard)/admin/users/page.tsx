"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Users, Search, Building2, Mail, Calendar, ShieldCheck, Loader2, Crown, Zap, Rocket, MapPin, Trash2, AlertTriangle, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

const SUPER_ADMIN_EMAIL = "admin@nkapcontrol.com";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  company: { id: string; name: string; city: string | null; plan: string } | null;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const isSuperAdmin = session?.user?.email === SUPER_ADMIN_EMAIL;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.ok) {
        setUsers(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleRoleChange(userId: string, newRole: string) {
    setChangingRole(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
        );
      } else {
        const err = await res.json();
        toast({ title: "Erreur", description: err.error || "Erreur lors du changement de rôle", variant: "destructive" });
      }
    } finally {
      setChangingRole(null);
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirmDelete || confirmDelete.id !== userId) {
      setConfirmDelete({ id: userId, name: userName });
      return;
    }
    setConfirmDelete(null);
    setDeletingUser(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (data.companyDeleted) {
          toast({ title: "Utilisateur supprimé", description: "L'entreprise associée a aussi été supprimée." });
        } else {
          toast({ title: "Utilisateur supprimé" });
        }
      } else {
        const err = await res.json();
        toast({ title: "Erreur", description: err.error || "Erreur lors de la suppression", variant: "destructive" });
      }
    } finally {
      setDeletingUser(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Super Admin",
    ACCOUNTANT: "Membre entreprise",
    VIEWER: "Visiteur",
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      ACCOUNTANT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      VIEWER: "bg-muted text-muted-foreground border-border",
    };
    return styles[role] || styles.VIEWER;
  };

  const planBadge: Record<string, { label: string; color: string; icon: typeof Zap }> = {
    STARTER: { label: "Starter", color: "text-muted-foreground", icon: Zap },
    PRO: { label: "Pro", color: "text-emerald-400", icon: Crown },
    MAX: { label: "Max", color: "text-amber-400", icon: Rocket },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Utilisateurs" subtitle={`${users.length} utilisateur${users.length > 1 ? "s" : ""} inscrit${users.length > 1 ? "s" : ""}`} />
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

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: users.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Super Admins", value: users.filter((u) => u.role === "ADMIN").length, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
          { label: "Avec entreprise", value: users.filter((u) => u.company).length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Abonnés Pro/Max", value: users.filter((u) => u.company?.plan === "PRO" || u.company?.plan === "MAX").length, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 rounded-xl border ${stat.bg}`}>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Super Admin notice */}
      {isSuperAdmin && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          Vous êtes Super Admin — vous pouvez modifier les rôles des utilisateurs.
        </div>
      )}

      {/* Users table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Utilisateur</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Rôle</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Entreprise</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Abonnement</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Inscription</th>
                {isSuperAdmin && (
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => {
                const plan = planBadge[user.company?.plan || "STARTER"] || planBadge.STARTER;
                const PlanIcon = plan.icon;
                return (
                  <motion.tr
                    key={user.id}
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
                          <p className="text-sm font-medium text-foreground">
                            {user.name || "Sans nom"}
                            {user.email === SUPER_ADMIN_EMAIL && (
                              <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                                SUPER ADMIN
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${roleBadge(user.role)}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.company ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-foreground">{user.company.name}</p>
                            {user.company.city && (
                              <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />
                                {user.company.city}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Aucune</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <PlanIcon className={`w-3.5 h-3.5 ${plan.color}`} />
                        <span className={`text-xs font-medium ${plan.color}`}>
                          {plan.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3">
                        {user.email === SUPER_ADMIN_EMAIL ? (
                          <span className="text-[10px] text-muted-foreground">Protégé</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {changingRole === user.id ? (
                              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                            ) : (
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 text-foreground outline-none focus:border-primary/50 cursor-pointer"
                              >
                                <option value="VIEWER">VIEWER — Visiteur</option>
                                <option value="ACCOUNTANT">ACCOUNTANT — Membre entreprise</option>
                                <option value="ADMIN">ADMIN — Super administrateur</option>
                              </select>
                            )}
                            {confirmDelete?.id === user.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-rose-400">Confirmer ?</span>
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                                  className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors text-[10px] font-medium"
                                >Oui</button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors"
                                ><X className="w-3 h-3" /></button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                                disabled={deletingUser === user.id}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors disabled:opacity-50"
                                title="Supprimer cet utilisateur"
                              >
                                {deletingUser === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
