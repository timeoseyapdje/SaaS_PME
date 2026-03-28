"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  Plus,
  Download,
  Filter
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { Button } from "@/components/ui/button";

// Mock Data
const kpiData = [
  {
    title: "Revenus Totaux",
    value: 12450000,
    previousValue: 10808000,
    icon: DollarSign,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    title: "Dépenses",
    value: 4230000,
    previousValue: 4334000,
    icon: CreditCard,
    iconColor: "text-red-600",
    iconBg: "bg-red-50",
  },
  {
    title: "Nouveaux Clients",
    value: 48,
    previousValue: 42,
    icon: Users,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    title: "Trésorerie Active",
    value: 8220000,
    previousValue: 7604000,
    icon: Activity,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
];

const mockInvoices = [
  {
    id: "INV-2024-001",
    number: "FAC-2024-001",
    client: { name: "Tech Corp SARL" },
    total: 1500000,
    currency: "XAF",
    status: "PAID" as const,
    dueDate: "2024-03-20",
  },
  {
    id: "INV-2024-002",
    number: "FAC-2024-002",
    client: { name: "Agence Digitale" },
    total: 750000,
    currency: "XAF",
    status: "SENT" as const,
    dueDate: "2024-03-18",
  },
  {
    id: "INV-2024-003",
    number: "FAC-2024-003",
    client: { name: "Consulting Group" },
    total: 2200000,
    currency: "XAF",
    status: "OVERDUE" as const,
    dueDate: "2024-03-10",
  },
  {
    id: "INV-2024-004",
    number: "FAC-2024-004",
    client: { name: "Eco Services" },
    total: 500000,
    currency: "XAF",
    status: "PAID" as const,
    dueDate: "2024-03-05",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function DashboardOverview() {
  return (
    <div className="space-y-8 pb-10">
      {/* Premium Header area */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6 mb-8"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Vue d&apos;ensemble</h1>
          <p className="text-muted-foreground mt-1 text-[15px]">Suivez la performance financière de votre activité en temps réel.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="h-10 px-4 text-[14px] font-medium border-border/50 shadow-sm rounded-lg hover:bg-muted/50 transition-all flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2 text-muted-foreground" />
            Exporter
          </Button>
          <Button className="h-10 px-4 text-[14px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10 rounded-lg flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle entrée
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* KPI Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi, index) => (
            <motion.div key={index} variants={itemVariants}>
              <KPICard {...kpi} />
            </motion.div>
          ))}
        </div>

        {/* Charts & Invoices Area */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Main Chart Placeholder - Takes 4 columns */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-4 rounded-2xl border border-border/60 bg-card shadow-lg shadow-black/20 overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-border/40 flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold tracking-tight">Flux de trésorerie</h3>
                <p className="text-[13px] text-muted-foreground mt-0.5">Évolution sur les 30 derniers jours</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 flex-1 min-h-[300px] flex items-end gap-2 relative group">
              {/* Very premium looking mock chart bars */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
              {[40, 70, 45, 90, 65, 80, 55, 100, 75, 85, 60, 95].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group/bar h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                    className="w-full bg-emerald-500/20 rounded-t-sm group-hover/bar:bg-emerald-500/60 transition-colors relative"
                  >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                       {height * 10}k
                     </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Invoices - Takes 3 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <RecentInvoices invoices={mockInvoices} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
