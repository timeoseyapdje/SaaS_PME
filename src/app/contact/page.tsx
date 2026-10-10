import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Clock, LifeBuoy } from "lucide-react";
import { PublicShell } from "@/components/public/PublicShell";

export const metadata: Metadata = {
  title: "Contact | Nkap Control",
  description: "Contactez l'équipe Nkap Control à Douala : questions commerciales, support technique, partenariats.",
  alternates: { canonical: "/contact" },
};

const items = [
  { icon: Mail, title: "Email", content: <a href="mailto:contact@nkapcontrol.com" className="text-emerald-500 hover:underline">contact@nkapcontrol.com</a> },
  { icon: MapPin, title: "Adresse", content: "Douala, Cameroun" },
  { icon: Clock, title: "Délai de réponse", content: "Sous 24 à 48 heures ouvrées (lundi au vendredi)" },
  { icon: LifeBuoy, title: "Clients connectés", content: "Utilisez le formulaire du Centre d'aide, accessible depuis votre espace, pour un suivi plus rapide." },
];

export default function ContactPage() {
  return (
    <PublicShell>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Nous contacter</h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground mb-10">
          Une question sur l&apos;offre, besoin d&apos;aide pour démarrer, une suggestion ou une proposition de partenariat ?
          Écrivez-nous : chaque message est lu par l&apos;équipe.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <div key={i.title} className="rounded-xl border border-border bg-card p-5">
              <i.icon className="w-5 h-5 text-emerald-500 mb-3" />
              <p className="font-semibold mb-1">{i.title}</p>
              <div className="text-sm text-muted-foreground leading-relaxed">{i.content}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-10">
          Avant d&apos;écrire, vous trouverez peut-être votre réponse dans nos{" "}
          <Link href="/guides" className="text-emerald-500 hover:underline">guides de gestion</Link>.
        </p>
      </main>
    </PublicShell>
  );
}
