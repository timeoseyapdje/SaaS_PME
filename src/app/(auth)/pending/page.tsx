"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, XCircle, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PendingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | null>(null);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/me/admission-status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          setCompanyName(data.companyName || "");

          if (data.status === "APPROVED") {
            setTimeout(() => router.push("/dashboard"), 2000);
          }
        }
      } catch {}
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const icon =
    status === "APPROVED" ? (
      <CheckCircle2 className="w-10 h-10 text-white" />
    ) : status === "REJECTED" ? (
      <XCircle className="w-10 h-10 text-white" />
    ) : (
      <Clock className="w-10 h-10 text-white" />
    );

  const bgColor =
    status === "APPROVED"
      ? "bg-emerald-500 shadow-emerald-500/30"
      : status === "REJECTED"
      ? "bg-rose-500 shadow-rose-500/30"
      : "bg-amber-500 shadow-amber-500/30";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-dot-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>
      <div className="w-full max-w-md text-center relative z-10">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-xl ${bgColor}`}>
          {icon}
        </div>

        {status === "APPROVED" && (
          <>
            <h2 className="text-3xl font-bold text-foreground mb-3">Demande approuvée !</h2>
            <p className="text-muted-foreground text-lg">
              Bienvenue chez {companyName}. Redirection en cours...
            </p>
          </>
        )}

        {status === "REJECTED" && (
          <>
            <h2 className="text-3xl font-bold text-foreground mb-3">Demande refusée</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Votre demande d&apos;adhésion à {companyName} a été refusée.
            </p>
            <Button onClick={() => signOut({ callbackUrl: "/register" })} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Réessayer avec une autre entreprise
            </Button>
          </>
        )}

        {(!status || status === "PENDING") && (
          <>
            <h2 className="text-3xl font-bold text-foreground mb-3">En attente d&apos;approbation</h2>
            <p className="text-muted-foreground text-lg mb-2">
              Votre demande d&apos;adhésion{companyName ? ` à ${companyName}` : ""} est en cours de traitement.
            </p>
            <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Vérification automatique toutes les 30 secondes
            </p>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
