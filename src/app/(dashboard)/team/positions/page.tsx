"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Trash2, Edit2, X, Loader2, Check, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSION_MODULES, MODULE_ACTIONS, MODULE_LABELS, ACTION_LABELS, type PermissionMap, type PermissionModule } from "@/lib/permissions";

interface Position {
  id: string;
  name: string;
  description: string | null;
  isOwner: boolean;
  permissions: PermissionMap;
  _count: { users: number };
}

export default function PositionsPage() {
  const { can } = usePermissions();
  const canManage = can("team", "manage_positions");
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Position | null>(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPerms, setFormPerms] = useState<PermissionMap>({});

  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch("/api/positions");
      if (res.ok) setPositions(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  function openCreate() {
    setEditing(null);
    setCreating(true);
    setFormName("");
    setFormDesc("");
    setFormPerms({});
  }

  function openEdit(pos: Position) {
    setCreating(false);
    setEditing(pos);
    setFormName(pos.name);
    setFormDesc(pos.description || "");
    setFormPerms(pos.permissions);
  }

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  function togglePermission(module: PermissionModule, action: string) {
    setFormPerms((prev) => {
      const current = prev[module] || [];
      const next = current.includes(action) ? current.filter((a) => a !== action) : [...current, action];
      return { ...prev, [module]: next };
    });
  }

  async function handleSave() {
    if (!formName.trim()) return;
    setSubmitting(true);
    try {
      const url = editing ? `/api/positions/${editing.id}` : "/api/positions";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, description: formDesc, permissions: formPerms }),
      });
      if (res.ok) {
        closeModal();
        fetchPositions();
      } else {
        const err = await res.json();
        alert(err.error || "Erreur");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce poste ?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/positions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPositions((prev) => prev.filter((p) => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Erreur");
      }
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Postes" subtitle="Gérez les rôles et permissions de votre entreprise" />
      <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {canManage && (
          <div className="flex items-center justify-end mb-6">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau poste
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {positions.map((pos, idx) => (
            <motion.div
              key={pos.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pos.isOwner ? "bg-amber-500/10 border border-amber-500/20" : "bg-blue-500/10 border border-blue-500/20"}`}>
                    <Shield className={`w-5 h-5 ${pos.isOwner ? "text-amber-400" : "text-blue-400"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{pos.name}</h3>
                    {pos.description && <p className="text-[10px] text-muted-foreground">{pos.description}</p>}
                  </div>
                </div>
                {pos.isOwner && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Propriétaire
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Users className="w-3 h-3" />
                {pos._count.users} membre{pos._count.users > 1 ? "s" : ""}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {PERMISSION_MODULES.filter((m) => (pos.permissions[m] || []).length > 0).map((m) => (
                  <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {MODULE_LABELS[m]}
                  </span>
                ))}
              </div>

              {!pos.isOwner && canManage && (
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => openEdit(pos)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(pos.id)}
                    disabled={deleting === pos.id || pos._count.users > 0}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting === pos.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal create/edit */}
      <AnimatePresence>
        {(creating || editing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl w-full max-w-2xl overflow-hidden mb-8"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  {editing ? `Modifier — ${editing.name}` : "Nouveau poste"}
                </h3>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom du poste *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Responsable commercial"
                      className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                    <input
                      type="text"
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Brève description..."
                      className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Permissions</label>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Module</th>
                            {["view", "create", "edit", "delete", "send", "manage", "export", "invite", "manage_positions", "remove_members"].map((a) => (
                              <th key={a} className="text-center px-1 py-2 font-medium text-muted-foreground whitespace-nowrap">
                                {ACTION_LABELS[a] || a}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {PERMISSION_MODULES.map((mod) => {
                            const actions = MODULE_ACTIONS[mod];
                            return (
                              <tr key={mod} className="border-t border-border">
                                <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{MODULE_LABELS[mod]}</td>
                                {["view", "create", "edit", "delete", "send", "manage", "export", "invite", "manage_positions", "remove_members"].map((a) => (
                                  <td key={a} className="text-center px-1 py-2">
                                    {actions.includes(a) ? (
                                      <button
                                        type="button"
                                        onClick={() => togglePermission(mod, a)}
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                          (formPerms[mod] || []).includes(a)
                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                            : "border-border hover:border-emerald-500/50"
                                        }`}
                                      >
                                        {(formPerms[mod] || []).includes(a) && <Check className="w-3 h-3" />}
                                      </button>
                                    ) : (
                                      <span className="text-muted-foreground/30">—</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={submitting || !formName.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
