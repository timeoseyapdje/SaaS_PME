"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const setup = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const { SplashScreen } = await import("@capacitor/splash-screen");

        // Set status bar style based on theme
        await StatusBar.setStyle({
          style: resolvedTheme === "dark" ? Style.Dark : Style.Light,
        });
        await StatusBar.setBackgroundColor({
          color: resolvedTheme === "dark" ? "#09090b" : "#ffffff",
        });

        // Hide native splash screen (our custom one is showing)
        await SplashScreen.hide();
      } catch {
        // Not in native context or plugin unavailable
      }
    };

    setup();
  }, [resolvedTheme]);

  // Handle Android back button
  useEffect(() => {
    const setupBackButton = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { App } = await import("@capacitor/app");
        App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      } catch {
        // Not in native context
      }
    };

    setupBackButton();
  }, []);

  return <>{children}</>;
}
