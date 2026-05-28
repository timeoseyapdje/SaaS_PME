"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "nkap-sidebar-config";

const DEFAULT_ORDER = [
  "Dashboard",
  "Produits & Services",
  "Ventes",
  "Facturation",
  "Finances",
  "Rapports",
  "Contacts",
  "Équipe",
  "Abonnement",
  "Paramètres",
];

const PINNED_SECTIONS = ["Dashboard", "Paramètres"];

export interface SidebarConfig {
  hiddenSections: string[];
  order: string[];
}

function loadConfig(): SidebarConfig {
  if (typeof window === "undefined") {
    return { hiddenSections: [], order: DEFAULT_ORDER };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SidebarConfig;
      const merged = DEFAULT_ORDER.filter((s) => !parsed.order.includes(s));
      return {
        hiddenSections: parsed.hiddenSections ?? [],
        order: [...parsed.order, ...merged],
      };
    }
  } catch {}
  return { hiddenSections: [], order: DEFAULT_ORDER };
}

function saveConfig(config: SidebarConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export function useSidebarConfig() {
  const [config, setConfig] = useState<SidebarConfig>(loadConfig);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const update = useCallback((next: SidebarConfig) => {
    setConfig(next);
    saveConfig(next);
    window.dispatchEvent(new Event("sidebar-config-changed"));
  }, []);

  const toggleSection = useCallback(
    (name: string) => {
      if (PINNED_SECTIONS.includes(name)) return;
      const hidden = config.hiddenSections.includes(name)
        ? config.hiddenSections.filter((s) => s !== name)
        : [...config.hiddenSections, name];
      update({ ...config, hiddenSections: hidden });
    },
    [config, update]
  );

  const reorder = useCallback(
    (newOrder: string[]) => {
      update({ ...config, order: newOrder });
    },
    [config, update]
  );

  const reset = useCallback(() => {
    update({ hiddenSections: [], order: DEFAULT_ORDER });
  }, [update]);

  useEffect(() => {
    const handler = () => setConfig(loadConfig());
    window.addEventListener("sidebar-config-changed", handler);
    return () => window.removeEventListener("sidebar-config-changed", handler);
  }, []);

  return {
    config,
    toggleSection,
    reorder,
    reset,
    isPinned: (name: string) => PINNED_SECTIONS.includes(name),
    isHidden: (name: string) => config.hiddenSections.includes(name),
    DEFAULT_ORDER,
  };
}
