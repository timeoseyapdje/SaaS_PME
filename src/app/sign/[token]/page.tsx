"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { Loader2, CheckCircle, XCircle, FileText } from "lucide-react";

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SignQuote {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  validUntil: string;
  currency: string;
  subtotal: number;
  tvaAmount: number;
  total: number;
  applyTVA: boolean;
  notes?: string | null;
  signedAt?: string | null;
  client?: { name: string; email?: string | null; phone?: string | null } | null;
  company?: { name: string; email?: string | null; phone?: string | null; city?: string | null } | null;
  items: QuoteItem[];
}

type ActionState = "idle" | "loading" | "accepted" | "rejected" | "error";

export default function SignQuotePage() {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<SignQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch(`/api/sign/${token}`)
      .then((r) => {
        if (!r.ok) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setQuote(data);
          if (data.status === "ACCEPTED") setActionState("accepted");
          else if (data.status === "REJECTED") setActionState("rejected");
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [token]);

  async function handleAction(action: "accept" | "reject") {
    setActionState("loading");
    try {
      const res = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Une erreur est survenue");
        setActionState("error");
        return;
      }
      if (data.action === "accepted") setActionState("accepted");
      else if (data.action === "rejected") setActionState("rejected");
    } catch {
      setErrorMessage("Impossible de traiter votre demande. Veuillez réessayer.");
      setActionState("error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (notFound || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <FileText className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-800">Lien invalide ou expiré</h1>
        <p className="text-gray-500 text-center max-w-sm">
          Ce lien de signature n&apos;existe pas ou a déjà été utilisé. Veuillez contacter l&apos;émetteur du devis.
        </p>
      </div>
    );
  }

  if (actionState === "accepted") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Devis accepté</h1>
          <p className="text-gray-500 max-w-sm">
            Vous avez accepté le devis <strong>{quote.number}</strong>. L&apos;émetteur a été notifié.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4 text-center">
          <p className="text-sm text-gray-500">Montant total</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(quote.total, quote.currency)}</p>
        </div>
      </div>
    );
  }

  if (actionState === "rejected") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Devis refusé</h1>
          <p className="text-gray-500 max-w-sm">
            Vous avez refusé le devis <strong>{quote.number}</strong>. L&apos;émetteur a été notifié.
          </p>
        </div>
      </div>
    );
  }

  const alreadyHandled = !["DRAFT", "SENT"].includes(quote.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{quote.company?.name || "Nkap Control"}</p>
              {quote.company?.city && (
                <p className="text-xs text-gray-400">{quote.company.city}</p>
              )}
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
            Devis
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Quote header card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
            <h1 className="text-xl font-bold text-white mb-0.5">{quote.number}</h1>
            <p className="text-emerald-100 text-sm">
              Émis le {new Date(quote.issueDate).toLocaleDateString("fr-FR")} &mdash; Valide jusqu&apos;au {new Date(quote.validUntil).toLocaleDateString("fr-FR")}
            </p>
          </div>

          <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Adressé à</p>
              <p className="font-semibold text-gray-800">{quote.client?.name || "—"}</p>
              {quote.client?.email && <p className="text-sm text-gray-500">{quote.client.email}</p>}
              {quote.client?.phone && <p className="text-sm text-gray-500">{quote.client.phone}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Émis par</p>
              <p className="font-semibold text-gray-800">{quote.company?.name || "—"}</p>
              {quote.company?.email && <p className="text-sm text-gray-500">{quote.company.email}</p>}
              {quote.company?.phone && <p className="text-sm text-gray-500">{quote.company.phone}</p>}
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Détail du devis</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Description</th>
                  <th className="px-3 py-3 text-right font-medium text-gray-500 w-16">Qté</th>
                  <th className="px-3 py-3 text-right font-medium text-gray-500 w-28">Prix unit.</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500 w-28">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quote.items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3 text-gray-700">{item.description}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{formatCurrency(item.unitPrice, quote.currency)}</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-800">{formatCurrency(item.total, quote.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col items-end gap-2 max-w-xs ml-auto">
              <div className="flex justify-between w-full text-sm text-gray-500">
                <span>Sous-total HT</span>
                <span className="font-medium text-gray-700">{formatCurrency(quote.subtotal, quote.currency)}</span>
              </div>
              {quote.applyTVA && (
                <div className="flex justify-between w-full text-sm text-gray-500">
                  <span>TVA (19,25%)</span>
                  <span className="font-medium text-gray-700">{formatCurrency(quote.tvaAmount, quote.currency)}</span>
                </div>
              )}
              <div className="flex justify-between w-full border-t border-gray-200 pt-2">
                <span className="font-bold text-gray-800">Total TTC</span>
                <span className="font-bold text-xl text-emerald-600">{formatCurrency(quote.total, quote.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4">
            <h2 className="font-semibold text-gray-800 mb-2">Notes</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        {/* Already handled */}
        {alreadyHandled && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 text-center">
            <p className="text-amber-700 font-semibold">Ce devis a déjà été traité.</p>
            <p className="text-amber-600 text-sm mt-1">Vous ne pouvez plus modifier la décision.</p>
          </div>
        )}

        {/* Error */}
        {actionState === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-center">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Action buttons */}
        {!alreadyHandled && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6">
            <p className="text-sm text-gray-500 text-center mb-4">
              En acceptant ce devis, vous confirmez votre accord sur l&apos;ensemble des prestations et montants indiqués ci-dessus.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleAction("reject")}
                disabled={actionState === "loading"}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionState === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                Refuser le devis
              </button>
              <button
                onClick={() => handleAction("accept")}
                disabled={actionState === "loading"}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
              >
                {actionState === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Accepter le devis
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-4">
          <p>Document généré par <strong className="text-gray-500">Nkap Control</strong> &mdash; Gestion financière PME Cameroun</p>
        </div>
      </div>
    </div>
  );
}
