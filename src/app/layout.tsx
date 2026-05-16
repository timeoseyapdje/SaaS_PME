import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CapacitorProvider } from "@/components/providers/CapacitorProvider";
import { PWARegister } from "@/components/PWARegister";
import { SplashScreen } from "@/components/SplashScreen";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nkapcontrol.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Nkap Control — Logiciel de gestion financière pour PME camerounaises",
    template: "%s | Nkap Control",
  },
  description:
    "Nkap Control est le logiciel de gestion financière conçu pour les PME au Cameroun. Factures, trésorerie, Mobile Money MTN & Orange, commandes, stocks — tout en un.",
  keywords: [
    "nkap control",
    "gestion financière cameroun",
    "logiciel comptabilité PME cameroun",
    "facturation cameroun",
    "mobile money cameroun",
    "MTN money gestion",
    "orange money gestion",
    "trésorerie PME cameroun",
    "logiciel gestion Douala Yaoundé",
    "nkap",
  ],
  authors: [{ name: "Nkap Control", url: APP_URL }],
  creator: "Nkap Control",
  publisher: "Nkap Control",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nkap Control",
    startupImage: "/icons/icon-512x512.png",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: APP_URL,
    siteName: "Nkap Control",
    title: "Nkap Control — Gestion financière pour PME camerounaises",
    description:
      "Gérez vos factures, trésorerie, stocks et paiements Mobile Money depuis une seule plateforme. Solution 100% adaptée au contexte camerounais.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Nkap Control" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nkap Control — Gestion financière PME Cameroun",
    description: "Factures, trésorerie, MTN Money, Orange Money — tout en un pour les PME camerounaises.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: APP_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PWARegister />
          <SplashScreen />
          <CapacitorProvider>
            {children}
          </CapacitorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
