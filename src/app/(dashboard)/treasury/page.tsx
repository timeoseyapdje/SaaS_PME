"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { BankAccount } from "@/types";
import {
  Plus,
  Landmark,
  Smartphone,
  Wallet,
  Edit,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

const accountTypeLabels: Record<string, string> = {
  COMPTE_COURANT: "Compte courant",
  COMPTE_EPARGNE: "Compte épargne",
  MTN_MONEY: "MTN Mobile Money",
  ORANGE_MONEY: "Orange Money",
  CAISSE: "Caisse",
};

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: "INITIATED" | "PROCESSING" | "COMPLETED" | "FAILED";
  payoutRef?: string;
  createdAt: string;
  bankAccount: { name: string; type: string };
  transaction?: {
    paymentMethod: string;
    payerName?: string;
    paymentLink?: { title: string };
  };
}

function getAccountIcon(type: string) {
  switch (type) {
    case "MTN_MONEY":
    case "ORANGE_MONEY":
      return <Smartphone className="w-6 h-6" />;
    case "CAISSE":
      return <Wallet className="w-6 h-6" />;
    default:
      return <Landmark className="w-6 h-6" />;
  }
}

function getAccountColor(type: string) {
  switch (type) {
    case "MTN_MONEY":
      return "bg-yellow-500";
    case "ORANGE_MONEY":
      return "bg-orange-500";
    case "CAISSE":
      return "bg-green-500";
    default:
      return "bg-blue-500";
  }
}

function PayoutStatusBadge({ status }: { status: Payout["status"] }) {
  const config = {
    INITIATED:  { label: "Initié",     icon: <Clock className="w-3 h-3" />,        cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    PROCESSING: { label: "En cours",   icon: <Clock className="w-3 h-3" />,        cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    COMPLETED:  { label: "Effectué",   icon: <CheckCircle2 className="w-3 h-3" />, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    FAILED:     { label: "Échoué",     icon: <XCircle className="w-3 h-3" />,      cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${config.cls}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export default function TreasuryPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("COMPTE_COURANT");
  const [formBankName, setFormBankName] = useState("");
  const [formBalance, setFormBalance] = useState("0");
  const [formPhone, setFormPhone] = useState("");
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/treasury");
      const data = await r.json();
      setAccounts(data.accounts || []);
      setTotalBalance(data.totalBalance || 0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayouts = useCallback(async () => {
    setPayoutsLoading(true);
    try {
      const r = await fetch("/api/payouts");
      if (r.ok) setPayouts(await r.json());
    } finally {
      setPayoutsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchPayouts();
  }, [fetchAccounts, fetchPayouts]);

  function openAddForm() {
    setEditAccount(null);
    setFormName("");
    setFormType("COMPTE_COURANT");
    setFormBankName("");
    setFormBalance("0");
    setFormPhone("");
    setFormIsDefault(false);
    setShowForm(true);
  }

  function openEditForm(account: BankAccount) {
    setEditAccount(account);
    setFormName(account.name);
    setFormType(account.type);
    setFormBankName(account.bankName || "");
    setFormBalance(String(account.balance));
    setFormPhone((account as BankAccount & { phoneNumber?: string }).phoneNumber || "");
    setFormIsDefault(account.isDefault || false);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        name: formName,
        type: formType,
        bankName: formBankName || null,
        balance: parseFloat(formBalance),
        phoneNumber: ["MTN_MONEY", "ORANGE_MONEY"].includes(formType) ? formPhone || null : null,
        isDefault: formIsDefault,
      };
      if (editAccount) {
        await fetch("/api/treasury", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editAccount.id, ...payload }),
        });
      } else {
        await fetch("/api/treasury", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setShowForm(false);
      fetchAccounts();
    } finally {
      setFormSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Header
        title="Trésorerie"
        subtitle="Gérez vos comptes et soldes bancaires"
      />

      {/* Total + action row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Card className="flex-1 border-border bg-card shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Trésorerie totale</p>
              <p className="text-[22px] font-bold text-foreground leading-tight">{formatCurrency(totalBalance)}</p>
              <p className="text-[10px] text-muted-foreground">{accounts.length} compte{accounts.length > 1 ? "s" : ""}</p>
            </div>
          </CardContent>
        </Card>
        <Button onClick={openAddForm} className="sm:shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un compte
        </Button>
      </div>

      {/* Accounts grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <Landmark className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Aucun compte bancaire configuré</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${getAccountColor(account.type)} rounded-xl flex items-center justify-center text-white shrink-0`}>
                    {getAccountIcon(account.type)}
                  </div>
                  <div className="flex items-center gap-1">
                    {account.isDefault && (
                      <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-semibold">
                        Principal
                      </span>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditForm(account)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="font-semibold text-foreground text-sm">{account.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {accountTypeLabels[account.type]}{account.bankName && ` · ${account.bankName}`}
                </p>
                <p className={`text-xl font-bold mt-3 ${account.balance < 0 ? "text-rose-500" : "text-foreground"}`}>
                  {formatCurrency(account.balance, account.currency)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payout history */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            Historique des reversements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-lg" />)}
            </div>
          ) : payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun reversement pour l&apos;instant</p>
          ) : (
            <div className="space-y-2">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {payout.transaction?.paymentLink?.title ?? "Reversement"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {payout.bankAccount.name}
                        {payout.transaction?.payerName && ` · ${payout.transaction.payerName}`}
                        {" · "}{new Date(payout.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <PayoutStatusBadge status={payout.status} />
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(payout.amount, payout.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit account dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editAccount ? "Modifier le compte" : "Nouveau compte"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du compte *</Label>
              <Input
                placeholder="Ex: Compte principal SGC"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type de compte *</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(accountTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {["MTN_MONEY", "ORANGE_MONEY"].includes(formType) ? (
              <div className="space-y-2">
                <Label>Numéro de téléphone Mobile Money *</Label>
                <Input
                  type="tel"
                  placeholder="6XX XXX XXX"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ce numéro recevra les reversements automatiques.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Banque</Label>
                <Input
                  placeholder="Ex: Société Générale Cameroun"
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Solde actuel (FCFA)</Label>
              <Input
                type="number"
                step="1"
                value={formBalance}
                onChange={(e) => setFormBalance(e.target.value)}
              />
            </div>
            <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formIsDefault}
                onChange={(e) => setFormIsDefault(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-emerald-500"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Compte principal</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Les reversements automatiques (Mobile Money) seront envoyés sur ce compte.
                  Un seul compte peut être principal à la fois.
                </p>
              </div>
            </label>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
