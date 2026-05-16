"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [phase, setPhase] = useState<"logo" | "expand" | "fade">("logo");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only once per session
    if (sessionStorage.getItem("splash_shown")) return;
    sessionStorage.setItem("splash_shown", "1");
    setVisible(true);

    const t1 = setTimeout(() => setPhase("expand"), 700);
    const t2 = setTimeout(() => setPhase("fade"), 1500);
    const t3 = setTimeout(() => setVisible(false), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "fade" ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
        >
          <div className="flex items-center">
            {/* Logo */}
            <motion.div
              animate={
                phase === "logo"
                  ? { x: 0, scale: 1.1 }
                  : { x: 0, scale: 1 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-16 h-16 rounded-2xl bg-white overflow-hidden p-1.5 shadow-2xl shadow-emerald-500/30 flex-shrink-0"
            >
              <img
                src="/logo.jpeg"
                alt="Nkap Control"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Text — slides in from left after logo */}
            <motion.div
              initial={{ opacity: 0, x: -16, width: 0 }}
              animate={
                phase !== "logo"
                  ? { opacity: 1, x: 0, width: "auto" }
                  : { opacity: 0, x: -16, width: 0 }
              }
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="overflow-hidden ml-4"
            >
              <p className="text-2xl font-extrabold text-foreground whitespace-nowrap leading-tight">
                Nkap Control
              </p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                Gestion financière PME
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
