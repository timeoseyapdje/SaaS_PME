import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Smartphone, Landmark, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "À propos | Nkap Control",
  description:
    "Nkap Control est un logiciel de facturation et de gestion financière conçu à Douala pour les PME camerounaises : TVA 19,25 %, SYSCOHADA, MTN MoMo et Orange Money.",
  alternates: { canonical: "/a-propos" },
};

const pillars = [
  { icon: FileText, title: "Facturation conforme", text: "Factures et devis avec NIU, RCCM, numérotation continue et TVA à 19,25 % calculée automatiquement." },
  { icon: Smartphone, title: "Mobile Money natif", text: "Encaissement par MTN Mobile Money et Orange Money via des liens de paiement rattachés à chaque facture." },
  { icon: Landmark, title: "Trésorerie consolidée", text: "Banques, caisse et portefeuilles Mobile Money suivis au même endroit, avec rapports exportables." },
  { icon: ShieldCheck, title: "Données isolées", text: "Chaque entreprise dispose d'un espace cloisonné, avec des droits d'accès définis par poste." },
];

export default function AboutPage() {
  return (
    <PublicShell>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">À propos de Nkap Control</h1>
        <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
          <p>
            « Nkap » signifie « argent » dans plusieurs langues de l&apos;Ouest du Cameroun. Nkap Control est né d&apos;un constat
            simple, fait à Douala : la majorité des PME camerounaises gèrent encore leurs factures sur Word ou Excel,
            leurs encaissements Mobile Money sur un téléphone personnel, et découvrent leur situation financière réelle
            seulement au moment de la clôture, avec le comptable.
          </p>
          <p>
            Les logiciels de gestion internationaux ne connaissent ni le NIU, ni la TVA à 19,25 %, ni le SYSCOHADA, ni
            MTN Mobile Money et Orange Money. Nous avons donc conçu un outil pensé dès le départ pour le contexte
            camerounais : des factures conformes en quelques clics, des paiements Mobile Money rattachés à chaque
            facture, et une vision claire de la trésorerie au jour le jour.
          </p>
          <p>
            Au-delà du logiciel, nous publions gratuitement des{" "}
            <Link href="/guides" className="text-emerald-500 hover:underline">guides de gestion</Link> sur la facturation,
            la fiscalité, la trésorerie et la comptabilité, pour aider les entrepreneurs à mieux piloter leur activité,
            qu&apos;ils utilisent Nkap Control ou non.
          </p>
        </div>

        <h2 className="text-xl font-semibold mt-12 mb-5">Ce que fait Nkap Control</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-5">
              <p.icon className="w-5 h-5 text-emerald-500 mb-3" />
              <p className="font-semibold mb-1">{p.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mt-12 mb-3">Qui sommes-nous ?</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Nkap Control est développé et exploité depuis Douala, au Cameroun. Le produit évolue en continu à partir des
          retours de ses utilisateurs : gérants de commerces, prestataires de services, cabinets et associations. Pour
          toute question, consultez notre <Link href="/contact" className="text-emerald-500 hover:underline">page contact</Link>.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild><Link href="/register">Essayer gratuitement</Link></Button>
          <Button asChild variant="outline"><Link href="/guides">Lire les guides</Link></Button>
        </div>
      </main>
    </PublicShell>
  );
}
