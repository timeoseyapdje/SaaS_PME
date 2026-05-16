import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nkap Control",
    short_name: "Nkap",
    description: "Gestion financière et commerciale pour PME camerounaises",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#10b981",
    lang: "fr",
    categories: ["business", "finance", "productivity"],
    icons: [
      { src: "/logo.jpeg", sizes: "192x192", type: "image/jpeg", purpose: "any" },
      { src: "/logo.jpeg", sizes: "512x512", type: "image/jpeg", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Tableau de bord", short_name: "Dashboard", url: "/dashboard", description: "KPIs en temps réel" },
      { name: "Nouvelle facture", short_name: "Facture", url: "/invoices/new", description: "Créer une facture" },
      { name: "Nouveau lien de paiement", short_name: "Paiement", url: "/payment-links/new", description: "Générer un lien de paiement" },
    ],
  };
}
