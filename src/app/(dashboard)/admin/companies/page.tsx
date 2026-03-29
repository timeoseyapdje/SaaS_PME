"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Building2, Search, Users, MapPin, Mail, Phone, FileText, Crown, Zap, Rocket } from "lucide-react";

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
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/companies");
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

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.registrationNo || "").toLowerCase().includes(search.toLowerCase())
  );

  const planBadge: Record<string, { label: string; color: string; icon: typeof Zap }> = {
    STARTER: { label: "Starter", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", icon: Zap },
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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Entreprises</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {companies.length} entreprise{companies.length > 1 ? "s" : ""} enregistrée{companies.length > 1 ? "s" : ""}
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

      {/* Companies grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((company, idx) => {
          const plan = planBadge[company.plan] || planBadge.STARTER;
          const PlanIcon = plan.icon;
          return (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 hover:border-zinc-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{company.name}</h3>
                    {company.legalName && company.legalName !== company.name && (
                      <p className="text-[10px] text-zinc-600">{company.legalName}</p>
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
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-zinc-600" />
                    {[company.city, company.country].filter(Boolean).join(", ")}
                  </p>
                )}
                {company.email && (
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-zinc-600" />
                    {company.email}
                  </p>
                )}
                {company.phone && (
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-zinc-600" />
                    {company.phone}
                  </p>
                )}
                {company.registrationNo && (
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-zinc-600" />
                    RCCM: {company.registrationNo}
                  </p>
                )}
                {company.taxId && (
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-zinc-600" />
                    NIU: {company.taxId}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/30">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Users className="w-3 h-3" />
                  <span>{company._count.users} utilisateur{company._count.users > 1 ? "s" : ""}</span>
                </div>
                <p className="text-[10px] text-zinc-600">
                  Inscrite le {new Date(company.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-zinc-600">
          Aucune entreprise trouvée
        </div>
      )}
    </div>
  );
}
