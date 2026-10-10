import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { PublicShell } from "@/components/public/PublicShell";
import { Button } from "@/components/ui/button";
import { getPublishedGuides, getGuide, formatGuideDate, type GuideBlock } from "@/content/guides";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return getPublishedGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | Nkap Control`,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { title: guide.title, description: guide.description, type: "article" },
  };
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "p":
      return <p>{block.text}</p>;
    case "h2":
      return <h2 className="text-xl font-semibold text-foreground pt-4">{block.text}</h2>;
    case "h3":
      return <h3 className="text-base font-semibold text-foreground pt-2">{block.text}</h3>;
    case "ul":
      return (
        <ul className="list-disc pl-5 space-y-1.5">
          {block.items.map((i) => <li key={i}>{i}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal pl-5 space-y-1.5">
          {block.items.map((i) => <li key={i}>{i}</li>)}
        </ol>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-foreground">
              <tr>{block.head.map((h, i) => <th key={i} className="text-left font-medium px-3 py-2">{h}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  {r.map((c, j) => <td key={j} className="px-3 py-2 whitespace-nowrap">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout":
      return (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 flex gap-3">
          <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">{block.title}</p>
            <p>{block.text}</p>
          </div>
        </div>
      );
  }
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();

  const related = getPublishedGuides().filter((g) => g.slug !== guide.slug).reverse().slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    inLanguage: "fr",
    author: { "@type": "Organization", name: "Nkap Control" },
    publisher: { "@type": "Organization", name: "Nkap Control" },
  };

  return (
    <PublicShell ads>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/guides" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Tous les guides
        </Link>
        <article>
          <p className="text-sm font-medium text-emerald-500 mb-2">{guide.category}</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">{guide.title}</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Par l&apos;équipe Nkap Control · Mis à jour le {formatGuideDate(guide.updatedAt)} · {guide.readingMinutes} min de lecture
          </p>
          <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            {guide.body.map((b, i) => <Block key={i} block={b} />)}
          </div>
        </article>

        <aside className="mt-12 rounded-xl border border-border bg-card p-6">
          <p className="font-semibold mb-1">Appliquez ces conseils dans Nkap Control</p>
          <p className="text-sm text-muted-foreground mb-4">
            Factures conformes, TVA calculée automatiquement, suivi Mobile Money et trésorerie en temps réel.
          </p>
          <Button asChild size="sm"><Link href="/register">Créer un compte gratuit</Link></Button>
        </aside>

        <section className="mt-12">
          <h2 className="font-semibold mb-4">À lire aussi</h2>
          <ul className="space-y-3">
            {related.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="text-emerald-500 hover:underline">{g.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PublicShell>
  );
}
