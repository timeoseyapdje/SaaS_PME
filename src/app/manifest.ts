import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "com.nkapcontrol.app",
    name: "Nkap Control",
    short_name: "Nkap",
    description: "Gestion financière et commerciale pour PME camerounaises — Factures, trésorerie, MTN Money, Orange Money",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#10b981",
    lang: "fr",
    dir: "ltr",
    categories: ["business", "finance", "productivity"],
    icons: [
      { src: "/icons/icon-48x48.png",   sizes: "48x48",   type: "image/png" },
      { src: "/icons/icon-72x72.png",   sizes: "72x72",   type: "image/png" },
      { src: "/icons/icon-96x96.png",   sizes: "96x96",   type: "image/png" },
      { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192x192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512x512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Tableau de bord",
        short_name: "Dashboard",
        url: "/dashboard",
        description: "KPIs en temps réel",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "Nouvelle facture",
        short_name: "Facture",
        url: "/invoices/new",
        description: "Créer une facture",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "Lien de paiement",
        short_name: "Paiement",
        url: "/payment-links/new",
        description: "Générer un lien de paiement Mobile Money",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
    ],
  };
}
