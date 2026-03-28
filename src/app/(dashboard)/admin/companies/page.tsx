"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Building2, Search, Users, FileText, TrendingUp, TrendingDown, ShoppingCart } from "lucide-react";

interface AdminCompany {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  _count: {
    users: number;
    invoices: number;
    clients: number;
    expenses: number;
    revenues: number;
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
      (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

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
        {filtered.map((company, idx) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 hover:border-zinc-700/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{company.name}</h3>
                  <p className="text-xs text-zinc-500">
                    {[company.city, company.country].filter(Boolean).join(", ") || "Localisation non renseignée"}
                  </p>
                </div>
              </div>
            </div>

            {company.email && (
              <p className="text-xs text-zinc-500 mb-3 truncate">{company.email}</p>
            )}

            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: "Utilisateurs", value: company._count.users, icon: Users, color: "text-blue-400" },
                { label: "Factures", value: company._count.invoices, icon: FileText, color: "text-amber-400" },
                { label: "Clients", value: company._count.clients, icon: ShoppingCart, color: "text-violet-400" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${stat.color}`} />
                  <p className="text-sm font-bold text-zinc-200">{stat.value}</p>
                  <p className="text-[10px] text-zinc-600">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-800/30">
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span>{company._count.revenues} rev.</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-rose-400">
                <TrendingDown className="w-3 h-3" />
                <span>{company._count.expenses} dép.</span>
              </div>
              <p className="text-[10px] text-zinc-600 ml-auto">
                {new Date(company.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-zinc-600">
          Aucune entreprise trouvée
        </div>
      )}
    </div>
  );
}
