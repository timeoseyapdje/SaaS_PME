import { SearchX, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto">
          <SearchX className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-5xl font-bold text-foreground mb-2">404</p>
          <h1 className="text-xl font-semibold text-foreground mb-2">Page introuvable</h1>
          <p className="text-sm text-muted-foreground">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
