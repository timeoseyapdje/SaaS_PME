import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { PublicShell } from "@/components/public/PublicShell";
import { getPublishedGuides, formatGuideDate } from "@/content/guides";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Guides de gestion pour PME au Cameroun | Nkap Control",
  description:
    "Facturation, TVA, trésorerie, Mobile Money, SYSCOHADA, stock : des guides pratiques et gratuits pour gérer votre PME au Cameroun.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <PublicShell ads>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <header className="max-w-2xl mb-10">
          <p className="text-sm font-medium text-emerald-500 mb-2">Ressources gratuites</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Guides de gestion pour PME</h1>
          <p className="text-muted-foreground leading-relaxed">
            Des explications concrètes, avec exemples chiffrés en FCFA, pour facturer correctement, maîtriser la TVA,
            piloter votre trésorerie et préparer votre comptabilité SYSCOHADA.
          </p>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {getPublishedGuides().reverse().map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group rounded-xl border border-border bg-card p-5 hover:border-emerald-500/50 transition-colors flex flex-col"
            >
              <span className="text-xs font-medium text-emerald-500 mb-2">{g.category}</span>
              <h2 className="font-semibold leading-snug mb-2 group-hover:text-emerald-500 transition-colors">{g.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{g.description}</p>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {g.readingMinutes} min · {formatGuideDate(g.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </PublicShell>
  );
}
