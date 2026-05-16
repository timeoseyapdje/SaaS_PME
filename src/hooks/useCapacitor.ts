"use client";

import { useEffect, useState } from "react";

export function useCapacitor() {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<"web" | "android" | "ios">("web");

  useEffect(() => {
    // Capacitor is available only in native builds
    const checkNative = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          setIsNative(true);
          setPlatform(Capacitor.getPlatform() as "android" | "ios");
        }
      } catch {
        // Not in native context
      }
    };
    checkNative();
  }, []);

  return { isNative, platform };
}
