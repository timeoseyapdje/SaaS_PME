"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { Bell, ChevronDown, LogOut, Settings, FileText, TrendingDown, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

interface Notification {
  id: string;
  type: "invoice" | "expense" | "alert" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const user = session?.user;
  const userRole = (user as { role?: string } | undefined)?.role;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) return;
      const data = await res.json();

      const notifs: Notification[] = [];

      // Factures en retard
      if (data.pendingInvoices) {
        data.pendingInvoices.forEach((inv: { id: string; number: string; client?: { name: string } | null; total: number; currency: string; dueDate: string }) => {
          const due = new Date(inv.dueDate);
          const now = new Date();
          if (due < now) {
            notifs.push({
              id: `overdue-${inv.id}`,
              type: "alert",
              title: "Facture en retard",
              message: `${inv.number} - ${inv.client?.name || "Client"} (${formatCurrency(inv.total, inv.currency)})`,
              time: due.toLocaleDateString("fr-FR"),
              read: false,
            });
          } else {
            notifs.push({
              id: `pending-${inv.id}`,
              type: "invoice",
              title: "Facture en attente",
              message: `${inv.number} - ${inv.client?.name || "Client"} (${formatCurrency(inv.total, inv.currency)})`,
              time: `Échéance: ${due.toLocaleDateString("fr-FR")}`,
              read: false,
            });
          }
        });
      }

      // Alerte si dépenses > revenus
      if (data.kpis && data.kpis.expenses.current > data.kpis.revenue.current && data.kpis.expenses.current > 0) {
        notifs.push({
          id: "expense-alert",
          type: "expense",
          title: "Attention aux dépenses",
          message: `Vos dépenses (${formatCurrency(data.kpis.expenses.current, "XAF")}) dépassent vos revenus ce mois-ci.`,
          time: "Ce mois",
          read: false,
        });
      }

      // Message de bienvenue si aucune notif
      if (notifs.length === 0) {
        notifs.push({
          id: "welcome",
          type: "success",
          title: "Tout est en ordre",
          message: "Aucune alerte pour le moment. Votre gestion financière est à jour.",
          time: "Maintenant",
          read: true,
        });
      }

      setNotifications(notifs);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({
      title: "Notifications lues",
      description: "Toutes les notifications ont été marquées comme lues.",
    });
  }

  function dismissNotif(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const notifIcon = (type: string) => {
    switch (type) {
      case "invoice": return <FileText className="w-4 h-4 text-amber-400" />;
      case "expense": return <TrendingDown className="w-4 h-4 text-rose-400" />;
      case "alert": return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "success": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <header className="h-16 bg-zinc-950/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between px-6 mb-6 sticky top-4 z-20 transition-all shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-50 rounded-2xl pointer-events-none" />
      <div className="flex flex-col justify-center relative z-10">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
              </span>
            )}
          </Button>

          {showNotifs && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifs(false)} />
              {/* Panel */}
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-zinc-900 border border-zinc-800/60 rounded-xl shadow-2xl z-40 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        Tout marquer lu
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)} className="text-zinc-500 hover:text-zinc-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-sm text-zinc-600">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/30 transition-colors ${
                          !notif.read ? "bg-zinc-800/20" : ""
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">{notifIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-semibold ${!notif.read ? "text-white" : "text-zinc-400"}`}>
                              {notif.title}
                            </p>
                            <button
                              onClick={() => dismissNotif(notif.id)}
                              className="text-zinc-600 hover:text-zinc-400 shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-zinc-600 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 h-10 px-2 hover:bg-muted/50 rounded-full cursor-pointer transition-colors"
            >
              <Avatar className="w-8 h-8 ring-1 ring-border/50">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-sm">
                <span className="font-medium text-foreground leading-none">
                  {user?.name || "Utilisateur"}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 leading-none">
                  {userRole === "ADMIN" ? "Admin" : userRole === "ACCOUNTANT" ? "Comptable" : "Utilisateur"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 shadow-soft">
            <DropdownMenuLabel className="font-normal px-3 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground leading-none mt-1">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem asChild className="cursor-pointer rounded-md mx-1">
              <a href="/settings" className="flex items-center gap-2 py-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Paramètres</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive cursor-pointer rounded-md mx-1 py-2 focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
