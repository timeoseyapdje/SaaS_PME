"use client";

import { useState } from "react";
import { LifeBuoy, MessageSquare, Bug, Star, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type FeedbackType = "SUPPORT" | "FEEDBACK" | "BUG";

const TYPES: { value: FeedbackType; label: string; icon: typeof LifeBuoy; placeholder: string }[] = [
  { value: "SUPPORT", label: "Contacter le support", icon: LifeBuoy, placeholder: "Décrivez votre problème ou votre question..." },
  { value: "FEEDBACK", label: "Donner mon avis", icon: MessageSquare, placeholder: "Qu'aimez-vous ? Que pourrions-nous améliorer ?" },
  { value: "BUG", label: "Signaler un bug", icon: Bug, placeholder: "Qu'avez-vous fait, qu'attendiez-vous, que s'est-il passé ?" },
];

export function ContactSupportForm() {
  const [type, setType] = useState<FeedbackType>("SUPPORT");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const current = TYPES.find((t) => t.value === type)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject,
          message,
          rating: type === "FEEDBACK" && rating > 0 ? rating : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResult({ ok: true, text: "Message envoyé ! L'équipe Nkap Control vous répondra par email." });
        setSubject("");
        setMessage("");
        setRating(0);
      } else {
        setResult({ ok: false, text: data.error || "Erreur lors de l'envoi" });
      }
    } catch {
      setResult({ ok: false, text: "Une erreur est survenue" });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              type === value
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : "bg-muted text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {type === "FEEDBACK" && (
        <div className="flex items-center gap-1" aria-label="Note">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} sur 5`}>
              <Star className={`w-5 h-5 ${n <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"}`} />
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        required
        minLength={3}
        maxLength={150}
        placeholder="Sujet"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
      />
      <textarea
        required
        minLength={10}
        maxLength={5000}
        rows={4}
        placeholder={current.placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 resize-y"
      />

      {result && (
        <div className={`flex items-center gap-2 text-sm ${result.ok ? "text-emerald-600" : "text-rose-500"}`}>
          {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {result.text}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Envoyer
      </button>
    </form>
  );
}
