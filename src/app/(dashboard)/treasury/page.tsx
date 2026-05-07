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
  TrendingUp,
} from "lucide-react";

const accountTypeLabels: Record<string, string> = {
  COMPTE_COURANT: "Compte courant",
  COMPTE_EPARGNE: "Compte épargne",
  MTN_MONEY: "MTN Mobile Money",
  ORANGE_MONEY: "Orange Money",
  CAISSE: "Caisse",
};

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

export default function TreasuryPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("COMPTE_COURANT");
  const [formBankName, setFormBankName] = useState("");
  const [formBalance, setFormBalance] = useState("0");
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

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  function openAddForm() {
    setEditAccount(null);
    setFormName("");
    setFormType("COMPTE_COURANT");
    setFormBankName("");
    setFormBalance("0");
    setShowForm(true);
  }

  function openEditForm(account: BankAccount) {
    setEditAccount(account);
    setFormName(account.name);
    setFormType(account.type);
    setFormBankName(account.bankName || "");
    setFormBalance(String(account.balance));
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editAccount) {
        await fetch("/api/treasury", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editAccount.id,
            name: formName,
            type: formType,
            bankName: formBankName,
            balance: parseFloat(formBalance),
          }),
        });
      } else {
        await fetch("/api/treasury", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            type: formType,
            bankName: formBankName,
            balance: parseFloat(formBalance),
          }),
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
            <div className="space-y-2">
              <Label>Banque</Label>
              <Input
                placeholder="Ex: Société Générale Cameroun"
                value={formBankName}
                onChange={(e) => setFormBankName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Solde actuel (FCFA)</Label>
              <Input
                type="number"
                step="1"
                value={formBalance}
                onChange={(e) => setFormBalance(e.target.value)}
              />
            </div>
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
