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
    <div>
      <Header
        title="Trésorerie"
        subtitle="Gérez vos comptes et soldes bancaires"
      />
      <div className="p-6 space-y-6">
        {/* Total treasury KPI */}
        <Card className="bg-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">
                  Trésorerie totale
                </p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(totalBalance)}
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  {accounts.length} compte{accounts.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un compte
          </Button>
        </div>

        {/* Accounts grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 bg-gray-100 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              <Landmark className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun compte bancaire configuré</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Card
                key={account.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-11 h-11 ${getAccountColor(
                        account.type
                      )} rounded-xl flex items-center justify-center text-white`}
                    >
                      {getAccountIcon(account.type)}
                    </div>
                    <div className="flex items-center gap-1">
                      {account.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                          Principal
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditForm(account)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{account.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {accountTypeLabels[account.type]}
                    {account.bankName && ` · ${account.bankName}`}
                  </p>
                  <p
                    className={`text-2xl font-bold mt-3 ${
                      account.balance < 0 ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
