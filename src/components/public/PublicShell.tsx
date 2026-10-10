import Link from "next/link";
import { Button } from "@/components/ui/button";

export const ADSENSE_CLIENT = "ca-pub-2952261428752027";

export function AdSenseScript() {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/guides", label: "Guides" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-white overflow-hidden p-0.5 shadow">
            <img src="/logo.jpeg" alt="Nkap Control" className="w-full h-full object-contain" />
          </span>
          <span className="font-bold tracking-tight text-foreground">Nkap Control</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">
            Se connecter
          </Link>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/register">Essai gratuit</Link>
          </Button>
        </div>
      </div>
      <nav className="md:hidden flex items-center gap-5 overflow-x-auto px-4 pb-2 text-sm text-muted-foreground">
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-foreground">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-semibold text-foreground mb-2">Nkap Control</p>
          <p className="text-muted-foreground leading-relaxed">
            Logiciel de facturation et de gestion financière conçu pour les PME camerounaises.
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground mb-2">Ressources</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li><Link href="/guides" className="hover:text-foreground">Guides de gestion</Link></li>
            <li><Link href="/onboarding" className="hover:text-foreground">Tutoriel</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-foreground mb-2">Entreprise</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li><Link href="/a-propos" className="hover:text-foreground">À propos</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-foreground mb-2">Légal</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li><Link href="/terms" className="hover:text-foreground">Conditions générales</Link></li>
            <li><Link href="/privacy" className="hover:text-foreground">Confidentialité</Link></li>
          </ul>
        </div>
      </div>
      <p className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Nkap Control. Tous droits réservés.
      </p>
    </footer>
  );
}

export function PublicShell({ children, ads = false }: { children: React.ReactNode; ads?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {ads && <AdSenseScript />}
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
