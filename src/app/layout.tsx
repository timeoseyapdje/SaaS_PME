import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://nkapcontrol.com"),
  title: "Nkap Control - Gestion Financiere pour PME Camerounaises",
  description: "Solution complete de gestion financiere adaptee au contexte camerounais",
  openGraph: {
    title: "Nkap Control - Gestion Financiere pour PME Camerounaises",
    description: "Solution complete de gestion financiere adaptee au contexte camerounais",
    images: [{ url: "https://nkapcontrol.com/og-image.png", width: 1200, height: 630, alt: "Nkap Control" }],
    type: "website",
    locale: "fr_FR",
    siteName: "Nkap Control",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nkap Control - Gestion Financiere pour PME Camerounaises",
    description: "Solution complete de gestion financiere adaptee au contexte camerounais",
    images: ["https://nkapcontrol.com/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
