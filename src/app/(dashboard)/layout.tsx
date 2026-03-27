import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-zinc-50/50 dark:bg-zinc-950">
        <Sidebar />
        <div className="flex-1 ml-64 overflow-auto flex flex-col">{children}</div>
      </div>
      <Toaster />
    </SessionProvider>
  );
}
