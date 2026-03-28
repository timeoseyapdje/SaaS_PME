"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Users, Search, Building2, Mail, Calendar, ShieldCheck, Loader2 } from "lucide-react";

const SUPER_ADMIN_EMAIL = "admin@nkapcontrol.cm";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  company: { id: string; name: string; city: string | null } | null;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.email === SUPER_ADMIN_EMAIL;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
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
        alert(err.error || "Erreur lors du changement de rôle");
      }
    } finally {
      setChangingRole(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      ACCOUNTANT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      VIEWER: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    };
    return styles[role] || styles.VIEWER;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {users.length} utilisateur{users.length > 1 ? "s" : ""} inscrit{users.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none w-48"
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: users.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Admins", value: users.filter((u) => u.role === "ADMIN").length, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
          { label: "Avec entreprise", value: users.filter((u) => u.company).length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 rounded-xl border ${stat.bg}`}>
            <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
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
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/50">
                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3">Utilisateur</th>
                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3">Rôle</th>
                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3">Entreprise</th>
                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3">Inscription</th>
                {isSuperAdmin && (
                  <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Users className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {user.name || "Sans nom"}
                          {user.email === SUPER_ADMIN_EMAIL && (
                            <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                              SUPER ADMIN
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${roleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.company ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                        <div>
                          <p className="text-sm text-zinc-300">{user.company.name}</p>
                          {user.company.city && (
                            <p className="text-xs text-zinc-600">{user.company.city}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600">Aucune</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3">
                      {user.email === SUPER_ADMIN_EMAIL ? (
                        <span className="text-[10px] text-zinc-600">Protégé</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          {changingRole === user.id ? (
                            <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="text-xs bg-zinc-800 border border-zinc-700/50 rounded-lg px-2 py-1.5 text-zinc-300 outline-none focus:border-emerald-500/50 cursor-pointer"
                            >
                              <option value="VIEWER">VIEWER</option>
                              <option value="ACCOUNTANT">ACCOUNTANT</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
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
          <div className="text-center py-8 text-sm text-zinc-600">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>
    </div>
  );
}
