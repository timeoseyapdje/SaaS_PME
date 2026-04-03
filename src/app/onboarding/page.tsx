"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950">
      {/* Skip bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/90 backdrop-blur-lg border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Bienvenue sur Nkap Control !</p>
              <p className="text-xs text-zinc-400">Suivez le guide ou passez directement à la connexion</p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/50"
          >
            <X className="w-4 h-4" />
            Passer le guide
          </Link>
        </div>
      </div>

      {/* Guide iframe */}
      <iframe
        src="/guide.html"
        className="w-full min-h-screen border-0 pt-14"
        style={{ height: "calc(100vh)" }}
        title="Guide de démarrage Nkap Control"
      />

      {/* Bottom CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Vous avez terminé le guide ? Connectez-vous pour commencer.
          </p>
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
          >
            Se connecter
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
