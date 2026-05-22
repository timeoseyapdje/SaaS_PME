"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  Users,
  MapPin,
  Mail,
  Phone,
  FileText,
  Crown,
  Zap,
  Rocket,
  UserPlus,
  Trash2,
  X,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";

const SUPER_ADMIN_EMAIL = "admin@nkapcontrol.com";

const PLAN_USER_LIMITS: Record<string, number> = {
  STARTER: 1,
  PRO: 5,
  MAX: -1,
};

interface AdminCompany {
  id: string;
  name: string;
  legalName: string | null;
  registrationNo: string | null;
  taxId: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  createdAt: string;
  plan: string;
  _count: {
    users: number;
  };
}

export default function AdminCompaniesPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.email === SUPER_ADMIN_EMAIL;

  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal de suppression
  const [deletingCompany, setDeletingCompany] = useState<AdminCompany | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Modal d'ajout d'utilisateur
  const [addingTo, setAddingTo] = useState<AdminCompany | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("VIEWER");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/companies", { cache: "no-store" });
      if (res.ok) {
        setCompanies(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  function openDeleteModal(company: AdminCompany) {
    setDeletingCompany(company);
    setDeleteConfirmName("");
    setDeleteError("");
  }

  function closeDeleteModal() {
    setDeletingCompany(null);
    setDeleteConfirmName("");
    setDeleteError("");
  }

  async function handleDeleteCompany() {
    if (!deletingCompany || deleteConfirmName !== deletingCompany.name) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/companies/${deletingCompany.id}`, { method: "DELETE" });
      if (res.ok) {
        setCompanies((prev) => prev.filter((c) => c.id !== deletingCompany.id));
        closeDeleteModal();
      } else {
        const err = await res.json();
        setDeleteError(err.error || "Erreur lors de la suppression");
      }
    } catch {
      setDeleteError("Erreur réseau");
    } finally {
      setDeleting(false);
    }
  }

  function openAddModal(company: AdminCompany) {
    setAddingTo(company);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("VIEWER");
    setShowPassword(false);
    setFormError("");
  }

  function closeAddModal() {
    setAddingTo(null);
    setFormError("");
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!addingTo) return;
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/companies/${addingTo.id}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName || undefined,
          email: formEmail,
          password: formPassword,
          role: formRole,
        }),
      });

      if (res.ok) {
        // Mettre à jour le compteur localement
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === addingTo.id
              ? { ...c, _count: { users: c._count.users + 1 } }
              : c
          )
        );
        closeAddModal();
      } else {
        const err = await res.json();
        setFormError(err.error || "Erreur lors de l'ajout");
      }
    } catch {
      setFormError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.registrationNo || "").toLowerCase().includes(search.toLowerCase())
  );

  const planBadge: Record<string, { label: string; color: string; icon: typeof Zap }> = {
    STARTER: { label: "Starter", color: "text-muted-foreground bg-muted border-border", icon: Zap },
    PRO: { label: "Pro", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: Crown },
    MAX: { label: "Max", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Rocket },
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
      <Header title="Entreprises" subtitle={`${companies.length} entreprise${companies.length > 1 ? "s" : ""} enregistrée${companies.length > 1 ? "s" : ""}`} />
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

        {/* Companies grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((company, idx) => {
            const plan = planBadge[company.plan] || planBadge.STARTER;
            const PlanIcon = plan.icon;
            const maxUsers = PLAN_USER_LIMITS[company.plan] ?? 1;
            const canAdd = maxUsers === -1 || company._count.users < maxUsers;
            const limitLabel = maxUsers === -1 ? "∞" : `${maxUsers}`;

            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-card border border-border rounded-xl p-5 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{company.name}</h3>
                      {company.legalName && company.legalName !== company.name && (
                        <p className="text-[10px] text-muted-foreground">{company.legalName}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${plan.color}`}>
                    <PlanIcon className="w-2.5 h-2.5" />
                    {plan.label}
                  </span>
                </div>

                {/* Infos entreprise */}
                <div className="space-y-1.5 mb-3">
                  {company.city && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {[company.city, company.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {company.email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Mail className="w-3 h-3" />
                      {company.email}
                    </p>
                  )}
                  {company.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />
                      {company.phone}
                    </p>
                  )}
                  {company.registrationNo && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      RCCM: {company.registrationNo}
                    </p>
                  )}
                  {company.taxId && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      NIU: {company.taxId}
                    </p>
                  )}
                </div>

                {/* Footer avec jauge utilisateurs + bouton ajout */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>
                        {company._count.users}/{limitLabel} utilisateur{company._count.users > 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(company.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {/* Barre de progression utilisateurs */}
                  {maxUsers !== -1 && (
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          company._count.users >= maxUsers
                            ? "bg-rose-500"
                            : company._count.users >= maxUsers * 0.8
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, (company._count.users / maxUsers) * 100)}%` }}
                      />
                    </div>
                  )}

                  {/* Boutons super admin */}
                  {isSuperAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAddModal(company)}
                        disabled={!canAdd}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors ${
                          canAdd
                            ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
                            : "text-muted-foreground bg-muted border border-border cursor-not-allowed"
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {canAdd ? "Ajouter" : `Limite (${limitLabel})`}
                      </button>
                      <button
                        onClick={() => openDeleteModal(company)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Aucune entreprise trouvée
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {deletingCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-rose-500/30 rounded-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Supprimer l&apos;entreprise</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Action irréversible</p>
                  </div>
                </div>
                <button onClick={closeDeleteModal} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Cette action supprimera définitivement <span className="font-semibold text-foreground">{deletingCompany.name}</span> et toutes ses données (factures, clients, abonnements, etc.). Les utilisateurs seront détachés mais pas supprimés.
                </p>

                {deleteError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {deleteError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Tapez <span className="font-semibold text-foreground">{deletingCompany.name}</span> pour confirmer
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder={deletingCompany.name}
                    className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground outline-none focus:border-rose-500/50"
                  />
                </div>

                <button
                  onClick={handleDeleteCompany}
                  disabled={deleteConfirmName !== deletingCompany.name || deleting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleting ? "Suppression..." : "Supprimer définitivement"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'ajout d'utilisateur */}
      <AnimatePresence>
        {addingTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeAddModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Ajouter un utilisateur
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {addingTo.name} — Plan {addingTo.plan}
                  </p>
                </div>
                <button
                  onClick={closeAddModal}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddUser} className="p-5 space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Nom (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="utilisateur@email.com"
                    className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Mot de passe <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      className="w-full px-3 py-2 pr-10 text-sm bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground outline-none focus:border-emerald-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Rôle
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground outline-none focus:border-emerald-500/50 cursor-pointer"
                  >
                    <option value="VIEWER">VIEWER — Lecture seule</option>
                    <option value="ACCOUNTANT">ACCOUNTANT — Comptable</option>
                    <option value="ADMIN">ADMIN — Administrateur</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {submitting ? "Ajout en cours..." : "Ajouter l'utilisateur"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
