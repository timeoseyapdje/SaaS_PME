"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Check,
  Crown,
  Zap,
  Rocket,
  CreditCard,
  Smartphone,
  Loader2,
  CheckCircle2,
  Tag,
  Clock,
  AlertCircle,
} from "lucide-react";

const plans = [
  {
    id: "STARTER",
    name: "Starter",
    price: 0,
    icon: Zap,
    color: "text-zinc-400",
    borderColor: "border-zinc-700/50",
    features: [
      "1 utilisateur",
      "20 factures/mois",
      "Tableau de bord basique",
      "Gestion clients",
      "Export PDF",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 5000,
    icon: Crown,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/50",
    popular: true,
    features: [
      "5 utilisateurs",
      "Factures illimitées",
      "Tableau de bord avancé",
      "Trésorerie multi-comptes",
      "Rapports fiscaux (TVA, IS)",
      "Nkap AI (10 messages/jour)",
      "Support prioritaire",
      "Export Excel et PDF",
    ],
  },
  {
    id: "MAX",
    name: "Max",
    price: 15000,
    icon: Rocket,
    color: "text-amber-400",
    borderColor: "border-amber-500/50",
    features: [
      "Utilisateurs illimités",
      "Tout du plan Pro",
      "Nkap AI illimité",
      "Personnalisation avancée (logo, couleurs, modèles)",
      "API personnalisée",
      "Formation équipe dédiée",
      "Support téléphonique 24/7",
      "Rapports personnalisés",
    ],
  },
];

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string | null;
  amount: number;
  paymentMethod: string | null;
  payments: Payment[];
}

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState("STARTER");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Formulaire
  const [selectedPlan, setSelectedPlan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [promoCode, setPromoCode] = useState("");

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetch("/api/subscription");
      if (res.ok) {
        const data = await res.json();
        setCurrentPlan(data.plan);
        setSubscription(data.subscription);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  async function handleSubscribe() {
    if (!selectedPlan) return;
    if (!paymentMethod) {
      setError("Veuillez choisir un mode de paiement");
      return;
    }
    if ((paymentMethod === "MTN_MONEY" || paymentMethod === "ORANGE_MONEY") && !phoneNumber) {
      setError("Veuillez entrer votre numéro de téléphone");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod,
          phoneNumber,
          promoCode: promoCode || undefined,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setSelectedPlan("");
        setPaymentMethod("");
        setPhoneNumber("");
        setPromoCode("");
        fetchSubscription();
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const err = await res.json();
        setError(err.error || "Erreur lors du paiement");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "Actif", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    EXPIRED: { label: "Expiré", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    CANCELLED: { label: "Annulé", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
    SUSPENDED: { label: "Suspendu", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  };

  const paymentStatusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "En attente", color: "text-amber-400" },
    COMPLETED: { label: "Payé", color: "text-emerald-400" },
    FAILED: { label: "Échoué", color: "text-rose-400" },
    REFUNDED: { label: "Remboursé", color: "text-zinc-400" },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Header title="Abonnement" subtitle="Gérez votre plan et vos paiements" />
      <div className="p-6 max-w-6xl mx-auto space-y-8">

        {/* Abonnement actuel */}
        {subscription && (
          <Card className="border-zinc-800/50 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Abonnement actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs text-zinc-500">Plan</p>
                  <p className="text-lg font-bold text-white">{subscription.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Statut</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusLabels[subscription.status]?.color || ""}`}>
                    {statusLabels[subscription.status]?.label || subscription.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Montant</p>
                  <p className="text-sm font-bold text-white">{subscription.amount.toLocaleString()} XAF/mois</p>
                </div>
                {subscription.endDate && (
                  <div>
                    <p className="text-xs text-zinc-500">Expire le</p>
                    <p className="text-sm text-zinc-300">{new Date(subscription.endDate).toLocaleDateString("fr-FR")}</p>
                  </div>
                )}
                {subscription.status === "ACTIVE" && subscription.plan !== "STARTER" && (
                  <div className="ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                      onClick={async () => {
                        if (!confirm("Êtes-vous sûr de vouloir résilier votre abonnement ? Vous conserverez l'accès jusqu'à la fin de la période en cours.")) return;
                        try {
                          const res = await fetch("/api/subscription", { method: "DELETE" });
                          const data = await res.json();
                          if (res.ok) {
                            alert(data.message);
                            fetchSubscription();
                          } else {
                            alert(data.error || "Erreur lors de la résiliation");
                          }
                        } catch {
                          alert("Une erreur est survenue");
                        }
                      }}
                    >
                      Résilier
                    </Button>
                  </div>
                )}
                {subscription.status === "CANCELLED" && (
                  <div className="ml-auto">
                    <span className="text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
                      Résiliation programmée
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Choisir un plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, idx) => {
              const isCurrent = plan.id === currentPlan;
              const isSelected = plan.id === selectedPlan;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    if (!isCurrent && plan.id !== "STARTER") setSelectedPlan(plan.id);
                  }}
                  className={`relative rounded-xl border p-5 cursor-pointer transition-all ${
                    isSelected
                      ? `${plan.borderColor} bg-zinc-800/50 ring-1 ring-emerald-500/30`
                      : isCurrent
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700/50"
                  } ${plan.id === "STARTER" && !isCurrent ? "opacity-50 cursor-default" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                      Populaire
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                      Plan actuel
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <plan.icon className={`w-5 h-5 ${plan.color}`} />
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-extrabold text-white">
                      {plan.price === 0 ? "Gratuit" : `${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && <span className="text-xs text-zinc-500 ml-1">XAF/mois</span>}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Formulaire de paiement */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-zinc-800/50 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Paiement - Plan {selectedPlan}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 text-rose-400 text-sm border border-rose-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Paiement effectué avec succès ! Votre abonnement est actif.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Mode de paiement *</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50">
                        <SelectValue placeholder="Choisir un mode de paiement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MTN_MONEY">MTN Mobile Money</SelectItem>
                        <SelectItem value="ORANGE_MONEY">Orange Money</SelectItem>
                        <SelectItem value="VIREMENT">Virement bancaire</SelectItem>
                        <SelectItem value="CARTE_BANCAIRE">Carte bancaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(paymentMethod === "MTN_MONEY" || paymentMethod === "ORANGE_MONEY") && (
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Numéro de téléphone *</Label>
                      <Input
                        placeholder="+237 6xx xxx xxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700/50"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-zinc-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Code promo (optionnel)
                    </Label>
                    <Input
                      placeholder="Entrer un code promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="bg-zinc-800/50 border-zinc-700/50"
                    />
                  </div>
                </div>

                <Separator className="bg-zinc-800/50" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">Total à payer</p>
                    <p className="text-2xl font-bold text-white">
                      {(plans.find((p) => p.id === selectedPlan)?.price || 0).toLocaleString()} XAF
                    </p>
                    {promoCode && <p className="text-xs text-emerald-400">Code promo appliqué au moment du paiement</p>}
                  </div>
                  <Button
                    onClick={handleSubscribe}
                    disabled={submitting}
                    className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Payer maintenant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Historique des paiements */}
        {subscription?.payments && subscription.payments.length > 0 && (
          <Card className="border-zinc-800/50 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" />
                Historique des paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subscription.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-2.5 border-b border-zinc-800/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </p>
                        <p className="text-xs text-zinc-500">{payment.paymentMethod.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${paymentStatusLabels[payment.status]?.color || ""}`}>
                        {paymentStatusLabels[payment.status]?.label || payment.status}
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        {new Date(payment.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
