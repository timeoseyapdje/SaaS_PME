"use client";

import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  containerClassName?: string;
}

const sizeMap = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-16 h-16",
};

export function AppLogo({ size = "md", className, containerClassName }: AppLogoProps) {
  return (
    <div
      className={cn(
        sizeMap[size],
        "rounded-2xl overflow-hidden p-1.5 flex-shrink-0",
        // Light mode: white bg / Dark mode: dark bg — matches system theme
        "bg-white dark:bg-zinc-900",
        "shadow-xl shadow-emerald-500/20 border border-border/50",
        containerClassName
      )}
    >
      <img
        src="/logo.jpeg"
        alt="Nkap Control"
        className={cn("w-full h-full object-contain", className)}
      />
    </div>
  );
}
